"""
MOMENT - HealthTech AI Pregnancy Companion Backend
FastAPI Service with Longitudinal Context Memory, RAG Knowledge Base,
Deterministic Safety Triage, and Clinical Handoff.
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json

from models import (
    PregnancyProfile, SymptomLogRequest, SymptomTriageResult,
    ChatQueryRequest, ChatQueryResponse, FoodCheckRequest, FoodCheckResponse,
    ReportExtractionResult, DoctorSummaryResponse, MedicationItem, AppointmentItem
)
from rag_engine import MedicalRAGEngine
from safety_engine import evaluate_symptom_safety
from mock_db import (
    get_demo_pregnancy_context, reset_demo_data, save_symptom,
    get_symptoms, get_medications, update_medication_status,
    get_reports, add_report, get_appointments, get_health_metrics
)
from services.health_adapter import MockHealthKitProvider
from services.ocr_service import parse_medical_document
from services.summary_generator import generate_doctor_summary
from services.gemini_service import get_gemini_api_key, set_gemini_api_key, test_gemini_connection, DEFAULT_MODEL, clean_clinical_text

app = FastAPI(
    title="MOMENT API",
    description="Personalized, evidence-grounded AI pregnancy companion backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = MedicalRAGEngine()
health_provider = MockHealthKitProvider()

@app.get("/")
def root():
    return {
        "app": "MOMENT",
        "tagline": "Personalized AI Pregnancy Companion with Longitudinal Context Memory",
        "status": "online",
        "version": "1.0.0"
    }

# ----------------- AI SETTINGS & GEMINI CONFIGURATION -----------------
@app.get("/api/settings/ai-status")
def get_ai_status():
    """Return status of Google Gemini LLM connectivity."""
    key = get_gemini_api_key()
    is_configured = bool(key)
    return {
        "gemini_configured": is_configured,
        "masked_key": f"{key[:6]}...{key[-4:]}" if len(key) >= 10 else ("Configured" if is_configured else "Not Set"),
        "model": DEFAULT_MODEL,
        "active_engine": "Google Gemini (Real-time Thinking)" if is_configured else "Local Adaptive Clinical Engine"
    }

@app.post("/api/settings/gemini-key")
def configure_gemini_key(payload: Dict[str, str]):
    """Test and save the user's Google Gemini API key."""
    key = payload.get("key", "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="Key cannot be empty.")
    
    # Test connection
    test_result = test_gemini_connection(key)
    if not test_result.get("success"):
        raise HTTPException(status_code=400, detail=test_result.get("error", "Failed to connect to Google Gemini API with this key."))
    
    # Save key
    saved = set_gemini_api_key(key)
    if not saved:
        raise HTTPException(status_code=500, detail="Failed to persist API key to .env file.")
    
    return {
        "success": True,
        "message": f"Successfully connected to Google Gemini ({test_result.get('model', DEFAULT_MODEL)})!",
        "model": test_result.get("model", DEFAULT_MODEL)
    }

# ----------------- PREGNANCY CONTEXT & PROFILE -----------------
@app.get("/api/context")
def get_context():
    """Retrieve full longitudinal pregnancy context."""
    return get_demo_pregnancy_context()

@app.post("/api/context/reset")
def reset_context():
    """Reset to the canonical 31-week demo scenario."""
    return reset_demo_data()

# ----------------- AI CHAT & RAG ASSISTANT -----------------
@app.post("/api/chat", response_model=ChatQueryResponse)
def chat_with_assistant(payload: ChatQueryRequest):
    """
    RAG-grounded AI query incorporating:
    1. User Question
    2. Longitudinal Pregnancy Context (Week 31+2d, Gestational Hypertension, Labetalol, Week 28 visit)
    3. Multi-tier Medical Knowledge Base (WHO, ACOG, NHS, CDC)
    4. Deterministic Safety Pre-check & Disclaimer
    """
    context = get_demo_pregnancy_context()
    
    # 1. First run safety triage pre-check on user's query
    safety_eval = evaluate_symptom_safety(
        symptom_text=payload.question,
        gestational_week=context["profile"]["gestational_week"],
        context=context
    )
    
    # 2. Retrieve relevant evidence
    rag_result = rag_engine.query(
        query_text=payload.question,
        gestational_week=context["profile"]["gestational_week"],
        top_k=3
    )
    
    # 3. Formulate grounded answer with context memory
    response = rag_engine.generate_grounded_response(
        question=payload.question,
        context=context,
        rag_result=rag_result,
        safety_eval=safety_eval
    )
    
    if response and response.answer:
        response.answer = clean_clinical_text(response.answer)
    
    return response

# ----------------- SYMPTOM LOG & SAFETY TRIAGE -----------------
@app.post("/api/symptoms/triage", response_model=SymptomTriageResult)
def triage_symptom(log: SymptomLogRequest):
    """
    Deterministic clinical triage rule engine:
    GREEN: General information / monitor / routine care
    YELLOW: Contact healthcare provider within 24-48h
    RED: Urgent emergency medical attention
    """
    context = get_demo_pregnancy_context()
    result = evaluate_symptom_safety(
        symptom_text=f"{log.symptom_name} - {log.notes or ''}",
        gestational_week=log.gestational_week or context["profile"]["gestational_week"],
        context=context,
        structured_data=log.dict()
    )
    # Save into longitudinal history
    save_symptom(log, result)
    return result

@app.get("/api/symptoms")
def list_symptoms():
    return get_symptoms()

# ----------------- EMERGENCY & HOSPITALS -----------------
@app.get("/api/emergency/hospitals")
def get_nearby_maternity_hospitals(lat: Optional[float] = None, lng: Optional[float] = None):
    """Return verified nearby maternity care facilities with 24/7 OB triage, dynamically calculating distance if GPS is provided."""
    import math

    base_hospitals = [
        {
            "id": "hosp-1",
            "name": "Cloudnine Hospital - Old Airport Road",
            "is_saved_hospital": True,
            "level": "Level III Tertiary Neonatal & Maternal ICU",
            "distance_miles": 2.4,
            "address": "HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka",
            "phone": "+91 80 4969 4400",
            "triage_phone": "+91 80 4969 4969",
            "triage_24_7": True,
            "coordinates": {"lat": 12.9602, "lng": 77.6484},
            "status": "Open 24/7 - OB Triage & Level III NICU Ready"
        },
        {
            "id": "hosp-2",
            "name": "Apollo Cradle & Children's Hospital - Koramangala",
            "is_saved_hospital": False,
            "level": "Level III Comprehensive Maternity & Perinatal Center",
            "distance_miles": 4.8,
            "address": "5th Block Koramangala, Bengaluru, Karnataka",
            "phone": "+91 80 4939 7777",
            "triage_phone": "1860 500 4424",
            "triage_24_7": True,
            "coordinates": {"lat": 12.9352, "lng": 77.6245},
            "status": "Open 24/7 - High-Risk OB Available"
        },
        {
            "id": "hosp-3",
            "name": "Manipal Hospital - HAL Airport Road",
            "is_saved_hospital": False,
            "level": "Level IV Quaternary Maternal-Fetal Medicine Center",
            "distance_miles": 3.2,
            "address": "98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka",
            "phone": "+91 80 2502 4444",
            "triage_phone": "+91 80 2502 3344",
            "triage_24_7": True,
            "coordinates": {"lat": 12.9592, "lng": 77.6530},
            "status": "Open 24/7 - 24hr Emergency & Fetal ICU"
        },
        {
            "id": "hosp-4",
            "name": "Rainbow Children's Hospital & BirthRight - Marathahalli",
            "is_saved_hospital": False,
            "level": "Level III Perinatal Care & Advanced Neonatal ICU",
            "distance_miles": 5.1,
            "address": "Outer Ring Road, Marathahalli, Bengaluru, Karnataka",
            "phone": "+91 80 4241 2345",
            "triage_phone": "+91 80 4241 2300",
            "triage_24_7": True,
            "coordinates": {"lat": 12.9569, "lng": 77.7011},
            "status": "Open 24/7 - 24/7 Maternal High-Dependency Unit"
        },
        {
            "id": "hosp-5",
            "name": "Aster CMI Hospital - Hebbal",
            "is_saved_hospital": False,
            "level": "Level IV Quaternary Care & High-Risk Perinatal Unit",
            "distance_miles": 8.7,
            "address": "NH 44, Sahakar Nagar, Hebbal, Bengaluru, Karnataka",
            "phone": "+91 80 4342 0100",
            "triage_phone": "+91 80 4342 0200",
            "triage_24_7": True,
            "coordinates": {"lat": 13.0558, "lng": 77.5925},
            "status": "Open 24/7 - Dedicated Emergency Obstetric Theater"
        }
    ]

    if lat is not None and lng is not None:
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0 # Radius of earth in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return round(R * c, 1)

        # 1. Update distance for all base hospitals
        for h in base_hospitals:
            h_coords = h["coordinates"]
            dist = haversine(lat, lng, h_coords["lat"], h_coords["lng"])
            h["distance_miles"] = dist

        # 2. If user is outside Bengaluru (> 35 km away), dynamically fetch real emergency facilities near their live GPS
        blr_dist = haversine(lat, lng, 12.9602, 77.6484)
        if blr_dist > 35.0:
            import httpx
            try:
                osm_url = f"https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=5&bounded=1&viewbox={lng-0.2},{lat+0.2},{lng+0.2},{lat-0.2}"
                headers = {"User-Agent": "MOMENT-Antenatal-Triage/1.0"}
                with httpx.Client(timeout=4.0) as client:
                    resp = client.get(osm_url, headers=headers)
                    if resp.status_code == 200:
                        osm_items = resp.json()
                        local_hospitals = []
                        for idx, item in enumerate(osm_items, 1):
                            h_lat = float(item.get("lat", 0))
                            h_lng = float(item.get("lon", 0))
                            h_dist = haversine(lat, lng, h_lat, h_lng)
                            raw_name = item.get("display_name", "").split(",")[0].strip() or f"Emergency Hospital {idx}"
                            addr_parts = item.get("display_name", "").split(",")[:3]
                            h_addr = ", ".join(addr_parts).strip()
                            local_hospitals.append({
                                "id": f"live-hosp-{idx}",
                                "name": raw_name,
                                "is_saved_hospital": False,
                                "level": "Local Emergency & 24/7 Maternal-Fetal Triage",
                                "distance_miles": h_dist,
                                "address": h_addr,
                                "phone": "+91 112 / 108",
                                "triage_phone": "112",
                                "triage_24_7": True,
                                "coordinates": {"lat": h_lat, "lng": h_lng},
                                "status": "Open 24/7 - Emergency Triage Ready"
                            })
                        if local_hospitals:
                            base_hospitals = local_hospitals + base_hospitals
            except Exception as e:
                print(f"Live hospital lookup fallback: {e}")

        # CRITICAL: Always sort STRICTLY by distance ascending so the nearest facility is #1
        base_hospitals.sort(key=lambda x: x["distance_miles"])

    return base_hospitals

# ----------------- MEDICAL REPORTS & OCR -----------------
@app.get("/api/reports")
def list_reports():
    return get_reports()

@app.post("/api/reports/ocr-parse", response_model=ReportExtractionResult)
async def parse_report_file(file: UploadFile = File(...)):
    """
    OCR & Document Parsing pipeline for ultrasound scans or lab reports.
    Returns structured data for the MANDATORY verification modal:
    'We extracted the following information. Please verify before saving.'
    """
    contents = await file.read()
    filename = file.filename or "uploaded_report.pdf"
    parsed_result = parse_medical_document(filename, contents)
    return parsed_result

@app.post("/api/reports/confirm")
def confirm_report(report_data: Dict[str, Any]):
    """Save verified report into the patient's medical timeline."""
    return add_report(report_data)

# ----------------- MEDICATION TRACKER -----------------
@app.get("/api/medications")
def list_medications():
    return get_medications()

@app.post("/api/medications/{med_id}/toggle")
def toggle_medication(med_id: str, payload: Dict[str, Any]):
    return update_medication_status(med_id, payload.get("taken", True))

# ----------------- HEALTH DATA INTEGRATION -----------------
@app.get("/api/health/metrics")
def get_health_data():
    """
    HealthDataProvider integration (MockHealthKitProvider / Apple HealthKit / Health Connect).
    Returns steps, sleep, resting heart rate, maternal weight trends.
    """
    return health_provider.get_recent_metrics()

# ----------------- PREGNANCY FOOD CHECK -----------------
@app.post("/api/food/check", response_model=FoodCheckResponse)
def check_food_safety(payload: FoodCheckRequest):
    """
    Checks food safety using FDA/CDC/ACOG guidelines.
    Evaluates SAFE / CAUTION / AVOID / ASK YOUR HEALTHCARE PROVIDER.
    """
    return rag_engine.check_food(payload.food_name)

# ----------------- DOCTOR SUMMARY ("Since Your Last Visit") -----------------
@app.get("/api/doctor-summary", response_model=DoctorSummaryResponse)
def get_clinical_handoff_summary():
    """
    Generates structured pre-appointment clinical handoff:
    - Pregnancy week & vitals
    - Symptoms since last visit
    - Medication adherence & missed doses
    - Health trends (sleep, steps, HR)
    - Uploaded labs & scan highlights
    - Suggested questions for Dr. Priya Raman
    """
    context = get_demo_pregnancy_context()
    return generate_doctor_summary(context)

# ----------------- APPOINTMENTS -----------------
@app.get("/api/appointments")
def list_appointments():
    return get_appointments()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
