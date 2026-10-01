import React from 'react';
import { MapPin, Stethoscope, FileText, ChevronRight, Clock } from 'lucide-react';
import { AppointmentItem } from '../types';

interface NextAppointmentCardProps {
  appointment: AppointmentItem;
  onOpenDoctorSummary: () => void;
}

export const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointment,
  onOpenDoctorSummary
}) => {
  return (
    <div className="border border-[#E8E2DA] rounded-2xl overflow-hidden">

      {/* Section label bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#EDE8E2] bg-[#FAF8F5]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            Next clinical milestone
          </span>
        </div>
        <span className="text-[11px] text-stone-400">Week {appointment.gestational_week} routine care</span>
      </div>

      {/* Main content */}
      <div className="px-5 py-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-5">

        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-stone-900 leading-snug">
            {appointment.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-moment-400 shrink-0" />
              {appointment.doctor}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              {appointment.clinic}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-medium text-stone-800">Wednesday, Dec 16, 2026</span>
            <span className="text-stone-300">·</span>
            <span className="text-sm text-stone-600">10:30 AM</span>
          </div>

          {/* Preparation note */}
          <p className="text-[12px] text-stone-500 leading-relaxed pt-0.5">
            <span className="font-medium text-stone-600">Prepare: </span>
            {appointment.prep_notes}
          </p>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <button
            onClick={onOpenDoctorSummary}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Generate Doctor Summary</span>
            <ChevronRight className="w-3.5 h-3.5 arrow-nudge shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
};

