export interface PregnancyProfile {
  user_name: string;
  gestational_week: number;
  gestational_days: number;
  due_date: string;
  trimester: number;
  gravidity_parity: string;
  maternal_age: number;
  blood_type: string;
  pre_pregnancy_bmi: number;
  current_weight_lbs: number;
  total_weight_gain_lbs: number;
  relevant_conditions: string[];
  allergies: string[];
  current_medications: string[];
  ob_gyn_name: string;
  clinic_name: string;
  hospital_name: string;
  hospital_triage_phone: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface MedicalCitation {
  source_tier: string;
  organization: string;
  title: string;
  date: string;
  url: string;
  topic: string;
  relevance_snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  safety_level?: 'GREEN' | 'YELLOW' | 'RED';
  urgency_flag?: boolean;
  remembered_context_used?: string[];
  sources?: MedicalCitation[];
  escalation_pathway?: string | null;
}

export interface SymptomLog {
  id: string;
  symptom_name: string;
  severity: number;
  duration: string;
  onset: string;
  frequency: string;
  associated_symptoms: string[];
  gestational_week: number;
  logged_date: string;
  triage_classification: 'GREEN' | 'YELLOW' | 'RED';
  notes?: string;
}

export interface SymptomTriageResult {
  classification: 'GREEN' | 'YELLOW' | 'RED';
  headline: string;
  clinical_rationale: string;
  action_guidance: string;
  recommended_timeframe: string;
  red_flags_detected: string[];
  guideline_reference: string;
  emergency_contacts_ready: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  scheduled_times: string[];
  prescribing_doctor: string;
  start_date: string;
  purpose: string;
  refill_due: string;
  taken_today: boolean;
  missed_yesterday: boolean;
  notes?: string;
}

export interface TimelineEvent {
  week: number;
  date: string;
  type: string;
  title: string;
  details: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  is_saved_hospital: boolean;
  level: string;
  distance_miles: number;
  address: string;
  phone: string;
  triage_phone: string;
  triage_24_7: boolean;
  coordinates: { lat: number; lng: number };
  status: string;
}

export interface FoodCheckResult {
  food_name: string;
  status: 'SAFE' | 'CAUTION' | 'AVOID' | 'ASK YOUR HEALTHCARE PROVIDER';
  summary: string;
  scientific_rationale: string;
  microbiological_risks: string[];
  safe_preparation_tips: string[];
  sources: MedicalCitation[];
}

export interface ReportExtractionResult {
  document_name: string;
  document_type: string;
  extracted_date: string;
  gestational_week: number;
  extracted_fields: Record<string, string>;
  doctor_observations: string[];
  flagged_values: string[];
  confidence_score: number;
  verification_message: string;
}

export interface DoctorSummary {
  patient_name: string;
  gestational_age: string;
  due_date: string;
  high_risk_flags: string[];
  since_last_visit_period: string;
  recent_symptoms_summary: Array<{
    symptom: string;
    severity: string;
    frequency: string;
    onset: string;
    triage: string;
    notes: string;
  }>;
  medication_compliance_rate: string;
  missed_doses: string[];
  health_metrics_trends: Record<string, string>;
  recent_lab_scan_findings: string[];
  recommended_questions_for_doctor: string[];
  generated_at: string;
}

export interface AppointmentItem {
  id: string;
  title: string;
  doctor: string;
  clinic: string;
  date_time: string;
  gestational_week: number;
  type: string;
  prep_notes: string;
  completed: boolean;
}
