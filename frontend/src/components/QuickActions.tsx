import React from 'react';
import {
  MessageSquareHeart, AlertCircle, Pill, FileUp, Utensils,
  CalendarDays, Activity, ShieldAlert, ChevronRight
} from 'lucide-react';

interface QuickActionsProps {
  onOpenAi: () => void;
  onOpenSymptomModal: () => void;
  onOpenMedications: () => void;
  onOpenReports: () => void;
  onOpenFoodChecker: () => void;
  onOpenWeekTimeline: () => void;
  onOpenHealthData: () => void;
  onOpenEmergency: () => void;
}

// A single tool row — clean, list-style, no icon backgrounds
const ToolRow: React.FC<{
  icon: React.ElementType;
  label: string;
  meta?: string;
  onClick: () => void;
  variant?: 'default' | 'emergency';
}> = ({ icon: Icon, label, meta, onClick, variant = 'default' }) => {
  const isEmergency = variant === 'emergency';

  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-150 ${
        isEmergency
          ? 'hover:bg-red-50'
          : 'hover:bg-[#FBF7F4]'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <Icon
          className={`w-4 h-4 shrink-0 ${isEmergency ? 'text-clinical-red' : 'text-stone-400 group-hover:text-moment-500'} transition-colors`}
        />
        <div className="min-w-0">
          <span className={`text-sm font-medium ${isEmergency ? 'text-clinical-red' : 'text-stone-800'}`}>
            {label}
          </span>
          {meta && (
            <span className={`block text-[12px] ${isEmergency ? 'text-red-500/70' : 'text-stone-400'} mt-0.5`}>
              {meta}
            </span>
          )}
        </div>
      </div>
      <ChevronRight
        className={`w-3.5 h-3.5 shrink-0 ${isEmergency ? 'text-clinical-red/50' : 'text-stone-300 group-hover:text-stone-400'} arrow-nudge`}
      />
    </button>
  );
};

// A grouped section with label and dividers between rows
const ToolGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <p className="px-4 py-2 text-[10px] font-semibold tracking-widest text-stone-400 uppercase">
      {label}
    </p>
    <div className="divide-y divide-[#F0EBE4]">
      {children}
    </div>
  </div>
);

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAi,
  onOpenSymptomModal,
  onOpenMedications,
  onOpenReports,
  onOpenFoodChecker,
  onOpenWeekTimeline,
  onOpenHealthData,
  onOpenEmergency
}) => {
  return (
    <div className="space-y-5">

      {/* Section heading */}
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-stone-800">Care tools</h2>
        <span className="text-[11px] text-stone-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-moment-400 animate-continuity inline-block" />
          Continuity active
        </span>
      </div>

      {/* Tools container — two columns on desktop, single on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Left column */}
        <div className="border border-[#E8E2DA] rounded-xl overflow-hidden bg-white divide-y divide-[#F0EBE4]">

          <ToolGroup label="Care">
            <ToolRow
              icon={MessageSquareHeart}
              label="Ask AI Companion"
              meta="Grounded in WHO, ACOG & NHS evidence"
              onClick={onOpenAi}
            />
            <ToolRow
              icon={AlertCircle}
              label="Symptoms & Triage"
              meta="Green · Yellow · Red safety protocol"
              onClick={onOpenSymptomModal}
            />
            <ToolRow
              icon={Pill}
              label="Medications"
              meta="2 of 2 taken today · Labetalol, Aspirin"
              onClick={onOpenMedications}
            />
          </ToolGroup>

          <ToolGroup label="Pregnancy">
            <ToolRow
              icon={CalendarDays}
              label="Week-by-Week Guide"
              meta="Week 31 milestones & roadmap"
              onClick={onOpenWeekTimeline}
            />
            <ToolRow
              icon={Utensils}
              label="Pregnancy Food Check"
              meta="Cheeses, sushi, seafood safety"
              onClick={onOpenFoodChecker}
            />
          </ToolGroup>

        </div>

        {/* Right column */}
        <div className="border border-[#E8E2DA] rounded-xl overflow-hidden bg-white divide-y divide-[#F0EBE4]">

          <ToolGroup label="Records & Health Data">
            <ToolRow
              icon={FileUp}
              label="Medical Reports"
              meta="OCR extraction with mandatory verification"
              onClick={onOpenReports}
            />
            <ToolRow
              icon={Activity}
              label="HealthKit & Wearable Data"
              meta="Sleep, steps, blood pressure, heart rate"
              onClick={onOpenHealthData}
            />
          </ToolGroup>

          {/* Emergency — visually separated, distinct but not screaming */}
          <div className="border-t border-[#F0EBE4]">
            <p className="px-4 py-2 text-[10px] font-semibold tracking-widest text-clinical-red/70 uppercase">
              Emergency
            </p>
            <div className="px-4 pb-4">
              <button
                onClick={onOpenEmergency}
                className="group w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-clinical-red shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-clinical-red block">Emergency Care SOS</span>
                    <span className="text-[12px] text-red-500/70">24/7 maternity triage · hospital finder</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-clinical-red/50 arrow-nudge shrink-0" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

