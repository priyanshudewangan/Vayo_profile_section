"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Calendar, CalendarPlus, LogOut, ChevronRight } from "lucide-react";

const MIXER_TYPES = [
  { type: "all",        label: "All Mixers",   emoji: "📋", desc: "View everything" },
  { type: "event",      label: "Events",       emoji: "🎉", desc: "Organised gatherings" },
  { type: "experience", label: "Experiences",  emoji: "✨", desc: "Curated activities" },
  { type: "meetup",     label: "Meetups",      emoji: "☕", desc: "Casual hangouts" },
];

export const AdminSidebar = ({
  currentSection,
  setCurrentSection,
  isExpanded,
  setIsSidebarHovered,
  handleLogout,
  fetchRSVPs,
  password,
  catalogTypeFilter,
  onSelectEventType,
}) => {
  const [showMixerFlyout, setShowMixerFlyout] = useState(false);
  const isEventsActive = currentSection === "events";

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white/90 backdrop-blur-2xl border-t border-vayo-sky flex items-center justify-around py-3 px-6 shadow-[0_-8px_32px_rgba(72,147,198,0.1)]">
        {[
          { id: "waitlist", icon: <Users className="w-5 h-5" />, label: "Ledger" },
          { id: "rsvps", icon: <CalendarPlus className="w-5 h-5" />, label: "RSVPs" },
        ].map((item) => (
          <button key={item.id}
            onClick={() => { setCurrentSection(item.id); if (item.id === "rsvps") fetchRSVPs(password); }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 bg-transparent border-0 cursor-pointer ${currentSection === item.id ? "text-vayo-blue scale-110" : "text-slate-400"}`}>
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button onClick={() => { setCurrentSection("events"); onSelectEventType("all"); }}
          className={`flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer transition-all duration-300 ${isEventsActive ? "text-vayo-blue scale-110" : "text-slate-400"}`}>
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Mixers</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-rose-500 bg-transparent border-0 cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => { setIsSidebarHovered(false); setShowMixerFlyout(false); }}
        className={`fixed left-4 top-4 bottom-4 bg-vayo-pale/95 backdrop-blur-xl border border-vayo-sky rounded-[2.5rem] py-8 hidden md:flex flex-col justify-between shadow-xl z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? "w-64 px-6 items-start" : "w-20 px-0 items-center"
        }`}
      >
        {/* Branding */}
        <div className={`flex flex-col items-center gap-4 w-full ${isExpanded ? "px-2" : ""}`}>
          <div className={`flex items-center w-full ${isExpanded ? "justify-start" : "justify-center"}`}>
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform shrink-0">
              {isExpanded ? (
                <Image src="/assets/vayo-logo.png" alt="VAYO" width={90} height={24} className="h-5 w-auto object-contain animate-in fade-in zoom-in-95 duration-500" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-vayo-blue flex items-center justify-center shadow-lg shadow-vayo-blue/20">
                  <span className="text-lg font-black text-white leading-none select-none">V</span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex flex-col gap-3 w-full ${isExpanded ? "px-2" : "items-center"}`}>

          {/* Waitlist */}
          <SidebarBtn isExpanded={isExpanded} isActive={currentSection === "waitlist"}
            icon={<Users className="w-5 h-5 shrink-0" />} label="Waitlist Ledger" color="bg-vayo-blue"
            onClick={() => setCurrentSection("waitlist")} />

          {/* Mixers — flyout on hover */}
          <div className="relative w-full flex justify-center"
            onMouseEnter={() => setShowMixerFlyout(true)}
            onMouseLeave={() => setShowMixerFlyout(false)}
          >
            <button
              onClick={() => { setCurrentSection("events"); onSelectEventType("all"); }}
              className={`rounded-2xl flex items-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                isExpanded ? "w-full h-12 px-4 justify-between" : "w-12 h-12 justify-center"
              } ${
                isEventsActive
                  ? "bg-vayo-blue text-white shadow-lg shadow-vayo-blue/20"
                  : "bg-vayo-alice/60 border border-vayo-sky/40 text-slate-600 hover:text-vayo-blue hover:bg-white/40 hover:border-vayo-sky hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className={`text-[11px] font-extrabold tracking-wider whitespace-nowrap uppercase transition-all duration-500 overflow-hidden ${
                  isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 pointer-events-none max-w-0"
                }`}>
                  Mixers Catalog
                </span>
              </div>
              {isExpanded && (
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${showMixerFlyout ? "opacity-100 translate-x-0.5" : "opacity-40"}`} />
              )}
              {/* Collapsed tooltip */}
              {!isExpanded && !showMixerFlyout && (
                <span className="absolute left-16 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0 z-50">
                  Mixers Catalog
                </span>
              )}
            </button>

            {/* Flyout panel — pl-4 bridges the gap so hover stays continuous */}
            <div className={`absolute left-full top-1/2 -translate-y-1/2 z-[200] pl-4 transition-all duration-300 ${
              showMixerFlyout ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-3 pointer-events-none"
            }`}>
              {/* Arrow pointing left */}
              <div className="absolute left-[10px] top-1/2 -translate-y-1/2 w-3 h-3 bg-vayo-pale border-l border-t border-vayo-sky rotate-[-45deg] rounded-sm" />

              <div className="bg-vayo-pale/98 backdrop-blur-2xl border border-vayo-sky rounded-3xl shadow-2xl shadow-vayo-blue/15 p-3 flex flex-col gap-1 min-w-[210px]">
                <p className="text-[8px] font-black uppercase tracking-[3px] text-slate-500 px-3 pt-1 pb-1">Browse by type</p>
                {MIXER_TYPES.map(item => {
                  const isActive = isEventsActive && catalogTypeFilter === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() => { onSelectEventType(item.type); setShowMixerFlyout(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer group/item ${
                        isActive
                          ? "bg-vayo-blue text-white shadow-md shadow-vayo-blue/20"
                          : "hover:bg-vayo-alice border border-transparent hover:border-vayo-sky/60"
                      }`}
                    >
                      <span className="text-lg leading-none shrink-0">{item.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase tracking-wider leading-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] font-semibold leading-tight mt-0.5 ${isActive ? "text-white/75" : "text-slate-500"}`}>
                          {item.desc}
                        </span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-all duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover/item:opacity-50 -translate-x-1 group-hover/item:translate-x-0"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RSVPs */}
          <SidebarBtn isExpanded={isExpanded} isActive={currentSection === "rsvps"}
            icon={<CalendarPlus className="w-5 h-5 shrink-0" />} label="RSVP Console" color="bg-vayo-light"
            onClick={() => { setCurrentSection("rsvps"); fetchRSVPs(password); }} />
        </nav>

        {/* Bottom */}
        <div className={`flex flex-col items-center gap-3 w-full ${isExpanded ? "px-2" : ""}`}>
          <div className={`rounded-2xl bg-vayo-blue/10 border border-vayo-sky/30 flex items-center text-vayo-blue cursor-default transition-all duration-300 ${
            isExpanded ? "w-full h-12 px-4 gap-3 justify-start" : "w-11 h-11 justify-center"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-vayo-blue text-white flex items-center justify-center text-[10px] font-black shadow-sm shrink-0">AD</div>
            <span className={`text-[10px] font-black tracking-widest whitespace-nowrap text-slate-700 uppercase transition-all duration-500 overflow-hidden ${
              isExpanded ? "opacity-100 max-w-[200px] ml-3" : "opacity-0 pointer-events-none max-w-0 ml-0"
            }`}>Admin Console</span>
          </div>
          <button onClick={handleLogout}
            className={`rounded-2xl bg-rose-50/50 hover:bg-rose-500 text-slate-600 hover:text-white border border-rose-100 hover:border-rose-500 transition-all duration-300 cursor-pointer flex items-center group ${
              isExpanded ? "w-full h-12 px-4 gap-3 justify-start" : "w-11 h-11 justify-center"
            }`}>
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className={`text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all duration-500 overflow-hidden ${
              isExpanded ? "opacity-100 max-w-[200px] ml-3" : "opacity-0 pointer-events-none max-w-0 ml-0"
            }`}>Exit Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};

function SidebarBtn({ isExpanded, isActive, icon, label, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`rounded-2xl flex items-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
        isExpanded ? "w-full h-12 px-4 justify-start" : "w-12 h-12 justify-center"
      } ${isActive ? `${color} text-white shadow-lg shadow-vayo-blue/20` : "bg-vayo-alice/60 border border-vayo-sky/40 text-slate-600 hover:text-vayo-blue hover:bg-white/40 hover:border-vayo-sky hover:shadow-md"}`}>
      <div className={`transition-transform duration-300 ${!isExpanded && isActive ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-extrabold tracking-wider whitespace-nowrap uppercase transition-all duration-500 overflow-hidden ${
        isExpanded ? "opacity-100 max-w-[200px] ml-3" : "opacity-0 pointer-events-none max-w-0 ml-0"
      }`}>{label}</span>
      {!isExpanded && (
        <span className="absolute left-16 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0 z-50">
          {label}
        </span>
      )}
    </button>
  );
}
