import React, { useState } from 'react';
import {
  X, Pill, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  Calendar, Stethoscope, RefreshCw, Plus, Check, AlertCircle
} from 'lucide-react';
import { MedicationItem } from '../types';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: MedicationItem[];
  onToggleMedication: (medId: string, currentStatus: boolean) => void;
  onOpenAiWithPrompt: (prompt: string) => void;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  medications,
  onToggleMedication,
  onOpenAiWithPrompt
}) => {
  const [activeMeds, setActiveMeds] = useState<MedicationItem[]>(medications);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setActiveMeds(prev =>
      prev.map(m => (m.id === id ? { ...m, taken_today: !m.taken_today } : m))
    );
    const item = activeMeds.find(m => m.id === id);
    if (item) {
      onToggleMedication(id, !item.taken_today);
    }
  };

  const takenCount = activeMeds.filter(m => m.taken_today).length;
  const adherenceRate = Math.round((takenCount / activeMeds.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Clinician-Prescribed Medications</h3>
              <p className="text-xs text-slate-500">
                Adherence Tracker & Refill Countdown • Supervised by Dr. Priya Raman
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Adherence & Safety Overview */}
        <div className="p-5 sm:p-6 bg-[#FCFAF8] flex-1 overflow-y-auto space-y-5">
          
          {/* Strict Safety Banner (Section 11) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block mb-0.5">Clinical Safety Principle:</span>
              <span>
                MOMENT cannot independently prescribe medications or alter dosages. Never stop or change blood pressure medications without direct authorization from your obstetrician.
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAiWithPrompt("Should I increase my Labetalol dose because my BP was 134/84?");
                }}
                className="mt-2 block text-moment-700 font-bold hover:underline"
              >
                ⚡ Test AI Guardrail: "Should I increase my dose?" &rarr;
              </button>
            </div>
          </div>

          {/* Today's Compliance Meter */}
          <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Today's Schedule</span>
              <span className="text-lg font-extrabold text-slate-900">
                {takenCount} of {activeMeds.length} Doses Logged
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">14-Day Adherence</span>
              <span className="text-lg font-extrabold text-emerald-600">94%</span>
            </div>
          </div>

          {/* Medication Cards List */}
          <div className="space-y-3">
            {activeMeds.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border transition-all ${
                  med.taken_today
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-rose-100 shadow-soft hover:shadow-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-slate-900 text-base">{med.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-moment-700">
                        {med.dose}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Indication: {med.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-moment-500" />
                        <span>Times: {med.scheduled_times.join(', ')} ({med.frequency})</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>{med.prescribing_doctor}</span>
                      </span>
                    </div>

                    <div className="pt-1 text-[11px] font-semibold text-amber-700 flex items-center space-x-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>Refill status: {med.refill_due}</span>
                    </div>
                  </div>

                  {/* Taken Status Checkbox */}
                  <button
                    onClick={() => handleToggle(med.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      med.taken_today
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {med.taken_today ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Taken Today</span>
                      </>
                    ) : (
                      <span>Mark Taken</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Need a prescription refill? Contact Dr. Priya Raman's clinic at +91 80 4969 4400.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
