# TRACEAI — AI-Powered Missing Person Investigation Assistant

> **IBM Bob × NFSU Hackathon 2026 | Problem Statement 07**

---

## Project Overview

**TRACEAI** is an AI-powered investigation support platform that helps investigators correlate missing-person information — family statements, investigator field tips, and CCTV sighting descriptions — to generate prioritized investigative leads, investigation timelines, public appeal notices, and structured police case files.

> ⚠ **TRACEAI is a hackathon prototype. AI-generated results are decision-support only and must be verified by authorized investigators before any action is taken.**

---

## Problem Statement

**PS-07: Missing Person Investigation Assistant**

Build a Bob-powered case coordination tool that:
1. Takes family-provided missing-person data
2. Takes mock investigator tip logs
3. Takes CCTV sighting descriptions
4. Correlates all available inputs
5. Generates a prioritized list of investigative leads
6. Provides recommended next actions
7. Drafts a public appeal notice
8. Auto-fills a police missing-person case file

---

## Features

| Feature | Description |
|---|---|
| **Case Management** | Create, view, and manage missing-person cases |
| **Family Information** | Structured family statement and known-information collection |
| **Investigator Tips** | Log field tips with source type, location, time, and confidence |
| **CCTV Sightings** | Record mock CCTV textual descriptions with camera ID, location, and direction |
| **AI Correlation Engine** | Deterministic scoring of clothing, age, location, time, and description matches |
| **Lead Prioritization** | CRITICAL / HIGH / MEDIUM / LOW leads with transparent factor breakdown |
| **Investigation Timeline** | Chronological visual timeline filterable by source type |
| **Map Visualization** | Leaflet/OpenStreetMap showing sighting locations, tips, and movement trail |
| **Recommended Actions** | Per-lead specific next-step recommendations |
| **Public Appeal Generator** | Auto-populated missing-person notice with print/download |
| **Police Case File** | Structured AI-assisted case file with print/download |
| **Demo Mode** | Pre-loaded case MP-2026-001 for instant judge demonstration |

---

## Architecture

```
traceai/
├── frontend/              React 19 + Vite + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/    Reusable UI components (Badge, Button, Card, Toast)
│       ├── pages/         Route-level pages
│       │   └── case-tabs/ Case detail sub-tabs
│       ├── layouts/       AppLayout (sidebar navigation)
│       ├── services/      Axios API client
│       ├── hooks/         useAuth, useToast
│       ├── types/         TypeScript interfaces
│       └── data/          Mock data (demo fallback)
│
├── backend/               Python FastAPI + SQLite + SQLAlchemy
│   └── app/
│       ├── api/           auth.py, cases.py, leads.py
│       ├── models/        SQLAlchemy ORM models
│       ├── schemas/       Pydantic request/response schemas
│       ├── services/      ai_service.py (mock engine + LLM hook)
│       └── database/      session.py, seed.py
│
├── README.md
└── .env.example
```

---

## Technology Stack

### Frontend
- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** — utility styling
- **React Router v7** — client-side routing
- **Lucide React** — icons
- **Recharts** — analytics charts
- **Leaflet / React-Leaflet** — interactive maps (OpenStreetMap)
- **Axios** — API client

### Backend
- **Python 3.10+** + **FastAPI 0.111**
- **SQLite** + **SQLAlchemy 2.0** — database
- **Pydantic v2** — data validation
- **python-jose** — JWT authentication
- **passlib** — password hashing
- **Uvicorn** — ASGI server

---

## AI Architecture

The AI engine lives in [`backend/app/services/ai_service.py`](backend/app/services/ai_service.py).

### Mock Engine (default, works offline)

The deterministic scoring engine compares each CCTV sighting and investigator tip against the case's missing-person data:

| Factor | Max Score |
|---|---|
| Clothing match (color/garment keyword overlap) | 30 |
| Age compatibility | 20 |
| Time compatibility (after last seen) | 20 |
| Description keyword similarity | 15 |
| Source confidence / reliability | 15 |

Leads scoring ≥75 → CRITICAL, ≥60 → HIGH, ≥40 → MEDIUM, else LOW.

Cross-source corroboration (same location referenced by both CCTV and tip) adds a +8 bonus.

### Switching to a Real LLM

Set in `.env`:
```
AI_PROVIDER=ibm   # or openai, etc.
```

Then implement `_llm_analyze()` in `ai_service.py`. The rest of the application is unchanged.

---

## Installation

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.10+**

### 1. Clone / extract the project

```bash
cd traceai
```

### 2. Backend setup

```bash
cd backend

# Copy environment file
copy env.example .env

# Install dependencies
pip install -r requirements.txt

# Start backend (Windows)
set PYTHONIOENCODING=utf-8 && set PYTHONUTF8=1 && python run.py

# OR on Linux/Mac
PYTHONIOENCODING=utf-8 python run.py
```

Backend runs at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

The database is created and seeded automatically on first run.

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Environment Variables

```env
# backend/.env
AI_PROVIDER=mock                          # mock | ibm | openai
SECRET_KEY=traceai-hackathon-secret-key   # Change in production
DATABASE_URL=sqlite:///./traceai.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Demo Credentials

| Field | Value |
|---|---|
| Officer ID / Email | `demo@nfsu.traceai` |
| Password | `TraceAI@123` |

> Click **"Demo access"** on the login page to auto-fill credentials.

---

## Demo Flow (for judges)

1. Open **http://localhost:5173**
2. Click **Login** → use demo credentials
3. Dashboard loads with 3 pre-seeded cases
4. Click **MP-2026-001 (Rahul Sharma)** → View Case
5. Go to **AI Analysis** tab → Click **Analyze Case with AI**
6. Watch the animated correlation stages
7. View **Leads** tab — 10 prioritized leads with factor breakdown
8. View **Timeline** tab — chronological event trail
9. View **Map** tab — interactive Surat investigation map
10. View **Reports** tab → Generate Public Appeal and Case File
11. Print or download either report

---

## API Documentation

Interactive API docs available at **http://localhost:8000/docs** (Swagger UI).

Key endpoints:

```
POST /api/auth/login          Login with email + password
GET  /api/cases               List all cases
POST /api/cases               Create new case
GET  /api/cases/{id}          Get case details
GET  /api/cases/{id}/family   Get family information
POST /api/cases/{id}/family   Save family information
GET  /api/cases/{id}/tips     List investigator tips
POST /api/cases/{id}/tips     Add new tip
GET  /api/cases/{id}/sightings  List CCTV sightings
POST /api/cases/{id}/sightings  Add new sighting
POST /api/cases/{id}/analyze  Run AI analysis → generates leads
GET  /api/cases/{id}/leads    List AI-generated leads
PUT  /api/leads/{id}          Update lead status/notes
GET  /api/cases/{id}/timeline Get timeline events
POST /api/cases/{id}/public-appeal  Generate public appeal text
POST /api/cases/{id}/case-file      Generate police case file text
GET  /api/dashboard/stats     Dashboard statistics
```

---

## Mock Data

Three pre-seeded cases are created on first startup:

| Case ID | Person | Age | Last Seen | Priority |
|---|---|---|---|---|
| MP-2026-001 | Rahul Sharma | 21 | Surat Railway Station | HIGH |
| MP-2026-002 | Meera Krishnan | 17 | Ahmedabad Bus Stand | CRITICAL |
| MP-2026-003 | Arjun Mehta | 35 | Pune Station | MEDIUM |

Case MP-2026-001 includes: 5 CCTV sightings, 5 investigator tips, full family information, and 10 timeline events tracing a movement from Surat Railway Station → Adajan Market → Udhna Bus Terminal.

> All names, locations, phone numbers, and events are fictional. No real missing-person data was used.

---

## Privacy Disclaimer

- All data in this application is entirely fictional and for demonstration only.
- No real missing-person, police, government, or biometric data is used.
- The system does not connect to real CCTV systems, police databases, Aadhaar, telecom records, or GPS systems.
- AI-generated correlations are based on textual pattern matching and confidence scoring only.
- Every AI-generated result includes a disclaimer requiring human investigator verification.

---

## Future Improvements

- IBM watsonx / OpenAI LLM integration for semantic correlation
- Real CCTV integration via authorized feeds
- Role-based access control (RBAC)
- Case sharing and multi-investigator collaboration
- Mobile-responsive PWA
- PDF export using ReportLab
- Email/SMS alert system for new leads
- Evidence file upload (photos, documents)
- Advanced geographic analysis and clustering

---

## License

This project was created for the IBM Bob × NFSU Hackathon 2026 and is a demonstration prototype only.
