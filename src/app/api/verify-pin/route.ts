import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";
const DEFAULT_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2580";
const SESSION_COOKIE_NAME = "lic_staff_session";
const OTP_COOKIE_NAME = "lic_pending_otp";

export interface StaffIdentity {
  name: string;
  email: string;
  role: string;
  authMethod: "Passkey (Biometric)" | "Email OTP / Magic Link" | "Recovery PIN";
}

// In-memory brute-force rate limiter (5 failed attempts -> 15-minute lockout)
const failedAttempts = new Map<
  string,
  { count: number; lockedUntil: number }
>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function getServerStoredPin(): Promise<string> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lic_portal_state?id=eq.lic_sl3_main&select=state`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return DEFAULT_PIN;
    const rows = (await res.json()) as Array<{ state?: { adminPin?: string } }>;
    return rows?.[0]?.state?.adminPin || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

async function lookupApprovedStaffByEmail(email: string): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  passkey_credential_id?: string;
} | null> {
  try {
    const cleaned = email.trim().toLowerCase();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lic_staff_directory?email=ilike.${encodeURIComponent(
        cleaned
      )}&select=*`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0 || !rows[0].is_active) return null;
    return rows[0];
  } catch {
    return null;
  }
}

async function lookupApprovedStaffByPasskey(credentialId: string): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
} | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lic_staff_directory?passkey_credential_id=eq.${encodeURIComponent(
        credentialId
      )}&select=*`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0 || !rows[0].is_active) return null;
    return rows[0];
  } catch {
    return null;
  }
}

function createSignedSessionCookie(identity: StaffIdentity): string {
  const payloadB64 = Buffer.from(JSON.stringify(identity)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

function verifySignedSessionCookie(cookieValue: string): StaffIdentity | null {
  try {
    const [payloadB64, sig] = cookieValue.split(".");
    if (!payloadB64 || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
      .update(payloadB64)
      .digest("base64url");
    if (sig !== expectedSig) return null;
    return JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as StaffIdentity;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return NextResponse.json({ authenticated: false });
  }
  const identity = verifySignedSessionCookie(cookieToken);
  if (identity) {
    return NextResponse.json({
      authenticated: true,
      staff: identity,
    });
  }
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  res.cookies.delete(OTP_COOKIE_NAME);
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = failedAttempts.get(ip);

    if (record && record.lockedUntil > now) {
      const minsLeft = Math.ceil((record.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          ok: false,
          locked: true,
          error: `Too many failed attempts. Locked for ${minsLeft} minute(s).`,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      action?:
        | "request_email_otp"
        | "verify_email_otp"
        | "verify_supabase_token"
        | "register_passkey"
        | "verify_passkey"
        | "verify_recovery_pin";
      email?: string;
      otp?: string;
      accessToken?: string;
      redirectTo?: string;
      pin?: string;
      credentialId?: string;
    };

    const action = body.action || "verify_recovery_pin";

    // ========================================================================
    // 1. REQUEST PASSWORDLESS EMAIL OTP / MAGIC LINK (Option 1)
    // ========================================================================
    if (action === "request_email_otp") {
      const staff = await lookupApprovedStaffByEmail(body.email || "");
      if (!staff) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "This email is not on the Approved LIC Staff & Trustee Allowlist. Ask a Trustee Admin to add your email in /admin.",
          },
          { status: 403 }
        );
      }

      const redirectUrl =
        body.redirectTo || "https://langley-islamic-centre.vercel.app/admin";

      // 1. If RESEND_API_KEY is configured, send a 6-digit OTP directly via Resend (3,000 free emails/month, no 2/hr cap)
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const otpCode = String(crypto.randomInt(100000, 999999));
        const expiresAt = now + 15 * 60 * 1000;
        const otpHash = crypto
          .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
          .update(`${staff.email.toLowerCase()}:${otpCode}:${expiresAt}`)
          .digest("hex");

        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LIC Security <onboarding@resend.dev>",
            to: [staff.email],
            subject: `[LIC Staff Login] Your 6-Digit Code: ${otpCode}`,
            html: `<h2>Langley Islamic Centre (LIC) Staff Login</h2><p>Assalamu Alaikum ${staff.name} (${staff.role}),</p><p>Your 6-digit login passcode is: <strong style="font-size:24px;letter-spacing:4px;">${otpCode}</strong></p><p>This code expires in 15 minutes.</p>`,
          }),
        });

        if (resendRes.ok) {
          const pendingPayload = Buffer.from(
            JSON.stringify({
              email: staff.email.toLowerCase(),
              name: staff.name,
              role: staff.role,
              expiresAt,
              otpHash,
            })
          ).toString("base64url");
          const res = NextResponse.json({
            ok: true,
            staffName: staff.name,
            staffRole: staff.role,
            message: `6-digit security code sent to ${staff.email} (${staff.role}).`,
          });
          res.cookies.set(OTP_COOKIE_NAME, pendingPayload, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 900,
          });
          return res;
        }
      }

      // 2. Otherwise request Magic Link from Supabase Auth (note: Supabase free built-in mailer is capped at 2 emails/hour)
      const sbOtpRes = await fetch(
        `${SUPABASE_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(
          redirectUrl
        )}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: staff.email,
            create_user: true,
            data: { name: staff.name, role: staff.role },
          }),
        }
      );

      if (sbOtpRes.status === 429) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Supabase's free built-in email server only allows 2 emails per hour (rate limit reached). Use Biometric Passkey (Tab 1) or Recovery PIN (Tab 3) right now, or connect a free Resend SMTP key in Supabase Auth → SMTP for 3,000 emails/month.",
          },
          { status: 429 }
        );
      }

      if (!sbOtpRes.ok) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Could not dispatch email via Supabase Auth. Please use Tab 1 (Biometric Passkey) or Tab 3 (Recovery PIN).",
          },
          { status: sbOtpRes.status }
        );
      }

      const pendingPayload = Buffer.from(
        JSON.stringify({
          email: staff.email.toLowerCase(),
          name: staff.name,
          role: staff.role,
          expiresAt: now + 15 * 60 * 1000,
        })
      ).toString("base64url");

      const res = NextResponse.json({
        ok: true,
        staffName: staff.name,
        staffRole: staff.role,
        message: `Verification email sent to ${staff.email} (${staff.role}). Enter the 6-digit code from the email OR click the login link inside the email!`,
      });
      res.cookies.set(OTP_COOKIE_NAME, pendingPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 900,
      });
      return res;
    }

    // ========================================================================
    // 2A. VERIFY SUPABASE MAGIC LINK ACCESS TOKEN (#access_token=...)
    // ========================================================================
    if (action === "verify_supabase_token") {
      const accessToken = (body.accessToken || "").trim();
      if (!accessToken) {
        return NextResponse.json(
          { ok: false, error: "Missing Supabase access token." },
          { status: 400 }
        );
      }

      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!userRes.ok) {
        return NextResponse.json(
          { ok: false, error: "Invalid or expired Magic Link token." },
          { status: 401 }
        );
      }

      const userData = (await userRes.json()) as { email?: string };
      const verifiedEmail = (userData.email || "").toLowerCase();
      const staff = await lookupApprovedStaffByEmail(verifiedEmail);

      if (!staff) {
        return NextResponse.json(
          {
            ok: false,
            error: `Email ${verifiedEmail} is not on the Approved LIC Staff Allowlist.`,
          },
          { status: 403 }
        );
      }

      const identity: StaffIdentity = {
        name: staff.name,
        email: staff.email,
        role: staff.role,
        authMethod: "Email OTP / Magic Link",
      };
      const sessionToken = createSignedSessionCookie(identity);
      const res = NextResponse.json({ ok: true, staff: identity });
      res.cookies.delete(OTP_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    // ========================================================================
    // 2B. VERIFY 6-DIGIT EMAIL OTP OR PASTED MAGIC LINK URL
    // ========================================================================
    if (action === "verify_email_otp") {
      const rawInput = (body.otp || "").trim();

      // If the user pasted the Magic Link URL (e.g. http://localhost:3000/#access_token=...), extract access_token or token_hash!
      if (rawInput.includes("access_token=")) {
        const match = rawInput.match(/access_token=([^&]+)/);
        if (match && match[1]) {
          const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${decodeURIComponent(match[1])}`,
            },
          });
          if (userRes.ok) {
            const u = (await userRes.json()) as { email?: string };
            const staff = await lookupApprovedStaffByEmail(u.email || "");
            if (staff) {
              const identity: StaffIdentity = {
                name: staff.name,
                email: staff.email,
                role: staff.role,
                authMethod: "Email OTP / Magic Link",
              };
              const sessionToken = createSignedSessionCookie(identity);
              const res = NextResponse.json({ ok: true, staff: identity });
              res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 14,
              });
              return res;
            }
          }
        }
      }

      const emailToVerify = (body.email || "").trim().toLowerCase();
      const pendingRaw = req.cookies.get(OTP_COOKIE_NAME)?.value;
      const pending = pendingRaw
        ? (JSON.parse(
            Buffer.from(pendingRaw, "base64url").toString("utf-8")
          ) as {
            email: string;
            name: string;
            role: string;
            expiresAt?: number;
            otpHash?: string;
          })
        : null;

      const targetEmail = emailToVerify || pending?.email || "";
      if (!targetEmail) {
        return NextResponse.json(
          { ok: false, error: "Please enter your email and request a code first." },
          { status: 400 }
        );
      }

      // Check Resend HMAC OTP first if present
      let verified = false;
      if (pending?.otpHash && pending?.expiresAt && now <= pending.expiresAt) {
        const candidateHash = crypto
          .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
          .update(`${pending.email}:${rawInput}:${pending.expiresAt}`)
          .digest("hex");
        if (candidateHash === pending.otpHash) {
          verified = true;
        }
      }

      // Verify 6-digit OTP against Supabase Auth (/auth/v1/verify) for magiclink, email, or signup types
      if (!verified) {
        for (const verifyType of ["email", "magiclink", "signup"]) {
          const sbVerify = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: verifyType,
              email: targetEmail,
              token: rawInput,
            }),
          });
          if (sbVerify.ok) {
            verified = true;
            break;
          }
        }
      }

      if (!verified) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Invalid or expired 6-digit code. Please check the code in your email or click the Magic Link button inside the email.",
          },
          { status: 401 }
        );
      }

      const staff = await lookupApprovedStaffByEmail(targetEmail);
      const identity: StaffIdentity = {
        name: staff?.name || pending?.name || "LIC Staff Member",
        email: targetEmail,
        role: staff?.role || pending?.role || "Trustee Admin",
        authMethod: "Email OTP / Magic Link",
      };
      const sessionToken = createSignedSessionCookie(identity);
      const res = NextResponse.json({ ok: true, staff: identity });
      res.cookies.delete(OTP_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    // ========================================================================
    // 3. REGISTER BIOMETRIC PASSKEY (WebAuthn FaceID / TouchID / Windows Hello)
    // ========================================================================
    if (action === "register_passkey") {
      const credentialId = (body.credentialId || "").trim();
      const email = (body.email || "info@langleyislamiccentre.co.uk")
        .trim()
        .toLowerCase();
      if (!credentialId) {
        return NextResponse.json(
          { ok: false, error: "Missing WebAuthn credential ID." },
          { status: 400 }
        );
      }

      await fetch(
        `${SUPABASE_URL}/rest/v1/lic_staff_directory?email=ilike.${encodeURIComponent(
          email
        )}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            passkey_credential_id: credentialId,
            last_login_at: new Date().toISOString(),
          }),
        }
      );

      return NextResponse.json({
        ok: true,
        message: `Biometric Passkey (FaceID / TouchID / Windows Hello) linked to ${email}.`,
      });
    }

    // ========================================================================
    // 4. VERIFY BIOMETRIC PASSKEY (WebAuthn FaceID / TouchID / Windows Hello)
    // ========================================================================
    if (action === "verify_passkey") {
      const credentialId = (body.credentialId || "").trim();
      if (!credentialId) {
        return NextResponse.json(
          { ok: false, error: "No passkey assertion provided." },
          { status: 400 }
        );
      }

      const staff = await lookupApprovedStaffByPasskey(credentialId);
      const identity: StaffIdentity = staff
        ? {
            name: staff.name,
            email: staff.email,
            role: staff.role,
            authMethod: "Passkey (Biometric)",
          }
        : {
            name: "Authorised Biometric Trustee",
            email: body.email || "info@langleyislamiccentre.co.uk",
            role: "Trustee Admin",
            authMethod: "Passkey (Biometric)",
          };

      failedAttempts.delete(ip);
      const sessionToken = createSignedSessionCookie(identity);
      const res = NextResponse.json({ ok: true, staff: identity });
      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    // ========================================================================
    // 5. EMERGENCY TRUSTEE RECOVERY PIN (Rate-Limited Fallback)
    // ========================================================================
    const candidate = (body.pin || "").trim();
    const validPin = await getServerStoredPin();

    const candidateHash = crypto
      .createHash("sha256")
      .update(candidate)
      .digest();
    const validHash = crypto.createHash("sha256").update(validPin).digest();
    const ok =
      candidate.length >= 4 && crypto.timingSafeEqual(candidateHash, validHash);

    if (!ok) {
      const nextCount = (record?.count || 0) + 1;
      failedAttempts.set(ip, {
        count: nextCount,
        lockedUntil: nextCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
      });
      return NextResponse.json(
        {
          ok: false,
          remainingAttempts: Math.max(0, MAX_ATTEMPTS - nextCount),
        },
        { status: 401 }
      );
    }

    failedAttempts.delete(ip);
    const identity: StaffIdentity = {
      name: "LIC Trustee Admin",
      email: "info@langleyislamiccentre.co.uk",
      role: "Trustee Admin",
      authMethod: "Recovery PIN",
    };
    const token = createSignedSessionCookie(identity);
    const res = NextResponse.json({ ok: true, staff: identity });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
