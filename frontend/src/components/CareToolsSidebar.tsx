import React, { useEffect } from 'react';
import {
  MessageSquareHeart, AlertCircle, Pill, FileUp, Utensils,
  CalendarDays, Activity, ShieldAlert, ChevronRight, X,
  LayoutGrid, Sparkles, ShieldCheck
} from 'lucide-react';
import { PregnancyProfile } from '../types';

interface CareToolsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: PregnancyProfile | null;
  onOpenAi: () => void;
  onOpenSymptomModal: () => void;
  onOpenMedications: () => void;
  onOpenReports: () => void;
  onOpenFoodChecker: () => void;
  onOpenWeekTimeline: () => void;
  onOpenHealthData: () => void;
  onOpenEmergency: () => void;
}

// Single tool row inside the sidebar
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
          className={`w-4 h-4 shrink-0 ${
            isEmergency ? 'text-clinical-red' : 'text-stone-400 group-hover:text-moment-500'
          } transition-colors`}
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
        className={`w-3.5 h-3.5 shrink-0 ${
          isEmergency ? 'text-clinical-red/50' : 'text-stone-300 group-hover:text-stone-400'
        } arrow-nudge`}
      />
    </button>
  );
};

// Group container with header label
const ToolGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="border border-[#E8E2DA] rounded-xl overflow-hidden bg-white">
    <p className="px-4 py-2.5 text-[10px] font-semibold tracking-widest text-stone-400 uppercase bg-[#FAF8F5] border-b border-[#F0EBE4]">
      {label}
    </p>
    <div className="divide-y divide-[#F0EBE4]">
      {children}
    </div>
  </div>
);

export const CareToolsSidebar: React.FC<CareToolsSidebarProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenAi,
  onOpenSymptomModal,
  onOpenMedications,
  onOpenReports,
  onOpenFoodChecker,
  onOpenWeekTimeline,
  onOpenHealthData,
  onOpenEmergency
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    onClose();
    callback();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FAF8F5] border-l border-[#E8E2DA] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Care Tools Sidebar"
        role="dialog"
        aria-modal="true"
      >
        {/* Sidebar Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E8E2DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-moment-50 border border-moment-100 flex items-center justify-center text-moment-600">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">Care Tools</h2>
                <span className="text-[10px] font-semibold text-moment-700 bg-moment-50 px-2 py-0.5 rounded-full border border-moment-200">
                  8 tools
                </span>
              </div>
              <p className="text-[12px] text-stone-400">Clinical & maternal health services</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close sidebar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Continuity Context Ribbon */}
        {profile && (
          <div className="px-6 py-2.5 bg-[#F6F3EE] border-b border-[#E8E2DA] flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-continuity shrink-0" />
              <span className="truncate">
                {profile.user_name} · Week {profile.gestational_week} + {profile.gestational_days}d
              </span>
            </div>
            <span className="text-stone-400 shrink-0 text-[10px] uppercase tracking-wider font-medium">
              Continuity active
            </span>
          </div>
        )}

        {/* Scrollable Tool Groups */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Group 1: Care */}
          <ToolGroup label="Care">
            <ToolRow
              icon={MessageSquareHeart}
              label="Ask AI Companion"
              meta="Grounded in WHO, FOGSI & ICMR evidence"
              onClick={() => handleAction(onOpenAi)}
            />
            <ToolRow
              icon={AlertCircle}
              label="Symptoms & Triage"
              meta="Green · Yellow · Red safety protocol"
              onClick={() => handleAction(onOpenSymptomModal)}
            />
            <ToolRow
              icon={Pill}
              label="Medications"
              meta="2 of 2 taken today · Labetalol, Aspirin"
              onClick={() => handleAction(onOpenMedications)}
            />
          </ToolGroup>

          {/* Group 2: Pregnancy */}
          <ToolGroup label="Pregnancy">
            <ToolRow
              icon={CalendarDays}
              label="Week-by-Week Guide"
              meta="Week 31 milestones & roadmap"
              onClick={() => handleAction(onOpenWeekTimeline)}
            />
            <ToolRow
              icon={Utensils}
              label="Pregnancy Food Check"
              meta="Papaya, paneer, street food, seafood safety"
              onClick={() => handleAction(onOpenFoodChecker)}
            />
          </ToolGroup>

          {/* Group 3: Records & Health Data */}
          <ToolGroup label="Records & Health Data">
            <ToolRow
              icon={FileUp}
              label="Medical Reports"
              meta="OCR extraction with mandatory verification"
              onClick={() => handleAction(onOpenReports)}
            />
            <ToolRow
              icon={Activity}
              label="HealthKit & Wearable Data"
              meta="Sleep, steps, blood pressure, heart rate"
              onClick={() => handleAction(onOpenHealthData)}
            />
          </ToolGroup>

          {/* Group 4: Emergency Care */}
          <div className="border border-red-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <p className="px-4 py-2 text-[10px] font-semibold tracking-widest text-clinical-red/80 uppercase bg-red-50/60 border-b border-red-100">
              Emergency
            </p>
            <div className="p-3">
              <button
                onClick={() => handleAction(onOpenEmergency)}
                className="group w-full flex items-center justify-between p-3.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100/80 transition-all duration-150 text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-clinical-red shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-clinical-red block">
                      Emergency Care SOS
                    </span>
                    <span className="text-[12px] text-red-600/70">
                      24/7 maternity triage · hospital finder
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-clinical-red/60 arrow-nudge shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-white border-t border-[#E8E2DA] flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-500" />
            <span>WHO, FOGSI & ICMR clinical guidelines</span>
          </div>
          <span className="text-[10px] text-stone-400">Esc to close</span>
        </div>

      </aside>
    </>
  );
};
