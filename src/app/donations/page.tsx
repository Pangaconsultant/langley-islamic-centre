"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Landmark,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  HandCoins,
  CreditCard,
  ExternalLink,
} from "lucide-react";

interface DonationPackage {
  id: string;
  amount: number | null;
  amountLabel: string;
  title: string;
  description: string;
  provider: "Stripe" | "LaunchGood";
  url: string;
  featured?: boolean;
}

const OFFICIAL_LIC_PACKAGES: DonationPackage[] = [
  {
    id: "pkg-20",
    amount: 20,
    amountLabel: "£20",
    title: "Small Step, Big Impact",
    description: "Every contribution makes a lasting Sadaqah Jariyah impact.",
    provider: "Stripe",
    url: "https://buy.stripe.com/eVa3dK0fN6kF6Gs28a",
  },
  {
    id: "pkg-50",
    amount: 50,
    amountLabel: "£50",
    title: "Strengthen the Walls",
    description: "Help strengthen and maintain our community masjid facilities.",
    provider: "Stripe",
    url: "https://buy.stripe.com/3csdSogeLeRbe8U4gj",
    featured: true,
  },
  {
    id: "pkg-100-bricks",
    amount: 100,
    amountLabel: "£100",
    title: "Donate Bricks",
    description: "Contribute towards building and expanding our Langley Masjid.",
    provider: "Stripe",
    url: "https://buy.stripe.com/aEU6pWbYv6kFd4QbIM",
    featured: true,
  },
  {
    id: "pkg-100-youth",
    amount: 100,
    amountLabel: "£100",
    title: "Youth Challenge",
    description: "Support Youth Hub programmes, mentoring & community learning.",
    provider: "Stripe",
    url: "https://buy.stripe.com/aEU6pWbYv6kFd4QbIM",
  },
  {
    id: "pkg-500-family",
    amount: 500,
    amountLabel: "£500",
    title: "Family Challenge",
    description: "Join our LaunchGood Masjid Appeal as a family.",
    provider: "LaunchGood",
    url: "https://www.launchgood.com/communitypage/urgent_appeal_550000_required_for_masjid_in_langley#!/community/urgent_appeal_550000_required_for_masjid_in_langley/",
  },
  {
    id: "pkg-1000",
    amount: 1000,
    amountLabel: "£1,000",
    title: "Donate Musalahs",
    description: "Sponsor dedicated prayer spaces (Musalahs) as Sadaqah Jariyah.",
    provider: "Stripe",
    url: "https://buy.stripe.com/dR629G7If9wRfcYcMR",
  },
  {
    id: "pkg-5000",
    amount: 5000,
    amountLabel: "£5,000",
    title: "Donate Half Saff (Row)",
    description: "Sponsor half a full prayer row inside Langley Islamic Centre.",
    provider: "Stripe",
    url: "https://buy.stripe.com/7sI9C83rZ24pfcY008",
  },
  {
    id: "pkg-10000",
    amount: 10000,
    amountLabel: "£10,000",
    title: "Donate Full Saff (Row)",
    description: "Sponsor an entire prayer row (Saff) for generations to come.",
    provider: "Stripe",
    url: "https://buy.stripe.com/9AQ6pW4w34cx2qcbIO",
  },
  {
    id: "pkg-custom",
    amount: null,
    amountLabel: "Custom",
    title: "Other Amount (Any Value)",
    description: "Choose any one-off or recurring amount securely via Stripe.",
    provider: "Stripe",
    url: "https://donate.stripe.com/dR6dSoaUr7oJ1m84gg",
  },
];

const PRIMARY_STRIPE_DONATE_URL =
  "https://donate.stripe.com/dR6dSoaUr7oJ1m84gg";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";

export default function DonationsPage() {
  const [selectedRef, setSelectedRef] = useState<
    "LIC Donation" | "LIC Mthly" | "LIC Zakat" | "LIC Sadaqah"
  >("LIC Donation");
  const [giftAidAmount, setGiftAidAmount] = useState<number>(100);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // HMRC Gift Aid Digital Declaration State
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [ukTaxpayerConfirmed, setUkTaxpayerConfirmed] = useState(true);
  const [coverPast4Years, setCoverPast4Years] = useState(true);
  const [coverFutureDonations, setCoverFutureDonations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedGiftAid, setSubmittedGiftAid] = useState<{
    referenceNo: string;
    amount: number;
    boost: number;
    totalWorth: number;
  } | null>(null);

  const giftAidBoost = Math.round(giftAidAmount * 0.25 * 100) / 100;
  const totalWithGiftAid =
    Math.round((giftAidAmount + giftAidBoost) * 100) / 100;

  const copyText = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSubmitGiftAid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !donorName.trim() ||
      !donorEmail.trim() ||
      !homeAddress.trim() ||
      !postcode.trim() ||
      !ukTaxpayerConfirmed
    ) {
      return;
    }

    setSubmitting(true);
    const refNo = `LIC-GA-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/lic_gift_aid_declarations`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          id: `ga-${Date.now()}`,
          reference_no: refNo,
          donor_full_name: donorName.trim(),
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          home_address: homeAddress.trim(),
          postcode: postcode.trim().toUpperCase(),
          donation_type: "Stripe / HSBC Bank Donation",
          payment_reference: selectedRef,
          amount_gbp: giftAidAmount,
          gift_aid_boost_gbp: giftAidBoost,
          uk_taxpayer_confirmed: ukTaxpayerConfirmed,
          cover_past_4_years: coverPast4Years,
          cover_future_donations: coverFutureDonations,
        }),
      });
    } catch {
      // Handled gracefully
    }

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName.trim(),
          email: donorEmail.trim(),
          refId: refNo,
          message: `HMRC Gift Aid Declaration (${refNo}) for £${giftAidAmount.toFixed(
            2
          )} (Ref: ${selectedRef}). Gift Aid Reclaim (+25%): £${giftAidBoost.toFixed(
            2
          )} (Total Worth to LIC: £${totalWithGiftAid.toFixed(
            2
          )}). Address: ${homeAddress.trim()}, ${postcode
            .trim()
            .toUpperCase()}.`,
        }),
      });
    } catch {
      // Handled
    }

    setSubmitting(false);
    setSubmittedGiftAid({
      referenceNo: refNo,
      amount: giftAidAmount,
      boost: giftAidBoost,
      totalWorth: totalWithGiftAid,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner with Direct Stripe Donate CTA + Quranic Verse */}
      <div className="bg-gradient-to-br from-[#005A9C] via-[#00467A] to-[#003259] text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 border-2 border-[#009FE3]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>
                Please Support Us • Registered UK Charity No. 1180443
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Support Langley Islamic Centre — Donate Online via Stripe or HSBC
              Bank Transfer
            </h1>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              &ldquo;Who is it that will lend Allah a good loan which Allah will
              multiply [many times over] for them, and they will have an
              honourable reward?&rdquo; <strong>(Surah Al-Hadid 57:11)</strong>.
              Donate securely online via <strong>Stripe</strong> (Card, Apple
              Pay, Google Pay) or directly to our <strong>HSBC</strong> charity
              account.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0 lg:w-72">
            <a
              href={PRIMARY_STRIPE_DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-lg inline-flex items-center justify-center gap-2 transition"
            >
              <CreditCard className="w-5 h-5" />
              <span>Donate Now (Stripe)</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>
            <div className="text-center text-[11px] text-slate-200 font-semibold">
              Accepts Visa, Mastercard, Apple Pay &amp; Google Pay
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. OFFICIAL STRIPE & LAUNCHGOOD DONATION PACKAGES GRID               */}
      {/* ==================================================================== */}
      <section className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
              <CreditCard className="w-4 h-4" />
              <span>Instant Online Giving • Powered by Stripe &amp; LaunchGood</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#005A9C]">
              Choose Your Official LIC Donation Package
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select any package below to proceed directly to Langley Islamic
              Centre&apos;s official Stripe checkout or LaunchGood campaign.
            </p>
          </div>
          <a
            href={PRIMARY_STRIPE_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Give Any Custom Amount on Stripe</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_LIC_PACKAGES.map((pkg) => (
            <a
              key={pkg.id}
              href={pkg.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-2xl border-2 p-5 transition flex flex-col justify-between gap-4 ${
                pkg.featured
                  ? "bg-[#F0F7FC] border-[#005A9C] hover:bg-[#005A9C] hover:text-white shadow-sm"
                  : "bg-white border-[#D0E6F7] hover:border-[#009FE3] hover:shadow-md"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-2xl font-black ${
                      pkg.featured
                        ? "text-[#005A9C] group-hover:text-white"
                        : "text-[#005A9C]"
                    }`}
                  >
                    {pkg.amountLabel}
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      pkg.provider === "LaunchGood"
                        ? "bg-emerald-100 text-emerald-800"
                        : pkg.featured
                        ? "bg-[#009FE3] text-white"
                        : "bg-[#F0F7FC] text-[#005A9C] border border-[#D0E6F7]"
                    }`}
                  >
                    {pkg.provider === "LaunchGood"
                      ? "LaunchGood"
                      : "Stripe Checkout"}
                  </span>
                </div>

                <h3
                  className={`text-base font-black ${
                    pkg.featured
                      ? "text-[#005A9C] group-hover:text-white"
                      : "text-[#005A9C]"
                  }`}
                >
                  {pkg.title}
                </h3>

                <p
                  className={`text-xs leading-relaxed ${
                    pkg.featured
                      ? "text-slate-600 group-hover:text-slate-100"
                      : "text-slate-600"
                  }`}
                >
                  {pkg.description}
                </p>
              </div>

              <div
                className={`pt-3 border-t flex items-center justify-between text-xs font-extrabold ${
                  pkg.featured
                    ? "border-[#D0E6F7] group-hover:border-white/20 text-[#005A9C] group-hover:text-[#7FD4FF]"
                    : "border-slate-100 text-[#005A9C] group-hover:text-[#009FE3]"
                }`}
              >
                <span>
                  {pkg.amount
                    ? `Donate ${pkg.amountLabel} (+£${(
                        pkg.amount * 0.25
                      ).toLocaleString()} Gift Aid)`
                    : "Enter Custom Amount on Stripe"}
                </span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. HSBC DIRECT BANK TRANSFER + DIGITAL UK GIFT AID DECLARATION       */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Official HSBC Bank Transfer Details */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#005A9C] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                Direct Bank Transfer &amp; Monthly Standing Orders
              </div>
              <h2 className="text-xl font-black text-[#005A9C]">
                Official LIC HSBC Bank Account Details
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Prefer direct bank transfer or setting up a standing order? Use
                our official HSBC charity account details below (100% goes to
                LIC with zero fees).
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText(
                  `Bank: HSBC\nAccount Name: Langley Islamic Centre\nSort Code: 40-42-08\nAccount Number: 02494973\nReference: ${selectedRef}`,
                  "all"
                )
              }
              className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs inline-flex items-center gap-2 shadow-sm transition shrink-0"
            >
              {copiedKey === "all" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>All HSBC Details Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#009FE3]" />
                  <span>Copy All HSBC Details</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">
                  Bank Name
                </div>
                <div className="text-base font-black text-[#005A9C] mt-0.5">
                  HSBC Bank
                </div>
              </div>
              <Landmark className="w-6 h-6 text-[#009FE3]" />
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">
                  Account Name
                </div>
                <div className="text-base font-black text-[#005A9C] mt-0.5">
                  Langley Islamic Centre
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("Langley Islamic Centre", "accName")}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C]"
              >
                {copiedKey === "accName" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">
                  Sort Code (S/C)
                </div>
                <div className="font-mono text-xl font-black text-[#005A9C] mt-0.5">
                  40-42-08
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("40-42-08", "sortCode")}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C]"
              >
                {copiedKey === "sortCode" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-extrabold uppercase text-slate-500">
                  Account Number (A/C No)
                </div>
                <div className="font-mono text-xl font-black text-[#005A9C] mt-0.5">
                  0249 4973
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("02494973", "accountNo")}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C]"
              >
                {copiedKey === "accountNo" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Payment Reference Selector */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-extrabold text-[#005A9C]">
              Optional Bank Transfer Reference:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  "LIC Donation",
                  "LIC Mthly",
                  "LIC Zakat",
                  "LIC Sadaqah",
                ] as const
              ).map((ref) => (
                <button
                  key={ref}
                  type="button"
                  onClick={() => setSelectedRef(ref)}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-black border transition ${
                    selectedRef === ref
                      ? "bg-[#005A9C] text-white border-[#005A9C]"
                      : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7]"
                  }`}
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] text-center font-black text-sm text-[#005A9C]">
            Jazak Allah O Khairan Kaseera • Registered UK Charity No. 1180443
          </div>
        </div>

        {/* Right 5 Cols: Digital HMRC Gift Aid Declaration Form (+25%) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Boost Your Donation by +25% for Free</span>
            </div>
            <h2 className="text-xl font-black text-[#005A9C]">
              Digital UK Gift Aid Declaration
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              UK taxpayers can allow{" "}
              <strong>Langley Islamic Centre (Charity No. 1180443)</strong> to
              claim an extra <strong>25p from HMRC for every £1</strong> donated
              via Stripe or HSBC transfer.
            </p>
          </div>

          {submittedGiftAid ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase">
                  HMRC Gift Aid Saved
                </span>
                <span className="font-mono text-xs font-black text-[#005A9C]">
                  {submittedGiftAid.referenceNo}
                </span>
              </div>
              <h3 className="text-lg font-black">
                JazakAllah Khair! Gift Aid Declaration Recorded
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Your <strong>£{submittedGiftAid.amount.toFixed(2)}</strong>{" "}
                donation lets LIC reclaim{" "}
                <strong>+£{submittedGiftAid.boost.toFixed(2)}</strong> from
                HMRC—worth{" "}
                <strong>£{submittedGiftAid.totalWorth.toFixed(2)}</strong> to
                the Centre!
              </p>
              <button
                type="button"
                onClick={() => setSubmittedGiftAid(null)}
                className="text-xs font-extrabold text-[#005A9C] underline"
              >
                Submit another declaration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitGiftAid} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  Donation Amount (£) to Gift Aid *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    required
                    value={giftAidAmount}
                    onChange={(e) =>
                      setGiftAidAmount(Math.max(0, Number(e.target.value)))
                    }
                    className="w-32 h-10 px-3 rounded-xl border-2 border-[#005A9C] font-black text-sm text-[#005A9C]"
                  />
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                    +£{giftAidBoost.toFixed(2)} Extra → £
                    {totalWithGiftAid.toFixed(2)} Total
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  UK Taxpayer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Full Name as registered with HMRC"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="07700 900XXX"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Home Address (Required by HMRC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="House number & street"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="SL3 8GY"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm uppercase font-bold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 text-xs text-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    required
                    checked={ukTaxpayerConfirmed}
                    onChange={(e) => setUkTaxpayerConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-700 shrink-0"
                  />
                  <span>
                    I am a UK taxpayer and understand that if I pay less Income
                    Tax and/or Capital Gains Tax than the amount of Gift Aid
                    claimed on all my donations, it is my responsibility to pay
                    any difference. *
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coverFutureDonations}
                    onChange={(e) => setCoverFutureDonations(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-700 shrink-0"
                  />
                  <span>
                    Gift Aid all donations I make today and in the future to
                    LIC.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coverPast4Years}
                    onChange={(e) => setCoverPast4Years(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-700 shrink-0"
                  />
                  <span>
                    Also Gift Aid donations I have made in the past 4 years.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !ukTaxpayerConfirmed}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-2 transition"
              >
                <HandCoins className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Saving HMRC Gift Aid..."
                    : `Submit Gift Aid (+£${giftAidBoost.toFixed(
                        2
                      )} Extra for LIC)`}
                </span>
              </button>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#009FE3] shrink-0" />
                <span>
                  Stored securely in Supabase for LIC Charity No. 1180443 HMRC
                  Gift Aid claims.
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
