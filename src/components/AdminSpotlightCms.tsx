"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Pencil,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import type { HomepageSpotlightSlide, SpotlightTheme } from "@/lib/db";

interface AdminSpotlightCmsProps {
  enabled: boolean;
  slides: HomepageSpotlightSlide[];
  onToggleEnabled: (enabled: boolean) => void;
  onAddSlide: (slide: Omit<HomepageSpotlightSlide, "id">) => void;
  onUpdateSlide: (id: string, patch: Partial<HomepageSpotlightSlide>) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (id: string, direction: "up" | "down") => void;
  onNotify: (msg: string) => void;
}

const QUICK_PRESETS: Array<{
  label: string;
  slide: Omit<HomepageSpotlightSlide, "id">;
}> = [
  {
    label: "Travel Hub & Parking",
    slide: {
      active: true,
      badge: "NOW PROMOTING • PUBLIC TRAVEL & PARKING GUIDANCE",
      title: "Visiting Spitfire Close? Check Our Travel Hub & Parking Guide First",
      description:
        "Please help us be great neighbours in SL3. Review our Red & Green parking zones before driving, use permitted public car parks, or share a lift with fellow Langley residents.",
      highlights: [
        "Permitted Car Parks: Common Rd, Harvey Park & Harrow Market (2–5 min walk)",
        "Strictly Red Zones: Never park in Mencap (gated next door) or Resident Yard",
        "On-site Cycle Rack (right of public layby) & privacy-first SL3 Car-Share",
      ],
      primaryCtaLabel: "Open Interactive Parking Map",
      primaryCtaHref: "/parking",
      secondaryCtaLabel: "Find an SL3 Car-Share Lift",
      secondaryCtaHref: "/carpool",
      imageUrl: "/images/lic-aerial-map.png",
      theme: "blue",
    },
  },
  {
    label: "Masjid Appeal & Stripe",
    slide: {
      active: true,
      badge: "URGENT APPEAL • SADAQAH JARIYAH",
      title: "Support Langley Islamic Centre — Add +25% UK Gift Aid at No Extra Cost",
      description:
        "Every brick, musalah, and monthly standing order helps sustain daily prayers, children's Maktab education, and community welfare in Langley (SL3).",
      highlights: [
        "Instant card donations from £20 to £10,000 via official LIC Stripe Checkout",
        "Direct HSBC Bank Transfer (Sort Code: 40-42-08 • A/C: 0249 4973)",
        "UK taxpayers boost every £1 by 25p with our 1-minute Gift Aid form",
      ],
      primaryCtaLabel: "Donate & Claim +25% Gift Aid",
      primaryCtaHref: "/donations",
      secondaryCtaLabel: "Quick Custom Stripe Donate",
      secondaryCtaHref: "https://donate.stripe.com/dR6dSoaUr7oJ1m84gg",
      imageUrl: "/images/lic-building.jpg",
      theme: "emerald",
    },
  },
  {
    label: "Maktab Enrolment",
    slide: {
      active: true,
      badge: "EDUCATION • BOYS AGES 7–16",
      title: "Children's Quran Classes (Maktab) Open for Registration",
      description:
        "Structured Nazira Quran & Tajweed classes running 3 days a week (Mon–Wed or Thu–Sat) with teacher placement assessments and 5-minute WhatsApp pickup alerts.",
      highlights: [
        "Beginner, Intermediate & Advanced levels for Boys aged 7–16",
        "£40/month Standing Order due by the 28th of each month",
        "Online 5-step registration with instant application status tracking",
      ],
      primaryCtaLabel: "Register Your Child",
      primaryCtaHref: "/quran-classes",
      secondaryCtaLabel: "Contact LIC Office",
      secondaryCtaHref: "/contact",
      imageUrl: "/images/lic-building.jpg",
      theme: "emerald",
    },
  },
  {
    label: "Jummah & Important Notice",
    slide: {
      active: true,
      badge: "IMPORTANT VENUE NOTICE • LANGLEY PAVILION",
      title: "Friday Jummah (13:15) & Eid Prayers Held Off-Site at Langley Pavilion",
      description:
        "To protect Spitfire Close neighbours and keep traffic calm, Friday Jummah and Eid congregations are always hosted at Langley Pavilion.",
      highlights: [
        "Friday Jummah: 13:15 at Langley Pavilion (never at Spitfire Close)",
        "Sisters' Quran & Tafsir: Every Wednesday 13:30–14:30 at LIC",
        "Check live daily prayer times & building capacity before visiting",
      ],
      primaryCtaLabel: "View Events & Schedule",
      primaryCtaHref: "/events",
      secondaryCtaLabel: "Plan Your Visit",
      secondaryCtaHref: "/parking",
      imageUrl: "/images/spitfire-close.png",
      theme: "amber",
    },
  },
];

const IMAGE_SHORTCUTS = [
  { label: "LIC Aerial Map", url: "/images/lic-aerial-map.png" },
  { label: "LIC Building", url: "/images/lic-building.jpg" },
  { label: "Spitfire Close", url: "/images/spitfire-close.png" },
  { label: "No Image", url: "" },
];

const ROUTE_SHORTCUTS = [
  { label: "Parking Map", href: "/parking" },
  { label: "Car-Share", href: "/carpool" },
  { label: "Donations", href: "/donations" },
  { label: "Quran Classes", href: "/quran-classes" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export function AdminSpotlightCms({
  enabled,
  slides,
  onToggleEnabled,
  onAddSlide,
  onUpdateSlide,
  onDeleteSlide,
  onMoveSlide,
  onNotify,
}: AdminSpotlightCmsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [badge, setBadge] = useState("NOW PROMOTING • WHAT'S ON");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");
  const [h3, setH3] = useState("");
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState("Learn More");
  const [primaryCtaHref, setPrimaryCtaHref] = useState("/parking");
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState("");
  const [secondaryCtaHref, setSecondaryCtaHref] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/lic-aerial-map.png");
  const [theme, setTheme] = useState<SpotlightTheme>("blue");
  const [active, setActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setBadge("NOW PROMOTING • WHAT'S ON");
    setTitle("");
    setDescription("");
    setH1("");
    setH2("");
    setH3("");
    setPrimaryCtaLabel("Learn More");
    setPrimaryCtaHref("/parking");
    setSecondaryCtaLabel("");
    setSecondaryCtaHref("");
    setImageUrl("/images/lic-aerial-map.png");
    setTheme("blue");
    setActive(true);
  };

  const startEditing = (slide: HomepageSpotlightSlide) => {
    setEditingId(slide.id);
    setBadge(slide.badge);
    setTitle(slide.title);
    setDescription(slide.description);
    setH1(slide.highlights?.[0] || "");
    setH2(slide.highlights?.[1] || "");
    setH3(slide.highlights?.[2] || "");
    setPrimaryCtaLabel(slide.primaryCtaLabel || "");
    setPrimaryCtaHref(slide.primaryCtaHref || "/");
    setSecondaryCtaLabel(slide.secondaryCtaLabel || "");
    setSecondaryCtaHref(slide.secondaryCtaHref || "");
    setImageUrl(slide.imageUrl || "");
    setTheme(slide.theme || "blue");
    setActive(slide.active);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload: Omit<HomepageSpotlightSlide, "id"> = {
      active,
      badge: badge.trim() || "WHAT'S ON AT LIC",
      title: title.trim(),
      description: description.trim(),
      highlights: [h1.trim(), h2.trim(), h3.trim()].filter(Boolean),
      primaryCtaLabel: primaryCtaLabel.trim() || "View Details",
      primaryCtaHref: primaryCtaHref.trim() || "/",
      secondaryCtaLabel: secondaryCtaLabel.trim() || undefined,
      secondaryCtaHref: secondaryCtaHref.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      theme,
    };

    if (editingId) {
      onUpdateSlide(editingId, payload);
      onNotify(`Updated spotlight slide "${payload.title}" on the Homepage.`);
    } else {
      onAddSlide(payload);
      onNotify(`Published new spotlight slide "${payload.title}" to Homepage #1.`);
    }
    resetForm();
  };

  const activeCount = slides.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      {/* Top Master Control Bar */}
      <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#009FE3]">
            <Megaphone className="w-4 h-4" />
            <span>Homepage &ldquo;What&apos;s On&rdquo; Hero Carousel Control</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#005A9C]">
            Promote Public Guidance, Events &amp; Appeals Live
          </h2>
          <p className="text-xs text-slate-600">
            Changes sync instantly via Supabase to{" "}
            <strong className="text-[#005A9C]">all visitors</strong>. Currently{" "}
            <strong>{activeCount}</strong> active slide
            {activeCount === 1 ? "" : "s"} in rotation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onToggleEnabled(!enabled);
              onNotify(
                !enabled
                  ? "Homepage Spotlight Carousel is now VISIBLE to the public."
                  : "Homepage Spotlight Carousel is now HIDDEN from the public."
              );
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs inline-flex items-center gap-2 border-2 transition ${
              enabled
                ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
          >
            {enabled ? (
              <>
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Carousel ON (Visible)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span>Carousel OFF (Hidden)</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition"
          >
            <span>Preview on Homepage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 1-Click Preset Templates Strip */}
      <div className="bg-[#F0F7FC] rounded-2xl border border-[#D0E6F7] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#005A9C]">
          <Sparkles className="w-4 h-4 text-[#009FE3]" />
          <span>1-Click Preset Templates (Adds to Slide #1):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onAddSlide(preset.slide);
                onNotify(`Added "${preset.label}" preset to Homepage Slide #1.`);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#005A9C] hover:text-white text-[#005A9C] border border-[#D0E6F7] text-xs font-extrabold transition"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Col Grid: Form (1 col) + Slide Manager (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add / Edit Slide Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#005A9C] flex items-center gap-2">
              {editingId ? (
                <>
                  <Pencil className="w-4 h-4 text-[#009FE3]" />
                  <span>Edit Spotlight Slide</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-[#009FE3]" />
                  <span>Add New Spotlight Slide</span>
                </>
              )}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
              Top Badge / Tag
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. NOW PROMOTING • PUBLIC GUIDANCE"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
              Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visiting Spitfire Close? Check Our Travel Hub"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short public message explaining what's happening and what visitors should do..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#005A9C]">
              Key Bullet Highlights (Optional, up to 3)
            </label>
            <input
              type="text"
              value={h1}
              onChange={(e) => setH1(e.target.value)}
              placeholder="Bullet 1 (e.g. Use Common Rd, Harvey Park or Harrow Market)"
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs"
            />
            <input
              type="text"
              value={h2}
              onChange={(e) => setH2(e.target.value)}
              placeholder="Bullet 2 (e.g. Never park in Mencap or Resident Yard)"
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs"
            />
            <input
              type="text"
              value={h3}
              onChange={(e) => setH3(e.target.value)}
              placeholder="Bullet 3 (optional)"
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Primary Button Label
              </label>
              <input
                type="text"
                value={primaryCtaLabel}
                onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                placeholder="Open Parking Map"
                className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Primary Button Link
              </label>
              <input
                type="text"
                value={primaryCtaHref}
                onChange={(e) => setPrimaryCtaHref(e.target.value)}
                placeholder="/parking or https://..."
                className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {ROUTE_SHORTCUTS.map((r) => (
              <button
                key={r.href}
                type="button"
                onClick={() => setPrimaryCtaHref(r.href)}
                className="px-2 py-0.5 rounded-md bg-[#F0F7FC] hover:bg-[#D0E6F7] text-[#005A9C] text-[10px] font-bold"
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Secondary Label (Opt.)
              </label>
              <input
                type="text"
                value={secondaryCtaLabel}
                onChange={(e) => setSecondaryCtaLabel(e.target.value)}
                placeholder="Find an SL3 Lift"
                className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                Secondary Link (Opt.)
              </label>
              <input
                type="text"
                value={secondaryCtaHref}
                onChange={(e) => setSecondaryCtaHref(e.target.value)}
                placeholder="/carpool"
                className="w-full h-9 px-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* Image Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#005A9C] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#009FE3]" />
              <span>Spotlight Photo / Map Image</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_SHORTCUTS.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setImageUrl(img.url)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    imageUrl === img.url
                      ? "bg-[#005A9C] text-white border-[#005A9C]"
                      : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/images/lic-aerial-map.png or https://..."
              className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>

          {/* Theme & Visibility */}
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "blue", label: "LIC Blue", cls: "bg-[#005A9C]" },
                { id: "emerald", label: "Emerald", cls: "bg-emerald-700" },
                { id: "amber", label: "Amber Alert", cls: "bg-amber-700" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`py-2 px-2 rounded-xl text-[11px] font-extrabold border-2 flex items-center justify-center gap-1.5 transition ${
                  theme === t.id
                    ? "border-[#009FE3] bg-[#F0F7FC] text-[#005A9C]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.cls}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-[#005A9C] cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded accent-[#005A9C]"
            />
            <span>Active (Show immediately in Homepage carousel)</span>
          </label>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs shadow-sm transition inline-flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#7FD4FF]" />
            <span>
              {editingId ? "Save Slide Changes" : "Publish Slide to Homepage"}
            </span>
          </button>
        </form>

        {/* Active Slides Queue (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-[#005A9C]">
              Spotlight Slides Order ({slides.length}) — Slide #1 Shows First
            </h3>
          </div>

          {slides.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-[#D0E6F7] p-8 text-center text-xs text-slate-500">
              No spotlight slides yet. Click a 1-click preset above or create a
              custom slide on the left.
            </div>
          ) : (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`bg-white rounded-2xl border-2 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start justify-between transition ${
                  slide.active
                    ? "border-[#D0E6F7]"
                    : "border-slate-200 opacity-65"
                }`}
              >
                <div className="flex gap-3.5 items-start flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-[#F0F7FC] border border-[#D0E6F7] shrink-0">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#009FE3]">
                        <Megaphone className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Meta & Title */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#005A9C] text-white text-[10px] font-black">
                        #{index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          slide.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {slide.active ? "LIVE" : "HIDDEN"}
                      </span>
                      <span className="text-[10px] font-extrabold text-[#009FE3] uppercase truncate">
                        {slide.badge}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-[#005A9C] leading-snug">
                      {slide.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {slide.description}
                    </p>
                    <div className="text-[11px] font-bold text-slate-500">
                      CTA: <span className="text-[#005A9C]">{slide.primaryCtaLabel}</span>{" "}
                      (<span className="font-mono">{slide.primaryCtaHref}</span>)
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveSlide(slide.id, "up")}
                      title="Move Up"
                      className="p-1.5 rounded-lg bg-[#F0F7FC] hover:bg-[#D0E6F7] disabled:opacity-30 text-[#005A9C]"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => onMoveSlide(slide.id, "down")}
                      title="Move Down"
                      className="p-1.5 rounded-lg bg-[#F0F7FC] hover:bg-[#D0E6F7] disabled:opacity-30 text-[#005A9C]"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSlide(slide.id, { active: !slide.active });
                        onNotify(
                          !slide.active
                            ? `Enabled "${slide.title}" on Homepage.`
                            : `Hidden "${slide.title}" from Homepage.`
                        );
                      }}
                      title={slide.active ? "Hide slide" : "Show slide"}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      {slide.active ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditing(slide)}
                      title="Edit slide"
                      className="p-1.5 rounded-lg bg-[#F0F7FC] hover:bg-[#D0E6F7] text-[#005A9C]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSlide(slide.id);
                        onNotify(`Deleted spotlight slide "${slide.title}".`);
                      }}
                      title="Delete slide"
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
