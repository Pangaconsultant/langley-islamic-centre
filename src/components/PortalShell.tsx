"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Tablet,
  GraduationCap,
  BookOpen,
  CalendarClock,
  Car,
  MapPin,
  ShieldAlert,
  Bot,
  HandHeart,
  BarChart3,
  Menu,
  X,
  Home,
  Lock,
  ChevronDown,
  Phone,
  HeartHandshake,
  Megaphone,
} from "lucide-react";
import { LicLogo } from "./LicLogo";
import { useLicStore } from "@/lib/db";
import { FloatingAssistantWidget } from "./FloatingAssistantWidget";
import { MaskedContactBox } from "./MaskedContactBox";

export interface HubNavItem {
  href: string;
  label: string;
  shortLabel: string;
  sub: string;
  icon: React.ElementType;
}

export interface CommunityHub {
  id: string;
  title: string;
  shortTitle: string;
  defaultHref: string;
  icon: React.ElementType;
  items: HubNavItem[];
}

export const PUBLIC_COMMUNITY_HUBS: CommunityHub[] = [
  {
    id: "travel-hub",
    title: "Travel & Parking Hub",
    shortTitle: "Travel Hub",
    defaultHref: "/parking",
    icon: MapPin,
    items: [
      {
        href: "/parking",
        label: "Spitfire Close Parking Schematic",
        shortLabel: "Parking Map",
        sub: "Red/Green zones: Mencap, Resident Yard, Harvey Park, Harrow Market & Common Rd",
        icon: MapPin,
      },
      {
        href: "/carpool",
        label: "SL3 Community Car-Share Matcher",
        shortLabel: "SL3 Car-Share",
        sub: "Privacy-first SL3 ride-sharing by street sector",
        icon: Car,
      },
    ],
  },
  {
    id: "community-hub",
    title: "Community, Youth & Neighbour Hub",
    shortTitle: "Community Hub",
    defaultHref: "/mentoring",
    icon: HandHeart,
    items: [
      {
        href: "/mentoring",
        label: "Youth Hub & Careers Mentoring Network",
        shortLabel: "Youth & Careers",
        sub: "DBS-verified tutors & career mentors (GCSE/A-Level, Tech/AI, Medicine, Engineering)",
        icon: GraduationCap,
      },
      {
        href: "/events",
        label: "Event & Bereavement Slot-Booking",
        shortLabel: "Event & Condolence Slots",
        sub: "30-minute staggered arrival slots (capped at 35 visitors)",
        icon: CalendarClock,
      },
      {
        href: "/volunteer",
        label: "Volunteer \"Pick-a-Task\" Scheduler",
        shortLabel: "Volunteer Tasks",
        sub: "1-tap micro-volunteering shifts (Marshals, Pavilion Setup, AI Support)",
        icon: HandHeart,
      },
      {
        href: "/assistant",
        label: "Prayer Timetable & 24/7 AI Helper",
        shortLabel: "Prayer & AI Helper",
        sub: "Daily Jama'ah times, Sisters' Wednesday class & Langley Pavilion Jummah info",
        icon: Bot,
      },
      {
        href: "/neighbour-log",
        label: "Digital Neighbour Liaison Form",
        shortLabel: "Neighbour Liaison",
        sub: "Spitfire Close neighbour feedback & tracked Ticket ID log",
        icon: ShieldAlert,
      },
      {
        href: "/contact",
        label: "Contact Us (Click-to-Reveal Phone & Email)",
        shortLabel: "Contact Us",
        sub: "Official Spitfire Close contact form, hours (13:00–19:00) & bot-masked details",
        icon: Phone,
      },
    ],
  },
];

export const STAFF_ADMIN_MODULES = [
  {
    href: "/admin?tab=spotlight",
    label: "Edit What's On Spotlight",
    sub: "Manage Homepage Promo Carousel & Guidance",
    icon: Megaphone,
  },
  {
    href: "/kiosk",
    label: "Indoor Kiosk",
    sub: "Visitor Check-In Screen",
    icon: Tablet,
  },
  {
    href: "/occupancy",
    label: "Door Marshal Counter",
    sub: "Live 40-Person Headcount Controls",
    icon: Users,
  },
  {
    href: "/admin",
    label: "Admin CMS & SBC Backend",
    sub: "Manage Timetable, Tasks, Mentors & Security",
    icon: BarChart3,
  },
];

export const PortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { state } = useLicStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openHubDropdown, setOpenHubDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept Supabase Auth Magic Link redirect (#access_token=...) on any page
    if (
      typeof window !== "undefined" &&
      window.location.hash &&
      window.location.hash.includes("access_token=")
    ) {
      const match = window.location.hash.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        fetch("/api/verify-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_supabase_token",
            accessToken: token,
          }),
        })
          .then((r) => r.json())
          .then((data: { ok?: boolean }) => {
            if (data.ok && window.location.pathname === "/") {
              window.location.href = "/admin";
            }
          })
          .catch(() => {});
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenHubDropdown(false ? null : null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Module 1 (/kiosk) is a dedicated Indoor Kiosk view with zero external navigation clutter
  if (pathname === "/kiosk") {
    return <div className="min-h-screen bg-[#F0F7FC] text-slate-900">{children}</div>;
  }

  const count = state.occupancy.currentCount;
  const max = state.occupancy.maxCapacity;
  const statusBadgeColor =
    count >= 37
      ? "bg-red-600 text-white"
      : count >= 30
      ? "bg-amber-500 text-slate-950"
      : "bg-emerald-600 text-white";

  const isStaffRoute = STAFF_ADMIN_MODULES.some((m) => m.href === pathname);

  // Detect active Community Hub for the contextual sub-navigation bar
  const activeHub =
    pathname === "/"
      ? null
      : PUBLIC_COMMUNITY_HUBS.find((hub) =>
          hub.items.some((i) => i.href === pathname)
        ) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FC] text-slate-900">
      {/* Top Compliance & Live Occupancy Banner */}
      <div className="bg-[#005A9C] text-white text-xs sm:text-sm py-2 px-4 border-b border-white/15">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-[#009FE3] animate-pulse" />
            <span>
              <strong>Langley Islamic Centre (LIC)</strong> • Spitfire Close, Langley (SL3) • Jummah &amp; Eid Off-Site at Langley Pavilion
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusBadgeColor}`}
            >
              <span>Building Headcount: {count} / {max}</span>
            </span>
            <Link
              href="/donations"
              className="hidden md:inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-white underline font-bold"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Donate &amp; Gift Aid (+25%)
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header: Home | Donate | Quran Classes (Maktab) | Travel Hub | Community Hub | Staff Admin Access */}
      <header className="bg-white border-b border-[#D0E6F7] sticky top-0 z-40 shadow-sm" ref={navRef}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <LicLogo size="sm" showText={false} />
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#005A9C] leading-none">
                LANGLEY ISLAMIC CENTRE
              </div>
              <div className="text-xs font-semibold text-[#009FE3] mt-0.5">
                Spitfire Close (SL3) • Community Hub Portal
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* 1. Home */}
            <Link
              href="/"
              onClick={() => setOpenHubDropdown(null)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                pathname === "/"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#009FE3]" />
              <span>Home</span>
            </Link>

            {/* 2. Prominent Donate CTA right next to Home */}
            <Link
              href="/donations"
              onClick={() => setOpenHubDropdown(null)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition ${
                pathname === "/donations"
                  ? "bg-emerald-700 text-white ring-2 ring-emerald-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Donate</span>
            </Link>

            {/* 3. Direct Quran Classes (Maktab) Link */}
            <Link
              href="/quran-classes"
              onClick={() => setOpenHubDropdown(null)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                pathname === "/quran-classes"
                  ? "bg-[#005A9C] text-white shadow-sm"
                  : "text-[#005A9C] hover:bg-[#F0F7FC]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#009FE3]" />
              <span>Quran Classes</span>
            </Link>

            {/* 4. Travel Hub & 5. Community Hub Dropdowns */}
            {PUBLIC_COMMUNITY_HUBS.map((hub) => {
              const HubIcon = hub.icon;
              const isHubActive =
                pathname !== "/" && hub.items.some((i) => i.href === pathname);
              const isOpen = openHubDropdown === hub.id;

              return (
                <div key={hub.id} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenHubDropdown((prev) => (prev === hub.id ? null : hub.id))
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                      isHubActive || isOpen
                        ? "bg-[#005A9C] text-white shadow-sm"
                        : "text-[#005A9C] hover:bg-[#F0F7FC]"
                    }`}
                  >
                    <HubIcon className="w-3.5 h-3.5 text-[#009FE3]" />
                    <span>{hub.shortTitle}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl border-2 border-[#005A9C] shadow-xl p-2 z-50 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#009FE3] border-b border-slate-100">
                        {hub.title}
                      </div>
                      {hub.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenHubDropdown(null)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                              active
                                ? "bg-[#005A9C] text-white"
                                : "hover:bg-[#F0F7FC] text-[#005A9C]"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                active
                                  ? "bg-white/15 text-[#7FD4FF]"
                                  : "bg-[#F0F7FC] text-[#009FE3]"
                              }`}
                            >
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-xs">
                                {item.label}
                              </div>
                              <div
                                className={`text-[11px] leading-snug mt-0.5 ${
                                  active ? "text-slate-200" : "text-slate-500"
                                }`}
                              >
                                {item.sub}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 6. Staff Admin Access Dropdown Menu */}
            <div className="relative pl-2 ml-1 border-l-2 border-slate-200">
              <button
                type="button"
                onClick={() =>
                  setOpenHubDropdown((prev) => (prev === "staff" ? null : "staff"))
                }
                className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition ${
                  isStaffRoute || openHubDropdown === "staff"
                    ? "bg-[#005A9C] text-white border-[#005A9C] shadow-sm"
                    : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>Staff Admin Access</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    openHubDropdown === "staff" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openHubDropdown === "staff" && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border-2 border-[#005A9C] shadow-xl p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    LIC Staff &amp; Admin Tools
                  </div>
                  {STAFF_ADMIN_MODULES.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenHubDropdown(null)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                          active
                            ? "bg-[#005A9C] text-white"
                            : "hover:bg-[#F0F7FC] text-[#005A9C]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            active
                              ? "bg-white/15 text-[#7FD4FF]"
                              : "bg-[#F0F7FC] text-[#009FE3]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">{item.label}</div>
                          <div
                            className={`text-[11px] ${
                              active ? "text-slate-200" : "text-slate-500"
                            }`}
                          >
                            {item.sub}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Trigger + Quick Mobile Donate Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/donations"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-sm"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Donate</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-[#005A9C] font-bold text-xs"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Contextual Hub Sub-Navigation Strip (1-Tap Switcher Inside Travel Hub or Community Hub) */}
        {activeHub && (
          <div className="bg-[#F0F7FC] border-t border-[#D0E6F7] px-4 py-2">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#005A9C] flex items-center gap-1.5">
                <activeHub.icon className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>{activeHub.title}:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeHub.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                        active
                          ? "bg-[#005A9C] text-white border-[#005A9C] shadow-sm"
                          : "bg-white text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                      }`}
                    >
                      <ItemIcon className="w-3.5 h-3.5 text-[#009FE3]" />
                      <span>{item.shortLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Drawer — Grouped by Primary Links & Hubs */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#D0E6F7] px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl font-bold text-xs flex items-center gap-2.5 border bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
              >
                <Home className="w-4 h-4 text-[#009FE3]" />
                <span>Home &amp; Prayer Times</span>
              </Link>
              <Link
                href="/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl font-black text-xs flex items-center gap-2.5 border bg-emerald-600 text-white border-emerald-700"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Donate &amp; Gift Aid (+25%)</span>
              </Link>
              <Link
                href="/quran-classes"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl font-bold text-xs flex items-center gap-2.5 border bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
              >
                <BookOpen className="w-4 h-4 text-[#009FE3]" />
                <span>Quran Classes (Maktab)</span>
              </Link>
            </div>

            {PUBLIC_COMMUNITY_HUBS.map((hub) => (
              <div key={hub.id}>
                <div className="text-xs font-black uppercase tracking-wider text-[#009FE3] mb-2 flex items-center gap-1.5">
                  <hub.icon className="w-3.5 h-3.5" />
                  <span>{hub.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hub.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2.5 border transition ${
                          active
                            ? "bg-[#005A9C] text-white border-[#005A9C]"
                            : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#009FE3] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Staff Admin Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {STAFF_ADMIN_MODULES.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2.5 border transition ${
                        active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#009FE3] shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#005A9C] text-white mt-12 border-t-4 border-[#009FE3]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <LicLogo size="sm" variant="white" showText={false} />
              <div>
                <p className="font-extrabold text-base">LANGLEY ISLAMIC CENTRE</p>
                <p className="text-xs text-[#7FD4FF]">Registered Charity No. 1180443</p>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed pt-1">
              Spitfire Close, Langley, Slough (SL3 8GY).
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#7FD4FF] uppercase tracking-wider text-xs mb-2.5">
              Official Site &amp; Parking Rules
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-100">
              <li>• Never park in Mencap (gated next door) or the unmarked Resident Yard in front of LIC.</li>
              <li>• Permitted: Public Bays at end of LIC, Layby in front of LIC, Common Rd, Harvey Park &amp; Harrow Market.</li>
              <li>• Friday Jummah &amp; Eid Prayers held OFF-SITE at <strong>Langley Pavilion</strong>.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#7FD4FF] uppercase tracking-wider text-xs mb-2.5">
              Contact Us (Anti-Bot Protected) &amp; Quick Links
            </h3>
            <div className="mb-3">
              <MaskedContactBox variant="footer" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/donations"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition"
              >
                Donate &amp; Gift Aid
              </Link>
              <Link
                href="/contact"
                className="px-3 py-1.5 rounded-lg bg-[#009FE3] hover:bg-[#33B5EC] text-white font-bold text-xs transition"
              >
                Contact Us Form
              </Link>
              <Link
                href="/quran-classes"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Quran Classes
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-1 transition"
              >
                <Lock className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>Staff Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating 24/7 AI Assistant Widget */}
      <FloatingAssistantWidget />
    </div>
  );
};
