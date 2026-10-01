import React, { useState } from 'react';
import {
  X, Utensils, Search, ShieldCheck, AlertTriangle, CheckCircle2,
  AlertOctagon, Info, Sparkles, BookOpen, Camera, Upload
} from 'lucide-react';
import { FoodCheckResult } from '../types';
import { api } from '../services/api';

interface FoodSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodSafetyModal: React.FC<FoodSafetyModalProps> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodCheckResult | null>(null);

  const sampleFoods = [
    { name: 'Unripe Green Papaya', tag: 'AVOID', color: 'bg-red-100 text-red-800' },
    { name: 'Fresh Paneer (Cooked)', tag: 'SAFE', color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Tender Coconut Water', tag: 'SAFE', color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Street Pani Puri / Chaat', tag: 'AVOID', color: 'bg-red-100 text-red-800' },
    { name: 'Kesar / Saffron Milk', tag: 'SAFE (Pinch)', color: 'bg-blue-100 text-blue-800' },
    { name: 'Pineapple', tag: 'SAFE (Moderate)', color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Chai / Filter Coffee', tag: 'SAFE (<=200mg)', color: 'bg-blue-100 text-blue-800' },
    { name: 'Cooked Fish Curry', tag: 'SAFE', color: 'bg-emerald-100 text-emerald-800' }
  ];

  if (!isOpen) return null;

  const handleCheck = async (food: string) => {
    const text = food || query;
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const data = await api.checkFood(text);
      setResult(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-teal-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Pregnancy Food Safety Check</h3>
              <p className="text-xs text-slate-500">
                Grounded in FSSAI, ICMR, WHO & FOGSI Maternal Nutrition Guidelines
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

        {/* Body */}
        <div className="p-5 sm:p-6 bg-[#FCFAF8] flex-1 overflow-y-auto space-y-5">
          
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheck(query);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type any food: e.g. Brie, sushi, feta, hot dogs, oysters..."
                className="w-full bg-white border border-rose-200 focus:border-teal-500 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-teal-600/20 transition-all shrink-0"
            >
              {isLoading ? 'Checking...' : 'Check Safety'}
            </button>
          </form>

          {/* Quick Click Food Pills */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">Quick Check Common Foods:</span>
            <div className="flex flex-wrap gap-2">
              {sampleFoods.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(f.name);
                    handleCheck(f.name);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-300 text-xs font-semibold text-slate-800 flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <span>{f.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${f.color}`}>
                    {f.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Result Display */}
          {result && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Evaluated Food</span>
                  <h4 className="text-xl font-extrabold text-slate-900">{result.food_name}</h4>
                </div>

                <span
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                    result.status === 'SAFE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : result.status === 'CAUTION'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-clinical-red border border-red-300'
                  }`}
                >
                  {result.status === 'SAFE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {result.status === 'CAUTION' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {result.status === 'AVOID' && <AlertOctagon className="w-4 h-4 text-clinical-red" />}
                  <span>{result.status}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800">
                {result.summary}
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block uppercase tracking-wider">
                  Scientific Rationale:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {result.scientific_rationale}
                </p>
              </div>

              {result.microbiological_risks && result.microbiological_risks.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider">
                    Microbiological Pathogen Vectors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.microbiological_risks.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 font-semibold text-[11px]">
                        ⚠️ {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.safe_preparation_tips && result.safe_preparation_tips.length > 0 && (
                <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
                  <span className="font-bold text-teal-900 block">Preparation & Safety Rules:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-teal-800">
                    {result.safe_preparation_tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sources && result.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>Evidence: {result.sources[0].organization} ({result.sources[0].title})</span>
                  </span>
                  <span className="font-bold text-emerald-700">Tier 1 Authoritative</span>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
