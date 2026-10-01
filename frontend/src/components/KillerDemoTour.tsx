import React from 'react';
import {
  Sparkles, ChevronRight, ChevronLeft, X, Play, ShieldAlert,
  BrainCircuit, Stethoscope, Heart, Pill, Utensils, Activity, FileText
} from 'lucide-react';

export interface TourStep {
  step: number;
  title: string;
  badge: string;
  description: string;
  actionLabel: string;
  execute: () => void;
}

interface KillerDemoTourProps {
  currentStepIndex: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onCloseTour: () => void;
  steps: TourStep[];
}

export const KillerDemoTour: React.FC<KillerDemoTourProps> = ({
  currentStepIndex,
  onNextStep,
  onPrevStep,
  onCloseTour,
  steps
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-amber-400/80 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 mr-0.5" />
              <span>Judge Evaluation Tour</span>
            </span>
            <span className="font-bold text-amber-300">
              Step {currentStep.step} of {steps.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              3-5 Min Primary Demo Flow
            </span>
            <button
              onClick={onCloseTour}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close demo tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-base sm:text-lg font-extrabold text-white">
                {currentStep.title}
              </h4>
              <span className="px-2 py-0.2 rounded-md bg-white/10 text-amber-200 text-[11px] font-bold">
                {currentStep.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-snug max-w-xl">
              {currentStep.description}
            </p>
          </div>

          {/* Action Navigation */}
          <div className="flex items-center space-x-2 shrink-0">
            {!isFirst && (
              <button
                onClick={onPrevStep}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={currentStep.execute}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 flex items-center space-x-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{currentStep.actionLabel}</span>
            </button>

            {!isLast && (
              <button
                onClick={onNextStep}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Dots */}
        <div className="flex items-center justify-center space-x-1.5 pt-3 mt-3 border-t border-slate-800">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-amber-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
