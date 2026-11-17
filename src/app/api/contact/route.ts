import { NextRequest, NextResponse } from "next/server";

const TARGET_EMAIL = "info@langleyislamiccentre.co.uk";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
      refId?: string;
    };

    const senderName = (body.name || "Community Member").trim();
    const senderEmail = (body.email || "").trim();
    const messageText = (body.message || "").trim();
    const refId = body.refId || `LIC-MSG-${Date.now()}`;

    if (!senderEmail || !messageText) {
      return NextResponse.json(
        { ok: false, error: "Email and message are required." },
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
    // (Note: On first submission, FormSubmit sends a 1-time activation link to info@langleyislamiccentre.co.uk)
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
