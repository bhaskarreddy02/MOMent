import React, { useState, useEffect } from 'react';
import {
  Heart, ShieldCheck, Sparkles, AlertTriangle, Stethoscope,
  PhoneCall, Baby, Calendar, Activity, Pill, Utensils, FileUp,
  BrainCircuit, CheckCircle2, ChevronRight, LayoutGrid, PanelRight
} from 'lucide-react';

import { PregnancyProfile, TimelineEvent, SymptomLog, MedicationItem, AppointmentItem } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { DashboardHero } from './components/DashboardHero';
import { NextAppointmentCard } from './components/NextAppointmentCard';
import { CareToolsSidebar } from './components/CareToolsSidebar';
import { HomeAiCompanion } from './components/HomeAiCompanion';
import { NotificationBar } from './components/NotificationBar';
import { QuickHealthEntryModal } from './components/QuickHealthEntryModal';

// Modals
import { AiChatModal } from './components/AiChatModal';
import { SymptomTriageModal } from './components/SymptomTriageModal';
import { EmergencyModal } from './components/EmergencyModal';
import { MedicationModal } from './components/MedicationModal';
import { ReportsTimelineModal } from './components/ReportsTimelineModal';
import { FoodSafetyModal } from './components/FoodSafetyModal';
import { HealthDataModal } from './components/HealthDataModal';
import { DoctorSummaryModal } from './components/DoctorSummaryModal';
import { WeekTimelineModal } from './components/WeekTimelineModal';
import { AiSettingsModal } from './components/AiSettingsModal';

export function App() {
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic health vitals state (for reminders and logging)
  const [steps, setSteps] = useState<number>(5842);
  const [sleepHours, setSleepHours] = useState<number>(5.8);
  const [isQuickHealthOpen, setIsQuickHealthOpen] = useState(false);
  const [quickHealthTab, setQuickHealthTab] = useState<'sleep' | 'steps'>('sleep');
  const alertBarRef = React.useRef<HTMLDivElement | null>(null);

  // Modal states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [isSymptomOpen, setIsSymptomOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isMedicationOpen, setIsMedicationOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isFoodOpen, setIsFoodOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isDoctorSummaryOpen, setIsDoctorSummaryOpen] = useState(false);
  const [isWeekTimelineOpen, setIsWeekTimelineOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContext();
      setProfile(data.profile);
      setTimeline(data.timeline_events);
      setSymptoms(data.recent_symptoms);
      setMedications(data.medications);
      setAppointments(data.appointments);
    } catch {
      // Handled in api fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = async () => {
    await api.resetData();
    await loadData();
    setSteps(5842);
    setSleepHours(5.8);
  };

  const handleOpenAiWithPrompt = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setIsAiOpen(true);
  };

  const handleToggleMedication = async (medId: string, currentStatus: boolean) => {
    setMedications(prev =>
      prev.map(m => (m.id === medId ? { ...m, taken_today: currentStatus } : m))
    );
  };

  const handleReportVerified = (newEvent: TimelineEvent) => {
    setTimeline(prev => [newEvent, ...prev]);
  };

  // Compute active clinical alerts count for notification badge
  const pendingMedsCount = medications.filter(m => !m.taken_today).length;
  const isSleepAlert = sleepHours === null || sleepHours < 7.0;
  const isStepsAlert = steps === null || steps < 5000;
  const activeAlertsCount = (pendingMedsCount > 0 ? 1 : 0) + (isSleepAlert ? 1 : 0) + (isStepsAlert ? 1 : 0);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-moment-500 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-stone-700">Loading your care context</p>
          <p className="text-xs text-stone-400 mt-1">Retrieving longitudinal memory...</p>
        </div>
      </div>
    );
  }

  const nextAppointment = appointments[0] || {
    id: "apt-1",
    title: "32-Week Routine OB Visit & BP Assessment",
    doctor: profile.ob_gyn_name,
    clinic: profile.clinic_name,
    date_time: "2026-12-16T10:30:00",
    gestational_week: 32,
    type: "OB Visit",
    prep_notes: "Bring home BP log, urine test record, and completed MOMENT Clinical Summary.",
    completed: false
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-rose-50 selection:text-stone-900">
      
      {/* Primary Sticky Header with aligned dates and no Demo Tour */}
      <Header
        profile={profile}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenDoctorSummary={() => setIsDoctorSummaryOpen(true)}
        onOpenAi={() => {
          setAiInitialPrompt(undefined);
          setIsAiOpen(true);
        }}
        onResetData={handleResetData}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        activeAlertsCount={activeAlertsCount}
        onScrollToAlerts={() => alertBarRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* ── DYNAMIC NOTIFICATION & REMINDER BAR ── */}
        <div ref={alertBarRef} className="scroll-mt-20">
          <NotificationBar
            medications={medications}
            steps={steps}
            sleepHours={sleepHours}
            onOpenMedications={() => setIsMedicationOpen(true)}
            onToggleMedication={handleToggleMedication}
            onOpenHealthEntry={(tab) => {
              setQuickHealthTab(tab || 'sleep');
              setIsQuickHealthOpen(true);
            }}
          />
        </div>

        {/* Longitudinal Continuity Banner */}
        <div className="flex items-center justify-between text-[12px] text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-continuity shrink-0" />
            <span>
              <span className="text-stone-700 font-medium">Continuity active</span>
              {' · '}{profile.user_name} · {profile.gestational_week}w {profile.gestational_days}d · Gestational HTN · Labetalol 100mg BID · {profile.ob_gyn_name}
            </span>
          </div>
          <button
            onClick={() => setIsDoctorSummaryOpen(true)}
            className="hidden sm:flex items-center gap-1 text-moment-500 hover:text-moment-600 font-medium transition-colors cursor-pointer"
          >
            <span>Pre-visit brief</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hero Section: Gestational Age & Today's Overview with Live Health Metrics */}
        <DashboardHero
          profile={profile}
          medications={medications}
          steps={steps}
          sleepHours={sleepHours}
          onOpenAi={() => {
            setAiInitialPrompt(undefined);
            setIsAiOpen(true);
          }}
          onOpenSymptomModal={() => setIsSymptomOpen(true)}
          onOpenMedications={() => setIsMedicationOpen(true)}
          onOpenHealthData={() => setIsHealthOpen(true)}
          onOpenWeekTimeline={() => setIsWeekTimelineOpen(true)}
          onOpenHealthEntry={(tab) => {
            setQuickHealthTab(tab || 'sleep');
            setIsQuickHealthOpen(true);
          }}
        />

        {/* Primary AI Personal Companion Console (Centerpiece of MOMENT) */}
        <HomeAiCompanion
          profile={profile}
          onOpenFullChat={(prompt) => {
            setAiInitialPrompt(prompt);
            setIsAiOpen(true);
          }}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        />

        {/* Next Appointment Card */}
        <NextAppointmentCard
          appointment={nextAppointment}
          onOpenDoctorSummary={() => setIsDoctorSummaryOpen(true)}
        />

        {/* Care Tools Section — Opens Slide-in Sidebar */}
        <section aria-label="Care Tools Trigger" className="bg-white border border-[#E8E2DA] rounded-xl p-5 hover:border-moment-300 transition-all shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-moment-50 border border-moment-100 flex items-center justify-center text-moment-600 shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-800">Care Tools & Health Services</h3>
                  <span className="text-[11px] font-medium text-moment-700 bg-moment-50 border border-moment-200 px-2 py-0.5 rounded-full">
                    8 tools
                  </span>
                  <span className="text-[11px] text-stone-400 hidden sm:inline">· Sidebar drawer</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  AI Companion, Symptoms & Triage, Medications, Week 31 Roadmap, Medical Reports, Wearables & SOS
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all shrink-0 cursor-pointer shadow-xs group"
            >
              <PanelRight className="w-3.5 h-3.5 text-moment-300" />
              <span>Open Care Tools</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 pb-12 border-t border-[#EDE8E2]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-stone-500 text-[12px]">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-500" />
              <span className="font-medium text-stone-600">MOMENT Clinical Evidence & Safety</span>
            </div>
            <p className="text-[11px] text-stone-400 max-w-xl leading-relaxed">
              MOMENT is an educational health companion. It is not a doctor, does not diagnose medical conditions, and does not alter prescriptions. For urgent complications, contact your obstetrician or hospital emergency triage immediately.
            </p>
          </div>
          <p className="mt-3 text-[10px] text-stone-300">MOMENT HealthTech Prototype · 31-Week Demonstration Scenario</p>
        </div>

      </main>

      {/* All Functional Modals */}
      <AiChatModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        profile={profile}
        onOpenEmergency={() => {
          setIsAiOpen(false);
          setIsEmergencyOpen(true);
        }}
        initialQuestion={aiInitialPrompt}
      />

      <SymptomTriageModal
        isOpen={isSymptomOpen}
        onClose={() => setIsSymptomOpen(false)}
        gestationalWeek={profile.gestational_week}
        onOpenEmergency={() => {
          setIsSymptomOpen(false);
          setIsEmergencyOpen(true);
        }}
        onSymptomLogged={loadData}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        profile={profile}
        onOpenDoctorSummary={() => {
          setIsEmergencyOpen(false);
          setIsDoctorSummaryOpen(true);
        }}
      />

      <MedicationModal
        isOpen={isMedicationOpen}
        onClose={() => setIsMedicationOpen(false)}
        medications={medications}
        onToggleMedication={handleToggleMedication}
        onOpenAiWithPrompt={handleOpenAiWithPrompt}
      />

      <ReportsTimelineModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        timeline={timeline}
        onReportVerified={handleReportVerified}
      />

      <FoodSafetyModal
        isOpen={isFoodOpen}
        onClose={() => setIsFoodOpen(false)}
      />

      <HealthDataModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />

      <DoctorSummaryModal
        isOpen={isDoctorSummaryOpen}
        onClose={() => setIsDoctorSummaryOpen(false)}
      />

      <WeekTimelineModal
        isOpen={isWeekTimelineOpen}
        onClose={() => setIsWeekTimelineOpen(false)}
        currentWeek={profile.gestational_week}
      />

      {/* Quick Health Entry Modal (for logging steps & sleep) */}
      <QuickHealthEntryModal
        isOpen={isQuickHealthOpen}
        onClose={() => setIsQuickHealthOpen(false)}
        initialTab={quickHealthTab}
        currentSteps={steps}
        currentSleep={sleepHours}
        onSave={(data) => {
          setSteps(data.steps);
          setSleepHours(data.sleepHours);
        }}
      />

      {/* Floating Care Tools Edge Tab Toggle */}
      <button
        onClick={() => setIsSidebarOpen(prev => !prev)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm border-y border-l border-[#E8E2DA] hover:border-moment-400 shadow-md hover:shadow-lg text-stone-700 hover:text-moment-600 px-2 py-4 rounded-l-xl flex flex-col items-center gap-2 group transition-all cursor-pointer"
        title="Toggle Care Tools Sidebar"
        aria-label="Toggle Care Tools Sidebar"
      >
        <LayoutGrid className="w-4 h-4 text-moment-500 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500 group-hover:text-stone-900 [writing-mode:vertical-rl]">
          Care Tools
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-moment-500"></span>
      </button>

      {/* Slide-in Care Tools Sidebar */}
      <CareToolsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        profile={profile}
        onOpenAi={() => {
          setAiInitialPrompt(undefined);
          setIsAiOpen(true);
        }}
        onOpenSymptomModal={() => setIsSymptomOpen(true)}
        onOpenMedications={() => setIsMedicationOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onOpenFoodChecker={() => setIsFoodOpen(true)}
        onOpenWeekTimeline={() => setIsWeekTimelineOpen(true)}
        onOpenHealthData={() => setIsHealthOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Google Gemini AI Engine Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

    </div>
  );
}
export default App;
