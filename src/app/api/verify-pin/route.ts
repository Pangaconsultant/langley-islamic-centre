import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";
const DEFAULT_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2580";

async function getServerStoredPin(): Promise<string> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lic_portal_state?id=eq.lic_sl3_main&select=state`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return DEFAULT_PIN;
    const rows = (await res.json()) as Array<{ state?: { adminPin?: string } }>;
    return rows?.[0]?.state?.adminPin || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { pin?: string };
    const candidate = (body.pin || "").trim();
    const validPin = await getServerStoredPin();
    const ok = candidate.length >= 4 && candidate === validPin;
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
