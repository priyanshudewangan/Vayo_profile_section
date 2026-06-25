import React, { useState } from "react";
import { RefreshCw, Search, X, Copy, Check, Phone, Eye, CheckCircle2, AtSign, Briefcase, UtensilsCrossed, Sunset, User, Cake } from "lucide-react";
import { getRelativeTime, getAvatarGradient, getInitials, getAge } from "../lib/utils";

const InstagramIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ProfileModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(item.email)} flex items-center justify-center text-white font-black text-base shrink-0`}>
              {getInitials(item.name || item.email)}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">{item.name || "—"}</h3>
              {item.vayo_id && <p className="text-[11px] text-vayo-blue font-bold">@{item.vayo_id}</p>}
              <p className="text-[10px] text-slate-400">{item.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Selfie */}
          {item.selfie_url && (
            <img src={item.selfie_url} alt="Selfie" className="w-28 h-28 rounded-2xl object-cover border border-slate-100 shadow mx-auto block" />
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {item.phone && <InfoRow icon={<Phone className="w-3 h-3"/>} label="Phone" value={item.phone} />}
            {item.birthdate && <InfoRow icon={<Cake className="w-3 h-3"/>} label="Age / DOB" value={`${getAge(item.birthdate)} yrs · ${item.birthdate}`} />}
            {item.instagram && <InfoRow icon={<AtSign className="w-3 h-3"/>} label="Instagram" value={item.instagram} />}
            {item.profession && <InfoRow icon={<Briefcase className="w-3 h-3"/>} label="Profession" value={item.profession} />}
            <InfoRow icon={<User className="w-3 h-3"/>} label="Applied" value={getRelativeTime(item.created_at)} />
            <InfoRow label="Status" value={item.status || "Pending"} />
          </div>

          {/* Tag Sections */}
          {item.interests?.length > 0 && <TagSection label="🎯 Interests & Vibes" tags={item.interests} color="blue" />}
          {item.food_preferences?.length > 0 && <TagSection label="🍽️ Food Preferences" tags={item.food_preferences} color="emerald" />}
          {item.weekend_activities?.length > 0 && <TagSection label="🌅 Weekend Activities" tags={item.weekend_activities} color="violet" />}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">{icon}{label}</span>
      <span className="text-[11px] text-slate-700 font-semibold truncate">{value}</span>
    </div>
  );
}

function TagSection({ label, tags, color }) {
  const colors = { blue: "bg-blue-50 text-blue-700 border-blue-200", emerald: "bg-emerald-50 text-emerald-700 border-emerald-200", violet: "bg-violet-50 text-violet-700 border-violet-200" };
  return (
    <div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => <span key={t} className={`px-2.5 py-1 rounded-xl border text-[10px] font-semibold ${colors[color]}`}>{t}</span>)}
      </div>
    </div>
  );
}

export const WaitlistRegistry = ({
  filteredEmails,
  isLoading,
  fetchEmails,
  password,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  stats,
  sendingEmailMap,
  handleCopyEmail,
  copiedEmail,
  handleToggleApproval,
  togglingStatusMap,
  handleSendInvite,
  setZoomedSelfie
}) => {
  const [profileItem, setProfileItem] = useState(null);
  return (
    <>
    {profileItem && <ProfileModal item={profileItem} onClose={() => setProfileItem(null)} />}
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Waitlist Control Ledger Card */}
      <div className="bg-white border border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-[0_8px_40px_rgba(72,147,198,0.08)] flex flex-col gap-6 md:gap-8 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Waitlist Applications</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-vayo-blue/10 text-vayo-blue border border-vayo-blue/20">
                {filteredEmails.length} matching
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-slate-500 font-medium max-w-xl">
              Direct access approval, email verification trigger flow, and user profile indexing.
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchEmails(password, true)}
            disabled={isLoading}
            className="rounded-xl md:rounded-2xl bg-vayo-alice/60 hover:bg-vayo-blue hover:text-white border-vayo-sky transition-all duration-300 shadow-sm w-10 h-10 md:w-11 md:h-11"
            title="Sync Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 md:gap-6">
          <div className="flex items-center bg-vayo-alice/40 border border-vayo-sky p-1 md:p-1.5 rounded-xl md:rounded-2xl self-start shadow-inner overflow-x-auto max-w-full scrollbar-hide">
            {[
              { id: "all", label: "All", count: stats.total, color: "text-vayo-blue" },
              { id: "pending", label: "Pending", count: stats.pending, color: "text-amber-600" },
              { id: "sent", label: "Sent", count: stats.sent, color: "text-emerald-600" },
              { id: "joined", label: "Joined", count: stats.joined, color: "text-vayo-light" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? `bg-white ${tab.color} border border-vayo-sky shadow-md scale-[1.02]`
                  : "text-slate-500 hover:text-vayo-blue hover:bg-white/40"
                  }`}
              >
                {tab.label} <span className="opacity-50 ml-0.5">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="w-full lg:w-[420px] relative flex items-center group">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 z-10 group-focus-within:text-vayo-blue transition-colors" />
            <Input
              type="text"
              placeholder="Search applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl pl-11 pr-12 py-5 md:py-7 text-xs text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:ring-4 focus:ring-vayo-blue/10 focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 w-6 h-6 rounded-lg bg-vayo-sky/50 hover:bg-rose-500 hover:text-white text-slate-600 text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 md:py-32 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-vayo-sky/20 border-t-vayo-blue rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-6 h-6 md:w-8 md:h-8 bg-vayo-blue/10 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <span className="text-[9px] md:text-[10px] text-vayo-blue tracking-[3px] md:tracking-[4px] uppercase font-black animate-pulse text-center px-4">Synchronizing Records</span>
        </div>
      ) : filteredEmails.length === 0 ? (
        <div className="py-20 md:py-32 text-center flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-sm border-2 border-dashed border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] shadow-sm mx-2">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-vayo-alice border border-vayo-sky flex items-center justify-center text-vayo-sky mb-2 shadow-inner">
            <Search className="w-6 h-6 md:w-8 md:h-8 opacity-40" />
          </div>
          <div className="space-y-1 px-4">
            <p className="text-sm font-bold text-slate-700">No matching profiles</p>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-medium">Adjust your search or clear filters.</p>
          </div>
          <Button variant="ghost" onClick={() => { setSearchTerm(""); setActiveTab("all"); }} className="text-vayo-blue hover:bg-vayo-alice font-bold text-[10px] md:text-xs uppercase tracking-wider">Clear Filters</Button>
        </div>
      ) : (
        <div className="space-y-4 px-2 md:px-0">
          {filteredEmails.map((item) => {
            const isSent = item.status === "Sent";
            const isJoined = item.status === "Joined";
            const isSending = sendingEmailMap[item.email] || false;
            const avatarGrad = getAvatarGradient(item.email);
            const initials = getInitials(item.name, item.email);
            const isCurrentCopied = copiedEmail === item.email;

            return (
              <div
                key={item.id}
                className="bg-white border border-vayo-sky/60 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-sm hover:border-vayo-pale hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500 flex flex-col lg:flex-row lg:items-center justify-between gap-5 md:gap-8 group overflow-hidden"
              >
                {/* Identity Block */}
                <div className="flex items-start gap-4 md:gap-5 min-w-0 flex-1">
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg border flex items-center justify-center mt-1 md:mt-2 shrink-0 transition-all duration-300 ${
                    isJoined ? "bg-vayo-blue border-vayo-blue text-white rotate-[360deg]" :
                    isSent ? "bg-emerald-50 border-emerald-200 text-emerald-600" : 
                    "bg-vayo-alice border-vayo-sky text-vayo-light"
                    }`}>
                    {isJoined ? <CheckCircle2 className="w-4 h-4" /> : isSent ? <Check className="w-4 h-4" /> : <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500 animate-pulse"></span>}
                  </div>

                  <div
                    onClick={() => setProfileItem(item)}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-white text-sm md:text-base font-black select-none shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300 cursor-pointer`}
                    title="View full profile"
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight truncate">
                      {item.name || "Anonymous Applicant"}
                    </h4>
                    <span className="text-[11px] md:text-xs text-vayo-light font-mono block select-all truncate opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.email}
                    </span>

                    <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3 flex-wrap">
                      <button
                        onClick={() => handleCopyEmail(item.email)}
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-vayo-blue flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isCurrentCopied ? (
                          <>
                            <Check className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Email Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span>Copy link</span>
                          </>
                        )}
                      </button>
                      {item.instagram && (
                        <>
                          <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-slate-200"></div>
                          <a
                            href={`https://instagram.com/${item.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-lg bg-vayo-alice/60 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-vayo-light hover:bg-vayo-blue hover:text-white border border-vayo-sky/50 transition-all duration-300"
                          >
                            <InstagramIcon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span>{item.instagram}</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Block */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-8 flex-1 lg:max-w-2xl px-1 md:px-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-50">
                  <div className="flex flex-col gap-1.5 text-[10px] md:text-[11px] text-slate-500 shrink-0">
                    {item.phone && (
                      <span className="font-extrabold text-slate-700 flex items-center gap-2">
                        <Phone className="w-3.5 md:w-4 h-3.5 md:h-4 text-vayo-blue shrink-0" />
                        {item.phone}
                      </span>
                    )}
                    <span className="font-bold text-slate-500/80 bg-vayo-alice/40 px-2 py-0.5 rounded-lg border border-vayo-sky/30 w-fit">
                      {item.birthdate ? `${getAge(item.birthdate)} YRS • ${item.birthdate}` : "No DOB Recorded"}
                    </span>
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-medium">
                      Applied {getRelativeTime(item.created_at)}
                    </span>
                  </div>


                  <div className="shrink-0 flex items-center justify-center ml-auto lg:ml-0">
                    {item.selfie_url ? (
                      <div
                        onClick={() => setZoomedSelfie(item.selfie_url)}
                        className="relative w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden border-2 border-vayo-sky shadow-md cursor-pointer group/selfie bg-slate-100 shrink-0 ring-4 ring-white"
                        title="Verify Identity"
                      >
                        <img src={item.selfie_url} alt="Selfie" className="w-full h-full object-cover group-hover/selfie:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-vayo-blue/40 opacity-0 group-hover/selfie:opacity-100 flex items-center justify-center transition-all duration-300">
                          <Eye className="w-4 md:w-5 h-4 md:h-5 text-white animate-in zoom-in-50" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-dashed border-vayo-sky flex items-center justify-center text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-tighter text-center bg-vayo-alice/30 ring-4 ring-white leading-none">
                        Missing<br/>Selfie
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions Block */}
                <div className="flex items-center gap-4 md:gap-6 shrink-0 lg:w-72 justify-between lg:justify-end border-t lg:border-t-0 pt-5 md:pt-6 lg:pt-0 border-slate-100">
                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[2px] block text-right">Ledger</span>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-16 md:w-20 h-1.5 md:h-2 bg-vayo-alice rounded-full overflow-hidden border border-vayo-sky shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-700 ease-out ${
                          isJoined ? "w-full bg-vayo-blue" :
                          isSent ? "w-2/3 bg-emerald-500" :
                          "w-1/3 bg-amber-500"
                          }`}></div>
                      </div>
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                        isJoined ? "text-vayo-blue" :
                        isSent ? "text-emerald-600" :
                        "text-amber-600"
                        }`}>
                        {item.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 md:gap-2 w-28 md:w-32">
                    {!isJoined ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleApproval(item.email, isSent ? "Pending" : "Sent")}
                          disabled={togglingStatusMap[item.email]}
                          className={`w-full h-8 md:h-9 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${isSent
                            ? "bg-rose-50 border-rose-200 hover:bg-rose-500 hover:text-white text-rose-600"
                            : "bg-emerald-50 border-emerald-200 hover:bg-emerald-500 hover:text-white text-emerald-600"
                            } disabled:opacity-50`}
                        >
                          {togglingStatusMap[item.email] ? "SYNC..." : isSent ? "Revoke" : "Approve"}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleSendInvite(item.email)}
                          disabled={isSending}
                          className={`w-full h-8 md:h-9 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1.5 md:gap-2 ${isSent
                            ? "bg-vayo-blue/10 border-vayo-blue/20 text-vayo-blue hover:bg-vayo-blue hover:text-white"
                            : "bg-vayo-blue border-vayo-blue text-white hover:bg-vayo-light shadow-lg shadow-vayo-blue/20"
                            } disabled:opacity-50`}
                        >
                          {isSending ? "MAIL..." : isSent ? "Resend" : "Send Key"}
                        </Button>
                      </>
                    ) : (
                      <div className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black tracking-[2px] bg-vayo-blue text-white text-center flex items-center justify-center gap-1.5 md:gap-2 shadow-lg shadow-vayo-blue/20 animate-in zoom-in-95">
                        <CheckCircle2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                        MEMBER
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
    </>
  );
};
