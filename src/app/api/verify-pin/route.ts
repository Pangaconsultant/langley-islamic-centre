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

function computeSessionToken(pin: string): string {
  return crypto
    .createHmac("sha256", SUPABASE_PUBLISHABLE_KEY)
    .update(`lic_verified_staff:${pin}`)
    .digest("hex");
}

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return NextResponse.json({ authenticated: false });
  }
  const validPin = await getServerStoredPin();
  const expectedToken = computeSessionToken(validPin);
  return NextResponse.json({ authenticated: cookieToken === expectedToken });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
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

    const body = (await req.json()) as { pin?: string };
    const candidate = (body.pin || "").trim();
    const validPin = await getServerStoredPin();

    // Timing-safe comparison to prevent timing side-channel attacks
    const candidateHash = crypto.createHash("sha256").update(candidate).digest();
    const validHash = crypto.createHash("sha256").update(validPin).digest();
    const ok =
      candidate.length >= 4 &&
      crypto.timingSafeEqual(candidateHash, validHash);

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
    const token = computeSessionToken(validPin);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour shift session
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
