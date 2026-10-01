import React, { useState } from 'react';
import {
  Bell, AlertTriangle, Pill, Moon, Footprints, Check, ChevronRight,
  ChevronLeft, X, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { MedicationItem } from '../types';

export interface AlertItem {
  id: string;
  type: 'medication' | 'sleep' | 'steps';
  severity: 'high' | 'medium' | 'info';
  title: string;
  message: string;
  actionText: string;
  onAction: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

interface NotificationBarProps {
  medications: MedicationItem[];
  steps: number | null;
  sleepHours: number | null;
  onOpenMedications: () => void;
  onToggleMedication: (medId: string, currentStatus: boolean) => void;
  onOpenHealthEntry: (initialTab?: 'sleep' | 'steps') => void;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  medications,
  steps,
  sleepHours,
  onOpenMedications,
  onToggleMedication,
  onOpenHealthEntry
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute active alerts based on patient data
  const alerts: AlertItem[] = [];

  // 1. Medication logic: check for pending prescribed doses
  const pendingMeds = medications.filter(m => !m.taken_today);
  if (pendingMeds.length > 0) {
    const med = pendingMeds[0];
    alerts.push({
      id: `med-${med.id}`,
      type: 'medication',
      severity: 'high',
      title: `Medication Pending: ${med.name} ${med.dose}`,
      message: `${med.name} (${med.frequency}) is scheduled for today and has not been marked as taken. Consistency is essential for blood pressure control.`,
      actionText: 'Mark Taken',
      onAction: () => onToggleMedication(med.id, true),
      secondaryActionText: 'View Schedule',
      onSecondaryAction: onOpenMedications
    });
  }

  // 2. Sleep logic: check if entered or below third-trimester target (7.0h)
  if (sleepHours === null || sleepHours === 0) {
    alerts.push({
      id: 'sleep-missing',
      type: 'sleep',
      severity: 'medium',
      title: 'Sleep Data Missing for Last Night',
      message: 'You have not entered sleep for last night. Regular rest tracking helps identify gestational fatigue and preeclampsia risk.',
      actionText: 'Enter Sleep',
      onAction: () => onOpenHealthEntry('sleep')
    });
  } else if (sleepHours < 7.0) {
    alerts.push({
      id: 'sleep-low',
      type: 'sleep',
      severity: 'medium',
      title: `Low Sleep Logged (${sleepHours} hrs)`,
      message: `You recorded only ${sleepHours}h of sleep. Third-trimester guidelines recommend 7–9 hours of left-lateral rest for optimal placental perfusion.`,
      actionText: 'Update Sleep',
      onAction: () => onOpenHealthEntry('sleep')
    });
  }

  // 3. Step count logic: check if entered or below gentle walking target (5,000 steps)
  if (steps === null || steps === 0) {
    alerts.push({
      id: 'steps-missing',
      type: 'steps',
      severity: 'info',
      title: 'Daily Activity Not Recorded',
      message: 'No step activity logged today. Tracking daily movement helps prevent dependent venous pooling in your ankles.',
      actionText: 'Enter Steps',
      onAction: () => onOpenHealthEntry('steps')
    });
  } else if (steps < 5000) {
    alerts.push({
      id: 'steps-low',
      type: 'steps',
      severity: 'info',
      title: `Activity Nudge (${steps.toLocaleString()} / 7,000 steps)`,
      message: `You are at ${steps.toLocaleString()} steps today. A gentle 15-minute evening stroll helps circulation and alleviates ankle swelling.`,
      actionText: 'Log Walk / Steps',
      onAction: () => onOpenHealthEntry('steps')
    });
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(a => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) {
    return null;
  }

  // Ensure index in bounds
  const currentIndex = Math.min(activeAlertIndex, visibleAlerts.length - 1);
  const currentAlert = visibleAlerts[currentIndex];

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    if (currentIndex >= visibleAlerts.length - 1) {
      setActiveAlertIndex(Math.max(0, visibleAlerts.length - 2));
    }
  };

  const getAlertStyles = (type: string, severity: string) => {
    if (severity === 'high' || type === 'medication') {
      return {
        bg: 'bg-gradient-to-r from-rose-50 via-[#FFF8F6] to-amber-50',
        border: 'border-rose-200',
        iconBg: 'bg-rose-500 text-white',
        titleColor: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
        icon: <Pill className="w-4 h-4" />
      };
    }
    if (type === 'sleep') {
      return {
        bg: 'bg-gradient-to-r from-indigo-50/80 via-[#F8F9FE] to-blue-50/60',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-600 text-white',
        titleColor: 'text-indigo-950',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        icon: <Moon className="w-4 h-4" />
      };
    }
    // Steps / Activity
    return {
      bg: 'bg-gradient-to-r from-emerald-50/80 via-[#F7FCF9] to-teal-50/60',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      titleColor: 'text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: <Footprints className="w-4 h-4" />
    };
  };

  const style = getAlertStyles(currentAlert.type, currentAlert.severity);

  return (
    <div className="w-full transition-all duration-300">
      <div className={`relative rounded-2xl border ${style.border} ${style.bg} p-3.5 sm:p-4 shadow-xs`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Left: Icon, Badge, Text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0`}>
              {style.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}>
                  {currentAlert.type === 'medication' ? 'Prescription Care' : currentAlert.type === 'sleep' ? 'Sleep & Recovery' : 'Maternal Movement'}
                </span>
                
                {visibleAlerts.length > 1 && (
                  <span className="text-[11px] font-semibold text-stone-500">
                    Alert {currentIndex + 1} of {visibleAlerts.length}
                  </span>
                )}
              </div>

              <h4 className={`text-sm font-bold ${style.titleColor} tracking-tight`}>
                {currentAlert.title}
              </h4>
              
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentAlert.message}
              </p>
            </div>
          </div>

          {/* Right: Actions & Carousel Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            
            {/* Carousel navigation if multiple alerts */}
            {visibleAlerts.length > 1 && (
              <div className="flex items-center gap-1 mr-1 bg-white/70 p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => setActiveAlertIndex((prev) => (prev > 0 ? prev - 1 : visibleAlerts.length - 1))}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                  title="Previous alert"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveAlertIndex((prev) => (prev < visibleAlerts.length - 1 ? prev + 1 : 0))}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                  title="Next alert"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Secondary Action */}
            {currentAlert.secondaryActionText && currentAlert.onSecondaryAction && (
              <button
                onClick={currentAlert.onSecondaryAction}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-all cursor-pointer"
              >
                {currentAlert.secondaryActionText}
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={currentAlert.onAction}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${style.btnBg} transition-all shadow-xs flex items-center gap-1.5 cursor-pointer`}
            >
              {currentAlert.type === 'medication' ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{currentAlert.actionText}</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(currentAlert.id)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors cursor-pointer"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Multi-alert indicator dots at bottom */}
        {visibleAlerts.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-black/5">
            {visibleAlerts.map((a, idx) => (
              <button
                key={a.id}
                onClick={() => setActiveAlertIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-5 bg-stone-800' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                }`}
                title={`Go to alert ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
