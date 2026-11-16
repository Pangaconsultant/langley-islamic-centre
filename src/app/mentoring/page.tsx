"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  UserCheck,
  Filter,
  Sparkles,
} from "lucide-react";
import { useLicStore, Mentor, MentorSector } from "@/lib/db";

const SECTORS: ("All" | MentorSector)[] = [
  "All",
  "GCSE/A-Level Tutoring",
  "Tech/AI",
  "Medicine",
  "Engineering",
  "Apprenticeships",
];

export default function MentoringPortalPage() {
  const { state, submitMentoringRequest } = useLicStore();
  const [selectedSector, setSelectedSector] = useState<"All" | MentorSector>("All");
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);

  // 1-to-1 Booking Form State
  const [studentName, setStudentName] = useState("");
  const [isUnder18, setIsUnder18] = useState(true);
  const [studentYearGroup, setStudentYearGroup] = useState("Year 11 (GCSE)");
  const [goalDescription, setGoalDescription] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [safeguardingConsent, setSafeguardingConsent] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);

  const filteredMentors =
    selectedSector === "All"
      ? state.mentors
      : state.mentors.filter((m) => m.sector === selectedSector);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentor) return;
    if (isUnder18 && (!parentName.trim() || !parentPhone.trim() || !safeguardingConsent)) {
      return;
    }

    submitMentoringRequest({
      mentorId: activeMentor.id,
      mentorName: activeMentor.name,
      studentName: studentName.trim(),
      isUnder18,
      studentYearGroup,
      goalDescription: goalDescription.trim(),
      parentName: isUnder18 ? parentName.trim() : "Adult Applicant (18+)",
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      safeguardingConsent: isUnder18 ? safeguardingConsent : true,
    });

    setBookingConfirmed(activeMentor.name);
    setStudentName("");
    setGoalDescription("");
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setSafeguardingConsent(false);
    setActiveMentor(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <GraduationCap className="w-4 h-4" />
            <span>Module 03 • Study Support, Careers &amp; Employability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Youth Hub &amp; Careers Mentoring Network
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Connecting SL3 young people and students with Enhanced DBS-verified community professionals across GCSE/A-Level Tutoring, Tech/AI, Medicine, Engineering, and Degree Apprenticeships.
          </p>
        </div>

        <div className="bg-[#F0F7FC] border border-[#D0E6F7] rounded-2xl p-4 flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-emerald-800">
              100% Safeguarding Vetted
            </div>
            <div className="text-sm font-bold text-[#005A9C]">
              All Mentors Enhanced DBS Checked
            </div>
            <div className="text-xs text-slate-500">
              Mandatory Parent/Guardian Consent for Under-18s
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Banner if just submitted */}
      {bookingConfirmed && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 flex items-center justify-between gap-4 text-emerald-950">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base">
                1-to-1 Mentoring Session Request Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800">
                Your session request with <strong>{bookingConfirmed}</strong> has been logged. Our Youth Hub Coordinator will confirm the slot with the parent/guardian shortly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookingConfirmed(null)}
            className="text-xs font-bold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sector Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#D0E6F7] p-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#005A9C] mr-2">
          <Filter className="w-4 h-4 text-[#009FE3]" />
          <span>Filter by Sector / Subject:</span>
        </div>
        {SECTORS.map((sec) => {
          const active = selectedSector === sec;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(sec)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                active
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "bg-[#F0F7FC] text-[#005A9C] hover:bg-[#009FE3]/15 border border-[#D0E6F7]"
              }`}
            >
              {sec}
            </button>
          );
        })}
      </div>

      {/* Directory Grid + 1-to-1 Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Mentor Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMentors.map((mentor) => {
            const isSelected = activeMentor?.id === mentor.id;
            return (
              <div
                key={mentor.id}
                className={`bg-white rounded-2xl border-2 p-6 shadow-sm flex flex-col justify-between transition ${
                  isSelected
                    ? "border-[#009FE3] ring-2 ring-[#009FE3]/20"
                    : "border-[#D0E6F7] hover:border-[#009FE3]"
                }`}
              >
                <div>
                  {/* Top Row: Sector Tag + DBS Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F0F7FC] text-[#005A9C] font-extrabold text-xs border border-[#D0E6F7]">
                      {mentor.sector}
                    </span>
                    {mentor.dbsVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        DBS Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-[#005A9C]">
                    {mentor.name}
                  </h3>
                  <p className="text-xs font-bold text-[#009FE3] mt-0.5">
                    {mentor.role}
                  </p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {mentor.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {mentor.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#009FE3]" />
                      {mentor.availability}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ref: {mentor.dbsCertRef}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMentor(mentor)}
                    className="w-full py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <UserCheck className="w-4 h-4 text-[#009FE3]" />
                    <span>Request 1-to-1 Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-to-1 Session Request Form Panel */}
        <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 shadow-md sticky top-24">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>1-to-1 Mentoring Booking</span>
          </div>
          <h2 className="text-xl font-black text-[#005A9C]">
            {activeMentor
              ? `Book with ${activeMentor.name}`
              : "Request a 1-to-1 Session"}
          </h2>
          <p className="text-xs text-slate-600 mt-1 mb-4">
            {activeMentor
              ? `${activeMentor.sector} • ${activeMentor.availability}`
              : "Select any DBS-Verified mentor card on the left to populate your booking."}
          </p>

          {!activeMentor && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs text-[#005A9C] font-semibold">
              Tap <strong>&ldquo;Request 1-to-1 Session&rdquo;</strong> on a mentor card to select your mentor, or choose below:
              <select
                className="mt-2 w-full p-2.5 rounded-lg bg-white border border-[#D0E6F7] font-bold text-[#005A9C]"
                value=""
                onChange={(e) => {
                  const found = state.mentors.find((m) => m.id === e.target.value);
                  if (found) setActiveMentor(found);
                }}
              >
                <option value="" disabled>
                  -- Select a DBS-Verified Mentor --
                </option>
                {state.mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sector})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#005A9C] mb-1">
                Student / Mentee Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rayan Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#005A9C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#005A9C] mb-1">
                  Age Category *
                </label>
                <select
                  value={isUnder18 ? "under18" : "adult"}
                  onChange={(e) => setIsUnder18(e.target.value === "under18")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                >
                  <option value="under18">Under 18 (Safeguarded)</option>
                  <option value="adult">18+ Young Adult</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#005A9C] mb-1">
                  School Year / Stage *
                </label>
                <select
                  value={studentYearGroup}
                  onChange={(e) => setStudentYearGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                >
                  <option>Year 9 / Year 10</option>
                  <option>Year 11 (GCSE)</option>
                  <option>Year 12 / 13 (A-Level)</option>
                  <option>University / Graduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#005A9C] mb-1">
                Subject / Career Goal *
              </label>
              <textarea
                rows={2}
                required
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="Describe topics (e.g., GCSE Maths higher paper, UCAT prep, CV review)..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#005A9C]"
              />
            </div>

            {/* Mandatory Parent/Guardian Contact Fields for Under-18s */}
            {isUnder18 && (
              <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border-2 border-[#009FE3]/40 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#005A9C]">
                  <ShieldCheck className="w-4 h-4 text-[#009FE3]" />
                  <span>Mandatory Parent / Guardian Contact (Under-18s)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    type="text"
                    required={isUnder18}
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Parent/Guardian Name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Parent / Guardian Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required={isUnder18}
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="07700 900XXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Parent / Guardian Email *
                  </label>
                  <input
                    type="email"
                    required={isUnder18}
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <label className="flex items-start gap-2 text-[11px] text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    required={isUnder18}
                    checked={safeguardingConsent}
                    onChange={(e) => setSafeguardingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#005A9C]"
                  />
                  <span>
                    I am the parent/legal guardian and consent to my child attending supervised mentoring at LIC Spitfire Close.
                  </span>
                </label>
              </div>
            )}

            {!isUnder18 && (
              <div>
                <label className="block text-xs font-bold text-[#005A9C] mb-1">
                  Your Contact Phone / Email *
                </label>
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="07700 900XXX or email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!activeMentor}
              className="w-full py-3.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 text-white font-black text-sm shadow-md transition"
            >
              {activeMentor
                ? `Submit Request for ${activeMentor.name}`
                : "Select a Mentor First"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
