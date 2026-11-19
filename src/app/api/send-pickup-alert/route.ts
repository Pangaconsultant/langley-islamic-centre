import { NextRequest, NextResponse } from "next/server";
import { verifySignedSessionCookie } from "@/lib/staffSession";

function formatUkNumberToE164(rawPhone: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("07") && digits.length === 11) {
    return `+44${digits.slice(1)}`;
  }
  if (digits.startsWith("447") && digits.length === 12) {
    return `+${digits}`;
  }
  return null;
}

// Per-IP rate limit to prevent SMS pumping (max 10 batch dispatches per hour)
const pickupAlertLimiter = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const limitEntry = pickupAlertLimiter.get(ip);
    if (limitEntry && limitEntry.resetAt > now) {
      if (limitEntry.count >= 10) {
        return NextResponse.json(
          { ok: false, error: "Rate limit exceeded for pickup alert dispatch." },
          { status: 429 }
        );
      }
      limitEntry.count += 1;
    } else {
      pickupAlertLimiter.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    }

    const body = (await req.json()) as {
      sessionTitle?: string;
      recipients?: Array<{
        parentName: string;
        parentPhone: string;
        childName: string;
      }>;
    };

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    const recipients = (body.recipients || []).slice(0, 40);

    // If Twilio credentials are not configured yet, return simulated status with direct wa.me links
    if (!sid || !token || !fromNumber) {
      return NextResponse.json({
        ok: true,
        mode: "wa_deep_link",
        sentCount: recipients.length,
        message:
          "Pickup alert logged in Supabase. Use the 1-Tap WhatsApp buttons below to message parents directly via WhatsApp for free, or add TWILIO_ACCOUNT_SID in Vercel for automated bulk SMS/WhatsApp.",
      });
    }

    // Require verified Staff Session Cookie before invoking paid Twilio SMS/WhatsApp API
    const sessionToken = req.cookies.get("lic_staff_session")?.value;
    const staffIdentity = sessionToken
      ? verifySignedSessionCookie(sessionToken)
      : null;
    if (!staffIdentity) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Authorised LIC Staff / Teacher session required to dispatch live Twilio SMS/WhatsApp alerts.",
        },
        { status: 401 }
      );
    }

    // Live Twilio SMS / WhatsApp dispatch when TWILIO_ACCOUNT_SID is configured
    let delivered = 0;
    const authHeader =
      "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
    const safeSessionTitle = (body.sessionTitle || "Quran Class")
      .replace(/[\r\n]/g, " ")
      .slice(0, 80);

    for (const r of recipients) {
      const toE164 = formatUkNumberToE164(r.parentPhone || "");
      if (!toE164) continue;
      const isWhatsApp = fromNumber.startsWith("whatsapp:");
      const toAddress = isWhatsApp ? `whatsapp:${toE164}` : toE164;
      const safeParent = (r.parentName || "Parent").slice(0, 60);
      const safeChild = (r.childName || "your child").slice(0, 60);
      const textBody = `Assalamu Alaikum ${safeParent}, LIC Maktab (${safeSessionTitle}) for ${safeChild} finishes in 5 mins. Please park on Common Rd, Harvey Park, or Harrow Market and walk to Spitfire Close. Strictly no waiting in the Resident Yard or Mencap.`;

      const params = new URLSearchParams();
      params.append("To", toAddress);
      params.append("From", fromNumber);
      params.append("Body", textBody);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
          sid
        )}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      if (res.ok) delivered++;
    }

    return NextResponse.json({
      ok: true,
      mode: "twilio_live",
      sentCount: delivered,
      message: `Dispatched ${delivered}/${recipients.length} live automated messages via Twilio.`,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
