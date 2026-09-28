# 🚀 TRACE AI



---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | Paneer Chilli |
| **Track** | AI / DevOps |
| **Team Lead** | Bhavy Singh Chauhan — bhavy.chauhan04@gmail.com |
| **Members** | Navleen kaur, Devesh Rawat, Mohit Jariwala |

---

## 🎯 Problem Statement

Missing Person Investigation Assistant
Build a Bob-powered case coordination tool that takes family-provided data plus mock investigator tip logs and CCTV sighting descriptions. Bob correlates inputs, generates a prioritized list of investigative leads with recommended next actions, drafts a public appeal notice, and auto-fills a police missing person case file.



## 💡 Solution

We built TRACEAI — an AI-powered Missing Person Investigation Assistant.

The basic flow is:

Family Information + Investigator Tips + CCTV Sightings
-> 
AI correlates the information
-> 
Identifies relationships between age, clothing, time and location
-> 
Prioritizes investigative leads
-> 
Explains why a lead received that priority
-> 
Suggests next actions
-> 
Generates timeline/map + public appeal + police case-file draft

---

## ✨ Key Features

- Centralized Case Workspace – Keeps family information, investigator tips, and CCTV sightings in one place.
- AI-Based Information Correlation – Connects data based on age, appearance/clothing, time, and location.
- Prioritized Investigative Leads – Ranks leads by priority and provides a confidence score.
- Timeline & Map Visualization – Displays sightings, tips, and leads chronologically and geographically.
- Recommended Next Actions – Helps investigators decide what leads or information need further review.
- Public Appeal Generator – Automatically creates a reviewable missing-person public notice from case information.
- Investigator Dashboard – Provides an overview of active cases, high-priority leads, new sightings, and items requiring review.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, TypeScript, JavaScript, CSS, HTML |
| **Frameworks** | FastAPI, React, Vite, Tailwind CSS |
| **IBM Technologies** | IBM Bob |
| **Databases** | SQLite, SQLAlchemy |
| **Other** | Git, GitHub, REST API, Recharts, Leaflet/OpenStreetMap, React Router |

---

## 📁 Repository Structure

```
bob-ai-hackathon-paneer-chilli/
│
├── traceai/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth.py
│   │   │   │   ├── cases.py
│   │   │   │   └── leads.py
│   │   │   ├── database/
│   │   │   │   ├── seed.py
│   │   │   │   └── session.py
│   │   │   ├── models/
│   │   │   │   └── models.py
│   │   │   ├── schemas/
│   │   │   │   └── schemas.py
│   │   │   ├── services/
│   │   │   │   └── ai_service.py
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── run.py
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── README.md
│   ├── .env.example
│   ├── start.bat
│   └── start.ps1
│
├── src/
├── docs/
├── demo/
├── presentation/
├── .github/
├── submission.yaml
├── README.md
└── CONTRIBUTING.md
```

---

## ⚡ How to Run

> **Copy these exact steps from your [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/traceai.git
cd traceai

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Copy env file
copy env.example .env

# Install frontend dependencies
cd ..\frontend
npm install

# Go back to root and start everything
cd ..
.\start.bat
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

- Mock data: Uses simulated family, investigator, and CCTV data.
- No real-time integration: No direct access to police, CCTV, or government databases.
- AI verification: AI-generated leads require human/investigator verification.
- Prototype scalability: Security, infrastructure, and database scalability need further development for real-world deployment.

---

## 🏅 What We're Most Proud Of

We are proud of submitting the project 

---
