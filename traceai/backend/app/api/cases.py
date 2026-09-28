from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import json

from app.database.session import get_db
from app.models.models import (
    Case, MissingPerson, FamilyInformation, InvestigatorTip,
    CCTVSighting, Lead, TimelineEvent
)
from app.schemas.schemas import (
    CaseCreate, CaseOut, FamilyInfoCreate, FamilyInfoOut,
    TipCreate, TipOut, SightingCreate, SightingOut,
    LeadOut, LeadUpdate, TimelineEventOut, AIAnalysisResponse
)
from app.services import ai_service
from datetime import datetime

router = APIRouter(prefix="/cases", tags=["cases"])


def _case_to_dict(case: Case) -> dict:
    mp = case.missing_person
    if not mp:
        return {}
    return {
        "missing_person": {
            "case_id": mp.case_id,
            "full_name": mp.full_name,
            "age": mp.age,
            "last_seen_clothing": mp.last_seen_clothing,
            "last_seen_time": mp.last_seen_time,
            "last_seen_location": mp.last_seen_location,
        },
        "family_info": {
            "clothing_info": case.family_info.clothing_info if case.family_info else "",
            "family_statement": case.family_info.family_statement if case.family_info else "",
        },
        "sightings": [
            {
                "sighting_id": s.sighting_id,
                "camera_id": s.camera_id,
                "location": s.location,
                "date": s.date,
                "time": s.time,
                "description": s.description,
                "observed_clothing": s.observed_clothing,
                "approximate_age": s.approximate_age,
                "direction_of_movement": s.direction_of_movement,
                "confidence": s.confidence,
            }
            for s in case.sightings
        ],
        "tips": [
            {
                "tip_id": t.tip_id,
                "source_type": t.source_type,
                "location": t.location,
                "date": t.date,
                "time": t.time,
                "description": t.description,
                "witness_description": t.witness_description,
                "confidence": t.confidence,
            }
            for t in case.tips
        ],
    }


def _next_case_id(db: Session) -> str:
    count = db.query(Case).count()
    return f"MP-2026-{count + 1:03d}"


def _next_tip_id(case_id: str, db: Session) -> str:
    suffix = case_id.split("-")[-1]
    count = db.query(InvestigatorTip).filter(InvestigatorTip.case_id == case_id).count()
    return f"TIP-{suffix}-{count + 1:03d}"


def _next_sighting_id(case_id: str, db: Session) -> str:
    suffix = case_id.split("-")[-1]
    count = db.query(CCTVSighting).filter(CCTVSighting.case_id == case_id).count()
    return f"CCTV-{suffix}-{count + 1:03d}"


# ── Cases ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[CaseOut])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.updated_at.desc()).all()
    result = []
    for c in cases:
        out = CaseOut.model_validate(c)
        out.lead_count = len(c.leads)
        out.sighting_count = len(c.sightings)
        out.tip_count = len(c.tips)
        result.append(out)
    return result


@router.post("", response_model=CaseOut, status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    case_id = _next_case_id(db)
    case = Case(case_id=case_id, priority=payload.priority)
    db.add(case)
    db.flush()
    mp_data = payload.missing_person.model_dump()
    mp_data["case_id"] = case_id
    mp = MissingPerson(**mp_data)
    db.add(mp)
    db.commit()
    db.refresh(case)
    out = CaseOut.model_validate(case)
    out.lead_count = 0; out.sighting_count = 0; out.tip_count = 0
    return out


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    out = CaseOut.model_validate(case)
    out.lead_count = len(case.leads)
    out.sighting_count = len(case.sightings)
    out.tip_count = len(case.tips)
    return out


@router.put("/{case_id}", response_model=CaseOut)
def update_case(case_id: str, data: dict, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    for k, v in data.items():
        if hasattr(case, k):
            setattr(case, k, v)
    db.commit()
    db.refresh(case)
    return CaseOut.model_validate(case)


# ── Family Info ────────────────────────────────────────────────────────────────

@router.get("/{case_id}/family", response_model=FamilyInfoOut)
def get_family(case_id: str, db: Session = Depends(get_db)):
    fi = db.query(FamilyInformation).filter(FamilyInformation.case_id == case_id).first()
    if not fi:
        raise HTTPException(404, "Family information not found")
    return FamilyInfoOut.model_validate(fi)


@router.post("/{case_id}/family", response_model=FamilyInfoOut, status_code=201)
def upsert_family(case_id: str, payload: FamilyInfoCreate, db: Session = Depends(get_db)):
    existing = db.query(FamilyInformation).filter(FamilyInformation.case_id == case_id).first()
    if existing:
        for k, v in payload.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return FamilyInfoOut.model_validate(existing)
    fi = FamilyInformation(**payload.model_dump(), case_id=case_id)
    db.add(fi)
    db.commit()
    db.refresh(fi)
    return FamilyInfoOut.model_validate(fi)


# ── Tips ───────────────────────────────────────────────────────────────────────

@router.get("/{case_id}/tips", response_model=List[TipOut])
def list_tips(case_id: str, db: Session = Depends(get_db)):
    return [TipOut.model_validate(t) for t in
            db.query(InvestigatorTip).filter(InvestigatorTip.case_id == case_id).all()]


@router.post("/{case_id}/tips", response_model=TipOut, status_code=201)
def add_tip(case_id: str, payload: TipCreate, db: Session = Depends(get_db)):
    tip_id = _next_tip_id(case_id, db)
    tip = InvestigatorTip(**payload.model_dump(), case_id=case_id, tip_id=tip_id)
    db.add(tip)
    db.commit()
    db.refresh(tip)
    return TipOut.model_validate(tip)


# ── Sightings ──────────────────────────────────────────────────────────────────

@router.get("/{case_id}/sightings", response_model=List[SightingOut])
def list_sightings(case_id: str, db: Session = Depends(get_db)):
    return [SightingOut.model_validate(s) for s in
            db.query(CCTVSighting).filter(CCTVSighting.case_id == case_id).all()]


@router.post("/{case_id}/sightings", response_model=SightingOut, status_code=201)
def add_sighting(case_id: str, payload: SightingCreate, db: Session = Depends(get_db)):
    sid = _next_sighting_id(case_id, db)
    s = CCTVSighting(**payload.model_dump(), case_id=case_id, sighting_id=sid)
    db.add(s)
    db.commit()
    db.refresh(s)
    return SightingOut.model_validate(s)


# ── AI Analysis ────────────────────────────────────────────────────────────────

@router.post("/{case_id}/analyze", response_model=AIAnalysisResponse)
def analyze_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")

    case_data = _case_to_dict(case)
    result = ai_service.analyze_case(case_data)

    # Persist leads
    db.query(Lead).filter(Lead.case_id == case_id).delete()
    for ld in result["leads"]:
        lead = Lead(
            lead_id=ld["lead_id"],
            case_id=case_id,
            description=ld["description"],
            source=ld["source"],
            location=ld["location"],
            time=ld["time"],
            priority=ld["priority"],
            confidence=ld["confidence"],
            reasoning=ld["reasoning"],
            factors_json=json.dumps(ld["factors"]),
            recommended_action=ld["recommended_action"],
            status=ld["status"],
        )
        db.add(lead)

    db.commit()
    return AIAnalysisResponse(**result)


# ── Leads ───────────────────────────────────────────────────────────────────────

@router.get("/{case_id}/leads", response_model=List[LeadOut])
def list_leads(case_id: str, db: Session = Depends(get_db)):
    leads = db.query(Lead).filter(Lead.case_id == case_id).order_by(Lead.confidence.desc()).all()
    result = []
    for l in leads:
        out = LeadOut.model_validate(l)
        try:
            out.factors = json.loads(l.factors_json or "[]")
        except Exception:
            out.factors = []
        result.append(out)
    return result


# ── Timeline ────────────────────────────────────────────────────────────────────

@router.get("/{case_id}/timeline", response_model=List[TimelineEventOut])
def get_timeline(case_id: str, db: Session = Depends(get_db)):
    events = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(
        TimelineEvent.date, TimelineEvent.time
    ).all()
    return [TimelineEventOut.model_validate(e) for e in events]


# ── Reports (text) ─────────────────────────────────────────────────────────────

@router.post("/{case_id}/public-appeal")
def gen_public_appeal(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    text = ai_service.generate_public_appeal(_case_to_dict(case))
    return {"text": text}


@router.post("/{case_id}/case-file")
def gen_case_file(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        raise HTTPException(404, "Case not found")
    mp = case.missing_person
    tips = case.tips
    sightings = case.sightings
    leads = case.leads
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    sections = [
        f"TRACEAI POLICE CASE FILE",
        f"Case ID: {case.case_id}",
        f"Generated: {now}",
        f"Status: {case.status.upper()}   Priority: {case.priority.upper()}",
        "=" * 60,
        f"MISSING PERSON DETAILS",
        f"Name: {mp.full_name if mp else 'N/A'}",
        f"Age: {mp.age if mp else 'N/A'}",
        f"Gender: {mp.gender if mp else 'N/A'}",
        f"Last Seen: {mp.last_seen_date if mp else 'N/A'} {mp.last_seen_time if mp else ''}",
        f"Location: {mp.last_seen_location if mp else 'N/A'}",
        f"Clothing: {mp.last_seen_clothing if mp else 'N/A'}",
        "=" * 60,
        f"INVESTIGATOR TIPS ({len(tips)})",
    ]
    for t in tips:
        sections.append(f"  [{t.tip_id}] {t.date} {t.time} – {t.source_type} – {t.location}")
        sections.append(f"    {t.description[:200]}")
    sections += [
        "=" * 60,
        f"CCTV SIGHTINGS ({len(sightings)})",
    ]
    for s in sightings:
        sections.append(f"  [{s.sighting_id}] {s.date} {s.time} – {s.camera_id} – {s.location}")
        sections.append(f"    Confidence: {round(s.confidence*100)}%  Clothing: {s.observed_clothing or 'N/A'}")
    sections += [
        "=" * 60,
        f"AI-GENERATED LEADS ({len(leads)})",
    ]
    for l in leads:
        sections.append(f"  [{l.lead_id}] Priority: {l.priority.upper()}  Confidence: {round(l.confidence*100)}%")
        sections.append(f"    {l.description[:200]}")
        sections.append(f"    Action: {l.recommended_action[:200]}")
    sections.append("=" * 60)
    sections.append("AI-assisted draft – requires investigator verification before official use.")
    return {"text": "\n".join(sections)}
