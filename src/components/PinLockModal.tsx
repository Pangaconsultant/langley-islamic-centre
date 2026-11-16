"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Delete, KeyRound } from "lucide-react";
import { useLicStore } from "@/lib/db";

interface PinGateProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  inline?: boolean;
}

/**
 * Confidential Trustee & Staff PIN Gate
 * Verifies against the dynamic Admin PIN stored in the LIC state (never shown on screen).
 */
export const PinGate: React.FC<PinGateProps> = ({
  title = "Authorised LIC Staff & Trustee Access",
  subtitle = "Enter your confidential 4-digit LIC administrative PIN to unlock internal controls.",
  children,
}) => {
  const { state } = useLicStore();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const requiredPin = state.adminPin || "2580";

  const handleDigit = (digit: string) => {
    setError(false);
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        if (next === requiredPin) {
          setUnlocked(true);
        } else {
          setError(true);
          setTimeout(() => setPin(""), 450);
        }
      }
    }
  };

  const handleBackspace = () => {
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  };

  if (unlocked) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-emerald-900 text-sm font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Authorised Internal Staff / Trustee Session Active</span>
          </div>
          <button
            onClick={() => {
              setUnlocked(false);
              setPin("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Internal View
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border-2 border-[#D0E6F7] rounded-2xl shadow-lg p-6 sm:p-8 text-center my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#F0F7FC] border border-[#009FE3]/30 flex items-center justify-center mx-auto mb-4 text-[#005A9C]">
        <KeyRound className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-[#005A9C]">{title}</h2>
      <p className="text-sm text-slate-600 mt-1 mb-6">{subtitle}</p>

      {/* 4-dot PIN display */}
      <div className="flex justify-center gap-3 mb-4">
        {[0, 1, 2, 3].map((i) => {
          const filled = pin.length > i;
          return (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                error
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

      {error && (
        <p className="text-xs font-semibold text-red-600 mb-3">
          Invalid PIN. Access restricted to authorised LIC Trustees and Staff.
        </p>
      )}

      {/* Touch Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mt-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(num)}
            className="h-14 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white active:scale-95 text-[#005A9C] font-bold text-xl border border-[#D0E6F7] transition flex items-center justify-center shadow-sm"
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPin("")}
          className="h-14 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleDigit("0")}
          className="h-14 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white active:scale-95 text-[#005A9C] font-bold text-xl border border-[#D0E6F7] transition flex items-center justify-center shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="h-14 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Lock className="w-3.5 h-3.5 text-[#009FE3]" />
        <span>Confidential Staff Access • PIN can only be reset by an Admin in /admin</span>
      </div>
    </div>
  );
};
