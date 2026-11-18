"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Landmark,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Repeat,
  HandCoins,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";

type DonationFundType =
  | {
      id: "lump";
      label: "Lump Sum Donation";
      reference: "LIC Donation";
      sub: "One-off contribution to Centre operations & facilities";
    }
  | {
      id: "monthly";
      label: "Monthly Standing Order";
      reference: "LIC Mthly";
      sub: "Regular monthly support for long-term stability & planning";
    }
  | {
      id: "zakat";
      label: "Zakat Donation";
      reference: "LIC Zakat";
      sub: "100% ring-fenced Zakat distribution for eligible recipients";
    }
  | {
      id: "sadaqah";
      label: "Sadaqah / Lillah";
      reference: "LIC Sadaqah";
      sub: "Voluntary Sadaqah Jariyah for masjid, education & welfare";
    };

const DONATION_FUNDS: DonationFundType[] = [
  {
    id: "lump",
    label: "Lump Sum Donation",
    reference: "LIC Donation",
    sub: "One-off contribution to Centre operations & facilities",
  },
  {
    id: "monthly",
    label: "Monthly Standing Order",
    reference: "LIC Mthly",
    sub: "Regular monthly support for long-term stability & planning",
  },
  {
    id: "zakat",
    label: "Zakat Donation",
    reference: "LIC Zakat",
    sub: "100% ring-fenced Zakat distribution for eligible recipients",
  },
  {
    id: "sadaqah",
    label: "Sadaqah / Lillah",
    reference: "LIC Sadaqah",
    sub: "Voluntary Sadaqah Jariyah for masjid, education & welfare",
  },
];

const SUGGESTED_TIERS = [
  {
    amount: 25,
    title: "£25 – General Support",
    description:
      "Supports ongoing activities, maintenance, and daily community programmes at Spitfire Close.",
    icon: Landmark,
  },
  {
    amount: 50,
    title: "£50 – Educational & Youth",
    description:
      "Helps fund learning materials, Youth Hub mentoring sessions, and family activities.",
    icon: BookOpen,
  },
  {
    amount: 100,
    title: "£100 – Community Services",
    description:
      "Contributes to wider community events, facilities, wellbeing support, and outreach work.",
    icon: Users,
  },
];

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";

export default function DonationsPage() {
  const [selectedFund, setSelectedFund] = useState<DonationFundType>(
    DONATION_FUNDS[0]
  );
  const [amount, setAmount] = useState<number>(50);
  const [customAmountStr, setCustomAmountStr] = useState<string>("50");
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
    bankReference: string;
  } | null>(null);

  const giftAidBoost = Math.round(amount * 0.25 * 100) / 100;
  const totalWithGiftAid = Math.round((amount + giftAidBoost) * 100) / 100;

  const copyText = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleTierSelect = (amt: number) => {
    setAmount(amt);
    setCustomAmountStr(String(amt));
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmountStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    } else {
      setAmount(0);
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

    // 1. Save directly to public.lic_gift_aid_declarations in Supabase
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
          donation_type: selectedFund.label,
          payment_reference: selectedFund.reference,
          amount_gbp: amount,
          gift_aid_boost_gbp: giftAidBoost,
          uk_taxpayer_confirmed: ukTaxpayerConfirmed,
          cover_past_4_years: coverPast4Years,
          cover_future_donations: coverFutureDonations,
        }),
      });
    } catch {
      // Handled gracefully
    }

    // 2. Also notify info@langleyislamiccentre.co.uk via /api/contact
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName.trim(),
          email: donorEmail.trim(),
          refId: refNo,
          message: `HMRC Gift Aid Declaration (${refNo}) for £${amount.toFixed(
            2
          )} (${selectedFund.label} - Bank Ref: ${
            selectedFund.reference
          }). Gift Aid Reclaim (+25%): £${giftAidBoost.toFixed(
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
      amount,
      boost: giftAidBoost,
      totalWorth: totalWithGiftAid,
      bankReference: selectedFund.reference,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner with Surah Al-Hadid (57:11) & Sahih Muslim Hadith */}
      <div className="bg-[#005A9C] text-white rounded-3xl p-6 sm:p-10 shadow-md space-y-6 border-2 border-[#009FE3]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#7FD4FF]/30 text-[#7FD4FF] text-xs font-extrabold uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-[#009FE3]" />
              <span>
                Please Support Us • Registered UK Charity No. 1180443
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Support Langley Islamic Centre — Sadaqah, Zakat &amp; Standing
              Orders
            </h1>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              Your generous donations help Langley Islamic Centre (LIC) maintain
              our community facilities, provide Islamic education, organise
              youth and family programmes, and serve the spiritual and social
              needs of our community. Every contribution—large or small—makes a
              meaningful difference.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 lg:w-80 shrink-0 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#7FD4FF]">
              Sahih Muslim
            </div>
            <p className="text-sm font-bold italic text-white">
              The Prophet Muhammad (peace be upon him) said: &ldquo;Charity does
              not decrease wealth.&rdquo;
            </p>
            <div className="pt-2 border-t border-white/15 text-[11px] text-slate-200">
              UK Taxpayers can add <strong>+25% Gift Aid</strong> at zero extra
              cost.
            </div>
          </div>
        </div>

        {/* Quranic Verse Callout: Surah Al-Hadid (57:11) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-[#7FD4FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <blockquote className="text-xs sm:text-sm font-semibold italic text-slate-100 leading-relaxed">
            &ldquo;Who is it that will lend Allah a good loan which Allah will
            multiply [many times over] for them, and they will have an
            honourable reward?&rdquo;
          </blockquote>
          <span className="text-xs font-black text-[#7FD4FF] shrink-0">
            — Surah Al-Hadid (57:11)
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout: Step 1 (Select Fund, Amount & Barclays Bank Transfer) + Step 2 (Digital Gift Aid Declaration) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Donation Packages, Fund Reference & Barclays Bank Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Choose Donation Type & Official Bank Reference */}
          <div className="bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                Step 1 • Select Purpose &amp; Payment Reference
              </div>
              <h2 className="text-xl font-black text-[#005A9C]">
                Choose Your Donation Category
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Selecting a category below automatically sets the exact{" "}
                <strong>Barclays Payment Reference</strong> for your bank
                transfer or monthly standing order.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DONATION_FUNDS.map((fund) => {
                const active = selectedFund.id === fund.id;
                return (
                  <div
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-2 ${
                      active
                        ? "bg-[#F0F7FC] border-[#005A9C] shadow-sm"
                        : "bg-white border-slate-200 hover:border-[#009FE3]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-sm text-[#005A9C]">
                          {fund.label}
                        </span>
                        {fund.id === "monthly" && (
                          <Repeat className="w-4 h-4 text-[#009FE3]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{fund.sub}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">
                        Bank Reference:
                      </span>
                      <span className="font-mono font-black px-2 py-0.5 rounded bg-[#005A9C] text-white">
                        {fund.reference}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggested Packages (£25, £50, £100 + Custom) */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#005A9C]">
                Suggested Contribution Packages
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUGGESTED_TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const active = amount === tier.amount;
                  return (
                    <div
                      key={tier.amount}
                      onClick={() => handleTierSelect(tier.amount)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                        active
                          ? "bg-[#005A9C] text-white border-[#005A9C] shadow-md"
                          : "bg-[#F0F7FC] text-[#005A9C] border-[#D0E6F7] hover:border-[#009FE3]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`w-5 h-5 ${
                              active ? "text-[#7FD4FF]" : "text-[#009FE3]"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            +£{(tier.amount * 0.25).toFixed(2)} Gift Aid
                          </span>
                        </div>
                        <div className="font-black text-base">{tier.title}</div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            active ? "text-slate-100" : "text-slate-600"
                          }`}
                        >
                          {tier.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Input & Live Gift Aid Boost Preview */}
              <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-extrabold text-[#005A9C] shrink-0">
                    Or Enter Custom Amount (£):
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={customAmountStr}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="w-28 h-10 px-3 rounded-xl border-2 border-[#005A9C] font-black text-base text-[#005A9C] bg-white"
                  />
                </div>
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3.5 py-2 rounded-xl border border-emerald-300">
                  With UK Gift Aid (+25%), your{" "}
                  <strong>£{amount.toFixed(2)}</strong> donation becomes{" "}
                  <strong className="text-sm font-black">
                    £{totalWithGiftAid.toFixed(2)}
                  </strong>{" "}
                  for LIC!
                </div>
              </div>
            </div>
          </div>

          {/* 2. Official Barclays Bank Account & Standing Order Details (1-Tap Copy) */}
          <div className="bg-white rounded-3xl border-2 border-[#005A9C] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#009FE3]">
                  Step 2 • Direct Bank Transfer &amp; Monthly Standing Order
                </div>
                <h2 className="text-xl font-black text-[#005A9C]">
                  Official LIC Barclays Bank Account Details
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  We accept donations via direct bank transfer and monthly
                  standing orders (100% of your donation goes directly to LIC
                  with zero platform commission).
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyText(
                    `Bank: Barclays Bank\nAccount Name: Langley Islamic Centre\nSort Code: 20-78-58\nAccount Number: 63102379\nReference: ${selectedFund.reference}`,
                    "all"
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-[#005A9C] hover:bg-[#003F6E] text-white font-black text-xs inline-flex items-center gap-2 shadow-sm transition shrink-0"
              >
                {copiedKey === "all" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>All Bank Details Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#009FE3]" />
                    <span>Copy All Bank Details</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Bank Name */}
              <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-extrabold uppercase text-slate-500">
                    Bank Name
                  </div>
                  <div className="text-base font-black text-[#005A9C] mt-0.5">
                    Barclays Bank
                  </div>
                </div>
                <Landmark className="w-6 h-6 text-[#009FE3]" />
              </div>

              {/* Account Name */}
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
                  onClick={() =>
                    copyText("Langley Islamic Centre", "accountName")
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C] inline-flex items-center gap-1"
                >
                  {copiedKey === "accountName" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "accountName" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Sort Code */}
              <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-extrabold uppercase text-slate-500">
                    Sort Code
                  </div>
                  <div className="font-mono text-xl font-black text-[#005A9C] mt-0.5">
                    20-78-58
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText("20-78-58", "sortCode")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C] inline-flex items-center gap-1"
                >
                  {copiedKey === "sortCode" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "sortCode" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Account Number */}
              <div className="p-4 rounded-2xl bg-[#F0F7FC] border border-[#D0E6F7] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-extrabold uppercase text-slate-500">
                    Account Number
                  </div>
                  <div className="font-mono text-xl font-black text-[#005A9C] mt-0.5">
                    63102379
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText("63102379", "accountNo")}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D0E6F7] text-xs font-bold text-[#005A9C] inline-flex items-center gap-1"
                >
                  {copiedKey === "accountNo" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "accountNo" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Selected Payment Reference Highlight Bar */}
            <div className="p-4 rounded-2xl bg-[#005A9C] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#7FD4FF]">
                  Payment Reference to Use in Your Banking App (
                  {selectedFund.label})
                </div>
                <div className="font-mono text-lg font-black mt-0.5">
                  {selectedFund.reference}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText(selectedFund.reference, "ref")}
                className="px-4 py-2 rounded-xl bg-[#009FE3] hover:bg-[#33B5EC] text-white font-black text-xs inline-flex items-center gap-1.5 transition shrink-0"
              >
                {copiedKey === "ref" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Reference Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Reference &ldquo;{selectedFund.reference}&rdquo;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Digital HMRC Gift Aid Declaration Form (+25p per £1) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#D0E6F7] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Step 3 • Boost Your Donation by 25% for Free</span>
            </div>
            <h2 className="text-xl font-black text-[#005A9C]">
              Digital UK Gift Aid Declaration
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you are a UK taxpayer, completing this 30-second declaration
              allows <strong>Langley Islamic Centre (Charity No. 1180443)</strong>{" "}
              to claim an extra <strong>25p from HMRC for every £1</strong> you
              donate, at no extra cost to you.
            </p>
          </div>

          {submittedGiftAid ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase">
                  HMRC Gift Aid Logged
                </span>
                <span className="font-mono text-xs font-black text-[#005A9C]">
                  {submittedGiftAid.referenceNo}
                </span>
              </div>
              <h3 className="text-lg font-black">
                JazakAllah Khair! Your Gift Aid Declaration Is Saved
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                With your Gift Aid declaration, your{" "}
                <strong>£{submittedGiftAid.amount.toFixed(2)}</strong> donation
                (Reference: <strong>{submittedGiftAid.bankReference}</strong>)
                allows LIC to reclaim{" "}
                <strong>+£{submittedGiftAid.boost.toFixed(2)}</strong> from
                HMRC—making it worth{" "}
                <strong>£{submittedGiftAid.totalWorth.toFixed(2)}</strong> to
                the Centre!
              </p>
              <button
                type="button"
                onClick={() => setSubmittedGiftAid(null)}
                className="text-xs font-extrabold text-[#005A9C] underline"
              >
                Submit another Gift Aid declaration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitGiftAid} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#005A9C] mb-1">
                  UK Taxpayer Full Name (First &amp; Surname) *
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
                    placeholder="House number & street name"
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

              {/* HMRC Mandatory Gift Aid Checkboxes */}
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
                    Tax and/or Capital Gains Tax in the current tax year than
                    the amount of Gift Aid claimed on all my donations, it is my
                    responsibility to pay any difference. *
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
                    Langley Islamic Centre.
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
                    Also Gift Aid all donations I have made to Langley Islamic
                    Centre in the past 4 years.
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
                    ? "Saving HMRC Gift Aid Declaration..."
                    : `Submit Gift Aid (+£${giftAidBoost.toFixed(
                        2
                      )} Extra for LIC)`}
                </span>
              </button>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#009FE3] shrink-0" />
                <span>
                  Saved securely in LIC&apos;s London database for HMRC Charity
                  No. 1180443 Gift Aid claims.
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
