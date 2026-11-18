"use client";

import React, { useState } from "react";
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
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { LicLogo } from "@/components/LicLogo";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";

const COMMUNITY_HUB_SECTIONS = [
  {
    id: "maktab-travel-hub",
    badge: "Maktab Education & Sustainable Travel Hub",
    title: "Quran Classes (Maktab) & Travel Hub",
    subtitle:
      "Official Nazira Quran & Tajweed registration for boys aged 7–16, Spitfire Close parking schematic (Common Rd, Harvey Park & Harrow Market), and SL3 ride-sharing.",
    accentIcon: BookOpen,
    cards: [
      {
        title: "LIC Maktab — Quran Classes & Student Registration",
        route: "/quran-classes",
        tag: "Boys 7–16 • £40/Month",
        description:
          "5-step digital student registration for Beginner (4:30–5:30pm), Intermediate (5:30–6:30pm) & Advanced (6:30–7:30pm) classes (Mon–Wed or Thu–Sat) + 5-min WhatsApp pickup alerts.",
        icon: BookOpen,
      },
      {
        title: "Interactive Spitfire Close Parking Schematic",
        route: "/parking",
        tag: "Travel Hub • Site Map",
        description:
          "Accurate Spitfire Close schematic: Never park in Mencap (gated next door) or the unmarked Resident Yard in front of LIC. Shows Public Bays at end of LIC, Layby in front of LIC, Common Rd, Harvey Park & Harrow Market.",
        icon: MapPin,
      },
      {
        title: "SL3 Community Car-Share Matcher",
        route: "/carpool",
        tag: "Travel Hub • Ride Share",
        description:
          "Connects SL3 Drivers and Passengers by street sector (Langley High St, Harrow Market, Trelawney Ave, London Rd) while keeping phone numbers masked until accepted.",
        icon: Car,
      },
    ],
  },
  {
    id: "community-hub",
    badge: "Community, Youth, Volunteering & Neighbour Hub",
    title: "Community & Youth Hub",
    subtitle:
      "Youth & Careers Mentoring, staggered event & bereavement condolence slots, micro-volunteering shifts, Spitfire Close neighbour liaison, Contact Us, and our 24/7 AI Helper.",
    accentIcon: HandHeart,
    cards: [
      {
        title: "Youth Hub & Careers Mentoring Network",
        route: "/mentoring",
        tag: "DBS Verified Mentors",
        description:
          "Public directory of vetted SL3 mentors across GCSE/A-Level Tutoring, Tech/AI, Medicine, Engineering & Apprenticeships with parent safeguarding fields.",
        icon: GraduationCap,
      },
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
        title: "24/7 AI Community Assistant & Prayer Times",
        route: "/assistant",
        tag: "24/7 Instant Answers",
        description:
          "Grounded strictly in LIC's official timetable, Sisters' Wednesday class (13:30–14:30), off-site Langley Pavilion Jummah/Eid, and parking rules.",
        icon: Bot,
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
  const [copiedBank, setCopiedBank] = useState(false);

  const isRed = currentCount >= 37;
  const isAmber = currentCount >= 30 && currentCount < 37;

  const handleCopyBankDetails = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(
        "Bank: Barclays Bank\nAccount Name: Langley Islamic Centre\nSort Code: 20-78-58\nAccount Number: 63102379\nReference: LIC Donation"
      );
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Hero Banner with Official SVG Emblem & Live Read-Only Capacity Indicator */}
      <section className="bg-white rounded-3xl border-2 border-[#D0E6F7] shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="bg-[#F0F7FC] p-4 rounded-2xl border border-[#D0E6F7] shrink-0">
            <LicLogo size="lg" showText={true} />
          </div>
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F7FC] border border-[#009FE3]/30 text-[#005A9C] text-xs font-bold">
              <span>
                Spitfire Close, Langley (SL3 8GY) • Registered Charity No.
                1180443
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#005A9C] tracking-tight">
              Langley Islamic Centre
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              <strong>LIC is for everyone</strong> — A community built on faith,
              strengthened by connection, and committed to Islamic education,
              youth mentoring, and charitable giving since 2009.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 pt-1">
              <Link
                href="/donations"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Donate &amp; Claim +25% Gift Aid</span>
              </Link>
              <Link
                href="/quran-classes"
                className="px-4 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition"
              >
                <BookOpen className="w-4 h-4 text-[#009FE3]" />
                <span>Quran Classes Registration</span>
              </Link>
              <Link
                href="/parking"
                className="px-4 py-3 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition"
              >
                <MapPin className="w-4 h-4 text-[#009FE3]" />
                <span>Travel &amp; Parking Map</span>
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
            {currentCount}{" "}
            <span className="text-2xl font-bold opacity-75">
              / {maxCapacity}
            </span>
          </div>
          <p className="text-xs font-semibold opacity-85">
            Live Spitfire Close Headcount ({activeSessionName})
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. PROMINENT HOMEPAGE DONATIONS, SADAQAH, ZAKAT & GIFT AID HERO    */}
      {/* ================================================================== */}
      <section className="bg-gradient-to-br from-[#005A9C] via-[#004A82] to-[#003863] text-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-[#009FE3] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                Growing Together. Giving Back. • Boost Your Donation by +25%
                with Gift Aid
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Support Langley Islamic Centre — Sadaqah, Zakat &amp; Standing
              Orders
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
              &ldquo;Who is it that will lend Allah a good loan which Allah will
              multiply [many times over] for them, and they will have an
              honourable reward?&rdquo; <strong>(Surah Al-Hadid 57:11)</strong>.
              100% of your bank transfer or monthly standing order goes directly
              to sustaining our Masjid, Maktab education, and youth programmes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/donations"
              className="px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg inline-flex items-center justify-center gap-2 transition"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Open Donations &amp; Gift Aid Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleCopyBankDetails}
              className="px-5 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition"
            >
              {copiedBank ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Barclays Details Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#7FD4FF]" />
                  <span>1-Tap Copy Bank Details</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* High-Visibility Barclays Bank Details & Suggested Giving Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase text-[#7FD4FF]">
                Barclays Bank Account
              </div>
              <div className="font-black text-base text-white mt-0.5">
                Langley Islamic Centre
              </div>
              <div className="text-[11px] text-slate-200 mt-0.5">
                Charity Reg No. 1180443
              </div>
            </div>
            <Landmark className="w-6 h-6 text-[#7FD4FF] shrink-0" />
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <div className="text-[11px] font-extrabold uppercase text-[#7FD4FF]">
              Sort Code &amp; Account Number
            </div>
            <div className="font-mono font-black text-lg text-white mt-0.5">
              20-78-58 • 63102379
            </div>
            <div className="text-[11px] text-emerald-300 font-bold mt-0.5">
              ✓ Direct Transfer &amp; Standing Orders
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <div className="text-[11px] font-extrabold uppercase text-[#7FD4FF]">
              Official Payment References
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {["LIC Donation", "LIC Mthly", "LIC Zakat", "LIC Sadaqah"].map(
                (ref) => (
                  <span
                    key={ref}
                    className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-white/15 text-white border border-white/20"
                  >
                    {ref}
                  </span>
                )
              )}
            </div>
          </div>

          <Link
            href="/donations"
            className="p-4 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 border-2 border-emerald-400/60 flex flex-col justify-between transition"
          >
            <div className="text-[11px] font-black uppercase text-emerald-200">
              Packages + 25% UK Gift Aid
            </div>
            <div className="font-black text-base text-white mt-0.5">
              £25 • £50 • £100 • Custom
            </div>
            <div className="text-xs font-extrabold text-emerald-200 inline-flex items-center gap-1 mt-1">
              <span>Complete Digital Gift Aid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Live Daily Salah & Jamaat Strip + Off-Site Langley Pavilion Jummah Notice */}
      <section className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#009FE3]" />
            <h2 className="font-black text-base sm:text-lg text-[#005A9C]">
              Today&apos;s Langley (SL3) Daily Jama&apos;ah Timetable (Spitfire
              Close)
            </h2>
          </div>
          <Link
            href="/assistant"
            className="text-xs font-extrabold text-[#005A9C] hover:text-[#009FE3] inline-flex items-center gap-1"
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
                className={`rounded-2xl p-3.5 border-2 transition ${
                  isCurrent
                    ? "bg-[#005A9C] border-[#009FE3] text-white shadow-md"
                    : "bg-[#F0F7FC] border-[#D0E6F7] text-[#005A9C]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span>{p.name}</span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-[#009FE3] text-white text-[10px] font-extrabold">
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

        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#009FE3] shrink-0" />
            <span>
              <strong className="text-[#005A9C]">
                Friday Jummah &amp; Eid Prayers:
              </strong>{" "}
              Held OFF-SITE at <strong>Langley Pavilion</strong> (never held at
              Spitfire Close).
            </span>
          </div>
          <div>
            <strong className="text-[#005A9C]">
              Sisters&apos; Quran Class:
            </strong>{" "}
            Wednesdays <strong className="text-[#009FE3]">13:30–14:30</strong>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. GROUPED HUBS: MAKTAB & TRAVEL HUB + COMMUNITY & YOUTH HUB       */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
