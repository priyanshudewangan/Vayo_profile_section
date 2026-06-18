import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import dynamic from "next/dynamic";
import { Clock, MapPin, ChevronRight, Zap, Calendar, CheckCircle2, Loader2, ArrowRight, Bell, X, AlertCircle } from "lucide-react";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

export default function EventStage({ 
  displayPersona, 
  userTickets, 
  theme, 
  sessionEmail, 
  fetchUserTickets, 
  triggerToast,
  isTicketsLoading,
  upcomingEvents,
  currentEventIdx,
  setCurrentEventIdx
}) {
  const [checkInModalEvent, setCheckInModalEvent] = useState(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [timeLeftObj, setTimeLeftObj] = useState({});

  // Mini-Calendar Logic
  const now = new Date();
  const year = now.getFullYear(); 
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const parseDay = (dateStr) => { const m = dateStr?.match(/(\d+)(?:,|$|\s·)/); return m ? parseInt(m[1]) : null; };
  const eventDays = new Map();
  const allEvents = [
    ...(displayPersona?.activeTickets || []).map(t => ({ name: t.name, date: t.date })), 
    ...(displayPersona?.pastTimeline || []).map(t => ({ name: t.name, date: t.date }))
  ];
  allEvents.forEach(e => { const d = parseDay(e.date); if (d && d <= daysInMonth) { if (!eventDays.has(d)) eventDays.set(d, []); eventDays.get(d).push(e.name); } });
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const today = now.getDate();

  const nextTkt = displayPersona?.activeTickets ? displayPersona.activeTickets[0] : null;

  // --- Helper Functions from Main Page ---
  const getCheckInStatus = (dateStr) => {
    if (!dateStr) return { available: false, timeToStart: 'Unknown', diffMins: 999 };
    try {
      let eventDate = new Date(dateStr);
      if (isNaN(eventDate.getTime())) {
        const parts = dateStr.split(',').map(s => s.trim());
        const currentYear = new Date().getFullYear();
        if (parts.length > 1) {
          eventDate = new Date(`${parts[0]} ${currentYear} ${parts[1]}`);
        } else {
          const spaceParts = dateStr.split(' ');
          if (spaceParts.length >= 2) {
             eventDate = new Date(`${spaceParts[0]} ${spaceParts[1]} ${currentYear} ${spaceParts.slice(2).join(' ')}`);
          }
        }
      }
      if (isNaN(eventDate.getTime())) {
        const cleaned = dateStr.replace(/-/g, ' ').replace(/,/g, ' ');
        eventDate = new Date(cleaned);
      }
      if (isNaN(eventDate.getTime())) return { available: false, timeToStart: 'Unknown', diffMins: 999 };

      const nowTime = new Date();
      const diffMs = eventDate.getTime() - nowTime.getTime();
      const diffMins = diffMs / (1000 * 60);

      const isAvailable = diffMins <= 15 && diffMins >= -240; 
      
      let timeLabel = "";
      if (diffMins > 1440) timeLabel = `Starts in ${Math.round(diffMins/1440)} days`;
      else if (diffMins > 60) timeLabel = `Starts in ${Math.round(diffMins/60)}h`;
      else if (diffMins > 15) timeLabel = `Starts in ${Math.round(diffMins)}m`;
      else if (diffMins < -240) timeLabel = "Event Ended";
      else timeLabel = "Active Now";

      return { available: isAvailable, timeToStart: timeLabel, diffMins };
    } catch (e) {
      return { available: false, timeToStart: 'Unknown', diffMins: 999 };
    }
  };

  const handleCheckIn = async (event, sessionEmail) => {
    if (isVerifyingLocation) return;
    setIsVerifyingLocation(true);
    triggerToast("📡 Accessing GPS satellites...");

    if (!navigator.geolocation) {
      triggerToast("GPS not supported on this device.");
      setIsVerifyingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch("/api/rsvp/check-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sessionEmail, eventId: event.id || event.event_id, userLat: latitude, userLng: longitude })
          });
          const data = await response.json();
          if (response.ok && data.success) {
            triggerToast(data.message || "Attendance Verified! +20 Karma");
            setCheckInModalEvent(null);
            fetchUserTickets(sessionEmail);
          } else {
            setCheckInModalEvent({ ...event, error: data.error, distance: data.distance });
            triggerToast(data.error || "Verification failed.");
          }
        } catch (err) {
          triggerToast("Network error. Please try again.");
        } finally {
          setIsVerifyingLocation(false);
        }
      },
      (error) => {
        let msg = "Location access denied.";
        if (error.code === 2) msg = "GPS signal lost. Try moving outdoors.";
        if (error.code === 3) msg = "GPS request timed out.";
        triggerToast(msg);
        setIsVerifyingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top row: Next-up card + calendar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <h5 className={`text-[12px] font-bold uppercase tracking-widest ${theme.textAccent} font-sans`}>Event Stage</h5>
          {nextTkt ? (
            <div className="flex-1 rounded-xl p-4 border border-neutral-100 bg-white/80 shadow-sm space-y-2.5" style={{ backdropFilter: 'blur(8px)' }}>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Next Up</span>
              <div className="text-[14px] font-extrabold text-neutral-800 leading-tight">{nextTkt.name}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
                {nextTkt.date.split(',')[0]}
                {nextTkt.date.split(',')[1] && <span className="text-neutral-500">{nextTkt.date.split(',')[1]}</span>}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
                <span className="truncate">{nextTkt.locationPin}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {nextTkt.organizer}
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-xl p-4 border border-neutral-100 bg-white/70 shadow-sm flex items-center justify-center text-sm text-neutral-500">
              No upcoming tickets
            </div>
          )}
        </div>
        <div className="w-full sm:w-[180px] shrink-0 rounded-xl relative self-stretch" style={{ background: `linear-gradient(145deg, ${theme.accent}28 0%, ${theme.accent}0a 100%)`, border: `1px solid rgba(255,255,255,0.7)`, boxShadow: `0 4px 24px ${theme.accent}1a, 0 1px 3px rgba(0,0,0,0.05)` }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)' }} />
          <div className="relative z-10 p-3 h-full flex flex-col" style={{ backdropFilter: 'blur(14px)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" style={{ color: theme.accent }} />
                <span className="text-[11px] font-extrabold text-neutral-800">{monthName.slice(0, 3)} &apos;{String(year).slice(2)}</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${theme.accent}30`, color: theme.accent }}>
                {eventDays.size} events
              </span>
            </div>
            <div className="grid grid-cols-7 mb-[4px]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[8.5px] font-extrabold text-neutral-500 leading-none pb-[3px]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1">
              {cells.map((day, i) => {
                const events = day ? eventDays.get(day) : null;
                const isToday = day === today;
                const col = i % 7;
                const tipAnchor = col <= 2 ? 'left-0' : col >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                return (
                  <div key={i} className="relative flex flex-col items-center justify-start py-[2px] group cursor-default">
                    {day && (
                      <>
                        <span onClick={() => { if (events) { triggerToast(`Events on ${monthName} ${day}: ${events.join(', ')}`); } }} className={`text-[10px] font-bold w-[24px] h-[24px] flex items-center justify-center rounded-full leading-none transition-all duration-300 ${events ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}`} style={isToday ? { background: theme.accent, color: '#fff', boxShadow: `0 0 0 2px ${theme.accent}35`, zIndex: 5 } : events ? { background: `${theme.accent}25`, color: theme.accent, fontWeight: '900' } : { color: '#64748b' }}>
                          {day}
                        </span>
                        {events ? <span className={`w-1 h-1 rounded-full mt-1 ${isToday ? 'bg-white' : ''}`} style={{ background: isToday ? '#fff' : theme.accent }} /> : <span className="w-1 h-1 opacity-0 mt-1" />}
                        {events && (
                          <div className={`absolute bottom-full mb-1.5 z-50 hidden group-hover:block group-active:block w-32 pointer-events-none ${tipAnchor}`}>
                            <div className="rounded-lg px-2.5 py-2 text-[9px] font-bold text-white shadow-2xl animate-in zoom-in-95 duration-200" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}ee)`, backdropFilter: 'blur(8px)' }}>
                              {events.map((ev, j) => <div key={j} className="truncate">• {ev}</div>)}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h5 className="text-[12px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 font-sans">
            Live Tickets <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </h5>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchUserTickets(sessionEmail); triggerToast("Syncing your latest ticket status..."); }} className="p-1.5 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors cursor-pointer group" title="Refresh Tickets">
              <Bell className={`w-3.5 h-3.5 ${isTicketsLoading ? 'animate-spin' : 'group-hover:rotate-12'}`} />
            </button>
            {displayPersona?.activeTickets?.length > 1 && (
              <div className="flex items-center gap-1.5 bg-blue-50/50 px-2 py-1 rounded-full border border-blue-100/50">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Swipe for More</span>
                <ArrowRight className="w-2.5 h-2.5 text-blue-500 animate-bounce-x" />
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {displayPersona?.activeTickets?.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 px-1 snap-x snap-mandatory scrollbar-none no-scrollbar -mx-1">
              {displayPersona.activeTickets
                .filter(tkt => (tkt.status || "").toLowerCase() !== 'cancelled' && (tkt.status || "").toLowerCase() !== 'canceled')
                .map((tkt, i) => {
                 const isToday = tkt.date && tkt.date.includes(new Date().getDate().toString()) && tkt.date.includes(new Date().toLocaleString('default', { month: 'short' }));
                 return (
                <div key={i} className="min-w-[280px] sm:min-w-[400px] md:min-w-full snap-center space-y-4">
                  <div className={`border rounded-2xl overflow-hidden flex flex-col md:flex-row bg-white shadow-md transition-all duration-500 hover:shadow-xl ${isToday ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-neutral-200'}`}>
                    <div className="w-full md:w-[150px] h-[120px] md:h-auto shrink-0 relative overflow-hidden bg-neutral-105 border-b md:border-b-0 md:border-r border-neutral-200">
                      <img src={tkt.image || "/assets/events/something.jpg"} alt={tkt.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                    </div>
                    <div className="flex-1 p-5 md:p-6 space-y-5 border-b border-dashed md:border-b-0 md:border-r border-neutral-200 relative">
                      <div className="absolute left-[-7px] bottom-[-7px] md:left-auto md:bottom-auto md:right-[-7px] md:top-[-7px] w-3.5 h-3.5 rounded-full bg-neutral-50 border border-neutral-200" />
                      <div className="absolute right-[-7px] bottom-[-7px] w-3.5 h-3.5 rounded-full bg-neutral-50 border border-neutral-200" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className={`text-[10px] font-extrabold uppercase tracking-widest ${theme.textAccent}`}>Upcoming Mixer Ticket</div>
                          {isToday && <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse shadow-sm">Happening Today</span>}
                        </div>
                        <h4 className="text-base font-extrabold text-neutral-800 leading-tight line-clamp-2 md:line-clamp-none h-10 md:h-auto">{tkt.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-neutral-400 font-bold block text-[10px] uppercase tracking-widest">Date & Time</span>
                          <span className="font-bold text-neutral-700 flex items-center gap-1.5 text-[12px] md:text-sm"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 shrink-0" />{tkt.date.split(',')[0]}</span>
                          <span className="text-[10px] md:text-[11px] text-neutral-500 block pl-5 md:pl-5.5">{tkt.date.split(',')[1]}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-neutral-400 font-bold block text-[10px] uppercase tracking-widest">Venue Location</span>
                          <span className="font-bold text-neutral-700 flex items-center gap-1.5 text-[12px] md:text-sm max-w-[150px] truncate" title={tkt.locationPin}><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400 shrink-0" />{tkt.locationPin}</span>
                          {(tkt.lat || tkt.latitude) && (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${tkt.lat || tkt.latitude},${tkt.lng || tkt.longitude}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 uppercase hover:underline flex items-center gap-0.5 mt-1.5 active:scale-95 transition-transform w-fit">
                              Get Directions <ChevronRight className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600 uppercase shadow-inner">{tkt.organizer.charAt(0)}</div>
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-500 block font-bold uppercase tracking-wider">Host</span>
                            <span className="font-bold text-neutral-700 truncate max-w-[80px] block">{tkt.organizer}</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono tabular-nums">
                          <Clock className="w-3 h-3" />
                          {getCheckInStatus(tkt.date).timeToStart}
                        </span>
                      </div>
                    </div>
                    {/* Right QR Stub */}
                    <div className="w-full md:w-[150px] p-5 md:p-6 flex flex-col items-center justify-center bg-neutral-50 shrink-0 border-t md:border-t-0 md:border-l border-neutral-100 relative">
                      <div className="p-2 border border-neutral-200 rounded-xl shadow-lg bg-white mb-2 md:mb-3 group-hover:rotate-1 transition-transform">
                        <QRCodeSVG value={tkt.qrCode || `VAYO-TKT-${tkt.id}`} size={72} level="M" includeMargin={false} />
                      </div>
                      <span className="text-[10px] md:text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">{tkt.qrCode}</span>
                      {(() => {
                        const status = getCheckInStatus(tkt.date);
                        const isVerified = tkt.status === "Attended";
                        if (isVerified) {
                          return (
                            <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center justify-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </div>
                          );
                        }
                        if (status.available) {
                          return (
                            <button onClick={() => handleCheckIn(tkt, sessionEmail)} disabled={isVerifyingLocation} className={`w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 ${isVerifyingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}>
                              {isVerifyingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                              {isVerifyingLocation ? "Verifying..." : "Check-In Now"}
                            </button>
                          );
                        }
                        return (
                          <button onClick={() => setCheckInModalEvent(tkt)} className={`w-full py-2.5 rounded-xl border border-neutral-200 bg-neutral-100/50 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-100 cursor-pointer transition-all active:scale-95 shadow-sm flex flex-col items-center justify-center gap-0.5 leading-tight`}>
                            <span>Venue Details</span>
                            <span className="text-[8px] font-bold opacity-70">
                              {status.timeToStart === "Active Now" ? "Check-in is Active" : `Check-in ${status.timeToStart}`}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                  {tkt.lat && tkt.lng && (
                    <LocationMap lat={tkt.lat} lng={tkt.lng} venue={tkt.locationPin} />
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-neutral-50/50">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                <Zap className="w-6 h-6 text-neutral-300" />
              </div>
              <div className="text-sm font-extrabold text-neutral-800">No Active Tickets</div>
              <p className="text-[11px] text-neutral-500 max-w-[220px] font-medium leading-relaxed">Once your RSVP is approved, your live entry ticket will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Event Journey Stepper */}
      <div>
        <h5 className="text-[12px] font-bold text-blue-600 uppercase tracking-widest mb-4 font-sans">Event Journey</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userTickets?.length > 0 ? (
            userTickets.slice(0, 2).map((tkt, i) => {
              const eventStatus = tkt.status || 'Registered';
              const steps = ['Registered', 'Processing', 'Confirmed'];
              let stepIdx = 0;
              const s = eventStatus.toLowerCase();
              if (s === 'confirmed' || s === 'completed' || s === 'attended') stepIdx = 2;
              else if (s === 'processing' || s === 'payment_pending') stepIdx = 1;
              const isConfirmed = stepIdx === 2;
              const accentColor = isConfirmed ? '#10b981' : '#6366f1';

              return (
                <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-neutral-800 truncate max-w-[160px]">{tkt.event_title}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Status</span>
                  </div>
                  <div className="hidden sm:flex items-center justify-between relative px-3 pt-1">
                    <div className="absolute top-[14px] left-10 right-10 h-0.5 bg-neutral-100 z-0">
                      <div className="h-full transition-all duration-700 ease-out" style={{ width: stepIdx === 2 ? '100%' : stepIdx === 1 ? '50%' : '0%', backgroundColor: accentColor }} />
                    </div>
                    {steps.map((label, step) => {
                      const isCurrent = step === stepIdx;
                      const isDone = step <= stepIdx;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all duration-500 bg-white ${isDone ? '' : 'border-neutral-200 text-neutral-400'}`} style={isDone ? { borderColor: accentColor, backgroundColor: accentColor, color: '#fff' } : isCurrent ? { borderColor: accentColor, color: accentColor, borderWidth: '2px' } : {}}>
                            {isDone ? '✓' : step + 1}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider mt-2.5 transition-colors duration-500 ${isDone ? 'text-neutral-700' : 'text-neutral-500'}`}>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Latest Update</span>
                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accentColor }}>{eventStatus}</span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-10 border-2 border-dashed border-neutral-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-neutral-50/20">
               <Calendar className="w-10 h-10 text-neutral-200" />
               <div className="text-sm font-bold text-neutral-400">No Journey Trackers</div>
               <p className="text-[11px] text-neutral-400 max-w-[240px] leading-relaxed">Track the real-time status of your mixer applications and registrations here.</p>
            </div>
          )}
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Past Timeline */}
      <div>
        <h5 className="text-[12px] font-bold text-blue-600 uppercase tracking-widest mb-4 font-sans">Past Timeline</h5>
        <div className="relative border-l-2 border-neutral-100 ml-2.5 pl-6 space-y-6 pt-1">
          {(displayPersona?.pastTimeline || []).map((past, i) => (
            <div key={i} className="relative">
              <span className="absolute left-[-32px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125" style={{ background: theme.accent }} />
              <div className="leading-tight">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{past.date}</span>
                <div className="text-sm font-black text-neutral-800 mt-1">{past.name}</div>
                <div className="flex gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                  <span>{past.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Venue Modal */}
      {checkInModalEvent && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 relative border border-neutral-100">
            <button onClick={() => setCheckInModalEvent(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-500 rounded-full hover:bg-neutral-200 transition-colors z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2 text-center pt-2">
                <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-neutral-800 leading-tight">{checkInModalEvent.name || checkInModalEvent.event_title}</h3>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{checkInModalEvent.date || checkInModalEvent.event_date}</p>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><MapPin className="w-4 h-4 text-neutral-400" /></div>
                  <div className="pt-1">
                    <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Venue Destination</div>
                    <div className="text-sm font-bold text-neutral-700">{checkInModalEvent.locationPin || checkInModalEvent.venue || "TBD"}</div>
                  </div>
                </div>
                {(checkInModalEvent.lat || checkInModalEvent.latitude) && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${checkInModalEvent.lat || checkInModalEvent.latitude},${checkInModalEvent.lng || checkInModalEvent.longitude}`} target="_blank" rel="noopener noreferrer" className="w-full mt-2 py-3 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 transition-colors active:scale-95">
                    Open in Maps <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
              {checkInModalEvent.error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="text-[11px] text-red-600 font-semibold leading-relaxed">{checkInModalEvent.error}</div>
                </div>
              )}
              {(() => {
                const status = getCheckInStatus(checkInModalEvent.date || checkInModalEvent.event_date);
                if (status.available) {
                  return (
                    <button onClick={() => handleCheckIn(checkInModalEvent, sessionEmail)} disabled={isVerifyingLocation} className={`w-full py-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500 text-white text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:border-emerald-600 cursor-pointer transition-all active:scale-95 ${isVerifyingLocation ? 'opacity-80 cursor-wait' : ''}`}>
                      {isVerifyingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      {isVerifyingLocation ? "Verifying GPS..." : "Verify Attendance Now"}
                    </button>
                  );
                }
                if (status.timeToStart === "Event Ended") {
                  return <div className="w-full py-4 rounded-2xl border-2 border-neutral-200 bg-neutral-100 text-neutral-400 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">Event Has Ended</div>;
                }
                return (
                  <div className="text-center space-y-1 pt-2">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{status.timeToStart === "Active Now" ? "Check-in is" : "Check-in unlocks in"}</div>
                    <div className="text-lg font-black text-neutral-700">{status.timeToStart}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}