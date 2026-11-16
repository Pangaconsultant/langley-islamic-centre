"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  CalendarClock,
  Car,
  MapPin,
  ShieldAlert,
  Bot,
  HandHeart,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Building2,
  Globe,
} from "lucide-react";
import { LicLogo } from "@/components/LicLogo";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";

const PUBLIC_WEBSITE_MODULES = [
  {
    title: "24/7 AI Community Assistant & Live Prayer Times",
    route: "/assistant",
    badge: "Public Helper & Timetable",
    description:
      "Daily Jama'ah timetable, Sisters' Quran Class (Wednesdays 13:30–14:30), off-site Langley Pavilion Friday Jummah & Eid info, and quick links.",
    icon: Bot,
  },
  {
    title: "Interactive Spitfire Close Travel & Parking Map",
    route: "/parking",
    badge: "Public Site Schematic",
    description:
      "Accurate Spitfire Close schematic: Never park in Mencap (gated next door) or the unmarked Resident Yard in front of LIC. Shows Public Bays at end of LIC, Layby in front of LIC, Common Rd, Harvey Park & Harrow Market.",
    icon: MapPin,
  },
  {
    title: "Children's Quran Class Parent Portal",
    route: "/quran-classes",
    badge: "Max 10 / Session",
    description:
      "Sequential 45-min classes (16:30–18:45) with parent enrolment and mandatory parking pledge. (Teacher Register & 5-Min Pickup Alert is PIN-locked for staff).",
    icon: BookOpen,
  },
  {
    title: "Youth Hub & Careers Mentoring Network",
    route: "/mentoring",
    badge: "DBS Verified",
    description:
      "Public directory of vetted SL3 mentors across GCSE/A-Level Tutoring, Tech/AI, Medicine, Engineering & Apprenticeships with parent safeguarding fields.",
    icon: GraduationCap,
  },
  {
    title: "Event & Bereavement Slot-Booking System",
    route: "/events",
    badge: "35 / 30-Min Slot",
    description:
      "Book staggered 30-minute attendance slots for Youth Circles, workshops, and bereavement condolences (auto-locks when full).",
    icon: CalendarClock,
  },
  {
    title: "SL3 Community Car-Share Matcher",
    route: "/carpool",
    badge: "Privacy-First",
    description:
      "Connects SL3 Drivers and Passengers by street sector (Langley High St, Harrow Market, Trelawney Ave, London Rd) while keeping phone numbers masked until accepted.",
    icon: Car,
  },
  {
    title: "Flexible Volunteer \"Pick-a-Task\" Scheduler",
    route: "/volunteer",
    badge: "1-Tap Claim/Release",
    description:
      "Self-serve micro-volunteering board with Quran Class Marshal, Isha Steward, Langley Pavilion Friday Setup, and Web/AI Support shifts.",
    icon: HandHeart,
  },
  {
    title: "Digital Neighbour Liaison Report Form",
    route: "/neighbour-log",
    badge: "Public QR Form",
    description:
      "Public reporting form for Spitfire Close neighbours generating a tracked Ticket ID and alerting Operations Lead Waqar Ahmed.",
    icon: ShieldAlert,
  },
];

export default function HomePage() {
  const { state } = useLicStore();
  const { currentCount, maxCapacity, activeSessionName } = state.occupancy;

  const isRed = currentCount >= 37;
  const isAmber = currentCount >= 30 && currentCount < 37;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner with Official SVG Emblem & Live Read-Only Capacity Indicator */}
      <section className="bg-white rounded-3xl border-2 border-[#D0E6F7] shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="bg-[#F0F7FC] p-4 rounded-2xl border border-[#D0E6F7] shrink-0">
            <LicLogo size="lg" showText={true} />
          </div>
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F7FC] border border-[#009FE3]/30 text-[#005A9C] text-xs font-bold">
              <span>Spitfire Close, Langley (SL3 8GY) • Public Community Website</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#005A9C] tracking-tight">
              Langley Islamic Centre
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Welcome to our community hub for daily Jama&apos;ah times, Spitfire Close parking guidance, Children&apos;s Quran classes, Youth mentoring, SL3 car-sharing, and micro-volunteering.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
              <Link
                href="/parking"
                className="px-5 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition"
              >
                <MapPin className="w-4 h-4 text-[#009FE3]" />
                Spitfire Close Parking Map
              </Link>
              <Link
                href="/volunteer"
                className="px-5 py-3 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-bold text-sm inline-flex items-center gap-2 transition"
              >
                <HandHeart className="w-4 h-4 text-[#009FE3]" />
                Volunteer Pick-a-Task
              </Link>
            </div>
          </div>
        </div>

        {/* Live Read-Only Occupancy Status Card for Visitors */}
        <div
          className={`w-full lg:w-80 rounded-2xl p-6 border-2 text-center shrink-0 ${
            isRed
              ? "bg-red-50 border-red-500 text-red-950"
              : isAmber
              ? "bg-amber-50 border-amber-500 text-amber-950"
              : "bg-emerald-50 border-emerald-500 text-emerald-950"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider mb-1">
            {isRed ? (
              <OctagonAlert className="w-4 h-4 text-red-600" />
            ) : isAmber ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>
              {isRed
                ? "Building Full — Wait for Next Slot"
                : isAmber
                ? "Approaching 40-Person Cap"
                : "Safe Capacity Available"}
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-black my-2">
            {currentCount} <span className="text-2xl font-bold opacity-75">/ {maxCapacity}</span>
          </div>
          <p className="text-xs font-semibold opacity-85">
            Live Spitfire Close Headcount ({activeSessionName})
          </p>
        </div>
      </section>

      {/* Live Daily Salah & Jamaat Strip + Off-Site Langley Pavilion Jummah Notice */}
      <section className="bg-[#005A9C] text-white rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#009FE3]" />
            <h2 className="font-bold text-base sm:text-lg">
              Today&apos;s Langley (SL3) Daily Jama&apos;ah Timetable (Spitfire Close)
            </h2>
          </div>
          <Link
            href="/assistant"
            className="text-xs font-bold text-[#7FD4FF] hover:text-white inline-flex items-center gap-1"
          >
            <span>Open 24/7 AI Assistant &amp; Full Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PRAYER_TIMETABLE.map((p) => {
            const isCurrent = p.name === activeSessionName;
            return (
              <div
                key={p.name}
                className={`rounded-xl p-3.5 border transition ${
                  isCurrent
                    ? "bg-[#009FE3] border-white text-white shadow-md"
                    : "bg-white/10 border-white/15 text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-90">
                  <span>{p.name}</span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-white text-[#005A9C] text-[10px] font-extrabold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black mt-1">{p.jamaat}</div>
                <div className="text-[11px] opacity-80">Adhan: {p.adhan}</div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#009FE3] shrink-0" />
            <span>
              <strong>Friday Jummah &amp; Eid Prayers:</strong> Held OFF-SITE at{" "}
              <strong>Langley Pavilion</strong> (never held at Spitfire Close).
            </span>
          </div>
          <div>
            <strong>Sisters&apos; Quran Class:</strong> Wednesdays{" "}
            <strong className="text-[#7FD4FF]">13:30–14:30</strong>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 1: LIC PUBLIC COMMUNITY WEBSITE MODULES                    */}
      {/* ================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#D0E6F7] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              <Globe className="w-4 h-4" />
              <span>Public-Facing Community Website</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#005A9C]">
              LIC Public Community Services &amp; Guides
            </h2>
            <p className="text-sm text-slate-600">
              Open to all SL3 community members, parents, students, volunteers, and Spitfire Close neighbours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PUBLIC_WEBSITE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.route}
                href={mod.route}
                className="group bg-white rounded-2xl border-2 border-[#D0E6F7] hover:border-[#009FE3] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F7FC] group-hover:bg-[#005A9C] text-[#005A9C] group-hover:text-white flex items-center justify-center transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7]">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#005A9C] group-hover:text-[#009FE3] transition">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#005A9C] group-hover:text-[#009FE3]">
                  <span>Open {mod.route}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
