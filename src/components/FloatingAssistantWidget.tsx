"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Clock,
  Sparkles,
  ArrowRight,
  Tablet,
  MapPin,
  HandHeart,
} from "lucide-react";
import { useLicStore, PRAYER_TIMETABLE } from "@/lib/db";
import { ChatMessage, QUICK_PROMPTS, generateAssistantReply } from "@/lib/assistantEngine";

export const FloatingAssistantWidget: React.FC = () => {
  const { state } = useLicStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Assalamu Alaikum! I am the LIC 24/7 Community Assistant (grounded in official LIC guidelines): Daily Jama'ah times, Sisters' Wednesday Quran Class (13:30–14:30), Off-Site Langley Pavilion Jummah & Eid info, Common Rd/Harrow Market parking rules, and the 40-person cap.",
      timestamp: "Just now",
    },
  ]);

  const sendPrompt = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const reply = generateAssistantReply(trimmed, state);
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      role: "assistant",
      text: reply.text,
      actionLink: reply.actionLink,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50">
      {open ? (
        <div className="w-[calc(100vw-1.5rem)] sm:w-[405px] max-w-[405px] bg-white border-2 border-[#005A9C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
          {/* Header */}
          <div className="bg-[#005A9C] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#009FE3] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm leading-tight truncate">LIC 24/7 AI Assistant</h3>
                <p className="text-[11px] text-[#F0F7FC]/90 truncate">
                  Cap: {state.occupancy.currentCount}/40 • Jummah Off-Site at Langley Pavilion
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Assistant"
              className="p-1.5 rounded-lg hover:bg-white/15 transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mini Daily Jama'ah Strip */}
          <div className="bg-[#F0F7FC] border-b border-[#D0E6F7] px-3 py-2 flex items-center justify-between text-[11px] text-[#005A9C] font-semibold overflow-x-auto">
            <span className="inline-flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#009FE3]" />
              Jama&apos;ah:
            </span>
            {(state.prayerTimetable || PRAYER_TIMETABLE).map((p) => (
              <span key={p.name} className="px-1.5 shrink-0">
                {p.name} <strong>{p.jamaat}</strong>
              </span>
            ))}
          </div>

          {/* Quick Links Strip (/kiosk, /parking, /volunteer) */}
          <div className="bg-white border-b border-slate-100 px-3 py-1.5 flex items-center justify-between gap-1.5 text-[11px] font-bold">
            <Link
              href="/kiosk"
              onClick={() => setOpen(false)}
              className="flex-1 py-1 px-2 rounded-lg bg-[#F0F7FC] text-[#005A9C] hover:bg-[#005A9C] hover:text-white text-center inline-flex items-center justify-center gap-1 transition"
            >
              <Tablet className="w-3 h-3 text-[#009FE3]" />
              <span>/kiosk</span>
            </Link>
            <Link
              href="/parking"
              onClick={() => setOpen(false)}
              className="flex-1 py-1 px-2 rounded-lg bg-[#F0F7FC] text-[#005A9C] hover:bg-[#005A9C] hover:text-white text-center inline-flex items-center justify-center gap-1 transition"
            >
              <MapPin className="w-3 h-3 text-[#009FE3]" />
              <span>/parking</span>
            </Link>
            <Link
              href="/volunteer"
              onClick={() => setOpen(false)}
              className="flex-1 py-1 px-2 rounded-lg bg-[#F0F7FC] text-[#005A9C] hover:bg-[#005A9C] hover:text-white text-center inline-flex items-center justify-center gap-1 transition"
            >
              <HandHeart className="w-3 h-3 text-[#009FE3]" />
              <span>/volunteer</span>
            </Link>
          </div>

          {/* Messages */}
          <div className="p-3.5 space-y-3 overflow-y-auto flex-1 max-h-[270px] bg-white">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm max-w-[90%] leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-[#005A9C] text-white rounded-br-none"
                      : "bg-[#F0F7FC] text-slate-800 border border-[#D0E6F7] rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionLink && (
                    <Link
                      href={m.actionLink.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#005A9C] hover:text-[#009FE3] underline"
                    >
                      {m.actionLink.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendPrompt(prompt)}
                className="text-[11px] font-medium bg-white border border-[#D0E6F7] text-[#005A9C] px-2.5 py-1 rounded-full shrink-0 hover:bg-[#009FE3] hover:text-white transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt(input);
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Jummah, Sisters' Class, parking..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#005A9C]"
            />
            <button
              type="submit"
              className="h-9 px-3.5 rounded-xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-bold text-xs flex items-center justify-center transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold px-3.5 py-2.5 sm:px-4 sm:py-3.5 rounded-full shadow-xl border-2 border-white transition active:scale-95"
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#009FE3] shrink-0" />
          <span className="text-xs sm:text-sm">24/7 LIC Helper &amp; Prayer Times</span>
        </button>
      )}
    </div>
  );
};
