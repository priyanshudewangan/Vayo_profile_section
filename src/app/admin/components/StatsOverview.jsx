import React from "react";
import { CalendarWidget } from "./CalendarWidget";

export const StatsOverview = ({ stats, events }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
      {/* Conversion & Onboarding Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-vayo-blue/10 via-vayo-light/10 to-vayo-alice/40 backdrop-blur-xl border border-vayo-sky rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 group min-h-[140px] md:min-h-[220px]">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-vayo-sky/40 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-vayo-pale/40 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

        <div className="flex-1 flex flex-col justify-between h-full relative z-10">
          <div>
            <span className="text-[9px] sm:text-[10px] text-vayo-blue uppercase tracking-widest font-extrabold">Waitlist Overview</span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight mt-0.5 sm:mt-1 md:mt-2 leading-tight">
              Conversion & Onboarding
            </h2>
          </div>
          <div className="mt-2 sm:mt-4 md:mt-6">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800">{stats.approved}</span>
              <span className="text-[11px] sm:text-xs md:text-sm text-slate-500">/ {stats.total} total</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 md:mt-1 font-medium leading-normal">
              {stats.pending} candidate profiles waiting for verification keys.
            </p>
          </div>
        </div>

        {/* Circular progress gauge */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center select-none shrink-0 bg-white/60 backdrop-blur-md rounded-full border border-vayo-sky relative z-10 shadow-inner">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transform -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-slate-200 fill-transparent"
              strokeWidth="6"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-vayo-blue fill-transparent transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - stats.inviteRate / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-lg md:text-xl font-black text-slate-800">{stats.inviteRate}%</span>
            <span className="text-[6px] sm:text-[7px] md:text-[8px] text-vayo-light font-extrabold uppercase tracking-wide">Rate</span>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div
        id="calendar-widget-container"
        className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-vayo-sky text-slate-800 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-xl min-h-[140px] md:min-h-[220px] relative overflow-hidden flex flex-col justify-between transition-all duration-300"
      >
        <CalendarWidget events={events} />
      </div>
    </section>
  );
};
