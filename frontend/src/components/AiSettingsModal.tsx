import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Key, CheckCircle2, AlertCircle, ExternalLink,
  ShieldCheck, Cpu, RefreshCw, Eye, EyeOff, Bot, ChevronDown, ChevronUp, Database, Activity
} from 'lucide-react';
import { api } from '../services/api';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [status, setStatus] = useState<{
    gemini_configured: boolean;
    masked_key: string;
    model: string;
    active_engine: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await api.getAiStatus();
      setStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setFeedback(null);
      setApiKey('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid Google Gemini API Key.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await api.saveGeminiKey(apiKey.trim());
      setFeedback({ type: 'success', message: result.message });
      setApiKey('');
      await fetchStatus();
      if (onKeyUpdated) onKeyUpdated();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to connect with this key.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E8E2DA] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FCFAF8] border-b border-[#F0EBE4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-moment-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 id="ai-settings-title" className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <span>AI Brain & Intelligence Engine</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Pre-Configured
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Active clinical neural reasoning engine for MOMENT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Active Engine Card */}
          <div className="p-4 rounded-xl border bg-emerald-50/70 border-emerald-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white shadow-2xs">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>{status?.active_engine || 'Google Gemini Live Neural Engine'}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Model: <code className="font-mono text-stone-700 bg-white/80 px-1 py-0.5 rounded border border-stone-200">{status?.model || 'gemini-3.5-flash'}</code>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-100/80 text-emerald-800 border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Live & Ready</span>
              </span>
            </div>

            <p className="text-xs text-stone-700 mt-3 pt-3 border-t border-emerald-200/60 leading-relaxed">
              MOMENT is running with live Google Gemini intelligence connected on the backend. It synthesizes Ananya's longitudinal pregnancy records, medication schedules, and clinical evidence in real time.
            </p>
          </div>

          {/* Core Engine Features Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                <Database className="w-3.5 h-3.5 text-moment-500" />
                <span>RAG Evidence</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">WHO, FOGSI, ICMR, and ACOG Practice Bulletins.</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                <Activity className="w-3.5 h-3.5 text-sage-600" />
                <span>Safety Triage</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Deterministic Red/Yellow/Green clinical guardrails.</p>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Optional Collapsible API Key Override */}
          <div className="pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setShowOverrideForm(!showOverrideForm)}
              className="flex items-center justify-between w-full text-xs font-semibold text-stone-600 hover:text-stone-900 py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-stone-400" />
                <span>Custom API Key Override (Optional)</span>
              </span>
              {showOverrideForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOverrideForm && (
              <form onSubmit={handleSaveKey} className="space-y-3 mt-3 animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter custom Gemini key (optional)..."
                    className="w-full pl-9 pr-10 py-2 text-xs font-mono bg-stone-50 border border-[#E8E2DA] rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-moment-500/20 focus:border-moment-500 transition-all text-stone-900 placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-moment-600 hover:text-moment-700 text-[11px] font-medium inline-flex items-center gap-1"
                  >
                    <span>Get Free Key (Google AI Studio)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="submit"
                    disabled={isLoading || !apiKey.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-moment-500 hover:bg-moment-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Save Override</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
