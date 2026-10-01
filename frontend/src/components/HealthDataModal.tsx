import React, { useState, useEffect } from 'react';
import {
  X, Activity, Moon, Footprints, Heart, Scale, ShieldCheck,
  CheckCircle2, RefreshCw, Smartphone, TrendingUp, Info
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import { api } from '../services/api';

interface HealthDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthDataModal: React.FC<HealthDataModalProps> = ({
  isOpen,
  onClose
}) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [activeMetric, setActiveMetric] = useState<'sleep' | 'steps' | 'heart' | 'bp'>('sleep');

  useEffect(() => {
    if (isOpen) {
      api.getHealthMetrics().then(setHealthData);
    }
  }, [isOpen]);

  if (!isOpen || !healthData) return null;

  const { today_summary, seven_day_trends, clinical_observations } = healthData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-blue-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-lg">Wearable & HealthKit Integration</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <Smartphone className="w-3 h-3 text-emerald-600 mr-0.5" />
                  <span>Synced Live</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {healthData.device_source}
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 bg-[#FCFAF8] flex-1 overflow-y-auto space-y-6">
          
          {/* Metrics Switcher Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <button
              onClick={() => setActiveMetric('sleep')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                activeMetric === 'sleep'
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-indigo-600 mb-1">
                <span className="text-xs font-semibold">Sleep Duration</span>
                <Moon className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">{today_summary.sleep_duration}</div>
              <div className="text-[11px] text-amber-700 font-medium">Mild fragmentation</div>
            </button>

            <button
              onClick={() => setActiveMetric('steps')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                activeMetric === 'steps'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-xs font-semibold">Daily Steps</span>
                <Footprints className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">{today_summary.steps.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-700 font-medium">83% of daily target</div>
            </button>

            <button
              onClick={() => setActiveMetric('heart')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                activeMetric === 'heart'
                  ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-rose-600 mb-1">
                <span className="text-xs font-semibold">Resting HR</span>
                <Heart className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">{today_summary.resting_heart_rate} bpm</div>
              <div className="text-[11px] text-slate-500 font-medium">Baseline: {today_summary.hr_baseline}</div>
            </button>

            <button
              onClick={() => setActiveMetric('bp')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                activeMetric === 'bp'
                  ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-teal-600 mb-1">
                <span className="text-xs font-semibold">Home BP Trend</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-lg font-extrabold text-slate-900">130 / 82 mmHg</div>
              <div className="text-[11px] text-teal-700 font-medium">Therapeutic Target</div>
            </button>

          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {activeMetric === 'sleep' && '7-Day Sleep Duration & Awake Intervals'}
                  {activeMetric === 'steps' && '7-Day Maternal Physical Activity (Steps)'}
                  {activeMetric === 'heart' && 'Resting Heart Rate (Gestational Expansion)'}
                  {activeMetric === 'bp' && 'Twice-Daily Blood Pressure Surveillance on Labetalol'}
                </h4>
                <p className="text-xs text-slate-500">
                  Third-trimester physiological baseline tracking
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetric === 'sleep' ? (
                  <AreaChart data={seven_day_trends}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="short_date" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[4, 9]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sleep_hours" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#sleepGrad)" name="Hours Slept" />
                  </AreaChart>
                ) : activeMetric === 'steps' ? (
                  <BarChart data={seven_day_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="short_date" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[0, 8000]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#10B981" radius={[8, 8, 0, 0]} name="Step Count" />
                  </BarChart>
                ) : activeMetric === 'heart' ? (
                  <LineChart data={seven_day_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="short_date" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[70, 90]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="resting_hr" stroke="#E11D48" strokeWidth={3} dot={{ r: 4 }} name="Resting BPM" />
                  </LineChart>
                ) : (
                  <LineChart data={seven_day_trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="short_date" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[70, 150]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bp_systolic" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} name="Systolic (mmHg)" />
                    <Line type="monotone" dataKey="bp_diastolic" stroke="#0284C7" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Diastolic (mmHg)" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinical Correlation & Observational Insights (Section 12) */}
          <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <Info className="w-4 h-4 text-moment-600" />
              <span>Physiological Observations (Not Medical Diagnoses):</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {clinical_observations.map((obs: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-moment-500 font-bold">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
