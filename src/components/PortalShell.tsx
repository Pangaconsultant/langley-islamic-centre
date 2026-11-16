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
  Globe,
  ChevronDown,
} from "lucide-react";
import { LicLogo } from "./LicLogo";
import { useLicStore } from "@/lib/db";
import { FloatingAssistantWidget } from "./FloatingAssistantWidget";

export const PUBLIC_NAV_MODULES = [
  { href: "/", label: "Public Home", shortLabel: "Home", icon: Home },
  { href: "/assistant", label: "Prayer Times & AI Helper", shortLabel: "Prayer & AI", icon: Bot },
  { href: "/parking", label: "Spitfire Close Parking Map", shortLabel: "Parking Map", icon: MapPin },
  { href: "/quran-classes", label: "Children's Quran Classes", shortLabel: "Quran Classes", icon: BookOpen },
  { href: "/mentoring", label: "Youth & Careers Mentoring", shortLabel: "Mentoring", icon: GraduationCap },
  { href: "/events", label: "Event & Bereavement Slots", shortLabel: "Event Slots", icon: CalendarClock },
  { href: "/carpool", label: "SL3 Car-Share Matcher", shortLabel: "Car-Share", icon: Car },
  { href: "/volunteer", label: "Volunteer Pick-a-Task", shortLabel: "Volunteer", icon: HandHeart },
  { href: "/neighbour-log", label: "Neighbour Liaison Form", shortLabel: "Neighbour Log", icon: ShieldAlert },
];

export const STAFF_ADMIN_MODULES = [
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
    sub: "Manage Tasks, Mentors, Events & PIN",
    icon: BarChart3,
  },
];

export const PortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { state } = useLicStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStaffMenuOpen(false);
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
              href="/parking"
              className="hidden md:inline-flex items-center gap-1 text-xs text-[#F0F7FC] hover:text-white underline font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-[#009FE3]" />
              Spitfire Close Parking Rules
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header (Public Website Navigation + Staff Admin Access Menu) */}
      <header className="bg-white border-b border-[#D0E6F7] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <LicLogo size="sm" showText={false} />
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-[#005A9C] leading-none">
                LANGLEY ISLAMIC CENTRE
              </div>
              <div className="text-xs font-semibold text-[#009FE3] mt-0.5">
                Spitfire Close (SL3) • Community Website
              </div>
            </div>
          </Link>

          {/* Desktop Navigation: Public Modules + Staff Admin Access Dropdown */}
          <div className="hidden xl:flex items-center gap-2">
            <nav className="flex items-center gap-0.5">
              {PUBLIC_NAV_MODULES.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      active
                        ? "bg-[#005A9C] text-white shadow-sm"
                        : "text-[#005A9C] hover:bg-[#F0F7FC]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#009FE3]" />
                    <span>{item.shortLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Staff Admin Access Dropdown Menu */}
            <div className="relative pl-2 ml-1 border-l-2 border-slate-200" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setStaffMenuOpen((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition ${
                  isStaffRoute || staffMenuOpen
                    ? "bg-[#005A9C] text-white border-[#005A9C] shadow-sm"
                    : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>Staff Admin Access</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    staffMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {staffMenuOpen && (
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
                        onClick={() => setStaffMenuOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                          active
                            ? "bg-[#005A9C] text-white"
                            : "hover:bg-[#F0F7FC] text-[#005A9C]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            active ? "bg-white/15 text-[#7FD4FF]" : "bg-[#F0F7FC] text-[#009FE3]"
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

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="xl:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-[#005A9C] font-bold text-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>Menu</span>
          </button>
        </div>

        {/* Mobile Drawer — Public Website + Staff Admin Access */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-[#D0E6F7] px-4 py-4 space-y-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#009FE3] mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>LIC Public Community Website</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PUBLIC_NAV_MODULES.map((item) => {
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
              Spitfire Close, Langley, Slough (SL3 8GY). Operating in strict accordance with the
              Slough Borough Council (SBC) Operational Management Plan &amp; Sustainable Travel Plan.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#7FD4FF] uppercase tracking-wider text-xs mb-2.5">
              Official Site &amp; Parking Rules
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-100">
              <li>• Max 40 persons on-site at Spitfire Close (incl. staff/volunteers).</li>
              <li>• Never park in Mencap (gated next door) or the unmarked Resident Yard in front of LIC.</li>
              <li>• Permitted: Public Bays at end of LIC, Layby in front of LIC, Common Rd &amp; Harrow Market.</li>
              <li>• Friday Jummah &amp; Eid Prayers held OFF-SITE at <strong>Langley Pavilion</strong>.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#7FD4FF] uppercase tracking-wider text-xs mb-2.5">
              Community &amp; Staff Admin Access
            </h3>
            <p className="text-xs text-slate-100 mb-2">
              <strong>Operations Lead:</strong> Waqar Ahmed
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/volunteer"
                className="px-3 py-1.5 rounded-lg bg-[#009FE3] hover:bg-[#33B5EC] text-white font-bold text-xs transition"
              >
                Volunteer Scheduler
              </Link>
              <Link
                href="/neighbour-log"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Neighbour Liaison Form
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-1 transition"
              >
                <Lock className="w-3.5 h-3.5 text-[#009FE3]" />
                <span>Staff Admin Access</span>
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
