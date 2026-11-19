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
  Award,
  Users,
  Compass,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { LicLogo } from "@/components/LicLogo";
import { HomepageSpotlightCarousel } from "@/components/HomepageSpotlightCarousel";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";

const CHARITY_VALUES = [
  "Live by our faith",
  "Serve with sincerity",
  "Respect & value everyone",
  "Build a connected community",
  "Encourage learning & growth",
  "Promote wellbeing & support",
  "Give and volunteer",
  "Be accountable",
];

export default function HomePage() {
  const { state } = useLicStore();
  const { currentCount, maxCapacity, activeSessionName } = state.occupancy;

  const isRed = currentCount >= 37;
  const isAmber = currentCount >= 30 && currentCount < 37;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-12">
      {/* ================================================================== */}
      {/* 1. AWARD-WINNING NON-PROFIT HERO: MISSION + LIVE TODAY AT LIC      */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden bg-white rounded-[2rem] border-2 border-[#D0E6F7] shadow-md p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left 7 Columns: Charity Story, Identity & Primary Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0F7FC] border border-[#009FE3]/40 text-[#005A9C] text-xs font-extrabold">
                <Award className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>Registered UK Charity No. 1180443 • Est. 2009</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spitfire Close, Langley (SL3 8GY)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="bg-[#F0F7FC] p-4 rounded-3xl border-2 border-[#D0E6F7] shadow-sm shrink-0">
                <LicLogo size="lg" showText={true} />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-[#005A9C] tracking-tight leading-[1.15]">
                  A Community Built on Faith, Strengthened by Connection.
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Rooted in the Qur&apos;an and Sunnah,{" "}
                  <strong>Langley Islamic Centre (LIC)</strong> brings people
                  together through daily prayer, children&apos;s Maktab
                  education, youth career mentoring, charitable giving, and
                  dedicated neighbourly stewardship.
                </p>
              </div>
            </div>

            {/* Primary Non-Profit Call-to-Action Bar */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
              <Link
                href="/donations"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm inline-flex items-center gap-2.5 shadow-md hover:shadow-lg transition"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Donate &amp; Add +25% Gift Aid</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/quran-classes"
                className="px-5 py-3.5 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-sm transition"
              >
                <BookOpen className="w-4 h-4 text-[#7FD4FF]" />
                <span>Maktab Student Registration</span>
              </Link>

              <Link
                href="/parking"
                className="px-5 py-3.5 rounded-2xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border-2 border-[#D0E6F7] font-extrabold text-sm inline-flex items-center gap-2 transition"
              >
                <MapPin className="w-4 h-4 text-[#009FE3]" />
                <span>Plan Your Visit &amp; Parking</span>
              </Link>
            </div>

            {/* Core Charity Values Pill Strip */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 text-center sm:text-left">
                Our Guiding Community Values
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                {CHARITY_VALUES.map((val) => (
                  <span
                    key={val}
                    className="px-2.5 py-1 rounded-lg bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7] text-[11px] font-bold"
                  >
                    • {val}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: "Live Today at LIC" Prayer & Safe Capacity Console */}
          <div className="lg:col-span-5 bg-[#005A9C] text-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-[#009FE3]/40 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#009FE3] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#7FD4FF]">
                    Live Today at Spitfire Close (SL3)
                  </div>
                  <h2 className="text-base sm:text-lg font-black">
                    Daily Jama&apos;ah Prayer Timetable
                  </h2>
                </div>
              </div>

              {/* Integrated Live Building Capacity Pill */}
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 ${
                  isRed
                    ? "bg-red-600 text-white"
                    : isAmber
                    ? "bg-amber-400 text-slate-950"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {isRed ? (
                  <OctagonAlert className="w-3.5 h-3.5" />
                ) : isAmber ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {currentCount}/{maxCapacity} Inside
                </span>
              </div>
            </div>

            {/* 5 Daily Prayers Grid (2-col on small mobile, 5-col on sm+ so text never squishes) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(state.prayerTimetable || PRAYER_TIMETABLE).map((p, idx) => {
                const isCurrent = p.name === activeSessionName;
                return (
                  <div
                    key={p.name}
                    className={`rounded-2xl p-2.5 text-center border transition ${
                      idx === 4 ? "col-span-2 sm:col-span-1" : ""
                    } ${
                      isCurrent
                        ? "bg-[#009FE3] border-white text-white shadow-md sm:scale-[1.03]"
                        : "bg-white/10 border-white/15 text-white"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-wider opacity-90">
                      {p.name}
                    </div>
                    <div className="text-base sm:text-lg font-black mt-1">
                      {p.jamaat}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      Adhan {p.adhan}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Important Venue Notices */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-xs text-slate-100">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-[#7FD4FF] shrink-0 mt-0.5" />
                <span>
                  <strong>Friday Jummah (13:15) &amp; Eid Prayers:</strong> Held
                  OFF-SITE at <strong>Langley Pavilion</strong> (never held at
                  Spitfire Close).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-[#7FD4FF] shrink-0 mt-0.5" />
                <span>
                  <strong>Sisters&apos; Quran &amp; Tafsir Class:</strong> Every
                  Wednesday <strong className="text-[#7FD4FF]">13:30–14:30</strong>{" "}
                  at LIC.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Link
                href="/assistant#monthly-schedule"
                className="px-3 py-1.5 rounded-xl bg-[#009FE3] hover:bg-[#0086C2] text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm transition"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Download Monthly Prayer Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/assistant"
                className="text-xs font-extrabold text-[#7FD4FF] hover:text-white inline-flex items-center gap-1"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>24/7 AI Helper</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. ADMIN-CONTROLLED "WHAT'S ON" MULTI-SLIDE SPOTLIGHT CAROUSEL     */}
      {/* ================================================================== */}
      <HomepageSpotlightCarousel
        enabled={state.spotlightEnabled ?? true}
        slides={state.spotlightSlides || []}
      />

      {/* ================================================================== */}
      {/* 2B. OUR HOME AT SPITFIRE CLOSE — OFFICIAL LIC BUILDING PHOTO GALLERY */}
      {/* ================================================================== */}
      <section className="bg-white rounded-[2rem] border-2 border-[#D0E6F7] p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              <Building2 className="w-4 h-4" />
              <span>Visit Langley Islamic Centre • Spitfire Close (SL3 8GY)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
              Our Community Centre &amp; Location Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Recognise our Spitfire Close entrance, street approach, and nearby permitted car parks before your visit.
            </p>
          </div>
          <Link
            href="/parking"
            className="text-xs font-extrabold text-[#005A9C] hover:text-[#009FE3] inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Open Interactive Parking Schematic</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="group rounded-3xl overflow-hidden border-2 border-[#D0E6F7] bg-[#F0F7FC] flex flex-col">
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
              <img
                src="/images/lic-building.jpg"
                alt="Langley Islamic Centre Building Exterior at Spitfire Close, SL3 8GY"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-[#009FE3]">
                Main Building Exterior
              </div>
              <h3 className="font-extrabold text-sm text-[#005A9C]">
                Langley Islamic Centre (Spitfire Close)
              </h3>
              <p className="text-xs text-slate-600">
                Front entrance to our prayer hall, Maktab classrooms, and on-site cycle rack.
              </p>
            </div>
          </div>

          <div className="group rounded-3xl overflow-hidden border-2 border-[#D0E6F7] bg-[#F0F7FC] flex flex-col">
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
              <img
                src="/images/spitfire-close.png"
                alt="Street view approach along Spitfire Close towards Langley Islamic Centre"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-[#009FE3]">
                Street Approach
              </div>
              <h3 className="font-extrabold text-sm text-[#005A9C]">
                Spitfire Close Entrance View
              </h3>
              <p className="text-xs text-slate-600">
                Public layby and end-of-LIC bays are permitted; Mencap (gated) &amp; Resident Yard are strictly off-limits.
              </p>
            </div>
          </div>

          <Link
            href="/parking"
            className="group rounded-3xl overflow-hidden border-2 border-[#D0E6F7] hover:border-[#009FE3] bg-[#F0F7FC] flex flex-col transition"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
              <img
                src="/images/lic-aerial-map.png"
                alt="Aerial satellite map of Langley Islamic Centre, Spitfire Close, Common Road and Langley High Street"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-4 space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Aerial Location Map
              </div>
              <h3 className="font-extrabold text-sm text-[#005A9C] group-hover:text-[#009FE3]">
                Spitfire Close, Common Rd &amp; High St
              </h3>
              <p className="text-xs text-slate-600">
                Tap to inspect our interactive Red/Green parking zones &amp; Harvey Park / Harrow Market directions.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. CHARITY IMPACT & TRUST METRICS STRIP                            */}
      {/* ================================================================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-[#009FE3]">
            Established Heritage
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Since 2009
          </div>
          <p className="text-xs text-slate-600">
            Serving Langley &amp; Slough (SL3) families with prayers, education
            &amp; welfare.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-emerald-600">
            100% Direct Giving
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            +25% Gift Aid
          </div>
          <p className="text-xs text-slate-600">
            Official LIC Stripe checkout &amp; HSBC bank transfer + UK taxpayer
            Gift Aid boost.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-[#009FE3]">
            Maktab &amp; Sisters
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Ages 7–16
          </div>
          <p className="text-xs text-slate-600">
            Structured Nazira Quran &amp; Tajweed classes + Sisters&apos;
            Wednesday Tafsir.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#D0E6F7] p-5 shadow-sm space-y-1">
          <div className="text-xs font-extrabold uppercase text-[#009FE3]">
            Safeguarded &amp; Vetted
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            100% DBS
          </div>
          <p className="text-xs text-slate-600">
            DBS-verified youth career mentors, tutors &amp; trained door
            marshals.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. PILLAR 1: EDUCATION & SUSTAINABLE TRAVEL HUB                    */}
      {/* ================================================================== */}
      <section className="bg-white rounded-[2rem] border-2 border-[#D0E6F7] p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              <Compass className="w-4 h-4" />
              <span>Education &amp; Sustainable Arrival</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
              Maktab Quran Classes &amp; Travel Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Register your child for structured weekday/Saturday Quran classes
              and plan your arrival using our permitted car parks and SL3
              car-sharing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Quran Classes */}
          <Link
            href="/quran-classes"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005A9C] text-white flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#7FD4FF]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Boys Aged 7–16
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Children&apos;s Quran Classes (Maktab)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Structured <strong>Nazira Quran &amp; Tajweed</strong> classes
                running 3 days/week (<strong>Mon–Wed</strong> or{" "}
                <strong>Thu–Sat</strong>) across Beginner, Intermediate &amp;
                Advanced levels with teacher assessment and 5-minute WhatsApp
                pickup alerts.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Enrol Child or Track Application</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Spitfire Close Parking Map */}
          <Link
            href="/parking"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Interactive Site Map
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Spitfire Close Travel &amp; Parking Map
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Inspect our exact Red &amp; Green parking zones before visiting.
                Never park in <strong>Mencap (gated next door)</strong> or the{" "}
                <strong>unmarked Resident Yard in front of LIC</strong>. One-tap
                Google Maps directions to <strong>Common Rd</strong>,{" "}
                <strong>Harvey Park</strong> &amp;{" "}
                <strong>Harrow Market</strong>.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>View Interactive Parking Schematic</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: SL3 Car-Share Matcher */}
          <Link
            href="/carpool"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#009FE3] text-white flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Privacy-First Ride Share
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                SL3 Community Car-Share Matcher
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Share rides to Fajr, Isha, and classes with fellow SL3
                neighbours by street sector (<em>Trelawney Ave</em>,{" "}
                <em>Harrow Market</em>, <em>Langley High St</em>,{" "}
                <em>London Rd</em>). Personal phone numbers stay masked until
                accepted.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Find or Offer an SL3 Lift</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5. PILLAR 2: COMMUNITY, YOUTH, VOLUNTEERING & NEIGHBOUR HUB        */}
      {/* ================================================================== */}
      <section className="bg-white rounded-[2rem] border-2 border-[#D0E6F7] p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              <Heart className="w-4 h-4" />
              <span>Youth, Welfare, Volunteering &amp; Outreach</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
              Community, Youth &amp; Neighbour Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Empowering our youth through career mentoring, supporting families
              during events and bereavements, and giving back through flexible
              micro-volunteering.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Youth & Careers Mentoring (Moved into Community Hub) */}
          <Link
            href="/mentoring"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005A9C] text-white flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-[#7FD4FF]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DBS Verified</span>
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Youth Hub &amp; Careers Mentoring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Connect with vetted community professionals for 1-to-1 guidance
                in <strong>GCSE/A-Level Tutoring</strong>,{" "}
                <strong>Medicine</strong>, <strong>Tech &amp; AI</strong>,{" "}
                <strong>Engineering</strong>, and{" "}
                <strong>Apprenticeships</strong>.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Browse Mentors &amp; Request Session</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 2. Event & Bereavement Slot-Booking */}
          <Link
            href="/events"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005A9C] text-white flex items-center justify-center">
                  <CalendarClock className="w-6 h-6 text-[#7FD4FF]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Staggered 30-Min Slots
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Events, Sisters&apos; Class &amp; Condolence Slots
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reserve staggered 30-minute attendance windows for fortnightly
                Youth Circles, Sisters&apos; Wednesday classes (13:30–14:30),
                and community bereavement condolences (Ta&apos;ziyah).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Reserve an Attendance Slot</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 3. Volunteer Pick-a-Task Scheduler */}
          <Link
            href="/volunteer"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#009FE3] text-white flex items-center justify-center">
                  <HandHeart className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Micro-Volunteering
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Volunteer &ldquo;Pick-a-Task&rdquo; Scheduler
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Give back on your schedule without long-term lock-in. Claim or
                release 30–90 minute shifts for Maktab Door Marshal, Isha
                Steward, or off-site Langley Pavilion Friday Jummah setup.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Claim an Open Volunteer Shift</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 4. Digital Neighbour Liaison Log */}
          <Link
            href="/neighbour-log"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#005A9C] border-2 border-[#D0E6F7] flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-[#009FE3]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Direct Liaison Ticket
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Spitfire Close Neighbour Liaison
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dedicated portal for our Spitfire Close neighbours to share
                feedback or report any parking or noise concern—generating an
                instant tracked Ticket ID to Operations Lead Waqar Ahmed.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Submit Neighbour Feedback</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 5. 24/7 AI Community Assistant */}
          <Link
            href="/assistant"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#005A9C] border-2 border-[#D0E6F7] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#009FE3]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  24/7 Instant Answers
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                24/7 AI Assistant &amp; Prayer Guide
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instant answers grounded in LIC&apos;s official Jama&apos;ah
                timetable, off-site Langley Pavilion Friday Jummah &amp; Eid
                arrangements, Sisters&apos; classes, and parking rules.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Ask a Question</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 6. Contact Us (Anti-Bot Click-to-Reveal) */}
          <Link
            href="/contact"
            className="group bg-[#F0F7FC]/70 hover:bg-white rounded-3xl border-2 border-[#D0E6F7] hover:border-[#005A9C] p-6 transition flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#005A9C] border-2 border-[#D0E6F7] flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#009FE3]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white text-[#005A9C] border border-[#D0E6F7]">
                  Hours: 13:00–19:00
                </span>
              </div>
              <h3 className="text-lg font-black text-[#005A9C] group-hover:text-[#009FE3] transition">
                Contact Us &amp; General Enquiries
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We&apos;d love to hear from you. Send a message directly to our
                team or use our bot-protected Click-to-Reveal telephone and
                email directory.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#D0E6F7] flex items-center justify-between text-xs font-extrabold text-[#005A9C] group-hover:text-[#009FE3]">
              <span>Get in Touch with LIC</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
