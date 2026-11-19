"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Car,
  ShieldCheck,
  Lock,
  Unlock,
  MapPin,
  PlusCircle,
  CheckCircle2,
  Handshake,
  Trash2,
  KeyRound,
  AlertTriangle,
  MessageCircle,
  Clock,
} from "lucide-react";
import type { Sl3Sector } from "@/lib/db";

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

interface PublicCarpoolRequest {
  id: string;
  requesterName: string;
  requesterSector: string;
  message: string;
  status: "Pending" | "Accepted";
  createdAt: string;
}

interface PublicCarpoolListing {
  id: string;
  role: "Driver" | "Passenger";
  name: string;
  sector: Sl3Sector;
  regularTimes: string[];
  spareSeats: number;
  notes: string;
  maskedPhone: string;
  verifiedCommunityMember: boolean;
  createdAt: string;
  expiresAt: string;
  matchRequests: PublicCarpoolRequest[];
}

function toWaDeepLink(rawPhone: string, text: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const uk =
    digits.startsWith("07") && digits.length === 11
      ? `44${digits.slice(1)}`
      : digits;
  return `https://wa.me/${uk}?text=${encodeURIComponent(text)}`;
}

export default function CarpoolMatcherPage() {
  const [listings, setListings] = useState<PublicCarpoolListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState<"All" | Sl3Sector>("All");
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Match Request Form State
  const [activeMatchTargetId, setActiveMatchTargetId] = useState<string | null>(
    null
  );
  const [reqName, setReqName] = useState("");
  const [reqSector, setReqSector] = useState<Sl3Sector>("Langley High St");
  const [reqPhone, setReqPhone] = useState("");
  const [reqPin, setReqPin] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [reqConsent, setReqConsent] = useState(false);

  // PIN Unlock / Erasure Modal State
  const [pinAction, setPinAction] = useState<{
    mode: "owner_accept" | "requester_reveal" | "delete_listing";
    listingId: string;
    listingName: string;
    requestId?: string;
    requesterName?: string;
  } | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  // Privately unlocked phone numbers (held only in current user's memory, never saved publicly)
  const [unlockedContacts, setUnlockedContacts] = useState<
    Record<string, { name: string; phone: string; roleLabel: string }>
  >({});

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
  const [ownerPin, setOwnerPin] = useState("");
  const [notes, setNotes] = useState("");
  const [gdprAdultConsent, setGdprAdultConsent] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      const res = await fetch("/api/carpool", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && Array.isArray(data.listings)) {
        setListings(data.listings);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const toggleTime = (t: string) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !privatePhone.trim() ||
      !/^\d{4}$/.test(ownerPin) ||
      selectedTimes.length === 0 ||
      !gdprAdultConsent
    ) {
      setBanner({
        type: "error",
        text: "Please complete all fields, set a 4-digit numeric Listing PIN, and tick the 18+ & UK GDPR consent declaration.",
      });
      return;
    }

    setSubmittingReg(true);
    try {
      const res = await fetch("/api/carpool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_listing",
          role,
          name: name.trim(),
          sector,
          regularTimes: selectedTimes,
          spareSeats: role === "Driver" ? Number(spareSeats) : 0,
          privatePhone: privatePhone.trim(),
          ownerPin: ownerPin.trim(),
          notes: notes.trim(),
          gdprAdultConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: "error",
          text: data.error || "Could not create listing.",
        });
      } else {
        setBanner({
          type: "success",
          text: data.message,
        });
        setName("");
        setPrivatePhone("");
        setOwnerPin("");
        setNotes("");
        setGdprAdultConsent(false);
        await loadListings();
      }
    } catch {
      setBanner({
        type: "error",
        text: "Network error while saving listing.",
      });
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleSendMatchRequest = async (
    e: React.FormEvent,
    listingId: string
  ) => {
    e.preventDefault();
    if (
      !reqName.trim() ||
      !reqPhone.trim() ||
      !/^\d{4}$/.test(reqPin) ||
      !reqConsent
    ) {
      setBanner({
        type: "error",
        text: "Please enter your name, phone number, a 4-digit numeric Request PIN, and tick the 18+ & UK GDPR declaration.",
      });
      return;
    }

    try {
      const res = await fetch("/api/carpool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_match",
          listingId,
          requesterName: reqName.trim(),
          requesterSector: reqSector,
          requesterPhone: reqPhone.trim(),
          requesterPin: reqPin.trim(),
          message:
            reqMessage.trim() ||
            "Assalamu Alaikum, would love to share journeys from our SL3 sector.",
          gdprAdultConsent: reqConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: "error",
          text: data.error || "Could not submit match request.",
        });
      } else {
        setBanner({
          type: "success",
          text: data.message,
        });
        setReqName("");
        setReqPhone("");
        setReqPin("");
        setReqMessage("");
        setReqConsent(false);
        setActiveMatchTargetId(null);
        await loadListings();
      }
    } catch {
      setBanner({
        type: "error",
        text: "Network error while sending request.",
      });
    }
  };

  const handleExecutePinAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinAction) return;
    setPinBusy(true);
    try {
      const payload =
        pinAction.mode === "owner_accept"
          ? {
              action: "owner_accept_and_reveal",
              listingId: pinAction.listingId,
              requestId: pinAction.requestId,
              ownerPin: pinInput.trim(),
            }
          : pinAction.mode === "requester_reveal"
          ? {
              action: "requester_reveal_accepted",
              listingId: pinAction.listingId,
              requestId: pinAction.requestId,
              requesterPin: pinInput.trim(),
            }
          : {
              action: "delete_listing",
              listingId: pinAction.listingId,
              ownerPin: pinInput.trim(),
            };

      const res = await fetch("/api/carpool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setBanner({
          type: "error",
          text: data.error || "PIN verification failed.",
        });
      } else {
        if (
          (pinAction.mode === "owner_accept" ||
            pinAction.mode === "requester_reveal") &&
          data.revealedPhone
        ) {
          const key = `${pinAction.listingId}:${pinAction.requestId}:${pinAction.mode}`;
          setUnlockedContacts((prev) => ({
            ...prev,
            [key]: {
              name: data.revealedName,
              phone: data.revealedPhone,
              roleLabel:
                pinAction.mode === "owner_accept"
                  ? "Requester Phone (Private to You)"
                  : "Listing Owner Phone (Private to You)",
            },
          }));
          setBanner({
            type: "success",
            text: `Verified! Contact number for ${data.revealedName} (${data.revealedPhone}) is now unlocked privately in your browser session only.`,
          });
        } else if (pinAction.mode === "delete_listing") {
          setBanner({
            type: "success",
            text: data.message,
          });
        }
        setPinAction(null);
        setPinInput("");
        await loadListings();
      }
    } catch {
      setBanner({
        type: "error",
        text: "Failed to verify PIN.",
      });
    } finally {
      setPinBusy(false);
    }
  };

  const visibleMembers =
    filterSector === "All"
      ? listings
      : listings.filter((m) => m.sector === filterSector);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <Car className="w-4 h-4" />
            <span>
              UK GDPR &amp; 18+ Safeguarded • Slough Borough Council Travel Plan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            SL3 Community Car-Share Matcher
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Zero-leakage ride-sharing board for adult SL3 residents (18+) to
            reduce single-occupancy car journeys.{" "}
            <strong>
              Personal phone numbers are isolated server-side in London
              (eu-west-2) and never transmitted in public page data
            </strong>
            —contacts are only revealed privately when verified with your
            4-digit PIN.
          </p>
        </div>

        <div className="bg-[#F0F7FC] border border-[#D0E6F7] rounded-2xl p-4 flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#005A9C] text-[#009FE3] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase text-[#009FE3]">
              UK GDPR Server Isolation
            </div>
            <div className="text-sm font-bold text-[#005A9C]">
              PIN-Protected Handshake &amp; Erasure
            </div>
            <div className="text-xs text-slate-500">
              60-Day Auto-Expiry • UK London Data Residency
            </div>
          </div>
        </div>
      </div>

      {/* UK GDPR, 18+ Safeguarding & Insurance Governance Bar */}
      <div className="bg-[#F0F7FC] rounded-2xl border-2 border-[#D0E6F7] p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#005A9C] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#005A9C]">
              1. Server-Side Phone Isolation (Art. 5(1)(f)):
            </strong>{" "}
            Phone numbers are stored in a protected Supabase column and never
            sent in public JSON responses.
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-[#005A9C] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#005A9C]">
              2. Right to Erasure &amp; 60-Day Expiry (Art. 17):
            </strong>{" "}
            Use your 4-digit PIN at any time to permanently erase your listing,
            or let it auto-expire after 60 days.
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#005A9C]">
              3. Adults 18+ &amp; Motor Insurance:
            </strong>{" "}
            Strictly for adults aged 18+. Drivers must hold a valid UK driving
            licence &amp; motor insurance.
          </div>
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm flex items-center justify-between gap-3 ${
            banner.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-950"
              : "bg-red-50 border-red-400 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`w-5 h-5 shrink-0 ${
                banner.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            />
            <span>{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* PIN Verification Modal for Owner Accept / Requester Reveal / GDPR Erasure */}
      {pinAction && (
        <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[#009FE3]" />
              <h3 className="text-base sm:text-lg font-black text-[#005A9C]">
                {pinAction.mode === "owner_accept"
                  ? `Listing Owner Verification — Accept & Reveal ${pinAction.requesterName}'s Phone`
                  : pinAction.mode === "requester_reveal"
                  ? `Requester Verification — Privately Reveal ${pinAction.listingName}'s Phone`
                  : `UK GDPR Right to Erasure — Permanently Delete Listing (${pinAction.listingName})`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setPinAction(null);
                setPinInput("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-slate-600">
            {pinAction.mode === "owner_accept"
              ? "Enter the 4-digit Listing PIN you set when creating this listing (demo listings use PIN 1234). The requester's phone number will be revealed ONLY in your private browser session."
              : pinAction.mode === "requester_reveal"
              ? "Enter the 4-digit Request PIN you chose when sending your match request (demo requests use PIN 1234). The listing owner's phone number will be revealed ONLY in your private browser session."
              : "Enter your 4-digit Listing PIN to permanently erase this listing and all associated match requests from Supabase."}
          </p>

          <form
            onSubmit={handleExecutePinAction}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              value={pinInput}
              onChange={(e) =>
                setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="4-Digit PIN"
              className="w-40 h-11 px-3.5 rounded-xl border-2 border-[#005A9C] font-mono text-center text-base font-black tracking-widest"
            />
            <button
              type="submit"
              disabled={pinBusy}
              className={`h-11 px-5 rounded-xl text-white font-black text-xs transition ${
                pinAction.mode === "delete_listing"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#005A9C] hover:bg-[#003F6E]"
              }`}
            >
              {pinBusy
                ? "Verifying..."
                : pinAction.mode === "owner_accept"
                ? "Verify PIN, Accept & Reveal Phone"
                : pinAction.mode === "requester_reveal"
                ? "Verify PIN & Reveal Phone"
                : "Verify PIN & Permanently Erase"}
            </button>
          </form>
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
          {loading ? (
            <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-8 text-center text-xs font-bold text-slate-500">
              Loading privacy-protected SL3 car-share listings from London
              (eu-west-2)...
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-8 text-center text-xs font-bold text-slate-500">
              No active car-share listings in this SL3 sector yet. Use the form
              on the right to register.
            </div>
          ) : (
            visibleMembers.map((member) => {
              const expiryDate = member.expiresAt
                ? new Date(member.expiresAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "60 days";

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
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
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Auto-expires {expiryDate}
                      </span>
                    </div>

                    {/* Server-Isolated Privacy Status & GDPR Delete Button */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border bg-slate-100 border-slate-200 text-slate-700">
                        <Lock className="w-3.5 h-3.5 text-[#005A9C]" />
                        <span>{member.maskedPhone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPinAction({
                            mode: "delete_listing",
                            listingId: member.id,
                            listingName: member.name,
                          })
                        }
                        title="Delete My Listing (UK GDPR Right to Erasure)"
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete (PIN)</span>
                      </button>
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

                  {/* Match Requests List & PIN-Authenticated Handshake Controls */}
                  {member.matchRequests.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                        Sector Match Requests ({member.matchRequests.length}):
                      </div>
                      {member.matchRequests.map((req) => {
                        const ownerUnlockKey = `${member.id}:${req.id}:owner_accept`;
                        const reqUnlockKey = `${member.id}:${req.id}:requester_reveal`;
                        const ownerRevealed = unlockedContacts[ownerUnlockKey];
                        const reqRevealed = unlockedContacts[reqUnlockKey];

                        return (
                          <div
                            key={req.id}
                            className="p-3.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] space-y-2 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-[#005A9C]">
                                  {req.requesterName} ({req.requesterSector})
                                </span>
                                <span className="text-slate-600 ml-2">
                                  &ldquo;{req.message}&rdquo;
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {req.status === "Pending" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPinAction({
                                        mode: "owner_accept",
                                        listingId: member.id,
                                        listingName: member.name,
                                        requestId: req.id,
                                        requesterName: req.requesterName,
                                      })
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                    <span>Owner: Accept &amp; View Phone (PIN)</span>
                                  </button>
                                ) : (
                                  <>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                                      ✓ Match Accepted
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPinAction({
                                          mode: "owner_accept",
                                          listingId: member.id,
                                          listingName: member.name,
                                          requestId: req.id,
                                          requesterName: req.requesterName,
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-white border border-[#D0E6F7] text-[#005A9C] font-bold text-[11px] hover:bg-[#005A9C] hover:text-white transition"
                                    >
                                      Owner: View Phone (PIN)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPinAction({
                                          mode: "requester_reveal",
                                          listingId: member.id,
                                          listingName: member.name,
                                          requestId: req.id,
                                          requesterName: req.requesterName,
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-[#005A9C] text-white font-bold text-[11px] hover:bg-[#003F6E] transition"
                                    >
                                      Requester: View {member.name}&apos;s Phone (PIN)
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Private Session-Only Contact Reveal Banner */}
                            {(ownerRevealed || reqRevealed) && (
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-extrabold">
                                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>
                                    {(ownerRevealed || reqRevealed).roleLabel}:{" "}
                                    {(ownerRevealed || reqRevealed).name} —{" "}
                                    <span className="font-mono">
                                      {(ownerRevealed || reqRevealed).phone}
                                    </span>
                                  </span>
                                </div>
                                <a
                                  href={toWaDeepLink(
                                    (ownerRevealed || reqRevealed).phone,
                                    `Assalamu Alaikum ${
                                      (ownerRevealed || reqRevealed).name
                                    }, connecting via the LIC SL3 Community Car-Share Matcher (${
                                      member.sector
                                    }).`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Message on WhatsApp</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                          Request Car-Share Match with {member.name} (
                          {member.sector})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            required
                            value={reqName}
                            onChange={(e) => setReqName(e.target.value)}
                            placeholder="Your Display Name (e.g. Bilal H.) *"
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
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="tel"
                            required
                            value={reqPhone}
                            onChange={(e) => setReqPhone(e.target.value)}
                            placeholder="Your Mobile (Isolated on Server) *"
                            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            required
                            value={reqPin}
                            onChange={(e) =>
                              setReqPin(
                                e.target.value.replace(/\D/g, "").slice(0, 4)
                              )
                            }
                            placeholder="Set 4-Digit Request PIN *"
                            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          value={reqMessage}
                          onChange={(e) => setReqMessage(e.target.value)}
                          placeholder="Short note (e.g., I attend Fajr & Isha from Trelawney Ave)..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            required
                            checked={reqConsent}
                            onChange={(e) => setReqConsent(e.target.checked)}
                            className="mt-0.5 rounded accent-[#005A9C]"
                          />
                          <span>
                            <strong>18+ &amp; UK GDPR Consent:</strong> I
                            confirm I am aged 18+ and consent to LIC storing my
                            phone number server-side to share with {member.name}{" "}
                            if they accept this request.
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#005A9C] text-white font-bold text-xs"
                          >
                            Send PIN-Protected Request
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
                        <span>Request Sector Match (Phone Server-Isolated)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
            Help reduce vehicles around Langley by sharing rides from your SL3
            sector. Automatically expires after 60 days.
          </p>

          <form onSubmit={handleRegister} className="space-y-3.5">
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
                Display Name / Initials (e.g. Tariq M.) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Name & Initial"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  SL3 Street / Sector *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as Sl3Sector)}
                  className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
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
                    className="w-full h-10 px-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#005A9C]"
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
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
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
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Private Mobile (Isolated) *
                </label>
                <input
                  type="tel"
                  required
                  value={privatePhone}
                  onChange={(e) => setPrivatePhone(e.target.value)}
                  placeholder="07700 900XXX"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Set 4-Digit Listing PIN *
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={ownerPin}
                  onChange={(e) =>
                    setOwnerPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 4829"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
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
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            {/* Mandatory UK GDPR, 18+ Safeguarding & Motor Insurance Declaration */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-[11px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={gdprAdultConsent}
                onChange={(e) => setGdprAdultConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#005A9C] shrink-0"
              />
              <span>
                <strong className="text-[#005A9C]">
                  UK GDPR, 18+ Safeguarding &amp; Insurance Declaration:
                </strong>{" "}
                I confirm I am an adult aged <strong>18+</strong>, hold a valid
                UK driving licence and motor insurance (if driving), and consent
                to LIC storing my mobile number server-side for up to{" "}
                <strong>60 days</strong> for SL3 car-share matching. I can erase
                my listing at any time using my 4-digit PIN.
              </span>
            </label>

            <button
              type="submit"
              disabled={submittingReg}
              className="w-full h-11 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs sm:text-sm shadow-md transition"
            >
              {submittingReg
                ? "Saving Encrypted Listing..."
                : "Post UK GDPR-Protected Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
