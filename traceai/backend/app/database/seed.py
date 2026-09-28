"""Seed database with demo data for the hackathon."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, Case, MissingPerson, FamilyInformation,
    InvestigatorTip, CCTVSighting, Lead, TimelineEvent
)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ── User ──────────────────────────────────────────────────────────────────
    if not db.query(User).filter(User.email == "demo@nfsu.traceai").first():
        user = User(
            name="Inspector Raj Mehta",
            email="demo@nfsu.traceai",
            hashed_password=pwd_context.hash("TraceAI@123"),
            role="Senior Investigator",
            badge_number="NFSU-INV-001",
        )
        db.add(user)
        db.commit()
        print("[OK] Demo user created")
    else:
        print("  User already exists")

    # ── Case 1: Rahul Sharma ──────────────────────────────────────────────────
    if not db.query(Case).filter(Case.case_id == "MP-2026-001").first():
        case1 = Case(case_id="MP-2026-001", status="active", priority="high")
        db.add(case1); db.flush()

        db.add(MissingPerson(
            case_id="MP-2026-001", full_name="Rahul Sharma", age=21, gender="Male",
            date_of_birth="2005-03-12", phone="9876543210",
            emergency_contact="Suresh Sharma (Father) -- 9876543211",
            photo_url="https://i.pravatar.cc/150?img=12",
            height="5'9\"", weight="65 kg", build="Slim", hair_color="Black",
            eye_color="Brown", complexion="Medium",
            identifying_marks="Small scar on left cheek; eagle tattoo on right forearm",
            last_seen_date="2026-01-15", last_seen_time="17:45",
            last_seen_location="Surat Railway Station, Platform 3",
            last_seen_clothing="Blue cotton shirt, black jeans, white sports shoes",
            last_seen_possessions="Black backpack, Android phone, wallet",
            known_destinations="Adajan area, Udhna, university campus",
            medical_notes="No known medical conditions",
            known_contacts="Priya Patel (friend), Amit Verma (classmate)",
            usual_locations="Surat Railway Station, Adajan Market, SVNIT campus",
            additional_info="Last called father at 17:40. Mentioned arriving home for dinner.",
        ))

        db.add(FamilyInformation(
            case_id="MP-2026-001",
            family_statement="Rahul called me at 17:40 saying he was at the railway station and would be home by 19:00 for dinner. He sounded normal. When he did not arrive by 20:00, I called but his phone was switched off.",
            known_routines="College on weekdays 09:00--17:00. Train from Surat station. Returns by 19:30.",
            known_places="SVNIT campus, Adajan Market, Udhna Darwaja, Green Park, Surat Railway Station",
            recent_activities="Final semester exams approaching. Part-time coding internship. Went out to buy stationery.",
            clothing_info="Blue cotton shirt (full sleeves), black denim jeans, white Nike sports shoes, black JBL backpack.",
            personal_belongings="Black JBL backpack, Samsung Galaxy A53 (blue), black leather wallet with college ID, ~₹500 cash, earphones.",
            contact_info="Father: Suresh Sharma -- 9876543211. Mother: Lata Sharma -- 9876543212.",
            additional_observations="No known stress or disputes. Girlfriend confirmed he was fine earlier that day. Passport is at home.",
        ))

        # Tips
        tips1 = [
            InvestigatorTip(tip_id="TIP-001-001", case_id="MP-2026-001", date="2026-01-15", time="18:55",
                source_type="witness", location="Adajan Market, Near Reliance Fresh",
                description="Shopkeeper reports seeing a young male matching description near Reliance Fresh. Person appeared hurried and was on the phone.",
                witness_description="Male, ~20 years, blue shirt, dark jeans, backpack. Walking quickly eastward.",
                confidence=0.75, supporting_notes="Shopkeeper willing to provide shop CCTV footage."),
            InvestigatorTip(tip_id="TIP-001-002", case_id="MP-2026-001", date="2026-01-15", time="19:20",
                source_type="community_tip", location="Udhna Darwaja Bus Terminal",
                description="Anonymous tip: Person matching description seen boarding Bus No. 27 towards Udhna at ~19:15--19:20.",
                witness_description="Blue shirt, black bag. Male, young.",
                confidence=0.55, supporting_notes="Anonymous caller. Bus route confirmed."),
            InvestigatorTip(tip_id="TIP-001-003", case_id="MP-2026-001", date="2026-01-15", time="20:10",
                source_type="field_officer", location="Katargam Canal Road",
                description="Field officer patrol: no sighting consistent with description during 19:30--20:00. Canal area checked.",
                confidence=0.3, supporting_notes="Negative sighting -- area ruled out."),
            InvestigatorTip(tip_id="TIP-001-004", case_id="MP-2026-001", date="2026-01-15", time="21:30",
                source_type="social_media", location="Green Park, Surat",
                description="Instagram DM with photograph of person in similar clothing near Green Park. Identity unconfirmed (rear view only).",
                witness_description="Blue shirt, dark pants, white shoes, backpack",
                confidence=0.5, supporting_notes="Social media user contacted -- awaiting response."),
            InvestigatorTip(tip_id="TIP-001-005", case_id="MP-2026-001", date="2026-01-16", time="08:00",
                source_type="phone_call", location="Althan, Surat",
                description="Caller from PCO claims Rahul stayed overnight in Althan. Cannot provide name/address. Likely unverified.",
                confidence=0.25, supporting_notes="Possibly false. Family has no Althan contacts."),
        ]
        for t in tips1: db.add(t)

        # Sightings
        sightings1 = [
            CCTVSighting(sighting_id="CCTV-001-001", case_id="MP-2026-001", camera_id="CAM-SRT-042",
                location="Surat Railway Station -- Platform 3 Exit", date="2026-01-15", time="17:48",
                description="Person matching description exits Platform 3 toward concourse. Blue shirt, dark trousers, dark backpack. Face partially visible.",
                observed_clothing="Blue shirt, dark jeans/trousers, dark backpack, light shoes",
                approximate_age=20, direction_of_movement="North-east toward station main gate",
                confidence=0.85, lat=21.1702, lng=72.8311),
            CCTVSighting(sighting_id="CCTV-001-002", case_id="MP-2026-001", camera_id="CAM-SRT-104",
                location="Surat Railway Station -- Main Exit (East Gate)", date="2026-01-15", time="17:52",
                description="Subject leaving through east gate, looking at phone. Blue shirt, black jeans. No companion visible.",
                observed_clothing="Blue shirt, black jeans, white shoes",
                approximate_age=20, direction_of_movement="East toward Ring Road",
                confidence=0.90, lat=21.1705, lng=72.8315),
            CCTVSighting(sighting_id="CCTV-001-003", case_id="MP-2026-001", camera_id="CAM-ADJ-021",
                location="Adajan Patia -- Main Road Intersection", date="2026-01-15", time="18:42",
                description="Person resembling missing individual crossing Adajan junction heading west. Blue shirt visible.",
                observed_clothing="Blue upper garment, dark lower, shoulder bag",
                approximate_age=19, direction_of_movement="West toward Adajan Market",
                confidence=0.72, lat=21.1917, lng=72.8003),
            CCTVSighting(sighting_id="CCTV-001-004", case_id="MP-2026-001", camera_id="CAM-ADJ-035",
                location="Adajan Market -- Near Reliance Fresh", date="2026-01-15", time="18:58",
                description="Young male in blue shirt pausing at Reliance Fresh entrance, making a phone call, then moving into inner lanes.",
                observed_clothing="Blue shirt, dark jeans, dark backpack",
                approximate_age=21, direction_of_movement="Into Adajan inner lanes",
                confidence=0.78, lat=21.1925, lng=72.7990),
            CCTVSighting(sighting_id="CCTV-001-005", case_id="MP-2026-001", camera_id="CAM-UDH-008",
                location="Udhna Darwaja -- Bus Terminal Entrance", date="2026-01-15", time="19:18",
                description="Person consistent with description entering bus terminal. Blue shirt, dark lower garment, backpack. Boards bus toward Udhna.",
                observed_clothing="Blue shirt, dark trousers, black backpack",
                approximate_age=20, direction_of_movement="Into bus terminal, boarded Bus 27",
                confidence=0.68, lat=21.1612, lng=72.8437),
        ]
        for s in sightings1: db.add(s)

        # Timeline
        timeline1 = [
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="17:40",
                title="Last Phone Contact", source="family",
                description="Rahul called his father. Said he was at Surat Railway Station and would be home by 19:00.",
                location="Surat Railway Station", lat=21.1702, lng=72.8311),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="17:48",
                title="CCTV -- Platform 3 Exit", source="cctv",
                description="CAM-SRT-042 captures person matching description exiting Platform 3.",
                location="Surat Railway Station, Platform 3 Exit", lat=21.1702, lng=72.8311),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="17:52",
                title="CCTV -- Station East Gate", source="cctv",
                description="CAM-SRT-104 confirms subject leaving east gate, looking at phone.",
                location="Surat Railway Station, East Gate", lat=21.1705, lng=72.8315),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="18:42",
                title="CCTV -- Adajan Junction", source="cctv",
                description="CAM-ADJ-021 captures person consistent with description crossing Adajan junction.",
                location="Adajan Patia Junction", lat=21.1917, lng=72.8003),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="18:55",
                title="Witness -- Adajan Market", source="witness",
                description="Shopkeeper near Reliance Fresh sees young male in blue shirt, dark jeans, backpack. Person hurried.",
                location="Adajan Market, Near Reliance Fresh", lat=21.1925, lng=72.7990),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="18:58",
                title="CCTV -- Adajan Reliance Fresh", source="cctv",
                description="CAM-ADJ-035 shows young male pausing at Reliance Fresh entrance, making a call.",
                location="Adajan Market -- Reliance Fresh", lat=21.1925, lng=72.7990),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="19:18",
                title="CCTV -- Udhna Bus Terminal", source="cctv",
                description="CAM-UDH-008 shows person consistent with description entering Udhna bus terminal.",
                location="Udhna Darwaja Bus Terminal", lat=21.1612, lng=72.8437),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="19:20",
                title="Anonymous Tip -- Bus 27 Boarding", source="witness",
                description="Anonymous tip: person matching description boards Bus 27 toward Udhna.",
                location="Udhna Darwaja Bus Terminal", lat=21.1612, lng=72.8437),
            TimelineEvent(case_id="MP-2026-001", date="2026-01-15", time="21:30",
                title="Social Media Tip -- Green Park", source="investigator",
                description="Instagram DM with rear-view photo of person in similar clothing near Green Park.",
                location="Green Park, Surat", lat=21.1830, lng=72.8150),
        ]
        for e in timeline1: db.add(e)
        db.commit()
        print("[OK] Case MP-2026-001 seeded")
    else:
        print("  Case MP-2026-001 already exists")

    # ── Case 2: Meera Krishnan ────────────────────────────────────────────────
    if not db.query(Case).filter(Case.case_id == "MP-2026-002").first():
        case2 = Case(case_id="MP-2026-002", status="active", priority="critical")
        db.add(case2); db.flush()
        db.add(MissingPerson(
            case_id="MP-2026-002", full_name="Meera Krishnan", age=17, gender="Female",
            date_of_birth="2008-07-22", phone="9988776655",
            emergency_contact="Lakshmi Krishnan (Mother) -- 9988776656",
            photo_url="https://i.pravatar.cc/150?img=47",
            height="5'4\"", weight="52 kg", build="Slim", hair_color="Black (long, braided)",
            eye_color="Dark Brown", complexion="Fair",
            identifying_marks="Small birthmark below right ear",
            last_seen_date="2026-01-10", last_seen_time="16:30",
            last_seen_location="Ahmedabad Bus Stand, Sector-7",
            last_seen_clothing="Red kurta, white salwar, blue dupatta, white sandals",
            last_seen_possessions="Pink satchel bag, textbooks, inhaler",
            known_destinations="Coaching centre in Naranpura, CG Road",
            medical_notes="Mild asthma -- carries inhaler",
            known_contacts="Ananya Shah (classmate)",
            usual_locations="Bus stand, Naranpura coaching centre, Manek Chowk",
            additional_info="Was returning from coaching class. Mother expected her by 17:30.",
        ))
        db.add(FamilyInformation(
            case_id="MP-2026-002",
            family_statement="Meera left for her 14:00 coaching class and was expected back by 17:30. She called at 16:20 saying class was ending. That was last contact. Phone is unreachable.",
            known_routines="School 08:00--13:30. Coaching 14:00--16:30. Returns by public bus.",
            known_places="School (Navrangpura), coaching centre (Naranpura), bus stand Sector-7",
            clothing_info="Red embroidered kurta, white salwar, blue dupatta, white flat sandals",
            personal_belongings="Pink satchel bag, Redmi Note 11, inhaler",
            contact_info="Mother: Lakshmi Krishnan -- 9988776656",
            additional_observations="No known conflicts. Good student. No social media concerns known to family.",
        ))
        tips2 = [
            InvestigatorTip(tip_id="TIP-002-001", case_id="MP-2026-002", date="2026-01-10", time="17:00",
                source_type="witness", location="Naranpura Bus Stop",
                description="Classmate saw Meera at Naranpura bus stop after coaching. She was with an unknown girl in a yellow dress.",
                confidence=0.8),
            InvestigatorTip(tip_id="TIP-002-002", case_id="MP-2026-002", date="2026-01-10", time="17:45",
                source_type="community_tip", location="Sector-7 Underpass, Ahmedabad",
                description="Vendor reports girl in red dress near underpass alone, looking at phone, walked toward bus stand side road.",
                confidence=0.65),
        ]
        for t in tips2: db.add(t)
        sightings2 = [
            CCTVSighting(sighting_id="CCTV-002-001", case_id="MP-2026-002", camera_id="CAM-AHM-076",
                location="Naranpura Bus Stop -- BRTS Camera", date="2026-01-10", time="16:42",
                description="Girl in red kurta and blue dupatta at Naranpura BRTS stop with another girl in yellow. Both board bus heading toward Sector-7.",
                observed_clothing="Red kurta, blue dupatta, white sandals",
                approximate_age=17, direction_of_movement="Boarded BRTS bus toward Sector-7",
                confidence=0.80, lat=23.0469, lng=72.5611),
        ]
        for s in sightings2: db.add(s)
        db.commit()
        print("[OK] Case MP-2026-002 seeded")
    else:
        print("  Case MP-2026-002 already exists")

    # ── Case 3: Arjun Mehta ───────────────────────────────────────────────────
    if not db.query(Case).filter(Case.case_id == "MP-2026-003").first():
        case3 = Case(case_id="MP-2026-003", status="pending", priority="medium")
        db.add(case3); db.flush()
        db.add(MissingPerson(
            case_id="MP-2026-003", full_name="Arjun Mehta", age=35, gender="Male",
            date_of_birth="1991-11-05", phone="9123456789",
            emergency_contact="Sunita Mehta (Wife) -- 9123456790",
            photo_url="https://i.pravatar.cc/150?img=33",
            height="5'11\"", weight="78 kg", build="Athletic", hair_color="Black (short)",
            eye_color="Black", complexion="Wheatish",
            identifying_marks="Beard; scar on right hand",
            last_seen_date="2026-01-12", last_seen_time="08:15",
            last_seen_location="Pune Station, Deccan Express Platform",
            last_seen_clothing="Grey polo shirt, navy trousers, brown leather shoes",
            last_seen_possessions="Laptop bag, suitcase",
            known_destinations="Mumbai office (Nariman Point)",
            medical_notes="None",
            known_contacts="Business partner Rohan Kapoor",
            usual_locations="Pune--Mumbai corridor",
            additional_info="Did not arrive at Mumbai office. Phone went to voicemail at 09:00.",
        ))
        tips3 = [
            InvestigatorTip(tip_id="TIP-003-001", case_id="MP-2026-003", date="2026-01-12", time="09:30",
                source_type="field_officer", location="Pune Station Lonavala Platform",
                description="Field officer checked Deccan Express manifest. Subject was not on passenger list under his name.",
                confidence=0.6),
            InvestigatorTip(tip_id="TIP-003-002", case_id="MP-2026-003", date="2026-01-12", time="11:00",
                source_type="witness", location="Pune Station -- Taxi Stand",
                description="Taxi driver recalls picking up a man in grey shirt with laptop bag. Dropped near Shivajinagar. Could not confirm identity.",
                witness_description="Male, 30s, grey shirt, laptop bag, brown shoes",
                confidence=0.55),
        ]
        for t in tips3: db.add(t)
        sightings3 = [
            CCTVSighting(sighting_id="CCTV-003-001", case_id="MP-2026-003", camera_id="CAM-PNE-012",
                location="Pune Station -- Main Entrance", date="2026-01-12", time="08:20",
                description="Male in grey polo shirt carrying laptop bag and rolling suitcase visible at main entrance. Walking toward taxi stand.",
                observed_clothing="Grey polo shirt, navy trousers, laptop bag, suitcase",
                approximate_age=35, direction_of_movement="Toward taxi stand",
                confidence=0.75, lat=18.5283, lng=73.8744),
        ]
        for s in sightings3: db.add(s)
        db.commit()
        print("[OK] Case MP-2026-003 seeded")
    else:
        print("  Case MP-2026-003 already exists")

    db.close()
    print("\n[OK] Database seeded successfully.")


if __name__ == "__main__":
    seed()


