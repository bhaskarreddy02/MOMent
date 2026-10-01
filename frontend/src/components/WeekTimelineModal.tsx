import React, { useState } from 'react';
import {
  X, Calendar, Baby, Activity, Heart, ShieldCheck,
  ChevronLeft, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';

interface WeekTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
}

const WEEKS_DATA: Record<number, {
  sizeComparison: string;
  emoji: string;
  weight: string;
  length: string;
  fetalDevelopment: string;
  maternalBody: string;
  recommendedTests: string;
  nutritionTip: string;
}> = {
  28: {
    sizeComparison: "Eggplant",
    emoji: "🍆",
    weight: "2.2 lbs (1.0 kg)",
    length: "14.8 in (37.6 cm)",
    fetalDevelopment: "Eyes open and blink; baby can perceive light filtering through maternal abdomen. Lung alveoli developing.",
    maternalBody: "Start of third trimester. Braxton-Hicks practise contractions may begin. Blood pressure surveillance begins bi-weekly.",
    recommendedTests: "RhoGAM injection for Rh-negative mothers, third-trimester CBC lab panel.",
    nutritionTip: "Increase dietary iron and vitamin C to support expanding fetal blood volume."
  },
  29: {
    sizeComparison: "Butternut Squash",
    emoji: "🥬",
    weight: "2.5 lbs (1.15 kg)",
    length: "15.2 in (38.6 cm)",
    fetalDevelopment: "Bones are fully developed but soft and pliable. Billions of neurons forming in brain.",
    maternalBody: "Diaphragm displacement may cause mild shortness of breath upon stair climbing.",
    recommendedTests: "Fetal kick count awareness: monitor for individual daily movement pattern.",
    nutritionTip: "Calcium intake (1000mg/day) is critical as fetal bone ossification accelerates."
  },
  30: {
    sizeComparison: "Cabbage",
    emoji: "🥬",
    weight: "2.9 lbs (1.3 kg)",
    length: "15.7 in (39.9 cm)",
    fetalDevelopment: "Lanugo (fine body hair) begins disappearing. Red blood cell production transferred to bone marrow.",
    maternalBody: "Relaxin hormone loosens pelvic ligaments, occasionally causing lower back or sacroiliac discomfort.",
    recommendedTests: "Review gestational hypertension baseline if previously elevated.",
    nutritionTip: "Small frequent meals prevent heartburn caused by progesterone relaxation of lower esophageal sphincter."
  },
  31: {
    sizeComparison: "Coconut / Romaine Lettuce",
    emoji: "🥥",
    weight: "3.3 lbs (1.5 kg)",
    length: "16.2 in (41.1 cm)",
    fetalDevelopment: "Baby's brain is processing 5 senses. Rapid eye movement (REM) sleep cycles established. Lung surfactant accelerating.",
    maternalBody: "Uterus is about 4 inches above belly button. Mild dependent foot/ankle edema common late in day.",
    recommendedTests: "32-Week routine OB checkup: check fundal height, maternal blood pressure, and urine protein.",
    nutritionTip: "Omega-3 DHA (200-300mg) supports rapid third-trimester cerebral cortex wiring."
  },
  32: {
    sizeComparison: "Jicama / Squash",
    emoji: "🍈",
    weight: "3.8 lbs (1.7 kg)",
    length: "16.7 in (42.4 cm)",
    fetalDevelopment: "Toenails and fingernails are completely formed. Baby practices breathing motions regularly.",
    maternalBody: "Blood volume is 40-50% higher than pre-pregnancy levels. Resting heart rate elevated by 10-15 bpm.",
    recommendedTests: "Bi-weekly prenatal visits begin. Growth ultrasound biometry if indicated for hypertension.",
    nutritionTip: "Hydration of at least 8-10 glasses of water daily helps reduce fluid retention."
  },
  34: {
    sizeComparison: "Cantaloupe",
    emoji: "🍈",
    weight: "4.7 lbs (2.1 kg)",
    length: "17.7 in (45 cm)",
    fetalDevelopment: "Central nervous system and lungs are maturing rapidly. Most babies turn into cephalic (head-down) position.",
    maternalBody: "Pelvic pressure increases as baby settles lower into the pelvis.",
    recommendedTests: "Group B Streptococcus (GBS) swab planning, serial fetal biometry if tracking gestational hypertension.",
    nutritionTip: "Maintain high fiber intake to avoid third-trimester constipation."
  },
  36: {
    sizeComparison: "Honeydew Melon",
    emoji: "🍈",
    weight: "5.8 lbs (2.6 kg)",
    length: "18.7 in (47.4 cm)",
    fetalDevelopment: "Baby shed most vernix and lanugo. Skull bones remain soft to allow passage through birth canal.",
    maternalBody: "Lightening / dropping may occur as baby engages into the pelvic inlet.",
    recommendedTests: "Group B Streptococcus (GBS) vaginal-rectal screening culture (36w0d - 37w6d).",
    nutritionTip: "Review hospital birth bag and emergency hospital transport plan."
  },
  40: {
    sizeComparison: "Watermelon",
    emoji: "🍉",
    weight: "7.6 lbs (3.5 kg)",
    length: "20.2 in (51.2 cm)",
    fetalDevelopment: "Full term milestone! Fat stores maintain temperature regulation. Reassuring organ function.",
    maternalBody: "Cervical ripening and effacement. Spontaneous labor onset or scheduled induction planning.",
    recommendedTests: "Cervical Bishop score check, non-stress test (NST) and amniotic fluid index if post-dates.",
    nutritionTip: "Energy-dense, easily digestible complex carbohydrates for labor endurance."
  }
};

export const WeekTimelineModal: React.FC<WeekTimelineModalProps> = ({
  isOpen,
  onClose,
  currentWeek
}) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek || 31);

  if (!isOpen) return null;

  const currentData = WEEKS_DATA[selectedWeek] || WEEKS_DATA[31];
  const availableWeeks = [28, 29, 30, 31, 32, 34, 36, 40];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-modal border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-gradient-to-r from-purple-50/80 via-white to-rose-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-lg">Week-by-Week Pregnancy Guide</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-moment-700">
                  You are at Week {currentWeek}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Grounded in authoritative ACOG & Mayo Clinic perinatal development milestones
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

        {/* Week Selector Chips */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-500 shrink-0">Select Week:</span>
          {availableWeeks.map((wk) => (
            <button
              key={wk}
              onClick={() => setSelectedWeek(wk)}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                selectedWeek === wk
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
              }`}
            >
              Week {wk} {wk === currentWeek && '★'}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 bg-[#FCFAF8] flex-1 overflow-y-auto space-y-5">
          
          {/* Hero Week Card */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Gestational Milestone
              </span>
              <h4 className="text-3xl font-black">
                Week {selectedWeek} of 40
              </h4>
              <p className="text-purple-100 text-sm">
                Baby is the size of a <span className="font-bold text-white">{currentData.sizeComparison}</span>
              </p>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-4xl shadow-inner shrink-0">
              <span>{currentData.emoji}</span>
              <span className="text-[10px] font-bold text-purple-200 mt-1 uppercase">Week {selectedWeek}</span>
            </div>
          </div>

          {/* Biometrics Card */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-500 block">Est. Fetal Weight</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{currentData.weight}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft">
              <span className="text-xs font-semibold text-slate-500 block">Crown-to-Heel Length</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{currentData.length}</span>
            </div>
          </div>

          {/* Development Details */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft space-y-1">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-purple-700">
                <Baby className="w-4 h-4" />
                <span>Fetal Development Milestones</span>
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentData.fetalDevelopment}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft space-y-1">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-moment-600">
                <Activity className="w-4 h-4" />
                <span>Maternal Body & Physical Changes</span>
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentData.maternalBody}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-soft space-y-1">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-teal-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Recommended Clinical Scans & Screenings</span>
              </h5>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentData.recommendedTests}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block">💡 Perinatal Nutrition Guidance:</span>
              <p className="text-amber-800">{currentData.nutritionTip}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
