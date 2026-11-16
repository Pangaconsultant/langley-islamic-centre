"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Users,
  Footprints,
  Bike,
  CheckCircle2,
  OctagonAlert,
  Sparkles,
  UserCheck,
  Clock,
  RotateCcw,
} from "lucide-react";
import { LicLogo } from "@/components/LicLogo";
import {
  useLicStore,
  TravelMode,
  ActivityType,
  detectCurrentActivity,
} from "@/lib/db";

const TRAVEL_MODES: {
  mode: TravelMode;
  label: string;
  sub: string;
  icon: React.ElementType;
}[] = [
  {
    mode: "Walking",
    label: "Walking",
    sub: "Zero Vehicle Impact",
    icon: Footprints,
  },
  {
    mode: "Bicycle",
    label: "Bicycle",
    sub: "Spitfire Close Cycle Rack",
    icon: Bike,
  },
  {
    mode: "Car Share",
    label: "Car Share",
    sub: "2+ Occupants (Common Rd / Harvey Park / Harrow Mkt)",
    icon: Users,
  },
  {
    mode: "Car / Drive",
    label: "Car / Drive",
    sub: "Parked on Common Rd / Harvey Park / Harrow Mkt",
    icon: Car,
  },
];

const ACTIVITIES: ActivityType[] = [
  "Fajr",
  "Zuhar",
  "Asr",
  "Maghrib",
  "Isha",
  "Quran Class",
  "Youth Circle",
  "Other",
];

export default function VisitorKioskPage() {
  const { state, recordVisitorCheckIn } = useLicStore();
  const [visitorName, setVisitorName] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode | null>(null);
  const [occupantCount, setOccupantCount] = useState<2 | 3 | 4>(2);
  const [activity, setActivity] = useState<ActivityType>("Isha");
  const [submittedState, setSubmittedState] = useState<{
    name: string;
    mode: TravelMode;
    occupants: number;
    activity: ActivityType;
    newOccupancy: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(4);
  const [clockText, setClockText] = useState("");

  // Auto-detect Salah / Activity on mount and keep live clock running
  useEffect(() => {
    setActivity(detectCurrentActivity());
    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-reset after 4 seconds when check-in completes
  useEffect(() => {
    if (!submittedState) return;
    setCountdown(4);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetForm();
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submittedState]);

  const resetForm = () => {
    setVisitorName("");
    setTravelMode(null);
    setOccupantCount(2);
    setActivity(detectCurrentActivity());
    setSubmittedState(null);
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !travelMode) return;

    const finalOccupants = travelMode === "Car Share" ? occupantCount : 1;
    const res = recordVisitorCheckIn({
      visitorName: visitorName.trim(),
      travelMode,
      occupantCount: finalOccupants,
      activity,
    });

    if (res.success) {
      setSubmittedState({
        name: visitorName.trim(),
        mode: travelMode,
        occupants: finalOccupants,
        activity,
        newOccupancy: res.newOccupancy,
      });
    }
  };

  const { currentCount, maxCapacity } = state.occupancy;
  const isAtCapacity = currentCount >= maxCapacity;
  const isApproaching = currentCount >= 30 && currentCount < maxCapacity;

  return (
    <div className="min-h-screen bg-[#F0F7FC] flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Kiosk Header (No External Navigation Links per Kiosk Spec) */}
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl border-2 border-[#D0E6F7] px-6 py-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <LicLogo size="sm" showText={false} />
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#005A9C] tracking-tight">
              LANGLEY ISLAMIC CENTRE — ENTRANCE CHECK-IN KIOSK
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#009FE3]">
              Spitfire Close (SL3) • Sustainable Travel Plan &amp; Live Occupancy Register
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] text-[#005A9C] font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#009FE3]" />
            <span>{clockText || "Live Kiosk"}</span>
          </div>

          <div
            className={`px-4 py-2 rounded-2xl font-black text-sm sm:text-base border-2 ${
              isAtCapacity
                ? "bg-red-600 text-white border-red-700"
                : isApproaching
                ? "bg-amber-500 text-slate-950 border-amber-600"
                : "bg-emerald-600 text-white border-emerald-700"
            }`}
          >
            Occupancy: {currentCount} / {maxCapacity}
          </div>
        </div>
      </div>

      {/* Main Kiosk Body */}
      <div className="max-w-5xl w-full mx-auto my-auto py-4">
        {submittedState ? (
          /* 4-Second Auto-Reset Confirmation Screen */
          <div className="bg-white rounded-3xl border-4 border-emerald-500 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                JazakAllah Khair • Check-In Recorded
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#005A9C]">
                Assalamu Alaikum, {submittedState.name}!
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium">
                Checked in for <strong>{submittedState.activity}</strong> via{" "}
                <strong>
                  {submittedState.mode}
                  {submittedState.mode === "Car Share"
                    ? ` (${submittedState.occupants === 4 ? "4+" : submittedState.occupants} occupants)`
                    : ""}
                </strong>
                .
              </p>
            </div>

            <div className="max-w-md mx-auto bg-[#F0F7FC] border-2 border-[#D0E6F7] rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Updated Building Headcount
              </div>
              <div className="text-3xl font-black text-[#005A9C] mt-1">
                {submittedState.newOccupancy} / {maxCapacity} Persons
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-sm font-bold text-slate-500">
                Screen auto-resetting for next visitor in{" "}
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#005A9C] text-white font-black">
                  {countdown}
                </span>{" "}
                seconds...
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-bold text-sm inline-flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Next Visitor Now
              </button>
            </div>
          </div>
        ) : isAtCapacity ? (
          /* Strict 40/40 Capacity Reached Lockout Screen */
          <div className="bg-red-50 border-4 border-red-600 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto">
              <OctagonAlert className="w-12 h-12" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-red-900">
              BUILDING AT MAXIMUM CAPACITY (40 / 40)
            </h2>
            <p className="text-base sm:text-lg text-red-800 max-w-2xl mx-auto font-semibold">
              In compliance with our Slough Borough Council Operational Management Plan,
              on-site occupancy is strictly capped at 40 persons. Please follow the Door
              Marshal&apos;s instructions for the next congregation or overflow protocol.
            </p>
          </div>
        ) : (
          /* Kiosk Check-In Form */
          <form
            onSubmit={handleCheckIn}
            className="bg-white rounded-3xl border-2 border-[#D0E6F7] shadow-lg p-6 sm:p-8 space-y-6"
          >
            {/* Step 1: Visitor Name + Quick-Tap Regular Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-base sm:text-lg font-extrabold text-[#005A9C] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-sm font-black inline-flex items-center justify-center">
                    1
                  </span>
                  <span>Your Name (Tap Quick-Chip or Type Below)</span>
                </label>
                {visitorName && (
                  <button
                    type="button"
                    onClick={() => setVisitorName("")}
                    className="text-xs font-bold text-[#009FE3] hover:underline"
                  >
                    Clear Name
                  </button>
                )}
              </div>

              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Tap your name below or enter full name..."
                required
                className="w-full h-14 px-5 rounded-2xl border-2 border-[#D0E6F7] focus:border-[#005A9C] focus:outline-none text-lg font-bold text-[#005A9C] bg-[#F0F7FC]/60 placeholder:text-slate-400"
              />

              {/* Quick-Tap Frequent Regulars Chips */}
              <div className="pt-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Frequent Regulars &amp; Quick-Tap Selection:
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.frequentVisitors.map((regName) => {
                    const selected = visitorName === regName;
                    return (
                      <button
                        key={regName}
                        type="button"
                        onClick={() => setVisitorName(regName)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95 border-2 ${
                          selected
                            ? "bg-[#005A9C] text-white border-[#005A9C] shadow-sm"
                            : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                        }`}
                      >
                        {regName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Mode of Travel */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-base sm:text-lg font-extrabold text-[#005A9C] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-sm font-black inline-flex items-center justify-center">
                  2
                </span>
                <span>Mode of Travel Today (SBC Travel Plan Log)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRAVEL_MODES.map((item) => {
                  const Icon = item.icon;
                  const active = travelMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setTravelMode(item.mode)}
                      className={`p-4 rounded-2xl border-2 text-left transition active:scale-95 flex flex-col justify-between min-h-[112px] ${
                        active
                          ? "bg-[#005A9C] text-white border-[#005A9C] shadow-md"
                          : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 ${
                          active ? "text-[#009FE3]" : "text-[#009FE3]"
                        }`}
                      />
                      <div className="mt-2">
                        <div className="font-extrabold text-base leading-tight">
                          {item.label}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 font-medium ${
                            active ? "text-[#F0F7FC]/90" : "text-slate-500"
                          }`}
                        >
                          {item.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Vehicle Occupant Count when Car Share is selected */}
              {travelMode === "Car Share" && (
                <div className="bg-[#F0F7FC] border-2 border-[#009FE3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                  <div>
                    <div className="text-sm font-extrabold text-[#005A9C]">
                      Vehicle Occupant Count (Car Share)
                    </div>
                    <div className="text-xs text-slate-600">
                      How many people travelled together in this shared vehicle?
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {([2, 3, 4] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setOccupantCount(cnt)}
                        className={`w-20 h-12 rounded-xl font-black text-lg border-2 transition ${
                          occupantCount === cnt
                            ? "bg-[#005A9C] text-white border-[#005A9C]"
                            : "bg-white text-[#005A9C] border-[#D0E6F7]"
                        }`}
                      >
                        {cnt === 4 ? "4+" : cnt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Auto-Detected Salah / Activity */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-base sm:text-lg font-extrabold text-[#005A9C] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#005A9C] text-white text-sm font-black inline-flex items-center justify-center">
                    3
                  </span>
                  <span>Salah / Activity (Auto-Detected by Time)</span>
                </label>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#009FE3]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Selected: {activity}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ACTIVITIES.map((act) => {
                  const selected = activity === act;
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setActivity(act)}
                      className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm border-2 transition text-center ${
                        selected
                          ? "bg-[#009FE3] text-white border-[#009FE3] shadow-sm"
                          : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Check-In Button */}
            <button
              type="submit"
              disabled={!visitorName.trim() || !travelMode}
              className="w-full h-16 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xl shadow-lg flex items-center justify-center gap-3 transition active:scale-[0.99]"
            >
              <UserCheck className="w-7 h-7 text-[#009FE3]" />
              <span>TAP TO CHECK IN (+1 OCCUPANCY)</span>
            </button>
          </form>
        )}
      </div>

      {/* Kiosk Bottom Compliance Strip (No External Links) */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs font-semibold text-slate-500 py-2">
        Strict Building Maximum: 40 Persons • Zero Parking or Waiting on Spitfire Close • Data Logged for Slough Borough Council (SBC) Travel Plan Compliance
      </div>
    </div>
  );
}
