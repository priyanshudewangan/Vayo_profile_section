import React from "react";
import { X, AlertCircle, Sparkles, Users, CheckCircle2 } from "lucide-react";
import { getAvatarGradient, getEmailInitials } from "../lib/utils";

export const SandboxModal = ({ email, setSandboxModalEmail, handleSimulateSend }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-vayo-sky rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setSandboxModalEmail(null)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-6">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">Resend Sandbox Limitation</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
          Your Resend account is currently in sandbox/testing mode. It can only transmit emails to your verified account address.
          <br /><br />
          Would you like to <strong className="text-vayo-blue font-semibold">simulate</strong> sending the credentials for <span className="font-mono text-slate-800 bg-vayo-alice px-1.5 py-0.5 rounded border border-vayo-sky">{email}</span>?
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setSandboxModalEmail(null)}
            className="px-4 py-2.5 rounded-xl border border-vayo-sky text-slate-500 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSimulateSend(email)}
            className="px-5 py-2.5 rounded-xl bg-vayo-blue text-white text-xs font-semibold hover:bg-vayo-light shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AttendeeModal = ({ 
  event, 
  setAttendeeModalEvent, 
  rsvps, 
  isLoadingAttendees, 
  handleUpdateRSVPStatus, 
  updatingRSVPMap 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-vayo-sky rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <button
          onClick={() => setAttendeeModalEvent(null)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-vayo-alice border border-vayo-sky flex items-center justify-center text-slate-500 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">Attendee Registry</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Listing all confirmed RSVPs for: <span className="font-bold text-vayo-blue">{event.title}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          {isLoadingAttendees ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-vayo-blue rounded-full animate-spin mb-4"></div>
              <span className="text-xs text-slate-500 font-semibold animate-pulse">Fetching participant list...</span>
            </div>
          ) : (() => {
            const eventRSVPs = rsvps.filter(r => r.event_id === event.event_id);
            if (eventRSVPs.length === 0) {
              return (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-vayo-alice border border-vayo-sky flex items-center justify-center text-slate-500 mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">No registrations yet for this event.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 gap-3">
                {eventRSVPs.map((rsvp) => {
                  const isUpdating = updatingRSVPMap[`${rsvp.user_email}-${rsvp.event_id}`];
                  const status = rsvp.status?.toLowerCase() || "registered";
                  return (
                    <div key={`${rsvp.user_email}-${rsvp.event_id}`} className="bg-vayo-alice/40 border border-vayo-sky rounded-2xl p-4 flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(rsvp.user_email)} flex items-center justify-center text-white text-[10px] font-black shadow-lg`}>
                          {getEmailInitials(rsvp.user_email)}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{rsvp.user_email}</h4>
                          <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-tighter">ID: {rsvp.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {['registered', 'processing', 'confirmed'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleUpdateRSVPStatus(rsvp.user_email, rsvp.event_id, s)}
                            disabled={isUpdating || status === s}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${status === s
                              ? s === 'confirmed' ? "bg-emerald-50 border border-emerald-300 text-emerald-700" :
                                s === 'processing' ? "bg-amber-50 border border-amber-300 text-amber-700" :
                                  "bg-vayo-blue/15 border border-vayo-blue/40 text-vayo-blue"
                              : "bg-vayo-alice/60 border border-vayo-sky text-slate-500 hover:bg-vayo-sky/30"
                              }`}
                          >
                            {isUpdating && status !== s ? "..." : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] text-vayo-light font-bold uppercase tracking-wider">
            Total Capacity: {event.max_participants || "Unlimited"}
          </div>
          <button
            onClick={() => setAttendeeModalEvent(null)}
            className="px-6 py-2 rounded-xl bg-vayo-blue text-white text-xs font-bold hover:bg-vayo-light transition-colors cursor-pointer shadow-lg"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};

export const SelfieModal = ({ zoomedSelfie, setZoomedSelfie }) => {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setZoomedSelfie(null)}
    >
      <div
        className="relative max-w-sm w-full bg-white border border-vayo-sky rounded-[2rem] p-3.5 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoomedSelfie(null)}
          className="absolute top-6 right-6 p-2 rounded-full bg-vayo-alice/80 hover:bg-vayo-sky text-slate-600 hover:text-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-vayo-sky bg-slate-100">
          <img src={zoomedSelfie} alt="Verified Selfie Zoomed" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};
