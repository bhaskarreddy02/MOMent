import React from 'react';
import {
  Heart, ShieldCheck, Sparkles, RefreshCw, Stethoscope, PhoneCall,
  LayoutGrid, Bell
} from 'lucide-react';
import { PregnancyProfile } from '../types';

interface HeaderProps {
  profile: PregnancyProfile;
  onOpenEmergency: () => void;
  onOpenDoctorSummary: () => void;
  onOpenAi: () => void;
  onResetData: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenAiSettings?: () => void;
  activeAlertsCount?: number;
  onScrollToAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenEmergency,
  onOpenDoctorSummary,
  onResetData,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenAiSettings,
  activeAlertsCount = 0,
  onScrollToAlerts
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-moment-500 flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-lg tracking-tight text-stone-900">MOMENT</span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-sage-600 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" />
              Evidence-grounded
            </span>
          </div>
        </div>

        {/* Patient context — center: Cleanly aligned with no text wrapping */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-600 whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-moment-500 animate-pulse shrink-0"></span>
          <span className="font-semibold text-stone-900 whitespace-nowrap">{profile.user_name}</span>
          <span className="text-stone-300">·</span>
          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium whitespace-nowrap border border-stone-200/60">
            Week {profile.gestational_week} + {profile.gestational_days}d
          </span>
          <span className="text-stone-300">·</span>
          <span className="font-medium text-stone-700 whitespace-nowrap">
            Due Dec 12, 2026
          </span>
          <span className="hidden lg:inline text-stone-300">·</span>
          <span className="hidden lg:inline text-stone-500 truncate max-w-[20ch] whitespace-nowrap" title={profile.ob_gyn_name}>
            {profile.ob_gyn_name}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Active Alerts Nudge (if any) */}
          {activeAlertsCount > 0 && onScrollToAlerts && (
            <button
              onClick={onScrollToAlerts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300 hover:bg-amber-200 transition-all shadow-2xs cursor-pointer"
              title={`${activeAlertsCount} pending health alerts`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
              <span>{activeAlertsCount} {activeAlertsCount === 1 ? 'Alert' : 'Alerts'}</span>
            </button>
          )}

          {/* Care Tools Sidebar Toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-moment-500 text-white shadow-xs'
                  : 'text-stone-700 bg-stone-100 border border-stone-200 hover:bg-stone-200'
              }`}
              title="Toggle Care Tools Sidebar"
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isSidebarOpen ? 'text-white' : 'text-moment-500'}`} />
              <span className="font-semibold">Care Tools</span>
            </button>
          )}

          {/* AI Brain / Settings */}
          {onOpenAiSettings && (
            <button
              onClick={onOpenAiSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-moment-700 bg-moment-50 border border-moment-200 hover:bg-moment-100 transition-all shadow-2xs cursor-pointer"
              title="Configure Google Gemini Live Thinking"
            >
              <Sparkles className="w-3.5 h-3.5 text-moment-500" />
              <span className="hidden sm:inline">AI Brain</span>
            </button>
          )}

          {/* Doctor Summary */}
          <button
            onClick={onOpenDoctorSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-all cursor-pointer"
            title="Generate clinical summary for your doctor"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Doctor Summary</span>
          </button>

          {/* Emergency SOS — visually distinct, live map enabled */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-clinical-red hover:bg-red-800 transition-all shadow-xs cursor-pointer"
            title="Emergency obstetric care & live hospital map triage"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency SOS</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Reset demo data to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
