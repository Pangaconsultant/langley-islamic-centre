import { NextRequest, NextResponse } from "next/server";

function formatUkNumberToE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("07") && digits.length === 11) {
    return `+44${digits.slice(1)}`;
  }
  if (digits.startsWith("447") && digits.length === 12) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sessionTitle?: string;
      recipients?: Array<{ parentName: string; parentPhone: string; childName: string }>;
    };

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    const recipients = body.recipients || [];

    // If Twilio credentials are not configured yet, return simulated status with direct wa.me links
    if (!sid || !token || !fromNumber) {
      return NextResponse.json({
        ok: true,
        mode: "wa_deep_link",
        sentCount: recipients.length,
        message:
          " Pickup alert logged in Supabase. Use the 1-Tap WhatsApp buttons below to message parents directly via WhatsApp for free, or add TWILIO_ACCOUNT_SID in Vercel for automated bulk SMS/WhatsApp.",
      });
    }

    // Live Twilio SMS / WhatsApp dispatch when TWILIO_ACCOUNT_SID is configured
    let delivered = 0;
    const authHeader =
      "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");

    for (const r of recipients) {
      const toE164 = formatUkNumberToE164(r.parentPhone);
      const isWhatsApp = fromNumber.startsWith("whatsapp:");
      const toAddress = isWhatsApp ? `whatsapp:${toE164}` : toE164;
      const textBody = `Assalamu Alaikum ${r.parentName}, LIC Maktab (${body.sessionTitle}) for ${r.childName} finishes in 5 mins. Please park on Common Rd, Harvey Park, or Harrow Market and walk to Spitfire Close. Strictly no waiting in the Resident Yard or Mencap.`;

      const params = new URLSearchParams();
      params.append("To", toAddress);
      params.append("From", fromNumber);
      params.append("Body", textBody);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
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
