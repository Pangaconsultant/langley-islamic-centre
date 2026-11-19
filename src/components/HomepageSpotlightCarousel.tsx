"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Megaphone,
  Pause,
  Play,
} from "lucide-react";
import type { HomepageSpotlightSlide, SpotlightTheme } from "@/lib/db";

interface HomepageSpotlightCarouselProps {
  enabled: boolean;
  slides: HomepageSpotlightSlide[];
}

const THEME_STYLES: Record<
  SpotlightTheme,
  {
    wrapper: string;
    badge: string;
    primaryBtn: string;
    secondaryBtn: string;
    checkIcon: string;
    dotActive: string;
  }
> = {
  blue: {
    wrapper:
      "bg-gradient-to-br from-[#005A9C] via-[#00467A] to-[#003259] border-[#009FE3]",
    badge: "bg-[#009FE3]/25 border-[#7FD4FF]/40 text-[#7FD4FF]",
    primaryBtn: "bg-[#009FE3] hover:bg-[#0086C2] text-white",
    secondaryBtn:
      "bg-white/15 hover:bg-white/25 text-white border border-white/25",
    checkIcon: "text-[#7FD4FF]",
    dotActive: "bg-[#7FD4FF] w-7",
  },
  emerald: {
    wrapper:
      "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 border-emerald-400",
    badge: "bg-emerald-400/20 border-emerald-300/40 text-emerald-200",
    primaryBtn: "bg-emerald-500 hover:bg-emerald-400 text-white",
    secondaryBtn:
      "bg-white/15 hover:bg-white/25 text-white border border-white/25",
    checkIcon: "text-emerald-300",
    dotActive: "bg-emerald-300 w-7",
  },
  amber: {
    wrapper:
      "bg-gradient-to-br from-amber-800 via-amber-900 to-slate-900 border-amber-400",
    badge: "bg-amber-400/20 border-amber-300/40 text-amber-200",
    primaryBtn: "bg-amber-500 hover:bg-amber-400 text-slate-950",
    secondaryBtn:
      "bg-white/15 hover:bg-white/25 text-white border border-white/25",
    checkIcon: "text-amber-300",
    dotActive: "bg-amber-300 w-7",
  },
};

function CtaButton({
  href,
  label,
  className,
  showArrow,
}: {
  href: string;
  label: string;
  className: string;
  showArrow?: boolean;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span>{label}</span>
        <ExternalLink className="w-4 h-4 shrink-0" />
      </a>
    );
  }
  return (
    <Link href={href || "/"} className={className}>
      <span>{label}</span>
      {showArrow && <ArrowRight className="w-4 h-4 shrink-0" />}
    </Link>
  );
}

export function HomepageSpotlightCarousel({
  enabled,
  slides,
}: HomepageSpotlightCarouselProps) {
  const activeSlides = (slides || []).filter((s) => s.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Clamp index if admin removes or hides slides
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Gentle auto-advance every 7 seconds when > 1 slide and not paused
  useEffect(() => {
    if (!enabled || activeSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [enabled, activeSlides.length, isPaused]);

  if (!enabled || activeSlides.length === 0) {
    return null;
  }

  const slide = activeSlides[currentIndex] || activeSlides[0];
  const theme = THEME_STYLES[slide.theme] || THEME_STYLES.blue;

  const goPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
    );
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section
      aria-label="What's On at Langley Islamic Centre"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden text-white rounded-3xl sm:rounded-[2rem] border-2 shadow-xl p-5 sm:p-8 lg:p-10 transition-colors duration-500 ${theme.wrapper}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 lg:gap-9 items-center">
        {/* Left 7 Columns: Spotlight Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* Top Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${theme.badge}`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>{slide.badge || "WHAT'S ON AT LIC"}</span>
            </span>

            {activeSlides.length > 1 && (
              <span className="text-[11px] font-extrabold text-white/75 px-2.5 py-1 rounded-full bg-black/20">
                Spotlight {currentIndex + 1} of {activeSlides.length}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-[15px] text-white/90 leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Highlight Bullets */}
          {slide.highlights && slide.highlights.filter(Boolean).length > 0 && (
            <ul className="space-y-1.5 sm:space-y-2 bg-white/10 border border-white/15 rounded-2xl p-3.5 sm:p-4">
              {slide.highlights
                .filter((h) => h.trim().length > 0)
                .map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-white/95 font-medium"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${theme.checkIcon}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
            </ul>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            {slide.primaryCtaLabel && slide.primaryCtaHref && (
              <CtaButton
                href={slide.primaryCtaHref}
                label={slide.primaryCtaLabel}
                showArrow={true}
                className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg transition ${theme.primaryBtn}`}
              />
            )}
            {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
              <CtaButton
                href={slide.secondaryCtaHref}
                label={slide.secondaryCtaLabel}
                showArrow={false}
                className={`px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition ${theme.secondaryBtn}`}
              />
            )}
          </div>
        </div>

        {/* Right 5 Columns: Visual Preview Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/25 bg-black/25 shadow-2xl aspect-[16/9] sm:aspect-[4/3]">
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white/5">
                <Megaphone className="w-10 h-10 text-white/60" />
                <div className="text-sm font-black text-white/90">
                  Langley Islamic Centre
                </div>
                <div className="text-xs text-white/70">
                  Spitfire Close, Langley (SL3 8GY)
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 flex items-end justify-between gap-2">
              <div className="text-[11px] font-extrabold text-white/95 line-clamp-1">
                {slide.badge}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Controls Bar */}
      {activeSlides.length > 1 && (
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous spotlight slide"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next spotlight slide"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-white transition"
              title={isPaused ? "Resume auto-rotate" : "Pause auto-rotate"}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-1.5 ml-2">
              {activeSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? theme.dotActive
                      : "w-2.5 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
