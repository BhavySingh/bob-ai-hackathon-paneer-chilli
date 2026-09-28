from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120))
    email = Column(String(200), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(60), default="investigator")
    badge_number = Column(String(60), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(30), unique=True, index=True)
    status = Column(String(20), default="active")
    priority = Column(String(20), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    missing_person = relationship("MissingPerson", back_populates="case", uselist=False, cascade="all, delete-orphan")
    family_info = relationship("FamilyInformation", back_populates="case", uselist=False, cascade="all, delete-orphan")
    tips = relationship("InvestigatorTip", back_populates="case", cascade="all, delete-orphan")
    sightings = relationship("CCTVSighting", back_populates="case", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("InvestigatorNote", back_populates="case", cascade="all, delete-orphan")


class MissingPerson(Base):
    __tablename__ = "missing_persons"
    id = Column(Integer, primary_key=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"), unique=True)
    full_name = Column(String(150))
    age = Column(Integer)
    gender = Column(String(20))
    date_of_birth = Column(String(20))
    phone = Column(String(20), nullable=True)
    emergency_contact = Column(String(200), nullable=True)
    photo_url = Column(String(500), nullable=True)
    height = Column(String(20), nullable=True)
    weight = Column(String(20), nullable=True)
    build = Column(String(40), nullable=True)
    hair_color = Column(String(40), nullable=True)
    eye_color = Column(String(40), nullable=True)
    complexion = Column(String(40), nullable=True)
    identifying_marks = Column(Text, nullable=True)
    last_seen_date = Column(String(20))
    last_seen_time = Column(String(10))
    last_seen_location = Column(String(300))
    last_seen_clothing = Column(Text)
    last_seen_possessions = Column(Text, nullable=True)
    known_destinations = Column(Text, nullable=True)
    medical_notes = Column(Text, nullable=True)
    known_contacts = Column(Text, nullable=True)
    usual_locations = Column(Text, nullable=True)
    additional_info = Column(Text, nullable=True)
    case = relationship("Case", back_populates="missing_person")


class FamilyInformation(Base):
    __tablename__ = "family_information"
    id = Column(Integer, primary_key=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"), unique=True)
    family_statement = Column(Text)
    known_routines = Column(Text, nullable=True)
    known_places = Column(Text, nullable=True)
    recent_activities = Column(Text, nullable=True)
    clothing_info = Column(Text, nullable=True)
    personal_belongings = Column(Text, nullable=True)
    contact_info = Column(Text, nullable=True)
    additional_observations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="family_info")


class InvestigatorTip(Base):
    __tablename__ = "investigator_tips"
    id = Column(Integer, primary_key=True)
    tip_id = Column(String(30), unique=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"))
    date = Column(String(20))
    time = Column(String(10))
    source_type = Column(String(40))
    location = Column(String(300))
    description = Column(Text)
    witness_description = Column(Text, nullable=True)
    confidence = Column(Float, default=0.5)
    supporting_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="tips")


class CCTVSighting(Base):
    __tablename__ = "cctv_sightings"
    id = Column(Integer, primary_key=True)
    sighting_id = Column(String(30), unique=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"))
    camera_id = Column(String(40))
    location = Column(String(300))
    date = Column(String(20))
    time = Column(String(10))
    description = Column(Text)
    observed_clothing = Column(Text, nullable=True)
    approximate_age = Column(Integer, nullable=True)
    direction_of_movement = Column(String(200), nullable=True)
    confidence = Column(Float, default=0.5)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="sightings")


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True)
    lead_id = Column(String(30), unique=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"))
    description = Column(Text)
    source = Column(String(100))
    location = Column(String(300))
    time = Column(String(50))
    priority = Column(String(20), default="medium")
    confidence = Column(Float, default=0.5)
    reasoning = Column(Text)
    factors_json = Column(Text)  # JSON string
    recommended_action = Column(Text)
    status = Column(String(30), default="new")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="leads")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(Integer, primary_key=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"))
    date = Column(String(20))
    time = Column(String(10))
    title = Column(String(200))
    description = Column(Text)
    source = Column(String(30))
    location = Column(String(300), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    case = relationship("Case", back_populates="timeline_events")


class InvestigatorNote(Base):
    __tablename__ = "investigator_notes"
    id = Column(Integer, primary_key=True)
    case_id = Column(String(30), ForeignKey("cases.case_id"))
    note = Column(Text)
    author = Column(String(120))
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="notes")
