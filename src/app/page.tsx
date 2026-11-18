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
  Phone,
  HeartHandshake,
  Landmark,
} from "lucide-react";
import { LicLogo } from "@/components/LicLogo";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";

const COMMUNITY_HUB_SECTIONS = [
  {
    id: "travel-hub",
    badge: "Hub 01 • Travel & Sustainable Parking",
    title: "Travel & Parking Hub",
    subtitle:
      "Everything related to arriving safely at Spitfire Close, permitted car parks (Common Rd, Harvey Park & Harrow Market), and SL3 ride-sharing.",
    accentIcon: MapPin,
    cards: [
      {
        title: "Interactive Spitfire Close Parking Schematic",
        route: "/parking",
        tag: "Site Map & Google Maps",
        description:
          "Accurate Spitfire Close schematic: Never park in Mencap (gated next door) or the unmarked Resident Yard in front of LIC. Shows Public Bays at end of LIC, Layby in front of LIC, Common Rd, Harvey Park & Harrow Market.",
        icon: MapPin,
      },
      {
        title: "SL3 Community Car-Share Matcher",
        route: "/carpool",
        tag: "Privacy-First Ride Share",
        description:
          "Connects SL3 Drivers and Passengers by street sector (Langley High St, Harrow Market, Trelawney Ave, London Rd) while keeping phone numbers masked until accepted.",
        icon: Car,
      },
    ],
  },
  {
    id: "student-hub",
    badge: "Hub 02 • Education, Maktab & Careers",
    title: "Student & Youth Hub",
    subtitle:
      "Staggered Children's Quran classes, parent pickup alerts, GCSE/A-Level study support, and DBS-verified career mentoring.",
    accentIcon: GraduationCap,
    cards: [
      {
        title: "Children's Quran Class Parent Portal",
        route: "/quran-classes",
        tag: "Max 10 / 45-Min Session",
        description:
          "Sequential 45-min classes (16:30–18:45) with parent enrolment, mandatory parking pledge, and 5-minute SMS/WhatsApp pre-pickup alerts.",
        icon: BookOpen,
      },
      {
        title: "Youth Hub & Careers Mentoring Network",
        route: "/mentoring",
        tag: "DBS Verified Mentors",
        description:
          "Public directory of vetted SL3 mentors across GCSE/A-Level Tutoring, Tech/AI, Medicine, Engineering & Apprenticeships with parent safeguarding fields.",
        icon: GraduationCap,
      },
    ],
  },
  {
    id: "community-hub",
    badge: "Hub 03 • Events, Volunteering, Neighbours & AI Helper",
    title: "Community & Neighbour Hub",
    subtitle:
      "Staggered event & bereavement slots, micro-volunteering shifts, Spitfire Close neighbour liaison, and our 24/7 AI Community Assistant.",
    accentIcon: HandHeart,
    cards: [
      {
        title: "Event & Bereavement Slot-Booking System",
        route: "/events",
        tag: "35 / 30-Min Slot",
        description:
          "Book staggered 30-minute attendance slots for Youth Circles, Sisters' Wednesday class, and bereavement condolences (auto-locks when full).",
        icon: CalendarClock,
      },
      {
        title: "Flexible Volunteer \"Pick-a-Task\" Scheduler",
        route: "/volunteer",
        tag: "1-Tap Claim / Release",
        description:
          "Self-serve micro-volunteering board with Quran Class Marshal, Isha Steward, Langley Pavilion Friday Setup, and Web/AI Support shifts.",
        icon: HandHeart,
      },
      {
        title: "Digital Neighbour Liaison Report Form",
        route: "/neighbour-log",
        tag: "Public QR Form",
        description:
          "Direct reporting form for Spitfire Close neighbours generating a tracked Ticket ID and alerting Operations Lead Waqar Ahmed.",
        icon: ShieldAlert,
      },
      {
        title: "24/7 AI Community Assistant & Prayer Times",
        route: "/assistant",
        tag: "24/7 Instant Answers",
        description:
          "Grounded strictly in LIC's official timetable, Sisters' Wednesday class (13:30–14:30), off-site Langley Pavilion Jummah/Eid, and parking rules.",
        icon: Bot,
      },
      {
        title: "Support Us — Donations, Zakat, Sadaqah & Gift Aid",
        route: "/donations",
        tag: "Charity No. 1180443",
        description:
          "Official LIC Barclays Bank transfer & Standing Order details (Sort Code: 20-78-58, Account: 63102379) plus digital UK Gift Aid declaration (+25%).",
        icon: HeartHandshake,
      },
      {
        title: "Contact Us (Click-to-Reveal Phone & Email)",
        route: "/contact",
        tag: "Bot-Protected Contact",
        description:
          "Official Spitfire Close contact form, opening hours (13:00–19:00 hrs), and anti-bot Click-to-Reveal telephone and email address.",
        icon: Phone,
      },
    ],
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
              <span>Spitfire Close, Langley (SL3 8GY) • Community Hub Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#005A9C] tracking-tight">
              Langley Islamic Centre
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Welcome to our unified community portal—organized into three simple hubs: <strong>Travel &amp; Parking Hub</strong>, <strong>Student &amp; Youth Hub</strong>, and <strong>Community &amp; Neighbour Hub</strong>.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 pt-1">
              <Link
                href="/donations"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Donate &amp; Gift Aid (+25%)</span>
              </Link>
              <a
                href="#travel-hub"
                className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition"
              >
                <MapPin className="w-4 h-4 text-[#009FE3]" />
                <span>Travel Hub</span>
              </a>
              <a
                href="#student-hub"
                className="px-4 py-2.5 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition"
              >
                <GraduationCap className="w-4 h-4 text-[#009FE3]" />
                <span>Student Hub</span>
              </a>
              <a
                href="#community-hub"
                className="px-4 py-2.5 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition"
              >
                <HandHeart className="w-4 h-4 text-[#009FE3]" />
                <span>Community Hub</span>
              </a>
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
          {(state.prayerTimetable || PRAYER_TIMETABLE).map((p) => {
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
      {/* KEY HOMEPAGE DONATIONS, SADAQAH & GIFT AID SHOWCASE                */}
      {/* ================================================================== */}
      <section className="bg-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>
                Growing Together. Giving Back. • Registered UK Charity No.
                1180443
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
              Please Support Langley Islamic Centre — Sadaqah, Zakat &amp;
              Standing Orders
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              &ldquo;Charity does not decrease wealth.&rdquo; (Sahih Muslim).
              Your donations maintain our community facilities, support Islamic
              education, and fund youth and family programmes. UK taxpayers can
              boost every donation by <strong>+25% via Gift Aid</strong> at no
              extra cost.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/donations"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Donate &amp; Declare Gift Aid (+25%)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Bank Details & References Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500">
                Barclays Bank Account
              </div>
              <div className="font-black text-sm text-[#005A9C]">
                Langley Islamic Centre
              </div>
            </div>
            <Landmark className="w-5 h-5 text-[#009FE3]" />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
            <div className="text-[11px] font-bold uppercase text-slate-500">
              Sort Code &amp; Account No
            </div>
            <div className="font-mono font-black text-sm text-[#005A9C]">
              20-78-58 • 63102379
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7]">
            <div className="text-[11px] font-bold uppercase text-slate-500">
              Payment References
            </div>
            <div className="font-mono font-bold text-[#005A9C] text-[11px]">
              LIC Donation • LIC Mthly • LIC Zakat • LIC Sadaqah
            </div>
          </div>

          <Link
            href="/donations"
            className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-between transition"
          >
            <div>
              <div className="text-[11px] font-black uppercase text-emerald-800">
                Suggested Packages
              </div>
              <div className="font-black text-sm text-emerald-950">
                £25 • £50 • £100 • Custom
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* GROUPED COMMUNITY HUBS (TRAVEL HUB, STUDENT HUB, COMMUNITY HUB)    */}
      {/* ================================================================== */}
      <div className="space-y-8">
        {COMMUNITY_HUB_SECTIONS.map((hub) => {
          const HubIcon = hub.accentIcon;
          return (
            <section
              key={hub.id}
              id={hub.id}
              className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5 scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                    <HubIcon className="w-4 h-4" />
                    <span>{hub.badge}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
                    {hub.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {hub.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hub.cards.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.route}
                      href={mod.route}
                      className="group bg-[#F0F7FC]/60 hover:bg-white rounded-2xl border-2 border-[#D0E6F7] hover:border-[#009FE3] p-5 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="w-11 h-11 rounded-2xl bg-white group-hover:bg-[#005A9C] text-[#005A9C] group-hover:text-white border border-[#D0E6F7] flex items-center justify-center transition">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                            {mod.tag}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-[#005A9C] group-hover:text-[#009FE3] transition">
                          {mod.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#D0E6F7]/80 flex items-center justify-between text-xs font-bold text-[#005A9C] group-hover:text-[#009FE3]">
                        <span>Open {mod.title}</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
