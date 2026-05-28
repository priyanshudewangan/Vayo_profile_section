"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EventShowcase from "@/components/EventShowcase";
import WaveBackground from "@/components/WaveBackground";

export default function Home() {
  const [email, setEmail] = useState("");
  const [bottomEmail, setBottomEmail] = useState("");
  const router = useRouter();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    router.push(`/join?email=${encodeURIComponent(email)}`);
  };

  const handleBottomEmailSubmit = (e) => {
    e.preventDefault();
    if (!bottomEmail) return;
    router.push(`/join?email=${encodeURIComponent(bottomEmail)}`);
  };

  const handleScrollToFeatures = () => {
    document.getElementById("vayo-way")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-16 md:h-20 bg-black/10 backdrop-blur-md md:bg-transparent border-b border-white/5 md:border-b-0 transition-all duration-300">
        <Link href="/" className="flex items-center decoration-none px-3.5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/8 shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
          <img src="/assets/vayo-logo.png" alt="VAYO Logo" className="h-5 md:h-6 w-auto group-hover:scale-105 group-hover:brightness-110 transition-all duration-300" />
        </Link>
        <div className="flex items-center">
          <Link href="/join" className="flex items-center justify-center decoration-none px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/8 shadow-lg text-white text-xs md:text-sm font-semibold hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,255,255,0.08)] transition-all duration-300 whitespace-nowrap">
            Get In Touch ↗
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 py-24 overflow-hidden">
        <div className="relative z-20 w-full max-w-[600px] flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 md:mb-10 bg-white/5 backdrop-blur-md border border-white/8 text-[11px] md:text-xs font-bold text-violet-200 tracking-[1.5px] uppercase shadow-lg shadow-indigo-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-badge"></div>
            Stop Searching. Start Belonging.
          </div>
          <div className="text-xs md:text-sm font-bold text-white tracking-[4px] uppercase mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            WELCOME TO
          </div>
          <h1 className="mb-2 leading-none">
            <img src="/assets/vayo-logo.png" alt="VAYO" className="h-[80px] md:h-[180px] w-auto mx-auto drop-shadow-[0_0_32px_rgba(99,102,241,0.55)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-shimmer" />
          </h1>
          <p className="text-xl md:text-4xl font-light bg-gradient-to-r from-white/92 to-violet-300/90 bg-clip-text text-transparent italic mb-4 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] leading-tight">
            Let's Do It.
          </p>
          <p className="text-sm md:text-lg max-w-[540px] text-violet-100/82 mx-auto mb-6 leading-relaxed font-normal px-3 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
            Discover people who match your vibe. <br /> No searching. Just belonging.
          </p>

          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full max-w-[480px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-full p-2 sm:p-1 pl-4 sm:pl-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-indigo-500/40 focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.15)] mt-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-transparent border-0 outline-0 text-sm font-normal text-white py-2.5 sm:py-2 w-full placeholder:text-violet-200/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="bg-white text-slate-950 border-0 outline-0 rounded-xl sm:rounded-full px-5 py-3 sm:py-2.5 text-xs md:text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] active:translate-y-0 transition-all duration-200 whitespace-nowrap">
              Join waitlist &rarr;
            </button>
          </form>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity duration-300 z-30" onClick={handleScrollToFeatures}>
          <div className="w-5 h-8 border border-white/30 rounded-full relative flex justify-center">
            <div className="w-[3px] h-1.5 bg-white rounded-full absolute top-1.5 animate-scroll"></div>
          </div>
          <span className="text-[10px] font-bold text-violet-200/40 tracking-[4px] uppercase pl-1">DISCOVER NOW</span>
        </div>
      </section>

      {/* Philosophy / Benefits Section */}
      <section id="vayo-way" className="relative z-10 px-6 py-24 md:py-32 max-w-6xl mx-auto border-t border-white/5">
        <div className="text-center mb-16 md:mb-20">
          <span className="text-xs font-bold text-violet-400 tracking-[3px] uppercase">The Vayo Philosophy</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mt-2">
            Why Vayo Commune?
          </h2>
          <p className="text-sm md:text-base text-white/50 mt-4 max-w-xl mx-auto">
            Online matching is just the starting line. We focus on getting you offline, doing things you love, with people who share your vibe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-8 md:p-10 backdrop-blur-md transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Skip the Swipes</h3>
            <p className="text-sm text-white/60 leading-relaxed font-normal">
              No endless small talk or dead-end profiles. Vayo automatically matches you into tiny, friendly groups based on shared interests and values.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-8 md:p-10 backdrop-blur-md transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Activity-First Vibes</h3>
            <p className="text-sm text-white/60 leading-relaxed font-normal">
              Meeting new people is easier when you're doing something together. We curate board games, dinners, hikes, and sports that keep the vibe casual and stress-free.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-8 md:p-10 backdrop-blur-md transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Verified Hosts</h3>
            <p className="text-sm text-white/60 leading-relaxed font-normal">
              Every Vayo experience is hosted and verified. Safety, quality participation, and a supportive atmosphere are always guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Event Showcase Section */}
      <section className="relative z-10 py-16 border-t border-white/5 bg-black/10">
        <EventShowcase />
      </section>

      {/* Bottom Section with Image Background (Hides body video bg for only CTA & Footer) */}
      <div className="relative w-full overflow-hidden bg-[#050508]">
        {/* Static Background Image (Dimmed for quality mask, with a smooth blend gradient at the top edge) */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[#050508]">
          <img
            src="/assets/bg-footer.png"
            alt="Footer Background"
            className="w-full h-full object-cover opacity-[.72]"
          />
          {/* Top blend overlay to smooth the transition from the showcase background to the footer landscape */}
          <div className="absolute top-0 inset-x-0 h-32 md:h-48 bg-gradient-to-b from-[#050508] via-[#050508]/80 to-transparent"></div>
        </div>

        {/* Bottom CTA Block */}
        <section className="relative z-20 px-6 py-24 md:py-86 max-w-4xl mx-auto text-center">
          <span className="relative z-10 inline-block px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6">
            LAUNCH BENEFITS INCLUDED
          </span>

          <h2 className="relative z-10 text-3xl md:text-5xl font-semibold tracking-tight text-white mb-4 leading-tight">
            Ready to Stop Searching?
          </h2>
          <p className="relative z-10 text-sm md:text-base text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
            Secure early access to VAYO Commune today. Connect with verified people who actually match your offline vibe.
          </p>

          <form onSubmit={handleBottomEmailSubmit} className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full max-w-[480px] mx-auto bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-full p-2 sm:p-1 pl-4 sm:pl-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-indigo-500/40 focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.15)]">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-transparent border-0 outline-0 text-sm font-normal text-white py-2.5 sm:py-2 w-full placeholder:text-violet-200/40"
              value={bottomEmail}
              onChange={(e) => setBottomEmail(e.target.value)}
              required
            />
            <button type="submit" className="bg-white text-slate-950 border-0 outline-0 rounded-xl sm:rounded-full px-5 py-3 sm:py-2.5 text-xs md:text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] active:translate-y-0 transition-all duration-200 whitespace-nowrap">
              Join waitlist &rarr;
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="relative bottom-4 right-0 z-20 left-3 md:left-6 w-[calc(100%-24px)] md:w-[calc(100%-32px)] backdrop-blur-3xl border border-white/[0.08] rounded-[2rem] p-8 md:p-16 pb-0 overflow-hidden bg-black/40" id="footer">
          {/* Subtle top shine */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"></div>

          {/* Ambient Glowing Blobs inside footer */}
          <div className="absolute -top-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[80px] pointer-events-none z-0 animate-float-slow-1"></div>
          <div className="absolute -bottom-[30%] -left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[80px] pointer-events-none z-0 animate-float-slow-2"></div>

          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 md:gap-40 w-full pb-12">
              {/* Left: Logo + Description */}
              <div className="max-w-[360px] mx-auto md:mx-0 text-center md:text-left">
                <Link href="/" className="inline-block mb-5 hover:-translate-y-0.5 hover:brightness-110 transition-all duration-300">
                  <img src="/assets/vayo-logo.png" alt="VAYO Logo" className="h-12 w-auto filter drop-shadow-[0_0_20px_rgba(99,102,241,0.25)] mx-auto md:mx-0" />
                </Link>
                <p className="text-xs md:text-sm leading-relaxed text-violet-200/45 font-normal tracking-wide">
                  Vayo Commune is a community-driven social platform and offline community that helps people meet others through real-life activities, hobbies, and shared experiences rather than just online chatting.
                </p>
              </div>

              {/* Right: Contact Details */}
              <div className="pt-1 text-left">
                <h3 className="text-xs font-bold text-violet-200/85 tracking-[3px] uppercase mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-7 after:h-0.5 after:bg-indigo-500 after:rounded-full">
                  CONTACT
                </h3>

                <div className="flex items-start gap-3.5 mb-5">
                  <svg className="w-[18px] h-[18px] shrink-0 mt-0.5 text-indigo-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 4l-10 8L2 4" />
                  </svg>
                  <div>
                    <p className="text-xs md:text-sm leading-relaxed text-violet-200/40 font-normal">
                      <a href="mailto:vayocommune@gmail.com" className="text-violet-200/40 hover:text-indigo-500 transition-colors duration-300">
                        vayocommune@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-[1px] w-full bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.18)_20%,rgba(99,102,241,0.18)_80%,transparent_100%)]"></div>
            <div className="w-full flex flex-col items-center justify-center py-6 gap-5 text-center flex-wrap">
              <div className="flex items-center gap-2">
                <a href="https://www.youtube.com/@vayobangalore" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-violet-200/40 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-violet-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] transition-all duration-300" aria-label="Youtube" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-violet-200/40 hover:text-violet-300">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.41z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/vayo.bangalore/" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-violet-200/40 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-violet-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] transition-all duration-300" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/vayo-commune/" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-violet-200/40 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-violet-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] transition-all duration-300" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
              <p className="text-[10px] md:text-xs text-violet-200/30 tracking-wider leading-relaxed font-normal text-center">
                &copy; 2026 VAYO Powered by{" "}
                <a href="https://www.laneway.in" className="text-violet-200/40 hover:text-indigo-500 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                  Laneway
                </a>
                . <br />
                All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
