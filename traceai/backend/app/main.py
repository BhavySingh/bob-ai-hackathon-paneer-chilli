import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import engine, Base
from app.models import models  # noqa: registers models
from app.api import auth, cases, leads
from app.database.seed import seed

# Create tables
Base.metadata.create_all(bind=engine)
# Seed demo data
seed()

app = FastAPI(
    title="TRACEAI API",
    description="AI-Powered Missing Person Investigation Assistant",
    version="1.0.0",
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(leads.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "TRACEAI API"}


@app.get("/api/dashboard/stats")
def dashboard_stats():
    from app.database.session import SessionLocal
    from app.models.models import Case, Lead, CCTVSighting
    db = SessionLocal()
    try:
        active = db.query(Case).filter(Case.status == "active").count()
        high_leads = db.query(Lead).filter(Lead.priority.in_(["critical", "high"]), Lead.status != "dismissed").count()
        new_sightings = db.query(CCTVSighting).count()
        review = db.query(Case).filter(Case.status == "pending").count()
        return {
            "active_cases": active,
            "high_priority_leads": high_leads,
            "new_sightings": new_sightings,
            "cases_requiring_review": review,
        }
    finally:
        db.close()
