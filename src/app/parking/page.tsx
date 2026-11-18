"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  OctagonAlert,
  CheckCircle2,
  Bike,
  Navigation,
  Footprints,
  Bus,
  Car,
  ExternalLink,
  Info,
} from "lucide-react";

type ZoneFilter = "ALL" | "RED" | "GREEN" | "BLUE";

interface MapFeatureInfo {
  id: string;
  title: string;
  zoneType: "RED" | "GREEN" | "BLUE" | "BUILDING";
  badge: string;
  description: string;
}

const SPITFIRE_FEATURES: Record<string, MapFeatureInfo> = {
  mencap: {
    id: "mencap",
    title: "Mencap Car Park (Next Door — With Metal Gates)",
    zoneType: "RED",
    badge: "STRICTLY NO LIC PARKING (RED ZONE)",
    description:
      "Located immediately next door to LIC behind metal gates. This is private Mencap property and car park. LIC visitors must never park in or obstruct the Mencap metal gates.",
  },
  residentYard: {
    id: "residentYard",
    title: "Unmarked Resident Parking Yard (Directly in Front of LIC)",
    zoneType: "RED",
    badge: "STRICTLY NO LIC PARKING — EVEN WITH NO GATE/SIGNAGE",
    description:
      "Located directly opposite/in front of the LIC building. IMPORTANT: This yard has NO gate and NO signage displayed, which can mislead visitors — however, it is strictly private residential parking. LIC visitors must NEVER park or wait inside this yard.",
  },
  endBays: {
    id: "endBays",
    title: "Public Parking Bays (At the End of LIC)",
    zoneType: "GREEN",
    badge: "PERMITTED PUBLIC PARKING (GREEN ZONE)",
    description:
      "Designated public parking bays located right at the end of the LIC building on Spitfire Close. Permitted for visitors when spaces are available (do not double-park).",
  },
  layby: {
    id: "layby",
    title: "Public Layby (In Front of LIC)",
    zoneType: "GREEN",
    badge: "PERMITTED PUBLIC LAYBY (GREEN ZONE)",
    description:
      "The roadside layby directly in front of the LIC pavement is public parking and may be used legally by visitors and blue-badge/drop-off users when spaces are free.",
  },
  commonHarrow: {
    id: "commonHarrow",
    title: "Common Road (2–3m Walk), Harvey Park & Harrow Market Car Parks",
    zoneType: "GREEN",
    badge: "PRIMARY OVERFLOW PERMITTED PARKING (GREEN ZONE)",
    description:
      "Whenever the public layby and end-of-LIC bays are full, visitors must park on Common Road unrestricted zones, Harvey Park Car Park (Langley SL3), or Harrow Market Car Park (SL3 8HJ) and walk 2–5 minutes into Spitfire Close.",
  },
  harveyPark: {
    id: "harveyPark",
    title: "Harvey Park Car Park (Close to LIC — Langley SL3)",
    zoneType: "GREEN",
    badge: "PERMITTED NEARBY CAR PARK (GREEN ZONE)",
    description:
      "Harvey Park Car Park is another very close public car park to LIC (approx. 3–4 minute walk). Ideal for daily prayers, Children's Quran class drop-off/pick-up, and event slot visitors.",
  },
  cycleRack: {
    id: "cycleRack",
    title: "LIC On-Site Cycle Rack & SL3 Bus Stops",
    zoneType: "BLUE",
    badge: "ACTIVE TRAVEL (BLUE ZONE)",
    description:
      "Dedicated bicycle parking rack at the LIC entrance and nearby SL3 bus stops on Common Road and Langley High Street.",
  },
};

export default function ParkingMapPage() {
  const [selectedZone, setSelectedZone] = useState<ZoneFilter>("ALL");
  const [selectedFeature, setSelectedFeature] = useState<MapFeatureInfo>(
    SPITFIRE_FEATURES.residentYard
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
            <MapPin className="w-4 h-4" />
            <span>Public Community Guide • Spitfire Close (SL3) Parking Layout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#005A9C]">
            Interactive Spitfire Close Travel &amp; Parking Map
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Please study our exact Spitfire Close layout before arriving. Know the difference between the <strong>Forbidden Red Zones</strong> (Mencap Gated Car Park next door &amp; the Unmarked Resident Parking Yard in front of LIC) and the <strong>Permitted Green Zones</strong> (Public Bays at the end of LIC, the Layby in front of LIC, Common Road, <strong>Harvey Park Car Park</strong>, and Harrow Market Car Park).
          </p>
        </div>

        {/* 1-Tap Primary Google Maps Navigation Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 shrink-0">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Common+Road+Langley+Slough+SL3+8J"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-2 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Common Rd Map</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Harvey+Park+Langley+Slough+SL3"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-black text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-2 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Harvey Park Car Park</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Harrow+Market+Car+Park+Langley+SL3+8HJ"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-2 transition"
          >
            <Navigation className="w-4 h-4 text-[#009FE3]" />
            <span>Harrow Market Car Park</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Interactive Visual Schematic Map of Spitfire Close */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#005A9C]">
              Accurate Spitfire Close Interactive Site Schematic
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Click any zone on the map or use the filter buttons to inspect exact parking boundaries on Spitfire Close.
            </p>
          </div>

          {/* Zone Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedZone("ALL")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs border transition ${
                selectedZone === "ALL"
                  ? "bg-[#005A9C] text-white border-[#005A9C]"
                  : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
              }`}
            >
              Show All Zones
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("RED")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs border transition ${
                selectedZone === "RED"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              Red: Strictly No Parking
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("GREEN")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs border transition ${
                selectedZone === "GREEN"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              Green: Permitted Public Parking
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("BLUE")}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs border transition ${
                selectedZone === "BLUE"
                  ? "bg-[#009FE3] text-white border-[#009FE3]"
                  : "bg-sky-50 text-[#005A9C] border-sky-200"
              }`}
            >
              Blue: Active Travel
            </button>
          </div>
        </div>

        {/* Interactive SVG Schematic of Spitfire Close */}
        <div className="w-full overflow-x-auto bg-[#F0F7FC] rounded-2xl border-2 border-[#D0E6F7] p-4">
          <svg
            viewBox="0 0 920 430"
            className="w-full min-w-[720px] h-auto select-none"
            role="img"
            aria-label="Accurate Spitfire Close Site Schematic showing Mencap with metal gates next door, Unmarked Resident Parking Yard in front of LIC, Public Layby in front of LIC, and Public Parking Bays at the end of LIC"
          >
            {/* Background */}
            <rect x="0" y="0" width="920" height="430" rx="16" fill="#F0F7FC" />

            {/* COMMON ROAD (Vertical Main Road on Right) */}
            <rect x="650" y="15" width="66" height="400" fill="#CBD5E1" rx="6" />
            <line
              x1="683"
              y1="25"
              x2="683"
              y2="405"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeDasharray="10 10"
            />
            <text
              x="673"
              y="225"
              transform="rotate(-90 673 225)"
              fill="#1E293B"
              fontSize="13"
              fontWeight="800"
              letterSpacing="2"
            >
              COMMON ROAD (SL3)
            </text>

            {/* SPITFIRE CLOSE ROADWAY (Horizontal Road leading West from Common Rd to LIC) */}
            <rect x="145" y="175" width="510" height="60" fill="#CBD5E1" rx="6" />
            <line
              x1="160"
              y1="205"
              x2="645"
              y2="205"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="8 8"
            />
            <text x="415" y="198" fill="#1E293B" fontSize="13" fontWeight="900" letterSpacing="1.5">
              SPITFIRE CLOSE ROADWAY
            </text>

            {/* ============================================================ */}
            {/* NORTH SIDE OF SPITFIRE CLOSE: LIC BUILDING + MENCAP NEXT DOOR */}
            {/* ============================================================ */}

            {/* LIC BUILDING (Top-Left) */}
            <rect
              x="165"
              y="32"
              width="210"
              height="95"
              rx="12"
              fill="#005A9C"
              stroke="#009FE3"
              strokeWidth="3.5"
            />
            <text x="270" y="64" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900">
              LANGLEY ISLAMIC CENTRE
            </text>
            <text x="270" y="84" textAnchor="middle" fill="#7FD4FF" fontSize="11" fontWeight="700">
              (LIC Building • Max 40 Persons)
            </text>
            <text x="270" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
              ▼ Main Entrance &amp; Kiosk
            </text>

            {/* GREEN ZONE 1: LAYBY IN FRONT OF LIC (Left of Cycle Rack) */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.layby)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "GREEN" ? 1 : 0.22}
            >
              <rect
                x="165"
                y="133"
                width="145"
                height="38"
                rx="8"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="3"
              />
              <text x="237" y="150" textAnchor="middle" fill="#14532D" fontSize="11" fontWeight="900">
                ✓ PUBLIC LAYBY
              </text>
              <text x="237" y="163" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="800">
                In Front of LIC (Permitted)
              </text>
            </g>

            {/* BLUE ZONE: Cycle Rack Outside LIC (Right of Public Layby) */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.cycleRack)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "BLUE" ? 1 : 0.22}
            >
              <rect
                x="318"
                y="133"
                width="82"
                height="38"
                rx="8"
                fill="#E0F2FE"
                stroke="#009FE3"
                strokeWidth="2.5"
              />
              <text x="359" y="150" textAnchor="middle" fill="#005A9C" fontSize="10" fontWeight="900">
                CYCLE RACK
              </text>
              <text x="359" y="162" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="700">
                (Blue Zone)
              </text>
            </g>

            {/* GREEN ZONE 2: PUBLIC PARKING BAYS AT THE END OF LIC */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.endBays)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "GREEN" ? 1 : 0.22}
            >
              <rect
                x="22"
                y="32"
                width="132"
                height="203"
                rx="12"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="3"
              />
              {/* Individual Bay Lines */}
              <line x1="26" y1="82" x2="65" y2="82" stroke="#16A34A" strokeWidth="2" />
              <line x1="26" y1="115" x2="65" y2="115" stroke="#16A34A" strokeWidth="2" />
              <line x1="26" y1="148" x2="65" y2="148" stroke="#16A34A" strokeWidth="2" />
              <line x1="26" y1="181" x2="65" y2="181" stroke="#16A34A" strokeWidth="2" />

              <text x="88" y="75" textAnchor="middle" fill="#14532D" fontSize="12" fontWeight="900">
                ✓ PUBLIC BAYS
              </text>
              <text x="88" y="94" textAnchor="middle" fill="#14532D" fontSize="11" fontWeight="800">
                AT END OF LIC
              </text>
              <text x="88" y="118" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="700">
                Permitted Public
              </text>
              <text x="88" y="133" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="700">
                Parking Spaces
              </text>
              <text x="88" y="158" textAnchor="middle" fill="#15803D" fontSize="10" fontWeight="900">
                (GREEN ZONE)
              </text>
            </g>

            {/* RED ZONE 1: MENCAP NEXT DOOR (WITH METAL GATES) */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.mencap)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "RED" ? 1 : 0.22}
            >
              <rect
                x="412"
                y="32"
                width="222"
                height="136"
                rx="12"
                fill="#FEE2E2"
                stroke="#DC2626"
                strokeWidth="3"
              />
              {/* Metal Gates Graphic at Mencap Entrance */}
              <rect
                x="452"
                y="156"
                width="142"
                height="16"
                rx="3"
                fill="#475569"
                stroke="#1E293B"
                strokeWidth="2"
              />
              <text x="523" y="167" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">
                ═══ METAL GATES ═══
              </text>

              <text x="523" y="62" textAnchor="middle" fill="#7F1D1D" fontSize="13" fontWeight="900">
                ✕ MENCAP NEXT DOOR
              </text>
              <text x="523" y="81" textAnchor="middle" fill="#991B1B" fontSize="11" fontWeight="800">
                (Private Car Park Behind Metal Gates)
              </text>
              <text x="523" y="104" textAnchor="middle" fill="#B91C1C" fontSize="11" fontWeight="900">
                STRICTLY NO LIC PARKING
              </text>
              <text x="523" y="122" textAnchor="middle" fill="#991B1B" fontSize="10" fontWeight="700">
                Do Not Park Inside or Block Gates
              </text>
            </g>

            {/* ============================================================ */}
            {/* SOUTH SIDE (IN FRONT OF LIC): UNMARKED RESIDENT PARKING YARD */}
            {/* ============================================================ */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.residentYard)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "RED" ? 1 : 0.22}
            >
              <rect
                x="165"
                y="246"
                width="315"
                height="152"
                rx="14"
                fill="#FEE2E2"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeDasharray="10 5"
              />
              {/* Open Unmarked Entrance Indicator */}
              <rect
                x="235"
                y="236"
                width="175"
                height="20"
                rx="4"
                fill="#FEF2F2"
                stroke="#DC2626"
                strokeWidth="2"
              />
              <text x="322" y="249" textAnchor="middle" fill="#DC2626" fontSize="9.5" fontWeight="900">
                ⚠ OPEN ENTRANCE (NO GATE / NO SIGNAGE)
              </text>

              <text x="322" y="282" textAnchor="middle" fill="#7F1D1D" fontSize="14" fontWeight="900">
                ✕ RESIDENT PARKING YARD
              </text>
              <text x="322" y="302" textAnchor="middle" fill="#991B1B" fontSize="12" fontWeight="800">
                (Directly In Front of LIC Building)
              </text>
              <text x="322" y="326" textAnchor="middle" fill="#B91C1C" fontSize="11" fontWeight="900">
                NO GATE OR SIGNAGE DISPLAYED — DO NOT BE MISLED!
              </text>
              <text x="322" y="346" textAnchor="middle" fill="#7F1D1D" fontSize="11" fontWeight="800">
                STRICTLY PRIVATE RESIDENTS ONLY • ZERO LIC VISITOR PARKING
              </text>
              <text x="322" y="368" textAnchor="middle" fill="#991B1B" fontSize="10" fontWeight="700">
                Patrolled by LIC Door Marshals During All Sessions
              </text>
            </g>

            {/* ============================================================ */}
            {/* EAST SIDE: COMMON RD, HARVEY PARK & HARROW MARKET (GREEN)    */}
            {/* ============================================================ */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.commonHarrow)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "GREEN" ? 1 : 0.22}
            >
              {/* Common Road Unrestricted Bays */}
              <rect
                x="728"
                y="25"
                width="170"
                height="112"
                rx="12"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="3"
              />
              <text x="813" y="52" textAnchor="middle" fill="#14532D" fontSize="12" fontWeight="900">
                ✓ COMMON ROAD
              </text>
              <text x="813" y="70" textAnchor="middle" fill="#166534" fontSize="10.5" fontWeight="800">
                Unrestricted Public Zones
              </text>
              <text x="813" y="90" textAnchor="middle" fill="#15803D" fontSize="10.5" fontWeight="800">
                • 2–3 Min Walk to LIC
              </text>
              <text x="813" y="110" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="700">
                Roadside Public Parking
              </text>
            </g>

            {/* Harvey Park Car Park */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.harveyPark)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "GREEN" ? 1 : 0.22}
            >
              <rect
                x="728"
                y="150"
                width="170"
                height="118"
                rx="12"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="3"
              />
              <text x="813" y="177" textAnchor="middle" fill="#14532D" fontSize="12" fontWeight="900">
                ✓ HARVEY PARK
              </text>
              <text x="813" y="194" textAnchor="middle" fill="#14532D" fontSize="11" fontWeight="900">
                CAR PARK (LANGLEY)
              </text>
              <text x="813" y="214" textAnchor="middle" fill="#15803D" fontSize="10.5" fontWeight="800">
                • 3–4 Min Walk to LIC
              </text>
              <text x="813" y="233" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="700">
                • Close Public Car Park
              </text>
              <text x="813" y="249" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="700">
                • Great for Prayers &amp; Classes
              </text>
            </g>

            {/* Harrow Market Car Park */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.commonHarrow)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "GREEN" ? 1 : 0.22}
            >
              <rect
                x="728"
                y="280"
                width="170"
                height="122"
                rx="12"
                fill="#DCFCE7"
                stroke="#16A34A"
                strokeWidth="3"
              />
              <text x="813" y="307" textAnchor="middle" fill="#14532D" fontSize="12" fontWeight="900">
                ✓ HARROW MARKET
              </text>
              <text x="813" y="324" textAnchor="middle" fill="#14532D" fontSize="11" fontWeight="900">
                CAR PARK (SL3 8HJ)
              </text>
              <text x="813" y="344" textAnchor="middle" fill="#15803D" fontSize="10.5" fontWeight="800">
                • 4–5 Min Safe Walk
              </text>
              <text x="813" y="363" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="700">
                • High-Capacity Car Park
              </text>
              <text x="813" y="379" textAnchor="middle" fill="#166534" fontSize="9.5" fontWeight="700">
                • Ideal for Parents &amp; Events
              </text>
            </g>

            {/* BLUE ZONE: Bus Stops on Common Rd */}
            <g
              onClick={() => setSelectedFeature(SPITFIRE_FEATURES.cycleRack)}
              className="cursor-pointer"
              opacity={selectedZone === "ALL" || selectedZone === "BLUE" ? 1 : 0.22}
            >
              <rect
                x="500"
                y="265"
                width="135"
                height="95"
                rx="12"
                fill="#E0F2FE"
                stroke="#009FE3"
                strokeWidth="2.5"
              />
              <text x="567" y="294" textAnchor="middle" fill="#005A9C" fontSize="12" fontWeight="900">
                SL3 BUS STOPS
              </text>
              <text x="567" y="312" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="700">
                &amp; Pedestrian Footpath
              </text>
              <text x="567" y="330" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="800">
                from Common Rd
              </text>
            </g>
          </svg>
        </div>

        {/* Interactive Selected Zone Detail Inspector */}
        <div
          className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
            selectedFeature.zoneType === "RED"
              ? "bg-red-50 border-red-500 text-red-950"
              : selectedFeature.zoneType === "GREEN"
              ? "bg-emerald-50 border-emerald-500 text-emerald-950"
              : "bg-[#F0F7FC] border-[#009FE3] text-[#005A9C]"
          }`}
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0" />
              <span>{selectedFeature.badge}</span>
            </div>
            <h3 className="text-lg font-black">{selectedFeature.title}</h3>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {selectedFeature.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {Object.values(SPITFIRE_FEATURES).map((feat) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => setSelectedFeature(feat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  selectedFeature.id === feat.id
                    ? "bg-[#005A9C] text-white border-[#005A9C]"
                    : "bg-white text-slate-700 border-slate-300 hover:border-[#009FE3]"
                }`}
              >
                {feat.id === "mencap"
                  ? "Mencap (Gated)"
                  : feat.id === "residentYard"
                  ? "Resident Yard (In Front)"
                  : feat.id === "endBays"
                  ? "Public Bays (End of LIC)"
                  : feat.id === "layby"
                  ? "Layby (In Front of LIC)"
                  : feat.id === "harveyPark"
                  ? "Harvey Park Car Park"
                  : feat.id === "commonHarrow"
                  ? "Common Rd & Harrow Mkt"
                  : "Cycle & Bus"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Red, Green, and Blue Zone Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. STRICTLY NO PARKING (RED) */}
        <div className="bg-red-50 rounded-3xl border-2 border-red-500 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider">
                Strictly No Parking (Red Zones)
              </span>
              <OctagonAlert className="w-7 h-7 text-red-600" />
            </div>

            <h3 className="text-xl font-black text-red-950">
              Where LIC Visitors Must NEVER Park
            </h3>

            <ul className="space-y-3 text-xs sm:text-sm text-red-900 font-semibold">
              <li className="p-3.5 rounded-2xl bg-white border border-red-200 flex items-start gap-2.5">
                <span className="font-black text-red-600 text-base">1.</span>
                <div>
                  <strong className="text-red-950 block">
                    Resident Parking Yard (Directly in Front of LIC — No Gate or Signage Displayed)
                  </strong>
                  <span className="text-xs text-red-800">
                    Located directly in front of LIC. Although there is <strong>no gate and no signage displayed</strong>, this entire yard is strictly private residential parking. LIC visitors must never enter, wait, or park here.
                  </span>
                </div>
              </li>
              <li className="p-3.5 rounded-2xl bg-white border border-red-200 flex items-start gap-2.5">
                <span className="font-black text-red-600 text-base">2.</span>
                <div>
                  <strong className="text-red-950 block">
                    Mencap Parking (Next Door — With Metal Gates)
                  </strong>
                  <span className="text-xs text-red-800">
                    Located immediately next door to LIC with metal gates. Strictly private Mencap parking—do not park inside or obstruct the metal gates at any time.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-100/80 border border-red-300 text-xs text-red-950 font-bold">
            Active Hi-Vis Door Marshals monitor the unmarked Resident Yard in front of LIC and Mencap gates before and after every session.
          </div>
        </div>

        {/* 2. PERMITTED PARKING (GREEN) */}
        <div className="bg-emerald-50 rounded-3xl border-2 border-emerald-500 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider">
                Permitted Public Parking (Green)
              </span>
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <h3 className="text-xl font-black text-emerald-950">
              On-Close Public Bays, Layby &amp; Nearby Car Parks
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-emerald-950">
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                <div className="font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>1. Public Bays at End of LIC &amp; Layby in Front of LIC</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black shrink-0">
                    On-Close Public
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  The marked <strong>public parking bays at the end of the LIC building</strong> and the <strong>public layby directly in front of LIC</strong> are public parking spaces and may be used when unoccupied.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                <div className="font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>2. Common Road Unrestricted Zones</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black shrink-0">
                    2–3 Min Walk
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Unrestricted public roadside parking along Common Road—just a 2–3 minute walk into Spitfire Close.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                <div className="font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>3. Harvey Park Car Park (Langley SL3)</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black shrink-0">
                    3–4 Min Walk
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Close public car park at <strong>Harvey Park</strong>—an easy 3–4 minute walk to Spitfire Close.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                <div className="font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>4. Harrow Market Car Park (SL3 8HJ)</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black shrink-0">
                    4–5 Min Walk
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  High-capacity overflow car park for prayers, Quran class parents, and event slot attendees.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Common+Road+Langley+Slough+SL3+8J"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Navigation className="w-4 h-4" />
              <span>1-Tap Navigate: Common Road Parking</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Harvey+Park+Langley+Slough+SL3"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#009FE3] hover:bg-[#005A9C] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Car className="w-4 h-4" />
              <span>1-Tap Navigate: Harvey Park Car Park</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Harrow+Market+Car+Park+Langley+SL3+8HJ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-600 font-black text-xs flex items-center justify-center gap-2 transition"
            >
              <Car className="w-4 h-4 text-emerald-700" />
              <span>1-Tap Navigate: Harrow Market Car Park</span>
            </a>
          </div>
        </div>

        {/* 3. ACTIVE TRAVEL (BLUE) */}
        <div className="bg-[#F0F7FC] rounded-3xl border-2 border-[#009FE3] p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#009FE3] text-white font-black text-xs uppercase tracking-wider">
                Active Travel (Blue Zone)
              </span>
              <Bike className="w-7 h-7 text-[#005A9C]" />
            </div>

            <h3 className="text-xl font-black text-[#005A9C]">
              Walking, Cycling &amp; SL3 Bus Connections
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 rounded-2xl bg-white border border-[#D0E6F7] flex items-start gap-3">
                <Bike className="w-5 h-5 text-[#009FE3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#005A9C]">
                    On-Site Spitfire Close Cycle Rack
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dedicated secure bicycle rack directly outside the LIC entrance for community members and youth.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#D0E6F7] flex items-start gap-3">
                <Bus className="w-5 h-5 text-[#009FE3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#005A9C]">
                    Nearby SL3 Bus Stops (Common Rd &amp; High St)
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Served by local Langley High Street &amp; Common Road bus routes within a 2-minute walk of Spitfire Close.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#D0E6F7] flex items-start gap-3">
                <Footprints className="w-5 h-5 text-[#009FE3] shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-[#005A9C]">
                    SL3 Community Car-Share Matcher
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Share rides with verified neighbours from your SL3 street to reduce cars arriving at Spitfire Close.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/carpool"
            className="w-full py-3.5 px-4 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Car className="w-4 h-4 text-[#009FE3]" />
            <span>Open SL3 Car-Share Matcher</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
