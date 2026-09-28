"""
TRACEAI Mock AI Engine
Deterministic scoring engine for missing-person case correlation.
Replace AI_PROVIDER with 'ibm' or 'openai' to swap in a real LLM.
"""
import json
import os
from datetime import datetime
from typing import Any

AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")


def _keyword_overlap(text1: str, text2: str) -> float:
    """Simple keyword overlap score 0-1."""
    if not text1 or not text2:
        return 0.0
    t1 = set(text1.lower().split())
    t2 = set(text2.lower().split())
    # Remove stopwords
    stop = {"a", "an", "the", "is", "was", "in", "on", "at", "to", "of", "and", "or", "with", "near", "from"}
    t1 -= stop
    t2 -= stop
    if not t1 or not t2:
        return 0.0
    return len(t1 & t2) / max(len(t1), len(t2))


def _clothing_match(ref: str, obs: str) -> float:
    """Color/clothing keyword match."""
    colors = ["blue", "red", "black", "white", "grey", "gray", "green", "yellow", "brown", "navy", "dark", "light"]
    garments = ["shirt", "jeans", "trousers", "pants", "kurta", "salwar", "dress", "jacket", "top", "backpack", "bag", "shoes", "sandals"]
    keywords = colors + garments
    if not ref or not obs:
        return 0.0
    ref_kw = {k for k in keywords if k in ref.lower()}
    obs_kw = {k for k in keywords if k in obs.lower()}
    if not ref_kw:
        return 0.3  # no reference to compare
    overlap = ref_kw & obs_kw
    return len(overlap) / len(ref_kw)


def _age_match(ref_age: int, obs_age: int) -> float:
    if not obs_age or not ref_age:
        return 0.3
    diff = abs(ref_age - obs_age)
    if diff <= 2:
        return 1.0
    elif diff <= 5:
        return 0.7
    elif diff <= 10:
        return 0.4
    return 0.1


def _time_compatible(last_seen_time: str, event_time: str) -> float:
    """Check if event time is plausibly after last seen time (same day)."""
    try:
        t1 = datetime.strptime(last_seen_time, "%H:%M")
        t2 = datetime.strptime(event_time, "%H:%M")
        diff_mins = (t2 - t1).seconds // 60
        if diff_mins < 0:
            return 0.2  # before last seen – unlikely
        if diff_mins <= 30:
            return 1.0
        elif diff_mins <= 120:
            return 0.85
        elif diff_mins <= 300:
            return 0.6
        return 0.3
    except Exception:
        return 0.5


def _score_sighting(mp: dict, family: dict, sighting: dict) -> dict:
    """Score a CCTV sighting against case data."""
    ref_clothing = (mp.get("last_seen_clothing") or "") + " " + (family.get("clothing_info") or "")
    ref_age = mp.get("age", 25)
    last_seen_time = mp.get("last_seen_time", "00:00")

    clothing_s = _clothing_match(ref_clothing, sighting.get("observed_clothing") or sighting.get("description") or "")
    age_s = _age_match(ref_age, sighting.get("approximate_age") or 0)
    time_s = _time_compatible(last_seen_time, sighting.get("time") or "00:00")
    desc_s = _keyword_overlap(ref_clothing, sighting.get("description") or "")
    base_conf = float(sighting.get("confidence", 0.5))
    confidence_s = base_conf

    # Weighted total (max=100)
    total = (
        clothing_s * 30 +
        age_s * 20 +
        time_s * 20 +
        desc_s * 15 +
        confidence_s * 15
    )
    return {
        "total": round(total),
        "factors": [
            {"label": "Clothing match", "score": round(clothing_s * 30), "matched": clothing_s > 0.4,
             "detail": f"Clothing overlap score: {round(clothing_s * 100)}%"},
            {"label": "Age compatibility", "score": round(age_s * 20), "matched": age_s > 0.5,
             "detail": f"Age difference assessment: {'compatible' if age_s > 0.5 else 'uncertain'}"},
            {"label": "Time compatibility", "score": round(time_s * 20), "matched": time_s > 0.5,
             "detail": f"Time gap from last sighting: {'compatible' if time_s > 0.5 else 'uncertain'}"},
            {"label": "Description similarity", "score": round(desc_s * 15), "matched": desc_s > 0.2,
             "detail": f"Keyword similarity: {round(desc_s * 100)}%"},
            {"label": "Source confidence", "score": round(confidence_s * 15), "matched": confidence_s > 0.5,
             "detail": f"Source-reported confidence: {round(confidence_s * 100)}%"},
        ]
    }


def _score_tip(mp: dict, family: dict, tip: dict) -> dict:
    """Score an investigator tip against case data."""
    ref_clothing = (mp.get("last_seen_clothing") or "") + " " + (family.get("clothing_info") or "")
    ref_age = mp.get("age", 25)
    last_seen_time = mp.get("last_seen_time", "00:00")

    w_desc = tip.get("witness_description") or ""
    clothing_s = _clothing_match(ref_clothing, w_desc + " " + tip.get("description", ""))
    age_s = 0.5  # tips rarely have age
    time_s = _time_compatible(last_seen_time, tip.get("time") or "00:00")
    desc_s = _keyword_overlap(ref_clothing, tip.get("description") or "")
    source_weights = {"witness": 0.8, "field_officer": 0.9, "phone_call": 0.4, "community_tip": 0.6, "social_media": 0.5, "other": 0.4}
    source_s = source_weights.get(tip.get("source_type", "other"), 0.5)
    conf_s = float(tip.get("confidence", 0.5))

    total = (
        clothing_s * 25 +
        time_s * 20 +
        desc_s * 15 +
        source_s * 20 +
        conf_s * 20
    )
    return {
        "total": round(total),
        "factors": [
            {"label": "Clothing/description match", "score": round(clothing_s * 25), "matched": clothing_s > 0.3,
             "detail": f"Clothing keywords overlap: {round(clothing_s * 100)}%"},
            {"label": "Time compatibility", "score": round(time_s * 20), "matched": time_s > 0.5,
             "detail": f"Time after last known sighting: {'compatible' if time_s > 0.5 else 'uncertain'}"},
            {"label": "Description keyword match", "score": round(desc_s * 15), "matched": desc_s > 0.15,
             "detail": f"Keyword overlap: {round(desc_s * 100)}%"},
            {"label": "Source reliability", "score": round(source_s * 20), "matched": source_s > 0.6,
             "detail": f"Source type: {tip.get('source_type','unknown')} (reliability: {round(source_s*100)}%)"},
            {"label": "Reporter confidence", "score": round(conf_s * 20), "matched": conf_s > 0.5,
             "detail": f"Reporter confidence: {round(conf_s * 100)}%"},
        ]
    }


def _priority_from_score(score: int) -> str:
    if score >= 75:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 40:
        return "medium"
    return "low"


def analyze_case(case_data: dict) -> dict:
    """Main entry point. Returns leads, timeline, summary, recommendations."""
    if AI_PROVIDER != "mock":
        # Hook for real LLM integration
        return _llm_analyze(case_data)

    mp = case_data.get("missing_person", {})
    family = case_data.get("family_info") or {}
    sightings = case_data.get("sightings", [])
    tips = case_data.get("tips", [])

    leads = []
    timeline_additions = []
    lead_counter = 1

    # Analyze each CCTV sighting
    for s in sightings:
        result = _score_sighting(mp, family, s)
        score = result["total"]
        priority = _priority_from_score(score)
        confidence = round(score / 100, 2)

        lead = {
            "lead_id": f"LEAD-{mp.get('case_id','?').split('-')[-1]}-{lead_counter:03d}",
            "case_id": mp.get("case_id", ""),
            "description": f"Potential sighting at {s.get('location', 'unknown location')} "
                           f"(Camera {s.get('camera_id', 'N/A')}) at {s.get('time', 'unknown time')} on {s.get('date', '')}.",
            "source": f"CCTV – {s.get('camera_id', 'N/A')}",
            "location": s.get("location", ""),
            "time": s.get("time", ""),
            "priority": priority,
            "confidence": confidence,
            "reasoning": (
                f"CCTV camera {s.get('camera_id')} at {s.get('location')} recorded a person "
                f"consistent with the missing individual's description. "
                f"Observed clothing: '{s.get('observed_clothing') or 'N/A'}'. "
                f"Composite match score: {score}/100."
            ),
            "factors": result["factors"],
            "recommended_action": (
                f"1. Obtain full footage from {s.get('camera_id')} for the "
                f"{s.get('time')} time window.\n"
                f"2. Identify direction of movement: {s.get('direction_of_movement', 'unknown')}.\n"
                f"3. Check adjacent cameras along the identified route.\n"
                f"4. Cross-reference with witness tips for the same area and time."
            ),
            "status": "new",
        }
        leads.append(lead)
        lead_counter += 1

    # Analyze each investigator tip
    for t in tips:
        result = _score_tip(mp, family, t)
        score = result["total"]
        priority = _priority_from_score(score)
        confidence = round(score / 100, 2)

        lead = {
            "lead_id": f"LEAD-{mp.get('case_id','?').split('-')[-1]}-{lead_counter:03d}",
            "case_id": mp.get("case_id", ""),
            "description": f"Investigator tip: {t.get('description', '')[:150]}...",
            "source": f"Tip – {t.get('source_type', 'unknown')} ({t.get('tip_id', '')})",
            "location": t.get("location", ""),
            "time": t.get("time", ""),
            "priority": priority,
            "confidence": confidence,
            "reasoning": (
                f"A {t.get('source_type','unknown')} tip ({t.get('tip_id','N/A')}) at "
                f"{t.get('location','unknown location')} at {t.get('time','unknown time')} "
                f"describes a person potentially matching the missing individual. "
                f"Match score: {score}/100."
            ),
            "factors": result["factors"],
            "recommended_action": (
                f"1. Verify the tip by following up with source: {t.get('source_type','unknown')}.\n"
                f"2. Cross-reference with CCTV cameras near {t.get('location','the reported location')}.\n"
                f"3. Check the time window {t.get('time','unknown')} for consistent sightings.\n"
                f"4. Mark tip status after field verification."
            ),
            "status": "new",
        }
        leads.append(lead)
        lead_counter += 1

    # Sort by confidence descending
    leads.sort(key=lambda x: x["confidence"], reverse=True)

    # Cross-source correlation check – boost leads with matching location+time across sources
    _boost_correlated_leads(leads, sightings, tips)
    # Re-sort
    leads.sort(key=lambda x: x["confidence"], reverse=True)

    # Summary
    high_leads = [l for l in leads if l["priority"] in ("critical", "high")]
    summary = (
        f"TRACEAI analyzed {len(sightings)} CCTV sightings and {len(tips)} investigator tips "
        f"for case {mp.get('case_id','N/A')} – {mp.get('full_name','Unknown')}. "
        f"{len(leads)} investigative leads were generated, of which {len(high_leads)} are "
        f"rated HIGH or CRITICAL priority. "
        f"AI-generated leads are decision-support only and require investigator verification."
    )

    recommended_actions = [
        "Deploy field officers to highest-confidence sighting locations immediately.",
        "Obtain CCTV footage from all cameras mentioned in HIGH/CRITICAL leads before storage overwrite.",
        "Interview all identified witnesses in order of tip confidence.",
        "Initiate telecom data request for the missing person's phone number if legally authorized.",
        "Broadcast public appeal in areas where sightings cluster.",
        "Cross-reference all lead locations on the investigation map for geographic patterns.",
        "Update timeline with any new tips or sightings and re-run analysis.",
    ]

    correlation_notes = []
    # Check clothing consistency
    ref_clothing = (mp.get("last_seen_clothing") or "").lower()
    cctv_clothing_hits = sum(1 for s in sightings if _clothing_match(ref_clothing, s.get("observed_clothing") or "") > 0.4)
    if cctv_clothing_hits > 0:
        correlation_notes.append(
            f"Clothing match detected: {cctv_clothing_hits} of {len(sightings)} CCTV sightings "
            f"describe clothing consistent with '{mp.get('last_seen_clothing','N/A')}'."
        )

    # Check geographic clustering
    locations = [s.get("location", "") for s in sightings] + [t.get("location", "") for t in tips]
    unique_areas = set()
    for loc in locations:
        words = loc.lower().split()
        for w in words:
            if len(w) > 4:
                unique_areas.add(w)
    if unique_areas:
        correlation_notes.append(
            f"Geographic areas referenced across sources: {', '.join(list(unique_areas)[:5])}."
        )

    correlation_notes.append(
        "[WARNING] All AI-generated correlations are based on textual pattern matching and confidence scoring. "
        "Results require human investigator verification before any action is taken."
    )

    return {
        "case_id": mp.get("case_id", ""),
        "analyzed_at": datetime.utcnow().isoformat(),
        "leads": leads,
        "summary": summary,
        "recommended_actions": recommended_actions,
        "correlation_notes": correlation_notes,
    }


def _boost_correlated_leads(leads: list, sightings: list, tips: list):
    """Boost leads where CCTV and tip sources mention the same location."""
    sighting_locations = {s.get("location", "").lower() for s in sightings}
    tip_locations = {t.get("location", "").lower() for t in tips}

    for lead in leads:
        lead_loc = lead.get("location", "").lower()
        # Check if any word in lead_loc appears in both sources
        words = [w for w in lead_loc.split() if len(w) > 4]
        for w in words:
            in_cctv = any(w in sl for sl in sighting_locations)
            in_tip = any(w in tl for tl in tip_locations)
            if in_cctv and in_tip:
                # Cross-source corroboration bonus
                lead["confidence"] = min(1.0, lead["confidence"] + 0.08)
                lead["factors"].append({
                    "label": "Cross-source corroboration",
                    "score": 8,
                    "matched": True,
                    "detail": "Both CCTV and tip sources reference this location area"
                })
                break


def generate_public_appeal(case_data: dict) -> str:
    mp = case_data.get("missing_person", {})
    return f"""MISSING PERSON – PUBLIC APPEAL

====================================================
HAVE YOU SEEN THIS PERSON?
====================================================

NAME: {mp.get('full_name', 'N/A')}
AGE: {mp.get('age', 'N/A')} years
GENDER: {mp.get('gender', 'N/A')}
HEIGHT: {mp.get('height', 'N/A')}
BUILD: {mp.get('build', 'N/A')}

LAST SEEN: {mp.get('last_seen_date', 'N/A')} at {mp.get('last_seen_time', 'N/A')}
LOCATION: {mp.get('last_seen_location', 'N/A')}

CLOTHING: {mp.get('last_seen_clothing', 'N/A')}

IDENTIFYING FEATURES: {mp.get('identifying_marks', 'None noted')}

====================================================
IF YOU HAVE INFORMATION, PLEASE CONTACT:
Emergency: 100 (Police)
Missing Persons Helpline: 1094
Case Reference: {mp.get('case_id', 'N/A')}
====================================================

This notice has been reviewed and approved by the investigating officer before release.
Do not share unverified information. AI-assisted draft – requires investigator sign-off.
"""


def _llm_analyze(case_data: dict) -> dict:
    """Placeholder for future LLM integration."""
    raise NotImplementedError("LLM provider not configured. Set AI_PROVIDER=mock or configure a supported LLM.")

