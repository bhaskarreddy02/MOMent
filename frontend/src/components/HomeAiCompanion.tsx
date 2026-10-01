import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Bot, ShieldCheck, ChevronRight, AlertCircle,
  ExternalLink, CornerDownLeft, RefreshCw, MessageSquareHeart,
  Heart, ArrowRight, PhoneCall, Maximize2
} from 'lucide-react';
import { PregnancyProfile, MedicalCitation } from '../types';
import { api } from '../services/api';
import { renderFormattedClinicalText } from '../utils/formatClinicalText';

interface HomeAiCompanionProps {
  profile: PregnancyProfile;
  onOpenFullChat: (prompt?: string) => void;
  onOpenEmergency: () => void;
  onOpenAiSettings?: () => void;
}

interface InlineMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  safetyLevel?: string;
  sources?: MedicalCitation[];
  memoryTags?: string[];
}

export const HomeAiCompanion: React.FC<HomeAiCompanionProps> = ({
  profile,
  onOpenFullChat,
  onOpenEmergency,
  onOpenAiSettings
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<InlineMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste ${profile.user_name.split(' ')[0]}! I'm your MOMENT personal care companion. At 31 weeks and 2 days, your baby is developing rapid eye movement (REM) sleep cycles and practicing breathing motions (~1.5 kg). I'm actively monitoring your mild gestational hypertension context—your home BP was steady today (130/82 mmHg) and your evening Labetalol is on track. How are you feeling right now?`,
      timestamp: 'Today',
      safetyLevel: 'GREEN',
      memoryTags: [
        'Week 31 + 2d Context',
        'Gestational HTN Active',
        'Labetalol 100mg BID Logged'
      ],
      sources: [
        {
          source_tier: 'TIER 1 (Authoritative)',
          organization: 'FOGSI & WHO',
          title: 'Antenatal Care Guidelines for Third Trimester Health',
          date: '2023 Update',
          url: 'https://www.fogsi.org',
          topic: 'Third Trimester Surveillance',
          relevance_snippet: 'Routine monitoring of fetal movements, maternal blood pressure, and symptom awareness in week 31.'
        }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  const contextualPrompts = [
    {
      icon: '🩺',
      label: 'Pelvic pressure query',
      prompt: "I'm having mild lower pelvic pressure when walking this evening. Is this normal at 31 weeks?"
    },
    {
      icon: '👶',
      label: 'Fetal kick counts',
      prompt: "How many fetal kicks or movements should I count after dinner today?"
    },
    {
      icon: '🥗',
      label: 'Coconut water & paneer',
      prompt: "Are tender coconut water and fresh cooked paneer safe daily in the third trimester?"
    },
    {
      icon: '💊',
      label: 'Aspirin schedule',
      prompt: "Should I take my prescribed 75mg Aspirin before or after dinner?"
    }
  ];

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: InlineMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };

    setConversation(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.askAi(textToSend);
      const assistantMessage: InlineMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: 'Just now',
        safetyLevel: response.safety_level,
        sources: response.sources,
        memoryTags: response.remembered_context_used
      };
      setConversation(prev => [...prev, assistantMessage]);
    } catch {
      const fallbackMessage: InlineMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "I'm reviewing your clinical context against FOGSI & WHO pregnancy guidelines. If you have sudden severe pain, contractions, or fluid loss, please contact Dr. Priya Raman or call 112 / 108 immediately.",
        timestamp: 'Just now',
        safetyLevel: 'YELLOW'
      };
      setConversation(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section aria-label="MOMENT AI Companion" className="space-y-4">
      {/* Container Card */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
        
        {/* Header Bar: Status & Continuity */}
        <div className="px-5 py-4 bg-[#FCFAF8] border-b border-[#F0EBE4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-moment-500 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900">MOMENT AI Personal Companion</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-moment-700 bg-moment-50 px-2 py-0.5 rounded-full border border-moment-200">
                  Care Agent
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-continuity shrink-0" />
                <span>Continuity connected · {profile.user_name} (Wk {profile.gestational_week} + {profile.gestational_days}d) · {profile.ob_gyn_name.split(',')[0]}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiSettings && (
              <button
                onClick={onOpenAiSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-moment-700 bg-moment-50 border border-moment-200 hover:bg-moment-100 transition-colors shadow-2xs cursor-pointer"
                title="Configure Google Gemini Live Thinking Key"
              >
                <Sparkles className="w-3.5 h-3.5 text-moment-500" />
                <span>AI Engine</span>
              </button>
            )}

            <button
              onClick={() => onOpenFullChat()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white border border-[#E8E2DA] hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
              title="Expand conversation to full screen view"
            >
              <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Full Screen Chat</span>
            </button>
          </div>
        </div>

        {/* Conversation Stream (Clean, elegant, non-cluttered) */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[380px] overflow-y-auto bg-white divide-y divide-[#F6F3EE]">
          {conversation.map((msg) => (
            <div key={msg.id} className="pt-4 first:pt-0 space-y-3">
              
              {/* Message Header */}
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                  {msg.sender === 'assistant' ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-moment-500" />
                      <span>MOMENT Companion</span>
                    </>
                  ) : (
                    <span>{profile.user_name.split(' ')[0]}</span>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Text */}
              {msg.sender === 'assistant' ? (
                <div className="text-sm sm:text-[14.5px] leading-relaxed text-stone-800 font-normal">
                  {renderFormattedClinicalText(msg.text)}
                </div>
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line text-stone-900 bg-[#FBF7F4] border border-[#F0EBE4] p-3 rounded-xl">
                  {msg.text}
                </div>
              )}

              {/* Emergency Banner if Red Flag */}
              {msg.safetyLevel === 'RED' && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-clinical-red">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-semibold">
                      Urgent obstetric warning sign detected. Do not delay physical evaluation.
                    </span>
                  </div>
                  <button
                    onClick={onOpenEmergency}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-clinical-red hover:bg-red-800 transition-colors shrink-0 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Open Emergency Hub</span>
                  </button>
                </div>
              )}

              {/* Longitudinal Memory Tags Used */}
              {msg.memoryTags && msg.memoryTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                    Memory recalled:
                  </span>
                  {msg.memoryTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Clinical Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1 font-medium text-sage-700 bg-sage-50 border border-sage-200 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-sage-600" />
                    {msg.sources[0].organization} Evidence
                  </span>
                  <span className="text-stone-400 truncate max-w-md">
                    {msg.sources[0].title}
                  </span>
                </div>
              )}

            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="pt-3 flex items-center gap-2 text-xs text-stone-400 animate-pulse">
              <Sparkles className="w-4 h-4 text-moment-500 animate-spin" />
              <span>Consulting FOGSI, ICMR & longitudinal clinical memory...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Contextual Quick Prompt Chips */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#F0EBE4] overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {contextualPrompts.map((cp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(cp.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white border border-[#E8E2DA] hover:border-moment-300 hover:text-moment-700 hover:bg-[#FDF9F7] transition-all shrink-0 cursor-pointer shadow-2xs"
            >
              <span>{cp.icon}</span>
              <span>{cp.label}</span>
            </button>
          ))}
        </div>

        {/* Active Input Console */}
        <div className="p-4 bg-white border-t border-[#E8E2DA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask your companion about symptoms, kicks, Labetalol, Indian diet..."
              className="flex-1 bg-[#FAF8F5] border border-[#E8E2DA] rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-moment-400 focus:border-moment-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-xs"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};
