"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  Delete,
  KeyRound,
  Fingerprint,
  Mail,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface PinGateProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  inline?: boolean;
}

interface StaffIdentity {
  name: string;
  email: string;
  role: string;
  authMethod: string;
}

const LOCAL_PASSKEY_ID_KEY = "lic_webauthn_cred_id";
const LOCAL_PASSKEY_EMAIL_KEY = "lic_webauthn_staff_email";

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * State-of-the-Art Zero-Trust Staff & Trustee Authentication Gate
 * Supports:
 * 1. Biometric Passkeys (FaceID / TouchID / Windows Hello via WebAuthn FIDO2)
 * 2. Passwordless Email 6-Digit OTP + Role-Based Staff Allowlist (Supabase)
 * 3. Emergency Rate-Limited Trustee Recovery PIN (5 attempts max -> 15-min IP lockout)
 */
export const PinGate: React.FC<PinGateProps> = ({
  title = "Authorised LIC Staff & Trustee Access",
  subtitle = "Authenticate via Biometric Passkey (FaceID / Fingerprint / Windows Hello) or Passwordless Staff Email OTP.",
  children,
}) => {
  const [authTab, setAuthTab] = useState<"passkey" | "email-otp" | "pin">(
    "passkey"
  );
  const [unlocked, setUnlocked] = useState(false);
  const [staffIdentity, setStaffIdentity] = useState<StaffIdentity | null>(
    null
  );
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Biometric Passkey State
  const [storedPasskeyId, setStoredPasskeyId] = useState<string | null>(null);
  const [storedPasskeyEmail, setStoredPasskeyEmail] = useState<string>(
    "info@langleyislamiccentre.co.uk"
  );
  const [biometricSupported, setBiometricSupported] = useState(false);

  // Email OTP State
  const [staffEmail, setStaffEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Emergency Recovery PIN State
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential !== undefined
    ) {
      setBiometricSupported(true);
      const savedCred = window.localStorage.getItem(LOCAL_PASSKEY_ID_KEY);
      const savedEmail = window.localStorage.getItem(LOCAL_PASSKEY_EMAIL_KEY);
      if (savedCred) setStoredPasskeyId(savedCred);
      if (savedEmail) setStoredPasskeyEmail(savedEmail);
      if (!savedCred) setAuthTab("email-otp");
    } else {
      setAuthTab("email-otp");
    }

    let active = true;

    // 1. Check if the user just clicked a Supabase Magic Link (#access_token=...)
    if (
      typeof window !== "undefined" &&
      window.location.hash &&
      window.location.hash.includes("access_token=")
    ) {
      const match = window.location.hash.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        fetch("/api/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_supabase_token",
            accessToken: token,
          }),
        })
          .then((r) => r.json())
          .then((data: { ok?: boolean; staff?: StaffIdentity }) => {
            if (active && data.ok) {
              setUnlocked(true);
              if (data.staff) setStaffIdentity(data.staff);
            }
          })
          .catch(() => {})
          .finally(() => {
            if (active) setCheckingSession(false);
          });
        return () => {
          active = false;
        };
      }
    }

    // 2. Otherwise check existing HttpOnly staff session cookie
    fetch("/api/verify-pin", { method: "GET" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; staff?: StaffIdentity }) => {
        if (active && data.authenticated) {
          setUnlocked(true);
          if (data.staff) setStaffIdentity(data.staff);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // ==========================================================================
  // OPTION 2: WEBAUTHN BIOMETRIC PASSKEY ENROLLMENT & 1-TAP UNLOCK
  // ==========================================================================
  const handleEnrollBiometricPasskey = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    if (!biometricSupported) {
      setErrorMsg("WebAuthn Biometrics not supported on this browser.");
      return;
    }

    try {
      const emailToBind =
        staffIdentity?.email ||
        staffEmail ||
        "info@langleyislamiccentre.co.uk";
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Langley Islamic Centre (LIC)",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: emailToBind,
            displayName: staffIdentity?.name || "LIC Authorised Staff",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        setErrorMsg("Biometric enrollment was cancelled.");
        return;
      }

      const credId = bufferToBase64Url(credential.rawId);
      window.localStorage.setItem(LOCAL_PASSKEY_ID_KEY, credId);
      window.localStorage.setItem(LOCAL_PASSKEY_EMAIL_KEY, emailToBind);
      setStoredPasskeyId(credId);
      setStoredPasskeyEmail(emailToBind);

      await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_passkey",
          email: emailToBind,
          credentialId: credId,
        }),
      });

      setStatusMsg(
        `Biometric Passkey (FaceID / TouchID / Windows Hello) enrolled for ${emailToBind}! You can now unlock in 1 tap.`
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not enroll biometric key.";
      setErrorMsg(
        `Biometric setup notice: ${msg}. Make sure FaceID, TouchID, or Windows Hello is enabled on your device.`
      );
    }
  };

  const handleUnlockWithBiometricPasskey = async () => {
    setErrorMsg(null);
    if (!biometricSupported) {
      setErrorMsg("WebAuthn Biometrics not supported on this device.");
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const allowCredentials: PublicKeyCredentialDescriptor[] = storedPasskeyId
        ? [
            {
              id: base64UrlToUint8Array(storedPasskeyId)
                .buffer as ArrayBuffer,
              type: "public-key",
            },
          ]
        : [];

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) {
        setErrorMsg("Biometric verification cancelled.");
        return;
      }

      const credId = bufferToBase64Url(assertion.rawId);
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_passkey",
          credentialId: credId,
          email: storedPasskeyEmail,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        staff?: StaffIdentity;
        error?: string;
      };
      if (data.ok) {
        setUnlocked(true);
        if (data.staff) setStaffIdentity(data.staff);
      } else {
        setErrorMsg(data.error || "Biometric passkey not recognized.");
      }
    } catch {
      setErrorMsg(
        "Biometric authentication cancelled or no Passkey enrolled yet on this device. Sign in once with Email OTP or Recovery PIN, then click 'Enroll FaceID / Windows Hello'."
      );
    }
  };

  // ==========================================================================
  // OPTION 1: PASSWORDLESS EMAIL 6-DIGIT OTP
  // ==========================================================================
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    if (!staffEmail.trim()) return;
    setLoadingOtp(true);

    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_email_otp",
          email: staffEmail.trim(),
          redirectTo:
            typeof window !== "undefined"
              ? window.location.origin + window.location.pathname
              : "https://langley-islamic-centre.vercel.app/admin",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (data.ok) {
        setOtpSent(true);
        setStatusMsg(
          data.message ||
            "6-digit verification code dispatched to your approved staff email."
        );
      } else {
        setErrorMsg(data.error || "Email not on Approved Staff Allowlist.");
      }
    } catch {
      setErrorMsg("Failed to request email verification code.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otpCode.trim().length < 6) return;
    setLoadingOtp(true);

    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_email_otp",
          email: staffEmail.trim(),
          otp: otpCode.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        staff?: StaffIdentity;
        error?: string;
      };
      if (data.ok) {
        setUnlocked(true);
        if (data.staff) setStaffIdentity(data.staff);
      } else {
        setErrorMsg(data.error || "Invalid 6-digit passcode.");
      }
    } catch {
      setErrorMsg("Could not verify passcode.");
    } finally {
      setLoadingOtp(false);
    }
  };

  // ==========================================================================
  // OPTION 3: EMERGENCY TRUSTEE RECOVERY PIN
  // ==========================================================================
  const handleDigit = async (digit: string) => {
    setErrorMsg(null);
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        try {
          const res = await fetch("/api/verify-pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify_recovery_pin",
              pin: next,
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            staff?: StaffIdentity;
            locked?: boolean;
            error?: string;
            remainingAttempts?: number;
          };
          if (data.ok) {
            setUnlocked(true);
            if (data.staff) setStaffIdentity(data.staff);
            return;
          }
          if (data.locked && data.error) {
            setErrorMsg(data.error);
          } else {
            setErrorMsg(
              `Invalid Recovery PIN (${
                data.remainingAttempts ?? 4
              } attempts left before 15-min IP lockout).`
            );
          }
        } catch {
          setErrorMsg("Unable to verify security credentials.");
        }
        setTimeout(() => setPin(""), 450);
      }
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/verify-pin", { method: "DELETE" }).catch(() => {});
    setUnlocked(false);
    setStaffIdentity(null);
    setPin("");
    setOtpSent(false);
    setOtpCode("");
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    setPin((prev) => prev.slice(0, -1));
  };

  if (checkingSession) {
    return (
      <div className="max-w-md mx-auto bg-white border-2 border-[#D0E6F7] rounded-2xl p-8 text-center my-6 text-xs font-bold text-[#005A9C]">
        Verifying encrypted staff session...
      </div>
    );
  }

  if (unlocked) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border-2 border-emerald-300 px-4 py-3 rounded-2xl text-emerald-950 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold">
                {staffIdentity?.name || "LIC Trustee Admin"}
              </span>{" "}
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-black">
                {staffIdentity?.role || "Trustee Admin"}
              </span>{" "}
              <span className="text-xs text-emerald-700">
                • Verified via {staffIdentity?.authMethod || "Encrypted Cookie"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {biometricSupported && (
              <button
                type="button"
                onClick={() => void handleEnrollBiometricPasskey()}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#005A9C] text-white px-3 py-1.5 rounded-xl hover:bg-[#003F6E] transition shadow-sm"
                title="Bind FaceID, TouchID, or Windows Hello on this device for 1-tap login"
              >
                <Fingerprint className="w-3.5 h-3.5 text-[#7FD4FF]" />
                <span>
                  {storedPasskeyId
                    ? "Update Biometric Passkey"
                    : "Enable FaceID / Windows Hello Passkey"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-emerald-400 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign Out &amp; Lock</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-[#009FE3] text-[#005A9C] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#009FE3] shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-400 text-amber-900 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {children}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white border-2 border-[#D0E6F7] rounded-3xl shadow-lg p-6 sm:p-8 my-6 space-y-5">
      <div className="text-center space-y-1.5">
        <div className="w-14 h-14 rounded-2xl bg-[#F0F7FC] border border-[#009FE3]/30 flex items-center justify-center mx-auto mb-2 text-[#005A9C]">
          <Fingerprint className="w-7 h-7 text-[#009FE3]" />
        </div>
        <div className="text-[11px] font-black uppercase tracking-wider text-[#009FE3]">
          Zero-Trust Role-Based Staff Authentication
        </div>
        <h2 className="text-xl font-black text-[#005A9C]">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
      </div>

      {/* Authentication Method Switcher (Option 1: Email OTP, Option 2: Biometric Passkey, Option 3: Recovery PIN) */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#F0F7FC] p-1.5 rounded-2xl border border-[#D0E6F7]">
        <button
          type="button"
          onClick={() => {
            setAuthTab("passkey");
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            authTab === "passkey"
              ? "bg-[#005A9C] text-white shadow-sm"
              : "text-[#005A9C] hover:bg-white/60"
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-[#009FE3]" />
          <span>1. Passkey</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthTab("email-otp");
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            authTab === "email-otp"
              ? "bg-[#005A9C] text-white shadow-sm"
              : "text-[#005A9C] hover:bg-white/60"
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-[#009FE3]" />
          <span>2. Email Magic Link</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthTab("pin");
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
            authTab === "pin"
              ? "bg-[#005A9C] text-white shadow-sm"
              : "text-[#005A9C] hover:bg-white/60"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-[#009FE3]" />
          <span>3. Recovery PIN</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold text-center">
          {statusMsg}
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 1: BIOMETRIC PASSKEY (FACEID / TOUCHID / WINDOWS HELLO)        */}
      {/* ================================================================== */}
      {authTab === "passkey" && (
        <div className="space-y-4 text-center py-2">
          <div className="p-5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-3">
            <Fingerprint className="w-10 h-10 text-[#005A9C] mx-auto" />
            <div className="space-y-1">
              <div className="font-black text-sm text-[#005A9C]">
                Hardware Biometric Passkey (WebAuthn / FIDO2)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {storedPasskeyId
                  ? `Passkey registered on this device for ${storedPasskeyEmail}. Tap below to unlock with FaceID, TouchID, or Windows Hello.`
                  : "Sign in once using Email OTP or Recovery PIN, then click 'Enable FaceID / Windows Hello Passkey' at the top bar to link your device biometrics."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleUnlockWithBiometricPasskey()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md transition"
            >
              <Fingerprint className="w-4 h-4 text-[#009FE3]" />
              <span>Unlock with FaceID / Fingerprint / Windows Hello</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 2: PASSWORDLESS EMAIL 6-DIGIT OTP (ROLE-BASED ALLOWLIST)       */}
      {/* ================================================================== */}
      {authTab === "email-otp" && (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handleRequestEmailOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Approved LIC Staff / Trustee Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. info@langleyislamiccentre.co.uk"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Checked against the live{" "}
                  <code>public.lic_staff_directory</code> allowlist in Supabase
                  (Trustee Admin, Operations Lead, Maktab Teacher).
                </p>
              </div>

              <button
                type="submit"
                disabled={loadingOtp}
                className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-400 text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md transition"
              >
                <Mail className="w-4 h-4 text-[#009FE3]" />
                <span>
                  {loadingOtp
                    ? "Verifying Staff Allowlist & Sending Magic Link..."
                    : "Send 1-Click Email Magic Login Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs text-[#005A9C] space-y-1.5">
                <div className="font-black text-sm">
                  ✓ Magic Login Link Sent to {staffEmail}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Open the email from Supabase and click the{" "}
                  <strong>Log In / Confirm</strong> link — it will redirect back
                  to <strong>langley-islamic-centre.vercel.app</strong> and
                  unlock your staff session automatically!
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Or Paste Magic Link URL / 6-Digit Code Here:
                </label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Paste link from email or enter 6-digit code"
                  className="w-full h-11 px-4 rounded-xl border-2 border-[#D0E6F7] text-center font-mono text-xs sm:text-sm font-bold text-[#005A9C]"
                />
              </div>

              <button
                type="submit"
                disabled={loadingOtp}
                className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-md transition"
              >
                <UserCheck className="w-4 h-4 text-[#009FE3]" />
                <span>Verify 6-Digit Passcode &amp; Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                }}
                className="w-full text-xs font-bold text-[#005A9C] underline"
              >
                Use a different staff email address
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* TAB 3: EMERGENCY RATE-LIMITED TRUSTEE RECOVERY PIN                 */}
      {/* ================================================================== */}
      {authTab === "pin" && (
        <div className="space-y-3 text-center">
          <p className="text-xs text-slate-500">
            Emergency Trustee Recovery Keypad (Rate-limited: 5 attempts max).
          </p>
          <div className="flex justify-center gap-3 mb-2">
            {[0, 1, 2, 3].map((i) => {
              const filled = pin.length > i;
              return (
                <div
                  key={i}
                  className={`w-12 h-13 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                    errorMsg
                      ? "border-red-500 bg-red-50 text-red-600"
                      : filled
                      ? "border-[#005A9C] bg-[#F0F7FC] text-[#005A9C]"
                      : "border-slate-300 bg-slate-50 text-slate-400"
                  }`}
                >
                  {filled ? "●" : ""}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-[250px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => void handleDigit(num)}
                className="h-12 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white active:scale-95 text-[#005A9C] font-bold text-lg border border-[#D0E6F7] transition flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin("")}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => void handleDigit("0")}
              className="h-12 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white active:scale-95 text-[#005A9C] font-bold text-lg border border-[#D0E6F7] transition flex items-center justify-center shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Backspace"
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
        <Lock className="w-3.5 h-3.5 text-[#009FE3] shrink-0" />
        <span>
          FIDO2 WebAuthn Biometrics • Passwordless Email OTP • HttpOnly
          Encrypted Session
        </span>
      </div>
    </div>
  );
};
