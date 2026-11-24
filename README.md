# ProofWork: Electrician Skill Passport & Job Matching

> **A responsive, mobile-first Progressive Web Application (PWA) and verified job-matching network that gives India's informal electricians an official digital skill passport and connects them to nearby residential and commercial electrical contracts across Bengaluru.**
>
> *Built by Team Blizzard, AMC Engineering College, Bengaluru.*

---

## 1. Product Overview

Over 90% of India's ~550 million informal workers operate without formal trade credentials or verifiable paper trails. In the electrical trade, skilled electricians struggle to prove their competence when moving between sites, while builders and contractors are forced to hire blind—risking dangerous rewiring, costly rework, and BESCOM safety violations.

**ProofWork bridges this trust deficit with an assistive AI + human-in-the-loop verification loop:**
1. **Practical Demonstration:** The electrician records a 60-second video performing a standard electrical task (e.g., wiring a two-way staircase switch or mounting an MCB and earthing busbar), speaking a randomized anti-fraud phrase in **Kannada**, **Hindi**, or **English**.
2. **Assistive AI Safety Scoring:** A multimodal inspection engine evaluates sampled video frames against a **6-point safety checklist** (power isolation, wire gauge, earthing, polarity, termination neatness, PPE).
3. **One-Tap Peer/Contractor Confirmation:** The candidate shares a private verification link on WhatsApp. A licensed electrical contractor or senior peer reviews the clip and confirms with one tap—**no login required**.
4. **Tamper-Evident QR Skill Passport:** Upon human confirmation, an official passport is issued with a **monospaced verification ID**, a **SHA-256 cryptographic hash**, and a **high-contrast QR code** verifiable on any phone or job site.
5. **Contractor Job Engine:** Contractors post requirements by typing or by **voice input** (Web Speech API in Kannada, Hindi, or English). The system calculates Haversine distance and ranks nearby verified talent with one-tap contact (Call & WhatsApp).

---

## 2. Multi-Breakpoint Responsive Design

ProofWork is built mobile-first with clean fluid responsiveness across all standard screen sizes without letterboxing or artificial phone frames on desktop:

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **320px** | iPhone SE, compact Androids | Single-column, fluid typography, $\ge 48\text{px}$ touch targets, safe-area insets, zero horizontal scroll. |
| **375px** | Standard smartphones | Native 16px body copy, comfortable line height for Indic scripts (Kannada, Hindi). |
| **390px** | iPhone 13/14/15/16 | Full-height `dvh` layouts, bottom tab bar, floating thumb-reachable actions. |
| **768px** | Tablets (iPad portrait) | Two-column grid layout for worker screens; collapsible drawer navigation. |
| **1024px** | Laptops, tablet landscape | Desktop header navigation, multi-column contractor dashboard. |
| **1440px** | Desktop monitors | Centered `max-w-7xl` container; 5-col status & 7-col jobs feed for workers; 2-col contractor desk. |
| **1920px** | Full HD & ultra-wide displays | Balanced whitespace, restrained typography, zero stretched containers. |

---

## 3. Public Landing Page (`/`)

The public entry at `"/"` showcases the ProofWork platform with 9 structured, accessible sections:
1. **Sticky Header Navbar:** ProofWork brand mark ("BENGALURU, KA"), navigation anchors (`#how-it-works`, `#for-workers`, `#for-contractors`, `#faq`), tri-lingual selector (English / ಕನ್ನಡ / हिन्दी), and quick CTAs.
2. **Hero Section:** "Your skill, verified." headline, supporting value statement, dual CTAs ("Get Verified", "Hire Electricians"), and a faithful device mockup of the verified passport and AI assessment breakdown.
3. **The Informal Trade Deficit (Problem Strip):** Three high-impact statistics (550M+ informal workers, 0 portable skill proof, 78% contractors hire blind), citing **Data For India, ILO 2024**.
4. **How ProofWork Operates:** 4-step workflow (Record 60s Task $\rightarrow$ Assistive AI Check $\rightarrow$ One-Tap Peer Sign-Off $\rightarrow$ Tamper-Evident QR Passport).
5. **Worker & Contractor Value Pillars:** Two side-by-side cards detailing the 3 core benefits for electricians and electrical contractors.
6. **Live Skill Passport Preview:** A full-size credential card showing real candidate Girish Kumar, QR verification, checklist items, and SHA-256 cryptographic hash.
7. **Built on Uncompromising Trust Principles:** Four governance pillars: "AI Assists, Humans Decide", "Anti-Fraud Spoken Verification", "Privacy-First Data Ownership", and "Native Multilingual Design".
8. **Frequently Asked Questions (FAQ):** Interactive accordion resolving 6 common questions (pricing, verification process, video privacy, languages, phone requirements, and trades).
9. **Final Call-to-Action & Footer:** Dual conversion buttons, Team Blizzard AMC Engineering College attribution, contact address (`blizzard@amcec.edu.in`), BESCOM compliance badge, and legal links.

---

## 4. Route Map

| Route | Role / Audience | Description |
| :--- | :--- | :--- |
| `/` | Public | High-converting landing page with live passport preview, statistics, and FAQs. |
| `/app` | Electrician (Worker) | Worker dashboard: passport status card, daily rate, and nearby job leads. |
| `/auth` | Public / Worker | Phone + OTP login (dev mock OTP: `123456`) and language selection. |
| `/profile-setup` | Worker | Profile editing: locality picker, experience slider, daily rate, and bio. |
| `/tasks` | Worker | Practical task picker with guide steps and randomized anti-fraud spoken phrase. |
| `/record` | Worker | 60-second video capture with client-side compression and countdown timer. |
| `/result/:id` | Worker | 6-point AI safety assessment results, confidence metric, and shareable link. |
| `/verify/:token` | Peer / Contractor | **No login required** public portal to review video clip, inspect AI findings, and confirm/reject with one tap. |
| `/p/:passportId` | Public | Official digital skill passport with QR code, verifier signature, and SHA-256 hash. |
| `/contractor` | Contractor / Builder | Desktop portal: voice/text contract posting, distance filtering, and ranked verified electrician matching. |
| `/jobs` | Worker | Browse and accept/decline nearby electrical jobs. |
| `/settings` | Worker | Language preferences, dark mode toggle, and privacy/video purge control. |

---

## 5. Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, `lucide-react` icons, React Router v7.
- **PWA Capabilities:** Web App Manifest (`manifest.json`), service worker (`sw.js`) with offline asset caching.
- **Internationalization (i18n):** Complete tri-lingual support (**English**, **ಕನ್ನಡ**, **हिन्दी**) across all public and authenticated pages.
- **Backend:** FastAPI (Python 3.12+), REST API, Pydantic v2 schemas.
- **Database:** SQLite with a custom Haversine distance function (`haversine(lat1, lon1, lat2, lon2)`) registered at connection level for zero-config local runs, with full compatibility for PostgreSQL + PostGIS via Supabase.
- **AI Scoring Engine:** Multimodal Gemini API integration (`gemini-2.5-flash`) with a built-in deterministic fallback rule engine that produces realistic, technician-grade evaluation observations so demos never break offline.
- **Voice Recognition:** Web Speech API (`webkitSpeechRecognition`) supporting `kn-IN`, `hi-IN`, and `en-IN`.
- **Media & Security:** MediaRecorder API with client-side compression, cryptographic SHA-256 verification hashing, and Python `qrcode` base64 generation.

---

## 6. Quick Start (One Command)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Windows
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.bat
```

### macOS / Linux
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
1. **Start Backend:**
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *API Swagger documentation available at `http://127.0.0.1:8000/docs`*

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
   *Open browser at `http://127.0.0.1:5173`*

---

## 7. Seeded Demo Accounts

The database seeds automatically on startup with **12 realistic electricians** across key Bengaluru hubs and **8 active contractor contracts**.

| Role | Name | Phone | Locality | Experience | Pre-Verified? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Electrician** | Manjunath K. | `+919845012341` | Peenya | 8 years | Yes (Score: 6/6, Passport: `PW-BLR-1000`) |
| **Electrician** | Suresh Gowda | `+919845012342` | Rajajinagar | 12 years | Pending Verification (`tok-worker-02`) |
| **Electrician** | Ramesh Kumar | `+919845012343` | Jayanagar | 6 years | Yes (Score: 5/6, Passport: `PW-BLR-1002`) |
| **Electrician** | Chetan Murthy | `+919845012349` | Koramangala | 11 years | Yes (Score: 6/6, Passport: `PW-BLR-1008`) |
| **Contractor** | Srinivas Rao (Nandi Infra) | `+919900112233` | Jayanagar | - | - |
| **New Worker** | *Self-Register* | Any phone | Bengaluru | - | Test entire 3-minute onboarding flow |

*Note: In development and test modes, the mock SMS OTP is always `123456`.*

---

## 8. Verification & Test Audits

Automated Playwright test scripts are included to audit responsiveness, horizontal scroll, and user flows:

```bash
# Run multi-breakpoint responsive audits (320px, 375px, 390px, 768px, 1024px, 1440px, 1920px)
cd frontend
node test_responsive_breakpoints.mjs

# Run full end-to-end user flows
node test_flows.mjs
```

All 7 breakpoint audits confirm **zero horizontal scroll**, full Indic text wrapping, and WCAG AA contrast compliance.

---

## 9. The 6-Point Electrician Safety Checklist

Every practical task is scored against Indian Standard electrical safety rules (**IS 732 & BESCOM code**):

1. **Power Isolation:** Main switch turned off; neon phase tester applied to verify 0V before contact.
2. **Component & Wire Rating:** 2.5 sq.mm FR copper wire for power/MCB branches; 1.5 sq.mm for lighting circuits.
3. **Earthing Connection:** Solid green/yellow continuous earth conductor firmly bonded to busbar with lock washer.
4. **Colour Coding & Polarity:** Phase (Red/Brown) strictly through switch pole; Neutral (Black/Blue) returned directly.
5. **Termination Quality:** No bare copper strands exposed outside screw collars; tug test confirms solid mechanical clamp.
6. **Safe Tool Use & PPE:** 1000V VDE-insulated screwdrivers and strippers; dry rubber-soled footwear verified.

---

## 10. Data Privacy & Consent

ProofWork adheres strictly to worker privacy:
- Explicit consent is required before any video can be uploaded.
- Raw task videos are never exposed on public passport pages (only verified competence badges, verifier endorsement, and cryptographic proof are shown).
- Workers can purge their uploaded video files at any time via the **"Purge My Uploaded Video"** option in Settings.

---

## 11. Environment Variables Reference

See `.env.example` in the project root:

```env
PORT=8000
HOST=0.0.0.0

# Optional: Gemini Multimodal API key (deterministic mock scorer operates if absent)
GEMINI_API_KEY=

# Optional: Supabase PostgreSQL + PostGIS (SQLite with Haversine used locally)
SUPABASE_URL=
SUPABASE_KEY=

# Optional: Twilio WhatsApp messaging integration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```
