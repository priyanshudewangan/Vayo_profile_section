import React, { useState } from "react";
import { RefreshCw, CalendarPlus, X, User, Phone, Cake, AtSign, Briefcase } from "lucide-react";
import { getAvatarGradient, getEmailInitials } from "../lib/utils";
import { Button } from "@/components/ui/button";

function UserDetailModal({ rsvp, onClose }) {
  const p = rsvp.profile || {};
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(rsvp.user_email)} flex items-center justify-center text-white font-black text-base`}>
              {getEmailInitials(rsvp.user_email)}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">{p.name || rsvp.user_email}</h3>
              {p.vayo_id && <p className="text-[10px] text-vayo-blue font-bold">@{p.vayo_id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {p.selfie_url && (
            <img src={p.selfie_url} alt="Selfie" className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-sm mx-auto block" />
          )}

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <DetailRow icon={<User className="w-3 h-3"/>} label="Email" value={rsvp.user_email} />
            <DetailRow icon={<Phone className="w-3 h-3"/>} label="Phone" value={p.phone} />
            <DetailRow icon={<Cake className="w-3 h-3"/>} label="Birthdate" value={p.birthdate} />
            <DetailRow icon={<AtSign className="w-3 h-3"/>} label="Instagram" value={p.instagram} />
            <DetailRow icon={<Briefcase className="w-3 h-3"/>} label="Profession" value={p.profession} />
            <DetailRow label="Waitlist Status" value={p.status} />
          </div>

          {p.interests?.length > 0 && (
            <TagSection label="Interests" tags={p.interests} color="violet" />
          )}
          {p.food_preferences?.length > 0 && (
            <TagSection label="Food Preferences" tags={p.food_preferences} color="emerald" />
          )}
          {p.weekend_activities?.length > 0 && (
            <TagSection label="Weekend Activities" tags={p.weekend_activities} color="sky" />
          )}

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            RSVP ID: <span className="font-mono">{rsvp.id}</span> · Event: <span className="font-semibold">{rsvp.event_title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">{icon}{label}</span>
      <span className="text-slate-700 font-semibold truncate">{value}</span>
    </div>
  );
}

function TagSection({ label, tags, color }) {
  const colors = { violet: "bg-violet-50 text-violet-700 border-violet-200", emerald: "bg-emerald-50 text-emerald-700 border-emerald-200", sky: "bg-sky-50 text-sky-700 border-sky-200" };
  return (
    <div>
      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => <span key={t} className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${colors[color]}`}>{t}</span>)}
      </div>
    </div>
  );
}

export const RSVPConsol = ({
  rsvps,
  isLoadingRSVPs,
  fetchRSVPs,
  password,
  handleUpdateRSVPStatus,
  updatingRSVPMap
}) => {
  const [detailRsvp, setDetailRsvp] = useState(null);
  return (
    <>
    {detailRsvp && <UserDetailModal rsvp={detailRsvp} onClose={() => setDetailRsvp(null)} />}
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

                    <div className="flex gap-2 w-full sm:w-auto justify-center flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailRsvp(rsvp)}
                        className="px-3 py-2 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest border-vayo-sky text-vayo-blue hover:bg-vayo-alice/60"
                      >
                        View Details
                      </Button>
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
    </>
  );
};
