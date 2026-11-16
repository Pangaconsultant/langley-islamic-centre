"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Lock,
  CheckCircle2,
  PlusCircle,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useLicStore, CommunityEvent, TravelMode } from "@/lib/db";
import { PinGate } from "@/components/PinLockModal";

export default function EventSlotBookingPage() {
  const { state, bookEventSlot, createCommunityEvent } = useLicStore();
  const [mode, setMode] = useState<"public" | "admin">("public");

  // Booking Modal / Panel State
  const [selectedEventId, setSelectedEventId] = useState<string>(
    state.events[0]?.id || ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [travelMode, setTravelMode] = useState<TravelMode>("Walking");
  const [bookingFeedback, setBookingFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Admin Event Creator State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] =
    useState<CommunityEvent["category"]>("Bereavement Condolence");
  const [newDate, setNewDate] = useState("2026-11-28");
  const [newOrganizer, setNewOrganizer] = useState("LIC Welfare Committee");
  const [newDesc, setNewDesc] = useState("");
  const [newSlotsText, setNewSlotsText] = useState(
    "14:00 – 14:30, 14:30 – 15:00, 15:00 – 15:30"
  );
  const [adminCreatedMsg, setAdminCreatedMsg] = useState<string | null>(null);

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedSlotId) return;

    const res = bookEventSlot(selectedEventId, selectedSlotId, {
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      attendees: Number(attendees),
      travelMode,
    });

    if (!res.ok) {
      setBookingFeedback({
        type: "error",
        text: res.error || "Slot full.",
      });
    } else {
      setBookingFeedback({
        type: "success",
        text: `Confirmed ${attendees} space(s) for ${visitorName.trim()}! Please arrive strictly within your 30-minute window and park on Common Road or Harrow Market if driving.`,
      });
      setVisitorName("");
      setPhone("");
      setAttendees(1);
      setSelectedSlotId("");
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const windows = newSlotsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!newTitle.trim() || windows.length === 0) return;

    createCommunityEvent({
      title: newTitle.trim(),
      category: newCategory,
      date: newDate,
      description: newDesc.trim(),
      organizer: newOrganizer.trim(),
      timeWindows: windows,
    });

    setAdminCreatedMsg(
      `Created "${newTitle.trim()}" with ${windows.length} staggered 30-minute slots (each strictly capped at 35 visitors).`
    );
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <CalendarClock className="w-4 h-4" />
            <span>Module 05 • Staggered 30-Min Attendance Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Event &amp; Bereavement Slot-Booking System
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manages staggered 30-minute arrival windows for fortnightly Youth Circles, workshops, and community bereavement condolences (Ta&apos;ziyah). Each slot is strictly capped at <strong>35 visitors</strong> (leaving 5 spaces for marshals/staff within the 40-person building limit).
          </p>
        </div>

        <div className="bg-[#F0F7FC] p-1.5 rounded-2xl border-2 border-[#D0E6F7] inline-flex self-start lg:self-center">
          <button
            type="button"
            onClick={() => setMode("public")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              mode === "public"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C]"
            }`}
          >
            Book a 30-Min Slot
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              mode === "admin"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C]"
            }`}
          >
            Internal Admin: Event Creator (PIN Locked)
          </button>
        </div>
      </div>

      {bookingFeedback && (
        <div
          className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 font-bold text-sm ${
            bookingFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-950"
              : "bg-red-50 border-red-500 text-red-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span>{bookingFeedback.text}</span>
          </div>
          <button
            onClick={() => setBookingFeedback(null)}
            className="text-xs underline shrink-0"
          >
            Close
          </button>
        </div>
      )}

      {mode === "public" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Events & Staggered 30-Min Slots List */}
          <div className="lg:col-span-2 space-y-6">
            {state.events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7] font-extrabold text-xs">
                    {evt.category}
                  </span>
                  <span className="text-xs font-extrabold text-[#009FE3]">
                    Date: {evt.date} • Organiser: {evt.organizer}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#005A9C]">
                    {evt.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                {/* 30-Minute Time Slots Grid */}
                <div className="pt-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                    Select a 30-Minute Staggered Arrival Slot (Max 35 Visitors / Slot):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {evt.slots.map((slot) => {
                      const isFull = slot.bookedCount >= slot.maxCapacity;
                      const isSelected =
                        selectedEventId === evt.id && selectedSlotId === slot.id;
                      const remaining = Math.max(
                        0,
                        slot.maxCapacity - slot.bookedCount
                      );

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => {
                            setSelectedEventId(evt.id);
                            setSelectedSlotId(slot.id);
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                            isFull
                              ? "bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#005A9C] text-white border-[#005A9C] shadow-md"
                              : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-sm flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              {slot.timeWindow}
                            </span>
                            {isFull && (
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                FULL
                              </span>
                            )}
                          </div>

                          <div className="mt-3">
                            <div className="text-xs font-bold">
                              {slot.bookedCount} / {slot.maxCapacity} Booked
                            </div>
                            <div
                              className={`text-[11px] font-semibold ${
                                isFull
                                  ? "text-red-600"
                                  : isSelected
                                  ? "text-[#7FD4FF]"
                                  : "text-emerald-700"
                              }`}
                            >
                              {isFull
                                ? "Slot Locked (Capacity Reached)"
                                : `${remaining} spaces available`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slot Reservation Panel */}
          <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 shadow-md sticky top-24">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Reserve 30-Min Arrival Window</span>
            </div>
            <h2 className="text-xl font-black text-[#005A9C] mb-1">
              Confirm Your Slot Booking
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Tap any available green slot on an event card to reserve your 30-minute window.
            </p>

            <form onSubmit={handleBookSlot} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs">
                <div className="font-bold text-slate-500">Selected Slot:</div>
                {selectedSlotId ? (
                  <div className="font-extrabold text-[#005A9C] text-sm mt-0.5">
                    {
                      state.events.find((e) => e.id === selectedEventId)?.title
                    }{" "}
                    —{" "}
                    <span className="text-[#009FE3]">
                      {
                        state.events
                          .find((e) => e.id === selectedEventId)
                          ?.slots.find((s) => s.id === selectedSlotId)
                          ?.timeWindow
                      }
                    </span>
                  </div>
                ) : (
                  <div className="text-amber-700 font-bold mt-0.5">
                    Please click an available 30-minute time slot on the left first.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900XXX"
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Attendees (1–4) *
                  </label>
                  <select
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold text-[#005A9C]"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons</option>
                    <option value={3}>3 Persons</option>
                    <option value={4}>4 Persons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Planned Travel Mode *
                </label>
                <select
                  value={travelMode}
                  onChange={(e) => setTravelMode(e.target.value as TravelMode)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold text-[#005A9C]"
                >
                  <option value="Walking">Walking</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Car Share">Car Share (Common Rd / Harrow Mkt)</option>
                  <option value="Car / Drive">Car (Parked on Common Rd / Harrow Mkt)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedSlotId}
                className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] disabled:bg-slate-300 text-white font-black text-sm shadow-md transition"
              >
                {selectedSlotId ? "Confirm 30-Min Slot Booking" : "Select a Slot to Book"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ADMIN EVENT CREATOR (PIN 2580) */
        <PinGate
          title="Internal Trustee Event & Bereavement Slot Creator"
          subtitle="Enter your confidential 4-digit LIC Admin PIN to publish a new event with 30-minute time windows strictly capped at 35 visitors per slot."
        >
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-[#005A9C] mb-4 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-[#009FE3]" />
              <span>Create Staggered 30-Minute Community / Bereavement Event</span>
            </h2>

            {adminCreatedMsg && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold">
                {adminCreatedMsg}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Event or Bereavement Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Community Bereavement Condolence (Ta'ziyah) or Fortnightly Youth Circle"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as CommunityEvent["category"]
                      )
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                  >
                    <option value="Bereavement Condolence">
                      Bereavement Condolence
                    </option>
                    <option value="Youth Circle">Youth Circle</option>
                    <option value="Sisters Working Group">
                      Sisters Working Group
                    </option>
                    <option value="Community Workshop">
                      Community Workshop
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Organiser / Lead *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  30-Minute Time Windows (comma-separated, auto-capped at 35 visitors each) *
                </label>
                <input
                  type="text"
                  required
                  value={newSlotsText}
                  onChange={(e) => setNewSlotsText(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Description &amp; Dispersal Instructions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Remind attendees to arrive within their 30-min slot and park on Common Road / Harrow Market..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm shadow-md transition"
              >
                Publish Event with 35-Person Capped Slots
              </button>
            </form>
          </div>
        </PinGate>
      )}
    </div>
  );
}
