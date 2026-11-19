"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Car, Trash2, ShieldCheck, Clock, MapPin } from "lucide-react";

interface AdminCarpoolRow {
  id: string;
  role: "Driver" | "Passenger";
  name: string;
  sector: string;
  regularTimes: string[];
  spareSeats: number;
  notes: string;
  maskedPhone: string;
  createdAt: string;
  expiresAt: string;
  matchRequests: Array<{
    id: string;
    requesterName: string;
    requesterSector: string;
    status: "Pending" | "Accepted";
  }>;
}

export function AdminCarpoolModeration({
  onNotify,
}: {
  onNotify: (msg: string) => void;
}) {
  const [listings, setListings] = useState<AdminCarpoolRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
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
    void fetchListings();
  }, [fetchListings]);

  const handleAdminDelete = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/carpool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_listing",
          listingId: id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onNotify(
          data.message || `Erased car-share listing for "${name}" (UK GDPR Art. 17).`
        );
        await fetchListings();
      } else {
        onNotify(data.error || "Could not erase listing.");
      }
    } catch {
      onNotify("Network error while deleting car-share listing.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <ShieldCheck className="w-4 h-4" />
            <span>UK GDPR Art. 17 Right to Erasure &amp; 60-Day Retention Audit</span>
          </div>
          <h2 className="text-xl font-black text-[#005A9C]">
            SL3 Car-Share Listings Moderation (/carpool)
          </h2>
          <p className="text-xs text-slate-600">
            Phone numbers are isolated server-side in Supabase (London{" "}
            <code>eu-west-2</code>). Staff Admins can permanently erase any
            listing below with one click.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-[#F0F7FC] border border-[#D0E6F7] text-xs font-black text-[#005A9C]">
          Active Listings: {listings.length}
        </span>
      </div>

      {loading ? (
        <div className="text-xs font-bold text-slate-500 py-4">
          Loading car-share listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="text-xs font-bold text-slate-500 py-4">
          No active car-share listings in the database.
        </div>
      ) : (
        <div className="space-y-2.5">
          {listings.map((item) => {
            const expLabel = item.expiresAt
              ? new Date(item.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "60 days";
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#005A9C] text-white font-extrabold text-[11px] inline-flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {item.role}
                    </span>
                    <span className="font-black text-sm text-[#005A9C]">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white border border-[#D0E6F7] font-bold text-[#005A9C] inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#009FE3]" />
                      {item.sector}
                    </span>
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires: {expLabel}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Times: <strong>{item.regularTimes.join(", ")}</strong> •
                    Requests: <strong>{item.matchRequests.length}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdminDelete(item.id, item.name)}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs inline-flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Erase Listing (GDPR)</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
