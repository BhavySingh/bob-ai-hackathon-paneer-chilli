from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import json

from app.database.session import get_db
from app.models.models import Lead
from app.schemas.schemas import LeadOut, LeadUpdate

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    out = LeadOut.model_validate(lead)
    try:
        out.factors = json.loads(lead.factors_json or "[]")
    except Exception:
        out.factors = []
    return out


@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: str, payload: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(lead, k, v)
    db.commit()
    db.refresh(lead)
    out = LeadOut.model_validate(lead)
    try:
        out.factors = json.loads(lead.factors_json or "[]")
    except Exception:
        out.factors = []
    return out
