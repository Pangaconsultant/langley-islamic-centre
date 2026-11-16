"use client";

import React, { useState } from "react";
import {
  Car,
  Users,
  ShieldCheck,
  Lock,
  Unlock,
  MapPin,
  PlusCircle,
  CheckCircle2,
  Handshake,
} from "lucide-react";
import { useLicStore, Sl3Sector } from "@/lib/db";

const SL3_SECTORS: Sl3Sector[] = [
  "Langley High St",
  "Harrow Market",
  "Trelawney Ave",
  "London Rd",
  "Common Rd",
  "Parlaunt Rd",
];

const REGULAR_TIMES = [
  "Fajr",
  "Zuhar",
  "Asr",
  "Maghrib",
  "Isha",
  "Sisters' Wednesday Class",
  "Weekend Youth Circle",
];

export default function CarpoolMatcherPage() {
  const {
    state,
    registerCarpoolMember,
    requestCarpoolMatch,
    acceptCarpoolMatch,
  } = useLicStore();

  const [filterSector, setFilterSector] = useState<"All" | Sl3Sector>("All");
  const [activeMatchTargetId, setActiveMatchTargetId] = useState<string | null>(
    null
  );

  // Match Request Handshake Form
  const [reqName, setReqName] = useState("");
  const [reqSector, setReqSector] = useState<Sl3Sector>("Langley High St");
  const [reqPhone, setReqPhone] = useState("");
  const [reqMessage, setReqMessage] = useState("");

  // Registration Form State
  const [role, setRole] = useState<"Driver" | "Passenger">("Driver");
  const [name, setName] = useState("");
  const [sector, setSector] = useState<Sl3Sector>("Trelawney Ave");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([
    "Fajr",
    "Isha",
  ]);
  const [spareSeats, setSpareSeats] = useState(3);
  const [privatePhone, setPrivatePhone] = useState("");
  const [notes, setNotes] = useState("");
  const [regBanner, setRegBanner] = useState<string | null>(null);

  const toggleTime = (t: string) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !privatePhone.trim() || selectedTimes.length === 0)
      return;

    registerCarpoolMember({
      role,
      name: name.trim(),
      sector,
      regularTimes: selectedTimes,
      spareSeats: role === "Driver" ? Number(spareSeats) : 0,
      privatePhone: privatePhone.trim(),
      notes: notes.trim(),
    });

    setRegBanner(
      `Your ${role} listing in ${sector} has been added! Your phone number remains strictly hidden until you accept a match request.`
    );
    setName("");
    setPrivatePhone("");
    setNotes("");
  };

  const handleSendMatchRequest = (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim()) return;
    requestCarpoolMatch(memberId, {
      requesterName: reqName.trim(),
      requesterSector: reqSector,
      requesterPhone: reqPhone.trim(),
      message: reqMessage.trim() || "Assalamu Alaikum, would love to share journeys from our SL3 sector.",
    });
    setReqName("");
    setReqPhone("");
    setReqMessage("");
    setActiveMatchTargetId(null);
  };

  const visibleMembers =
    filterSector === "All"
      ? state.carpoolMembers
      : state.carpoolMembers.filter((m) => m.sector === filterSector);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <Car className="w-4 h-4" />
            <span>Module 06 • Slough Borough Council Sustainable Travel Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            SL3 Community Car-Share Matcher
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Privacy-first ride-sharing board for SL3 residents to reduce single-occupancy car journeys. Connect with neighbours on your street/sector for regular prayers and classes—<strong>personal phone numbers stay masked until a match request is accepted</strong>.
          </p>
        </div>

        <div className="bg-[#F0F7FC] border border-[#D0E6F7] rounded-2xl p-4 flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#005A9C] text-[#009FE3] flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-[#009FE3]">
              Privacy-First Handshake
            </div>
            <div className="text-sm font-bold text-[#005A9C]">
              Numbers Hidden Until Accepted
            </div>
            <div className="text-xs text-slate-500">
              Reduces Single-Occupancy Vehicles in SL3
            </div>
          </div>
        </div>
      </div>

      {regBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-bold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{regBanner}</span>
          </div>
          <button
            onClick={() => setRegBanner(null)}
            className="text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sector Filter Buttons */}
      <div className="bg-white rounded-2xl border border-[#D0E6F7] p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold text-[#005A9C] flex items-center gap-1 mr-2">
          <MapPin className="w-4 h-4 text-[#009FE3]" />
          Filter by SL3 Street / Sector:
        </span>
        {(["All", ...SL3_SECTORS] as const).map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setFilterSector(sec)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              filterSector === sec
                ? "bg-[#005A9C] text-white"
                : "bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7] hover:border-[#009FE3]"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Main Content: Matches Board + Registration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sector Matches Board */}
        <div className="lg:col-span-2 space-y-4">
          {visibleMembers.map((member) => {
            const hasAcceptedMatch = member.matchRequests.some(
              (r) => r.status === "Accepted"
            );

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        member.role === "Driver"
                          ? "bg-[#005A9C] text-white"
                          : "bg-[#009FE3] text-white"
                      }`}
                    >
                      {member.role === "Driver"
                        ? `Driver (${member.spareSeats} Spare Seats)`
                        : "Passenger Looking for Lift"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#F0F7FC] border border-[#D0E6F7] text-[#005A9C] font-extrabold text-xs inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#009FE3]" />
                      {member.sector}
                    </span>
                  </div>

                  {/* Privacy Status Indicator */}
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border ${
                      hasAcceptedMatch
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {hasAcceptedMatch ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Match Accepted — Contact Unlocked: {member.privatePhone}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Phone Hidden (07700 ••••••) Until Match Accepted</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#005A9C]">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {member.notes}
                  </p>
                </div>

                {/* Regular Prayer / Class Times */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 mr-1">
                    Regular Times:
                  </span>
                  {member.regularTimes.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-[#F0F7FC] text-[#005A9C] font-bold text-xs border border-[#D0E6F7]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Match Requests List & Handshake Controls */}
                {member.matchRequests.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Sector Match Requests ({member.matchRequests.length}):
                    </div>
                    {member.matchRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-[#005A9C]">
                            {req.requesterName} ({req.requesterSector})
                          </span>
                          <span className="text-slate-600 ml-2">
                            &ldquo;{req.message}&rdquo;
                          </span>
                          {req.status === "Accepted" && (
                            <div className="text-emerald-700 font-bold mt-0.5">
                              ✓ Handshake Complete — Requester Phone: {req.requesterPhone} | Member Phone: {member.privatePhone}
                            </div>
                          )}
                        </div>
                        {req.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() =>
                              acceptCarpoolMatch(member.id, req.id)
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                          >
                            Accept Match &amp; Reveal Phone
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                            Match Accepted
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Request a Match Toggle */}
                <div className="pt-2">
                  {activeMatchTargetId === member.id ? (
                    <form
                      onSubmit={(e) => handleSendMatchRequest(e, member.id)}
                      className="p-4 rounded-2xl bg-[#F0F7FC] border-2 border-[#009FE3] space-y-3"
                    >
                      <div className="text-xs font-extrabold text-[#005A9C]">
                        Request Car-Share Match with {member.name} ({member.sector})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          required
                          value={reqName}
                          onChange={(e) => setReqName(e.target.value)}
                          placeholder="Your Name *"
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <select
                          value={reqSector}
                          onChange={(e) =>
                            setReqSector(e.target.value as Sl3Sector)
                          }
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-[#005A9C] bg-white"
                        >
                          {SL3_SECTORS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          value={reqPhone}
                          onChange={(e) => setReqPhone(e.target.value)}
                          placeholder="Your Phone (Hidden until accepted) *"
                          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={reqMessage}
                        onChange={(e) => setReqMessage(e.target.value)}
                        placeholder="Short note (e.g., I attend Fajr & Isha from Trelawney Ave)..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#005A9C] text-white font-bold text-xs"
                        >
                          Send Privacy-Safe Request
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMatchTargetId(null)}
                          className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 font-bold text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMatchTargetId(member.id);
                        setReqSector(member.sector);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#F0F7FC] hover:bg-[#009FE3] hover:text-white text-[#005A9C] border border-[#D0E6F7] font-bold text-xs inline-flex items-center gap-2 transition"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Request Sector Match (Phone Masked)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Register as Driver or Passenger Form */}
        <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 shadow-md sticky top-24">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3] mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Join SL3 Car-Share Network</span>
          </div>
          <h2 className="text-xl font-black text-[#005A9C] mb-1">
            Register as Driver or Passenger
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            Help reduce vehicles around Langley by sharing rides from your SL3 sector.
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F7FC] rounded-xl border border-[#D0E6F7]">
              <button
                type="button"
                onClick={() => setRole("Driver")}
                className={`py-2.5 rounded-lg font-extrabold text-xs transition ${
                  role === "Driver"
                    ? "bg-[#005A9C] text-white"
                    : "text-[#005A9C]"
                }`}
              >
                Driver (Spare Seats)
              </button>
              <button
                type="button"
                onClick={() => setRole("Passenger")}
                className={`py-2.5 rounded-lg font-extrabold text-xs transition ${
                  role === "Passenger"
                    ? "bg-[#009FE3] text-white"
                    : "text-[#005A9C]"
                }`}
              >
                Passenger
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Display Name (e.g. Tariq M.) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name / Initials"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  SL3 Street / Sector *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sl3Sector)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                >
                  {SL3_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {role === "Driver" && (
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Spare Seats *
                  </label>
                  <select
                    value={spareSeats}
                    onChange={(e) => setSpareSeats(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
                  >
                    <option value={1}>1 Spare Seat</option>
                    <option value={2}>2 Spare Seats</option>
                    <option value={3}>3 Spare Seats</option>
                    <option value={4}>4+ Spare Seats</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1.5">
                Regular Prayers / Classes (Tap to Select) *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REGULAR_TIMES.map((t) => {
                  const active = selectedTimes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTime(t)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                        active
                          ? "bg-[#009FE3] text-white border-[#009FE3]"
                          : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Private Mobile Number (Masked Until Match Accepted) *
              </label>
              <input
                type="tel"
                required
                value={privatePhone}
                onChange={(e) => setPrivatePhone(e.target.value)}
                placeholder="07700 900XXX"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Pickup / Parking Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Parks at Harrow Market Car Park and walks 4 mins"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-sm shadow-md transition"
            >
              Post Privacy-Protected Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
