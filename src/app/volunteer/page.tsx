"use client";

import React, { useState } from "react";
import {
  HandHeart,
  Clock,
  MapPin,
  CheckCircle2,
  RotateCcw,
  Filter,
  UserCheck,
  MessageCircle,
  Calendar,
} from "lucide-react";
import {
  useLicStore,
  VolunteerDayCategory,
  VolunteerTimeWindow,
} from "@/lib/db";

const DAY_FILTERS: ("All" | VolunteerDayCategory)[] = [
  "All",
  "Weekdays (Afternoon)",
  "Daily (Evening)",
  "Fridays (Off-Site Pavilion)",
  "Flexible / Remote",
];

const TIME_FILTERS: ("All" | VolunteerTimeWindow)[] = [
  "All",
  "Afternoon (13:00–17:30)",
  "Evening (17:30–21:00)",
  "Friday Midday (12:00–14:30)",
  "Flexible Anytime",
];

export default function VolunteerSchedulerPage() {
  const { state, claimVolunteerTask, releaseVolunteerTask } = useLicStore();

  const [selectedDay, setSelectedDay] = useState<"All" | VolunteerDayCategory>("All");
  const [selectedTime, setSelectedTime] = useState<"All" | VolunteerTimeWindow>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Claimed">("All");

  // Claim Shift Form State (per task)
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerWhatsApp, setVolunteerWhatsApp] = useState("");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const filteredTasks = state.volunteerTasks.filter((task) => {
    if (selectedDay !== "All" && task.dayFilter !== selectedDay) return false;
    if (selectedTime !== "All" && task.timeFilter !== selectedTime) return false;
    if (statusFilter !== "All" && task.status !== statusFilter) return false;
    return true;
  });

  const openCount = state.volunteerTasks.filter((t) => t.status === "Open").length;
  const claimedCount = state.volunteerTasks.filter(
    (t) => t.status === "Claimed"
  ).length;

  const handleClaimSubmit = (e: React.FormEvent, taskId: string, taskTitle: string) => {
    e.preventDefault();
    if (!volunteerName.trim() || !volunteerWhatsApp.trim()) return;

    claimVolunteerTask(taskId, volunteerName.trim(), volunteerWhatsApp.trim());
    setBannerMsg(
      `JazakAllah Khair, ${volunteerName.trim()}! You have claimed "${taskTitle}". A WhatsApp confirmation has been logged for ${volunteerWhatsApp.trim()}.`
    );
    setClaimingTaskId(null);
    setVolunteerName("");
    setVolunteerWhatsApp("");
  };

  const handleRelease = (taskId: string, taskTitle: string) => {
    releaseVolunteerTask(taskId);
    setBannerMsg(
      `Shift released: "${taskTitle}" is now back on the Open Tasks board for another community member to claim.`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <HandHeart className="w-4 h-4" />
            <span>Module 10 • Self-Serve Micro-Volunteering Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Flexible Volunteer &ldquo;Pick-a-Task&rdquo; Scheduler
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Support Langley Islamic Centre with zero long-term lock-in. Filter by your day or time availability, tap <strong>&ldquo;Claim Shift&rdquo;</strong> with your Name &amp; WhatsApp number, or use the 1-tap <strong>&ldquo;Release Shift&rdquo;</strong> option anytime if your plans change.
          </p>
        </div>

        {/* Live Shift Counter Summary */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#F0F7FC] border-2 border-[#D0E6F7] rounded-2xl px-5 py-3.5 text-center">
            <div className="text-xs font-extrabold uppercase text-slate-500">
              Open Shifts
            </div>
            <div className="text-3xl font-black text-[#009FE3]">{openCount}</div>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl px-5 py-3.5 text-center">
            <div className="text-xs font-extrabold uppercase text-emerald-800">
              Claimed Shifts
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {claimedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bannerMsg}</span>
          </div>
          <button
            onClick={() => setBannerMsg(null)}
            className="text-xs underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Day & Time Availability Filter Bar */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#005A9C]">
            <Filter className="w-4 h-4 text-[#009FE3]" />
            <span>Filter by Day &amp; Time Availability</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(["All", "Open", "Claimed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-[#005A9C] text-white"
                    : "bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7]"
                }`}
              >
                {st === "All" ? "All Tasks" : `${st} Only`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Day Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Day Availability:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_FILTERS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    selectedDay === day
                      ? "bg-[#005A9C] text-white border-[#005A9C]"
                      : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time Window Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Time Window Availability:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_FILTERS.map((tm) => (
                <button
                  key={tm}
                  type="button"
                  onClick={() => setSelectedTime(tm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    selectedTime === tm
                      ? "bg-[#009FE3] text-white border-[#009FE3]"
                      : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                  }`}
                >
                  {tm}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const isClaimed = task.status === "Claimed";
          const isClaimingThis = claimingTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl border-2 p-6 shadow-sm flex flex-col justify-between transition ${
                isClaimed
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-[#D0E6F7] hover:border-[#009FE3]"
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7] font-extrabold text-xs">
                    {task.category}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      isClaimed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-sky-100 text-[#005A9C] border border-sky-300"
                    }`}
                  >
                    {isClaimed ? "✓ Shift Claimed" : "Open Shift — Available"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-black text-[#005A9C]">
                  {task.title}
                </h2>

                {/* Schedule & Location Meta */}
                <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1 text-[#009FE3]">
                    <Calendar className="w-3.5 h-3.5" />
                    {task.scheduleLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#005A9C]" />
                    {task.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {task.location}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* Bottom Action Area: Claim Shift vs 1-Tap Release Shift */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {isClaimed ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Claimed by: {task.claimedByName}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                        WhatsApp: {task.claimedByWhatsApp} • {task.claimedAt}
                      </div>
                    </div>

                    {/* 1-Tap Release Shift Button */}
                    <button
                      type="button"
                      onClick={() => handleRelease(task.id, task.title)}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 transition shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Release Shift</span>
                    </button>
                  </div>
                ) : isClaimingThis ? (
                  <form
                    onSubmit={(e) => handleClaimSubmit(e, task.id, task.title)}
                    className="p-4 rounded-2xl bg-[#F0F7FC] border-2 border-[#009FE3] space-y-3"
                  >
                    <div className="text-xs font-extrabold text-[#005A9C]">
                      Claim Shift: {task.title}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#005A9C] mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={volunteerName}
                          onChange={(e) => setVolunteerName(e.target.value)}
                          placeholder="e.g. Tariq Mahmood"
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#005A9C] mb-1">
                          WhatsApp Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={volunteerWhatsApp}
                          onChange={(e) => setVolunteerWhatsApp(e.target.value)}
                          placeholder="07700 900XXX"
                          className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 h-10 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs inline-flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#009FE3]" />
                        <span>Confirm &amp; Claim Shift</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setClaimingTaskId(null)}
                        className="px-4 h-10 rounded-xl bg-white border border-slate-300 text-slate-600 font-bold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setClaimingTaskId(task.id)}
                    className="w-full h-12 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm shadow-sm inline-flex items-center justify-center gap-2 transition active:scale-[0.99]"
                  >
                    <HandHeart className="w-4 h-4 text-[#009FE3]" />
                    <span>Claim Shift (Name &amp; WhatsApp)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
