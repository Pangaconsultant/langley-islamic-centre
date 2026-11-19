"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  BellRing,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  Clock,
  Check,
  MessageSquareShare,
  Sparkles,
  Search,
  Calendar,
  MapPin,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
} from "lucide-react";
import {
  useLicStore,
  QuranSessionId,
  AttendanceStatus,
  TravelMode,
  QuranPreferredDays,
  QuranReadingLevel,
  QuranLearningDuration,
  QuranAdmissionStatus,
} from "@/lib/db";
import { PinGate } from "@/components/PinLockModal";

const ATTENDANCE_OPTIONS: AttendanceStatus[] = [
  "Present",
  "Late",
  "Absent",
  "Picked Up",
];

const YEAR_GROUP_OPTIONS = [
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
  "Year 12",
  "Year 13",
  "Other",
];

const READING_LEVEL_OPTIONS: {
  level: QuranReadingLevel;
  recommendedSession: QuranSessionId;
  tierName: string;
  desc: string;
}[] = [
  {
    level: "Learning Arabic letters",
    recommendedSession: "session-1",
    tierName: "Beginner (4:30pm – 5:30pm)",
    desc: "Starting letter recognition, Makharij (pronunciation points) & basic vowels.",
  },
  {
    level: "Qaida / Noorani Qaida",
    recommendedSession: "session-1",
    tierName: "Beginner (4:30pm – 5:30pm)",
    desc: "Currently completing Noorani/Qaidah lessons and joining letters.",
  },
  {
    level: "Can read basic Quran",
    recommendedSession: "session-2",
    tierName: "Intermediate (5:30pm – 6:30pm)",
    desc: "Completed Qaida; building fluency in Nazira Quran reading & core Tajweed.",
  },
  {
    level: "Can read Quran fluently",
    recommendedSession: "session-3",
    tierName: "Advanced (6:30pm – 7:30pm)",
    desc: "Reads Quran fluently; focusing on advanced Tajweed rules & recitation.",
  },
  {
    level: "Quran with Tajweed",
    recommendedSession: "session-3",
    tierName: "Advanced (6:30pm – 7:30pm)",
    desc: "Advanced Nazira recitation applying full Ahkam al-Tajweed.",
  },
  {
    level: "Hifz / Memorisation",
    recommendedSession: "session-3",
    tierName: "Advanced (6:30pm – 7:30pm)",
    desc: "Note: Full Hifz is not currently offered; placed in Advanced Nazira & Tajweed.",
  },
  {
    level: "Other",
    recommendedSession: "session-1",
    tierName: "Assessed by Teacher",
    desc: "Level will be determined during the initial 1-to-1 Teacher Assessment.",
  },
];

const DURATION_OPTIONS: QuranLearningDuration[] = [
  "Less than 6 months",
  "6 months – 1 year",
  "1–2 years",
  "2–3 years",
  "3+ years",
];

const OFFICIAL_DECLARATIONS = [
  "I understand that submitting this registration form is an expression of interest and does not guarantee a place in the Quran classes.",
  "I understand that my child's registration will only be confirmed after an assessment by the teacher and confirmation from LIC / Maktab.",
  "I understand that my child may be placed in a different level (Beginner / Intermediate / Advanced) or session depending on the teacher's assessment and availability.",
  "I understand that the fee is £40 per child per month (payable by Standing Order set up by the 28th of the previous month once a place is confirmed).",
  "I understand that payment will only be requested once registration is confirmed and that Standing Order instructions will be provided by LIC.",
  "I confirm that the information provided in this form is accurate and complete, and I agree to follow LIC's Spitfire Close parking & non-idling rules (parking at Common Rd, Harvey Park, or Harrow Market).",
];

function buildUkWhatsAppLink(rawPhone: string, message: string): string {
  const digits = (rawPhone || "").replace(/\D/g, "");
  let intl = digits;
  if (digits.startsWith("07") && digits.length === 11) {
    intl = "44" + digits.slice(1);
  } else if (digits.startsWith("0") && digits.length >= 10) {
    intl = "44" + digits.slice(1);
  }
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export default function QuranClassesPage() {
  const {
    state,
    updateStudentAttendance,
    triggerPickupAlert,
    enrollQuranStudent,
    updateQuranStudentAdmission,
  } = useLicStore();

  const [activeTab, setActiveTab] = useState<
    "register" | "track" | "teacher"
  >("register");
  const [teacherSubTab, setTeacherSubTab] = useState<
    "attendance" | "admissions"
  >("attendance");
  const [selectedSessionId, setSelectedSessionId] =
    useState<QuranSessionId>("session-1");
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // ==========================================================================
  // 5-STEP STATE-OF-THE-ART REGISTRATION WIZARD STATE
  // ==========================================================================
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Student Details
  const [childName, setChildName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("2016-05-15");
  const [childAge, setChildAge] = useState(10);
  const [schoolYearGroup, setSchoolYearGroup] = useState("Year 5");
  const [customYearGroup, setCustomYearGroup] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [postcode, setPostcode] = useState("SL3 ");
  const [medicalOrAllergies, setMedicalOrAllergies] = useState("");

  // Step 2: Parent / Guardian Details
  const [parentName, setParentName] = useState("");
  const [relationshipToStudent, setRelationshipToStudent] = useState<
    "Father" | "Mother" | "Guardian" | "Other"
  >("Father");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [alternativeContactPhone, setAlternativeContactPhone] = useState("");

  // Step 3: Quran Learning Details
  const [currentQuranLevel, setCurrentQuranLevel] =
    useState<QuranReadingLevel>("Qaida / Noorani Qaida");
  const [learningDuration, setLearningDuration] =
    useState<QuranLearningDuration>("6 months – 1 year");
  const [attendingOtherMaktab, setAttendingOtherMaktab] = useState(false);
  const [otherMaktabDetails, setOtherMaktabDetails] = useState("");
  const [previouslyAssessedByLic, setPreviouslyAssessedByLic] = useState(false);

  // Step 4: Preferred Days, Level & Sustainable Travel
  const [preferredDays, setPreferredDays] =
    useState<QuranPreferredDays>("Monday – Wednesday");
  const [enrollSessionId, setEnrollSessionId] =
    useState<QuranSessionId>("session-1");
  const [travelMode, setTravelMode] = useState<TravelMode>("Walking");

  // Step 5: Official 6-Point LIC Parent Declaration & Digital Signature
  const [checkedDeclarations, setCheckedDeclarations] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Submission Confirmation State
  const [submittedApplication, setSubmittedApplication] = useState<{
    referenceNo: string;
    childName: string;
    recommendedTier: string;
    preferredDays: QuranPreferredDays;
    status: QuranAdmissionStatus;
  } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  // Application Tracker Search State
  const [lookupQuery, setLookupQuery] = useState("");

  // Auto-calculate Age & UK School Year Group when DOB changes
  const handleDobChange = (dobStr: string) => {
    setDateOfBirth(dobStr);
    const dob = new Date(dobStr);
    if (!isNaN(dob.getTime())) {
      const diffMs = Date.now() - dob.getTime();
      const calculatedAge = Math.max(
        5,
        Math.min(18, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)))
      );
      setChildAge(calculatedAge);
      const ukYear = Math.max(3, Math.min(13, calculatedAge - 4));
      setSchoolYearGroup(`Year ${ukYear}`);
    }
  };

  // Auto-select recommended session when reading level changes
  const handleReadingLevelChange = (lvl: QuranReadingLevel) => {
    setCurrentQuranLevel(lvl);
    const match = READING_LEVEL_OPTIONS.find((r) => r.level === lvl);
    if (match) {
      setEnrollSessionId(match.recommendedSession);
    }
  };

  const allDeclarationsChecked = checkedDeclarations.every(Boolean);

  const toggleAllDeclarations = () => {
    const nextVal = !allDeclarationsChecked;
    setCheckedDeclarations( OFFICIAL_DECLARATIONS.map(() => nextVal) );
  };

  const validateAndAdvance = (targetStep: 1 | 2 | 3 | 4 | 5) => {
    setStepError(null);
    if (targetStep > 1 && !childName.trim()) {
      setStepError("Please enter the Student's Full Name.");
      return;
    }
    if (targetStep > 1 && (!homeAddress.trim() || !postcode.trim())) {
      setStepError("Please enter the Student's Home Address and Postcode.");
      return;
    }
    if (
      targetStep > 2 &&
      (!parentName.trim() || !parentPhone.trim() || !parentEmail.trim())
    ) {
      setStepError(
        "Please complete Parent Full Name, Mobile Number, and Email Address."
      );
      return;
    }
    setWizardStep(targetStep);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    if (!allDeclarationsChecked) {
      setStepError(
        "Please tick all 6 mandatory LIC Maktab Parent Declarations & Parking Pledges."
      );
      return;
    }
    if (!digitalSignature.trim()) {
      setStepError(
        "Please type the Parent/Guardian Full Name as your Digital Signature."
      );
      return;
    }

    const finalYearGroup =
      schoolYearGroup === "Other"
        ? customYearGroup.trim() || "Other"
        : schoolYearGroup;

    const res = enrollQuranStudent({
      sessionId: enrollSessionId,
      childName: childName.trim(),
      dateOfBirth,
      age: Number(childAge),
      schoolYearGroup: finalYearGroup,
      homeAddress: homeAddress.trim(),
      postcode: postcode.trim().toUpperCase(),
      medicalOrAllergies: medicalOrAllergies.trim() || "None reported",
      parentName: parentName.trim(),
      relationshipToStudent,
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      alternativeContactPhone: alternativeContactPhone.trim(),
      currentQuranLevel,
      learningDuration,
      attendingOtherMaktab,
      otherMaktabDetails: otherMaktabDetails.trim(),
      previouslyAssessedByLic,
      preferredDays,
      travelMode,
      parkingRulesAccepted: true,
      digitalSignature: digitalSignature.trim(),
      signatureDate,
      admissionStatus: "Assessment Pending",
    });

    if (res.ok && res.referenceNo) {
      const sesObj = state.quranSessions.find((s) => s.id === enrollSessionId);
      setSubmittedApplication({
        referenceNo: res.referenceNo,
        childName: childName.trim(),
        recommendedTier: sesObj?.title || "Beginner Level",
        preferredDays,
        status: res.status || "Assessment Pending",
      });
    }
  };

  const activeSession =
    state.quranSessions.find((s) => s.id === selectedSessionId) ||
    state.quranSessions[0];

  const studentsInSelectedSession = state.quranStudents.filter(
    (s) => s.sessionId === selectedSessionId
  );

  const handleSendPickupAlert = async (sessionId: QuranSessionId) => {
    const ses = state.quranSessions.find((s) => s.id === sessionId);
    const students = state.quranStudents.filter(
      (s) => s.sessionId === sessionId
    );
    triggerPickupAlert(sessionId);

    try {
      const res = await fetch("/api/send-pickup-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionTitle: ses?.title,
          recipients: students.map((s) => ({
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            childName: s.childName,
          })),
        }),
      });
      const data = (await res.json()) as { mode?: string; message?: string };
      if (data.mode === "twilio_live") {
        setAlertBanner(`LIVE TWILIO DISPATCH: ${data.message}`);
        return;
      }
    } catch {
      // Fallback banner
    }

    setAlertBanner(
      `5-Minute Pickup Alert timestamp logged in Supabase for ${students.length} parents (${ses?.title}). Tap the green "WhatsApp Parent" button next to any student below to open a pre-filled WhatsApp message directly to their mobile, or add TWILIO_ACCOUNT_SID in Vercel for automated bulk delivery.`
    );
  };

  const filteredLookupStudents = lookupQuery.trim()
    ? state.quranStudents.filter(
        (s) =>
          s.childName.toLowerCase().includes(lookupQuery.toLowerCase()) ||
          s.parentName.toLowerCase().includes(lookupQuery.toLowerCase()) ||
          s.parentPhone.includes(lookupQuery.trim()) ||
          (s.referenceNo &&
            s.referenceNo.toLowerCase().includes(lookupQuery.toLowerCase()))
      )
    : state.quranStudents.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Official LIC Maktab Header & Mode Switcher */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <BookOpen className="w-4 h-4" />
            <span>
              Student Hub • Nazira Quran &amp; Tajweed (Boys Aged 7–16)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            LIC Maktab — Quran Classes &amp; Student Registration
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            <strong>Learn • Recite • Understand • Grow:</strong> Structured{" "}
            <strong>Nazira Quran &amp; Tajweed</strong> classes running 3 days a
            week (<strong>Mon–Wed</strong> or <strong>Thu–Sat</strong>) across{" "}
            <strong>Beginner (4:30–5:30pm)</strong>,{" "}
            <strong>Intermediate (5:30–6:30pm)</strong>, and{" "}
            <strong>Advanced (6:30–7:30pm)</strong> levels.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-[#F0F7FC] p-1.5 rounded-2xl border-2 border-[#D0E6F7] flex flex-wrap gap-1 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition inline-flex items-center gap-1.5 ${
              activeTab === "register"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C] hover:bg-white/60"
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#009FE3]" />
            <span>1. Student Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition inline-flex items-center gap-1.5 ${
              activeTab === "track"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C] hover:bg-white/60"
            }`}
          >
            <Search className="w-4 h-4 text-[#009FE3]" />
            <span>2. Track Application</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teacher")}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition inline-flex items-center gap-1.5 ${
              activeTab === "teacher"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C] hover:bg-white/60"
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-[#009FE3]" />
            <span>3. Teacher Register &amp; Assessments</span>
          </button>
        </div>
      </div>

      {/* 3 Level Tier Overview Cards (Beginner, Intermediate, Advanced) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {state.quranSessions.map((ses, idx) => {
          const count = state.quranStudents.filter(
            (s) => s.sessionId === ses.id
          ).length;
          const isFull = count >= ses.maxCapacity;
          const isSelected = selectedSessionId === ses.id;
          const officialHours =
            idx === 0
              ? "4:30pm – 5:30pm"
              : idx === 1
              ? "5:30pm – 6:30pm"
              : "6:30pm – 7:30pm";
          const levelBadge =
            idx === 0 ? "Beginner" : idx === 1 ? "Intermediate" : "Advanced";

          return (
            <div
              key={ses.id}
              onClick={() => {
                setSelectedSessionId(ses.id);
                setEnrollSessionId(ses.id);
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
                  <span>
                    {levelBadge}: {officialHours}
                  </span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    isFull
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {count} / {ses.maxCapacity}{" "}
                  {isFull ? "(Assessment Waitlist)" : "Active"}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-[#005A9C]">
                {ses.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cohorts: <strong>Mon–Wed</strong> or <strong>Thu–Sat</strong> •
                Teacher: <strong>{ses.ustadhName}</strong>
              </p>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    isFull ? "bg-amber-500" : "bg-[#009FE3]"
                  }`}
                  style={{
                    width: `${Math.min(100, (count / ses.maxCapacity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: STATE-OF-THE-ART 5-STEP STUDENT REGISTRATION WIZARD           */}
      {/* ==================================================================== */}
      {activeTab === "register" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: 5-Step Guided Registration Wizard */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-6">
            {submittedApplication ? (
              /* APPLICATION CONFIRMATION & 6-STAGE ADMISSIONS TRACKER */
              <div className="space-y-6 py-2">
                <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider">
                      Registration Expression of Interest Received
                    </span>
                    <span className="font-mono text-sm font-black bg-white px-3 py-1 rounded-xl border border-emerald-300 text-[#005A9C]">
                      Ref: {submittedApplication.referenceNo}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-emerald-950">
                    JazakAllah Khair! Application Logged for{" "}
                    {submittedApplication.childName}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                    Your registration has been saved to the LIC Maktab database
                    under status{" "}
                    <strong>{submittedApplication.status}</strong> for the{" "}
                    <strong>{submittedApplication.preferredDays}</strong> cohort
                    (Recommended tier:{" "}
                    <strong>{submittedApplication.recommendedTier}</strong>).
                  </p>
                </div>

                {/* Visual 5-Stage LIC Admissions Progress Pipeline */}
                <div className="bg-[#F0F7FC] rounded-2xl border border-[#D0E6F7] p-5 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#005A9C]">
                    Your Child&apos;s 5-Stage LIC Maktab Admissions Journey
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold space-y-1">
                      <div className="text-[10px] uppercase opacity-80">
                        Stage 1 • Done
                      </div>
                      <div>Registration Submitted</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#005A9C] text-white font-bold space-y-1 ring-2 ring-[#009FE3]">
                      <div className="text-[10px] uppercase text-[#7FD4FF]">
                        Stage 2 • Current
                      </div>
                      <div>Teacher Assessment</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#D0E6F7] text-slate-600 font-bold space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">
                        Stage 3 • Next
                      </div>
                      <div>Place &amp; Level Confirmed</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#D0E6F7] text-slate-600 font-bold space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">
                        Stage 4 • Fee
                      </div>
                      <div>£40 Standing Order (by 28th)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#D0E6F7] text-slate-600 font-bold space-y-1">
                      <div className="text-[10px] uppercase text-slate-400">
                        Stage 5 • Start
                      </div>
                      <div>Begin Classes at LIC</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLookupQuery(submittedApplication.referenceNo);
                      setActiveTab("track");
                    }}
                    className="px-5 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition"
                  >
                    <Search className="w-4 h-4 text-[#009FE3]" />
                    <span>Track Application Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedApplication(null);
                      setWizardStep(1);
                      setChildName("");
                    }}
                    className="px-5 py-3 rounded-xl bg-[#F0F7FC] hover:bg-slate-200 text-[#005A9C] font-bold text-xs sm:text-sm transition"
                  >
                    Register Another Child
                  </button>
                </div>
              </div>
            ) : (
              /* MULTI-STEP WIZARD FORM */
              <>
                {/* Wizard Stepper Progress Header */}
                <div className="space-y-3 border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                      LIC Maktab Digital Admissions • Step {wizardStep} of 5
                    </span>
                    <span className="text-xs font-bold text-[#005A9C]">
                      {Math.round((wizardStep / 5) * 100)}% Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { step: 1, label: "1. Student" },
                      { step: 2, label: "2. Parent" },
                      { step: 3, label: "3. Quran Level" },
                      { step: 4, label: "4. Days & Travel" },
                      { step: 5, label: "5. Declaration" },
                    ].map((item, idx) => {
                      const active = wizardStep === item.step;
                      const done = wizardStep > item.step;
                      return (
                        <button
                          key={item.step}
                          type="button"
                          onClick={() =>
                            validateAndAdvance(item.step as 1 | 2 | 3 | 4 | 5)
                          }
                          className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs font-extrabold border text-center transition ${
                            idx === 4 ? "col-span-2 sm:col-span-1" : ""
                          } ${
                            active
                              ? "bg-[#005A9C] text-white border-[#005A9C] shadow-sm"
                              : done
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-[#F0F7FC] text-slate-500 border-[#D0E6F7]"
                          }`}
                        >
                          {done ? `✓ ${item.label}` : item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {stepError && (
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-900 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{stepError}</span>
                  </div>
                )}

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* ======================================================== */}
                  {/* STEP 1: STUDENT DETAILS                                  */}
                  {/* ======================================================== */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-black text-[#005A9C]">
                          Section 1: Student Details (Boys Aged 7–16)
                        </h2>
                        <p className="text-xs text-slate-600">
                          Enter the student&apos;s details. Entering Date of
                          Birth automatically calculates age and UK School Year
                          Group.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Student Full Name *
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
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            required
                            value={dateOfBirth}
                            onChange={(e) => handleDobChange(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-extrabold text-[#005A9C]">
                            School / Year Group * (Auto-calculated Age:{" "}
                            <span className="text-[#009FE3]">
                              {childAge} yrs
                            </span>
                            )
                          </label>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {YEAR_GROUP_OPTIONS.map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => setSchoolYearGroup(yr)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
                                schoolYearGroup === yr
                                  ? "bg-[#005A9C] text-white border-[#005A9C]"
                                  : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                              }`}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                        {schoolYearGroup === "Other" && (
                          <input
                            type="text"
                            value={customYearGroup}
                            onChange={(e) => setCustomYearGroup(e.target.value)}
                            placeholder="Please specify School Year Group..."
                            className="mt-2 w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Home Address *
                          </label>
                          <input
                            type="text"
                            required
                            value={homeAddress}
                            onChange={(e) => setHomeAddress(e.target.value)}
                            placeholder="House number and street name (e.g. 24 Trelawney Avenue, Langley)"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Postcode *
                          </label>
                          <input
                            type="text"
                            required
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                            placeholder="e.g. SL3 8GY"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm uppercase font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                          Medical Conditions, Allergies or Learning Support
                          Notes (Optional Safeguarding Info)
                        </label>
                        <input
                          type="text"
                          value={medicalOrAllergies}
                          onChange={(e) => setMedicalOrAllergies(e.target.value)}
                          placeholder="e.g. Carries asthma inhaler / nut allergy / none"
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => validateAndAdvance(2)}
                          className="px-6 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center gap-2 shadow-sm transition"
                        >
                          <span>Next: Parent / Guardian Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 2: PARENT / GUARDIAN DETAILS                        */}
                  {/* ======================================================== */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-black text-[#005A9C]">
                          Section 2: Parent / Guardian Contact Details
                        </h2>
                        <p className="text-xs text-slate-600">
                          Used for teacher assessment scheduling and our
                          automated 5-minute pre-pickup SMS/WhatsApp alerts.
                        </p>
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
                            placeholder="Full Name"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Relationship to Student *
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {(
                              ["Father", "Mother", "Guardian", "Other"] as const
                            ).map((rel) => (
                              <button
                                key={rel}
                                type="button"
                                onClick={() => setRelationshipToStudent(rel)}
                                className={`h-11 rounded-xl text-xs font-bold border transition ${
                                  relationshipToStudent === rel
                                    ? "bg-[#005A9C] text-white border-[#005A9C]"
                                    : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                                }`}
                              >
                                {rel}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Mobile Number (WhatsApp/SMS) *
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

                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="parent@example.com"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Alternative Contact Number (Optional)
                          </label>
                          <input
                            type="tel"
                            value={alternativeContactPhone}
                            onChange={(e) =>
                              setAlternativeContactPhone(e.target.value)
                            }
                            placeholder="Emergency backup phone"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => validateAndAdvance(3)}
                          className="px-6 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center gap-2 shadow-sm transition"
                        >
                          <span>Next: Quranic Reading Level</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 3: QURAN LEARNING DETAILS & SMART PLACEMENT         */}
                  {/* ======================================================== */}
                  {wizardStep === 3 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-black text-[#005A9C]">
                          Section 3: Quran Learning Details &amp; Smart Level
                          Recommender
                        </h2>
                        <p className="text-xs text-slate-600">
                          What is the student&apos;s current Quranic level? Our
                          system will recommend the matching class tier pending
                          your child&apos;s 1-to-1 Teacher Assessment.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {READING_LEVEL_OPTIONS.map((opt) => {
                          const selected = currentQuranLevel === opt.level;
                          return (
                            <div
                              key={opt.level}
                              onClick={() =>
                                handleReadingLevelChange(opt.level)
                              }
                              className={`cursor-pointer p-3.5 rounded-2xl border-2 transition ${
                                selected
                                  ? "bg-[#F0F7FC] border-[#005A9C] shadow-sm"
                                  : "bg-white border-slate-200 hover:border-[#009FE3]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-xs sm:text-sm text-[#005A9C]">
                                  {opt.level}
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#009FE3]/15 text-[#005A9C]">
                                  → {opt.tierName.split(" ")[0]}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1">
                                {opt.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Smart Placement Preview Banner */}
                      <div className="p-4 rounded-2xl bg-[#005A9C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-[#009FE3] shrink-0" />
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider text-[#7FD4FF]">
                              Smart Pre-Assessment Placement Recommendation
                            </div>
                            <div className="text-sm font-black">
                              Recommended Tier:{" "}
                              {
                                READING_LEVEL_OPTIONS.find(
                                  (r) => r.level === currentQuranLevel
                                )?.tierName
                              }
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold bg-white/15 px-3 py-1 rounded-lg">
                          Confirmed via Teacher Assessment
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-[#005A9C] mb-1.5">
                          How long has the student been learning Quran?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {DURATION_OPTIONS.map((dur) => (
                            <button
                              key={dur}
                              type="button"
                              onClick={() => setLearningDuration(dur)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                                learningDuration === dur
                                  ? "bg-[#005A9C] text-white border-[#005A9C]"
                                  : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                              }`}
                            >
                              {dur}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-2">
                          <label className="block text-xs font-extrabold text-[#005A9C]">
                            Is the student currently attending another
                            Quran/Maktab class? *
                          </label>
                          <div className="flex gap-2">
                            {[
                              { label: "Yes", val: true },
                              { label: "No", val: false },
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => setAttendingOtherMaktab(opt.val)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                                  attendingOtherMaktab === opt.val
                                    ? "bg-[#005A9C] text-white border-[#005A9C]"
                                    : "bg-white text-slate-700 border-slate-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {attendingOtherMaktab && (
                            <input
                              type="text"
                              value={otherMaktabDetails}
                              onChange={(e) =>
                                setOtherMaktabDetails(e.target.value)
                              }
                              placeholder="If yes, please provide details..."
                              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white"
                            />
                          )}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-2">
                          <label className="block text-xs font-extrabold text-[#005A9C]">
                            Has the student previously been assessed by an LIC
                            Teacher? *
                          </label>
                          <div className="flex gap-2">
                            {[
                              { label: "Yes", val: true },
                              { label: "No", val: false },
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() =>
                                  setPreviouslyAssessedByLic(opt.val)
                                }
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                                  previouslyAssessedByLic === opt.val
                                    ? "bg-[#005A9C] text-white border-[#005A9C]"
                                    : "bg-white text-slate-700 border-slate-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => validateAndAdvance(4)}
                          className="px-6 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center gap-2 shadow-sm transition"
                        >
                          <span>Next: Preferred Days &amp; Travel</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 4: PREFERRED 3-DAY COHORT & SUSTAINABLE TRAVEL      */}
                  {/* ======================================================== */}
                  {wizardStep === 4 && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-black text-[#005A9C]">
                          Section 4: Preferred Class Days (3 Days/Week) &amp;
                          Travel Plan
                        </h2>
                        <p className="text-xs text-slate-600">
                          Select your preferred 3-day weekly cohort and how your
                          child will travel to and from Spitfire Close.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-[#005A9C] mb-2">
                          Preferred 3-Day Weekly Session *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(
                            [
                              {
                                days: "Monday – Wednesday" as const,
                                sub: "Monday, Tuesday & Wednesday (3 days/week)",
                              },
                              {
                                days: "Thursday – Saturday" as const,
                                sub: "Thursday, Friday & Saturday (3 days/week)",
                              },
                            ]
                          ).map((cohort) => {
                            const active = preferredDays === cohort.days;
                            return (
                              <div
                                key={cohort.days}
                                onClick={() => setPreferredDays(cohort.days)}
                                className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-start gap-3 ${
                                  active
                                    ? "bg-[#F0F7FC] border-[#005A9C] shadow-sm"
                                    : "bg-white border-slate-200 hover:border-[#009FE3]"
                                }`}
                              >
                                <Calendar className="w-5 h-5 text-[#009FE3] shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-black text-sm text-[#005A9C]">
                                    {cohort.days}
                                  </div>
                                  <div className="text-xs text-slate-600 mt-0.5">
                                    {cohort.sub}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-[#005A9C] mb-1.5">
                          Target Class Level Tier (Subject to Teacher
                          Assessment) *
                        </label>
                        <select
                          value={enrollSessionId}
                          onChange={(e) =>
                            setEnrollSessionId(e.target.value as QuranSessionId)
                          }
                          className="w-full h-12 px-4 rounded-xl border-2 border-[#D0E6F7] font-bold text-sm text-[#005A9C] bg-[#F0F7FC]"
                        >
                          {state.quranSessions.map((ses, idx) => {
                            const cnt = state.quranStudents.filter(
                              (s) => s.sessionId === ses.id
                            ).length;
                            const hours =
                              idx === 0
                                ? "4:30pm – 5:30pm"
                                : idx === 1
                                ? "5:30pm – 6:30pm"
                                : "6:30pm – 7:30pm";
                            return (
                              <option key={ses.id} value={ses.id}>
                                {hours} — {ses.title} ({cnt}/10 Active)
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-[#005A9C] mb-1.5">
                          Usual Drop-Off / Pick-Up Mode of Travel *
                        </label>
                        <select
                          value={travelMode}
                          onChange={(e) =>
                            setTravelMode(e.target.value as TravelMode)
                          }
                          className="w-full h-12 px-4 rounded-xl border border-slate-300 text-sm font-bold text-[#005A9C]"
                        >
                          <option value="Walking">
                            Walking (Recommended — Zero Traffic Impact)
                          </option>
                          <option value="Bicycle">
                            Bicycle (Spitfire Close On-Site Cycle Rack)
                          </option>
                          <option value="Car Share">
                            Car Share (Parked on Common Rd / Harvey Park /
                            Harrow Market)
                          </option>
                          <option value="Car / Drive">
                            Car (Parked on Common Rd / Harvey Park / Harrow
                            Market &amp; Walk In)
                          </option>
                        </select>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => validateAndAdvance(5)}
                          className="px-6 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center gap-2 shadow-sm transition"
                        >
                          <span>Next: Parent Declarations &amp; Signature</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* STEP 5: OFFICIAL 6-POINT DECLARATION & DIGITAL SIGNATURE */}
                  {/* ======================================================== */}
                  {wizardStep === 5 && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="text-xl font-black text-[#005A9C]">
                            Section 5: Official LIC Parent Declaration &amp;
                            Consent
                          </h2>
                          <p className="text-xs text-slate-600">
                            Please confirm all 6 official LIC Maktab admissions
                            &amp; parking conditions below and sign digitally.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={toggleAllDeclarations}
                          className="px-3.5 py-2 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-extrabold text-xs transition shrink-0"
                        >
                          {allDeclarationsChecked
                            ? "Untick All"
                            : "✓ Tick All 6 Declarations"}
                        </button>
                      </div>

                      <div className="space-y-2.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4">
                        {OFFICIAL_DECLARATIONS.map((decl, idx) => (
                          <label
                            key={idx}
                            className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-amber-200 text-xs sm:text-sm text-slate-800 font-semibold cursor-pointer hover:border-[#005A9C] transition"
                          >
                            <input
                              type="checkbox"
                              checked={checkedDeclarations[idx]}
                              onChange={(e) => {
                                const next = [...checkedDeclarations];
                                next[idx] = e.target.checked;
                                setCheckedDeclarations(next);
                              }}
                              className="mt-0.5 w-4 h-4 rounded border-amber-600 text-[#005A9C] shrink-0"
                            />
                            <span>{decl}</span>
                          </label>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Digital Signature (Type Parent / Guardian Full Name)
                            *
                          </label>
                          <input
                            type="text"
                            required
                            value={digitalSignature}
                            onChange={(e) =>
                              setDigitalSignature(e.target.value)
                            }
                            placeholder={
                              parentName || "Type full name to sign digitally"
                            }
                            className="w-full h-11 px-3.5 rounded-xl border-2 border-[#005A9C] text-sm font-bold text-[#005A9C]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                            Signature Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={signatureDate}
                            onChange={(e) => setSignatureDate(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          disabled={!allDeclarationsChecked}
                          className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 text-white font-black text-sm sm:text-base shadow-md transition inline-flex items-center justify-center gap-2"
                        >
                          <FileCheck2 className="w-5 h-5 text-[#009FE3]" />
                          <span>Submit Official LIC Maktab Registration</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Right 4 Cols: Official LIC Admissions Process, £40 Standing Order & Parking Rules */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#005A9C] text-white rounded-3xl p-6 space-y-4 shadow-md">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#7FD4FF]">
                <GraduationCap className="w-4 h-4" />
                <span>How LIC Maktab Registration Works</span>
              </div>
              <h3 className="text-lg font-black">
                6-Step Official Admissions &amp; Standing Order Guide
              </h3>
              <ol className="space-y-3 text-xs text-slate-100 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    <strong>Complete Registration Form:</strong> Submit student
                    and parent details and select your preferred 3-day cohort (
                    <strong>Mon–Wed</strong> or <strong>Thu–Sat</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong>Teacher Assessment:</strong> Every student is
                    assessed by our teacher to determine placement into{" "}
                    <strong>Beginner (4:30–5:30pm)</strong>,{" "}
                    <strong>Intermediate (5:30–6:30pm)</strong>, or{" "}
                    <strong>Advanced (6:30–7:30pm)</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong>Registration Confirmation:</strong> Submitting the
                    form is an expression of interest; places are confirmed once
                    assessed and a slot is available.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <span>
                    <strong>£40/Month Standing Order:</strong> Once confirmed,
                    parents set up a <strong>£40 monthly Standing Order</strong>{" "}
                    by the <strong>28th of the previous month</strong> (e.g. by
                    28 Sept for October classes).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <span>
                    <strong>Start Classes &amp; 5-Min Pickup Alerts:</strong>{" "}
                    Teachers send a 1-tap SMS/WhatsApp alert 5 minutes before
                    dismissal so parents walk to the door with zero idling.
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600">
                <MapPin className="w-4 h-4" />
                <span>Parent Drop-Off &amp; Collection Rules</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never park or wait in <strong>Mencap (gated next door)</strong>{" "}
                or the{" "}
                <strong>
                  unmarked Resident Parking Yard directly in front of LIC
                </strong>
                . Please use <strong>Common Road</strong>,{" "}
                <strong>Harvey Park Car Park</strong>, or{" "}
                <strong>Harrow Market Car Park</strong>.
              </p>
              <Link
                href="/parking"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F0F7FC] hover:bg-[#005A9C] text-[#005A9C] hover:text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 border border-[#D0E6F7] transition"
              >
                <MapPin className="w-4 h-4 text-[#009FE3]" />
                <span>View Interactive Spitfire Close Parking Map</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: PARENT APPLICATION & ASSESSMENT TRACKER                       */}
      {/* ==================================================================== */}
      {activeTab === "track" && (
        <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                Live Admissions &amp; Assessment Status Lookup
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
                Track Student Registration &amp; Placement
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Search by Reference Number (<code>LIC-MKT-2026-...</code>),
                Student Name, or Parent Mobile Number.
              </p>
            </div>
            <div className="w-full sm:w-80">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Search Reference ID, Child or Phone..."
                className="w-full h-11 px-4 rounded-xl border-2 border-[#D0E6F7] text-xs sm:text-sm font-bold text-[#005A9C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLookupStudents.map((st) => {
              const ses = state.quranSessions.find(
                (s) => s.id === st.sessionId
              );
              const status = st.admissionStatus || "Confirmed & Enrolled";
              return (
                <div
                  key={st.id}
                  className="p-5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-white border border-[#D0E6F7] text-[#005A9C]">
                      {st.referenceNo || `LIC-MKT-${st.id.toUpperCase()}`}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        status === "Confirmed & Enrolled"
                          ? "bg-emerald-100 text-emerald-800"
                          : status === "Assessed - Awaiting £40 Standing Order"
                          ? "bg-sky-100 text-[#005A9C]"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div>
                    <div className="text-base font-black text-[#005A9C]">
                      {st.childName}{" "}
                      <span className="text-xs font-bold text-slate-500">
                        (Age {st.age} • {st.schoolYearGroup || "Maktab Student"}
                        )
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Allocated / Target Tier:{" "}
                      <strong className="text-[#005A9C]">{ses?.title}</strong> •
                      Days:{" "}
                      <strong>
                        {st.preferredDays || "Monday – Wednesday"}
                      </strong>
                    </div>
                    {st.currentQuranLevel && (
                      <div className="text-xs text-slate-600 mt-0.5">
                        Submitted Reading Level:{" "}
                        <strong>{st.currentQuranLevel}</strong>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#D0E6F7] flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>
                      £40/mo Standing Order:{" "}
                      <strong
                        className={
                          st.standingOrderVerified
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }
                      >
                        {st.standingOrderVerified
                          ? "✓ Verified"
                          : "Pending Confirmation"}
                      </strong>
                    </span>
                    <span>Enrolled: {st.enrolledAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: TEACHER REGISTER, 5-MIN PICKUP ALERT & ADMISSIONS PIPELINE    */}
      {/* ==================================================================== */}
      {activeTab === "teacher" && (
        <PinGate
          title="Internal Staff: Teacher Attendance, Pickup Alert & Assessment Console"
          subtitle="Enter your confidential 4-digit LIC Staff PIN to mark attendance, send 5-minute parent pickup alerts, or assess & approve new student registrations."
        >
          <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-6">
            {/* Teacher Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTeacherSubTab("attendance")}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                    teacherSubTab === "attendance"
                      ? "bg-[#005A9C] text-white shadow-sm"
                      : "bg-[#F0F7FC] text-[#005A9C]"
                  }`}
                >
                  <BellRing className="w-4 h-4 text-[#009FE3]" />
                  <span>
                    1. Class Register &amp; 5-Min Pickup Alert (
                    {studentsInSelectedSession.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherSubTab("admissions")}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${
                    teacherSubTab === "admissions"
                      ? "bg-[#005A9C] text-white shadow-sm"
                      : "bg-[#F0F7FC] text-[#005A9C]"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-[#009FE3]" />
                  <span>
                    2. Teacher Assessments &amp; £40 Standing Order Approvals (
                    {state.quranStudents.length})
                  </span>
                </button>
              </div>
            </div>

            {alertBanner && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-emerald-950 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MessageSquareShare className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-bold">
                    {alertBanner}
                  </div>
                </div>
                <button
                  onClick={() => setAlertBanner(null)}
                  className="text-xs font-extrabold underline shrink-0"
                >
                  Close
                </button>
              </div>
            )}

            {teacherSubTab === "attendance" ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#005A9C]">
                      {activeSession.title} ({activeSession.timeWindow})
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Teacher: <strong>{activeSession.ustadhName}</strong> •
                      Students:{" "}
                      <strong>
                        {studentsInSelectedSession.length} /{" "}
                        {activeSession.maxCapacity}
                      </strong>
                      {activeSession.lastPickupAlertSent && (
                        <span>
                          {" "}
                          • Last Pickup Alert Sent:{" "}
                          <strong className="text-emerald-700">
                            {activeSession.lastPickupAlertSent}
                          </strong>
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendPickupAlert(activeSession.id)}
                    className="px-5 py-3.5 rounded-2xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-black text-sm shadow-md inline-flex items-center gap-2.5 transition active:scale-95 shrink-0"
                  >
                    <BellRing className="w-5 h-5" />
                    <span>
                      Send Pickup Alert ({activeSession.pickupAlertTime}{" "}
                      SMS/WhatsApp)
                    </span>
                  </button>
                </div>

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
                              (Age {student.age}
                              {student.schoolYearGroup
                                ? ` • ${student.schoolYearGroup}`
                                : ""}
                              )
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Parent: <strong>{student.parentName}</strong> (
                            {student.parentPhone}) •{" "}
                            <span className="text-[#009FE3] font-bold">
                              {student.preferredDays || "Mon–Wed"} •{" "}
                              {student.travelMode}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={buildUkWhatsAppLink(
                            student.parentPhone,
                            `Assalamu Alaikum ${student.parentName}, LIC Maktab class (${activeSession.title}) for ${student.childName} finishes in 5 minutes. Please park on Common Road, Harvey Park, or Harrow Market and walk to the Spitfire Close door. Strictly NO waiting in the Resident Yard or Mencap. JazakAllah Khair.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm transition"
                          title="Send real pre-filled WhatsApp pickup message to parent"
                        >
                          <MessageSquareShare className="w-3.5 h-3.5" />
                          <span>WhatsApp Parent</span>
                        </a>
                        {ATTENDANCE_OPTIONS.map((statusOption) => {
                          const active = student.attendance === statusOption;
                          return (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() =>
                                updateStudentAttendance(
                                  student.id,
                                  statusOption
                                )
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
            ) : (
              /* TEACHER ASSESSMENT & STANDING ORDER APPROVAL PIPELINE */
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-[#005A9C]">
                    Student Assessment Placement &amp; £40 Standing Order
                    Verification
                  </h2>
                  <p className="text-xs text-slate-600">
                    Assess new applicants, assign their final class level
                    (Beginner, Intermediate, or Advanced), and verify their £40
                    monthly Standing Order.
                  </p>
                </div>

                <div className="space-y-3">
                  {state.quranStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-[#005A9C]">
                            {st.childName} (Age {st.age}
                            {st.schoolYearGroup
                              ? ` • ${st.schoolYearGroup}`
                              : ""}
                            )
                          </span>
                          {st.referenceNo && (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-[#D0E6F7] text-[#005A9C]">
                              {st.referenceNo}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">
                          Parent: <strong>{st.parentName}</strong> (
                          {st.relationshipToStudent || "Parent"}) •{" "}
                          {st.parentPhone}
                          {st.parentEmail ? ` • ${st.parentEmail}` : ""}
                        </div>
                        <div className="text-xs text-slate-600">
                          Level:{" "}
                          <strong>
                            {st.currentQuranLevel || "Nazira Quran"}
                          </strong>{" "}
                          ({st.learningDuration || "1+ yr"}) • Cohort:{" "}
                          <strong>{st.preferredDays || "Mon–Wed"}</strong>
                          {st.postcode ? ` • Postcode: ${st.postcode}` : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={st.sessionId}
                          onChange={(e) =>
                            updateQuranStudentAdmission(st.id, {
                              sessionId: e.target.value as QuranSessionId,
                            })
                          }
                          className="h-9 px-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#005A9C]"
                        >
                          <option value="session-1">
                            Beginner (4:30–5:30)
                          </option>
                          <option value="session-2">
                            Intermediate (5:30–6:30)
                          </option>
                          <option value="session-3">
                            Advanced (6:30–7:30)
                          </option>
                        </select>

                        <select
                          value={st.admissionStatus || "Confirmed & Enrolled"}
                          onChange={(e) =>
                            updateQuranStudentAdmission(st.id, {
                              admissionStatus: e.target
                                .value as QuranAdmissionStatus,
                            })
                          }
                          className="h-9 px-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#005A9C]"
                        >
                          <option value="Assessment Pending">
                            1. Assessment Pending
                          </option>
                          <option value="Assessed - Awaiting £40 Standing Order">
                            2. Assessed - Awaiting £40 SO
                          </option>
                          <option value="Confirmed & Enrolled">
                            3. Confirmed &amp; Enrolled
                          </option>
                          <option value="Waitlisted">Waitlisted</option>
                        </select>

                        <a
                          href={buildUkWhatsAppLink(
                            st.parentPhone,
                            `Assalamu Alaikum ${st.parentName}, thank you for registering ${st.childName} (Ref: ${st.referenceNo || st.id}) for LIC Maktab Quran Classes. We would like to invite ${st.childName} for a brief Teacher Assessment at Langley Islamic Centre (Spitfire Close, SL3 8GY). Please reply to confirm a convenient day.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm transition"
                        >
                          <MessageSquareShare className="w-3.5 h-3.5" />
                          <span>WhatsApp Invite</span>
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuranStudentAdmission(st.id, {
                              standingOrderVerified: !st.standingOrderVerified,
                            })
                          }
                          className={`h-9 px-3 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border transition ${
                            st.standingOrderVerified
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-300"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>
                            {st.standingOrderVerified
                              ? "£40 SO Verified"
                              : "Mark £40 SO Paid"}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PinGate>
      )}
    </div>
  );
}
