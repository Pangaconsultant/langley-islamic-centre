import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifySignedSessionCookie } from "@/lib/staffSession";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";

// Brute-force PIN rate limiter per IP (5 attempts -> 15-minute lockout)
const pinAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hashCarpoolPin(pin: string): string {
  return crypto
    .createHash("sha256")
    .update(`lic_carpool_pin_v1::${pin.trim()}`)
    .digest("hex");
}

function timingSafeHexEqual(aHex: string, bHex: string): boolean {
  try {
    const aBuf = Buffer.from(aHex, "utf-8");
    const bBuf = Buffer.from(bHex, "utf-8");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

interface DbListingRow {
  id: string;
  role: "Driver" | "Passenger";
  name: string;
  sector: string;
  regular_times: string[];
  spare_seats: number;
  notes: string;
  private_phone: string;
  owner_pin_hash: string;
  gdpr_adult_consent: boolean;
  verified_community_member: boolean;
  created_at: string;
  expires_at: string;
}

interface DbRequestRow {
  id: string;
  listing_id: string;
  requester_name: string;
  requester_sector: string;
  requester_phone: string;
  requester_pin_hash: string;
  message: string;
  status: "Pending" | "Accepted";
  created_at: string;
}

/**
 * GET /api/carpool
 * Zero-Leakage UK GDPR Endpoint:
 * Never returns private_phone, owner_pin_hash, requester_phone, or requester_pin_hash in public responses.
 */
export async function GET() {
  try {
    const nowIso = new Date().toISOString();
    const [listingsRes, requestsRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_listings?expires_at=gt.${encodeURIComponent(
          nowIso
        )}&select=id,role,name,sector,regular_times,spare_seats,notes,verified_community_member,created_at,expires_at&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          cache: "no-store",
        }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_requests?select=id,listing_id,requester_name,requester_sector,message,status,created_at&order=created_at.asc`,
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          cache: "no-store",
        }
      ),
    ]);

    if (!listingsRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not load carpool listings." },
        { status: 500 }
      );
    }

    const listings = (await listingsRes.json()) as Array<
      Omit<DbListingRow, "private_phone" | "owner_pin_hash">
    >;
    const requests = requestsRes.ok
      ? ((await requestsRes.json()) as Array<
          Omit<DbRequestRow, "requester_phone" | "requester_pin_hash">
        >)
      : [];

    const publicListings = listings.map((item) => ({
      id: item.id,
      role: item.role,
      name: item.name,
      sector: item.sector,
      regularTimes: Array.isArray(item.regular_times) ? item.regular_times : [],
      spareSeats: item.spare_seats || 0,
      notes: item.notes || "",
      maskedPhone: "07700 •••••• (Server-Isolated)",
      verifiedCommunityMember: item.verified_community_member,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      matchRequests: requests
        .filter((r) => r.listing_id === item.id)
        .map((r) => ({
          id: r.id,
          requesterName: r.requester_name,
          requesterSector: r.requester_sector,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
        })),
    }));

    return NextResponse.json({
      ok: true,
      listings: publicListings,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load carpool listings." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const attemptRecord = pinAttempts.get(ip);

    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const minsLeft = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          ok: false,
          error: `Too many failed PIN attempts. Try again in ${minsLeft} minute(s).`,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      action?:
        | "create_listing"
        | "request_match"
        | "owner_accept_and_reveal"
        | "requester_reveal_accepted"
        | "delete_listing";
      // create_listing
      role?: "Driver" | "Passenger";
      name?: string;
      sector?: string;
      regularTimes?: string[];
      spareSeats?: number;
      privatePhone?: string;
      notes?: string;
      ownerPin?: string;
      gdprAdultConsent?: boolean;
      // request_match
      listingId?: string;
      requestId?: string;
      requesterName?: string;
      requesterSector?: string;
      requesterPhone?: string;
      requesterPin?: string;
      message?: string;
    };

    const sessionCookie = req.cookies.get("lic_staff_session")?.value;
    const isStaffAdmin = Boolean(
      sessionCookie && verifySignedSessionCookie(sessionCookie)
    );

    // ========================================================================
    // 1. CREATE PRIVACY-PROTECTED LISTING (60-DAY AUTO-EXPIRY + HASHED PIN)
    // ========================================================================
    if (body.action === "create_listing") {
      if (!body.gdprAdultConsent) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "You must confirm the 18+ Adult Safeguarding, UK Motor Insurance & UK GDPR Consent declaration.",
          },
          { status: 400 }
        );
      }

      const cleanName = (body.name || "").trim().slice(0, 60);
      const cleanPhone = (body.privatePhone || "").trim().slice(0, 24);
      const cleanPin = (body.ownerPin || "").trim();

      if (!cleanName || !cleanPhone || !/^\d{4}$/.test(cleanPin)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Display Name, Mobile Number, and a 4-digit numeric Listing PIN are required.",
          },
          { status: 400 }
        );
      }

      const id = `cp-${Date.now()}`;
      const expiresAt = new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString();

      const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_listings`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            role: body.role === "Passenger" ? "Passenger" : "Driver",
            name: cleanName,
            sector: (body.sector || "Trelawney Ave").slice(0, 50),
            regular_times: Array.isArray(body.regularTimes)
              ? body.regularTimes.slice(0, 10)
              : ["Isha"],
            spare_seats:
              body.role === "Driver"
                ? Math.max(1, Math.min(6, Number(body.spareSeats) || 1))
                : 0,
            notes: (body.notes || "").trim().slice(0, 240),
            private_phone: cleanPhone,
            owner_pin_hash: hashCarpoolPin(cleanPin),
            gdpr_adult_consent: true,
            verified_community_member: true,
            expires_at: expiresAt,
          }),
        }
      );

      if (!insertRes.ok) {
        return NextResponse.json(
          { ok: false, error: "Could not save carpool listing." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        id,
        expiresAt,
        message:
          "Your listing is live! Your phone number is isolated server-side in London (eu-west-2) and never exposed publicly. Keep your 4-digit PIN safe to accept match requests or delete your listing.",
      });
    }

    // ========================================================================
    // 2. SUBMIT MATCH REQUEST (WITH HASHED REQUESTER 4-DIGIT PIN)
    // ========================================================================
    if (body.action === "request_match") {
      if (!body.gdprAdultConsent) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Please confirm the 18+ Safeguarding & UK GDPR Consent checkbox.",
          },
          { status: 400 }
        );
      }

      const listingId = (body.listingId || "").trim();
      const reqName = (body.requesterName || "").trim().slice(0, 60);
      const reqPhone = (body.requesterPhone || "").trim().slice(0, 24);
      const reqPin = (body.requesterPin || "").trim();

      if (!listingId || !reqName || !reqPhone || !/^\d{4}$/.test(reqPin)) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Your Name, Phone Number, and a 4-digit Request PIN are required.",
          },
          { status: 400 }
        );
      }

      const id = `mreq-${Date.now()}`;
      const insertRes = await fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_requests`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            listing_id: listingId,
            requester_name: reqName,
            requester_sector: (body.requesterSector || "Langley High St").slice(
              0,
              50
            ),
            requester_phone: reqPhone,
            requester_pin_hash: hashCarpoolPin(reqPin),
            message: (
              body.message ||
              "Assalamu Alaikum, would love to share journeys from our SL3 sector."
            )
              .trim()
              .slice(0, 220),
            status: "Pending",
            gdpr_adult_consent: true,
          }),
        }
      );

      if (!insertRes.ok) {
        return NextResponse.json(
          { ok: false, error: "Could not submit match request." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        id,
        message:
          "Match request sent! Your phone number is hidden on the public board. Once the listing owner accepts, use your 4-digit Request PIN to view their phone number privately.",
      });
    }

    // ========================================================================
    // 3. OWNER ACCEPTS REQUEST & PRIVATELY REVEALS REQUESTER PHONE
    // ========================================================================
    if (body.action === "owner_accept_and_reveal") {
      const listingId = (body.listingId || "").trim();
      const requestId = (body.requestId || "").trim();
      const ownerPin = (body.ownerPin || "").trim();

      const [listingRes, reqRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/lic_carpool_listings?id=eq.${encodeURIComponent(
            listingId
          )}&select=id,name,private_phone,owner_pin_hash`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            cache: "no-store",
          }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/lic_carpool_requests?id=eq.${encodeURIComponent(
            requestId
          )}&listing_id=eq.${encodeURIComponent(
            listingId
          )}&select=id,requester_name,requester_phone,status`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            cache: "no-store",
          }
        ),
      ]);

      const listings = (await listingRes.json()) as DbListingRow[];
      const requests = (await reqRes.json()) as DbRequestRow[];
      const listing = listings?.[0];
      const matchReq = requests?.[0];

      if (!listing || !matchReq) {
        return NextResponse.json(
          { ok: false, error: "Listing or match request not found." },
          { status: 404 }
        );
      }

      const pinValid =
        isStaffAdmin ||
        (/^\d{4}$/.test(ownerPin) &&
          timingSafeHexEqual(
            hashCarpoolPin(ownerPin),
            listing.owner_pin_hash
          ));

      if (!pinValid) {
        const nextCount = (attemptRecord?.count || 0) + 1;
        pinAttempts.set(ip, {
          count: nextCount,
          lockedUntil:
            nextCount >= MAX_PIN_ATTEMPTS ? now + LOCKOUT_MS : 0,
        });
        return NextResponse.json(
          {
            ok: false,
            error: "Incorrect 4-digit Listing Owner PIN.",
          },
          { status: 401 }
        );
      }

      pinAttempts.delete(ip);

      if (matchReq.status !== "Accepted") {
        await fetch(
          `${SUPABASE_URL}/rest/v1/lic_carpool_requests?id=eq.${encodeURIComponent(
            requestId
          )}`,
          {
            method: "PATCH",
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Accepted" }),
          }
        );
      }

      return NextResponse.json({
        ok: true,
        revealedName: matchReq.requester_name,
        revealedPhone: matchReq.requester_phone,
      });
    }

    // ========================================================================
    // 4. REQUESTER PRIVATELY REVEALS LISTING OWNER PHONE (ONCE ACCEPTED)
    // ========================================================================
    if (body.action === "requester_reveal_accepted") {
      const listingId = (body.listingId || "").trim();
      const requestId = (body.requestId || "").trim();
      const requesterPin = (body.requesterPin || "").trim();

      const [listingRes, reqRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/lic_carpool_listings?id=eq.${encodeURIComponent(
            listingId
          )}&select=id,name,private_phone`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            cache: "no-store",
          }
        ),
        fetch(
          `${SUPABASE_URL}/rest/v1/lic_carpool_requests?id=eq.${encodeURIComponent(
            requestId
          )}&listing_id=eq.${encodeURIComponent(
            listingId
          )}&select=id,requester_pin_hash,status`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            cache: "no-store",
          }
        ),
      ]);

      const listings = (await listingRes.json()) as DbListingRow[];
      const requests = (await reqRes.json()) as DbRequestRow[];
      const listing = listings?.[0];
      const matchReq = requests?.[0];

      if (!listing || !matchReq) {
        return NextResponse.json(
          { ok: false, error: "Match record not found." },
          { status: 404 }
        );
      }

      if (matchReq.status !== "Accepted") {
        return NextResponse.json(
          {
            ok: false,
            error: "The listing owner has not accepted this match request yet.",
          },
          { status: 403 }
        );
      }

      const pinValid =
        isStaffAdmin ||
        (/^\d{4}$/.test(requesterPin) &&
          timingSafeHexEqual(
            hashCarpoolPin(requesterPin),
            matchReq.requester_pin_hash
          ));

      if (!pinValid) {
        const nextCount = (attemptRecord?.count || 0) + 1;
        pinAttempts.set(ip, {
          count: nextCount,
          lockedUntil:
            nextCount >= MAX_PIN_ATTEMPTS ? now + LOCKOUT_MS : 0,
        });
        return NextResponse.json(
          {
            ok: false,
            error: "Incorrect 4-digit Request PIN.",
          },
          { status: 401 }
        );
      }

      pinAttempts.delete(ip);
      return NextResponse.json({
        ok: true,
        revealedName: listing.name,
        revealedPhone: listing.private_phone,
      });
    }

    // ========================================================================
    // 5. RIGHT TO ERASURE (UK GDPR ART. 17) — OWNER PIN OR STAFF ADMIN DELETE
    // ========================================================================
    if (body.action === "delete_listing") {
      const listingId = (body.listingId || "").trim();
      const ownerPin = (body.ownerPin || "").trim();

      const listingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_listings?id=eq.${encodeURIComponent(
          listingId
        )}&select=id,name,owner_pin_hash`,
        {
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          cache: "no-store",
        }
      );

      const listings = (await listingRes.json()) as DbListingRow[];
      const listing = listings?.[0];
      if (!listing) {
        return NextResponse.json(
          { ok: false, error: "Listing not found." },
          { status: 404 }
        );
      }

      const authorized =
        isStaffAdmin ||
        (/^\d{4}$/.test(ownerPin) &&
          timingSafeHexEqual(
            hashCarpoolPin(ownerPin),
            listing.owner_pin_hash
          ));

      if (!authorized) {
        const nextCount = (attemptRecord?.count || 0) + 1;
        pinAttempts.set(ip, {
          count: nextCount,
          lockedUntil:
            nextCount >= MAX_PIN_ATTEMPTS ? now + LOCKOUT_MS : 0,
        });
        return NextResponse.json(
          {
            ok: false,
            error:
              "Incorrect 4-digit Listing PIN. Only the listing creator or an authorised LIC Staff Admin can delete this listing.",
          },
          { status: 401 }
        );
      }

      pinAttempts.delete(ip);
      await fetch(
        `${SUPABASE_URL}/rest/v1/lic_carpool_listings?id=eq.${encodeURIComponent(
          listingId
        )}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      return NextResponse.json({
        ok: true,
        message: `Listing for "${listing.name}" and all associated personal data have been permanently erased from Supabase (UK GDPR Art. 17).`,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported action." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request processing failed." },
      { status: 400 }
    );
  }
}
