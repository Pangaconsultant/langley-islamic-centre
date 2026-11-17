"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Navigation,
  ShieldAlert,
} from "lucide-react";
import { MaskedContactBox } from "@/components/MaskedContactBox";
import { useLicStore } from "@/lib/db";

export default function ContactUsPage() {
  const { submitNeighbourIncident } = useLicStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSubmitting(true);

    // 1. Always save to Supabase database (so no enquiry is ever lost)
    const refId = submitNeighbourIncident({
      category: "General Community Feedback",
      reporterName: name.trim() || "Community Member",
      reporterContact: email.trim(),
      incidentTime: new Date().toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      }),
      description: message.trim(),
    });

    // 2. Dispatch email notification to info@langleyislamiccentre.co.uk
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Community Member",
          email: email.trim(),
          message: message.trim(),
          refId,
        }),
      });
    } catch {
      // Saved in Supabase fallback
    }

    setSubmitting(false);
    setSubmittedRef(refId);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <MessageSquare className="w-4 h-4" />
            <span>Community Hub • Get in Touch with LIC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Contact Us — We&apos;d Love to Hear From You
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Your thoughts and feedback matter to us. Whether you have a
            question, need further information, would like to share a
            suggestion, or simply want to get in touch, we&apos;d be delighted
            to hear from you.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href="/parking"
            className="px-4 py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <MapPin className="w-4 h-4 text-[#009FE3]" />
            <span>Spitfire Close Parking Map</span>
          </Link>
          <Link
            href="/neighbour-log"
            className="px-4 py-3 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#009FE3]/40 font-bold text-xs inline-flex items-center gap-2 transition"
          >
            <ShieldAlert className="w-4 h-4 text-[#009FE3]" />
            <span>Neighbour Liaison Log</span>
          </Link>
        </div>
      </div>

      {/* Main Split Grid: Masked Contact Details + Contact Us Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 Cols: Masked Anti-Bot Contact Cards & Directions */}
        <div className="lg:col-span-6 space-y-6">
          <MaskedContactBox variant="card" />

          <div className="bg-[#005A9C] text-white rounded-3xl p-6 space-y-4 shadow-md">
            <h2 className="text-lg font-black">
              Visiting Langley Islamic Centre (Spitfire Close, SL3 8GY)
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
              Please remember to follow our sustainable parking guidelines when
              visiting the Centre. Never park in Mencap (behind metal gates next
              door) or the unmarked Resident Parking Yard in front of LIC.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Langley+Islamic+Centre+Spitfire+Close+Slough+SL3+8GY"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#009FE3] hover:bg-[#33B5EC] text-white font-black text-xs inline-flex items-center gap-2 transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Spitfire Close in Google Maps</span>
              </a>
              <Link
                href="/parking"
                className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs inline-flex items-center gap-2 transition"
              >
                <MapPin className="w-4 h-4 text-[#7FD4FF]" />
                <span>View Permitted Car Parks (Harvey Park &amp; Common Rd)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Official Contact Us Message Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              Direct Community Enquiry
            </div>
            <h2 className="text-xl font-black text-[#005A9C]">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Please use the contact form below to send us your message. Your
              feedback helps us improve, grow, and continue serving our
              community better.
            </p>
          </div>

          {submittedRef && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  JazakAllah Khair! Your message has been received (Ref:{" "}
                  {submittedRef}).
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Our team at Langley Islamic Centre will review your enquiry and
                respond via email shortly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Message *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-400 text-white font-black text-sm shadow-md inline-flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4 text-[#009FE3]" />
              <span>{submitting ? "Sending Message..." : "Contact Us"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
