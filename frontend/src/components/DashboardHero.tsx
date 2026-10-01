import React from 'react';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { PregnancyProfile, MedicationItem } from '../types';

interface DashboardHeroProps {
  profile: PregnancyProfile;
  medications?: MedicationItem[];
  steps?: number;
  sleepHours?: number;
  onOpenAi: () => void;
  onOpenSymptomModal: () => void;
  onOpenMedications: () => void;
  onOpenHealthData: () => void;
  onOpenWeekTimeline: () => void;
  onOpenHealthEntry?: (tab?: 'sleep' | 'steps') => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  profile,
  medications = [],
  steps = 5842,
  sleepHours = 5.8,
  onOpenSymptomModal,
  onOpenMedications,
  onOpenHealthData,
  onOpenWeekTimeline,
  onOpenHealthEntry
}) => {
  const percentComplete = Math.round((profile.gestational_week / 40) * 100);
  const daysRemaining = 62;

  const totalMeds = medications.length || 3;
  const takenMeds = medications.filter(m => m.taken_today).length;
  const allMedsTaken = totalMeds > 0 && takenMeds === totalMeds;

  const trimesterLabel = profile.trimester === 3
    ? 'Third Trimester'
    : profile.trimester === 2
    ? 'Second Trimester'
    : 'First Trimester';

  return (
    <div className="space-y-8">

      {/* ── Pregnancy Overview ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 items-start">

        {/* Primary: gestational overview — editorial, type-led */}
        <div className="lg:col-span-2 space-y-5">
          {/* Trimester label */}
          <p className="text-[11px] font-semibold tracking-widest text-moment-500 uppercase">
            {trimesterLabel} · Week {profile.gestational_week}
          </p>

          {/* Hero number */}
          <div>
            <h1 className="font-editorial text-[3.25rem] sm:text-[4rem] font-semibold leading-none tracking-tighter text-stone-900">
              {profile.gestational_week}
              <span className="text-[2rem] sm:text-[2.5rem] font-normal text-moment-500 ml-2">wks</span>
              <span className="text-[1.75rem] sm:text-[2rem] font-normal text-stone-400 ml-1.5">+ {profile.gestational_days}d</span>
            </h1>
            <p className="mt-2 text-sm text-stone-500 font-normal">
              Due <span className="text-stone-700 font-medium">December 12, 2026</span>
              <span className="text-stone-300 mx-2">·</span>
              <span className="text-stone-600">{daysRemaining} days remaining</span>
            </p>
          </div>

          {/* Progress — minimal, single line */}
          <div className="max-w-sm">
            <div className="flex justify-between text-[11px] text-stone-400 font-medium mb-1.5">
              <span>Conception</span>
              <span className="text-moment-600 font-semibold">{percentComplete}%</span>
              <span>Full term · 40w</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-moment-400 rounded-full transition-all duration-1000"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary: baby development — calm card */}
        <div
          onClick={onOpenWeekTimeline}
          className="group mt-6 lg:mt-0 border border-[#E8E2DA] rounded-2xl p-5 cursor-pointer hover:border-moment-300 hover:bg-[#FDF9F7] transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase mb-1">Baby this week</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-stone-800">Coconut</span>
                <span className="text-xl">🥥</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-moment-400 arrow-nudge transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-100 text-sm">
            <div>
              <p className="text-[11px] text-stone-400 mb-0.5">Weight</p>
              <p className="font-semibold text-stone-700">~1.5 kg <span className="text-xs font-normal text-stone-400">(3.3 lbs)</span></p>
            </div>
            <div>
              <p className="text-[11px] text-stone-400 mb-0.5">Length</p>
              <p className="font-semibold text-stone-700">~41 cm <span className="text-xs font-normal text-stone-400">(16.2 in)</span></p>
            </div>
          </div>

          <p className="text-[12px] text-stone-500 mt-3 leading-relaxed">
            Active REM brain wave development. Surfactant production accelerating in the lungs.
          </p>

          <p className="text-[11px] text-moment-500 font-medium mt-3 flex items-center gap-1">
            <span>Week-by-week guide</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────── */}
      <div className="h-px bg-[#EDE8E2]" />

      {/* ── Today's Health ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-base font-semibold text-stone-800">Today's health</h2>
          <button
            onClick={onOpenHealthData}
            className="text-[12px] text-moment-500 font-medium hover:text-moment-600 flex items-center gap-0.5 transition-colors"
          >
            View trends <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Health grid — editorial, not card-heavy */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#E8E2DA] rounded-xl overflow-hidden">

          {/* Sleep */}
          <button
            onClick={() => onOpenHealthEntry ? onOpenHealthEntry('sleep') : onOpenHealthData()}
            className="p-4 sm:p-5 text-left border-r border-b sm:border-b-0 border-[#EDE8E2] hover:bg-[#FBF7F4] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Sleep</p>
              <span className="text-[10px] text-moment-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Log</span>
            </div>
            <p className="text-xl font-semibold text-stone-800 leading-none mb-1">
              {sleepHours ? `${sleepHours}h` : 'Not entered'}
            </p>
            <p className={`text-xs font-medium ${sleepHours >= 7.0 ? 'text-sage-600' : 'text-amber-600'}`}>
              {sleepHours >= 7.0 ? 'Optimal · Restful' : sleepHours > 0 ? 'Below 7h · Log rest' : 'Tap to enter'}
            </p>
          </button>

          {/* Activity */}
          <button
            onClick={() => onOpenHealthEntry ? onOpenHealthEntry('steps') : onOpenHealthData()}
            className="p-4 sm:p-5 text-left border-b sm:border-b-0 sm:border-r border-[#EDE8E2] hover:bg-[#FBF7F4] transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Activity</p>
              <span className="text-[10px] text-moment-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Log</span>
            </div>
            <p className="text-xl font-semibold text-stone-800 leading-none mb-1">
              {steps ? steps.toLocaleString() : 'Not entered'}
            </p>
            <p className={`text-xs font-medium ${steps >= 5000 ? 'text-sage-600' : 'text-amber-600'}`}>
              {steps ? `${Math.round((steps / 7000) * 100)}% of 7k target` : 'Tap to enter'}
            </p>
          </button>

          {/* Medications */}
          <button
            onClick={onOpenMedications}
            className="p-4 sm:p-5 text-left border-r border-[#EDE8E2] hover:bg-[#FBF7F4] transition-colors cursor-pointer"
          >
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-2">Medications</p>
            <p className="text-xl font-semibold text-stone-800 leading-none mb-1">{takenMeds} / {totalMeds}</p>
            <p className={`text-xs font-medium ${allMedsTaken ? 'text-sage-600' : 'text-rose-600'}`}>
              {allMedsTaken ? 'All taken today' : `${totalMeds - takenMeds} pending today`}
            </p>
          </button>

          {/* Blood Pressure */}
          <button
            onClick={onOpenHealthData}
            className="p-4 sm:p-5 text-left hover:bg-[#FBF7F4] transition-colors cursor-pointer"
          >
            <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-2">Blood pressure</p>
            <p className="text-xl font-semibold text-stone-800 leading-none mb-1">130 / 82</p>
            <p className="text-xs text-sage-600 font-medium">Controlled on Labetalol</p>
          </button>
        </div>

        {/* Symptom notice — below the grid, inline */}
        <button
          onClick={onOpenSymptomModal}
          className="group mt-3 w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#EDE8E2] hover:border-amber-200 hover:bg-amber-50/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-medium text-stone-700">Recent symptom: </span>
              <span className="text-sm text-stone-600">Frontal headache · Mild</span>
            </div>
          </div>
          <span className="text-[12px] text-stone-400 group-hover:text-amber-600 flex items-center gap-1 transition-colors font-medium">
            Log or review <ChevronRight className="w-3 h-3 arrow-nudge" />
          </span>
        </button>
      </div>

    </div>
  );
};

