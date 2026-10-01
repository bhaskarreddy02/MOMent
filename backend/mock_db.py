"""
Longitudinal Pregnancy Context Memory Store for MOMENT.
Seeded with a realistic 31-Week 2-Day pregnancy profile (Sarah Jenkins).
Maintains check-ups, lab scans, medications, symptoms, and health trends.
"""
from typing import Dict, Any, List
import copy
from datetime import datetime

INITIAL_DEMO_DATA: Dict[str, Any] = {
    "profile": {
        "user_name": "Ananya Sharma",
        "gestational_week": 31,
        "gestational_days": 2,
        "due_date": "2026-12-12",
        "trimester": 3,
        "gravidity_parity": "G1P0 (First Pregnancy)",
        "maternal_age": 29,
        "blood_type": "O Positive, Rh+",
        "pre_pregnancy_bmi": 23.4,
        "current_weight_lbs": 158.4,
        "total_weight_gain_lbs": 24.2,
        "relevant_conditions": [
            "Mild Gestational Hypertension (diagnosed at Week 27 OB visit)",
            "No prior history of preeclampsia"
        ],
        "allergies": [
            "Penicillin / Amoxicillin (urticaria / skin hives)"
        ],
        "current_medications": [
            "Labetalol 100mg PO BID (Taken at 8:00 AM & 8:00 PM)",
            "Prenatal Multivitamin with 200mg DHA (Daily with lunch)",
            "Low-Dose Aspirin 75mg PO Daily (Preeclampsia risk prophylaxis, started wk 14)"
        ],
        "ob_gyn_name": "Dr. Priya Raman, MBBS, MS (OBG), FICOG",
        "clinic_name": "Cloudnine Clinic - Indiranagar, Bengaluru",
        "hospital_name": "Cloudnine Hospital - Old Airport Road, Bengaluru",
        "hospital_triage_phone": "+91 80 4969 4969",
        "emergency_contact": {
            "name": "Rahul Sharma",
            "relationship": "Spouse / Partner",
            "phone": "+91 98450 12345"
        }
    },
    "timeline_events": [
        {
            "week": 12,
            "date": "2026-08-01",
            "type": "Scan & Screening",
            "title": "Nuchal Translucency & First Trimester Screening",
            "details": "NT 1.3mm (Normal). Low risk for trisomies 21, 18, 13. Baseline BP 118/76."
        },
        {
            "week": 20,
            "date": "2026-09-26",
            "type": "Ultrasound",
            "title": "Anatomy Ultrasound Scan (Level II)",
            "details": "Normal fetal anatomy. Placenta posterior, high. Normal amniotic fluid index (AFI 14 cm). Estimated weight 340g (52nd percentile)."
        },
        {
            "week": 24,
            "date": "2026-10-24",
            "type": "Lab Test",
            "title": "1-Hour Glucose Challenge & CBC",
            "details": "1-hr glucose 122 mg/dL (Normal <140 mg/dL). Hemoglobin 11.8 g/dL. Platelets 220,000/uL. BP 124/80."
        },
        {
            "week": 27,
            "date": "2026-11-14",
            "type": "Clinical Visit",
            "title": "OB-GYN Routine Checkup (Hypertension Diagnosed)",
            "details": "Blood pressure elevated at 142/92 mmHg confirmed on repeat. Urine dipstick negative for protein. Dr. Priya Raman initiated Labetalol 100mg BID. Recommended twice-daily home BP monitoring."
        },
        {
            "week": 28,
            "date": "2026-11-21",
            "type": "Follow-Up Visit",
            "title": "Hypertension Recheck & Growth Ultrasound",
            "details": "BP improved to 132/84 mmHg on Labetalol. Fetal biometry shows estimated weight 1240g (54th percentile). Umbilical artery Doppler normal. Urine protein/creatinine ratio 0.14 (normal <0.30)."
        },
        {
            "week": 30,
            "date": "2026-12-05",
            "type": "Report Upload",
            "title": "Bi-weekly Home BP & Urine Protein Strip Log",
            "details": "Home BP averaged 130/82 mmHg. All urine test strips negative for protein. Mild ankle edema noted in evenings."
        }
    ],
    "recent_symptoms": [
        {
            "id": "symp-1",
            "symptom_name": "Mild Ankle & Foot Edema",
            "severity": 3,
            "duration": "4 days",
            "onset": "Gradual in the evening",
            "frequency": "Daily late afternoon",
            "associated_symptoms": ["Leg heaviness after standing"],
            "gestational_week": 30,
            "logged_date": "2026-12-04",
            "triage_classification": "GREEN",
            "notes": "Improves significantly when elevating legs. No sudden swelling in face or hands."
        },
        {
            "id": "symp-2",
            "symptom_name": "Dull Frontal Headache",
            "severity": 4,
            "duration": "3 hours",
            "onset": "Gradual",
            "frequency": "Occasional (2 episodes this week)",
            "associated_symptoms": ["Fatigue", "Poor sleep (5.8 hrs)"],
            "gestational_week": 31,
            "logged_date": "2026-12-10",
            "triage_classification": "YELLOW",
            "notes": "Relieved somewhat with hydration and rest. No visual flashing lights or scotoma."
        }
    ],
    "medications": [
        {
            "id": "med-1",
            "name": "Labetalol",
            "dose": "100mg",
            "frequency": "Twice Daily (BID)",
            "scheduled_times": ["08:00 AM", "08:00 PM"],
            "prescribing_doctor": "Dr. Priya Raman, MS (OBG)",
            "start_date": "2026-11-14",
            "purpose": "Gestational hypertension control",
            "refill_due": "2026-12-28 (18 days remaining)",
            "taken_today": True,
            "missed_yesterday": False,
            "notes": "Do not skip or discontinue without OB authorization. Check home BP prior to dose."
        },
        {
            "id": "med-2",
            "name": "Prenatal Multivitamin + 200mg DHA",
            "dose": "1 Softgel",
            "frequency": "Once Daily (QD)",
            "scheduled_times": ["12:30 PM"],
            "prescribing_doctor": "Dr. Priya Raman, MS (OBG)",
            "start_date": "2026-05-10",
            "purpose": "Neural development & maternal nutritional support",
            "refill_due": "2027-01-15 (36 days remaining)",
            "taken_today": True,
            "missed_yesterday": False,
            "notes": "Take with meal to minimize mild nausea."
        },
        {
            "id": "med-3",
            "name": "Low-Dose Aspirin",
            "dose": "75mg",
            "frequency": "Once Daily (QD) at bedtime",
            "scheduled_times": ["09:00 PM"],
            "prescribing_doctor": "Dr. Priya Raman, MS (OBG)",
            "start_date": "2026-08-15",
            "purpose": "FOGSI/ACOG guideline-recommended preeclampsia risk reduction",
            "refill_due": "2026-12-22 (12 days remaining)",
            "taken_today": False,
            "missed_yesterday": True,
            "notes": "Missed yesterday evening dose. Resuming tonight per protocol."
        }
    ],
    "appointments": [
        {
            "id": "apt-1",
            "title": "32-Week Routine OB Visit & BP Assessment",
            "doctor": "Dr. Priya Raman, MS (OBG)",
            "clinic": "Cloudnine Clinic - Indiranagar, Bengaluru",
            "date_time": "2026-12-16T10:30:00",
            "gestational_week": 32,
            "type": "OB Visit",
            "prep_notes": "Bring home BP log, urine test record, and completed MOMENT Clinical Summary.",
            "completed": False
        },
        {
            "id": "apt-2",
            "title": "Growth Ultrasound & Umbilical Doppler (Week 34)",
            "doctor": "Dr. Rajesh Kulkarni, MD, FMF",
            "clinic": "Cloudnine Fetal Assessment Center - Old Airport Road",
            "date_time": "2026-12-30T14:00:00",
            "gestational_week": 34,
            "type": "Growth Ultrasound",
            "prep_notes": "Full bladder not required at 34 weeks.",
            "completed": False
        }
    ]
}

# In-memory working copy
current_state = copy.deepcopy(INITIAL_DEMO_DATA)

def get_demo_pregnancy_context() -> Dict[str, Any]:
    return current_state

def reset_demo_data() -> Dict[str, Any]:
    global current_state
    current_state = copy.deepcopy(INITIAL_DEMO_DATA)
    return current_state

def save_symptom(log_request, triage_result):
    new_entry = {
        "id": f"symp-{len(current_state['recent_symptoms']) + 1}",
        "symptom_name": log_request.symptom_name,
        "severity": log_request.severity,
        "duration": log_request.duration,
        "onset": log_request.onset,
        "frequency": log_request.frequency,
        "associated_symptoms": log_request.associated_symptoms,
        "gestational_week": log_request.gestational_week or current_state["profile"]["gestational_week"],
        "logged_date": datetime.now().strftime("%Y-%m-%d"),
        "triage_classification": triage_result.classification,
        "notes": log_request.notes
    }
    current_state["recent_symptoms"].insert(0, new_entry)
    return new_entry

def get_symptoms():
    return current_state["recent_symptoms"]

def get_medications():
    return current_state["medications"]

def update_medication_status(med_id: str, taken: bool):
    for m in current_state["medications"]:
        if m["id"] == med_id:
            m["taken_today"] = taken
            return m
    return None

def get_reports():
    return [e for e in current_state["timeline_events"] if "Scan" in e["type"] or "Report" in e["type"] or "Lab" in e["type"]]

def add_report(report_data: Dict[str, Any]):
    new_event = {
        "week": report_data.get("gestational_week", current_state["profile"]["gestational_week"]),
        "date": report_data.get("extracted_date", datetime.now().strftime("%Y-%m-%d")),
        "type": report_data.get("document_type", "Medical Report"),
        "title": report_data.get("document_name", "Clinical Document"),
        "details": f"Verified lab/scan metrics: {report_data.get('doctor_observations', ['Report processed'])[0]}"
    }
    current_state["timeline_events"].append(new_event)
    return new_event

def get_appointments():
    return current_state["appointments"]

def get_health_metrics():
    # Will be served via MockHealthKitProvider
    pass
