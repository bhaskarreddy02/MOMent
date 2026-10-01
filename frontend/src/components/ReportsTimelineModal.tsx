import React, { useState } from 'react';
import {
  X, FileUp, CheckCircle, AlertCircle, FileText, Check,
  Calendar, Stethoscope, ChevronRight, Activity, Eye, ShieldCheck
} from 'lucide-react';
import { TimelineEvent, ReportExtractionResult } from '../types';
import { api } from '../services/api';

interface ReportsTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: TimelineEvent[];
  onReportVerified: (newEvent: TimelineEvent) => void;
}

export const ReportsTimelineModal: React.FC<ReportsTimelineModalProps> = ({
  isOpen,
  onClose,
  timeline,
  onReportVerified
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'upload'>('timeline');
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<ReportExtractionResult | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Editable fields in verification modal
  const [editBp, setEditBp] = useState('132/84 mmHg');
  const [editWeight, setEditWeight] = useState('1240 grams (54th %tile)');
  const [editObservation, setEditObservation] = useState('Appropriate interval fetal growth along 54th percentile curve.');

  if (!isOpen) return null;

  const handleSimulateUpload = async (type: 'ultrasound' | 'glucose') => {
    setIsParsing(true);
    setExtractedData(null);
    setVerifiedSuccess(false);

    try {
      const result = await api.parseReport(type);
      setExtractedData(result);
      if (result.extracted_fields["Maternal Blood Pressure"]) {
        setEditBp(result.extracted_fields["Maternal Blood Pressure"]);
      }
      if (result.extracted_fields["EFW (Estimated Fetal Weight)"]) {
        setEditWeight(result.extracted_fields["EFW (Estimated Fetal Weight)"]);
      }
      if (result.doctor_observations.length > 0) {
        setEditObservation(result.doctor_observations[0]);
      }
    } catch {
      // Fallback
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmVerification = () => {
    if (!extractedData) return;

    const newEvent: TimelineEvent = {
      week: extractedData.gestational_week,
      date: extractedData.extracted_date,
      type: extractedData.document_type,
      title: extractedData.document_name,
      details: `Verified: ${editObservation} • Maternal BP: ${editBp} • Fetal Weight: ${editWeight}`
    };

    onReportVerified(newEvent);
    setVerifiedSuccess(true);
    setTimeout(() => {
      setVerifiedSuccess(false);
      setExtractedData(null);
      setActiveTab('timeline');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Medical Reports & Timeline</h3>
              <p className="text-xs text-slate-500">
                OCR Document Extraction • Human-in-the-Loop Clinical Verification
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'timeline'
                ? 'border-moment-500 text-moment-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Pregnancy Medical Timeline ({timeline.length} Events)</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'upload'
                ? 'border-moment-500 text-moment-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>Upload & OCR Document Parser</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FCFAF8]">
          
          {activeTab === 'timeline' ? (
            /* Medical Timeline */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Longitudinal Clinical History</h4>
                  <p className="text-xs text-slate-500">Chronological prenatal scans, lab tests, and doctor check-up notes</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-moment-500 to-rose-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload New Report</span>
                </button>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200">
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-moment-500 flex items-center justify-center text-[10px] font-bold text-moment-600 shadow-sm">
                      {event.week}
                    </div>

                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-soft hover:shadow-card transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-moment-700 border border-rose-200">
                          {event.type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Week {event.week} • {event.date}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                        {event.title}
                      </h5>

                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {event.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Upload & OCR Parser View */
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {!extractedData && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-rose-300 rounded-3xl p-8 text-center bg-white hover:bg-rose-50/30 transition-all cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-moment-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <FileUp className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">Drag & Drop Your Medical Report or Scan</h4>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG, or DICOM ultrasound reports</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-600 block mb-2">Or select sample report for live demo:</span>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('ultrasound')}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                        >
                          📄 Test Week 28 Growth Ultrasound Biometry
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateUpload('glucose')}
                          className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition-colors"
                        >
                          🩸 Test Week 24 Glucose Challenge & CBC Lab
                        </button>
                      </div>
                    </div>
                  </div>

                  {isParsing && (
                    <div className="p-4 rounded-2xl bg-white border border-rose-200 flex items-center space-x-3 text-xs text-slate-700 animate-pulse">
                      <div className="w-4 h-4 border-2 border-moment-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Running OCR parser and extracting clinical biometry parameters...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory Human-in-the-Loop Verification Screen (Section 10) */}
              {extractedData && (
                <div className="bg-white rounded-3xl p-6 border-2 border-moment-400 shadow-card space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Mandatory Safety Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-extrabold text-sm text-amber-900">
                        "{extractedData.verification_message}"
                      </h5>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Never silently save medical data. Review the extracted fields below and edit if necessary before committing to your longitudinal record.
                      </p>
                    </div>
                  </div>

                  {/* Document Meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Document</span>
                      <span className="font-bold text-slate-800 truncate block">{extractedData.document_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Report Type</span>
                      <span className="font-bold text-slate-800">{extractedData.document_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Extracted Date</span>
                      <span className="font-bold text-slate-800">{extractedData.extracted_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">OCR Confidence</span>
                      <span className="font-extrabold text-emerald-600">{Math.round(extractedData.confidence_score * 100)}% Match</span>
                    </div>
                  </div>

                  {/* Extracted Biometry Grid */}
                  <div className="space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                      Extracted Biometric Values:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(extractedData.extracted_fields).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                          <span className="text-slate-600 font-medium">{key}:</span>
                          <span className="font-bold text-slate-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editable Verification Fields */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                      Patient Verification & Corrections:
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Maternal Blood Pressure</label>
                        <input
                          type="text"
                          value={editBp}
                          onChange={(e) => setEditBp(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Fetal Weight</label>
                        <input
                          type="text"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Observation Summary</label>
                      <textarea
                        rows={2}
                        value={editObservation}
                        onChange={(e) => setEditObservation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Confirmation Button */}
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() => setExtractedData(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel / Rescan
                    </button>
                    <button
                      onClick={handleConfirmVerification}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify & Commit to Timeline</span>
                    </button>
                  </div>

                  {verifiedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center flex items-center justify-center space-x-1.5 animate-bounce">
                      <CheckCircle className="w-4 h-4" />
                      <span>Report verified! Successfully added to your longitudinal pregnancy timeline.</span>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
