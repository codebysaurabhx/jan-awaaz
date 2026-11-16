# README.md

## JANAWAAZ – AI‑Powered Rural Grievance Redressal & Village Development Platform

### Overview
JANAWAAZ is a **full‑stack web application** built with **Next.js (TypeScript)**, **Tailwind CSS**, **shadcn/ui**, **Lucide icons**, and **Recharts** on the frontend. The backend uses **Supabase** (PostgreSQL, Auth, Storage) for data persistence, authentication, and file handling.

Key features:
- Multi‑role authentication (Citizen, Panchayat Officer, Block Officer, District Admin, Super Admin)
- Complaint registration with text, photo/video/audio upload, geolocation and optional anonymity
- AI‑assisted complaint categorisation, translation and summarisation (Gemini API with demo fallback)
- Real‑time **Rural Development Analytics Dashboard** with statistic cards, interactive charts and export (CSV/PDF)
- Automatic escalation workflow and citizen‑verified resolution
- In‑app notifications, audit logs, and role‑based access control (RLS)
- Demo data and accounts for immediate testing

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Lucide‑React, Recharts |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage) |
| AI | Gemini API (fallback stub) |
| Maps | Leaflet + OpenStreetMap |
| Export | `json2csv` for CSV, `pdf-lib` for PDF |

### Prerequisites
- **Node.js 20+** (recommended latest LTS) and **npm** (or `pnpm`/`yarn`)
- **Supabase** project (free tier works for demo) – obtain `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- (Optional) **Gemini API** key for AI features – otherwise the app will use a deterministic fallback

### Setup
1. **Clone the repository**
   ```bash
   git clone <repo‑url>
   cd janawaaaz
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials (and Gemini key if you have one).
   ```bash
   cp .env.example .env.local
   ```
4. **Run Supabase migrations & seed data**
   ```bash
   npx supabase db reset   # creates the DB schema (requires supabase CLI installed)
   npm run seed            # inserts demo geographic data, users and 100 complaints
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@janawaaz.in | `SuperPass123` |
| District Admin | districtadmin@janawaaz.in | `DistPass123` |
| Block Officer | blockofficer@janawaaz.in | `BlockPass123` |
| Panchayat Officer | panchayatofficer@janawaaz.in | `PanchayatPass123` |
| Citizen | citizen1@janawaaz.in | `CitizenPass123` |

All demo users are linked to a sample village/ward in the seeded data.

### Testing
The repository includes an end‑to‑end test suite using **Jest** and **Supertest** for the API plus **React Testing Library** for key components.
```bash
npm test
```
The tests cover:
- Registration & login flow
- Complaint creation (text + media upload)
- AI categorisation fallback
- Dashboard calculations (cards, charts) match the DB values
- Escalation logic after deadline passes
- Notification generation and audit logging

### Build for Production
```bash
npm run build
npm start   # runs the compiled Next.js app
```
Make sure the environment variables are set in the production environment.

### Extending / Customising
- **AI integration** – replace `services/aiFallback.ts` with a real Gemini client and set `GEMINI_API_KEY`.
- **Additional roles** – add rows to `profiles.role` enum and corresponding RLS policies.
- **Styling** – adjust Tailwind colours in `tailwind.config.js`.
- **Maps** – the map component in `components/ComplaintMap.tsx` uses Leaflet; you can switch to Google Maps if desired.

---
**Enjoy building a transparent, accountable platform for every villager!**
