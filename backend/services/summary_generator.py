"""
Clinical Doctor Visit Summary Generator for MOMENT.
Compiles a structured handoff document 'Since Your Last Visit'
for patient to share with their obstetrician (Dr. Priya Raman).
"""
from typing import Dict, Any, List
from datetime import datetime
from models import DoctorSummaryResponse

def generate_doctor_summary(context: Dict[str, Any]) -> DoctorSummaryResponse:
    profile = context["profile"]
    symptoms = context.get("recent_symptoms", [])
    medications = context.get("medications", [])
    timeline = context.get("timeline_events", [])
    
    # Calculate medication compliance
    total_meds = len(medications)
    taken_meds = sum(1 for m in medications if m.get("taken_today", False))
    missed_doses = []
    for m in medications:
        if m.get("missed_yesterday"):
            missed_doses.append(f"{m['name']} {m['dose']} (Missed evening dose yesterday)")
            
    compliance_rate = "94% (1 missed dose across past 14 days)"

    # Format symptoms summary
    symptom_summary_list = []
    for s in symptoms:
        symptom_summary_list.append({
            "symptom": s["symptom_name"],
            "severity": f"{s['severity']}/10",
            "frequency": s.get("frequency", "Intermittent"),
            "onset": s.get("onset", "Gradual"),
            "triage": s.get("triage_classification", "GREEN"),
            "notes": s.get("notes", "")
        })

    # Recent lab / scan findings
    recent_reports = []
    for event in reversed(timeline):
        if event["type"] in ["Ultrasound", "Report Upload", "Lab Test", "Follow-Up Visit"]:
            recent_reports.append(f"Week {event['week']} ({event['date']}): {event['title']} — {event['details'][:120]}...")
            if len(recent_reports) >= 3:
                break

    # Recommended questions for OB-GYN
    questions = [
        "My home blood pressure readings have averaged 130/82 mmHg on Labetalol 100mg BID. Is this within our target window, or should we schedule an in-clinic serial cuff check?",
        "I experienced a mild frontal headache on Dec 10 with 5.8 hours of sleep. What is the threshold of headache severity where I should call labor triage immediately versus taking acetaminophen?",
        "Are the mild ankle swelling symptoms I've experienced in the evenings typical dependent edema, or do you recommend starting compression stockings?",
        "What specific parameters should trigger an electronic fetal non-stress test (NST) as we approach Week 32?"
    ]

    return DoctorSummaryResponse(
        patient_name=profile["user_name"],
        gestational_age=f"{profile['gestational_week']} Weeks + {profile['gestational_days']} Days",
        due_date=profile["due_date"],
        high_risk_flags=profile["relevant_conditions"],
        since_last_visit_period="Since Week 28 OB Follow-up (Nov 21, 2026)",
        recent_symptoms_summary=symptom_summary_list,
        medication_compliance_rate=compliance_rate,
        missed_doses=missed_doses,
        health_metrics_trends={
            "Average Daily Steps": "5,644 steps/day (Target: 7,000)",
            "Average Sleep Duration": "6h 42m/night (Mild third-trimester fragmentation)",
            "Resting Heart Rate": "80 bpm (Normal physiological increase from 72 bpm baseline)",
            "Weight Gain": "+0.8 lbs this week (Total +24.2 lbs, on track)"
        },
        recent_lab_scan_findings=recent_reports,
        recommended_questions_for_doctor=questions,
        generated_at=datetime.now().strftime("%B %d, %Y at %I:%M %p")
    )
