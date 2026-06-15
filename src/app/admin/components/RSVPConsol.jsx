import React from "react";
import { RefreshCw, CalendarPlus, Check, Mail } from "lucide-react";
import { getAvatarGradient, getEmailInitials } from "../lib/utils";
import { Button } from "@/components/ui/button";

export const RSVPConsol = ({ 
  rsvps, 
  isLoadingRSVPs, 
  fetchRSVPs, 
  password, 
  handleUpdateRSVPStatus, 
  updatingRSVPMap 
}) => {
  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      <div className="bg-white border border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(72,147,198,0.08)] flex flex-col gap-6 md:gap-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Event RSVPs</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-vayo-light/10 text-vayo-light border border-vayo-light/20">
                {rsvps.length} total
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-slate-500 font-medium max-w-xl">
              Manage event registrations, track payments, and confirm member tickets.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchRSVPs(password)}
            disabled={isLoadingRSVPs}
            className="rounded-xl md:rounded-2xl bg-vayo-alice/60 hover:bg-vayo-light/15 border-vayo-sky transition-all duration-300 shadow-sm w-10 h-10 md:w-11 md:h-11"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRSVPs ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoadingRSVPs ? (
          <div className="py-20 md:py-32 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-vayo-sky/10 border-t-vayo-light rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-6 h-6 md:w-8 md:h-8 bg-vayo-light/10 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
            <span className="text-[9px] md:text-[10px] text-vayo-light tracking-[3px] md:tracking-[4px] uppercase font-black animate-pulse text-center px-4">Loading Data</span>
          </div>
        ) : rsvps.length === 0 ? (
          <div className="py-20 md:py-32 text-center flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm border-2 border-dashed border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] shadow-xl mx-2">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-vayo-alice border border-vayo-sky flex items-center justify-center text-vayo-sky/20 mb-2 shadow-inner">
              <CalendarPlus className="w-8 h-8 md:w-10 md:h-10 opacity-30" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-sm md:text-base font-bold text-slate-700">No active RSVPs</p>
              <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">Registrations will appear here once members start signing up.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 px-2 md:px-0 max-h-[700px] overflow-y-auto pr-2 scrollbar-vayo">
            {rsvps.map((rsvp) => {
              const isUpdating = updatingRSVPMap[`${rsvp.user_email}-${rsvp.event_id}`];
              const status = rsvp.status?.toLowerCase() || "registered";
              return (
                <div key={`${rsvp.user_email}-${rsvp.event_id}`} className="bg-white border border-vayo-sky/60 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-8 group hover:border-vayo-pale hover:shadow-lg transition-all duration-500 overflow-hidden relative">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 md:w-1.5 transition-colors duration-500 ${
                    status === 'confirmed' ? 'bg-emerald-500' : 
                    status === 'processing' ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} />

                  <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0 pl-2">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${getAvatarGradient(rsvp.user_email)} flex items-center justify-center text-white text-sm md:text-base font-black shadow-lg shrink-0 transition-transform group-hover:scale-105 duration-300`}>
                      {getEmailInitials(rsvp.user_email)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-sm md:text-base font-extrabold text-slate-800 truncate tracking-tight">{rsvp.user_email}</h4>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-vayo-blue truncate">{rsvp.event_title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-8 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                    <div className="flex flex-col items-center sm:items-end gap-1 shrink-0 px-2">
                      <span className="text-[8px] md:text-[9px] text-vayo-light font-black uppercase tracking-widest opacity-60">Identity Link</span>
                      <span className="text-[10px] md:text-[11px] font-mono text-slate-500 bg-vayo-alice/40 px-2 py-0.5 rounded-lg border border-vayo-sky/20">{rsvp.id.slice(0, 8)}</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-center">
                      {['registered', 'processing', 'confirmed'].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateRSVPStatus(rsvp.user_email, rsvp.event_id, s)}
                          disabled={isUpdating || status === s}
                          className={`flex-1 sm:flex-none px-3 md:px-4 py-2 h-9 md:h-10 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[1.5px] md:tracking-[2px] transition-all duration-300 border ${status === s
                            ? s === 'confirmed' ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" :
                              s === 'processing' ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm" :
                                "bg-vayo-blue/10 border-vayo-blue/30 text-vayo-blue shadow-sm"
                            : "bg-vayo-alice/50 border-transparent text-slate-400 hover:text-vayo-blue hover:bg-white hover:border-vayo-sky"
                            }`}
                        >
                          {isUpdating && status !== s ? "..." : s}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
