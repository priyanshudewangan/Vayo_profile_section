import React from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Zap, Calendar, ArrowLeft, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function VibeProfile({
  currentPersona,
  displayPersona,
  activeMode,
  theme,
  isEditing,
  editDraft,
  setEditDraft,
  completenessScore,
  completenessItems,
  personaMoments,
  upcomingEvents,
  currentEventIdx,
  setCurrentEventIdx,
  isEventsLoading,
  setSelectedEvent,
  setActiveSidebarTab,
  triggerToast,
  handleMomentDelete,
  setLightboxMoment,
  karmaData,
  isKarmaLoading
}) {
  
  const handlePrev = () => {
    setCurrentEventIdx(prev => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
  };
  const handleNext = () => {
    setCurrentEventIdx(prev => (prev + 1) % upcomingEvents.length);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Avatar + Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        {/* GRADIENT RING AVATAR */}
        <div className="relative shrink-0">
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2.5px] sm:p-[3px] bg-gradient-to-br ${theme.gradient} shadow-xl`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900 border-2 border-white/80">
              <img src={currentPersona.image} alt={currentPersona.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute inset-[-4px] rounded-full border-2 opacity-25 transition-colors duration-500" style={{ borderColor: theme.accent }} />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
            <h4 className="text-lg sm:text-xl font-extrabold text-neutral-800 tracking-tight leading-tight">{currentPersona.name}, {currentPersona.age}</h4>
            <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                Active
              </span>
              <span className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                {activeMode === 'social' ? '🌐' : activeMode === 'bff' ? '💚' : '💼'}
                {activeMode === 'social' ? 'Social' : activeMode === 'bff' ? 'BFF' : 'Bizz'}
              </span>
            </div>
          </div>

          {/* Responsive Info Grid */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-500 pt-2 border-t border-neutral-100 sm:border-t-0 mt-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-semibold">+91 9845{currentPersona.id === 'maxim' ? '0 1202' : currentPersona.id === 'sarah' ? '1 3495' : currentPersona.id === 'daniel' ? '2 8593' : currentPersona.id === 'user-profile' ? '4 8392' : '3 9204'}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-blue-600 font-bold truncate max-w-[200px] hover:underline cursor-pointer">{currentPersona.name.toLowerCase()}@vayo.community</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-neutral-500">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{currentPersona.location}</span>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-1.5 pt-1 max-w-sm text-left">
              <div className="grid grid-cols-2 gap-1.5">
                {[['instagram', 'ig'], ['linkedin', 'li'], ['twitter', 'tw'], ['github', 'gh']].map(([key, short]) => (
                  <div key={key} className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                    <span className="text-[10px] font-extrabold uppercase text-neutral-500 w-5">{short}</span>
                    <input value={editDraft[key]}
                      onChange={e => setEditDraft(p => ({ ...p, [key]: e.target.value }))}
                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`@handle`} />
                  </div>
                ))}
              </div>
              {activeMode === 'bizz' && (
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                    <span className="text-[10px] font-extrabold uppercase text-neutral-500 w-10">Role</span>
                    <input value={editDraft.bizzRole}
                      onChange={e => setEditDraft(p => ({ ...p, bizzRole: e.target.value }))}
                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`Job Role`} />
                  </div>
                  <div className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white" style={{ borderColor: `${theme.accent}30` }}>
                    <span className="text-[10px] font-extrabold uppercase text-neutral-500 w-12">Company</span>
                    <input value={editDraft.bizzCompany}
                      onChange={e => setEditDraft(p => ({ ...p, bizzCompany: e.target.value }))}
                      className="text-[10.5px] flex-1 outline-none bg-transparent min-w-0" placeholder={`Company`} />
                  </div>
                </div>
              )}
            </div>
          ) : Object.keys(displayPersona.socialLinks || {}).length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-500 font-black uppercase tracking-wider">Socials:</span>
              {displayPersona.socialLinks.instagram && (
                <a 
                  href={`https://instagram.com/${displayPersona.socialLinks.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={`@${displayPersona.socialLinks.instagram}`}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>
              )}
              {displayPersona.socialLinks.linkedin && (
                <a 
                  href={`https://linkedin.com/in/${displayPersona.socialLinks.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={displayPersona.socialLinks.linkedin}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
              {displayPersona.socialLinks.twitter && (
                <a 
                  href={`https://twitter.com/${displayPersona.socialLinks.twitter.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={`@${displayPersona.socialLinks.twitter}`}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {displayPersona.socialLinks.github && (
                <a 
                  href={`https://github.com/${displayPersona.socialLinks.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={displayPersona.socialLinks.github}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border ${theme.cardBorder} ${theme.cardBg} hover:opacity-70 transition-opacity`} style={{ color: theme.accent }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {isEditing ? (
            <textarea value={editDraft.bio} onChange={e => setEditDraft(p => ({ ...p, bio: e.target.value }))} rows={3}
              className={`w-full text-xs border rounded-xl px-3 py-2 mt-1 resize-none focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`}
              placeholder="Write your bio…" />
          ) : (
            <p className="text-xs text-neutral-650 italic font-medium pt-1 max-w-xl text-center sm:text-left leading-relaxed">
              &ldquo;{activeMode === 'social' ? displayPersona.socialBio : activeMode === 'bff' ? displayPersona.bffBio : displayPersona.bizzBio}&rdquo;
            </p>
          )}
        </div>

        {/* Profile completeness donut */}
        <div className="hidden sm:flex shrink-0 flex-col items-center gap-1.5 self-center sm:self-start sm:pt-1">
          <div className="relative w-14 h-14 group cursor-default">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4.5" />
              <circle cx="28" cy="28" r="22" fill="none" stroke={theme.accent} strokeWidth="4.5"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - completenessScore / 100)}`}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[12px] font-extrabold ${theme.textAccent}`}>{completenessScore}%</span>
            </div>
            <div className="absolute top-0 right-full mr-3 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${theme.textAccent}`}>Profile Checklist</div>
              <div className="space-y-1">
                {completenessItems.map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    {item.done ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <span className="w-3 h-3 rounded-full border border-neutral-300 shrink-0 inline-block" />}
                    <span className={`text-[10px] font-medium ${item.done ? 'text-neutral-700' : 'text-neutral-400'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Complete</span>
        </div>
      </div>

      {/* Mobile Profile Completeness Progress Bar */}
      <div className="sm:hidden w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="space-y-0.5 animate-fade-in">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Profile Completeness</span>
          <span className={`text-[12px] font-black ${theme.textAccent}`}>{completenessScore}% Complete</span>
        </div>
        <div className="flex-1 max-w-[130px] bg-neutral-200/50 h-2 rounded-full overflow-hidden relative border border-neutral-200/30">
          <div className="h-full rounded-full transition-all duration-750 ease-out" 
            style={{ width: `${completenessScore}%`, backgroundColor: theme.accent }} />
        </div>
      </div>

      {/* Stats bar — per mode */}
      <div className={`flex items-center rounded-2xl border ${theme.cardBorder} ${theme.cardBg} overflow-hidden`}>
        {(activeMode === 'bff' ? [
          { label: 'BFF Squads', value: displayPersona.bffCrew ? displayPersona.bffCrew.length : 0 },
          { label: 'Memories', value: personaMoments.length },
          { label: 'Close Friends', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
        ] : activeMode === 'bizz' ? [
          { label: 'Connections', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
          { label: 'Skills', value: displayPersona.bizzSkills ? displayPersona.bizzSkills.length : 0 },
          { label: 'Events', value: displayPersona.pastTimeline ? displayPersona.pastTimeline.length : 0 },
        ] : [
          { label: 'Mixers', value: displayPersona.activeTickets ? displayPersona.activeTickets.length : 0 },
          { label: 'Connections', value: displayPersona.connectionsMet ? displayPersona.connectionsMet.length : 0 },
          { label: 'Profile Vibe', value: `${completenessScore}%` },
        ]).map((s, i, arr) => (
          <div key={i} className={`flex-1 py-3 text-center ${i < arr.length - 1 ? 'border-r border-neutral-200/50' : ''}`}>
            <div className={`text-lg font-black tracking-tight ${theme.textAccent}`}>{s.value}</div>
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <hr className="border-neutral-100" />

      {/* Internal Info */}
      <div>
        <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Internal Status</h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-left">
          <div>
            <div className="text-[10.5px] text-neutral-500 font-bold uppercase tracking-wider">User Type</div>
            <div className="text-xs font-bold text-neutral-700 mt-0.5">
              {activeMode === 'bizz' ? 'Founder / Builder' : activeMode === 'bff' ? 'Hobbyist Mixer' : 'Social Connector'}
            </div>
          </div>
          <div>
            <div className="text-[10.5px] text-neutral-500 font-bold uppercase tracking-wider">Association</div>
            <div className="text-xs font-bold text-neutral-700 mt-0.5">Vayo Offline Hub (Bangalore)</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10.5px] text-neutral-500 font-bold uppercase tracking-wider">Source / Verification</div>
            <div className="text-xs font-bold text-neutral-700 mt-0.5 flex items-center gap-1 justify-start">
              {currentPersona.selfieVerified && <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline shrink-0" />}
              <span>{currentPersona.selfieVerified ? 'Selfie Verified' : 'Standard'}</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Upcoming Events Carousel */}
      {(() => {
        const event = upcomingEvents[currentEventIdx];
        
        if (isEventsLoading) {
          return (
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
              <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border border-neutral-100 bg-neutral-900 flex flex-col items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider animate-pulse">Syncing mixers…</span>
              </div>
            </div>
          );
        }

        if (!event) {
          return (
            <div className="space-y-4">
              <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
              <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border-2 border-dashed border-neutral-100 bg-neutral-50 flex flex-col items-center justify-center gap-2 text-center px-6">
                <Calendar className="w-8 h-8 text-neutral-200" />
                <div className="text-xs font-bold text-neutral-400">No Events Scheduled</div>
                <p className="text-[10px] text-neutral-300 max-w-[180px]">Check back later or follow us on social media for event updates.</p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest">Upcoming Events</h5>
            <div className="relative w-full h-[220px] sm:h-[280px] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border border-neutral-100 bg-neutral-900 group">
              {/* Interactive clickable overlay */}
              <div 
                onClick={() => {
                  setSelectedEvent(event);
                  setActiveSidebarTab('mixers');
                  triggerToast(`Opening registration for: ${event.title}`);
                }}
                className="absolute inset-0 w-full h-full cursor-pointer z-10"
              >
                {/* Slide image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* "Upcoming Event" Badge */}
                <span className="absolute top-4 left-4 z-20 bg-blue-600 text-white text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  Upcoming Event
                </span>

                {/* Event details container */}
                <div className="absolute bottom-6 left-5 right-5 z-20 flex flex-col gap-2.5 text-left max-w-[calc(100%-40px)] md:max-w-[70%]">
                  {/* Date pill */}
                  <div className="flex items-center gap-1.5 bg-black/45 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] text-white font-bold tracking-wide w-fit">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span>{event.date}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug tracking-tight drop-shadow-md">
                    {event.title}
                  </h4>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[10px] text-neutral-300">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Notch with Arrow Buttons */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-12 z-20 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_-2px_4px_rgba(0,0,0,0.06)]" viewBox="0 0 176 48" fill="none" preserveAspectRatio="none">
                  <path
                    d="M 0 48 C 20 48, 20 0, 40 0 L 136 0 C 156 0, 156 48, 176 48 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M 0 48 C 20 48, 20 0, 40 0 L 136 0 C 156 0, 156 48, 176 48"
                    stroke="rgba(228, 228, 231, 0.8)"
                    strokeWidth="1"
                  />
                </svg>

                <div className="relative z-10 flex gap-4 items-center justify-center pb-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all duration-200 cursor-pointer"
                    aria-label="Previous event"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all duration-200 cursor-pointer"
                    aria-label="Next event"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <hr className="border-neutral-100" />

      {/* ── KARMA SECTION ── */}
      {(() => {
        const isRealUser = currentPersona.id === 'user-profile';
        const karma = isRealUser ? karmaData : {
          total: currentPersona.karmaBalance,
          tier: currentPersona.karmaTier,
          tierIcon: { Explorer: '🔭', Pathfinder: '🧭', Voyager: '🚀', Conqueror: '🌟' }[currentPersona.karmaTier] ?? '🌟',
          nextTier: currentPersona.karmaTier === 'Explorer' ? 'Pathfinder' : currentPersona.karmaTier === 'Pathfinder' ? 'Voyager' : currentPersona.karmaTier === 'Voyager' ? 'Conqueror' : null,
          nextTierMin: currentPersona.karmaTier === 'Explorer' ? 85 : currentPersona.karmaTier === 'Pathfinder' ? 251 : currentPersona.karmaTier === 'Voyager' ? 421 : null,
          tierMin: currentPersona.karmaTier === 'Explorer' ? 0 : currentPersona.karmaTier === 'Pathfinder' ? 85 : currentPersona.karmaTier === 'Voyager' ? 251 : 421,
          progressToNext: currentPersona.karmaPercentage,
          breakdown: {
            profileSetup: { points: currentPersona.karmaBreakdown?.hostSupport ?? 0, max: 5, items: [] },
            eventRsvps: { points: currentPersona.karmaBreakdown?.attendedMixers ?? 0, count: Math.round((currentPersona.karmaBreakdown?.attendedMixers ?? 0) / 0.5) },
            gpsCheckins: { points: currentPersona.karmaBreakdown?.vibeLeader ?? 0 },
            community: { points: currentPersona.karmaBreakdown?.momentContributor ?? 0 },
          },
        };

        const tierMeta = {
          Explorer:   { gradient: 'from-sky-400 to-blue-500',       glow: 'shadow-sky-200',    bar: '#38bdf8',  pill: 'bg-sky-100 text-sky-700 border-sky-200' },
          Pathfinder: { gradient: 'from-amber-400 to-orange-500',   glow: 'shadow-amber-200',  bar: '#fbbf24',  pill: 'bg-amber-100 text-amber-700 border-amber-200' },
          Voyager:    { gradient: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-200', bar: '#a78bfa',  pill: 'bg-violet-100 text-violet-700 border-violet-200' },
          Conqueror:  { gradient: 'from-emerald-400 to-teal-500',   glow: 'shadow-emerald-200',bar: '#34d399',  pill: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        };
        const tm = tierMeta[karma?.tier] || tierMeta.Explorer;
        const pct = Math.min(100, karma?.progressToNext ?? 0);
        const ptsToNext = karma?.nextTierMin ? Math.max(0, karma.nextTierMin - (karma?.total ?? 0)) : 0;

        return (
          <div className="space-y-4">
            <h5 className={`text-[11px] font-extrabold uppercase tracking-widest bg-gradient-to-r ${tm.gradient} bg-clip-text text-transparent`}>Karma Points</h5>

            {isRealUser && isKarmaLoading ? (
              <div className="h-28 rounded-2xl bg-neutral-50/60 border border-neutral-100 flex items-center justify-center gap-2.5">
                <div className="w-4 h-4 border-2 border-neutral-200 border-t-sky-400 rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400">Computing karma…</span>
              </div>
            ) : (
              <>
                {/* Hero card */}
                <div className={`relative rounded-2xl overflow-hidden shadow-lg ${tm.glow}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${tm.gradient} opacity-90`} />
                  <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

                  <div className="relative px-5 py-4 flex items-center gap-4">
                    <div className="text-5xl drop-shadow-md select-none shrink-0">{karma?.tierIcon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-white tracking-tight drop-shadow">{karma?.total ?? 0}</span>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">/ 500</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${tm.pill} bg-white/80 backdrop-blur-sm`}>
                        {karma?.tier} Tier
                      </span>
                    </div>

                    <div className="shrink-0 relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                        <circle cx="24" cy="24" r="19" fill="none" stroke="white" strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 19}`}
                          strokeDashoffset={`${2 * Math.PI * 19 * (1 - Math.min(1, (karma?.total ?? 0) / 84))}`}
                          strokeLinecap="round" className="transition-colors duration-700" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-extrabold text-white leading-none">{Math.min(84, Math.round(karma?.total ?? 0))}</span>
                        <span className="text-[6px] text-white/60 font-bold">/84</span>
                      </div>
                    </div>
                  </div>

                  {karma?.nextTier && (
                    <div className="relative px-5 pb-4 space-y-1">
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-colors duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[8.5px] font-bold text-white/60">
                        <span>{karma.tier}</span>
                        <span className="text-white/90">{ptsToNext} pts → {karma.nextTier}</span>
                      </div>
                    </div>
                  )}
                  {!karma?.nextTier && (
                    <div className="relative px-5 pb-3 text-[9px] font-bold text-white/80">Maximum tier reached 🎉</div>
                  )}
                </div>

                {/* Profile completeness nudge — real users only */}
                {isRealUser && !isKarmaLoading && (() => {
                  const missing = (karma?.breakdown?.profileSetup?.items ?? []).filter(i => !i.done);
                  if (!missing.length) return null;
                  return (
                    <div className="flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-3.5 py-3">
                      <span className="text-base shrink-0 mt-0.5">💡</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-extrabold text-sky-700 mb-2">Complete your profile for more karma</div>
                        <div className="space-y-1.5">
                          {missing.map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-2">
                              <span className="text-[9.5px] text-sky-600/80 font-medium leading-tight">{item.label}</span>
                              <span className="text-[9px] font-extrabold text-emerald-500 shrink-0">+{item.max} pt{item.max > 1 ? 's' : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Locked feature teaser */}
                {(() => {
                  const UNLOCK_AT = 251;
                  const ptsNeeded = Math.max(0, UNLOCK_AT - (karma?.total ?? 0));
                  const alreadyUnlocked = (karma?.total ?? 0) >= UNLOCK_AT;
                  return (
                    <details className="group">
                      <summary className="list-none cursor-pointer select-none">
                        <div className={`flex items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3 transition-colors duration-200
                          ${alreadyUnlocked
                            ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                            : 'border-neutral-200 bg-neutral-50/60 hover:border-sky-200 hover:bg-sky-50/40'
                          }`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg transition-colors
                            ${alreadyUnlocked ? 'bg-emerald-100' : 'bg-neutral-100 group-hover:bg-sky-100'}`}>
                            {alreadyUnlocked ? '🎉' : '🔒'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-extrabold text-neutral-800 leading-tight">Host an Event</div>
                            <div className={`text-[9px] font-semibold mt-0.5 ${alreadyUnlocked ? 'text-emerald-500' : 'text-neutral-400'}`}>
                              {alreadyUnlocked ? 'Feature unlocked · Voyager tier' : 'Tap to see how to unlock'}
                            </div>
                          </div>
                          {!alreadyUnlocked && (
                            <svg className="w-3.5 h-3.5 text-neutral-300 group-open:rotate-180 transition-transform duration-200 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                          )}
                        </div>
                      </summary>

                      {!alreadyUnlocked && (
                        <div className="mt-2 px-1 space-y-2.5">
                          {/* Points needed */}
                          <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-100 px-3.5 py-3">
                            <div>
                              <div className="text-[10.5px] font-extrabold text-neutral-700">Points required</div>
                              <div className="text-[9px] text-neutral-400 font-medium mt-0.5">Reach Voyager tier to host</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[18px] font-black text-neutral-800 leading-none">{UNLOCK_AT}</div>
                              <div className="text-[8px] font-bold text-neutral-300 uppercase tracking-wider">pts needed</div>
                            </div>
                          </div>

                          {/* Progress toward unlock */}
                          <div className="space-y-1.5 px-0.5">
                            <div className="flex justify-between text-[8.5px] font-bold">
                              <span className="text-neutral-400">Your karma</span>
                              <span className="text-sky-500">{ptsNeeded} pts to go</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full transition-colors duration-700"
                                style={{ width: `${Math.min(100, ((karma?.total ?? 0) / UNLOCK_AT) * 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[7.5px] text-neutral-300 font-medium">
                              <span>{karma?.total ?? 0} pts</span>
                              <span>{UNLOCK_AT} pts</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </details>
                  );
                })()}
              </>
            )}
          </div>
        );
      })()}

      <hr className="border-neutral-100" />

      {/* Vibe Profile Tags Section */}
      <div>
        <h5 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Vibe Profile Tags</h5>
        <div className="flex flex-wrap gap-1.5 justify-start">
          {(activeMode === 'social' ? currentPersona.socialTags : activeMode === 'bff' ? currentPersona.bffTags : currentPersona.bizzTags).map((tag, i) => (
            <span key={i} className={`text-[10.5px] font-bold px-2.5 py-1 rounded-xl border ${theme.badgeBg}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bizz Skills block */}
      {activeMode === 'bizz' && (
        <>
          <hr className="border-neutral-100" />
          <div>
            <h5 className="text-[11px] font-bold text-teal-650 uppercase tracking-widest mb-3">Skills & Expertise</h5>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {editDraft.bizzSkills.map((skill, i) => (
                    <span key={i} className={`flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                      <Zap className="w-3 h-3" style={{ color: theme.accent }} />{skill}
                      <button onClick={() => setEditDraft(p => ({ ...p, bizzSkills: p.bizzSkills.filter((_, j) => j !== i) }))} className="ml-0.5 text-neutral-400 hover:text-red-500 cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input value={editDraft.newSkill} onChange={e => setEditDraft(p => ({ ...p, newSkill: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && editDraft.newSkill.trim()) { setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })); } }}
                    className={`flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 bg-white ${theme.cardBorder}`} placeholder="Add a skill… (Enter to add)" />
                  <button onClick={() => { if (editDraft.newSkill.trim()) setEditDraft(p => ({ ...p, bizzSkills: [...p.bizzSkills, p.newSkill.trim()], newSkill: '' })); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: theme.accent }}>Add</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(displayPersona.bizzSkills || []).map((skill, i) => (
                  <span key={i} className={`flex items-center gap-1.5 text-[10.5px] font-bold px-3 py-1.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                    <Zap className={`w-3 h-3`} style={{ color: theme.accent }} />{skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}