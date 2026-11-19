"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  MapPin,
  Users,
  BookOpen,
  Tablet,
  HandHeart,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";
import { MonthlyPrayerScheduleWidget } from "@/components/MonthlyPrayerScheduleWidget";
import {
  ChatMessage,
  QUICK_PROMPTS,
  generateAssistantReply,
} from "@/lib/assistantEngine";

export default function AssistantAndPrayerTimesPage() {
  const { state } = useLicStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      text: "Assalamu Alaikum! I am the LIC 24/7 AI Community Assistant, grounded strictly in Langley Islamic Centre's official guidelines:\n• Daily Jama'ah Timetable (Spitfire Close)\n• Sisters' Quran Class: Wednesdays 13:30–14:30\n• Off-Site Langley Pavilion: Friday Jummah & Eid prayers (Jummah is NOT held at Spitfire Close)\n• Strict 40-person cap, Common Road & Harrow Market parking rules, and quick links to /kiosk, /parking, and /volunteer.",
      timestamp: "Live Now",
    },
  ]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const reply = generateAssistantReply(trimmed, state);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      role: "assistant",
      text: reply.text,
      actionLink: reply.actionLink,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <Bot className="w-4 h-4" />
            <span>Module 09 • Grounded in Official LIC Guidelines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            24/7 AI Community Assistant &amp; Live Prayer Times
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Official Daily Jama&apos;ah timetable, Sisters&apos; Wednesday Quran Class (<strong>13:30–14:30</strong>), off-site <strong>Langley Pavilion</strong> Friday Jummah &amp; Eid arrangements, 40-person cap, and sustainable parking guidance.
          </p>
        </div>

        {/* Quick Links to /kiosk, /parking, and /volunteer */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/kiosk"
            className="px-4 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <Tablet className="w-4 h-4 text-[#009FE3]" />
            <span>Check-In Kiosk (/kiosk)</span>
          </Link>
          <Link
            href="/parking"
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <MapPin className="w-4 h-4" />
            <span>Parking Map (/parking)</span>
          </Link>
          <Link
            href="/volunteer"
            className="px-4 py-3 rounded-xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <HandHeart className="w-4 h-4" />
            <span>Volunteer (/volunteer)</span>
          </Link>
        </div>
      </div>

      {/* Main Split View: Official Grounded Cards + Full-Page Chat Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Official LIC Information Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Daily Jama'ah Timetable */}
          <div className="bg-[#005A9C] text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#009FE3]" />
                <h2 className="text-lg font-black">
                  Daily Jama&apos;ah Timetable (Spitfire Close)
                </h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#009FE3] text-white">
                Cap: {state.occupancy.currentCount}/40
              </span>
            </div>

            <div className="space-y-2">
              {(state.prayerTimetable || PRAYER_TIMETABLE).map((p) => {
                const isActive = p.name === state.occupancy.activeSessionName;
                return (
                  <div
                    key={p.name}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      isActive
                        ? "bg-[#009FE3] border-white text-white shadow-sm"
                        : "bg-white/10 border-white/15 text-white"
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                        <span>{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white text-[#005A9C]">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-85">Adhan: {p.adhan}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold opacity-80">
                        Jama&apos;ah
                      </div>
                      <div className="text-xl font-black">{p.jamaat}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Off-Site Langley Pavilion Card (Friday Jummah & Eid Prayers) */}
          <div className="bg-amber-50 rounded-3xl border-2 border-amber-500 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-900">
              <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Friday Jummah &amp; Eid Prayers — Off-Site Only</span>
            </div>
            <h3 className="font-black text-base text-amber-950">
              Held at Langley Pavilion (NOT at Spitfire Close)
            </h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              To strictly respect our <strong>40-person building cap</strong> and prevent any traffic impact on Spitfire Close, <strong>Friday Jummah and Eid prayers are never held at Spitfire Close</strong>. All Jummah and Eid congregations take place off-site at <strong>Langley Pavilion</strong>.
            </p>
            <div className="pt-1">
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#005A9C] hover:text-[#009FE3] underline"
              >
                <span>Volunteer for Langley Pavilion Friday Setup (/volunteer)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Sisters' Quran Class Card (Wednesdays 13:30–14:30) */}
          <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#009FE3]">
              <BookOpen className="w-4 h-4" />
              <span>Sisters&apos; Working Group Programme</span>
            </div>
            <h3 className="font-black text-base text-[#005A9C]">
              Sisters&apos; Quran Class — Wednesdays 13:30–14:30
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dedicated weekly Sisters&apos; Tajweed, Tafsir, and Quran study circle every <strong>Wednesday from 13:30 to 14:30</strong> at Spitfire Close. Sisters are encouraged to walk, car-share via <Link href="/carpool" className="text-[#009FE3] font-bold underline">/carpool</Link>, or park on Common Road / Harrow Market.
            </p>
          </div>

          {/* 4. 40-Person Cap & Parking Rules Summary */}
          <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Parking Rules &amp; 40-Person Building Cap</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              • <strong>40-Person Cap:</strong> Live headcount is currently <strong>{state.occupancy.currentCount}/40</strong>.
              <br />• <strong>Zero Spitfire Close Parking:</strong> Use Permitted Green Zones on Common Road (2–3m walk) or Harrow Market Car Park (4–5m walk).
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Full-Page Interactive Chat Assistant */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#005A9C] shadow-md overflow-hidden flex flex-col min-h-[640px]">
          <div className="bg-[#005A9C] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#009FE3] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-base">
                  LIC 24/7 AI Community Assistant
                </h2>
                <p className="text-xs text-[#7FD4FF]">
                  Strictly Grounded in Official LIC Operational &amp; Travel Plan Information
                </p>
              </div>
            </div>
          </div>

          {/* Quick Topic Starters */}
          <div className="p-4 bg-[#F0F7FC] border-b border-[#D0E6F7]">
            <div className="text-xs font-extrabold text-[#005A9C] mb-2">
              Tap an Official FAQ Topic:
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="text-xs font-bold bg-white hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#D0E6F7] px-3 py-1.5 rounded-xl transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[420px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-[#005A9C] text-white rounded-br-none"
                      : "bg-[#F0F7FC] text-slate-800 border border-[#D0E6F7] rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionLink && (
                    <Link
                      href={m.actionLink.href}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005A9C] text-white font-bold text-xs hover:bg-[#009FE3] transition"
                    >
                      <span>{m.actionLink.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 px-1">
                  {m.role === "user" ? "You" : "LIC Assistant"} • {m.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Quick-Link Bar + Input */}
          <div className="px-4 py-2 bg-[#F0F7FC] border-t border-[#D0E6F7] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#005A9C]">
            <span>Direct Module Shortcuts:</span>
            <div className="flex items-center gap-3">
              <Link href="/kiosk" className="hover:text-[#009FE3] underline">
                /kiosk
              </Link>
              <Link href="/parking" className="hover:text-[#009FE3] underline">
                /parking
              </Link>
              <Link href="/volunteer" className="hover:text-[#009FE3] underline">
                /volunteer
              </Link>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Friday Jummah at Langley Pavilion, Sisters' Class, parking..."
              className="flex-1 h-12 px-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#005A9C] bg-white"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm inline-flex items-center gap-2 transition"
            >
              <span>Ask</span>
              <Send className="w-4 h-4 text-[#009FE3]" />
            </button>
          </form>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FULL MONTHLY PRAYER SCHEDULE + BRANDED LIC PDF/PRINT & CSV DOWNLOAD */}
      {/* ================================================================== */}
      <div id="monthly-schedule" className="scroll-mt-24">
        <MonthlyPrayerScheduleWidget isAdminMode={false} />
      </div>
    </div>
  );
}
