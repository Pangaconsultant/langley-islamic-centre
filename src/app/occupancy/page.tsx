"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Tablet,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useLicStore, ActivityType } from "@/lib/db";

const SESSION_OPTIONS: ActivityType[] = [
  "Fajr",
  "Zuhar",
  "Asr",
  "Maghrib",
  "Isha",
  "Quran Class",
  "Youth Circle",
  "Other",
];

export default function OccupancyCounterPage() {
  const { state, adjustOccupancy, resetOccupancySession } = useLicStore();
  const { currentCount, maxCapacity, activeSessionName, peakToday, lastUpdated } =
    state.occupancy;
  const [confirmReset, setConfirmReset] = useState(false);

  // Colour-coded status tiers: Green (0-29), Amber (30-36), Red (37-40)
  const isRed = currentCount >= 37;
  const isAmber = currentCount >= 30 && currentCount <= 36;
  const isGreen = currentCount <= 29;

  const percentage = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border-2 border-[#D0E6F7] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Module 02 • Slough Borough Council OMP Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Live 40-Person Occupancy &amp; Door Marshal Counter
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enforces LIC&apos;s strict 40-person maximum building limit (inclusive of staff and volunteers). Synced live with{" "}
            <Link href="/kiosk" className="text-[#009FE3] font-bold underline">
              /kiosk
            </Link>{" "}
            check-ins.
          </p>
        </div>

        <Link
          href="/kiosk"
          className="px-4 py-2.5 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#D0E6F7] font-bold text-xs inline-flex items-center gap-2 shrink-0 transition"
        >
          <Tablet className="w-4 h-4" />
          Open Tablet Kiosk
        </Link>
      </div>

      {/* Colour-Coded Status Banner */}
      {isGreen && (
        <div className="rounded-2xl bg-emerald-600 text-white p-5 shadow-md flex items-center gap-4 border-2 border-emerald-700">
          <CheckCircle2 className="w-10 h-10 shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider opacity-90">
              STATUS: GREEN (0–29 PERSONS) — SAFE CAPACITY
            </div>
            <div className="text-lg sm:text-xl font-extrabold">
              Normal Operation — {maxCapacity - currentCount} Spaces Available Inside Building
            </div>
          </div>
        </div>
      )}

      {isAmber && (
        <div className="rounded-2xl bg-amber-500 text-slate-950 p-5 shadow-md flex items-center gap-4 border-2 border-amber-600">
          <AlertTriangle className="w-10 h-10 shrink-0 text-slate-950" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              STATUS: AMBER (30–36 PERSONS) — APPROACHING CAPACITY
            </div>
            <div className="text-lg sm:text-xl font-extrabold">
              Approaching 40-Person Limit ({maxCapacity - currentCount} spaces left) — Door Marshal Stationed at Entrance
            </div>
          </div>
        </div>
      )}

      {isRed && (
        <div className="rounded-2xl bg-red-600 text-white p-6 shadow-lg flex items-center gap-4 border-4 border-red-800 animate-pulse">
          <OctagonAlert className="w-12 h-12 shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              STATUS: RED (37–40 PERSONS) — AT CAPACITY / ACTIVATE OVERFLOW PROTOCOL
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              {currentCount >= 40
                ? "MAXIMUM 40/40 REACHED — HOLD ENTRY FOR NEXT JAMAAH / STAGGERED SLOT"
                : `CRITICAL CAPACITY (${40 - currentCount} SPACES LEFT) — ACTIVATE OVERFLOW PROTOCOL`}
            </div>
            <p className="text-xs sm:text-sm font-semibold mt-1 text-red-100">
              Door Marshals: Advise arriving attendees to wait for the second congregation or return at the next staggered slot. Ensure zero waiting on Spitfire Close.
            </p>
          </div>
        </div>
      )}

      {/* Giant Counter + Door Marshal Touch Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Counter Display */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-10 shadow-sm flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#009FE3]" />
              <span className="font-bold text-sm text-[#005A9C]">
                Active Session:
              </span>
              <select
                value={activeSessionName}
                onChange={(e) =>
                  adjustOccupancy(0, e.target.value as ActivityType)
                }
                aria-label="Active Session"
                className="text-sm font-extrabold text-[#005A9C] bg-[#F0F7FC] border border-[#D0E6F7] rounded-lg px-2.5 py-1"
              >
                {SESSION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Peak Today: <strong className="text-[#005A9C]">{peakToday} / 40</strong>
            </span>
          </div>

          {/* Big Headcount Readout */}
          <div className="my-8 text-center">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-2">
              LIVE ON-SITE HEADCOUNT (INCL. STAFF &amp; VOLUNTEERS)
            </div>
            <div
              className={`text-6xl sm:text-8xl font-black tracking-tight ${
                isRed
                  ? "text-red-600"
                  : isAmber
                  ? "text-amber-600"
                  : "text-[#005A9C]"
              }`}
            >
              Current: {currentCount} <span className="text-4xl sm:text-5xl text-slate-400">/ {maxCapacity}</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden mt-6 border border-slate-200 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isRed
                    ? "bg-red-600"
                    : isAmber
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-2">
              <span className="text-emerald-700">0–29 Green (Normal)</span>
              <span className="text-amber-700">30–36 Amber (Approaching)</span>
              <span className="text-red-700">37–40 Red (Overflow Protocol)</span>
            </div>
          </div>

          {/* Huge Door Marshal +1 / -1 Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => adjustOccupancy(1)}
              disabled={currentCount >= maxCapacity}
              className="h-20 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xl shadow-md flex items-center justify-center gap-3 transition active:scale-95"
            >
              <Plus className="w-8 h-8 text-[#009FE3]" />
              <span>+1 Visitor Entry</span>
            </button>

            <button
              type="button"
              onClick={() => adjustOccupancy(-1)}
              disabled={currentCount <= 0}
              className="h-20 rounded-2xl bg-[#009FE3] hover:bg-[#005A9C] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xl shadow-md flex items-center justify-center gap-3 transition active:scale-95"
            >
              <Minus className="w-8 h-8" />
              <span>-1 Visitor Exit</span>
            </button>
          </div>

          {/* Secondary Marshal Controls: -5 Batch Exit & Reset Session */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => adjustOccupancy(-5)}
              disabled={currentCount <= 0}
              className="px-4 py-2.5 rounded-xl bg-[#F0F7FC] hover:bg-[#D0E6F7] text-[#005A9C] font-bold text-xs border border-[#D0E6F7] transition"
            >
              -5 Post-Jamaat Dispersal
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 inline-flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Session (0 / 40)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-700">Confirm Reset to 0?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetOccupancySession();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
                >
                  Yes, Reset Now
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Feed of Recent Kiosk Check-Ins */}
        <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-base text-[#005A9C] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#009FE3]" />
                <span>Recent Kiosk Check-Ins</span>
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0F7FC] text-[#005A9C]">
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {state.checkIns.slice(0, 8).map((chk) => (
                <div
                  key={chk.id}
                  className="p-3 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-sm text-[#005A9C]">
                      {chk.visitorName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {chk.travelMode}
                      {chk.travelMode === "Car Share"
                        ? ` (${chk.occupantCount === 4 ? "4+" : chk.occupantCount} pax)`
                        : ""}{" "}
                      • <strong>{chk.activity}</strong>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {new Date(chk.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Last Counter Update:{" "}
            <strong>
              {new Date(lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
