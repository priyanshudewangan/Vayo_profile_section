"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  X, 
  Bookmark, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  ChevronRight 
} from "lucide-react";

// Video sequence from actual community highlights
const vibeVideos = [
  "/assets/Sport_outdor.mp4",
  "/assets/community.mp4",
  "/assets/Board_game.mp4",
  "/assets/HOLI.mp4",
  "/assets/Sankranti_Meetup.mp4",
  "/assets/Cafe_exploring.mp4",
  "/assets/IMG_5839.mp4",
  "/assets/IMG_5822.mp4"
];

// Inline SVG: White outline hand-drawn characters representing VAYO activities (Coffee, Outdoors, Games)
const WalkingVayoDoodles = () => (
  <svg 
    viewBox="0 0 500 200" 
    className="w-full max-w-[420px] h-auto mx-auto select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-pulse-slow"
    style={{ animationDuration: "5s" }}
  >
    {/* Floor ground line */}
    <path 
      d="M30 160 Q250 165 470 160" 
      stroke="white" 
      strokeWidth="3.5" 
      fill="none" 
      strokeLinecap="round" 
    />

    {/* LEFT CHARACTER: Outdoors & Hiking Vayo Ball */}
    <g>
      {/* Circle Body */}
      <circle cx="110" cy="95" r="32" stroke="white" strokeWidth="3.5" fill="none" />
      {/* Vayo vibes seams */}
      <path d="M85 85 Q110 70 135 85" stroke="white" strokeWidth="3" fill="none" strokeDasharray="1 1" />
      <path d="M85 105 Q110 120 135 105" stroke="white" strokeWidth="3" fill="none" strokeDasharray="1 1" />

      {/* Eyes */}
      <ellipse cx="98" cy="85" rx="3.5" ry="5" fill="white" />
      <ellipse cx="114" cy="83" rx="3.5" ry="5" fill="white" />
      <path d="M96 76 Q99 74 102 76" stroke="white" strokeWidth="2" fill="none" />
      <path d="M112 74 Q115 72 118 74" stroke="white" strokeWidth="2" fill="none" />

      {/* Smile */}
      <path d="M98 98 Q106 106 114 98" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Waving arm */}
      <path d="M78 95 Q60 80 50 85" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Arm holding hiking pole */}
      <path d="M142 95 L160 110" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M158 75 L162 145" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M152 75 L168 75" stroke="white" strokeWidth="3" strokeLinecap="round" />

      {/* Backpack outline */}
      <rect x="70" y="80" width="12" height="30" rx="3" stroke="white" strokeWidth="3.5" fill="none" transform="rotate(-10 70 80)" />

      {/* Legs walking */}
      <path d="M98 127 Q90 145 85 156 Q80 159 74 158" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M120 127 Q125 145 132 155 Q136 158 144 157" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>

    {/* MIDDLE CHARACTER: Tall Cafe & Coffee Racket Buddy */}
    <g>
      {/* Body Frame (Racket shape represents the bridge to offline matches) */}
      <rect x="220" y="45" width="56" height="70" rx="28" stroke="white" strokeWidth="3.5" fill="none" />
      <path d="M248 115 L248 140" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      
      {/* Eyes & smile */}
      <ellipse cx="240" cy="62" rx="3.5" ry="4.5" fill="white" />
      <ellipse cx="256" cy="62" rx="3.5" ry="4.5" fill="white" />
      <path d="M243 72 Q248 77 253 72" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Sweatband */}
      <rect x="226" y="50" width="44" height="6" rx="2" fill="white" />

      {/* Arm down */}
      <path d="M218 85 Q205 95 198 110" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Arm holding coffee mug */}
      <path d="M278 85 Q290 75 300 65" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Coffee Mug */}
      <rect x="296" y="48" width="14" height="16" rx="3" stroke="white" strokeWidth="3" fill="none" />
      <path d="M310 52 Q316 56 310 60" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Heat fumes */}
      <path d="M298 42 Q301 36 299 32" stroke="white" strokeWidth="2" fill="none" />
      <path d="M305 42 Q308 36 306 32" stroke="white" strokeWidth="2" fill="none" />

      {/* Legs walking */}
      <path d="M236 140 Q230 152 225 158 Q220 160 214 158" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M260 140 Q265 152 272 157 Q278 159 284 156" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>

    {/* RIGHT CHARACTER: Board Games & Socializing Vayo Ball */}
    <g>
      {/* Circle Body */}
      <circle cx="380" cy="95" r="32" stroke="white" strokeWidth="3.5" fill="none" />
      <path d="M355 85 Q380 70 405 85" stroke="white" strokeWidth="3" fill="none" strokeDasharray="1 1" />
      <path d="M355 105 Q380 120 405 105" stroke="white" strokeWidth="3" fill="none" strokeDasharray="1 1" />

      {/* Eyes looking left */}
      <ellipse cx="368" cy="85" rx="3.5" ry="5" fill="white" />
      <ellipse cx="384" cy="84" rx="3.5" ry="5" fill="white" />
      <circle cx="366" cy="85" r="1.5" fill="black" />
      <circle cx="382" cy="84" r="1.5" fill="black" />

      {/* Smile */}
      <path d="M366 98 Q374 104 382 98" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Arm holding a board game box */}
      <path d="M352 98 Q340 105 328 110" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Dice/Card board game box */}
      <rect x="306" y="110" width="26" height="22" rx="4" stroke="white" strokeWidth="3" fill="none" transform="rotate(5 306 110)" />
      {/* Card symbol inside */}
      <rect x="313" y="116" width="6" height="8" rx="1" fill="white" />

      {/* Right arm waving */}
      <path d="M410 98 Q425 108 435 102" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Legs walking */}
      <path d="M368 127 Q362 145 356 156 Q351 159 344 158" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M392 127 Q398 145 405 155 Q410 158 418 156" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

// Inline SVG: Indigo outline running social doodle holding a megaphone/banner
const RunningVayoDoodle = () => (
  <svg 
    viewBox="0 0 250 250" 
    className="w-full max-w-[200px] h-auto select-none transform hover:rotate-3 transition-transform duration-300"
  >
    {/* Body Circle */}
    <circle cx="110" cy="115" r="42" stroke="#818cf8" strokeWidth="4" fill="none" />
    <path d="M78 105 Q110 85 142 105" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeDasharray="1 1" />
    <path d="M78 128 Q110 148 142 128" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeDasharray="1 1" />

    {/* Eyes */}
    <ellipse cx="94" cy="98" rx="4" ry="6" fill="#818cf8" />
    <ellipse cx="114" cy="96" rx="4" ry="6" fill="#818cf8" />
    {/* Eyebrows */}
    <path d="M90 88 Q95 86 100 89" stroke="#818cf8" strokeWidth="2.5" fill="none" />
    <path d="M110 86 Q115 84 120 87" stroke="#818cf8" strokeWidth="2.5" fill="none" />

    {/* Smile */}
    <path d="M96 116 Q105 124 114 116" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeLinecap="round" />

    {/* Left arm waving forward */}
    <path d="M68 115 Q40 120 25 105" stroke="#818cf8" strokeWidth="4" fill="none" strokeLinecap="round" />

    {/* Right arm raised holding key flag */}
    <path d="M152 118 Q168 112 178 95" stroke="#818cf8" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* Banner flag */}
    <g transform="rotate(-15 178 95)">
      <line x1="178" y1="95" x2="178" y2="40" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
      <path d="M178 45 L218 55 L178 68 Z" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <circle cx="190" cy="56" r="2" fill="#818cf8" />
    </g>

    {/* Running legs */}
    <path d="M90 155 Q85 185 95 205 Q102 210 115 208" stroke="#818cf8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M128 154 Q142 175 160 178 Q170 180 175 168" stroke="#818cf8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
  </svg>
);

export default function CommunityPage() {
  const router = useRouter();

  // Video state transitions
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modal Waitlist flow states
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Video seamless loop fade-in transition
  const handleVideoEnd = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(nextIdx);
      setNextIdx((nextIdx + 1) % vibeVideos.length);
      setIsTransitioning(false);
    }, 2000); 
  };

  // Waitlist Verification Status Checker
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    if (!emailInput.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsChecking(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/check-status?email=${encodeURIComponent(emailInput)}`);
      
      if (!response.ok) {
        let errMsg = "Failed to verify details. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) errMsg = errData.error;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();

      if (data.status === "approved") {
        setShowSignupModal(false);
        if (data.hasPassword) {
          setShowEnterPasswordModal(true);
        } else {
          setShowCreatePasswordModal(true);
        }
      } else if (data.status === "pending") {
        setShowSignupModal(false);
        setShowPendingModal(true);
      } else {
        // Unregistered - redirect directly to signup/onboarding steps
        setShowSignupModal(false);
        router.push(`/join?email=${encodeURIComponent(emailInput)}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsChecking(false);
    }
  };

  // Password submission functions (matching page.js logic)
  const handleCreatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput || !confirmPasswordInput) {
      setPasswordError("Both password fields are required.");
      return;
    }
    if (passwordInput.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("vayo_user_email", emailInput);
        if (data.token) {
          localStorage.setItem("vayo_jwt_token", data.token);
        }
        setShowCreatePasswordModal(false);
        router.push(`/profile?email=${encodeURIComponent(emailInput)}`);
      } else {
        setPasswordError(data.error || "Failed to set password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Network error setting password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleVerifyPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setPasswordError("Password is required.");
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordError("");
    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("vayo_user_email", emailInput);
        if (data.token) {
          localStorage.setItem("vayo_jwt_token", data.token);
        }
        setShowEnterPasswordModal(false);
        router.push(`/profile?email=${encodeURIComponent(emailInput)}`);
      } else {
        setPasswordError(data.error || "Incorrect password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Network error verifying password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* 1. TOP HERO SECTION */}
      <section className="relative w-full h-[620px] md:h-[680px] overflow-hidden flex flex-col justify-between p-6">
        
        {/* Dynamic Background Videos with Crossfading */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* Layer 1: Current Video */}
          <video
            key={`current-${currentIdx}`}
            className={`absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-[2000ms] ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-40'}`}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src={vibeVideos[currentIdx]} type="video/mp4" />
          </video>

          {/* Layer 2: Next Video during cross-fade */}
          {isTransitioning && (
            <video
              key={`next-${nextIdx}`}
              className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-40 transition-opacity duration-[2000ms] ease-in-out"
              autoPlay
              muted
              playsInline
            >
              <source src={vibeVideos[nextIdx]} type="video/mp4" />
            </video>
          )}

          {/* Mask Overlays */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/60 z-10" />
        </div>

        {/* HERO NAVIGATION OVERLAY */}
        <header className="relative z-20 flex items-center justify-between w-full max-w-6xl mx-auto pt-2">
          
          {/* VAYO logo */}
          <Link href="/" className="flex items-center decoration-none px-3.5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/8 shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO Logo"
              width={90} 
              height={24} 
              className="h-5 md:h-6 w-auto group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
              priority
            />
          </Link>

          {/* Right side status and bookmark items */}
          <div className="flex items-center gap-4">
            
            {/* Status Reserved capsule */}
            <div className="px-3.5 py-1.5 rounded-full bg-indigo-600/90 text-white text-[10px] md:text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
              Live Waitlist
            </div>

            {/* Circular Bookmark button */}
            <button 
              className="w-10 h-10 rounded-full bg-white/10 text-violet-300 hover:bg-white/20 hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-lg border border-white/10 cursor-pointer"
              aria-label="Bookmark"
            >
              <Bookmark className="w-5 h-5 fill-indigo-400 stroke-indigo-400" />
            </button>
          </div>
        </header>

        {/* HERO CENTER TEXT & DOODLES */}
        <div className="relative z-20 w-full max-w-3xl mx-auto text-center flex flex-col items-center justify-center my-auto">
          
          <div className="text-[11px] md:text-xs font-semibold text-violet-200/60 tracking-[2px] uppercase mb-8 md:mb-10">
            Stop Searching. Start Belonging.
          </div>

          <h1 className="mb-2 leading-none">
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO" 
              width={400} 
              height={180} 
              className="h-[80px] md:h-[180px] w-auto mx-auto drop-shadow-[0_0_32px_rgba(99,102,241,0.55)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-shimmer" 
              priority 
            />
          </h1>

          {/* Handdrawn walking doodles customized for VAYO */}
          <div className="w-full my-3">
            <WalkingVayoDoodles />
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-wider text-white uppercase select-none leading-none mt-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            Now Open
          </h2>

          {/* Slanted badge sticker customized for VAYO */}
          <div className="absolute left-[8%] md:left-[18%] bottom-[12%] md:bottom-[15%] transform -rotate-12 bg-indigo-600 text-white px-4 py-2 text-[11px] md:text-xs font-bold tracking-[2px] uppercase shadow-[0_8px_24px_rgba(79,70,229,0.5)] border border-indigo-400/30 rounded-md select-none hover:scale-105 transition-transform duration-300">
            Get Early
            <br />
            Access
          </div>
        </div>

        {/* HERO SEAM EMBEDDED CIRCULAR BADGE */}
        <div className="relative z-20 flex justify-center pb-2">
          
          <div className="absolute top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#050508] border-2 border-indigo-500/80 p-1 shadow-2xl flex items-center justify-center text-center select-none transform hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full border border-dashed border-indigo-500/40 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-[#09090b] to-[#050508]">
              {/* Small star ball icon */}
              <div className="w-3.5 h-3.5 rounded-full border border-indigo-400 relative mb-1 flex items-center justify-center">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
              </div>
              <span className="text-[9.5px] font-extrabold text-indigo-300 uppercase leading-tight tracking-wide">
                Limited to
                <br />
                Early spots
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* 2. BOTTOM DETAILS SECTION (Glassmorphic Dark VAYO Theme) */}
      <main className="relative z-10 w-full max-w-5xl mx-auto pt-24 pb-28 px-8 md:px-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-12">
        
        {/* Left text column */}
        <div className="flex-1 space-y-6 max-w-xl text-left relative z-20">
          
          <h3 className="text-xl md:text-2xl font-extrabold leading-snug tracking-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Become a founding member of the
            <br />
            friendliest offline community in town.
          </h3>

          <div className="space-y-4 text-lg md:text-xl font-bold tracking-normal text-slate-300">
            <p className="hover:translate-x-1.5 hover:text-indigo-400 transition-all duration-200 cursor-default">Skip the boring matching apps.</p>
            <p className="hover:translate-x-1.5 hover:text-indigo-400 transition-all duration-200 cursor-default">Score exclusive curated experiences.</p>
            <p className="hover:translate-x-1.5 hover:text-indigo-400 transition-all duration-200 cursor-default">Limited to early access members.</p>
          </div>

          <h4 className="text-lg md:text-xl font-bold text-indigo-300 pt-2">
            When the queue is full, access is closed.
          </h4>

          {/* Indigo Pill CTA button */}
          <div className="pt-6">
            <button
              onClick={() => {
                setErrorMessage("");
                setEmailInput("");
                setShowSignupModal(true);
              }}
              className="bg-white text-slate-950 border-0 outline-0 rounded-full px-10 py-4 text-xs md:text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] active:translate-y-0 transition-all duration-200 whitespace-nowrap uppercase tracking-widest"
            >
              Join VAYO
            </button>
          </div>
        </div>

        {/* Right side illustration doodle column */}
        <div className="shrink-0 flex items-center justify-center relative z-20">
          <RunningVayoDoodle />
        </div>

        {/* Background ambient lighting */}
        <div className="absolute right-[5%] bottom-[5%] w-72 h-72 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />
        <div className="absolute left-[5%] top-[10%] w-72 h-72 rounded-full bg-purple-500/5 blur-[95px] pointer-events-none" />
      </main>

      {/* 3. EMAIL SIGNUP MODAL OVERLAY */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-[2.5rem] p-7 md:p-10 max-w-md w-full shadow-2xl text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Background glows */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-xs font-bold tracking-[2px] uppercase text-indigo-400">
                VAYO Waitlist Signup
              </span>
              <button 
                onClick={() => setShowSignupModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & info */}
            <h3 className="text-lg font-bold tracking-tight text-white mb-2">
              Reserve your spot in VAYO
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              We vet every applicant to maintain a friendly, high-trust offline community. Enter your email to begin verification or check your existing waitlist status.
            </p>

            {/* Form */}
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider block pl-1 text-slate-400">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMessage("");
                    }}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-black transition-all"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isChecking}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isChecking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying details...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. PENDING STATUS MODAL */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-[2.5rem] p-7 md:p-10 max-w-md w-full shadow-2xl text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-xs font-bold tracking-[2px] uppercase">
                Verification Details
              </span>
              <button onClick={() => setShowPendingModal(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Audit in Progress
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              We received your request! Our curators verify selfie details manually to protect our offline safety standards. We will notify you once approved.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold block">Application Submitted</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{emailInput}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="font-bold">Authenticity & Selfie Verification</span>
                  <span className="text-[10px] text-amber-500 font-bold block mt-0.5">In manual curator queue</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPendingModal(false)}
              className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer text-center uppercase tracking-wider"
            >
              Return to Waitlist
            </button>
          </div>
        </div>
      )}

      {/* 5. CREATE PASSWORD MODAL */}
      {showCreatePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-[2.5rem] p-7 md:p-10 max-w-md w-full shadow-2xl text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-xs font-bold tracking-[2px] uppercase text-emerald-400">
                Approved Access
              </span>
              <button onClick={() => setShowCreatePasswordModal(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-white mb-2">
              Setup Your Password
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              Congratulations! Your member application is approved. Set a secure password to unlock your early access account dashboard.
            </p>

            <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreatePasswordModal(false)}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword || passwordInput.length < 6 || passwordInput !== confirmPasswordInput}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm"
                >
                  {isSubmittingPassword ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Enter Portal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ENTER PASSWORD MODAL */}
      {showEnterPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-[2.5rem] p-7 md:p-10 max-w-md w-full shadow-2xl text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="text-xs font-bold tracking-[2px] uppercase text-emerald-400">
                Approved Access
              </span>
              <button onClick={() => setShowEnterPasswordModal(false)} className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-white mb-2">
              Verify Credentials
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              You are an approved member! Please verify your password credentials to enter your early access details.
            </p>

            <form onSubmit={handleVerifyPasswordSubmit} className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  placeholder="Enter your profile password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#0d0d11] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              {passwordError && (
                <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEnterPasswordModal(false)}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword || !passwordInput}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm"
                >
                  {isSubmittingPassword ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Confirm & Log In"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
