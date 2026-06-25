import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Calendar, CalendarPlus, Plus, LogOut } from "lucide-react";

export const AdminSidebar = ({ 
  currentSection, 
  setCurrentSection, 
  isExpanded, 
  setIsSidebarHovered, 
  handleLogout,
  fetchRSVPs,
  password
}) => {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white/90 backdrop-blur-2xl border-t border-vayo-sky flex items-center justify-around py-3 px-6 shadow-[0_-8px_32px_rgba(72,147,198,0.1)]">
        {[
          { id: "waitlist", icon: <Users className="w-5 h-5" />, label: "Ledger" },
          { id: "events", icon: <Calendar className="w-5 h-5" />, label: "Mixers" },
          { id: "rsvps", icon: <CalendarPlus className="w-5 h-5" />, label: "RSVPs" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentSection(item.id);
              if (item.id === "rsvps") fetchRSVPs(password);
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 bg-transparent border-0 cursor-pointer ${
              currentSection === item.id ? "text-vayo-blue scale-110" : "text-slate-400"
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-rose-500 bg-transparent border-0 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-4 top-4 bottom-4 bg-vayo-pale/95 backdrop-blur-xl border border-vayo-sky rounded-[2.5rem] py-8 hidden md:flex flex-col justify-between shadow-xl z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? "w-64 px-6 items-start" : "w-20 px-0 items-center"
          }`}
      >
        {/* Top Branding & Expand/Collapse Toggle */}
        <div className={`flex flex-col items-center gap-4 w-full transition-all duration-300 ${isExpanded ? "px-2" : ""}`}>
          <div className={`flex items-center w-full ${isExpanded ? "justify-start" : "justify-center"}`}>
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform shrink-0">
              {isExpanded ? (
                <Image 
                  src="/assets/vayo-logo.png" 
                  alt="VAYO" 
                  width={90} 
                  height={24} 
                  className="h-5 w-auto object-contain shrink-0 animate-in fade-in zoom-in-95 duration-500" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-vayo-blue flex items-center justify-center shadow-lg shadow-vayo-blue/20 animate-in fade-in zoom-in-95 duration-500">
                  <span className="text-lg font-black text-white tracking-widest leading-none select-none">
                    V
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Center: Navigation Icons */}
        <nav className={`flex flex-col gap-4 w-full transition-all duration-300 ${isExpanded ? "px-2" : "items-center"}`}>
          {[
            { id: "waitlist", label: "Waitlist Ledger", icon: <Users className="w-5 h-5 shrink-0" />, color: "bg-vayo-blue" },
            { id: "events", label: "Mixers Catalog", icon: <Calendar className="w-5 h-5 shrink-0" />, color: "bg-vayo-blue" },
            { id: "rsvps", label: "RSVP Console", icon: <CalendarPlus className="w-5 h-5 shrink-0" />, color: "bg-vayo-light" },
          ].map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentSection(item.id);
                  if (item.id === "rsvps") fetchRSVPs(password);
                }}
                className={`rounded-2xl flex items-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  isExpanded ? "w-full h-12 px-4 justify-start" : "w-12 h-12 justify-center"
                } ${
                  isActive 
                    ? `${item.color} text-white shadow-lg shadow-vayo-blue/20` 
                    : "bg-vayo-alice/60 border border-vayo-sky/40 text-slate-600 hover:text-vayo-blue hover:bg-white/40 hover:border-vayo-sky hover:shadow-md"
                }`}
              >
                <div className={`transition-transform duration-300 ${!isExpanded && isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </div>
                
                <span className={`text-[11px] font-extrabold tracking-wider whitespace-nowrap transition-all duration-500 uppercase overflow-hidden ${
                  isExpanded 
                    ? "opacity-100 translate-x-0 max-w-[200px] ml-3" 
                    : "opacity-0 -translate-x-4 pointer-events-none max-w-0 ml-0"
                }`}>
                  {item.label}
                </span>

                {!isExpanded && (
                  <span className="absolute left-16 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0 z-50">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              setCurrentSection("events");
              setTimeout(() => {
                const formEl = document.getElementById("publish-event-form");
                if (formEl) {
                  formEl.scrollIntoView({ behavior: "smooth", block: "center" });
                  formEl.classList.add("ring-2", "ring-vayo-blue");
                  setTimeout(() => formEl.classList.remove("ring-2", "ring-vayo-blue"), 2000);
                }
              }, 100);
            }}
            className={`rounded-2xl flex items-center transition-all duration-300 cursor-pointer group bg-vayo-alice/60 border border-vayo-sky/40 text-slate-700 hover:text-vayo-blue hover:bg-white/40 hover:border-vayo-sky hover:shadow-md ${
              isExpanded ? "w-full h-12 px-4 justify-start" : "w-12 h-12 justify-center relative"
            }`}
            title="Publish New Event"
          >
            <Plus className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90 duration-500" />
            <span className={`text-[11px] font-extrabold tracking-wider whitespace-nowrap transition-all duration-500 uppercase overflow-hidden ${
              isExpanded 
                ? "opacity-100 translate-x-0 max-w-[200px] ml-3" 
                : "opacity-0 -translate-x-4 pointer-events-none max-w-0 ml-0"
            }`}>
              Publish Event
            </span>
            {!isExpanded && (
              <span className="absolute left-16 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl border border-white/10 translate-x-2 group-hover:translate-x-0 z-50">
                Publish Event
              </span>
            )}
          </button>
        </nav>

        {/* Bottom: Profile / Logout */}
        <div className={`flex flex-col items-center gap-3 w-full transition-all duration-300 ${isExpanded ? "px-2" : ""}`}>
          <div
            className={`rounded-2xl bg-vayo-blue/10 border border-vayo-sky/30 flex items-center text-vayo-blue cursor-default transition-all duration-300 ${
              isExpanded ? "w-full h-12 px-4 gap-3 justify-start" : "w-11 h-11 justify-center"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-vayo-blue text-white flex items-center justify-center text-[10px] font-black shadow-sm shrink-0">
              AD
            </div>
            <span className={`text-[10px] font-black tracking-widest whitespace-nowrap text-slate-700 uppercase transition-all duration-500 overflow-hidden ${
              isExpanded 
                ? "opacity-100 translate-x-0 max-w-[200px] ml-3" 
                : "opacity-0 -translate-x-4 pointer-events-none max-w-0 ml-0"
            }`}>
              Admin Console
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className={`rounded-2xl bg-rose-50/50 hover:bg-rose-500 text-slate-600 hover:text-white border border-rose-100 hover:border-rose-500 transition-all duration-300 cursor-pointer flex items-center group ${
              isExpanded ? "w-full h-12 px-4 gap-3 justify-start" : "w-11 h-11 justify-center"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className={`text-[10px] font-black tracking-widest whitespace-nowrap transition-all duration-500 uppercase overflow-hidden ${
              isExpanded 
                ? "opacity-100 translate-x-0 max-w-[200px] ml-3" 
                : "opacity-0 -translate-x-4 pointer-events-none max-w-0 ml-0"
            }`}>
              Exit Portal
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
