"""
Google Gemini AI Integration Service for MOMENT.
Enables real LLM neural thinking, longitudinal clinical reasoning, and evidence grounding.
"""
import os
import re
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(ENV_PATH)

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
MODELS_TO_TRY = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.7-flash", "gemini-3.8-flash"]

def get_gemini_api_key() -> str:
    # First check process environment
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    # Check .env directly
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH, override=True)
        return os.environ.get("GEMINI_API_KEY", "").strip()
    return ""

def set_gemini_api_key(api_key: str) -> bool:
    clean_key = api_key.strip()
    os.environ["GEMINI_API_KEY"] = clean_key
    
    # Persist into .env file
    try:
        content = ""
        if os.path.exists(ENV_PATH):
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                content = f.read()
        
        if "GEMINI_API_KEY=" in content:
            new_content = re.sub(r"GEMINI_API_KEY=.*", f"GEMINI_API_KEY={clean_key}", content)
        else:
            new_content = content + f"\nGEMINI_API_KEY={clean_key}\n"
            
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    except Exception as e:
        print(f"Error persisting GEMINI_API_KEY: {e}")
        return False

def test_gemini_connection(api_key: Optional[str] = None) -> Dict[str, Any]:
    key = (api_key or get_gemini_api_key()).strip()
    if not key:
        return {"success": False, "error": "No Gemini API key provided."}
    
    payload = {
        "contents": [
            {
                "parts": [{"text": "Hello, please confirm you are ready in 3 words."}]
            }
        ]
    }
    
    last_error = ""
    with httpx.Client(timeout=10.0) as client:
        for model in MODELS_TO_TRY:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            try:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return {"success": True, "model": model, "reply": reply}
                else:
                    err_json = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                    last_error = err_json.get("error", {}).get("message", resp.text)
            except Exception as e:
                last_error = str(e)
    
    return {"success": False, "error": f"Gemini API connection error: {last_error}"}

def clean_clinical_text(text: str) -> str:
    """Ensure responses are medium-length, formal, humanly precise, and free of markdown header clutter."""
    if not text:
        return ""
    # 1. Remove all hashtag markdown headers (#, ##, ###)
    text = re.sub(r'^\s*#{1,6}\s*', '', text, flags=re.MULTILINE)
    # 2. Remove horizontal rule lines
    text = re.sub(r'---+', '', text)
    # 3. Un-bold entire sentences: **This is a whole sentence.** -> This is a whole sentence.
    text = re.sub(r'\*\*([^*]+?\.)\*\*', r'\1', text)
    # 4. Remove bolding around long phrases (> 3 words)
    def clean_bold(match):
        inner = match.group(1).strip()
        if len(inner.split()) > 3:
            return inner
        return f"**{inner}**"
    text = re.sub(r'\*\*([^*]+?)\*\*', clean_bold, text)
    # 5. Clean up any trailing broken headers or orphan asterisks
    text = re.sub(r'#+\s*$', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def generate_with_gemini(
    question: str,
    context: Dict[str, Any],
    rag_docs: List[Dict[str, Any]],
    safety_eval: Any
) -> Optional[str]:
    key = get_gemini_api_key()
    if not key:
        return None
    
    profile = context.get("profile", {})
    user_name = profile.get("user_name") or profile.get("patient_name") or "Ananya Sharma"
    gestational_age = f"Week {profile.get('gestational_week', 31)} + {profile.get('gestational_days', 2)} Days"
    conditions = ", ".join(profile.get("relevant_conditions", ["Mild Gestational Hypertension"]))
    medications = ", ".join(profile.get("current_medications", ["Labetalol 100mg PO BID", "Low-Dose Aspirin 75mg PO Daily"]))
    ob_name = profile.get("ob_gyn_name", "Dr. Priya Raman, MS (OBG), FICOG")
    clinic = profile.get("clinic_name", "Cloudnine Clinic - Indiranagar, Bengaluru")
    hospital = profile.get("hospital_name", "Cloudnine Hospital - Old Airport Road, Bengaluru")
    hosp_phone = profile.get("hospital_triage_phone", "+91 80 4969 4969")
    
    # Format retrieved RAG evidence
    evidence_snippets = []
    for idx, item in enumerate(rag_docs, 1):
        doc = item.get("doc", {})
        evidence_snippets.append(
            f"[Source {idx}: {doc.get('organization', 'Clinical Body')} - {doc.get('title', '')}]\n"
            f"Content: {doc.get('content', '')}"
        )
    evidence_text = "\n\n".join(evidence_snippets) if evidence_snippets else "Standard FOGSI and ICMR antenatal care protocols."

    system_instruction = (
        "You are MOMENT, an expert, evidence-grounded AI Pregnancy Companion with longitudinal continuity memory, "
        "specifically localized for Indian maternal antenatal care.\n\n"
        f"PATIENT CONTEXT (Continuity Memory):\n"
        f"- Patient: {user_name} (29 yrs, G1P0, First Pregnancy)\n"
        f"- Gestational Age: {gestational_age} (Due Dec 12, 2026, Third Trimester)\n"
        f"- Known Conditions: {conditions}\n"
        f"- Current Prescriptions: {medications}\n"
        f"- Supervising Obstetrician: {ob_name} at {clinic}\n"
        f"- Saved Emergency Hospital: {hospital} (24/7 Triage: {hosp_phone}, Emergency: 112 / 108)\n"
        f"- Recent Vitals: Home BP 130/82 mmHg (Well-controlled)\n"
        f"- Fetal Status: ~1.5 kg, active sleep-wake cycles\n\n"
        f"OFFICIAL CLINICAL GUIDELINES RETRIEVED (FOGSI, ICMR, WHO, ACOG):\n"
        f"{evidence_text}\n\n"
        "RESPONSE LENGTH, TONE & FORMATTING RULES (STRICT):\n"
        "1. MEDIUM LENGTH: Formulate a medium-length, precise clinical answer (between 120 and 180 words, 2 to 3 concise paragraphs). Avoid long-winded essays, over-explanation, or repetitive sub-lists.\n"
        "2. FORMAL, HUMANLY PRECISE TONE: Speak with the warm, reassuring, yet formal and scientifically precise voice of an experienced obstetrician speaking directly with Ananya. Be clear, calm, and grounded.\n"
        "3. NO HASHTAG HEADERS (#): Absolutely DO NOT use hashtag headers (#, ##, ###, ####) anywhere in your response.\n"
        "4. MINIMAL BOLDING (**): Do NOT bold entire sentences or overuse asterisks. Avoid bolding consecutive words. Use bolding sparingly, at most on a specific medicine name or single vital figure if necessary.\n"
        "5. CLEAN NATURAL TEXT: Use clear paragraphs. If listing actionable steps, use simple hyphen bullets (- ) with plain text.\n"
        "6. STRICT SAFETY: If asked whether to alter, stop, or increase medication doses (like Labetalol or Aspirin), clearly explain that titration must be done in-person by Dr. Priya Raman. If symptoms suggest preterm contractions (regular contractions <= 10 min) or severe preeclampsia features (severe headache with visual disturbance), advise left-lateral rest and urgent evaluation at Cloudnine Triage or calling 112/108."
    )

    prompt = f"USER'S QUESTION: {question}\n\nPlease formulate a formal, humanly precise, medium-length response without hashtag headers or excessive bolding."

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.28,
            "maxOutputTokens": 600
        }
    }

    with httpx.Client(timeout=12.0) as client:
        for model in MODELS_TO_TRY:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            try:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "").strip()
                            return clean_clinical_text(raw_text)
                else:
                    print(f"Gemini {model} returned HTTP {resp.status_code}, trying next model...")
                    continue
            except Exception as e:
                print(f"Gemini generation exception with {model}: {e}, trying next model...")
                continue
    return None
