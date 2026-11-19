import crypto from "crypto";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";
const DEFAULT_PIN =
  process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN || "2580";

export interface StaffIdentity {
  name: string;
  email: string;
  role: string;
  authMethod: "Passkey (Biometric)" | "Email OTP / Magic Link" | "Recovery PIN";
}

// Derived server-only HMAC signing key (never uses raw publishable key directly)
export function getServerHmacSecret(): string {
  return (
    process.env.LIC_SESSION_SECRET ||
    crypto
      .createHash("sha256")
      .update(
        `lic_hmac_v2::${SUPABASE_PUBLISHABLE_KEY}::${DEFAULT_PIN}::sl3_8gy`
      )
      .digest("hex")
  );
}

export function createSignedSessionCookie(
  identity: StaffIdentity,
  ttlSeconds = 60 * 60 * 24 * 14
): string {
  const envelope = {
    ...identity,
    exp: Date.now() + ttlSeconds * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(envelope)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getServerHmacSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySignedSessionCookie(
  cookieValue: string
): StaffIdentity | null {
  try {
    const [payloadB64, sig] = cookieValue.split(".");
    if (!payloadB64 || !sig) return null;
    const expectedSig = crypto
      .createHmac("sha256", getServerHmacSecret())
      .update(payloadB64)
      .digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as StaffIdentity & { exp?: number };
    if (parsed.exp && Date.now() > parsed.exp) {
      return null;
    }
    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      authMethod: parsed.authMethod,
    };
  } catch {
    return null;
  }
}
