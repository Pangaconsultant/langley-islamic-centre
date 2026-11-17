"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  Eye,
  Clock,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

interface MaskedContactBoxProps {
  variant?: "footer" | "card";
}

/**
 * Anti-Bot Click-to-Reveal Contact Component
 * Stores phone & email as char-code arrays and only decodes on explicit user click
 * so static HTML scrapers and harvesting bots cannot extract contact details.
 */
const PHONE_CHAR_CODES = [48, 55, 56, 32, 52, 51, 55, 51, 32, 50, 49, 48, 54]; // "078 4373 2106"
const EMAIL_LOCAL_CODES = [105, 110, 102, 111]; // "info"
const EMAIL_DOMAIN_CODES = [
  108, 97, 110, 103, 108, 101, 121, 105, 115, 108, 97, 109, 105, 99, 99, 101,
  110, 116, 114, 101, 46, 99, 111, 46, 117, 107,
]; // "langleyislamiccentre.co.uk"

function decodeChars(codes: number[]): string {
  return String.fromCharCode(...codes);
}

export const MaskedContactBox: React.FC<MaskedContactBoxProps> = ({
  variant = "card",
}) => {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<"phone" | "email" | null>(
    null
  );

  const decodedPhone = phoneRevealed ? decodeChars(PHONE_CHAR_CODES) : "";
  const decodedEmail = emailRevealed
    ? `${decodeChars(EMAIL_LOCAL_CODES)}@${decodeChars(EMAIL_DOMAIN_CODES)}`
    : "";

  const handleCopy = (val: string, field: "phone" | "email") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(val);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (variant === "footer") {
    return (
      <div className="space-y-2 text-xs text-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#7FD4FF] shrink-0" />
          <span>
            <strong>Hours:</strong> 13:00 – 19:00 hrs
          </span>
        </div>

        {/* Anti-Bot Masked Phone */}
        <div className="flex items-center gap-2 flex-wrap">
          <Phone className="w-3.5 h-3.5 text-[#7FD4FF] shrink-0" />
          {!phoneRevealed ? (
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 border border-white/15 transition"
              title="Click to reveal phone number (Protected from bots)"
            >
              <span className="font-mono">078 •••• ••06</span>
              <Eye className="w-3 h-3 text-[#7FD4FF]" />
              <span className="text-[11px] text-[#7FD4FF] underline">
                Click to Reveal
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-lg">
              <a
                href={`tel:${decodedPhone.replace(/\s+/g, "")}`}
                className="font-mono font-extrabold text-white hover:text-[#7FD4FF] underline"
              >
                {decodedPhone}
              </a>
              <button
                type="button"
                onClick={() => handleCopy(decodedPhone, "phone")}
                className="text-[#7FD4FF] hover:text-white"
                title="Copy Phone Number"
              >
                {copiedField === "phone" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Anti-Bot Masked Email */}
        <div className="flex items-center gap-2 flex-wrap">
          <Mail className="w-3.5 h-3.5 text-[#7FD4FF] shrink-0" />
          {!emailRevealed ? (
            <button
              type="button"
              onClick={() => setEmailRevealed(true)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 border border-white/15 transition"
              title="Click to reveal email address (Protected from bots)"
            >
              <span className="font-mono">in••@langleyislamic••••.co.uk</span>
              <Eye className="w-3 h-3 text-[#7FD4FF]" />
              <span className="text-[11px] text-[#7FD4FF] underline">
                Click to Reveal
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-lg">
              <a
                href={`mailto:${decodedEmail}`}
                className="font-mono font-extrabold text-white hover:text-[#7FD4FF] underline"
              >
                {decodedEmail}
              </a>
              <button
                type="button"
                onClick={() => handleCopy(decodedEmail, "email")}
                className="text-[#7FD4FF] hover:text-white"
                title="Copy Email Address"
              >
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
          <ShieldCheck className="w-4 h-4" />
          <span>Bot-Protected Official Contact Details</span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7]">
          Click-to-Reveal Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Address Card */}
        <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#005A9C] border border-[#D0E6F7] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#009FE3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-slate-500">
              Centre Address
            </div>
            <div className="text-sm font-black text-[#005A9C] mt-0.5">
              Spitfire Close, Langley
            </div>
            <div className="text-xs font-bold text-slate-600">
              Slough, SL3 8GY
            </div>
          </div>
        </div>

        {/* Hours Card */}
        <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#005A9C] border border-[#D0E6F7] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#009FE3]" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-slate-500">
              Centre Hours
            </div>
            <div className="text-sm font-black text-[#005A9C] mt-0.5">
              13:00 – 19:00 hrs
            </div>
            <div className="text-xs text-slate-600">
              Plus Daily Jama&apos;ah Prayer Times
            </div>
          </div>
        </div>

        {/* Masked Phone Number Card */}
        <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#005A9C] border border-[#D0E6F7] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#009FE3]" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase text-slate-500">
                Official Telephone
              </div>
              {!phoneRevealed ? (
                <div className="font-mono text-sm font-black text-slate-700 mt-0.5">
                  078 •••• ••06
                </div>
              ) : (
                <a
                  href={`tel:${decodedPhone.replace(/\s+/g, "")}`}
                  className="font-mono text-base font-black text-[#005A9C] hover:text-[#009FE3] underline mt-0.5 block"
                >
                  {decodedPhone}
                </a>
              )}
            </div>
          </div>

          {!phoneRevealed ? (
            <button
              type="button"
              onClick={() => setPhoneRevealed(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Eye className="w-4 h-4 text-[#009FE3]" />
              <span>Click to Reveal Phone Number</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <a
                href={`tel:${decodedPhone.replace(/\s+/g, "")}`}
                className="flex-1 py-2 px-3 rounded-xl bg-[#005A9C] text-white font-bold text-xs text-center"
              >
                Call Now
              </a>
              <button
                type="button"
                onClick={() => handleCopy(decodedPhone, "phone")}
                className="px-3 py-2 rounded-xl bg-white border border-[#D0E6F7] text-[#005A9C] font-bold text-xs inline-flex items-center gap-1"
              >
                {copiedField === "phone" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Masked Email Address Card */}
        <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#005A9C] border border-[#D0E6F7] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#009FE3]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold uppercase text-slate-500">
                Official Email
              </div>
              {!emailRevealed ? (
                <div className="font-mono text-xs sm:text-sm font-black text-slate-700 mt-0.5 truncate">
                  in••@langleyislamic••••.co.uk
                </div>
              ) : (
                <a
                  href={`mailto:${decodedEmail}`}
                  className="font-mono text-xs sm:text-sm font-black text-[#005A9C] hover:text-[#009FE3] underline mt-0.5 block break-all"
                >
                  {decodedEmail}
                </a>
              )}
            </div>
          </div>

          {!emailRevealed ? (
            <button
              type="button"
              onClick={() => setEmailRevealed(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Eye className="w-4 h-4 text-[#009FE3]" />
              <span>Click to Reveal Email Address</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <a
                href={`mailto:${decodedEmail}`}
                className="flex-1 py-2 px-3 rounded-xl bg-[#005A9C] text-white font-bold text-xs text-center"
              >
                Send Email
              </a>
              <button
                type="button"
                onClick={() => handleCopy(decodedEmail, "email")}
                className="px-3 py-2 rounded-xl bg-white border border-[#D0E6F7] text-[#005A9C] font-bold text-xs inline-flex items-center gap-1"
              >
                {copiedField === "email" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          Contact details are obfuscated in memory and decoded only on human
          click to prevent automated harvesting bots.
        </span>
      </p>
    </div>
  );
};
