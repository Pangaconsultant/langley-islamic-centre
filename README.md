# Langley Islamic Centre (LIC) — Unified Community Website & Internal Operations Portal
**Location:** Spitfire Close, Langley, Slough (SL3 8GY) • **Registered Charity No:** 1180443

## Architecture Segregation: Public Community Website vs. Internal LIC Operations

### A. LIC Public Community Website Modules (Public-Facing)
1. **24/7 AI Community Assistant & Live Prayer Times (`/assistant`)** — Daily Jama'ah timetable, Sisters' Quran Class (Wednesdays `13:30–14:30`), Off-site **Langley Pavilion** for Friday Jummah & Eid prayers (clarifying Jummah is not held at Spitfire Close), parking rules, 40-person cap, and quick links to `/kiosk`, `/parking`, and `/volunteer`.
2. **Interactive Spitfire Close Travel & Parking Map (`/parking`)** — Accurate interactive site schematic of Spitfire Close:
   - **Strictly No Parking (Red Zones):**
     - **Mencap Parking (Next Door — With Metal Gates):** Private Mencap property behind metal gates immediately adjacent to LIC.
     - **Unmarked Resident Parking Yard (Directly in Front of LIC — No Gate or Signage Displayed):** Located directly opposite/in front of LIC; strictly private resident parking even though no gate or signage is displayed.
   - **Permitted Public Parking (Green Zones):**
     - **Public Parking Bays at the End of LIC** and the **Public Layby in Front of LIC**.
     - **Common Road Unrestricted Zones** (2–3 min walk) and **Harrow Market Car Park** (4–5 min walk), with 1-tap **Open in Google Maps** buttons.
   - **Active Travel (Blue Zones):** On-site Spitfire Close cycle rack and nearby SL3 bus stops.
3. **Children's Quran Class Parent Portal (`/quran-classes`)** — Sequential 45-minute weekday/Saturday classes (`16:30–17:15`, `17:15–18:00`, `18:00–18:45`) strictly capped at **10 students per session** with mandatory parent parking & non-idling agreement.
4. **Youth Hub & Careers Mentoring Network (`/mentoring`)** — Public directory of **DBS Verified** community mentors across `GCSE/A-Level Tutoring`, `Tech/AI`, `Medicine`, `Engineering`, and `Apprenticeships` with mandatory parent/guardian safeguarding fields for under-18s.
5. **Event & Bereavement Slot-Booking System (`/events`)** — Staggered 30-minute attendance windows capped at **35 visitors per slot** (auto-locking when full).
6. **SL3 Community Car-Share Matcher (`/carpool`)** — Privacy-first ride-sharing board for SL3 streets (*Langley High St, Harrow Market, Trelawney Ave, London Rd, Common Rd, Parlaunt Rd*) that masks personal phone numbers until a match request is accepted.
7. **Flexible Volunteer "Pick-a-Task" Scheduler (`/volunteer`)** — Self-serve micro-volunteering board filterable by day/time availability with **Claim Shift** (Name & WhatsApp) and 1-tap **Release Shift**.
8. **Digital Neighbour Liaison Report Form (`/neighbour-log`)** — Public QR reporting form generating unique Ticket IDs (`LIC-NL-2026-XXXX`) and alerting Operations Lead **Waqar Ahmed**.

---

### B. LIC Staff Admin Access & Indoor Kiosk (Restricted / Internal)
Accessible strictly via the **Staff Admin Access** menu in the navigation header:
1. **Indoor Kiosk (`/kiosk`)** — Full-screen indoor tablet interface mounted at the Spitfire Close entrance (4-second auto-reset, no external navigation links, quick-tap frequent regulars, Travel Mode + conditional Car Share occupant count, and automatic Live Occupancy increment).
2. **Door Marshal Live 40-Person Counter (`/occupancy`)** — Real-time headcount console enforcing the strict **40-person maximum building limit** with Green (`0–29`), Amber (`30–36`), and Red (`37–40` Overflow Protocol) status banners, `+1` / `-1` Marshal buttons, and `Reset Session`.
3. **Admin Backend, CMS & SBC Compliance Portal (`/admin`)** — Protected by a **confidential 4-digit Admin PIN** (never displayed on screen; configurable in `.env.local` and resettable by Admins inside `/admin` → *Security & Reset Confidential PIN*):
   - **Volunteer Tasks CMS:** Add, manage, unclaim, or delete tasks for `/volunteer`.
   - **Mentors & Requests CMS:** Add/remove DBS-verified mentors and update student mentoring request statuses for `/mentoring`.
   - **Events, Quran & Kiosk CMS:** Publish/delete staggered events, manage `/kiosk` quick-tap regular chips, and manage the Quran class student roster.
   - **SBC Travel Plan & CSV Export:** Modal split analytics and 1-tap CSV export (`LIC_Visitors_SBC_Audit_YYYY-MM-DD.csv`).
   - **Confidential PIN Reset:** Change/reset the 4-digit Admin PIN at any time.
   - *(Internal PIN-locked tabs are also integrated inside `/quran-classes` for Teacher Attendance & 5-Min Pickup Alerts, `/events` for Event Creation, and `/neighbour-log` for Waqar Ahmed's SBC Investigation & Resolution Audit Log).*
