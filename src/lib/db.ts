"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================================
// CORE DATA TYPES & INTERFACES
// ============================================================================

export type TravelMode = "Car / Drive" | "Car Share" | "Walking" | "Bicycle";

export type ActivityType =
  | "Fajr"
  | "Zuhar"
  | "Asr"
  | "Maghrib"
  | "Isha"
  | "Quran Class"
  | "Youth Circle"
  | "Other";

export interface VisitorCheckIn {
  id: string;
  visitorName: string;
  travelMode: TravelMode;
  occupantCount: 1 | 2 | 3 | 4;
  activity: ActivityType;
  timestamp: string;
  checkedOut?: boolean;
}

export interface OccupancyState {
  currentCount: number;
  maxCapacity: number; // Strictly 40 per SBC OMP
  lastUpdated: string;
  activeSessionName: ActivityType;
  peakToday: number;
  overflowCountToday: number;
}

export type MentorSector =
  | "GCSE/A-Level Tutoring"
  | "Tech/AI"
  | "Medicine"
  | "Engineering"
  | "Apprenticeships";

export interface Mentor {
  id: string;
  name: string;
  role: string;
  sector: MentorSector;
  specialties: string[];
  bio: string;
  dbsVerified: boolean;
  dbsCertRef: string;
  availability: string;
}

export interface MentoringRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  studentName: string;
  isUnder18: boolean;
  studentYearGroup: string;
  goalDescription: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  safeguardingConsent: boolean;
  status: "Pending" | "Confirmed" | "Completed";
  createdAt: string;
}

export type QuranSessionId = "session-1" | "session-2" | "session-3";

export type QuranPreferredDays = "Monday – Wednesday" | "Thursday – Saturday";

export type QuranReadingLevel =
  | "Learning Arabic letters"
  | "Qaida / Noorani Qaida"
  | "Can read basic Quran"
  | "Can read Quran fluently"
  | "Quran with Tajweed"
  | "Hifz / Memorisation"
  | "Other";

export type QuranLearningDuration =
  | "Less than 6 months"
  | "6 months – 1 year"
  | "1–2 years"
  | "2–3 years"
  | "3+ years";

export type QuranAdmissionStatus =
  | "Assessment Pending"
  | "Assessed - Awaiting £40 Standing Order"
  | "Confirmed & Enrolled"
  | "Waitlisted";

export interface QuranSession {
  id: QuranSessionId;
  title: string;
  levelLabel?: "Beginner" | "Intermediate" | "Advanced";
  officialTimeLabel?: string;
  timeWindow: "16:30–17:15" | "17:15–18:00" | "18:00–18:45";
  pickupAlertTime: string;
  ustadhName: string;
  maxCapacity: number; // Strictly 10 per session
  lastPickupAlertSent?: string;
}

export type AttendanceStatus = "Unmarked" | "Present" | "Late" | "Absent" | "Picked Up";

export interface QuranStudent {
  id: string;
  referenceNo?: string;
  sessionId: QuranSessionId;
  childName: string;
  dateOfBirth?: string;
  age: number;
  schoolYearGroup?: string;
  homeAddress?: string;
  postcode?: string;
  medicalOrAllergies?: string;
  parentName: string;
  relationshipToStudent?: "Father" | "Mother" | "Guardian" | "Other";
  parentPhone: string;
  parentEmail?: string;
  alternativeContactPhone?: string;
  currentQuranLevel?: QuranReadingLevel;
  learningDuration?: QuranLearningDuration;
  attendingOtherMaktab?: boolean;
  otherMaktabDetails?: string;
  previouslyAssessedByLic?: boolean;
  preferredDays?: QuranPreferredDays;
  travelMode: TravelMode;
  parkingRulesAccepted: boolean;
  digitalSignature?: string;
  signatureDate?: string;
  admissionStatus?: QuranAdmissionStatus;
  standingOrderVerified?: boolean;
  teacherAssessmentNotes?: string;
  attendance: AttendanceStatus;
  enrolledAt: string;
}

export interface EventSlotBooking {
  id: string;
  visitorName: string;
  phone: string;
  attendees: number;
  travelMode: TravelMode;
  bookedAt: string;
}

export interface EventTimeSlot {
  id: string;
  timeWindow: string;
  maxCapacity: number; // Strictly 35 per 30-min window
  bookedCount: number;
  bookings: EventSlotBooking[];
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: "Bereavement Condolence" | "Youth Circle" | "Sisters Working Group" | "Community Workshop";
  date: string;
  description: string;
  organizer: string;
  slots: EventTimeSlot[];
}

export type Sl3Sector =
  | "Langley High St"
  | "Harrow Market"
  | "Trelawney Ave"
  | "London Rd"
  | "Common Rd"
  | "Parlaunt Rd";

export interface CarpoolMatchRequest {
  id: string;
  requesterName: string;
  requesterSector: Sl3Sector;
  requesterPhone: string;
  message: string;
  status: "Pending" | "Accepted";
  createdAt: string;
}

export interface CarpoolMember {
  id: string;
  role: "Driver" | "Passenger";
  name: string;
  sector: Sl3Sector;
  regularTimes: string[];
  spareSeats: number;
  privatePhone: string; // Hidden until match accepted
  notes: string;
  verifiedCommunityMember: boolean;
  matchRequests: CarpoolMatchRequest[];
  createdAt: string;
}

export interface NeighbourIncident {
  id: string;
  ticketId: string;
  category:
    | "Parking in Unmarked Resident Yard / Mencap"
    | "Parking / Idling on Spitfire Close"
    | "Noise / Evening Dispersal"
    | "General Community Feedback";
  reporterName: string;
  reporterContact: string;
  incidentTime: string;
  description: string;
  status: "Open" | "Investigating" | "Resolved";
  assignedLead: string; // Waqar Ahmed
  investigationNotes: string;
  createdAt: string;
  resolvedAt?: string;
}

export type VolunteerDayCategory =
  | "Weekdays (Afternoon)"
  | "Daily (Evening)"
  | "Fridays (Off-Site Pavilion)"
  | "Weekends"
  | "Flexible / Remote";

export type VolunteerTimeWindow =
  | "Afternoon (13:00–17:30)"
  | "Evening (17:30–21:00)"
  | "Friday Midday (12:00–14:30)"
  | "Flexible Anytime";

export interface VolunteerTask {
  id: string;
  title: string;
  category: "Door Marshal & Dispersal" | "Off-Site Jummah Setup" | "Digital & AI Support" | "Community & Classes";
  location: string;
  dayFilter: VolunteerDayCategory;
  timeFilter: VolunteerTimeWindow;
  scheduleLabel: string;
  duration: string;
  description: string;
  status: "Open" | "Claimed";
  claimedByName?: string;
  claimedByWhatsApp?: string;
  claimedAt?: string;
}

export interface PrayerTimeEntry {
  name: "Fajr" | "Zuhar" | "Asr" | "Maghrib" | "Isha";
  adhan: string;
  jamaat: string;
  icon: string;
}

export interface MonthlyDayOverride {
  fajrJamaat?: string;
  zuharJamaat?: string;
  asrJamaat?: string;
  maghribAdhan?: string;
  maghribJamaat?: string;
  ishaJamaat?: string;
}

export interface MonthlyPrayerAdjustments {
  sunsetOffsetMinutes: number; // Fine-tune astronomical sunset at 51.5008°N, -0.5469°W
  maghribJamaatWaitMinutes: number; // Minutes after Sunset for Maghrib Jama'ah (default +5)
  fajrAdhanOffsetMinutes: number;
  fajrJamaatTime: string;
  zuharJamaatTime: string;
  asrJamaatTime: string;
  ishaJamaatTime: string;
  jummahTime: string;
  asrSchool: 0 | 1; // 1 = Hanafi, 0 = Standard (Shafi'i/Maliki/Hanbali)
  dayOverrides: Record<string, MonthlyDayOverride>; // key: "YYYY-MM-DD"
}

export type SpotlightTheme = "blue" | "emerald" | "amber";

export interface HomepageSpotlightSlide {
  id: string;
  active: boolean;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  theme: SpotlightTheme;
}

export interface LicDatabaseState {
  adminPin: string; // Confidential 4-digit PIN (never displayed publicly, resettable only inside Admin)
  prayerTimetable: PrayerTimeEntry[];
  monthlyPrayerAdjustments: MonthlyPrayerAdjustments;
  spotlightEnabled: boolean;
  spotlightSlides: HomepageSpotlightSlide[];
  occupancy: OccupancyState;
  checkIns: VisitorCheckIn[];
  frequentVisitors: string[];
  mentors: Mentor[];
  mentoringRequests: MentoringRequest[];
  quranSessions: QuranSession[];
  quranStudents: QuranStudent[];
  events: CommunityEvent[];
  carpoolMembers: CarpoolMember[];
  neighbourIncidents: NeighbourIncident[];
  volunteerTasks: VolunteerTask[];
}

// ============================================================================
// AUTO-DETECT SALAH / ACTIVITY BY TIME OF DAY
// ============================================================================

export function detectCurrentActivity(date = new Date()): ActivityType {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMins = hours * 60 + minutes;

  if (totalMins >= 270 && totalMins <= 450) return "Fajr";
  if (totalMins >= 720 && totalMins <= 870) return "Zuhar";
  if (totalMins >= 871 && totalMins <= 975) return "Asr";
  if (totalMins >= 976 && totalMins <= 1130) return "Quran Class";
  if (totalMins >= 1131 && totalMins <= 1185) return "Maghrib";
  if (totalMins >= 1186 && totalMins <= 1350) return "Isha";

  return "Isha";
}

export const PRAYER_TIMETABLE: PrayerTimeEntry[] = [
  { name: "Fajr", adhan: "05:45", jamaat: "06:15", icon: "Sunrise" },
  { name: "Zuhar", adhan: "12:15", jamaat: "12:45", icon: "Sun" },
  { name: "Asr", adhan: "14:30", jamaat: "15:00", icon: "CloudSun" },
  { name: "Maghrib", adhan: "16:18", jamaat: "16:23", icon: "Sunset" },
  { name: "Isha", adhan: "18:00", jamaat: "19:30", icon: "Moon" },
];

// ============================================================================
// INITIAL SEED DATA (REALISTIC SL3 & SBC TRAVEL PLAN RECORDS)
// ============================================================================

export const DEFAULT_SPOTLIGHT_SLIDES: HomepageSpotlightSlide[] = [
  {
    id: "spot-travel-hub",
    active: true,
    badge: "NOW PROMOTING • PUBLIC TRAVEL & PARKING GUIDANCE",
    title: "Visiting Spitfire Close? Check Our Travel Hub & Parking Guide First",
    description:
      "Please help us be great neighbours in SL3. Review our Red & Green parking zones before driving, use permitted public car parks, or share a lift with fellow Langley residents.",
    highlights: [
      "Permitted Car Parks: Common Rd, Harvey Park & Harrow Market (2–5 min walk)",
      "Strictly Red Zones: Never park in Mencap (gated next door) or Resident Yard",
      "On-site Cycle Rack (right of public layby) & privacy-first SL3 Car-Share",
    ],
    primaryCtaLabel: "Open Interactive Parking Map",
    primaryCtaHref: "/parking",
    secondaryCtaLabel: "Find an SL3 Car-Share Lift",
    secondaryCtaHref: "/carpool",
    imageUrl: "/images/lic-aerial-map.png",
    theme: "blue",
  },
  {
    id: "spot-maktab",
    active: true,
    badge: "EDUCATION • BOYS AGES 7–16",
    title: "Children's Quran Classes (Maktab) Open for Registration",
    description:
      "Structured Nazira Quran & Tajweed classes running 3 days a week (Mon–Wed or Thu–Sat) with teacher placement assessments and 5-minute WhatsApp pickup alerts.",
    highlights: [
      "Beginner, Intermediate & Advanced levels for Boys aged 7–16",
      "3 days/week cohorts (Mon–Wed or Thu–Sat) with teacher placement assessment",
      "Online 5-step registration with instant application status tracking",
    ],
    primaryCtaLabel: "Register Your Child",
    primaryCtaHref: "/quran-classes",
    secondaryCtaLabel: "Ask a Question",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/lic-building.jpg",
    theme: "emerald",
  },
  {
    id: "spot-jummah-sisters",
    active: true,
    badge: "WEEKLY SCHEDULE • IMPORTANT VENUE NOTICE",
    title: "Friday Jummah (13:15) at Langley Pavilion & Sisters' Tafsir",
    description:
      "Friday Jummah and Eid prayers are held OFF-SITE at Langley Pavilion so Spitfire Close stays calm for our neighbours. Sisters' Quran & Tafsir meets every Wednesday at LIC.",
    highlights: [
      "Friday Jummah (13:15): Off-site at Langley Pavilion (never at Spitfire Close)",
      "Sisters' Quran & Tafsir: Every Wednesday 13:30–14:30 at LIC",
      "Support your local Masjid via Stripe or HSBC Bank + 25% UK Gift Aid",
    ],
    primaryCtaLabel: "View Events & Schedule",
    primaryCtaHref: "/events",
    secondaryCtaLabel: "Support LIC Masjid",
    secondaryCtaHref: "/donations",
    imageUrl: "/images/spitfire-close.png",
    theme: "amber",
  },
];

export const DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS: MonthlyPrayerAdjustments = {
  sunsetOffsetMinutes: 0,
  maghribJamaatWaitMinutes: 5,
  fajrAdhanOffsetMinutes: 0,
  fajrJamaatTime: "06:15",
  zuharJamaatTime: "12:45",
  asrJamaatTime: "15:00",
  ishaJamaatTime: "19:30",
  jummahTime: "13:15 (Off-Site at Langley Pavilion)",
  asrSchool: 1,
  dayOverrides: {},
};

const DEFAULT_ENV_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2580";

const INITIAL_SEED_STATE: LicDatabaseState = {
  adminPin: DEFAULT_ENV_PIN,
  prayerTimetable: PRAYER_TIMETABLE,
  monthlyPrayerAdjustments: DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS,
  spotlightEnabled: true,
  spotlightSlides: DEFAULT_SPOTLIGHT_SLIDES,
  occupancy: {
    currentCount: 18,
    maxCapacity: 40,
    lastUpdated: new Date().toISOString(),
    activeSessionName: detectCurrentActivity(),
    peakToday: 31,
    overflowCountToday: 0,
  },
  frequentVisitors: [
    "Waqar Ahmed",
    "Nauman Raana",
    "Tariq Mahmood",
    "Yusuf Khan",
    "Imran Siddiqui",
    "Bilal Hussain",
    "Zaid Al-Mansoor",
    "Dr. Haroon Rashid",
    "Faisal Chaudhry",
    "Visiting Guest",
  ],
  checkIns: [
    {
      id: "chk-101",
      visitorName: "Waqar Ahmed",
      travelMode: "Walking",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    },
    {
      id: "chk-102",
      visitorName: "Nauman Raana",
      travelMode: "Car Share",
      occupantCount: 3,
      activity: "Isha",
      timestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    },
    {
      id: "chk-103",
      visitorName: "Tariq Mahmood",
      travelMode: "Bicycle",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
    },
    {
      id: "chk-104",
      visitorName: "Yusuf Khan",
      travelMode: "Walking",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 29 * 60000).toISOString(),
    },
    {
      id: "chk-105",
      visitorName: "Imran Siddiqui",
      travelMode: "Car Share",
      occupantCount: 4,
      activity: "Isha",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: "chk-106",
      visitorName: "Bilal Hussain",
      travelMode: "Car / Drive",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 21 * 60000).toISOString(),
    },
    {
      id: "chk-107",
      visitorName: "Zaid Al-Mansoor",
      travelMode: "Walking",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    },
    {
      id: "chk-108",
      visitorName: "Dr. Haroon Rashid",
      travelMode: "Car Share",
      occupantCount: 2,
      activity: "Isha",
      timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
    },
    {
      id: "chk-109",
      visitorName: "Faisal Chaudhry",
      travelMode: "Bicycle",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
    },
    {
      id: "chk-110",
      visitorName: "Omar Farooq",
      travelMode: "Walking",
      occupantCount: 1,
      activity: "Isha",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ],
  mentors: [
    {
      id: "mnt-1",
      name: "Dr. Haroon Rashid",
      role: "NHS Consultant & Medical School Interview Lead",
      sector: "Medicine",
      specialties: ["UCAT / BMAT Prep", "Medical Interviews", "A-Level Biology & Chemistry"],
      bio: "Supporting SL3 sixth-form students with medical, dental, and healthcare university applications and work experience guidance.",
      dbsVerified: true,
      dbsCertRef: "DBS-ENH-00184920",
      availability: "Saturdays 11:00–13:00",
    },
    {
      id: "mnt-2",
      name: "Zainab Malik, MEng",
      role: "Principal AI & Cloud Architect",
      sector: "Tech/AI",
      specialties: ["Software Engineering", "Python & AI Fundamentals", "CV & Tech Internships"],
      bio: "12+ years building cloud and AI platforms in London & Thames Valley. Passionate about mentoring young coders and sisters in STEM.",
      dbsVerified: true,
      dbsCertRef: "DBS-ENH-00192834",
      availability: "Wednesdays 18:45–20:00",
    },
    {
      id: "mnt-3",
      name: "Ustadh & Tutor Kamran Ali",
      role: "Qualified Secondary Maths & Physics Teacher (QTS)",
      sector: "GCSE/A-Level Tutoring",
      specialties: ["GCSE Higher Maths", "A-Level Further Maths", "GCSE Physics"],
      bio: "Grammar school Maths lead helping Langley students bridge attainment gaps and achieve Grade 7–9 results.",
      dbsVerified: true,
      dbsCertRef: "DBS-ENH-00176311",
      availability: "Sundays 14:00–16:00",
    },
    {
      id: "mnt-4",
      name: "Tariq Mahmood, CEng",
      role: "Chartered Aerospace & Civil Systems Engineer",
      sector: "Engineering",
      specialties: ["Mechanical & Civil Engineering", "CAD & Robotics", "STEM University Pathways"],
      bio: "Chartered Engineer guiding young people into Heathrow/Slough engineering careers and Russell Group engineering degrees.",
      dbsVerified: true,
      dbsCertRef: "DBS-ENH-00165092",
      availability: "Fortnightly Fridays 19:00–20:30",
    },
    {
      id: "mnt-5",
      name: "Hamza Qureshi",
      role: "Degree Apprenticeship Advisor (Big 4 & Engineering)",
      sector: "Apprenticeships",
      specialties: ["Level 6 Degree Apprenticeships", "Assessment Centres", "Debt-Free Career Routes"],
      bio: "Specialises in coaching Year 12 & Year 13 students through competitive Degree Apprenticeship assessment centres.",
      dbsVerified: true,
      dbsCertRef: "DBS-ENH-00198441",
      availability: "Saturdays 14:30–16:00",
    },
  ],
  mentoringRequests: [
    {
      id: "mreq-1",
      mentorId: "mnt-3",
      mentorName: "Ustadh & Tutor Kamran Ali",
      studentName: "Rayan Ahmed",
      isUnder18: true,
      studentYearGroup: "Year 11 (GCSE)",
      goalDescription: "Needs focused support on GCSE Higher Maths vectors and trigonometry before mock exams.",
      parentName: "Waqar Ahmed",
      parentPhone: "07700 900412",
      parentEmail: "waqar.parent@example.com",
      safeguardingConsent: true,
      status: "Confirmed",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  quranSessions: [
    {
      id: "session-1",
      title: "Beginner — Foundation Qaida & Arabic Letters",
      levelLabel: "Beginner",
      officialTimeLabel: "4:30pm – 5:30pm (Staggered Drop-Off: 16:30–17:15)",
      timeWindow: "16:30–17:15",
      pickupAlertTime: "17:10",
      ustadhName: "Qari Abdullah Hasan",
      maxCapacity: 10,
      lastPickupAlertSent: "17:10 (Yesterday)",
    },
    {
      id: "session-2",
      title: "Intermediate — Nazira Quran Reading & Tajweed Rules",
      levelLabel: "Intermediate",
      officialTimeLabel: "5:30pm – 6:30pm (Staggered Drop-Off: 17:15–18:00)",
      timeWindow: "17:15–18:00",
      pickupAlertTime: "17:55",
      ustadhName: "Qari Abdullah Hasan",
      maxCapacity: 10,
    },
    {
      id: "session-3",
      title: "Advanced — Fluent Quran Recitation & Applied Tajweed",
      levelLabel: "Advanced",
      officialTimeLabel: "6:30pm – 7:30pm (Staggered Drop-Off: 18:00–18:45)",
      timeWindow: "18:00–18:45",
      pickupAlertTime: "18:40",
      ustadhName: "Qari Abdullah Hasan",
      maxCapacity: 10,
    },
  ],
  quranStudents: [
    // Session 1 (8 / 10 students enrolled)
    { id: "qs-101", sessionId: "session-1", childName: "Zayd Siddiqui", age: 7, parentName: "Imran Siddiqui", parentPhone: "07700 900111", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-01" },
    { id: "qs-102", sessionId: "session-1", childName: "Maryam Siddiqui", age: 8, parentName: "Imran Siddiqui", parentPhone: "07700 900111", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-01" },
    { id: "qs-103", sessionId: "session-1", childName: "Ibrahim Khan", age: 6, parentName: "Yusuf Khan", parentPhone: "07700 900222", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-02" },
    { id: "qs-104", sessionId: "session-1", childName: "Aisha Mahmood", age: 7, parentName: "Tariq Mahmood", parentPhone: "07700 900333", travelMode: "Car Share", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-03" },
    { id: "qs-105", sessionId: "session-1", childName: "Hamza Raana", age: 8, parentName: "Nauman Raana", parentPhone: "07700 900444", travelMode: "Car / Drive", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-04" },
    { id: "qs-106", sessionId: "session-1", childName: "Yunus Hussain", age: 7, parentName: "Bilal Hussain", parentPhone: "07700 900555", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Late", enrolledAt: "2026-09-05" },
    { id: "qs-107", sessionId: "session-1", childName: "Fatima Al-Mansoor", age: 6, parentName: "Zaid Al-Mansoor", parentPhone: "07700 900666", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-06" },
    { id: "qs-108", sessionId: "session-1", childName: "Ammar Chaudhry", age: 8, parentName: "Faisal Chaudhry", parentPhone: "07700 900777", travelMode: "Bicycle", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-07" },

    // Session 2 (10 / 10 students enrolled - FULL)
    { id: "qs-201", sessionId: "session-2", childName: "Hassan Ahmed", age: 10, parentName: "Waqar Ahmed", parentPhone: "07700 900412", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-01" },
    { id: "qs-202", sessionId: "session-2", childName: "Khadijah Ahmed", age: 9, parentName: "Waqar Ahmed", parentPhone: "07700 900412", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-01" },
    { id: "qs-203", sessionId: "session-2", childName: "Sulaiman Rashid", age: 10, parentName: "Dr. Haroon Rashid", parentPhone: "07700 900888", travelMode: "Car Share", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-02" },
    { id: "qs-204", sessionId: "session-2", childName: "Dawud Rashid", age: 11, parentName: "Dr. Haroon Rashid", parentPhone: "07700 900888", travelMode: "Car Share", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-02" },
    { id: "qs-205", sessionId: "session-2", childName: "Safiyyah Malik", age: 9, parentName: "Zainab Malik", parentPhone: "07700 900999", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-03" },
    { id: "qs-206", sessionId: "session-2", childName: "Idris Farooq", age: 10, parentName: "Omar Farooq", parentPhone: "07700 900123", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-03" },
    { id: "qs-207", sessionId: "session-2", childName: "Noor Qureshi", age: 10, parentName: "Hamza Qureshi", parentPhone: "07700 900234", travelMode: "Car / Drive", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-04" },
    { id: "qs-208", sessionId: "session-2", childName: "Musa Ali", age: 9, parentName: "Kamran Ali", parentPhone: "07700 900345", travelMode: "Bicycle", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-05" },
    { id: "qs-209", sessionId: "session-2", childName: "Hafsa Latif", age: 11, parentName: "Nadeem Latif", parentPhone: "07700 900456", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-06" },
    { id: "qs-210", sessionId: "session-2", childName: "Bilal Anwar", age: 10, parentName: "Sajid Anwar", parentPhone: "07700 900567", travelMode: "Car Share", parkingRulesAccepted: true, attendance: "Present", enrolledAt: "2026-09-06" },

    // Session 3 (7 / 10 students enrolled)
    { id: "qs-301", sessionId: "session-3", childName: "Rayan Ahmed", age: 13, parentName: "Waqar Ahmed", parentPhone: "07700 900412", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-01" },
    { id: "qs-302", sessionId: "session-3", childName: "Sumayyah Khan", age: 12, parentName: "Yusuf Khan", parentPhone: "07700 900222", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-02" },
    { id: "qs-303", sessionId: "session-3", childName: "Talha Mahmood", age: 13, parentName: "Tariq Mahmood", parentPhone: "07700 900333", travelMode: "Bicycle", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-02" },
    { id: "qs-304", sessionId: "session-3", childName: "Zainab Hussain", age: 12, parentName: "Bilal Hussain", parentPhone: "07700 900555", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-03" },
    { id: "qs-305", sessionId: "session-3", childName: "Haris Chaudhry", age: 14, parentName: "Faisal Chaudhry", parentPhone: "07700 900777", travelMode: "Bicycle", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-04" },
    { id: "qs-306", sessionId: "session-3", childName: "Ruqayyah Al-Mansoor", age: 12, parentName: "Zaid Al-Mansoor", parentPhone: "07700 900666", travelMode: "Walking", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-05" },
    { id: "qs-307", sessionId: "session-3", childName: "Ayaan Rehman", age: 13, parentName: "Ashfaq Rehman", parentPhone: "07700 900678", travelMode: "Car Share", parkingRulesAccepted: true, attendance: "Unmarked", enrolledAt: "2026-09-06" },
  ],
  events: [
    {
      id: "evt-1",
      title: "Community Bereavement Condolence (Ta'ziyah) — Late Haji Abdul Karim",
      category: "Bereavement Condolence",
      date: "2026-11-18",
      description:
        "Staggered 30-minute condolence slots to support the bereaved family while strictly maintaining LIC's 40-person maximum building limit and peaceful Spitfire Close dispersal.",
      organizer: "LIC Bereavement & Welfare Committee",
      slots: [
        {
          id: "slot-101",
          timeWindow: "13:30 – 14:00",
          maxCapacity: 35,
          bookedCount: 35,
          bookings: [],
        },
        {
          id: "slot-102",
          timeWindow: "14:00 – 14:30",
          maxCapacity: 35,
          bookedCount: 28,
          bookings: [],
        },
        {
          id: "slot-103",
          timeWindow: "14:30 – 15:00",
          maxCapacity: 35,
          bookedCount: 14,
          bookings: [],
        },
      ],
    },
    {
      id: "evt-2",
      title: "Fortnightly SL3 Youth Circle & Employability Workshop",
      category: "Youth Circle",
      date: "2026-11-21",
      description:
        "Interactive youth reflection, study skills clinic, and Q&A with local STEM professionals. Pre-booking mandatory (capped at 35 attendees per 30-min arrival window).",
      organizer: "LIC Youth Hub",
      slots: [
        {
          id: "slot-201",
          timeWindow: "18:30 – 19:00 (Session A)",
          maxCapacity: 35,
          bookedCount: 22,
          bookings: [],
        },
        {
          id: "slot-202",
          timeWindow: "19:00 – 19:30 (Session B)",
          maxCapacity: 35,
          bookedCount: 19,
          bookings: [],
        },
      ],
    },
    {
      id: "evt-3",
      title: "Sisters' Quran & Tafsir Class (Wednesdays 13:30–14:30)",
      category: "Sisters Working Group",
      date: "2026-11-25",
      description:
        "Weekly Wednesday Sisters' Quran Class (13:30–14:30) led under the LIC Sisters' Working Group SOP framework. Staggered arrival via Common Road & Harrow Market.",
      organizer: "LIC Sisters' Working Group",
      slots: [
        {
          id: "slot-301",
          timeWindow: "13:30 – 14:00",
          maxCapacity: 35,
          bookedCount: 24,
          bookings: [],
        },
        {
          id: "slot-302",
          timeWindow: "14:00 – 14:30",
          maxCapacity: 35,
          bookedCount: 15,
          bookings: [],
        },
      ],
    },
  ],
  carpoolMembers: [
    {
      id: "cp-1",
      role: "Driver",
      name: "Nauman R.",
      sector: "Trelawney Ave",
      regularTimes: ["Fajr", "Isha", "Weekend Youth Circle"],
      spareSeats: 3,
      privatePhone: "07700 900444",
      notes: "Departs Trelawney Ave 10 mins before Jamaat, parks at Common Road unrestricted bay.",
      verifiedCommunityMember: true,
      matchRequests: [
        {
          id: "m-1",
          requesterName: "Khalid M.",
          requesterSector: "Trelawney Ave",
          requesterPhone: "07700 900811",
          message: "Assalamu Alaikum brother, I live near Trelawney Ave shops and attend Isha daily.",
          status: "Accepted",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
      createdAt: "2026-10-15",
    },
    {
      id: "cp-2",
      role: "Driver",
      name: "Dr. Haroon R.",
      sector: "London Rd",
      regularTimes: ["Fajr", "Isha"],
      spareSeats: 2,
      privatePhone: "07700 900888",
      notes: "Electric vehicle. Happy to pick up along London Rd / High St and park at Harrow Market Car Park.",
      verifiedCommunityMember: true,
      matchRequests: [],
      createdAt: "2026-10-18",
    },
    {
      id: "cp-3",
      role: "Driver",
      name: "Sister Zainab M.",
      sector: "Harrow Market",
      regularTimes: ["Sisters' Wednesday Class"],
      spareSeats: 3,
      privatePhone: "07700 900999",
      notes: "Sisters-only car share for Wednesday 13:30–14:30 Quran class & afternoon drop-offs.",
      verifiedCommunityMember: true,
      matchRequests: [],
      createdAt: "2026-10-20",
    },
    {
      id: "cp-4",
      role: "Passenger",
      name: "Uncle Bashir A.",
      sector: "Langley High St",
      regularTimes: ["Fajr", "Zuhar", "Isha"],
      spareSeats: 0,
      privatePhone: "07700 900712",
      notes: "Elderly community member seeking lift from Langley High St during wet/cold evenings.",
      verifiedCommunityMember: true,
      matchRequests: [],
      createdAt: "2026-10-25",
    },
  ],
  neighbourIncidents: [
    {
      id: "inc-1",
      ticketId: "LIC-NL-2026-8410",
      category: "Parking in Unmarked Resident Yard / Mencap",
      reporterName: "Spitfire Close Resident (#14)",
      reporterContact: "resident14@spitfireclose.example",
      incidentTime: "2026-11-10 17:12",
      description:
        "A visitor car pulled into the unmarked resident parking yard in front of LIC during class pickup at 17:12.",
      status: "Resolved",
      assignedLead: "Waqar Ahmed (Operations Lead)",
      investigationNotes:
        "Door marshal immediately guided driver out of the resident yard to Common Road within 90 seconds. Updated digital parking map to highlight the unmarked resident yard in front of LIC and Mencap gated parking next door.",
      createdAt: "2026-11-10T17:18:00Z",
      resolvedAt: "2026-11-10T18:05:00Z",
    },
    {
      id: "inc-2",
      ticketId: "LIC-NL-2026-8492",
      category: "General Community Feedback",
      reporterName: "Mrs. H. Davies (Neighbour)",
      reporterContact: "07700 900309",
      incidentTime: "2026-11-14 19:45",
      description:
        "Thank you to the door marshals in hi-vis vests who kept the resident yard in front of LIC completely clear this evening.",
      status: "Resolved",
      assignedLead: "Waqar Ahmed (Operations Lead)",
      investigationNotes:
        "Logged positive neighbour feedback for SBC Travel Plan & Operational Management Plan audit file. Shared commendation with volunteer marshal team.",
      createdAt: "2026-11-14T20:02:00Z",
      resolvedAt: "2026-11-14T20:30:00Z",
    },
  ],
  volunteerTasks: [
    {
      id: "vol-1",
      title: "16:15–17:15 Quran Class Door & Drop-Off Marshal",
      category: "Door Marshal & Dispersal",
      location: "Spitfire Close Entrance (SL3)",
      dayFilter: "Weekdays (Afternoon)",
      timeFilter: "Afternoon (13:00–17:30)",
      scheduleLabel: "Today / Weekdays • 16:15–17:15",
      duration: "60 mins",
      description:
        "Wear LIC hi-vis vest at the Spitfire Close entrance, greet arriving Session 1 & 2 Quran students, ensure zero parking in the unmarked Resident Yard in front of LIC or Mencap next door, and update the Live 40-Person Counter.",
      status: "Open",
    },
    {
      id: "vol-2",
      title: "Isha Quiet Dispersal Steward",
      category: "Door Marshal & Dispersal",
      location: "Spitfire Close Entrance (SL3)",
      dayFilter: "Daily (Evening)",
      timeFilter: "Evening (17:30–21:00)",
      scheduleLabel: "Daily • 19:20–19:50 (Isha Jama'ah)",
      duration: "30 mins",
      description:
        "Ensure peaceful, quiet exit after Isha Jama'ah so Spitfire Close neighbours are undisturbed, and guide drivers walking back to Common Road & Harrow Market.",
      status: "Open",
    },
    {
      id: "vol-3",
      title: "Langley Pavilion Friday Setup",
      category: "Off-Site Jummah Setup",
      location: "Langley Pavilion (Off-Site Friday Jummah Venue)",
      dayFilter: "Fridays (Off-Site Pavilion)",
      timeFilter: "Friday Midday (12:00–14:30)",
      scheduleLabel: "Fridays • 12:15–14:15 (Off-Site)",
      duration: "2 hours",
      description:
        "Assist with prayer mat layout, PA audio check, and car park stewarding at our off-site Langley Pavilion venue (Note: Friday Jummah is held off-site at Langley Pavilion, never at Spitfire Close).",
      status: "Open",
    },
    {
      id: "vol-4",
      title: "Web/AI Digital Support",
      category: "Digital & AI Support",
      location: "Remote / Spitfire Close Tablet Setup",
      dayFilter: "Flexible / Remote",
      timeFilter: "Flexible Anytime",
      scheduleLabel: "Flexible • 1–2 hrs/week",
      duration: "Flexible",
      description:
        "Support the LIC digital portal, maintain the entrance Check-In Kiosk tablet, update monthly Jama'ah timetables, and assist community members with the SL3 Car-Share Matcher.",
      status: "Claimed",
      claimedByName: "Faisal Chaudhry",
      claimedByWhatsApp: "07700 900777",
      claimedAt: "Today, 14:20",
    },
    {
      id: "vol-5",
      title: "17:15–18:45 Quran Class Handover & Pickup Marshal",
      category: "Door Marshal & Dispersal",
      location: "Spitfire Close Entrance (SL3)",
      dayFilter: "Weekdays (Afternoon)",
      timeFilter: "Evening (17:30–21:00)",
      scheduleLabel: "Weekdays & Saturday • 17:15–18:45",
      duration: "90 mins",
      description:
        "Supervise staggered Session 2 & Session 3 student handovers after the 5-minute SMS pickup alert and ensure parents do not enter the unmarked resident yard in front of LIC.",
      status: "Open",
    },
    {
      id: "vol-6",
      title: "Sisters' Wednesday Quran Class Steward (13:30–14:30)",
      category: "Community & Classes",
      location: "Spitfire Close (SL3)",
      dayFilter: "Weekdays (Afternoon)",
      timeFilter: "Afternoon (13:00–17:30)",
      scheduleLabel: "Wednesdays • 13:15–14:45",
      duration: "90 mins",
      description:
        "Welcome sisters attending the Wednesday 13:30–14:30 Quran Class, assist with Kiosk check-in, and maintain the 40-person building limit.",
      status: "Open",
    },
  ],
};

// ============================================================================
// STORAGE & REAL-TIME SYNC ENGINE (LOCALSTORAGE + BROADCASTCHANNEL + CLOUD READY)
// ============================================================================

const STORAGE_KEY = "lic_portal_db_v3";
const CHANNEL_NAME = "lic_portal_realtime_sync";

// Cloud Supabase PostgreSQL Endpoint & Publishable Key (LIC Organization - London eu-west-2)
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mxoyobwpbkiysijgayfw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_wRaJKv2zKD6kdQAK-AZTWA_LALl_3WM";
const SUPABASE_ROW_ID = "lic_sl3_main";

async function pushStateToSupabase(nextState: LicDatabaseState): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/lic_portal_state?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: SUPABASE_ROW_ID,
        state: nextState,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Supabase cloud sync fallback to local:", err);
  }
}

async function fetchStateFromSupabase(): Promise<LicDatabaseState | null> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/lic_portal_state?id=eq.${SUPABASE_ROW_ID}&select=state,updated_at`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ state: LicDatabaseState }>;
    if (!rows || rows.length === 0) {
      // Seed cloud database on first connect
      const initial = getDbState();
      await pushStateToSupabase(initial);
      return initial;
    }
    const cloudState = rows[0].state;
    if (cloudState && cloudState.occupancy) {
      return cloudState;
    }
    return null;
  } catch {
    return null;
  }
}

export function getDbState(): LicDatabaseState {
  if (typeof window === "undefined") {
    return INITIAL_SEED_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_STATE));
      return INITIAL_SEED_STATE;
    }
    const parsed = JSON.parse(raw) as LicDatabaseState;
    if (!parsed.volunteerTasks) parsed.volunteerTasks = INITIAL_SEED_STATE.volunteerTasks;
    if (!parsed.prayerTimetable || parsed.prayerTimetable.length === 0) {
      parsed.prayerTimetable = PRAYER_TIMETABLE;
    }
    if (!parsed.monthlyPrayerAdjustments) {
      parsed.monthlyPrayerAdjustments = DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS;
    }
    if (typeof parsed.spotlightEnabled !== "boolean") {
      parsed.spotlightEnabled = true;
    }
    if (!Array.isArray(parsed.spotlightSlides)) {
      parsed.spotlightSlides = DEFAULT_SPOTLIGHT_SLIDES;
    } else {
      parsed.spotlightSlides = parsed.spotlightSlides.map((s) => ({
        ...s,
        highlights: (s.highlights || []).map((h) =>
          h.includes("£40/month")
            ? "3 days/week cohorts (Mon–Wed or Thu–Sat) with teacher placement assessment"
            : h
        ),
      }));
    }
    if (!parsed.adminPin) parsed.adminPin = DEFAULT_ENV_PIN;
    return parsed;
  } catch {
    return INITIAL_SEED_STATE;
  }
}

export function saveDbState(nextState: LicDatabaseState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent("lic-db-updated", { detail: nextState }));
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: "SYNC_STATE", payload: nextState });
      bc.close();
    }
    void pushStateToSupabase(nextState);
  } catch (err) {
    console.error("Failed to persist LIC state:", err);
  }
}

export function resetDbToSeed(): LicDatabaseState {
  const currentPin = getDbState().adminPin || DEFAULT_ENV_PIN;
  const next = { ...INITIAL_SEED_STATE, adminPin: currentPin };
  saveDbState(next);
  return next;
}

/**
 * React hook providing live-synced database state across all 10 LIC modules and open tabs.
 */
export function useLicStore() {
  const [state, setState] = useState<LicDatabaseState>(INITIAL_SEED_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(getDbState());
    setHydrated(true);

    // Smart Quota-Friendly Supabase Sync:
    // Fetches once on mount, when tab regains visibility/focus, and only polls every 20s on /occupancy
    let active = true;
    const syncCloud = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      const cloud = await fetchStateFromSupabase();
      if (active && cloud) {
        if (!cloud.prayerTimetable || cloud.prayerTimetable.length === 0) {
          cloud.prayerTimetable = PRAYER_TIMETABLE;
        }
        if (!cloud.monthlyPrayerAdjustments) {
          cloud.monthlyPrayerAdjustments = DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS;
        }
        if (typeof cloud.spotlightEnabled !== "boolean") {
          cloud.spotlightEnabled = true;
        }
        if (!Array.isArray(cloud.spotlightSlides)) {
          cloud.spotlightSlides = DEFAULT_SPOTLIGHT_SLIDES;
        } else {
          cloud.spotlightSlides = cloud.spotlightSlides.map((s) => ({
            ...s,
            highlights: (s.highlights || []).map((h) =>
              h.includes("£40/month")
                ? "3 days/week cohorts (Mon–Wed or Thu–Sat) with teacher placement assessment"
                : h
            ),
          }));
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
        setState(cloud);
      }
    };
    void syncCloud();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void syncCloud();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    const isLiveCounterRoute =
      typeof window !== "undefined" &&
      (window.location.pathname === "/occupancy" ||
        window.location.pathname === "/kiosk");
    const pollInterval = isLiveCounterRoute
      ? setInterval(syncCloud, 20000)
      : null;

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LicDatabaseState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      } else {
        setState(getDbState());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setState(getDbState());
      }
    };

    window.addEventListener("lic-db-updated", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (msg.data?.type === "SYNC_STATE" && msg.data?.payload) {
          setState(msg.data.payload);
        }
      };
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("lic-db-updated", handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const mutate = useCallback((updater: (prev: LicDatabaseState) => LicDatabaseState) => {
    const current = getDbState();
    const updated = updater(current);
    saveDbState(updated);
    setState(updated);
    return updated;
  }, []);

  // Confidential Admin PIN Reset / Update (Only callable from inside unlocked Admin Backend)
  const updateAdminPin = useCallback(
    (newPin: string): boolean => {
      const cleaned = newPin.trim();
      if (!/^\d{4,6}$/.test(cleaned)) return false;
      mutate((prev) => ({
        ...prev,
        adminPin: cleaned,
      }));
      return true;
    },
    [mutate]
  );

  // Prayer Timetable CMS & UK Location Auto-Sync (Spitfire Close, Langley SL3 8GY: 51.5008° N, -0.5469° W)
  const updatePrayerTimetable = useCallback(
    (nextTimetable: PrayerTimeEntry[]) => {
      mutate((prev) => ({
        ...prev,
        prayerTimetable: nextTimetable,
      }));
    },
    [mutate]
  );

  const syncUkLangleyPrayerTimes = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    try {
      const currentState = getDbState();
      const adj =
        currentState.monthlyPrayerAdjustments ||
        DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS;
      // Open-source AlAdhan UK API (github.com/islamic-network/api.aladhan.com)
      // Method 15 = Moonsighting Committee Worldwide (UK High-Latitude Standard)
      // Coordinates: Spitfire Close, Langley, Slough SL3 8GY (51.5008°N, -0.5469°W)
      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=51.5008&longitude=-0.5469&method=15&school=${adj.asrSchool}&timezonestring=Europe/London`
      );
      if (!res.ok) {
        return {
          ok: false,
          message: "Could not reach UK Prayer Timetable API. Please check your connection.",
        };
      }
      const json = await res.json();
      const timings = json?.data?.timings;
      if (!timings) {
        return { ok: false, message: "Invalid response from UK Timetable API." };
      }

      const cleanTime = (raw: string) => (raw || "").split(" ")[0].slice(0, 5);
      const addMinutes = (hhmm: string, minsToAdd: number) => {
        const [h, m] = hhmm.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) return hhmm;
        const total = (h * 60 + m + minsToAdd + 1440) % 1440;
        const nh = String(Math.floor(total / 60)).padStart(2, "0");
        const nm = String(total % 60).padStart(2, "0");
        return `${nh}:${nm}`;
      };

      const fajrAdhan = addMinutes(
        cleanTime(timings.Fajr),
        adj.fajrAdhanOffsetMinutes || 0
      );
      const zuharAdhan = cleanTime(timings.Dhuhr);
      const asrAdhan = cleanTime(timings.Asr);
      // Astronomical Sunset at Spitfire Close (51.5008°N, -0.5469°W) + admin sunset offset
      const rawSunset = cleanTime(timings.Sunset || timings.Maghrib);
      const maghribAdhan = addMinutes(rawSunset, adj.sunsetOffsetMinutes || 0);
      const maghribJamaat = addMinutes(
        maghribAdhan,
        adj.maghribJamaatWaitMinutes ?? 5
      );
      const ishaAdhan = cleanTime(timings.Isha);

      mutate((prev) => {
        const current = prev.prayerTimetable || PRAYER_TIMETABLE;
        const updated: PrayerTimeEntry[] = [
          {
            name: "Fajr",
            adhan: fajrAdhan || current[0].adhan,
            jamaat: adj.fajrJamaatTime || current[0].jamaat,
            icon: "Sunrise",
          },
          {
            name: "Zuhar",
            adhan: zuharAdhan || current[1].adhan,
            jamaat: adj.zuharJamaatTime || current[1].jamaat,
            icon: "Sun",
          },
          {
            name: "Asr",
            adhan: asrAdhan || current[2].adhan,
            jamaat: adj.asrJamaatTime || current[2].jamaat,
            icon: "CloudSun",
          },
          {
            name: "Maghrib",
            adhan: maghribAdhan || current[3].adhan,
            jamaat: maghribJamaat || current[3].jamaat,
            icon: "Sunset",
          },
          {
            name: "Isha",
            adhan: ishaAdhan || current[4].adhan,
            jamaat: adj.ishaJamaatTime || current[4].jamaat,
            icon: "Moon",
          },
        ];
        return {
          ...prev,
          prayerTimetable: updated,
        };
      });

      return {
        ok: true,
        message: `Synced exact Langley SL3 sunset (${maghribAdhan}) & UK Adhan times (51.5008°N, -0.5469°W • Europe/London) & set Maghrib Jama'ah to ${maghribJamaat}.`,
      };
    } catch {
      return {
        ok: false,
        message: "Failed to fetch UK prayer times.",
      };
    }
  }, [mutate]);

  const updateMonthlyPrayerAdjustments = useCallback(
    (patch: Partial<MonthlyPrayerAdjustments>) => {
      mutate((prev) => {
        const nextAdj: MonthlyPrayerAdjustments = {
          ...(prev.monthlyPrayerAdjustments ||
            DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS),
          ...patch,
        };
        const currentTimetable = prev.prayerTimetable || PRAYER_TIMETABLE;
        const nextTimetable = currentTimetable.map((entry) => {
          if (entry.name === "Fajr" && patch.fajrJamaatTime) {
            return { ...entry, jamaat: patch.fajrJamaatTime };
          }
          if (entry.name === "Zuhar" && patch.zuharJamaatTime) {
            return { ...entry, jamaat: patch.zuharJamaatTime };
          }
          if (entry.name === "Asr" && patch.asrJamaatTime) {
            return { ...entry, jamaat: patch.asrJamaatTime };
          }
          if (entry.name === "Isha" && patch.ishaJamaatTime) {
            return { ...entry, jamaat: patch.ishaJamaatTime };
          }
          return entry;
        });
        return {
          ...prev,
          monthlyPrayerAdjustments: nextAdj,
          prayerTimetable: nextTimetable,
        };
      });
    },
    [mutate]
  );

  const setMonthlyDayOverride = useCallback(
    (dateKey: string, override: MonthlyDayOverride | null) => {
      mutate((prev) => {
        const currentAdj =
          prev.monthlyPrayerAdjustments || DEFAULT_MONTHLY_PRAYER_ADJUSTMENTS;
        const nextOverrides = { ...(currentAdj.dayOverrides || {}) };
        if (!override || Object.keys(override).length === 0) {
          delete nextOverrides[dateKey];
        } else {
          nextOverrides[dateKey] = {
            ...(nextOverrides[dateKey] || {}),
            ...override,
          };
        }
        return {
          ...prev,
          monthlyPrayerAdjustments: {
            ...currentAdj,
            dayOverrides: nextOverrides,
          },
        };
      });
    },
    [mutate]
  );

  // 1. Visitor Kiosk Check-In Action
  const recordVisitorCheckIn = useCallback(
    (payload: {
      visitorName: string;
      travelMode: TravelMode;
      occupantCount: 1 | 2 | 3 | 4;
      activity: ActivityType;
    }): { success: boolean; capacityReached: boolean; newOccupancy: number } => {
      let result = { success: false, capacityReached: false, newOccupancy: 0 };

      mutate((prev) => {
        const current = prev.occupancy.currentCount;
        if (current >= prev.occupancy.maxCapacity) {
          result = {
            success: false,
            capacityReached: true,
            newOccupancy: current,
          };
          return {
            ...prev,
            occupancy: {
              ...prev.occupancy,
              overflowCountToday: prev.occupancy.overflowCountToday + 1,
            },
          };
        }

        const nextOccupancy = Math.min(prev.occupancy.maxCapacity, current + 1);
        const newRecord: VisitorCheckIn = {
          id: `chk-${Date.now()}`,
          visitorName: payload.visitorName.trim() || "Visiting Guest",
          travelMode: payload.travelMode,
          occupantCount: payload.travelMode === "Car Share" ? payload.occupantCount : 1,
          activity: payload.activity,
          timestamp: new Date().toISOString(),
        };

        result = {
          success: true,
          capacityReached: nextOccupancy >= prev.occupancy.maxCapacity,
          newOccupancy: nextOccupancy,
        };

        return {
          ...prev,
          occupancy: {
            ...prev.occupancy,
            currentCount: nextOccupancy,
            activeSessionName: payload.activity,
            lastUpdated: new Date().toISOString(),
            peakToday: Math.max(prev.occupancy.peakToday, nextOccupancy),
          },
          checkIns: [newRecord, ...prev.checkIns],
        };
      });

      return result;
    },
    [mutate]
  );

  const addFrequentVisitor = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      mutate((prev) => ({
        ...prev,
        frequentVisitors: prev.frequentVisitors.includes(trimmed)
          ? prev.frequentVisitors
          : [...prev.frequentVisitors, trimmed],
      }));
    },
    [mutate]
  );

  const removeFrequentVisitor = useCallback(
    (name: string) => {
      mutate((prev) => ({
        ...prev,
        frequentVisitors: prev.frequentVisitors.filter((v) => v !== name),
      }));
    },
    [mutate]
  );

  // 2. Door Marshal Occupancy Adjustments (+1, -1, Reset Session)
  const adjustOccupancy = useCallback(
    (delta: number, sessionName?: ActivityType) => {
      mutate((prev) => {
        const nextCount = Math.max(
          0,
          Math.min(prev.occupancy.maxCapacity, prev.occupancy.currentCount + delta)
        );
        return {
          ...prev,
          occupancy: {
            ...prev.occupancy,
            currentCount: nextCount,
            activeSessionName: sessionName || prev.occupancy.activeSessionName,
            lastUpdated: new Date().toISOString(),
            peakToday: Math.max(prev.occupancy.peakToday, nextCount),
          },
        };
      });
    },
    [mutate]
  );

  const resetOccupancySession = useCallback(
    (newSessionName?: ActivityType) => {
      mutate((prev) => ({
        ...prev,
        occupancy: {
          ...prev.occupancy,
          currentCount: 0,
          activeSessionName: newSessionName || detectCurrentActivity(),
          lastUpdated: new Date().toISOString(),
        },
      }));
    },
    [mutate]
  );

  // 3. Mentoring Session Requests & Admin Mentor CRUD
  const submitMentoringRequest = useCallback(
    (req: Omit<MentoringRequest, "id" | "status" | "createdAt">) => {
      mutate((prev) => ({
        ...prev,
        mentoringRequests: [
          {
            ...req,
            id: `mreq-${Date.now()}`,
            status: "Pending",
            createdAt: new Date().toISOString(),
          },
          ...prev.mentoringRequests,
        ],
      }));
    },
    [mutate]
  );

  const addMentor = useCallback(
    (mentor: Omit<Mentor, "id">) => {
      mutate((prev) => ({
        ...prev,
        mentors: [{ ...mentor, id: `mnt-${Date.now()}` }, ...prev.mentors],
      }));
    },
    [mutate]
  );

  const deleteMentor = useCallback(
    (mentorId: string) => {
      mutate((prev) => ({
        ...prev,
        mentors: prev.mentors.filter((m) => m.id !== mentorId),
      }));
    },
    [mutate]
  );

  const updateMentoringRequestStatus = useCallback(
    (reqId: string, status: MentoringRequest["status"]) => {
      mutate((prev) => ({
        ...prev,
        mentoringRequests: prev.mentoringRequests.map((r) =>
          r.id === reqId ? { ...r, status } : r
        ),
      }));
    },
    [mutate]
  );

  // 4. Quran Class Attendance, Enrolment & Admin Management
  const updateStudentAttendance = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      mutate((prev) => ({
        ...prev,
        quranStudents: prev.quranStudents.map((s) =>
          s.id === studentId ? { ...s, attendance: status } : s
        ),
      }));
    },
    [mutate]
  );

  const triggerPickupAlert = useCallback(
    (sessionId: QuranSessionId) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      mutate((prev) => ({
        ...prev,
        quranSessions: prev.quranSessions.map((ses) =>
          ses.id === sessionId
            ? { ...ses, lastPickupAlertSent: `${timestamp} (Today)` }
            : ses
        ),
      }));
    },
    [mutate]
  );

  const enrollQuranStudent = useCallback(
    (
      student: Omit<QuranStudent, "id" | "attendance" | "enrolledAt">
    ): { ok: boolean; referenceNo?: string; status?: QuranAdmissionStatus; error?: string } => {
      let res: {
        ok: boolean;
        referenceNo?: string;
        status?: QuranAdmissionStatus;
        error?: string;
      } = { ok: false };
      mutate((prev) => {
        const currentInSession = prev.quranStudents.filter(
          (s) => s.sessionId === student.sessionId
        ).length;
        const isSessionFull = currentInSession >= 10;
        const refNo =
          student.referenceNo ||
          `LIC-MKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const initialStatus: QuranAdmissionStatus = isSessionFull
          ? "Waitlisted"
          : student.admissionStatus || "Assessment Pending";

        res = {
          ok: true,
          referenceNo: refNo,
          status: initialStatus,
        };
        return {
          ...prev,
          quranStudents: [
            {
              ...student,
              id: `qs-${Date.now()}`,
              referenceNo: refNo,
              admissionStatus: initialStatus,
              standingOrderVerified: student.standingOrderVerified ?? false,
              attendance: "Unmarked",
              enrolledAt: new Date().toISOString().split("T")[0],
            },
            ...prev.quranStudents,
          ],
        };
      });
      return res;
    },
    [mutate]
  );

  const updateQuranStudentAdmission = useCallback(
    (
      studentId: string,
      updates: {
        sessionId?: QuranSessionId;
        admissionStatus?: QuranAdmissionStatus;
        standingOrderVerified?: boolean;
        teacherAssessmentNotes?: string;
      }
    ) => {
      mutate((prev) => ({
        ...prev,
        quranStudents: prev.quranStudents.map((s) =>
          s.id === studentId ? { ...s, ...updates } : s
        ),
      }));
    },
    [mutate]
  );

  const removeQuranStudent = useCallback(
    (studentId: string) => {
      mutate((prev) => ({
        ...prev,
        quranStudents: prev.quranStudents.filter((s) => s.id !== studentId),
      }));
    },
    [mutate]
  );

  // 5. Event & Bereavement Slot Booking & Admin CRUD
  const bookEventSlot = useCallback(
    (
      eventId: string,
      slotId: string,
      booking: Omit<EventSlotBooking, "id" | "bookedAt">
    ): { ok: boolean; error?: string } => {
      let res: { ok: boolean; error?: string } = { ok: false };
      mutate((prev) => {
        const nextEvents = prev.events.map((evt) => {
          if (evt.id !== eventId) return evt;
          const nextSlots = evt.slots.map((slot) => {
            if (slot.id !== slotId) return slot;
            if (slot.bookedCount + booking.attendees > slot.maxCapacity) {
              res = {
                ok: false,
                error: `Only ${slot.maxCapacity - slot.bookedCount} spaces remaining in this 30-minute window (capped at 35).`,
              };
              return slot;
            }
            res = { ok: true };
            return {
              ...slot,
              bookedCount: slot.bookedCount + booking.attendees,
              bookings: [
                ...slot.bookings,
                {
                  ...booking,
                  id: `bk-${Date.now()}`,
                  bookedAt: new Date().toISOString(),
                },
              ],
            };
          });
          return { ...evt, slots: nextSlots };
        });
        return { ...prev, events: nextEvents };
      });
      return res;
    },
    [mutate]
  );

  const createCommunityEvent = useCallback(
    (newEvent: {
      title: string;
      category: CommunityEvent["category"];
      date: string;
      description: string;
      organizer: string;
      timeWindows: string[];
    }) => {
      mutate((prev) => ({
        ...prev,
        events: [
          {
            id: `evt-${Date.now()}`,
            title: newEvent.title,
            category: newEvent.category,
            date: newEvent.date,
            description: newEvent.description,
            organizer: newEvent.organizer,
            slots: newEvent.timeWindows.map((tw, idx) => ({
              id: `slot-${Date.now()}-${idx}`,
              timeWindow: tw,
              maxCapacity: 35,
              bookedCount: 0,
              bookings: [],
            })),
          },
          ...prev.events,
        ],
      }));
    },
    [mutate]
  );

  const deleteCommunityEvent = useCallback(
    (eventId: string) => {
      mutate((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
    },
    [mutate]
  );

  // 6. SL3 Car-Share Matcher Actions
  const registerCarpoolMember = useCallback(
    (member: Omit<CarpoolMember, "id" | "verifiedCommunityMember" | "matchRequests" | "createdAt">) => {
      mutate((prev) => ({
        ...prev,
        carpoolMembers: [
          {
            ...member,
            id: `cp-${Date.now()}`,
            verifiedCommunityMember: true,
            matchRequests: [],
            createdAt: new Date().toISOString().split("T")[0],
          },
          ...prev.carpoolMembers,
        ],
      }));
    },
    [mutate]
  );

  const requestCarpoolMatch = useCallback(
    (
      memberId: string,
      req: Omit<CarpoolMatchRequest, "id" | "status" | "createdAt">
    ) => {
      mutate((prev) => ({
        ...prev,
        carpoolMembers: prev.carpoolMembers.map((m) =>
          m.id === memberId
            ? {
                ...m,
                matchRequests: [
                  ...m.matchRequests,
                  {
                    ...req,
                    id: `mreq-${Date.now()}`,
                    status: "Pending",
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : m
        ),
      }));
    },
    [mutate]
  );

  const acceptCarpoolMatch = useCallback(
    (memberId: string, requestId: string) => {
      mutate((prev) => ({
        ...prev,
        carpoolMembers: prev.carpoolMembers.map((m) =>
          m.id === memberId
            ? {
                ...m,
                matchRequests: m.matchRequests.map((r) =>
                  r.id === requestId ? { ...r, status: "Accepted" } : r
                ),
              }
            : m
        ),
      }));
    },
    [mutate]
  );

  // 8. Neighbour Liaison & Incident Log Actions
  const submitNeighbourIncident = useCallback(
    (
      payload: Omit<
        NeighbourIncident,
        "id" | "ticketId" | "status" | "assignedLead" | "investigationNotes" | "createdAt"
      >
    ): string => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `LIC-NL-2026-${randomNum}`;
      mutate((prev) => ({
        ...prev,
        neighbourIncidents: [
          {
            ...payload,
            id: `inc-${Date.now()}`,
            ticketId,
            status: "Open",
            assignedLead: "Waqar Ahmed (Operations Lead)",
            investigationNotes:
              "Automated alert dispatched to Operations Lead (Waqar Ahmed). Initial review pending.",
            createdAt: new Date().toISOString(),
          },
          ...prev.neighbourIncidents,
        ],
      }));
      return ticketId;
    },
    [mutate]
  );

  const updateIncidentStatus = useCallback(
    (
      incidentId: string,
      status: NeighbourIncident["status"],
      investigationNotes: string
    ) => {
      mutate((prev) => ({
        ...prev,
        neighbourIncidents: prev.neighbourIncidents.map((inc) =>
          inc.id === incidentId
            ? {
                ...inc,
                status,
                investigationNotes,
                resolvedAt:
                  status === "Resolved"
                    ? new Date().toISOString()
                    : inc.resolvedAt,
              }
            : inc
        ),
      }));
    },
    [mutate]
  );

  // 10. Flexible Volunteer "Pick-a-Task" Scheduler & Admin Task CRUD
  const claimVolunteerTask = useCallback(
    (taskId: string, volunteerName: string, volunteerWhatsApp: string) => {
      const timeLabel = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      mutate((prev) => ({
        ...prev,
        volunteerTasks: prev.volunteerTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "Claimed",
                claimedByName: volunteerName.trim(),
                claimedByWhatsApp: volunteerWhatsApp.trim(),
                claimedAt: `Today, ${timeLabel}`,
              }
            : t
        ),
      }));
    },
    [mutate]
  );

  const releaseVolunteerTask = useCallback(
    (taskId: string) => {
      mutate((prev) => ({
        ...prev,
        volunteerTasks: prev.volunteerTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "Open",
                claimedByName: undefined,
                claimedByWhatsApp: undefined,
                claimedAt: undefined,
              }
            : t
        ),
      }));
    },
    [mutate]
  );

  const addVolunteerTask = useCallback(
    (task: Omit<VolunteerTask, "id" | "status">) => {
      mutate((prev) => ({
        ...prev,
        volunteerTasks: [
          {
            ...task,
            id: `vol-${Date.now()}`,
            status: "Open",
          },
          ...prev.volunteerTasks,
        ],
      }));
    },
    [mutate]
  );

  const deleteVolunteerTask = useCallback(
    (taskId: string) => {
      mutate((prev) => ({
        ...prev,
        volunteerTasks: prev.volunteerTasks.filter((t) => t.id !== taskId),
      }));
    },
    [mutate]
  );

  // 11. Homepage Spotlight / What's On Carousel Actions
  const setSpotlightEnabled = useCallback(
    (enabled: boolean) => {
      mutate((prev) => ({
        ...prev,
        spotlightEnabled: enabled,
      }));
    },
    [mutate]
  );

  const addSpotlightSlide = useCallback(
    (slide: Omit<HomepageSpotlightSlide, "id">) => {
      mutate((prev) => ({
        ...prev,
        spotlightSlides: [
          {
            ...slide,
            id: `spot-${Date.now()}`,
          },
          ...(prev.spotlightSlides || []),
        ],
      }));
    },
    [mutate]
  );

  const updateSpotlightSlide = useCallback(
    (id: string, patch: Partial<HomepageSpotlightSlide>) => {
      mutate((prev) => ({
        ...prev,
        spotlightSlides: (prev.spotlightSlides || []).map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      }));
    },
    [mutate]
  );

  const deleteSpotlightSlide = useCallback(
    (id: string) => {
      mutate((prev) => ({
        ...prev,
        spotlightSlides: (prev.spotlightSlides || []).filter((s) => s.id !== id),
      }));
    },
    [mutate]
  );

  const moveSpotlightSlide = useCallback(
    (id: string, direction: "up" | "down") => {
      mutate((prev) => {
        const list = [...(prev.spotlightSlides || [])];
        const idx = list.findIndex((s) => s.id === id);
        if (idx === -1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= list.length) return prev;
        const tmp = list[idx];
        list[idx] = list[swapIdx];
        list[swapIdx] = tmp;
        return {
          ...prev,
          spotlightSlides: list,
        };
      });
    },
    [mutate]
  );

  return {
    state,
    hydrated,
    updateAdminPin,
    updatePrayerTimetable,
    syncUkLangleyPrayerTimes,
    updateMonthlyPrayerAdjustments,
    setMonthlyDayOverride,
    setSpotlightEnabled,
    addSpotlightSlide,
    updateSpotlightSlide,
    deleteSpotlightSlide,
    moveSpotlightSlide,
    recordVisitorCheckIn,
    addFrequentVisitor,
    removeFrequentVisitor,
    adjustOccupancy,
    resetOccupancySession,
    submitMentoringRequest,
    addMentor,
    deleteMentor,
    updateMentoringRequestStatus,
    updateStudentAttendance,
    triggerPickupAlert,
    enrollQuranStudent,
    updateQuranStudentAdmission,
    removeQuranStudent,
    bookEventSlot,
    createCommunityEvent,
    deleteCommunityEvent,
    registerCarpoolMember,
    requestCarpoolMatch,
    acceptCarpoolMatch,
    submitNeighbourIncident,
    updateIncidentStatus,
    claimVolunteerTask,
    releaseVolunteerTask,
    addVolunteerTask,
    deleteVolunteerTask,
    resetDbToSeed,
  };
}
