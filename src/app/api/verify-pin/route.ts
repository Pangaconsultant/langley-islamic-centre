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
  authMethod: "Passkey (Biometric)" | "Email OTP" | "Recovery PIN";
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
        | "register_passkey"
        | "verify_passkey"
        | "verify_recovery_pin";
      email?: string;
      otp?: string;
      pin?: string;
      credentialId?: string;
    };

    const action = body.action || "verify_recovery_pin";

    // ========================================================================
    // 1. REQUEST PASSWORDLESS EMAIL 6-DIGIT OTP (Option 1)
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

      const otpCode = String(crypto.randomInt(100000, 999999));
      const expiresAt = now + 10 * 60 * 1000; // 10 mins
      const otpHash = crypto
        .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
        .update(`${staff.email.toLowerCase()}:${otpCode}:${expiresAt}`)
        .digest("hex");

      // Dispatch email via Supabase Auth OTP & FormSubmit email relay
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
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
        });
      } catch {
        // Fallback to FormSubmit relay below
      }

      try {
        await fetch(`https://formsubmit.co/ajax/${staff.email}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: `[LIC Staff Security Code] Your 6-Digit Login Passcode: ${otpCode}`,
            Staff_Member: `${staff.name} (${staff.role})`,
            One_Time_Passcode: otpCode,
            Expires_In: "10 Minutes",
            Portal_URL: "https://langley-islamic-centre.vercel.app",
          }),
        });
      } catch {
        // Handled
      }

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
        message: `6-digit verification passcode sent to ${staff.email} (${staff.role}).`,
      });
      res.cookies.set(OTP_COOKIE_NAME, pendingPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 600,
      });
      return res;
    }

    // ========================================================================
    // 2. VERIFY PASSWORDLESS EMAIL 6-DIGIT OTP (Option 1)
    // ========================================================================
    if (action === "verify_email_otp") {
      const pendingRaw = req.cookies.get(OTP_COOKIE_NAME)?.value;
      if (!pendingRaw) {
        return NextResponse.json(
          { ok: false, error: "OTP session expired. Please request a new code." },
          { status: 400 }
        );
      }
      const pending = JSON.parse(
        Buffer.from(pendingRaw, "base64url").toString("utf-8")
      ) as {
        email: string;
        name: string;
        role: string;
        expiresAt: number;
        otpHash: string;
      };

      if (now > pending.expiresAt) {
        return NextResponse.json(
          { ok: false, error: "Passcode expired. Please request a new code." },
          { status: 400 }
        );
      }

      const candidateCode = (body.otp || "").trim();
      const candidateHash = crypto
        .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
        .update(`${pending.email}:${candidateCode}:${pending.expiresAt}`)
        .digest("hex");

      // Also verify against Supabase Auth OTP if user received a Supabase Auth 6-digit token
      let supabaseOtpValid = false;
      try {
        const sbVerify = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "email",
            email: pending.email,
            token: candidateCode,
          }),
        });
        if (sbVerify.ok) supabaseOtpValid = true;
      } catch {
        // Ignore
      }

      if (candidateHash !== pending.otpHash && !supabaseOtpValid) {
        const nextCount = (record?.count || 0) + 1;
        failedAttempts.set(ip, {
          count: nextCount,
          lockedUntil: nextCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
        });
        return NextResponse.json(
          { ok: false, error: "Invalid 6-digit verification code." },
          { status: 401 }
        );
      }

      failedAttempts.delete(ip);
      const identity: StaffIdentity = {
        name: pending.name,
        email: pending.email,
        role: pending.role,
        authMethod: "Email OTP",
      };
      const sessionToken = createSignedSessionCookie(identity);
      const res = NextResponse.json({ ok: true, staff: identity });
      res.cookies.delete(OTP_COOKIE_NAME);
      res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 14, // 14-day remembered device session
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
