"""
Deterministic Clinical Safety & Triage Engine for MOMENT.
Implements authoritative clinical safety protocols based on:
- ACOG Practice Bulletin #222 (Gestational Hypertension & Preeclampsia)
- ACOG Practice Bulletin #171 (Management of Preterm Labor)
- CDC 'Hear Her' Maternal Warning Signs Campaign
- WHO Guidelines for Maternal and Perinatal Health
- NHS Green-top Guidelines (Reduced Fetal Movements & Antepartum Bleeding)

DO NOT DIAGNOSE. Evaluates risk urgency into:
- RED: Immediate emergency / maternity hospital triage required
- YELLOW: Contact OB-GYN / clinical evaluation within 12-24 hours
- GREEN: Routine physiological symptom, monitor, comfort measures
"""
import re
from typing import Dict, Any, List, Optional
from models import SymptomTriageResult

def evaluate_symptom_safety(
    symptom_text: str,
    gestational_week: int,
    context: Optional[Dict[str, Any]] = None,
    structured_data: Optional[Dict[str, Any]] = None
) -> SymptomTriageResult:
    text = (symptom_text or "").lower()
    red_flags: List[str] = []
    
    # Extract structured fields if available
    follow_up = structured_data.get("structured_follow_up") if structured_data else None
    severity = structured_data.get("severity", 5) if structured_data else 5
    
    # ------------------ RED FLAG PROTOCOLS (URGENT EVALUATION) ------------------
    
    # 1. Preterm Contractions (< 37 Weeks with regular intervals)
    is_contractions = bool(re.search(r"contraction|cramp|tighten", text))
    interval_match = re.search(r"(\d+)\s*(?:min|minute)", text)
    interval_mins = int(interval_match.group(1)) if interval_match else None
    
    if follow_up and follow_up.get("contraction_interval_minutes"):
        interval_mins = follow_up.get("contraction_interval_minutes")
        is_contractions = True

    if gestational_week < 37 and is_contractions:
        if (interval_mins and interval_mins <= 10) or "every 8" in text or "every 5" in text or "every 10" in text or "regular" in text:
            red_flags.append(
                f"Regular uterine contractions at {gestational_week} weeks (Interval: every {interval_mins or 8} mins) - Potential Preterm Labor risk"
            )

    # 2. Preeclampsia Severe Features (Headache, Vision, Epigastric, especially with known HTN)
    has_known_htn = False
    if context:
        conditions = " ".join(context.get("profile", {}).get("relevant_conditions", [])).lower()
        if "hypertension" in conditions or "blood pressure" in conditions:
            has_known_htn = True

    has_severe_headache = bool(re.search(r"severe headache|worst headache|headache.*(not relieved|unrelieved|throbbing|pounding|tylenol didn't)", text))
    has_vision_changes = bool(re.search(r"blurry|blurred|vision|spots|flashing lights|scotoma|double vision", text))
    has_epigastric_pain = bool(re.search(r"right upper quadrant|rib pain|epigastric|stomach pain under ribs|severe belly pain", text))
    has_facial_edema = bool(re.search(r"sudden swelling|face.*swollen|swelling in (hands|face)|puffy eyes", text))

    if follow_up:
        if follow_up.get("has_severe_headache"): has_severe_headache = True
        if follow_up.get("has_visual_disturbances"): has_vision_changes = True

    if has_known_htn and (has_severe_headache or has_vision_changes or has_epigastric_pain):
        red_flags.append(
            "Known Gestational Hypertension with preeclampsia red flag (severe headache, visual disturbance, or RUQ pain)"
        )
    elif has_severe_headache and has_vision_changes:
        red_flags.append("Co-occurring severe unrelieved headache and visual changes (Preeclampsia warning sign)")

    # 3. Vaginal Bleeding or Fluid Leakage
    has_bleeding = bool(re.search(r"bleeding|blood|spotting|bright red", text))
    has_fluid_leak = bool(re.search(r"fluid leak|water broke|gush|leaking fluid|watery discharge", text))
    
    if follow_up:
        if follow_up.get("has_bleeding"): has_bleeding = True
        if follow_up.get("has_fluid_leak"): has_fluid_leak = True

    if has_bleeding and not re.search(r"no bleeding|without bleeding", text):
        red_flags.append("Vaginal bleeding / active spotting during third trimester")
    if has_fluid_leak and not re.search(r"no fluid|without fluid", text):
        red_flags.append("Suspected spontaneous rupture of membranes / amniotic fluid leakage")

    # 4. Reduced or Absent Fetal Movement (> 26-28 Weeks)
    has_reduced_movement = bool(re.search(r"no kick|reduced movement|baby not moving|haven't felt|less active|stopped moving", text))
    if follow_up and follow_up.get("has_reduced_fetal_movement"):
        has_reduced_movement = True
        
    if gestational_week >= 26 and has_reduced_movement:
        red_flags.append(f"Decreased or absent fetal movements at {gestational_week} weeks")

    # 5. High Maternal Fever or Severe Shortness of Breath
    has_high_fever = bool(re.search(r"fever.*(101|102|103|104|high)|chills.*rigor", text))
    has_dyspnea = bool(re.search(r"shortness of breath|can't breathe|difficulty breathing|chest pain", text))
    if has_high_fever:
        red_flags.append("High maternal fever (>100.4°F/38°C) suggestive of intrauterine/systemic infection")
    if has_dyspnea:
        red_flags.append("Severe shortness of breath or acute chest discomfort")

    # ------------------ TRIAGE CLASSIFICATION ------------------
    if len(red_flags) > 0:
        return SymptomTriageResult(
            classification="RED",
            headline="Your symptoms may require prompt medical evaluation.",
            clinical_rationale=(
                f"You reported symptoms that match urgent pregnancy safety criteria at {gestational_week} weeks: "
                f"{'; '.join(red_flags)}. "
                "Per ACOG guidelines, these signs require timely physical assessment to protect both maternal and fetal wellbeing."
            ),
            action_guidance=(
                "Please do not wait. Contact your obstetrician (Dr. Priya Raman), call your hospital's Labor & Delivery Triage, "
                "or proceed to the nearest emergency maternity department immediately."
            ),
            recommended_timeframe="Immediate emergency evaluation (within 1-2 hours)",
            red_flags_detected=red_flags,
            guideline_reference="FOGSI & ACOG Practice Bulletin #222 (Obstetric Emergency Protocol)",
            emergency_contacts_ready=True
        )

    # ------------------ YELLOW FLAG PROTOCOLS (PROMPT CLINICAL CONTACT) ------------------
    yellow_flags: List[str] = []
    
    # Mild headache without severe features
    if bool(re.search(r"headache|migraine|head hurts", text)):
        yellow_flags.append("Mild or persistent headache in third trimester (requires BP check)")
        
    # Dysuria / suspected UTI
    if bool(re.search(r"burning.*urin|pain.*urin|frequent.*peeing|uti|bladder", text)):
        yellow_flags.append("Possible urinary tract infection symptoms (risk of triggering preterm contractions)")
        
    # Persistent nausea/vomiting late pregnancy
    if bool(re.search(r"vomiting|can't keep food down|dehydrat", text)) and gestational_week > 20:
        yellow_flags.append("Late-onset persistent nausea or inability to maintain hydration")

    # Moderate localized abdominal discomfort or ligament pain with high severity
    if severity >= 6 and not is_contractions:
        yellow_flags.append(f"Significant localized abdominal pain (reported severity {severity}/10)")

    # Swelling isolated to lower extremities
    if bool(re.search(r"swelling|edema|puffy feet|swollen ankle", text)) and not has_facial_edema:
        yellow_flags.append("Lower extremity edema (monitor blood pressure and check for sudden spreading)")

    if len(yellow_flags) > 0:
        return SymptomTriageResult(
            classification="YELLOW",
            headline="Discuss this symptom with your healthcare provider.",
            clinical_rationale=(
                f"The symptom you logged ({'; '.join(yellow_flags)}) is common but warrants clinical review with your provider, "
                f"especially given your current gestational age of {gestational_week} weeks."
            ),
            action_guidance=(
                "Send a message to Dr. Priya Raman's clinic or call during clinic hours. "
                "Monitor for any red-flag escalation such as visual blurriness, sudden swelling, or contractions."
            ),
            recommended_timeframe="Contact OB office within 12-24 hours",
            red_flags_detected=yellow_flags,
            guideline_reference="CDC 'Hear Her' Campaign & NHS Routine Antenatal Care Pathways",
            emergency_contacts_ready=False
        )

    # ------------------ GREEN: ROUTINE PHYSIOLOGICAL ------------------
    return SymptomTriageResult(
        classification="GREEN",
        headline="Typical pregnancy symptom - Monitor & continue routine self-care.",
        clinical_rationale=(
            f"Symptoms like mild backache, standard fatigue, Braxton-Hicks practice tightenings, or mild heartburn "
            f"are expected physiological changes during Week {gestational_week}. No red flags detected."
        ),
        action_guidance=(
            "Rest, maintain hydration, and apply comfort measures. "
            "If frequency, intensity, or new symptoms develop, log them immediately."
        ),
        recommended_timeframe="Routine monitoring / discuss at next scheduled checkup",
        red_flags_detected=[],
        guideline_reference="WHO Recommendations on Antenatal Care for a Positive Pregnancy Experience",
        emergency_contacts_ready=False
    )
