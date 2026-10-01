import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, ShieldCheck, AlertTriangle, ExternalLink,
  BookOpen, BrainCircuit, ArrowUpRight, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { PregnancyProfile, ChatMessage, MedicalCitation } from '../types';
import { api } from '../services/api';
import { renderFormattedClinicalText } from '../utils/formatClinicalText';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PregnancyProfile;
  onOpenEmergency: () => void;
  initialQuestion?: string;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenEmergency,
  initialQuestion
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello ${profile.user_name}. I am your MOMENT AI health companion. I remember your full pregnancy journey—including your gestational age (**Week ${profile.gestational_week} + ${profile.gestational_days}d**), your **mild gestational hypertension**, your current **Labetalol** prescription, and your Week 28 ultrasound results.\n\nAll my responses are grounded in peer-reviewed clinical guidelines (ACOG, WHO, CDC, NHS). How can I assist you safely today?`,
      timestamp: 'Just now',
      safety_level: 'GREEN',
      remembered_context_used: [
        `Gestational Age: Week ${profile.gestational_week} + ${profile.gestational_days} Days`,
        `Medical Condition: ${profile.relevant_conditions[0]}`,
        `Active Medication: ${profile.current_medications[0]}`,
        `Supervising OB: ${profile.ob_gyn_name}`
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      label: '⚠️ Contractions at 31w (Triage Demo)',
      prompt: "I'm 31 weeks pregnant. I've been having contractions every 8 minutes for the last hour."
    },
    {
      label: '💊 Increase Medication Dose (Safety Refusal)',
      prompt: "Should I increase my Labetalol dose because my home BP reading was 134/84?"
    },
    {
      label: '🧀 Cheese & Listeria (Tier 1 Evidence)',
      prompt: "I'm 31 weeks pregnant. Can I eat Brie or Feta cheese?"
    },
    {
      label: '🦶 Swollen Ankles (Longitudinal Memory)',
      prompt: "Why are my feet and ankles slightly swollen in the evening?"
    }
  ];

  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSend(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const toggleSource = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (questionText: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.askAi(textToSend);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        safety_level: response.safety_level,
        urgency_flag: response.urgency_flag,
        escalation_pathway: response.escalation_pathway,
        remembered_context_used: response.remembered_context_used,
        sources: response.sources
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Local fallback
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "I am having temporary difficulty connecting to the medical RAG server. If you are experiencing concerning symptoms like regular contractions, severe headache, or fluid leakage, please contact Dr. Priya Raman or call 112 / 108 or hospital triage immediately.",
        timestamp: 'Just now',
        safety_level: 'YELLOW'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[92vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-moment-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-moment-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-lg">MOMENT AI Clinical Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 mr-0.5" />
                  <span>RAG Grounded</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Retrieving from WHO, ACOG, CDC & NHS with Longitudinal Context Memory
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

        {/* Active Context Memory Bar */}
        <div className="bg-rose-50/60 border-b border-rose-100 px-4 py-2 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-700">
          <span className="font-bold text-moment-700 flex items-center space-x-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-moment-500" />
            <span>Active Memory:</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 font-semibold text-slate-800 shrink-0">
            Week {profile.gestational_week} + {profile.gestational_days}d
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 font-semibold text-slate-800 shrink-0">
            Mild Gestational HTN (diagnosed wk 27)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 font-semibold text-slate-800 shrink-0">
            Rx Labetalol 100mg BID
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 font-semibold text-slate-800 shrink-0">
            Week 28 Ultrasound: 54th %tile
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FCFAF8]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isRed = msg.safety_level === 'RED';
            const isYellow = msg.safety_level === 'YELLOW';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}
              >
                {/* Sender badge */}
                <div className="flex items-center space-x-2 mb-1.5 px-1 text-xs text-slate-500 font-medium">
                  <span>{isUser ? 'You' : 'MOMENT Clinical Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.safety_level && (
                    <span
                      className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${
                        isRed
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isYellow
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {msg.safety_level} SAFETY
                    </span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-3xl p-4 sm:p-5 shadow-sm text-sm sm:text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-moment-500 to-rose-500 text-white rounded-tr-none'
                      : isRed
                      ? 'bg-red-50 border-2 border-red-300 text-slate-900 rounded-tl-none shadow-md'
                      : 'bg-white border border-rose-100 text-slate-900 rounded-tl-none shadow-soft'
                  }`}
                >
                  {/* Formatted clinical text without raw # or ** */}
                  {isUser ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="text-sm sm:text-[14.5px] leading-relaxed">
                      {renderFormattedClinicalText(msg.text)}
                    </div>
                  )}

                  {/* Red Urgency Escalation Action Banner */}
                  {isRed && (
                    <div className="mt-4 p-4 rounded-2xl bg-clinical-red text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="font-extrabold flex items-center space-x-1.5 text-sm">
                          <ShieldAlert className="w-5 h-5 text-amber-300" />
                          <span>Urgent Maternity Triage Pathway Triggered</span>
                        </div>
                        <p className="text-xs text-red-100 mt-0.5">
                          Symptoms match preterm labor criteria. Assessment required.
                        </p>
                      </div>
                      <button
                        onClick={onOpenEmergency}
                        className="px-4 py-2 rounded-xl bg-white text-clinical-red hover:bg-red-50 font-bold text-xs uppercase tracking-wider shrink-0 transition-colors shadow-sm"
                      >
                        Launch Emergency Pathway
                      </button>
                    </div>
                  )}

                  {/* Longitudinal Memory Used Accordion */}
                  {!isUser && msg.remembered_context_used && msg.remembered_context_used.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center space-x-1 font-bold text-moment-700 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-moment-500" />
                        <span>Longitudinal Context Synthesized:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.remembered_context_used.map((ctx, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium text-[11px]"
                          >
                            {ctx}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medical Sources Citation Accordion */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => toggleSource(msg.id)}
                        className="flex items-center justify-between w-full font-bold text-slate-700 hover:text-moment-600 transition-colors py-1"
                      >
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Authoritative Medical Sources ({msg.sources.length})</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                            TIER 1
                          </span>
                        </div>
                        {expandedSources[msg.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {expandedSources[msg.id] && (
                        <div className="mt-2 space-y-2 pt-1">
                          {msg.sources.map((src, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                              <div className="flex items-center justify-between font-bold text-slate-900">
                                <span className="text-emerald-700">{src.organization}</span>
                                <span className="text-slate-400 font-normal">{src.date}</span>
                              </div>
                              <div className="font-semibold text-slate-800">{src.title}</div>
                              <p className="text-slate-600 italic">"{src.relevance_snippet}"</p>
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-moment-600 hover:underline pt-0.5 font-medium"
                                >
                                  <span>View Clinical Guideline</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs py-2 bg-white px-4 rounded-2xl border border-rose-100 w-fit animate-pulse">
              <div className="w-2 h-2 rounded-full bg-moment-500 animate-ping"></div>
              <span>Grounding query in ACOG/WHO evidence & synthesizing longitudinal context...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div className="px-4 py-2 bg-white border-t border-rose-100 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-500 shrink-0 text-[11px]">Quick Scenarios:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.prompt)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-slate-800 hover:bg-rose-100 hover:text-moment-700 border border-rose-200/70 font-semibold shrink-0 transition-colors text-xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-rose-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about symptoms, food safety, medications, or test results..."
              className="flex-1 bg-slate-50 border border-rose-200 focus:border-moment-500 focus:bg-white rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-moment-500 to-rose-500 hover:from-moment-600 hover:to-rose-600 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-moment-500/20 flex items-center space-x-1.5 transition-all shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Safety Micro-Disclaimer */}
          <div className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>MOMENT AI is an educational companion. It does not diagnose or change medication doses. For emergencies, use Emergency SOS.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
