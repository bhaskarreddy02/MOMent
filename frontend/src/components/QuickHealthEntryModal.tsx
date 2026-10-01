import React, { useState } from 'react';
import {
  X, Moon, Footprints, Heart, CheckCircle2, Sparkles, Activity
} from 'lucide-react';

interface QuickHealthEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'sleep' | 'steps';
  currentSteps: number;
  currentSleep: number;
  onSave: (data: { steps: number; sleepHours: number }) => void;
}

export const QuickHealthEntryModal: React.FC<QuickHealthEntryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'sleep',
  currentSteps,
  currentSleep,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'sleep' | 'steps'>(initialTab);
  const [sleepHours, setSleepHours] = useState<number>(currentSleep || 7.5);
  const [steps, setSteps] = useState<number>(currentSteps || 6000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync initial tab when opened
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ steps, sleepHours });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-moment-500 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Quick Health & Vitals Log</h3>
              <p className="text-xs text-stone-500">Update daily sleep and step activity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('sleep')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'sleep'
                  ? 'bg-white text-indigo-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Log Sleep</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('steps')}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'steps'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Steps</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          
          {activeTab === 'sleep' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Third-Trimester Rest Target: 7.0–9.0 hrs
                </span>
                <p className="text-xs text-indigo-700">
                  Left-lateral lying positions improve inferior vena cava blood return and steady placental pressure.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Sleep Duration Last Night (Hours):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3.0"
                    max="11.0"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="w-16 text-center font-editorial text-2xl font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 py-1 rounded-xl">
                    {sleepHours}h
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-400 font-medium">Quick presets:</span>
                {[6.5, 7.5, 8.0, 9.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSleepHours(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      sleepHours === preset
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {preset}h
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Maternal Activity Goal: 7,000 steps / day
                </span>
                <p className="text-xs text-emerald-700">
                  Comfortable, moderate walking enhances cardiovascular compliance and alleviates dependent ankle edema.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Steps Logged Today:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="500"
                    max="20000"
                    step="250"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs font-bold text-stone-500 shrink-0">steps</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-400 font-medium">Quick presets:</span>
                {[4500, 6000, 7200, 8500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSteps(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      steps === preset
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={savedSuccess}
              className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>Logged Successfully! Updating Reminders...</span>
                </>
              ) : (
                <span>Save & Update Health Dashboard</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
