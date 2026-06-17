"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventShowcase from "@/components/EventShowcase";

export default function Home() {
  return (
    <React.Suspense fallback={null}>
      <HomeContent />
    </React.Suspense>
  );
}

function HomeContent() {
  const [email, setEmail] = useState("");
  const [bottomEmail, setBottomEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailInputRef = useRef(null);

  // Navigation loading feedback state
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "login") {
      emailInputRef.current?.focus();
      emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchParams]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // Password collection states
  const [showCreatePasswordModal, setShowCreatePasswordModal] = useState(false);
  const [showEnterPasswordModal, setShowEnterPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const checkWaitlistStatus = async (targetEmail) => {
    if (!targetEmail) return;
    if (!targetEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsNavigating(true);
    setPasswordError("");
    setResetMessage("");
    setPasswordInput("");
    setConfirmPasswordInput("");
    try {
      const response = await fetch(`/api/check-status?email=${encodeURIComponent(targetEmail)}`);
      if (!response.ok) {
        let errMsg = "Failed to check status";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) { }
        throw new Error(errMsg);
      }
      const data = await response.json();
      if (data.status === "approved") {
        setPendingEmail(targetEmail);
        setIsNavigating(false);
        if (data.hasPassword) {
          setShowEnterPasswordModal(true);
        } else {
          setShowCreatePasswordModal(true);
        }
      } else if (data.status === "pending") {
        setPendingEmail(targetEmail);
        setShowPendingModal(true);
        setIsNavigating(false);
      } else {
        // Unregistered, redirect to invite
        router.push(`/invite?email=${encodeURIComponent(targetEmail)}`);
      }
    } catch (error) {
      console.error("Error checking waitlist status:", error);
      alert("Something went wrong checking status. Please try again.");
      setIsNavigating(false);
    }
  };

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
        body: JSON.stringify({ email: pendingEmail, password: passwordInput })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("vayo_user_email", pendingEmail);
        if (data.token) {
          localStorage.setItem("vayo_jwt_token", data.token);
        }
        setShowCreatePasswordModal(false);
        router.push(`/profile?email=${encodeURIComponent(pendingEmail)}`);
      } else {
        setPasswordError(data.error || "Failed to set password.");
      }
    } catch (err) {
      console.error("Network error setting password:", err);
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
        body: JSON.stringify({ email: pendingEmail, password: passwordInput })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("vayo_user_email", pendingEmail);
        if (data.token) {
          localStorage.setItem("vayo_jwt_token", data.token);
        }
        setShowEnterPasswordModal(false);
        router.push(`/profile?email=${encodeURIComponent(pendingEmail)}`);
      } else {
        setPasswordError(data.error || "Incorrect password.");
      }
    } catch (err) {
      console.error("Network error verifying password:", err);
      setPasswordError("Network error verifying password.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!pendingEmail) return;

    setIsSendingReset(true);
    setPasswordError("");
    setResetMessage("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setResetMessage("A new temporary password has been sent to your email.");
      } else {
        setPasswordError(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      console.error("Network error during password reset:", err);
      setPasswordError("Network error during password reset.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    checkWaitlistStatus(email);
  };

  const handleBottomEmailSubmit = (e) => {
    e.preventDefault();
    checkWaitlistStatus(bottomEmail);
  };

  const handleNavJoinClick = (e) => {
    e.preventDefault();
    if (isNavigating) return;
    setIsNavigating(true);
    router.push("/join");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleScrollToFeatures = () => {
    document.getElementById("vayo-way")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>


      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 h-16 md:h-20 bg-black/10 backdrop-blur-md md:bg-transparent border-b border-white/5 md:border-b-0 transition-all duration-300">
        <Link href="/" className="flex items-center decoration-none px-3.5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/8 shadow-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
          <Image src="/assets/vayo-logo.png" alt="VAYO Logo" width={90} height={24} className="h-5 md:h-6 w-auto group-hover:scale-105 group-hover:brightness-110 transition-all duration-300" priority />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoginClick}
            className="hidden md:flex items-center justify-center px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold hover:bg-white/20 transition-all duration-300 cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={handleNavJoinClick}
            disabled={isNavigating}
            className="flex items-center justify-center decoration-none px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white text-slate-950 text-xs md:text-sm font-bold hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isNavigating ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              "Join Our Community \u2197"
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-5 py-24 overflow-hidden">
        <div className="relative z-20 w-full max-w-[600px] flex flex-col items-center justify-center -translate-y-10 md:-translate-y-14">
          <div className="text-[11px] md:text-xs font-semibold text-violet-200/60 tracking-[2px] uppercase mb-8 md:mb-10">
            Stop Searching. Start Belonging.
          </div>
          <div className="text-xs md:text-sm font-bold text-white tracking-[4px] uppercase mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            WELCOME TO
          </div>
          <h1 className="mb-2 leading-none">
            <Image src="/assets/vayo-logo.png" alt="VAYO" width={400} height={180} className="h-[80px] md:h-[180px] w-auto mx-auto drop-shadow-[0_0_32px_rgba(99,102,241,0.55)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-shimmer" priority />
          </h1>
          <p className="text-xl md:text-4xl font-light bg-gradient-to-r from-white/92 to-violet-300/90 bg-clip-text text-transparent italic mb-4 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] leading-tight">
            Let&apos;s Do It.
          </p>
          <p className="text-sm md:text-lg max-w-[540px] text-violet-100/82 mx-auto mb-6 leading-relaxed font-normal px-3 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
            Discover people who match your vibe. <br /> No searching. Just belonging.
          </p>

          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full max-w-[480px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-full p-2 sm:p-1 pl-4 sm:pl-5 shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-indigo-500/40 focus-within:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(99,102,241,0.15)] mt-4">
            <input
              ref={emailInputRef}
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-transparent border-0 outline-0 text-sm font-normal text-white py-2.5 sm:py-2 w-full placeholder:text-violet-200/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isNavigating}
              className="bg-white text-slate-950 border-0 outline-0 rounded-xl sm:rounded-full px-5 py-3 sm:py-2.5 text-xs md:text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] active:translate-y-0 transition-all duration-200 whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                "Join VAYO"
              )}
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
          <h2 className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-3xl md:text-5xl font-semibold tracking-tight text-white mt-2">
            Why
            <Image src="/assets/vayo-logo.png" alt="VAYO" width={100} height={44} className="h-[28px] md:h-[44px] w-auto" />
            Commune?
          </h2>
          <p className="text-sm md:text-base text-white/50 mt-4 max-w-xl mx-auto">
            Online matching is just the starting line. We focus on getting you offline, doing things you love, with people who share your vibe.
          </p>
        </div>

        <div className="flex flex-row overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-5 pb-6 px-4 -mx-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible">
          {/* Card 1 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-6 md:p-10 backdrop-blur-md transition-all duration-500 h-[210px] w-[260px] shrink-0 snap-start md:h-auto md:w-auto md:shrink-1">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[2rem]"></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Skip the Swipes</h3>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal">
              No endless small talk or dead-end profiles. Vayo automatically matches you into tiny, friendly groups based on shared interests and values.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-6 md:p-10 backdrop-blur-md transition-all duration-500 h-[210px] w-[260px] shrink-0 snap-start md:h-auto md:w-auto md:shrink-1">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[2rem]"></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Activity-First Vibes</h3>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal">
              Meeting new people is easier when you&apos;re doing something together. We curate board games, dinners, hikes, and sports that keep the vibe casual and stress-free.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.04] p-6 md:p-10 backdrop-blur-md transition-all duration-500 h-[210px] w-[260px] shrink-0 snap-start md:h-auto md:w-auto md:shrink-1">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[2rem]"></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Verified Hosts</h3>
            <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal">
              Every Vayo experience is hosted and verified. Safety, quality participation, and a supportive atmosphere are always guaranteed.
            </p>
          </div>
        </div>      </section>

      {/* Event Showcase Section */}
      <section className="relative z-10 py-16 border-t border-white/5 bg-black/10">
        <EventShowcase />
      </section>

      {/* Bottom Section with Image Background (Hides body video bg for only CTA & Footer) */}
      <div className="relative w-full overflow-hidden bg-[#050508]">
        {/* Static Background Image (Dimmed for quality mask, with a smooth blend gradient at the top edge) */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[#050508]">
          <Image
            src="/assets/bg-footer.png"
            alt="Footer Background"
            fill
            className="object-cover opacity-[.72]"
            sizes="100vw"
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

          <div className="relative z-10 flex flex-col items-center gap-6 mt-10">
            <button
              onClick={() => {
                router.push("/invite");
              }}
              className="bg-white text-slate-950 border-0 outline-0 rounded-full px-12 py-4 text-xs md:text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] active:translate-y-0 transition-all duration-300 whitespace-nowrap uppercase tracking-widest shadow-xl"
            >
              Join VAYO NOW
            </button>
          </div>
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
                  <Image src="/assets/vayo-logo.png" alt="VAYO Logo" width={180} height={48} className="h-12 w-auto filter drop-shadow-[0_0_20px_rgba(99,102,241,0.25)] mx-auto md:mx-0" />
                </Link>
                <p className="text-xs md:text-sm leading-relaxed text-violet-200/45 font-normal tracking-wide">
                  Vayo is a verified membership platform and offline community. We help you transition from online discovery to real-life belonging through curated activities and verified social matching.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link href="/community" className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all decoration-none uppercase tracking-wider">
                    Explore Community
                  </Link>
                  <Link href="/invite" className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all decoration-none uppercase tracking-wider">
                    Member Registration
                  </Link>
                </div>
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
                <a href="https://www.instagram.com/vayo.bangalore/" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-violet-200/40 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-violet-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] transition-all duration-300" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@vayobangalore" className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-violet-200/40 hover:bg-indigo-500/15 hover:border-indigo-500/40 hover:text-violet-300 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)] transition-all duration-300" aria-label="Youtube" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-violet-200/40 hover:text-violet-300">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.41z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
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

      {/* Pending Approval Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in duration-300">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-3xl p-7 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Glowing Accent Blobs */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none z-0" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-sky-500/5 rounded-full blur-[60px] pointer-events-none z-0" />

            <div className="relative z-10">
              {/* Header: Logo and Live Status Pill */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <Image src="/assets/vayo-logo.png" alt="VAYO" width={90} height={24} className="h-5 w-auto" />
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                  Reviewing Application
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold tracking-tight text-white mb-2">
                Verification in progress
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal mb-5">
                VAYO is a vetted community. Our curators manually verify profiles and selfie uploads to ensure a high-trust, authentic social experience for all members.
              </p>

              {/* Application Lifecycle Checklist */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3.5">
                {/* Step 1: Completed */}
                <div className="flex items-start gap-3">
                  <div className="w-4.5 h-4.5 rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 text-[9px] font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="leading-tight">
                    <span className="text-[11px] font-bold text-slate-200 block">Request Received</span>
                    <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5 select-all">{pendingEmail}</span>
                  </div>
                </div>

                {/* Step 2: In Progress */}
                <div className="flex items-start gap-3">
                  <div className="w-4.5 h-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[11px] font-bold text-slate-200">Selfie & Authenticity Audit</span>
                    <span className="text-[9.5px] text-sky-400/80 font-bold block mt-0.5">In manual curator queue</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowPendingModal(false)}
                className="w-full bg-white hover:bg-neutral-100 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer text-center"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Password Modal */}
      {showCreatePasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in duration-300">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-3xl p-7 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Glowing Accent Blobs */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none z-0" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-sky-500/5 rounded-full blur-[60px] pointer-events-none z-0" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <Image src="/assets/vayo-logo.png" alt="VAYO" width={90} height={24} className="h-5 w-auto" />
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Approved Access
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold tracking-tight text-white mb-2">
                Secure your profile
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal mb-5">
                Your waitlist registration is approved! Please set a password below to secure your VAYO early access account.
              </p>

              {/* Form */}
              <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
                {/* Inputs Grouped inside a unified card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Create Password</label>
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-sky-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Repeat your password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-sky-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Interactive Security Checklist */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 space-y-3.5">
                  {/* Step 1: Identity Approved */}
                  <div className="flex items-start gap-3">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-[9px] font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="leading-tight">
                      <span className="text-[11px] font-bold text-slate-200 block">Identity Approved</span>
                      <span className="text-[9.5px] text-slate-500 font-mono block mt-0.5 select-all">{pendingEmail}</span>
                    </div>
                  </div>

                  {/* Step 2: Password Length Check */}
                  <div className="flex items-start gap-3">
                    {passwordInput.length >= 6 ? (
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-[9px] font-bold shrink-0 mt-0.5 transition-all">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                      </div>
                    )}
                    <div className="leading-tight">
                      <span className={`text-[11px] font-bold block transition-colors ${passwordInput.length >= 6 ? 'text-slate-200' : 'text-slate-400'}`}>Security Threshold</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Password must be at least 6 characters</span>
                    </div>
                  </div>

                  {/* Step 3: Match Check */}
                  <div className="flex items-start gap-3">
                    {(passwordInput === confirmPasswordInput && passwordInput.length > 0) ? (
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-[9px] font-bold shrink-0 mt-0.5 transition-all">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 transition-all">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                      </div>
                    )}
                    <div className="leading-tight">
                      <span className={`text-[11px] font-bold block transition-colors ${(passwordInput === confirmPasswordInput && passwordInput.length > 0) ? 'text-slate-200' : 'text-slate-400'}`}>Identity Confirmation</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">Both passwords must match exactly</span>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-[10.5px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                    {passwordError}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreatePasswordModal(false)}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword || passwordInput.length < 6 || passwordInput !== confirmPasswordInput}
                    className="flex-1 bg-white hover:bg-neutral-100 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingPassword ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      "Set Password & Enter"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enter Password Modal */}
      {showEnterPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in duration-300">
          <div className="relative bg-[#09090b]/95 border border-white/10 rounded-3xl p-7 max-w-md w-full shadow-[0_24px_64px_rgba(0,0,0,0.8)] text-left text-white overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Glowing Accent Blobs */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none z-0" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-sky-500/5 rounded-full blur-[60px] pointer-events-none z-0" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <Image src="/assets/vayo-logo.png" alt="VAYO" width={90} height={24} className="h-5 w-auto" />
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                  Approved Access
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold tracking-tight text-white mb-1">
                Enter your password
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal mb-4">
                Please verify your profile password to access your early access dashboard, event tickets, and connection lists.
              </p>

              {/* Form */}
              <form onSubmit={handleVerifyPasswordSubmit} className="space-y-4">
                {/* Account info card */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm ring-1 ring-white/10 shrink-0">
                    {pendingEmail ? pendingEmail.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="leading-tight overflow-hidden">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Approved Account</span>
                    <span className="text-xs text-slate-200 font-medium block truncate select-all">{pendingEmail}</span>
                  </div>
                </div>

                {/* Input inside card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {passwordError && (
                  <p className="text-[10.5px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
                    {passwordError}
                  </p>
                )}

                {resetMessage && (
                  <p className="text-[10.5px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-center">
                    {resetMessage}
                  </p>
                )}

                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEnterPasswordModal(false)}
                      className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPassword || !passwordInput}
                      className="flex-1 bg-white hover:bg-neutral-100 text-slate-950 font-bold text-xs py-2.5 rounded-xl cursor-pointer text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
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

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSendingReset}
                    className="text-[10px] text-slate-500 hover:text-sky-400 font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer text-center mt-1"
                  >
                    {isSendingReset ? "Sending Reset..." : "Forgot Password?"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
/* trigger build */
