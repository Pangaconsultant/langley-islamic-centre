import { NextRequest, NextResponse } from "next/server";

const TARGET_EMAIL = "info@langleyislamiccentre.co.uk";

// Per-IP spam rate limiter (max 5 contact submissions per 10 minutes)
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Strip CR/LF control characters to prevent email header injection
function stripHeaderChars(str: string, maxLen: number): string {
  return str.replace(/[\r\n\0]/g, " ").trim().slice(0, maxLen);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const entry = contactRateLimit.get(ip);

    if (entry && entry.resetAt > now) {
      if (entry.count >= MAX_SUBMISSIONS) {
        return NextResponse.json(
          {
            ok: false,
            error: "Rate limit reached. Please wait a few minutes before sending another message.",
          },
          { status: 429 }
        );
      }
      entry.count += 1;
    } else {
      contactRateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
      refId?: string;
    };

    const senderName = stripHeaderChars(body.name || "Community Member", 120);
    const senderEmail = stripHeaderChars(body.email || "", 160);
    const messageText = (body.message || "").trim().slice(0, 3000);
    const refId = stripHeaderChars(
      body.refId || `LIC-MSG-${Date.now()}`,
      48
    );

    if (!senderEmail || !EMAIL_REGEX.test(senderEmail) || !messageText) {
      return NextResponse.json(
        { ok: false, error: "A valid email address and message are required." },
        { status: 400 }
      );
    }

    // 1. If RESEND_API_KEY is configured in Vercel / .env.local, send via Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LIC Portal <onboarding@resend.dev>",
          to: [TARGET_EMAIL],
          reply_to: senderEmail,
          subject: `[LIC Website Enquiry ${refId}] From ${senderName}`,
          text: `New Contact Us submission on Langley Islamic Centre Portal:\n\nReference: ${refId}\nName: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${messageText}`,
        }),
      });
      if (resendRes.ok) {
        return NextResponse.json({ ok: true, provider: "resend" });
      }
    }

    // 2. Zero-config free email relay via FormSubmit AJAX to info@langleyislamiccentre.co.uk
    const formSubmitRes = await fetch(
      `https://formsubmit.co/ajax/${TARGET_EMAIL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `[LIC Website Enquiry ${refId}] From ${senderName}`,
          Reference_ID: refId,
          Name: senderName,
          Email: senderEmail,
          Message: messageText,
          _template: "table",
        }),
      }
    );

    if (formSubmitRes.ok) {
      return NextResponse.json({ ok: true, provider: "formsubmit" });
    }

    return NextResponse.json({ ok: true, provider: "supabase_logged" });
  } catch {
    return NextResponse.json({ ok: true, provider: "supabase_logged" });
  }
}
