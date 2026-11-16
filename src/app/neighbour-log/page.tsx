"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  QrCode,
  FileCheck2,
  Clock,
  UserCheck,
  Send,
} from "lucide-react";
import { useLicStore, NeighbourIncident } from "@/lib/db";
import { PinGate } from "@/components/PinLockModal";

export default function NeighbourLiaisonPage() {
  const { state, submitNeighbourIncident, updateIncidentStatus } = useLicStore();
  const [tab, setTab] = useState<"report" | "admin">("report");

  // Public Submission Form State
  const [category, setCategory] = useState<NeighbourIncident["category"]>(
    "Parking / Idling on Spitfire Close"
  );
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [description, setDescription] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  // Admin Edit State
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const ticketId = submitNeighbourIncident({
      category,
      reporterName: reporterName.trim() || "Spitfire Close Resident",
      reporterContact: reporterContact.trim() || "Provided on form",
      incidentTime:
        incidentTime.trim() ||
        new Date().toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        }),
      description: description.trim(),
    });

    setGeneratedTicket(ticketId);
    setReporterName("");
    setReporterContact("");
    setIncidentTime("");
    setDescription("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <ShieldAlert className="w-4 h-4" />
            <span>Module 08 • Exterior Door QR Notice &amp; SBC Audit Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Digital Neighbour Liaison &amp; Incident Log
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Dedicated communication channel for Spitfire Close residents and neighbours to report parking, noise, or general feedback directly to Operations Lead <strong>Waqar Ahmed</strong>. Every submission generates a tracked Ticket ID for Slough Borough Council (SBC) compliance audits.
          </p>
        </div>

        <div className="bg-[#F0F7FC] p-1.5 rounded-2xl border-2 border-[#D0E6F7] inline-flex self-start lg:self-center">
          <button
            type="button"
            onClick={() => setTab("report")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              tab === "report"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C]"
            }`}
          >
            Public Neighbour Report Form
          </button>
          <button
            type="button"
            onClick={() => setTab("admin")}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition ${
              tab === "admin"
                ? "bg-[#005A9C] text-white shadow-sm"
                : "text-[#005A9C]"
            }`}
          >
            Internal Operations &amp; SBC Audit Log (PIN Locked)
          </button>
        </div>
      </div>

      {tab === "report" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Public Submission Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm">
            {generatedTicket ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    Instant Operations Alert Triggered
                  </span>
                  <h2 className="text-2xl font-black text-emerald-950">
                    Ticket Reference: {generatedTicket}
                  </h2>
                  <p className="text-sm text-emerald-900 max-w-lg mx-auto">
                    Thank you. An automated alert has been sent directly to{" "}
                    <strong>Waqar Ahmed (Operations Lead)</strong>. This ticket is logged in our permanent Slough Borough Council (SBC) Liaison Register.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedTicket(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#005A9C] text-white font-bold text-xs"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitIncident} className="space-y-4">
                <h2 className="text-xl font-black text-[#005A9C]">
                  Submit Neighbour Feedback or Incident Report
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Linked directly from the QR notice on the Spitfire Close entrance door.
                </p>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Nature of Feedback or Incident *
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as NeighbourIncident["category"]
                      )
                    }
                    className="w-full h-12 px-3.5 rounded-xl border-2 border-[#D0E6F7] bg-[#F0F7FC] font-bold text-sm text-[#005A9C]"
                  >
                    <option value="Parking in Unmarked Resident Yard / Mencap">
                      Parking in Unmarked Resident Yard / Mencap Next Door
                    </option>
                    <option value="Parking / Idling on Spitfire Close">
                      Parking / Idling on Spitfire Close
                    </option>
                    <option value="Noise / Evening Dispersal">
                      Noise / Evening Dispersal
                    </option>
                    <option value="General Community Feedback">
                      General Community Feedback
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Your Name / House Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Spitfire Close Resident"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                      Phone or Email for Update (Optional)
                    </label>
                    <input
                      type="text"
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      placeholder="Phone or email for resolution update"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Date &amp; Approximate Time of Observation
                  </label>
                  <input
                    type="text"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    placeholder="e.g. Today at 17:15 (leaves current timestamp if blank)"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Details (Vehicle Registration / Description / Feedback) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe what occurred (including vehicle colour/registration if reporting a parking issue)..."
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-base shadow-md inline-flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-5 h-5 text-[#009FE3]" />
                  <span>Generate Ticket ID &amp; Alert Operations Lead</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Operations Lead SLA & Exterior Door QR Notice Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#005A9C] text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#009FE3] flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase text-[#7FD4FF]">
                    Dedicated Neighbour Liaison Officer
                  </div>
                  <div className="text-lg font-black">
                    Waqar Ahmed — Operations Lead
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                Langley Islamic Centre is committed to being an exemplary neighbour on Spitfire Close. Every report submitted here:
              </p>

              <ul className="space-y-2 text-xs text-slate-100 font-medium">
                <li>• Immediately alerts Operations Lead Waqar Ahmed &amp; on-duty Door Marshals.</li>
                <li>• Generates a permanent Ticket ID auditable by Slough Borough Council (SBC).</li>
                <li>• Tracks investigation notes and resolution timestamps.</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-center text-[#005A9C] shrink-0">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#005A9C]">
                  Exterior Door A4 QR Notice Active
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Displayed at the Spitfire Close entrance so any resident can scan and log feedback in under 30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PIN-PROTECTED ADMIN AUDIT VIEW (2580) */
        <PinGate
          title="Internal SBC Neighbour Liaison Audit Log"
          subtitle="Operations Lead (Waqar Ahmed) & Trustee view to record investigation notes and resolution timestamps for Slough Borough Council audits."
        >
          <div className="space-y-4">
            {state.neighbourIncidents.map((inc) => {
              const noteVal =
                editingNotes[inc.id] !== undefined
                  ? editingNotes[inc.id]
                  : inc.investigationNotes;

              return (
                <div
                  key={inc.id}
                  className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-lg bg-[#005A9C] text-white font-mono font-black text-xs">
                        {inc.ticketId}
                      </span>
                      <span className="font-extrabold text-sm text-[#005A9C]">
                        {inc.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          inc.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : inc.status === "Investigating"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Status: {inc.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold">Reporter:</span>{" "}
                      <strong className="text-slate-800">{inc.reporterName}</strong> (
                      {inc.reporterContact})
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Logged At:</span>{" "}
                      <strong className="text-slate-800">
                        {new Date(inc.createdAt).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold">Assigned Lead:</span>{" "}
                      <strong className="text-[#005A9C]">{inc.assignedLead}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs sm:text-sm text-slate-800">
                    <strong>Incident Description:</strong> {inc.description}
                  </div>

                  {/* Investigation Notes & Resolution Timestamp Controls */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-extrabold text-[#005A9C]">
                      Investigation Notes &amp; Corrective Action (SBC Audit Record):
                    </label>
                    <textarea
                      rows={2}
                      value={noteVal}
                      onChange={(e) =>
                        setEditingNotes((prev) => ({
                          ...prev,
                          [inc.id]: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#009FE3]" />
                        {inc.resolvedAt ? (
                          <span>
                            Resolution Timestamp:{" "}
                            <strong className="text-emerald-700">
                              {new Date(inc.resolvedAt).toLocaleString()}
                            </strong>
                          </span>
                        ) : (
                          <span>Pending Resolution Timestamp</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateIncidentStatus(inc.id, "Investigating", noteVal)
                          }
                          className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                        >
                          Mark Investigating
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateIncidentStatus(inc.id, "Resolved", noteVal)
                          }
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Save Notes &amp; Stamp Resolved</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PinGate>
      )}
    </div>
  );
}
