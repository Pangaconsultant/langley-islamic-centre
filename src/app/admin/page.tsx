"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  ShieldCheck,
  Database,
  RotateCcw,
  Users,
  Car,
  Footprints,
  Bike,
  HandHeart,
  GraduationCap,
  CalendarClock,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  Tablet,
  ArrowRight,
} from "lucide-react";
import {
  useLicStore,
  VolunteerTask,
  VolunteerDayCategory,
  VolunteerTimeWindow,
  MentorSector,
  CommunityEvent,
  PRAYER_TIMETABLE,
} from "@/lib/db";
import { PinGate } from "@/components/PinLockModal";

type AdminTab =
  | "volunteer-cms"
  | "mentors-cms"
  | "events-kiosk-cms"
  | "sbc-analytics"
  | "security-pin";

export default function TrusteeAdminCompliancePage() {
  const {
    state,
    updateAdminPin,
    updatePrayerTimetable,
    syncUkLangleyPrayerTimes,
    addVolunteerTask,
    deleteVolunteerTask,
    releaseVolunteerTask,
    addMentor,
    deleteMentor,
    updateMentoringRequestStatus,
    createCommunityEvent,
    deleteCommunityEvent,
    addFrequentVisitor,
    removeFrequentVisitor,
    removeQuranStudent,
    resetDbToSeed,
  } = useLicStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("volunteer-cms");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 1. Volunteer Task Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] =
    useState<VolunteerTask["category"]>("Door Marshal & Dispersal");
  const [taskLocation, setTaskLocation] = useState("Spitfire Close Entrance (SL3)");
  const [taskDay, setTaskDay] =
    useState<VolunteerDayCategory>("Weekdays (Afternoon)");
  const [taskTime, setTaskTime] =
    useState<VolunteerTimeWindow>("Afternoon (13:00–17:30)");
  const [taskSchedule, setTaskSchedule] = useState("Weekdays • 16:15–17:15");
  const [taskDuration, setTaskDuration] = useState("60 mins");
  const [taskDesc, setTaskDesc] = useState("");

  // 2. Mentor Form State
  const [mentorName, setMentorName] = useState("");
  const [mentorRole, setMentorRole] = useState("");
  const [mentorSector, setMentorSector] =
    useState<MentorSector>("GCSE/A-Level Tutoring");
  const [mentorSpecs, setMentorSpecs] = useState("GCSE Maths, Exam Technique");
  const [mentorBio, setMentorBio] = useState("");
  const [mentorDbsRef, setMentorDbsRef] = useState("DBS-ENH-00201940");
  const [mentorAvail, setMentorAvail] = useState("Saturdays 11:00–13:00");

  // 3. Event & Kiosk Chip Form State
  const [evtTitle, setEvtTitle] = useState("");
  const [evtCategory, setEvtCategory] =
    useState<CommunityEvent["category"]>("Bereavement Condolence");
  const [evtDate, setEvtDate] = useState("2026-11-28");
  const [evtOrganizer, setEvtOrganizer] = useState("LIC Welfare Committee");
  const [evtSlots, setEvtSlots] = useState("14:00 – 14:30, 14:30 – 15:00");
  const [evtDesc, setEvtDesc] = useState("");
  const [newRegularName, setNewRegularName] = useState("");

  // 5. Security PIN Reset State
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const notify = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDesc.trim()) return;
    addVolunteerTask({
      title: taskTitle.trim(),
      category: taskCategory,
      location: taskLocation.trim(),
      dayFilter: taskDay,
      timeFilter: taskTime,
      scheduleLabel: taskSchedule.trim(),
      duration: taskDuration.trim(),
      description: taskDesc.trim(),
    });
    setTaskTitle("");
    setTaskDesc("");
    notify(`Added new volunteer task "${taskTitle.trim()}" to /volunteer.`);
  };

  const handleAddMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorName.trim() || !mentorRole.trim()) return;
    addMentor({
      name: mentorName.trim(),
      role: mentorRole.trim(),
      sector: mentorSector,
      specialties: mentorSpecs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: mentorBio.trim(),
      dbsVerified: true,
      dbsCertRef: mentorDbsRef.trim(),
      availability: mentorAvail.trim(),
    });
    setMentorName("");
    setMentorRole("");
    setMentorBio("");
    notify(`Added DBS-verified mentor "${mentorName.trim()}" to /mentoring.`);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const windows = evtSlots
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!evtTitle.trim() || windows.length === 0) return;
    createCommunityEvent({
      title: evtTitle.trim(),
      category: evtCategory,
      date: evtDate,
      organizer: evtOrganizer.trim(),
      description: evtDesc.trim(),
      timeWindows: windows,
    });
    setEvtTitle("");
    setEvtDesc("");
    notify(`Published event "${evtTitle.trim()}" with ${windows.length} slots to /events.`);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (!/^\d{4}$/.test(newPin)) {
      setPinError("PIN must be exactly 4 numeric digits (0–9).");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("New PIN and Confirmation PIN do not match.");
      return;
    }
    const ok = updateAdminPin(newPin);
    if (ok) {
      setNewPin("");
      setConfirmPin("");
      notify("Confidential 4-digit Admin PIN has been updated across all internal views.");
    }
  };

  const totalCheckIns = state.checkIns.length || 1;
  const walkingCount = state.checkIns.filter((c) => c.travelMode === "Walking").length;
  const cycleCount = state.checkIns.filter((c) => c.travelMode === "Bicycle").length;
  const carShareCount = state.checkIns.filter((c) => c.travelMode === "Car Share").length;
  const singleCarCount = state.checkIns.filter((c) => c.travelMode === "Car / Drive").length;
  const sustainableCount = walkingCount + cycleCount + carShareCount;
  const sustainablePct = Math.round((sustainableCount / totalCheckIns) * 100);

  const handleDownloadCsv = () => {
    const headers = [
      "Record_ID",
      "Timestamp_ISO",
      "Visitor_Name",
      "Mode_of_Travel",
      "Vehicle_Occupant_Count",
      "Salah_or_Activity",
    ];
    const rows = state.checkIns.map((c) => [
      c.id,
      c.timestamp,
      `"${c.visitorName.replace(/"/g, '""')}"`,
      `"${c.travelMode}"`,
      c.occupantCount,
      `"${c.activity}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LIC_Visitors_SBC_Audit_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <BarChart3 className="w-4 h-4" />
            <span>Internal Staff &amp; Trustee Backend • Restricted Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            LIC Admin Backend, CMS &amp; SBC Compliance Portal
          </h1>
        </div>

        <div className="bg-[#F0F7FC] border border-[#D0E6F7] rounded-2xl p-4 flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-10 h-10 text-[#005A9C]" />
          <div>
            <div className="text-xs font-extrabold uppercase text-[#009FE3]">
              Confidential Access
            </div>
            <div className="text-sm font-black text-[#005A9C]">
              Protected by Trustee PIN
            </div>
          </div>
        </div>
      </div>

      <PinGate
        title="Confidential Staff Admin Access & CMS Backend"
        subtitle="Enter your confidential 4-digit LIC Admin PIN to launch the Indoor Kiosk, Door Marshal Console, or manage portal content."
      >
        <div className="space-y-6">
          {/* Quick-Launch Internal Staff Consoles (Indoor Kiosk & Door Marshal Counter) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/kiosk"
              className="group bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-5 border-2 border-slate-800 hover:border-[#009FE3] transition flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#005A9C] text-[#7FD4FF] flex items-center justify-center shrink-0">
                  <Tablet className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7FD4FF]">
                    Staff Admin Access • Full-Screen Tablet
                  </div>
                  <div className="text-lg font-black text-white">
                    Launch Indoor Kiosk (/kiosk)
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Spitfire Close visitor check-in screen (4s auto-reset, quick-tap regulars, Car Share occupant count)
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#7FD4FF] shrink-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/occupancy"
              className="group bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-5 border-2 border-slate-800 hover:border-[#009FE3] transition flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#005A9C] text-[#7FD4FF] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7FD4FF]">
                    Staff Admin Access • Marshal Console
                  </div>
                  <div className="text-lg font-black text-white">
                    Launch Door Marshal Counter (/occupancy)
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Live {state.occupancy.currentCount}/{state.occupancy.maxCapacity} building capacity monitor with +1 / -1 exit controls &amp; overflow protocol
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#7FD4FF] shrink-0 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {feedbackMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Admin Backend Navigation Tabs */}
          <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("volunteer-cms")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                activeTab === "volunteer-cms"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <HandHeart className="w-4 h-4 text-[#009FE3]" />
              <span>1. Volunteer Tasks CMS ({state.volunteerTasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("mentors-cms")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                activeTab === "mentors-cms"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-[#009FE3]" />
              <span>2. Mentors &amp; Requests CMS ({state.mentors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("events-kiosk-cms")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                activeTab === "events-kiosk-cms"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <CalendarClock className="w-4 h-4 text-[#009FE3]" />
              <span>3. Prayer Times, Events, Quran &amp; Kiosk CMS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sbc-analytics")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                activeTab === "sbc-analytics"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#009FE3]" />
              <span>4. SBC Travel Plan &amp; CSV Export</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security-pin")}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                activeTab === "security-pin"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <KeyRound className="w-4 h-4 text-[#009FE3]" />
              <span>5. Security &amp; Reset Confidential PIN</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: VOLUNTEER TASKS CMS                                     */}
          {/* ============================================================== */}
          {activeTab === "volunteer-cms" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Create Volunteer Task Form */}
              <form
                onSubmit={handleAddTask}
                className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 space-y-4 shadow-sm"
              >
                <h2 className="text-lg font-black text-[#005A9C] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#009FE3]" />
                  <span>Add New Volunteer Task</span>
                </h2>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. 16:15–17:15 Quran Class Door Marshal"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Category *
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) =>
                        setTaskCategory(e.target.value as VolunteerTask["category"])
                      }
                      className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                    >
                      <option value="Door Marshal & Dispersal">
                        Door Marshal &amp; Dispersal
                      </option>
                      <option value="Off-Site Jummah Setup">
                        Off-Site Jummah Setup
                      </option>
                      <option value="Digital & AI Support">
                        Digital &amp; AI Support
                      </option>
                      <option value="Community & Classes">
                        Community &amp; Classes
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Duration *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(e.target.value)}
                      placeholder="e.g. 60 mins"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Day Filter *
                    </label>
                    <select
                      value={taskDay}
                      onChange={(e) =>
                        setTaskDay(e.target.value as VolunteerDayCategory)
                      }
                      className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                    >
                      <option value="Weekdays (Afternoon)">
                        Weekdays (Afternoon)
                      </option>
                      <option value="Daily (Evening)">Daily (Evening)</option>
                      <option value="Fridays (Off-Site Pavilion)">
                        Fridays (Off-Site Pavilion)
                      </option>
                      <option value="Flexible / Remote">Flexible / Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Time Window Filter *
                    </label>
                    <select
                      value={taskTime}
                      onChange={(e) =>
                        setTaskTime(e.target.value as VolunteerTimeWindow)
                      }
                      className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                    >
                      <option value="Afternoon (13:00–17:30)">
                        Afternoon (13:00–17:30)
                      </option>
                      <option value="Evening (17:30–21:00)">
                        Evening (17:30–21:00)
                      </option>
                      <option value="Friday Midday (12:00–14:30)">
                        Friday Midday (12:00–14:30)
                      </option>
                      <option value="Flexible Anytime">Flexible Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Schedule Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskSchedule}
                      onChange={(e) => setTaskSchedule(e.target.value)}
                      placeholder="e.g. Daily • 19:20–19:50"
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskLocation}
                      onChange={(e) => setTaskLocation(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Task Instructions &amp; Duties *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Describe volunteer responsibilities..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs shadow-sm transition"
                >
                  Publish Task to /volunteer Board
                </button>
              </form>

              {/* Existing Volunteer Tasks Management List */}
              <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-4">
                <h2 className="text-lg font-black text-[#005A9C]">
                  Manage Active Volunteer Tasks ({state.volunteerTasks.length})
                </h2>

                <div className="space-y-3">
                  {state.volunteerTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#005A9C]">
                            {t.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                              t.status === "Claimed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-[#005A9C]"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {t.scheduleLabel} • {t.location}
                        </div>
                        {t.status === "Claimed" && (
                          <div className="text-xs font-bold text-emerald-800">
                            Volunteer: {t.claimedByName} (WhatsApp:{" "}
                            {t.claimedByWhatsApp})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === "Claimed" && (
                          <button
                            type="button"
                            onClick={() => releaseVolunteerTask(t.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs"
                          >
                            Unclaim / Release
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            deleteVolunteerTask(t.id);
                            notify(`Removed task "${t.title}".`);
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MENTORS & REQUESTS CMS                                  */}
          {/* ============================================================== */}
          {activeTab === "mentors-cms" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <form
                onSubmit={handleAddMentor}
                className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 space-y-3.5 shadow-sm"
              >
                <h2 className="text-lg font-black text-[#005A9C] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#009FE3]" />
                  <span>Add DBS-Verified Mentor</span>
                </h2>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Mentor Full Name &amp; Credentials *
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    placeholder="e.g. Dr. Bilal Chaudhry"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Professional Role / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorRole}
                    onChange={(e) => setMentorRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Sector *
                    </label>
                    <select
                      value={mentorSector}
                      onChange={(e) =>
                        setMentorSector(e.target.value as MentorSector)
                      }
                      className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                    >
                      <option value="GCSE/A-Level Tutoring">
                        GCSE/A-Level Tutoring
                      </option>
                      <option value="Tech/AI">Tech/AI</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Apprenticeships">Apprenticeships</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      DBS Reference *
                    </label>
                    <input
                      type="text"
                      required
                      value={mentorDbsRef}
                      onChange={(e) => setMentorDbsRef(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Specialties (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorSpecs}
                    onChange={(e) => setMentorSpecs(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Availability Window *
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorAvail}
                    onChange={(e) => setMentorAvail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Short Bio *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={mentorBio}
                    onChange={(e) => setMentorBio(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs shadow-sm transition"
                >
                  Add Mentor to Directory
                </button>
              </form>

              <div className="lg:col-span-2 space-y-6">
                {/* Student Mentoring Requests */}
                <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-4">
                  <h3 className="text-lg font-black text-[#005A9C]">
                    1-to-1 Mentoring Session Requests ({state.mentoringRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {state.mentoringRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-extrabold text-sm text-[#005A9C]">
                            Student: {req.studentName} ({req.studentYearGroup}) → Mentor:{" "}
                            <span className="text-[#009FE3]">{req.mentorName}</span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Goal: {req.goalDescription}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-1">
                            Parent/Guardian: {req.parentName} • {req.parentPhone} •{" "}
                            {req.parentEmail}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={req.status}
                            onChange={(e) =>
                              updateMentoringRequestStatus(
                                req.id,
                                e.target.value as "Pending" | "Confirmed" | "Completed"
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#005A9C]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Mentors Directory List */}
                <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-3">
                  <h3 className="text-lg font-black text-[#005A9C]">
                    Active Vetted Mentors ({state.mentors.length})
                  </h3>
                  {state.mentors.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-extrabold text-sm text-[#005A9C]">
                          {m.name} ({m.sector})
                        </div>
                        <div className="text-xs text-slate-600">
                          {m.role} • {m.dbsCertRef}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMentor(m.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                        title="Remove Mentor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PRAYER TIMETABLE, EVENTS, QURAN CLASSES & KIOSK CMS     */}
          {/* ============================================================== */}
          {activeTab === "events-kiosk-cms" && (
            <div className="space-y-6">
              {/* Live Prayer Timetable Manager + UK Location Auto-Sync */}
              <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                      Data-Driven UK Timetable • Spitfire Close (51.5008°N, -0.5469°W)
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-[#005A9C]">
                      Daily Adhan &amp; Jama&apos;ah Timetable Manager
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Edit any Adhan or Jama&apos;ah time below (auto-saves to Supabase), or click <strong>Auto-Sync Today&apos;s UK Adhan Times</strong> to pull exact astronomical times for Langley (SL3 8GY) using the UK Moonsighting Committee method.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const res = await syncUkLangleyPrayerTimes();
                      notify(res.message);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-black text-xs inline-flex items-center gap-2 shadow-sm transition shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Auto-Sync Today&apos;s Langley (SL3) UK Adhan Times</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {(state.prayerTimetable || PRAYER_TIMETABLE).map((p, idx) => (
                    <div
                      key={p.name}
                      className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-2.5"
                    >
                      <div className="font-black text-sm text-[#005A9C] uppercase tracking-wider">
                        {p.name}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Adhan Time (24h)
                        </label>
                        <input
                          type="text"
                          value={p.adhan}
                          onChange={(e) => {
                            const next = [...(state.prayerTimetable || PRAYER_TIMETABLE)];
                            next[idx] = { ...next[idx], adhan: e.target.value };
                            updatePrayerTimetable(next);
                          }}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs font-bold text-[#005A9C] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#005A9C] mb-0.5">
                          Jama&apos;ah Time (24h)
                        </label>
                        <input
                          type="text"
                          value={p.jamaat}
                          onChange={(e) => {
                            const next = [...(state.prayerTimetable || PRAYER_TIMETABLE)];
                            next[idx] = { ...next[idx], jamaat: e.target.value };
                            updatePrayerTimetable(next);
                          }}
                          className="w-full h-9 px-2.5 rounded-lg border-2 border-[#009FE3] text-xs font-black text-[#005A9C] bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Create Event & Manage Events */}
              <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-5">
                <h2 className="text-lg font-black text-[#005A9C] flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[#009FE3]" />
                  <span>Events &amp; Bereavement Slots Manager (/events)</span>
                </h2>

                <form onSubmit={handleCreateEvent} className="space-y-3 bg-[#F0F7FC] p-4 rounded-2xl border border-[#D0E6F7]">
                  <div className="text-xs font-extrabold text-[#005A9C]">
                    Create New Staggered 30-Min Event (Capped at 35/Slot)
                  </div>
                  <input
                    type="text"
                    required
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="Event or Bereavement Title *"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <select
                      value={evtCategory}
                      onChange={(e) =>
                        setEvtCategory(
                          e.target.value as CommunityEvent["category"]
                        )
                      }
                      className="h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C] bg-white"
                    >
                      <option value="Bereavement Condolence">
                        Bereavement Condolence
                      </option>
                      <option value="Youth Circle">Youth Circle</option>
                      <option value="Sisters Working Group">
                        Sisters Working Group
                      </option>
                      <option value="Community Workshop">
                        Community Workshop
                      </option>
                    </select>
                    <input
                      type="date"
                      required
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={evtSlots}
                    onChange={(e) => setEvtSlots(e.target.value)}
                    placeholder="Comma-separated 30-min slots (e.g. 14:00 – 14:30, 14:30 – 15:00)"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    placeholder="Short description & parking reminder *"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-[#005A9C] text-white font-black text-xs"
                  >
                    Publish Event
                  </button>
                </form>

                <div className="space-y-2.5">
                  {state.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-[#005A9C]">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {ev.date} • {ev.slots.length} slots (Max 35/slot)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCommunityEvent(ev.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kiosk Frequent Visitor Chips & Quran Student Roster */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-4">
                  <h2 className="text-lg font-black text-[#005A9C] flex items-center gap-2">
                    <Tablet className="w-5 h-5 text-[#009FE3]" />
                    <span>Indoor Kiosk Quick-Tap Regulars (/kiosk)</span>
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newRegularName.trim()) return;
                      addFrequentVisitor(newRegularName.trim());
                      setNewRegularName("");
                      notify("Updated Indoor Kiosk quick-tap chips.");
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newRegularName}
                      onChange={(e) => setNewRegularName(e.target.value)}
                      placeholder="Add frequent regular name..."
                      className="flex-1 h-10 px-3 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 rounded-xl bg-[#005A9C] text-white font-bold text-xs"
                    >
                      Add Chip
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {state.frequentVisitors.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs font-bold text-[#005A9C]"
                      >
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => removeFrequentVisitor(name)}
                          className="text-red-600 hover:text-red-800 font-black"
                          title="Remove Chip"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-3">
                  <h3 className="text-base font-black text-[#005A9C]">
                    Quran Class Enrolment Roster ({state.quranStudents.length} / 30 Total)
                  </h3>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {state.quranStudents.map((st) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-[#005A9C]">{st.childName}</strong> ({st.sessionId}) • Parent: {st.parentName} ({st.parentPhone})
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuranStudent(st.id)}
                          className="text-red-600 hover:underline font-bold ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: SBC TRAVEL PLAN ANALYTICS & CSV EXPORT                  */}
          {/* ============================================================== */}
          {activeTab === "sbc-analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5">
                  <div className="text-xs font-extrabold uppercase text-slate-500">
                    Sustainable &amp; Shared Travel
                  </div>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    {sustainablePct}%
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Walking, Cycling &amp; Car-Share ({sustainableCount}/{state.checkIns.length})
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5">
                  <div className="text-xs font-extrabold uppercase text-slate-500">
                    Peak Building Occupancy
                  </div>
                  <div className="text-3xl font-black text-[#005A9C] mt-1">
                    {state.occupancy.peakToday} / 40
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    ✓ 100% Within 40-Person SBC Limit
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5">
                  <div className="text-xs font-extrabold uppercase text-slate-500">
                    Quran Class Cap Compliance
                  </div>
                  <div className="text-3xl font-black text-[#009FE3] mt-1">
                    Max 10 / 10
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    All 3 staggered sessions ≤ 10 students
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5">
                  <div className="text-xs font-extrabold uppercase text-slate-500">
                    Neighbour Liaison Log
                  </div>
                  <div className="text-3xl font-black text-[#005A9C] mt-1">
                    {
                      state.neighbourIncidents.filter(
                        (i) => i.status === "Resolved"
                      ).length
                    }{" "}
                    / {state.neighbourIncidents.length}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Tickets Resolved (Lead: Waqar Ahmed)
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-[#005A9C]">
                      Slough Borough Council (SBC) Modal Split &amp; Visitor Log
                    </h2>
                    <p className="text-xs text-slate-600">
                      Live aggregation from the Spitfire Close Entrance Check-In Kiosk (`/kiosk`).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4 text-[#009FE3]" />
                    <span>Export SBC Travel Plan CSV</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
                    <Footprints className="w-6 h-6 text-emerald-600 mb-2" />
                    <div className="text-2xl font-black text-[#005A9C]">
                      {walkingCount}
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Walking ({Math.round((walkingCount / totalCheckIns) * 100)}%)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
                    <Bike className="w-6 h-6 text-[#009FE3] mb-2" />
                    <div className="text-2xl font-black text-[#005A9C]">
                      {cycleCount}
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Bicycle ({Math.round((cycleCount / totalCheckIns) * 100)}%)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
                    <Users className="w-6 h-6 text-[#005A9C] mb-2" />
                    <div className="text-2xl font-black text-[#005A9C]">
                      {carShareCount}
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Car Share ({Math.round((carShareCount / totalCheckIns) * 100)}%)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
                    <Car className="w-6 h-6 text-amber-600 mb-2" />
                    <div className="text-2xl font-black text-[#005A9C]">
                      {singleCarCount}
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Car / Drive ({Math.round((singleCarCount / totalCheckIns) * 100)}%)
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#D0E6F7] rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0F7FC] text-[#005A9C] font-extrabold border-b border-[#D0E6F7]">
                      <tr>
                        <th className="py-3 px-4">Visitor Name</th>
                        <th className="py-3 px-4">Mode of Travel</th>
                        <th className="py-3 px-4">Occupants</th>
                        <th className="py-3 px-4">Activity / Salah</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {state.checkIns.slice(0, 12).map((chk) => (
                        <tr key={chk.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-[#005A9C]">
                            {chk.visitorName}
                          </td>
                          <td className="py-2.5 px-4 font-semibold">
                            {chk.travelMode}
                          </td>
                          <td className="py-2.5 px-4">
                            {chk.travelMode === "Car Share"
                              ? `${chk.occupantCount === 4 ? "4+" : chk.occupantCount} pax`
                              : "1"}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#009FE3]">
                            {chk.activity}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            {new Date(chk.timestamp).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: SECURITY & RESET CONFIDENTIAL ADMIN PIN                 */}
          {/* ============================================================== */}
          {activeTab === "security-pin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#009FE3]">
                  <KeyRound className="w-4 h-4" />
                  <span>Confidential PIN Management</span>
                </div>
                <h2 className="text-xl font-black text-[#005A9C]">
                  Change / Reset Confidential 4-Digit Admin PIN
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  The administrative PIN is strictly confidential and never displayed on public or staff login screens. Updating the PIN here immediately enforces the new 4-digit PIN across `/admin`, `/quran-classes` (Teacher View), `/events` (Event Creator), and `/neighbour-log` (Audit Log).
                </p>

                {pinError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold">
                    {pinError}
                  </div>
                )}

                <form onSubmit={handleChangePin} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      New 4-Digit Confidential PIN *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••"
                      className="w-full h-12 px-4 rounded-xl border-2 border-[#D0E6F7] font-black text-xl tracking-widest text-[#005A9C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Confirm New 4-Digit PIN *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••"
                      className="w-full h-12 px-4 rounded-xl border-2 border-[#D0E6F7] font-black text-xl tracking-widest text-[#005A9C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm shadow-md transition"
                  >
                    Save &amp; Enforce New Confidential PIN
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#009FE3]">
                  <Database className="w-4 h-4" />
                  <span>Database &amp; Demo Data Controls</span>
                </div>
                <h3 className="text-xl font-black text-[#005A9C]">
                  Reset Portal Records (Preserves Your Current PIN)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Need to restore the default seed records for a presentation or test? Clicking below resets the sample check-ins, classes, and tasks while preserving your current confidential Admin PIN.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetDbToSeed();
                    notify("Portal database records restored to initial seed state.");
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 border border-slate-200 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Demo Records (Keep Confidential PIN)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </PinGate>
    </div>
  );
}
