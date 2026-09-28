from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    badge_number: Optional[str] = None
    model_config = {"from_attributes": True}

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Missing Person ─────────────────────────────────────────────────────────────
class MissingPersonCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    date_of_birth: str = ""
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    photo_url: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    build: Optional[str] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    complexion: Optional[str] = None
    identifying_marks: Optional[str] = None
    last_seen_date: str
    last_seen_time: str
    last_seen_location: str
    last_seen_clothing: str = ""
    last_seen_possessions: Optional[str] = None
    known_destinations: Optional[str] = None
    medical_notes: Optional[str] = None
    known_contacts: Optional[str] = None
    usual_locations: Optional[str] = None
    additional_info: Optional[str] = None

class MissingPersonOut(MissingPersonCreate):
    id: int
    case_id: str
    model_config = {"from_attributes": True}


# ── Case ───────────────────────────────────────────────────────────────────────
class CaseCreate(BaseModel):
    missing_person: MissingPersonCreate
    priority: str = "medium"

class CaseOut(BaseModel):
    id: int
    case_id: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    missing_person: Optional[MissingPersonOut] = None
    lead_count: Optional[int] = 0
    sighting_count: Optional[int] = 0
    tip_count: Optional[int] = 0
    model_config = {"from_attributes": True}


# ── Family Information ─────────────────────────────────────────────────────────
class FamilyInfoCreate(BaseModel):
    family_statement: str
    known_routines: Optional[str] = None
    known_places: Optional[str] = None
    recent_activities: Optional[str] = None
    clothing_info: Optional[str] = None
    personal_belongings: Optional[str] = None
    contact_info: Optional[str] = None
    additional_observations: Optional[str] = None

class FamilyInfoOut(FamilyInfoCreate):
    id: int
    case_id: str
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ── Tips ───────────────────────────────────────────────────────────────────────
class TipCreate(BaseModel):
    date: str
    time: str
    source_type: str
    location: str
    description: str
    witness_description: Optional[str] = None
    confidence: float = 0.5
    supporting_notes: Optional[str] = None

class TipOut(TipCreate):
    id: int
    tip_id: str
    case_id: str
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ── Sightings ──────────────────────────────────────────────────────────────────
class SightingCreate(BaseModel):
    camera_id: str
    location: str
    date: str
    time: str
    description: str
    observed_clothing: Optional[str] = None
    approximate_age: Optional[int] = None
    direction_of_movement: Optional[str] = None
    confidence: float = 0.5
    lat: Optional[float] = None
    lng: Optional[float] = None

class SightingOut(SightingCreate):
    id: int
    sighting_id: str
    case_id: str
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ── Leads ──────────────────────────────────────────────────────────────────────
class LeadFactor(BaseModel):
    label: str
    score: int
    matched: bool
    detail: str

class LeadOut(BaseModel):
    id: int
    lead_id: str
    case_id: str
    description: str
    source: str
    location: str
    time: str
    priority: str
    confidence: float
    reasoning: str
    factors: List[LeadFactor] = []
    recommended_action: str
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[str] = None


# ── Timeline ───────────────────────────────────────────────────────────────────
class TimelineEventOut(BaseModel):
    id: int
    case_id: str
    date: str
    time: str
    title: str
    description: str
    source: str
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    model_config = {"from_attributes": True}


# ── AI Analysis ────────────────────────────────────────────────────────────────
class AIAnalysisResponse(BaseModel):
    case_id: str
    analyzed_at: str
    leads: List[Any]
    summary: str
    recommended_actions: List[str]
    correlation_notes: List[str]
