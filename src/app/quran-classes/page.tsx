"use client";

import React, { useState } from "react";
import {
  BookOpen,
  BellRing,
  CheckCircle2,
  Users,
  ShieldAlert,
  UserPlus,
  Clock,
  Check,
  MessageSquareShare,
} from "lucide-react";
import {
  useLicStore,
  QuranSessionId,
  AttendanceStatus,
  TravelMode,
} from "@/lib/db";
import { PinGate } from "@/components/PinLockModal";

const ATTENDANCE_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Late",
  "Absent",
  "Picked Up",
];

export default function QuranClassesPage() {
  const {
    state,
    updateStudentAttendance,
    triggerPickupAlert,
    enrollQuranStudent,
  } = useLicStore();

  const [activeTab, setActiveTab] = useState<"parent" | "teacher">("parent");
  const [selectedSessionId, setSelectedSessionId] =
    useState<QuranSessionId>("session-1");
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Parent Enrolment Form State
  const [enrollSessionId, setEnrollSessionId] =
    useState<QuranSessionId>("session-1");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(8);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("Walking");
  const [parkingRulesAccepted, setParkingRulesAccepted] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const activeSession =
    state.quranSessions.find((s) => s.id === selectedSessionId) ||
    state.quranSessions[0];

  const studentsInSelectedSession = state.quranStudents.filter(
    (s) => s.sessionId === selectedSessionId
  );

  const handleSendPickupAlert = (sessionId: QuranSessionId) => {
    const ses = state.quranSessions.find((s) => s.id === sessionId);
    const count = state.quranStudents.filter((s) => s.sessionId === sessionId).length;
    triggerPickupAlert(sessionId);
    setAlertBanner(
      `SMS & WhatsApp 5-Minute Pickup Alert dispatched to ${count} parents for ${ses?.timeWindow}! ("Assalamu Alaikum, class finishes in 5 mins at ${ses?.timeWindow.split("–")[1]}. Please park on Common Road, Harvey Park, or Harrow Market and walk to the Spitfire Close door. Strictly NO waiting or idling on Spitfire Close.")`
    );
  };

  const handleParentEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parkingRulesAccepted) {
      setEnrollStatus({
        type: "error",
        message:
          "You must accept the mandatory Common Road parking & Spitfire Close non-idling pledge.",
      });
      return;
    }

    const res = enrollQuranStudent({
      sessionId: enrollSessionId,
      childName: childName.trim(),
      age: Number(childAge),
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      travelMode,
      parkingRulesAccepted,
    });

    if (!res.ok) {
      setEnrollStatus({
        type: "error",
        message: res.error || "Session full (10/10 max).",
      });
    } else {
      setEnrollStatus({
        type: "success",
        message: `${childName.trim()} has been enrolled into ${
          state.quranSessions.find((s) => s.id === enrollSessionId)?.timeWindow
        }. You will receive automated SMS/WhatsApp pickup alerts 5 minutes before class ends.`,
      });
      setChildName("");
      setParentName("");
      setParentPhone("");
      setParkingRulesAccepted(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <BookOpen className="w-4 h-4" />
            <span>Module 04 • Staggered 45-Min Sessions (Max 10 Students/Session)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Children&apos;s Quran Class Parent &amp; Attendance Portal
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Three sequential 45-minute weekday &amp; Saturday classes (
            <strong>16:30–17:15</strong>, <strong>17:15–18:00</strong>,{" "}
            <strong>18:00–18:45</strong>) strictly capped at <strong>10 students per session</strong> with automated 5-minute pre-pickup parent alerts.
          </p>
        </div>

        {/* Toggle Parent View vs Teacher Register View */}
        <div className="bg-[#F0F7FC] p-1.5 rounded-2xl border-2 border-[#D0E6F7] inline-flex self-start lg:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("parent")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              activeTab === "parent"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C] hover:bg-white/60"
            }`}
          >
            Parent Enrolment &amp; Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teacher")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              activeTab === "teacher"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C] hover:bg-white/60"
            }`}
          >
            Teacher Attendance &amp; Pickup Alert
          </button>
        </div>
      </div>

      {/* 3 Sequential Session Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {state.quranSessions.map((ses) => {
          const count = state.quranStudents.filter(
            (s) => s.sessionId === ses.id
          ).length;
          const isFull = count >= ses.maxCapacity;
          const isSelected = selectedSessionId === ses.id;

          return (
            <div
              key={ses.id}
              onClick={() => {
                setSelectedSessionId(ses.id);
                if (!isFull) setEnrollSessionId(ses.id);
              }}
              className={`cursor-pointer bg-white rounded-2xl border-2 p-5 shadow-sm transition ${
                isSelected
                  ? "border-[#005A9C] ring-2 ring-[#009FE3]/30"
                  : "border-[#D0E6F7] hover:border-[#009FE3]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#009FE3]">
                  <Clock className="w-4 h-4" />
                  {ses.timeWindow}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    isFull
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {count} / {ses.maxCapacity} {isFull ? "(FULL)" : "Enrolled"}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-[#005A9C]">
                {ses.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Teacher: <strong>{ses.ustadhName}</strong> • Pickup Alert:{" "}
                <strong>{ses.pickupAlertTime}</strong>
              </p>

              {/* Capacity Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    isFull ? "bg-red-600" : "bg-[#009FE3]"
                  }`}
                  style={{ width: `${(count / ses.maxCapacity) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* PARENT REGISTRATION VIEW */}
      {activeTab === "parent" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Registration Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3] mb-1">
              <UserPlus className="w-4 h-4" />
              <span>Parent Enrolment Form</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C] mb-1">
              Register Child for Staggered Quran Class
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              Each 45-minute class is strictly capped at 10 students to ensure high-quality tuition and zero traffic congestion on Spitfire Close.
            </p>

            {enrollStatus && (
              <div
                className={`mb-6 p-4 rounded-2xl border-2 text-sm font-bold flex items-start gap-3 ${
                  enrollStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                    : "bg-red-50 border-red-500 text-red-950"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{enrollStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleParentEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1.5">
                  Select 45-Minute Class Session (Max 10 Students) *
                </label>
                <select
                  value={enrollSessionId}
                  onChange={(e) =>
                    setEnrollSessionId(e.target.value as QuranSessionId)
                  }
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#D0E6F7] font-bold text-sm text-[#005A9C] bg-[#F0F7FC]"
                >
                  {state.quranSessions.map((ses) => {
                    const cnt = state.quranStudents.filter(
                      (s) => s.sessionId === ses.id
                    ).length;
                    const full = cnt >= ses.maxCapacity;
                    return (
                      <option key={ses.id} value={ses.id} disabled={full}>
                        {ses.timeWindow} — {ses.title} ({cnt}/10{" "}
                        {full ? "FULL - LOCKED" : "Spaces Available"})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Child&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Zayd Siddiqui"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Child&apos;s Age (5–15) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={15}
                    required
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Parent Full Name"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Parent Mobile (for 5-Min Pickup SMS/WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="07700 900XXX"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Usual Drop-Off / Pick-Up Mode of Travel *
                </label>
                <select
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value as TravelMode)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-bold text-[#005A9C]"
                >
                  <option value="Walking">Walking (Recommended)</option>
                  <option value="Bicycle">Bicycle (On-site Cycle Rack)</option>
                  <option value="Car Share">
                    Car Share (Parked on Common Rd / Harvey Park / Harrow Market)
                  </option>
                  <option value="Car / Drive">
                    Car (Parked on Common Rd / Harvey Park / Harrow Market &amp; Walk In)
                  </option>
                </select>
              </div>

              {/* Mandatory Common Road Parking & Non-Idling Digital Pledge */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Mandatory Parent Parking &amp; Non-Idling Agreement</span>
                </div>
                <label className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 font-semibold cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    checked={parkingRulesAccepted}
                    onChange={(e) => setParkingRulesAccepted(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-amber-600 text-[#005A9C] shrink-0"
                  />
                  <span>
                    I acknowledge and agree to LIC&apos;s strict{" "}
                    <strong>Common Road, Harvey Park &amp; Harrow Market parking rules</strong>.
                    I will <strong>NEVER</strong> park, wait, or idle a vehicle on{" "}
                    <strong>Spitfire Close</strong> (including Mencap next door or the Resident Parking Yard in front of LIC) during drop-off or pick-up, and I will wait for the 5-minute pickup alert before walking to collect my child.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!parkingRulesAccepted}
                className="w-full h-14 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 text-white font-black text-base shadow-md transition"
              >
                Complete Enrolment &amp; Accept Parking Pledge
              </button>
            </form>
          </div>

          {/* Right Column: How the 5-Min Pickup Alert System Protects Spitfire Close */}
          <div className="lg:col-span-2 bg-[#005A9C] text-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#009FE3] flex items-center justify-center">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black">
              How Our 5-Minute Parent Pickup Alert Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
              To ensure zero vehicle waiting or idling on Spitfire Close, LIC operates a strict staggered collection system:
            </p>
            <ol className="space-y-3 text-xs sm:text-sm text-slate-100">
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#009FE3] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>5 Minutes Before Class Ends</strong> (at{" "}
                  <strong>17:10</strong>, <strong>17:55</strong>, and{" "}
                  <strong>18:40</strong>), the teacher taps{" "}
                  <em>&ldquo;Send Pickup Alert&rdquo;</em>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#009FE3] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Parents Park on Common Road, Harvey Park, or Harrow Market</strong>{" "}
                  (2–4 minute walk) and walk quietly to the Spitfire Close entrance.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#009FE3] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Door Supervised Handover:</strong> Each child is signed out on the 1-tap Teacher Register before the next 10-student group enters.
                </span>
              </li>
            </ol>
          </div>
        </div>
      ) : (
        /* TEACHER VIEW (PIN 2580 PROTECTED) */
        <PinGate
          title="Internal Staff: Teacher Attendance & Pickup Alert Portal"
          subtitle="Enter your confidential 4-digit LIC Staff PIN to mark student attendance and dispatch 5-minute parent SMS/WhatsApp pickup alerts."
        >
          <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-6">
            {alertBanner && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-emerald-950 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MessageSquareShare className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-bold">{alertBanner}</div>
                </div>
                <button
                  onClick={() => setAlertBanner(null)}
                  className="text-xs font-extrabold underline shrink-0"
                >
                  Close
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-[#005A9C]">
                  {activeSession.title} ({activeSession.timeWindow})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Teacher: <strong>{activeSession.ustadhName}</strong> • Enrolled:{" "}
                  <strong>
                    {studentsInSelectedSession.length} / {activeSession.maxCapacity} Students
                  </strong>{" "}
                  {activeSession.lastPickupAlertSent && (
                    <span>
                      • Last Pickup Alert Sent:{" "}
                      <strong className="text-emerald-700">
                        {activeSession.lastPickupAlertSent}
                      </strong>
                    </span>
                  )}
                </p>
              </div>

              {/* Send Pickup Alert Button (5 mins before end) */}
              <button
                type="button"
                onClick={() => handleSendPickupAlert(activeSession.id)}
                className="px-5 py-3.5 rounded-2xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-black text-sm shadow-md inline-flex items-center gap-2.5 transition active:scale-95 shrink-0"
              >
                <BellRing className="w-5 h-5" />
                <span>
                  Send Pickup Alert ({activeSession.pickupAlertTime} SMS/WhatsApp)
                </span>
              </button>
            </div>

            {/* 1-Tap Attendance Register Table */}
            <div className="space-y-3">
              {studentsInSelectedSession.map((student, idx) => (
                <div
                  key={student.id}
                  className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#005A9C] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm sm:text-base text-[#005A9C]">
                        {student.childName}{" "}
                        <span className="text-xs font-semibold text-slate-500">
                          (Age {student.age})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Parent: <strong>{student.parentName}</strong> ({student.parentPhone}) •{" "}
                        <span className="text-[#009FE3] font-bold">
                          {student.travelMode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Attendance Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ATTENDANCE_OPTIONS.map((statusOption) => {
                      const active = student.attendance === statusOption;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() =>
                            updateStudentAttendance(student.id, statusOption)
                          }
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition inline-flex items-center gap-1 ${
                            active
                              ? statusOption === "Present"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : statusOption === "Picked Up"
                                ? "bg-[#005A9C] text-white border-[#005A9C]"
                                : statusOption === "Late"
                                ? "bg-amber-500 text-slate-950 border-amber-500"
                                : "bg-red-600 text-white border-red-600"
                              : "bg-white text-slate-700 border-slate-300 hover:border-[#009FE3]"
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5" />}
                          <span>{statusOption}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PinGate>
      )}
    </div>
  );
}
