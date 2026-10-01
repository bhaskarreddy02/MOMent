"""
Pydantic data models for MOMENT HealthTech system.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PregnancyProfile(BaseModel):
    user_name: str = "Ananya Sharma"
    gestational_week: int = 31
    gestational_days: int = 2
    due_date: str = "2026-12-12"
    gravidity_parity: str = "G1P0"
    maternal_age: int = 29
    blood_type: str = "O Positive"
    relevant_conditions: List[str] = ["Mild Gestational Hypertension (diagnosed wk 27)"]
    allergies: List[str] = ["Amoxicillin / Penicillin (cutaneous rash)"]
    current_medications: List[str] = [
        "Labetalol 100mg PO BID (8 AM, 8 PM)",
        "Prenatal Multivitamin with 200mg DHA (Daily)",
        "Low-Dose Aspirin 75mg PO Daily (Preeclampsia prophylaxis)"
    ]
    ob_gyn_name: str = "Dr. Priya Raman, MBBS, MS (OBG), FICOG"
    clinic_name: str = "Cloudnine Clinic - Indiranagar, Bengaluru"
    hospital_name: str = "Cloudnine Hospital - Old Airport Road, Bengaluru"
    emergency_contact: Dict[str, str] = {
        "name": "Rahul Sharma (Partner)",
        "phone": "+91 98450 12345",
        "relation": "Spouse"
    }

class MedicalCitation(BaseModel):
    source_tier: str # "TIER 1 (Authoritative)", "TIER 2 (Academic)", "TIER 3 (Clinician Q&A)"
    organization: str # "ACOG", "WHO", "NHS", "CDC"
    title: str
    date: str
    url: str
    topic: str
    relevance_snippet: str

class ChatQueryRequest(BaseModel):
    question: str
    include_longitudinal_context: bool = True
    session_id: Optional[str] = "demo-session"

class ChatQueryResponse(BaseModel):
    answer: str
    safety_level: str # "GREEN", "YELLOW", "RED"
    urgency_flag: bool
    escalation_pathway: Optional[str] = None
    remembered_context_used: List[str]
    sources: List[MedicalCitation]
    disclaimer: str = "MOMENT AI is an educational companion grounded in peer-reviewed clinical guidelines, not an AI doctor. It cannot diagnose conditions, prescribe medications, or alter dosages. For urgent or sudden changes, immediately consult your obstetrician or visit an emergency maternity triage center."

class StructuredSymptomFollowUp(BaseModel):
    has_bleeding: Optional[bool] = None
    has_fluid_leak: Optional[bool] = None
    has_severe_headache: Optional[bool] = None
    has_visual_disturbances: Optional[bool] = None
    has_reduced_fetal_movement: Optional[bool] = None
    has_regular_contractions: Optional[bool] = None
    contraction_interval_minutes: Optional[int] = None
    fever_temp_f: Optional[float] = None

class SymptomLogRequest(BaseModel):
    symptom_name: str
    severity: int = Field(ge=1, le=10, description="1 to 10 visual analog scale")
    duration: str # "1 hour", "3 days", "ongoing"
    onset: str # "Sudden", "Gradual"
    frequency: str # "Constant", "Intermittent", "Every 8 mins"
    associated_symptoms: List[str] = []
    gestational_week: Optional[int] = 31
    notes: Optional[str] = None
    structured_follow_up: Optional[StructuredSymptomFollowUp] = None

class SymptomTriageResult(BaseModel):
    classification: str # "GREEN", "YELLOW", "RED"
    headline: str
    clinical_rationale: str
    action_guidance: str
    recommended_timeframe: str # "Immediate emergency evaluation", "Within 12-24 hours", "Routine self-monitoring"
    red_flags_detected: List[str]
    guideline_reference: str
    emergency_contacts_ready: bool

class FoodCheckRequest(BaseModel):
    food_name: str
    image_url: Optional[str] = None

class FoodCheckResponse(BaseModel):
    food_name: str
    status: str # "SAFE", "CAUTION", "AVOID", "ASK YOUR HEALTHCARE PROVIDER"
    summary: str
    scientific_rationale: str
    microbiological_risks: List[str] # e.g. "Listeria monocytogenes", "Toxoplasma gondii", "Methylmercury"
    safe_preparation_tips: List[str]
    sources: List[MedicalCitation]

class ReportExtractionResult(BaseModel):
    document_name: str
    document_type: str # "Ultrasound Biometry", "Prenatal Laboratory Panel", "Prescription", "Doctor Clinical Note"
    extracted_date: str
    gestational_week: int
    extracted_fields: Dict[str, Any]
    doctor_observations: List[str]
    flagged_values: List[str]
    confidence_score: float
    verification_message: str = "We extracted the following information. Please verify before saving."

class MedicationItem(BaseModel):
    id: str
    name: str
    dose: str
    frequency: str
    scheduled_times: List[str]
    prescribing_doctor: str
    start_date: str
    end_date: Optional[str] = None
    purpose: str
    refill_due: str
    taken_today: bool = False
    missed_yesterday: bool = False
    notes: Optional[str] = None

class AppointmentItem(BaseModel):
    id: str
    title: str
    doctor: str
    clinic: str
    date_time: str
    gestational_week: int
    type: str # "OB Visit", "Growth Ultrasound", "Non-Stress Test (NST)", "Lab Blood Draw"
    prep_notes: str
    completed: bool = False

class DoctorSummaryResponse(BaseModel):
    patient_name: str
    gestational_age: str
    due_date: str
    high_risk_flags: List[str]
    since_last_visit_period: str
    recent_symptoms_summary: List[Dict[str, Any]]
    medication_compliance_rate: str
    missed_doses: List[str]
    health_metrics_trends: Dict[str, str]
    recent_lab_scan_findings: List[str]
    recommended_questions_for_doctor: List[str]
    generated_at: str
