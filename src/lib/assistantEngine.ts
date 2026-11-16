import { LicDatabaseState, PRAYER_TIMETABLE } from "./db";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: string;
  actionLink?: { label: string; href: string };
}

export const QUICK_PROMPTS = [
  "Where can I park (and not park) on Spitfire Close?",
  "Where is Friday Jummah & Eid prayer held?",
  "When is the Sisters' Quran Class?",
  "What are today's Daily Jama'ah times?",
  "How can I volunteer for a task (/volunteer)?",
  "What is the 40-person building cap?",
];

export function generateAssistantReply(
  query: string,
  state: LicDatabaseState
): { text: string; actionLink?: { label: string; href: string } } {
  const q = query.toLowerCase();

  // Off-site Langley Pavilion info for Friday Jummah and Eid prayers
  if (
    q.includes("jummah") ||
    q.includes("jumuah") ||
    q.includes("friday") ||
    q.includes("eid") ||
    q.includes("pavilion")
  ) {
    return {
      text: `OFFICIAL NOTICE: Friday Jummah and Eid prayers are NOT held at Spitfire Close. To protect our 40-person building limit and local neighbourhood, all Friday Jummah and Eid congregations are held off-site at Langley Pavilion (Langley Road, SL3 8BS). Volunteers can also sign up for Langley Pavilion Friday Setup on our Volunteer Scheduler.`,
      actionLink: { label: "Join Langley Pavilion Friday Setup (/volunteer)", href: "/volunteer" },
    };
  }

  // Sisters' Quran Class info (Wednesdays 13:30–14:30)
  if (
    q.includes("sister") ||
    q.includes("wednesday") ||
    q.includes("13:30") ||
    q.includes("ladies") ||
    q.includes("women")
  ) {
    return {
      text: `Sisters' Quran Class runs every Wednesday from 13:30 to 14:30 at Langley Islamic Centre (Spitfire Close, SL3). Attendance is strictly capped within our 40-person building limit.`,
      actionLink: { label: "View Sisters' Event Slots & Car-Share", href: "/events" },
    };
  }

  // Parking rules (Mencap, Resident Yard in front of LIC, End Bays, Layby, Common Rd, Harvey Park, Harrow Market)
  if (
    q.includes("park") ||
    q.includes("car") ||
    q.includes("spitfire") ||
    q.includes("mencap") ||
    q.includes("layby") ||
    q.includes("yard") ||
    q.includes("common road") ||
    q.includes("harvey") ||
    q.includes("harrow market") ||
    q.includes("idling")
  ) {
    return {
      text: `OFFICIAL SPITFIRE CLOSE PARKING RULES:\n• STRICTLY NO PARKING (RED ZONES): (1) Mencap Parking next door (behind metal gates), and (2) The Resident Parking Yard directly in front of LIC (which has NO gate or signage displayed—visitors must NEVER park there!).\n• PERMITTED PUBLIC PARKING (GREEN ZONES): (1) The Public Parking Bays at the end of LIC, (2) The Public Layby in front of LIC, (3) Common Road unrestricted zones (2–3m walk), (4) Harvey Park Car Park (3–4m walk), and (5) Harrow Market Car Park (4–5m walk).`,
      actionLink: { label: "Inspect Interactive Spitfire Close Map (/parking)", href: "/parking" },
    };
  }

  // Daily Jama'ah timetable
  if (
    q.includes("prayer") ||
    q.includes("salah") ||
    q.includes("jamaat") ||
    q.includes("jama'ah") ||
    q.includes("namaz") ||
    q.includes("fajr") ||
    q.includes("isha") ||
    q.includes("maghrib") ||
    q.includes("zuhar") ||
    q.includes("asr") ||
    q.includes("time")
  ) {
    const timesList = PRAYER_TIMETABLE.map(
      (p) => `${p.name}: Adhan ${p.adhan} / Jama'ah ${p.jamaat}`
    ).join(" • ");
    return {
      text: `Today's Official Daily Jama'ah Timetable at Spitfire Close (SL3): ${timesList}. (Note: Friday Jummah & Eid prayers are held off-site at Langley Pavilion, NOT at Spitfire Close).`,
      actionLink: { label: "View Full Timetable (/assistant)", href: "/assistant" },
    };
  }

  // Volunteer Pick-a-Task Scheduler
  if (
    q.includes("volunteer") ||
    q.includes("marshal") ||
    q.includes("steward") ||
    q.includes("help") ||
    q.includes("shift") ||
    q.includes("task")
  ) {
    const openCount = state.volunteerTasks.filter((t) => t.status === "Open").length;
    return {
      text: `Our Flexible Volunteer "Pick-a-Task" Scheduler (/volunteer) currently has ${openCount} open micro-volunteering shifts—including 16:15–17:15 Quran Class Door & Drop-Off Marshal, Isha Quiet Dispersal Steward, Langley Pavilion Friday Setup, and Web/AI Digital Support. You can claim or release a shift in 1 tap.`,
      actionLink: { label: "Open Volunteer Pick-a-Task Board (/volunteer)", href: "/volunteer" },
    };
  }

  // 40-person cap & occupancy
  if (
    q.includes("occupancy") ||
    q.includes("capacity") ||
    q.includes("full") ||
    q.includes("40") ||
    q.includes("cap") ||
    q.includes("limit")
  ) {
    const { currentCount, maxCapacity } = state.occupancy;
    const remaining = Math.max(0, maxCapacity - currentCount);
    return {
      text: `LIC enforces a strict 40-person maximum building occupancy limit (inclusive of staff and volunteers). Live occupancy right now is ${currentCount} / ${maxCapacity} (${remaining} spaces remaining).`,
      actionLink: { label: "Check Live 40-Person Counter (/occupancy)", href: "/occupancy" },
    };
  }

  // Children's Quran classes
  if (q.includes("quran") || q.includes("child") || q.includes("maktab") || q.includes("pickup")) {
    return {
      text: `Children's weekday/Saturday Quran Classes run in three sequential 45-minute sessions (16:30–17:15, 17:15–18:00, 18:00–18:45), strictly capped at 10 students per session. For Sisters' Quran Class, sessions take place on Wednesdays 13:30–14:30.`,
      actionLink: { label: "Open Children's Quran Class Portal", href: "/quran-classes" },
    };
  }

  return {
    text: `Assalamu Alaikum! I am grounded strictly in Langley Islamic Centre's official Spitfire Close (SL3) operational guidelines:\n• Daily Jama'ah prayers at Spitfire Close (strictly capped at 40 persons; current: ${state.occupancy.currentCount}/40).\n• Sisters' Quran Class: Wednesdays 13:30–14:30.\n• Friday Jummah & Eid Prayers: Held OFF-SITE at Langley Pavilion (never at Spitfire Close).\n• Parking: Never park in Mencap (metal gates next door) or the unmarked Resident Parking Yard in front of LIC. Public bays at the end of LIC, the layby in front of LIC, Common Road, Harvey Park Car Park, and Harrow Market Car Park are permitted.`,
    actionLink: { label: "Inspect Spitfire Close Parking Map (/parking)", href: "/parking" },
  };
}
