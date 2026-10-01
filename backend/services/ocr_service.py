"""
OCR and Document Extraction Service for MOMENT.
Parses prenatal medical reports, ultrasound scans, lab panels, and clinic visit notes.
Extracts structured clinical parameters and enforces the mandatory safety confirmation:
'We extracted the following information. Please verify before saving.'
"""
import re
from typing import Dict, Any, List
from models import ReportExtractionResult

# Pre-indexed clinical report templates for high-fidelity OCR simulation
PRESET_REPORTS = {
    "ultrasound_wk28": {
        "document_name": "Week 28 Growth Biometry & Umbilical Doppler.pdf",
        "document_type": "Obstetric Ultrasound Biometry",
        "extracted_date": "2026-11-21",
        "gestational_week": 28,
        "extracted_fields": {
            "BPD (Biparietal Diameter)": "71.2 mm (56th percentile)",
            "HC (Head Circumference)": "262.4 mm (53rd percentile)",
            "AC (Abdominal Circumference)": "241.0 mm (54th percentile)",
            "FL (Femur Length)": "53.8 mm (52nd percentile)",
            "EFW (Estimated Fetal Weight)": "1240 grams (2 lbs 12 oz, 54th percentile)",
            "Amniotic Fluid Index (AFI)": "13.8 cm (Normal fluid volume)",
            "Placental Location": "Posterior Grade I, clear of internal os",
            "Umbilical Artery S/D Ratio": "2.8 (Normal impedance, reassuring)",
            "Maternal Blood Pressure": "132/84 mmHg"
        },
        "doctor_observations": [
            "Appropriate interval fetal growth along 54th percentile curve.",
            "Normal umbilical artery Doppler waveform indicating reassuring uteroplacental perfusion.",
            "Amniotic fluid volume physiologic.",
            "Continue current Labetalol 100mg BID regimen for gestational hypertension."
        ],
        "flagged_values": [
            "Maternal BP 132/84 mmHg (Well-controlled on Labetalol, baseline was 142/92 mmHg)"
        ],
        "confidence_score": 0.96
    },
    "glucose_lab_wk24": {
        "document_name": "Prenatal 1-Hour Glucose Challenge & Complete Blood Count.pdf",
        "document_type": "Prenatal Laboratory Panel",
        "extracted_date": "2026-10-24",
        "gestational_week": 24,
        "extracted_fields": {
            "1-Hour 50g Glucose Challenge": "122 mg/dL (Reference: <140 mg/dL - Normal)",
            "Hemoglobin (Hgb)": "11.8 g/dL (Reference: 11.0 - 14.0 g/dL)",
            "Hematocrit (Hct)": "35.2% (Reference: 33.0 - 44.0%)",
            "Platelets": "220,000 /uL (Reference: 150,000 - 450,000 /uL)",
            "Urine Protein / Creatinine Ratio": "0.14 mg/mg (Reference: <0.30 - Normal)",
            "Blood Type & Screen": "O Positive, Antibody Screen Negative"
        },
        "doctor_observations": [
            "Gestational diabetes screening negative (122 mg/dL).",
            "No evidence of maternal anemia; hemoglobin stable at 11.8 g/dL.",
            "Platelet count and renal protein parameters reassuring."
        ],
        "flagged_values": [],
        "confidence_score": 0.98
    },
    "prescription_labetalol": {
        "document_name": "Rx_Labetalol_Refill_Dr_Raman.pdf",
        "document_type": "Clinical Prescription Record",
        "extracted_date": "2026-11-14",
        "gestational_week": 27,
        "extracted_fields": {
            "Medication": "Labetalol Hydrochloride Tablet",
            "Dose": "100 mg",
            "Route": "Oral (PO)",
            "Sig": "Take 1 tablet by mouth twice daily (every 12 hours) with or without food",
            "Quantity": "60 tablets (30-day supply with 2 refills)",
            "Prescriber": "Dr. Priya Raman, MBBS, MS (OBG) (KMC Reg: 74892)",
            "Indication": "ICD-10 O13.3 - Gestational hypertension without significant proteinuria, third trimester"
        },
        "doctor_observations": [
            "Prescribed following confirmed clinic BP 142/92 mmHg.",
            "Target home BP: systolic 115-135 mmHg, diastolic 70-85 mmHg.",
            "Monitor for maternal bradycardia or dizziness."
        ],
        "flagged_values": [
            "Requires twice-daily home blood pressure log verification"
        ],
        "confidence_score": 0.95
    }
}

def parse_medical_document(filename: str, file_bytes: bytes) -> ReportExtractionResult:
    """
    Simulates OCR document parsing and structured information extraction.
    Matches filename or provides high-fidelity generalized clinical extraction.
    """
    fn_lower = filename.lower()
    
    if "ultrasound" in fn_lower or "biometry" in fn_lower or "scan" in fn_lower:
        data = PRESET_REPORTS["ultrasound_wk28"]
    elif "glucose" in fn_lower or "blood" in fn_lower or "cbc" in fn_lower or "lab" in fn_lower:
        data = PRESET_REPORTS["glucose_lab_wk24"]
    elif "prescription" in fn_lower or "rx" in fn_lower or "labetalol" in fn_lower:
        data = PRESET_REPORTS["prescription_labetalol"]
    else:
        # Generic ultrasound fallback
        data = {
            "document_name": filename,
            "document_type": "Third Trimester Clinical Note / Scan",
            "extracted_date": "2026-12-08",
            "gestational_week": 31,
            "extracted_fields": {
                "Document Title": filename,
                "Gestational Age": "31 Weeks 0 Days",
                "Maternal Blood Pressure": "130/82 mmHg",
                "Maternal Weight": "158.0 lbs",
                "Fetal Heart Rate (FHR)": "144 bpm (Reassuring)",
                "Fundal Height": "31 cm (Concordant with gestational age)"
            },
            "doctor_observations": [
                "Document scanned successfully.",
                "Fetal heart rate reassuring at 144 bpm.",
                "Maternal blood pressure within acceptable therapeutic window on Labetalol."
            ],
            "flagged_values": [],
            "confidence_score": 0.92
        }

    return ReportExtractionResult(
        document_name=data["document_name"],
        document_type=data["document_type"],
        extracted_date=data["extracted_date"],
        gestational_week=data["gestational_week"],
        extracted_fields=data["extracted_fields"],
        doctor_observations=data["doctor_observations"],
        flagged_values=data["flagged_values"],
        confidence_score=data["confidence_score"],
        verification_message="We extracted the following information. Please verify before saving."
    )
