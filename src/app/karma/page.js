"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Flame,
  ArrowLeft,
  CheckCircle2,
  Award,
  Zap,
  Sparkles,
  ShieldCheck,
  Calendar,
  Compass,
  Trophy,
  Star,
  Users,
  AlertCircle,
  X,
  MapPin,
  Check
} from "lucide-react";
import { getTierFromScore } from "@/lib/karma";

function KarmaPageContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState("");
  const [karmaData, setKarmaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealUser, setIsRealUser] = useState(false);

  // Fallback demo values if not logged in
  const demoKarma = {
    total: 340,
    tier: "Pathfinder",
    tierIcon: "🧭",
    nextTier: "Voyager",
    nextTierMin: 251,
    tierMin: 85,
    progressToNext: 60,
    breakdown: {
      profileSetup: { points: 5, max: 5 },
      eventRsvps: { points: 15, count: 30 },
      gpsCheckins: { points: 120 },
      community: { points: 200 }
    },
    ledger: [
      { id: "1", action_type: "SIGNUP_EMAIL_VERIFY", point_delta: 1, description: "Email Address Verified", created_at: "2026-06-01T12:00:00Z" },
      { id: "2", action_type: "SIGNUP_PROFILE_PHOTO", point_delta: 1, description: "Profile Face Photo Uploaded", created_at: "2026-06-01T12:10:00Z" },
      { id: "3", action_type: "SIGNUP_PHONE_VERIFY", point_delta: 1, description: "Mobile Phone Verified", created_at: "2026-06-02T10:15:00Z" },
      { id: "4", action_type: "SIGNUP_CLAIM_ID", point_delta: 2, description: "Unique Username ID Created", created_at: "2026-06-02T11:00:00Z" },
      { id: "5", action_type: "MEETUP_GPS_CHECKIN", point_delta: 3, description: "GPS Verified at Sunday Salsa Mixer", created_at: "2026-06-10T19:30:00Z" },
      { id: "6", action_type: "EVENT_GPS_CHECKIN", point_delta: 5, description: "GPS Verified at Cozy Coding & Coffee", created_at: "2026-06-12T15:00:00Z" }
    ]
  };

  useEffect(() => {
    const localEmail = localStorage.getItem("vayo_user_email");
    const activeEmail = emailParam || localEmail;
    if (activeEmail && activeEmail.includes("@")) {
      setEmail(activeEmail);
      setIsRealUser(true);
      fetchKarmaData(activeEmail);
    } else {
      setIsLoading(false);
    }
  }, [emailParam]);

  const fetchKarmaData = async (userEmail) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/karma?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setKarmaData(data);
      }
    } catch (err) {
      console.error("Error fetching karma:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeKarma = isRealUser && karmaData ? karmaData : demoKarma;
  const currentTier = getTierFromScore(activeKarma.total);

  const tierMeta = {
    Explorer: { 
      gradient: "from-sky-500 via-blue-500 to-indigo-600", 
      glow: "shadow-sky-500/10 border-sky-500/20", 
      text: "text-sky-500",
      bgAccent: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 border-sky-200"
    },
    Pathfinder: { 
      gradient: "from-amber-400 via-orange-500 to-red-500", 
      glow: "shadow-amber-500/10 border-amber-500/20", 
      text: "text-amber-500",
      bgAccent: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200"
    },
    Voyager: { 
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600", 
      glow: "shadow-violet-500/10 border-violet-500/20", 
      text: "text-violet-500",
      bgAccent: "bg-violet-500",
      badge: "bg-violet-50 text-violet-700 border-violet-200"
    },
    Conqueror: { 
      gradient: "from-emerald-400 via-teal-500 to-cyan-600", 
      glow: "shadow-emerald-500/10 border-emerald-500/20", 
      text: "text-emerald-500",
      bgAccent: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  };

  const tm = tierMeta[activeKarma.tier] || tierMeta.Explorer;
  const progressPct = Math.min(100, Math.max(0, activeKarma.progressToNext ?? 0));
  const pointsToNext = activeKarma.nextTierMin ? Math.max(0, activeKarma.nextTierMin - activeKarma.total) : 0;

  // Monthly Ring Progress (Max 84)
  const monthlyScore = Math.min(84, activeKarma.total % 84);
  const monthlyPct = Math.round((monthlyScore / 84) * 100);

  return (
    <div className="min-h-screen text-[#1f2937] font-sans antialiased py-8 px-4 md:px-8 selection:bg-sky-100 relative overflow-x-hidden">
      
      {/* ── Background Video & Blur ── */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/bg_water_blue.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-[#f8f9fa]/20 backdrop-blur-[4px] z-0 pointer-events-none" />

      {/* ── Container ── */}
      <div className="max-w-[1100px] mx-auto relative z-10 space-y-6">

        {/* ── Demo Warning Banner ── */}
        {!isRealUser && (
          <div className="bg-sky-500/10 backdrop-blur-md border border-sky-500/25 rounded-2xl p-4 text-center text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse shrink-0" />
              <span>Viewing in **Demo Mode**. Sign in with your approved waitlist email to track your live reputation.</span>
            </div>
            <Link href="/" className="px-4 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold rounded-xl transition-all shadow-sm">
              Sign In / Apply ↗
            </Link>
          </div>
        )}

        {/* ── HEADER NAVBAR ── */}
        <header className="flex items-center justify-between border border-white/50 bg-white/30 backdrop-blur-md rounded-3xl py-3.5 px-4 md:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-neutral-800 flex items-center shrink-0">
              <img src="/assets/vayo-logo.png" className="h-7 w-auto select-none" alt="VAYO" />
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full inline-block ml-1 animate-pulse" />
            </Link>
            <span className="text-[10px] text-neutral-500 font-black uppercase tracking-wider hidden sm:block border-l border-neutral-300 pl-3 leading-none h-3 mt-1">Reputation Hub</span>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Profile Dashboard</span>
          </Link>
        </header>

        {/* ── HERO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-6">
          
          {/* Card 1: Score & Tier Visualizer */}
          <div className={`bg-white border border-white/40 shadow-xl rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between gap-6 relative overflow-hidden`}>
            
            {/* Top Row: Title & Badge */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10.5px] text-sky-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-sky-500/25" /> Karma Reputation
                </span>
                <h2 className="text-3xl font-black text-neutral-800 tracking-tight mt-1">{activeKarma.tier}</h2>
              </div>
              <span className="text-4xl drop-shadow-sm select-none">{activeKarma.tierIcon}</span>
            </div>

            {/* Giant Score Circle */}
            <div className="flex justify-center my-4 relative">
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none" className="transition-all duration-1000 ease-out" 
                    stroke={`url(#karmaGrad)`} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - Math.min(1, activeKarma.total / 500))}`} 
                  />
                  <defs>
                    <linearGradient id="karmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5">
                  <span className="text-4xl font-black text-neutral-800 tracking-tight leading-none">{activeKarma.total}</span>
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest mt-1">PTS</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Cap Progress bar */}
            <div className="space-y-3.5">
              {/* Monthly Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-neutral-400 tracking-wider">
                  <span>Monthly Contribution Cap</span>
                  <span className="text-neutral-600">{monthlyScore} / 84 PTS</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${monthlyPct}%` }} />
                </div>
              </div>

              {/* Progress to Next Tier */}
              {activeKarma.nextTier && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-neutral-400 tracking-wider">
                    <span>Next Level Up</span>
                    <span className="text-neutral-600">{pointsToNext} pts to {activeKarma.nextTier}</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Card 2: Interactive Tiers & Benefits Showcase */}
          <div className="bg-white/70 backdrop-blur-md border border-white/50 shadow-xl rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4 text-violet-500" /> Tiers & Community Benefits
              </span>
              <h2 className="text-2xl font-black text-neutral-800 tracking-tight mt-1">Unlock Privileges via Participation</h2>
              <p className="text-xs text-neutral-500 font-medium leading-relaxed mt-2">
                Karma reputation measures your consistency, reliability, and positive contributions to the VAYO commune. Higher tiers unlock exclusive access and host privileges.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Explorer Tier Benefit Card */}
              <div className="p-4 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:border-sky-500/20 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">Explorer</span>
                  <span className="text-xs font-extrabold text-neutral-400">0 - 84 PTS</span>
                </div>
                <div className="text-xl font-bold text-neutral-800 flex items-center gap-1.5">
                  🔭 Explorer Tier
                </div>
                <ul className="space-y-1">
                  {["Access to basic socials", "Standard profile badges", "Attend free meetups"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pathfinder Tier Benefit Card */}
              <div className="p-4 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:border-amber-500/20 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Pathfinder</span>
                  <span className="text-xs font-extrabold text-neutral-400">85 - 250 PTS</span>
                </div>
                <div className="text-xl font-bold text-neutral-800 flex items-center gap-1.5">
                  🧭 Pathfinder Tier
                </div>
                <ul className="space-y-1">
                  {["Priority event booking", "Vibe Leader profile glow", "Invite +2 guest friends"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Voyager Tier Benefit Card */}
              <div className="p-4 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:border-violet-500/20 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">Voyager</span>
                  <span className="text-xs font-extrabold text-neutral-400">251 - 420 PTS</span>
                </div>
                <div className="text-xl font-bold text-neutral-800 flex items-center gap-1.5">
                  🚀 Voyager Tier
                </div>
                <ul className="space-y-1">
                  {["Host community mixers", "Voucher Verified badge", "2x Referral point rewards"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conqueror Tier Benefit Card */}
              <div className="p-4 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:border-emerald-500/20 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Conqueror</span>
                  <span className="text-xs font-extrabold text-neutral-400">421+ PTS</span>
                </div>
                <div className="text-xl font-bold text-neutral-800 flex items-center gap-1.5">
                  🌟 Conqueror Tier
                </div>
                <ul className="space-y-1">
                  {["VIP Experience Trips entry", "Spam Inbox Shield control", "Reputation moderation voting"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>

        {/* ── SECTION: HOW TO EARN BREAKDOWN ── */}
        <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-[2.5rem] p-6 md:p-8 space-y-6">
          
          <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[10px] text-sky-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Karma Rules Calculator
              </span>
              <h2 className="text-2xl font-black text-neutral-800 tracking-tight mt-1">Point System Breakdown</h2>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-500/10 text-sky-700 border border-sky-500/20 shadow-sm uppercase tracking-wider">
                Max Monthly Cap: 84 PTS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Onboarding & Participation */}
            <div className="space-y-4">
              <h3 className="text-xs text-neutral-400 font-black uppercase tracking-wider border-b border-neutral-100 pb-1.5">1. Profile & Engagement</h3>
              
              <div className="space-y-2">
                {[
                  { title: "Upload Profile Photo", pts: "+1 pt", rule: "Upload verification selfie photo" },
                  { title: "Verify Email Address", pts: "+1 pt", rule: "Valid waitlist confirmation email" },
                  { title: "Verify Phone Number", pts: "+1 pt", rule: "SMS binding check" },
                  { title: "Unique Username ID", pts: "+2 pts", rule: "Claim @username handle on registration" },
                  { title: "RSVP Confirmation", pts: "+0.5 pts", rule: "Confirmed ticket reservation delta" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between text-left">
                    <div>
                      <div className="text-xs font-black text-neutral-700">{item.title}</div>
                      <div className="text-[9px] text-neutral-400 font-medium leading-none mt-1">{item.rule}</div>
                    </div>
                    <span className="text-xs font-extrabold text-sky-600 shrink-0 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: GPS Check-ins & Streaks */}
            <div className="space-y-4">
              <h3 className="text-xs text-neutral-400 font-black uppercase tracking-wider border-b border-neutral-100 pb-1.5">2. GPS Venue Presence & Streaks</h3>
              
              <div className="space-y-2">
                {[
                  { title: "GPS Check-In at Meetup", pts: "+3 pts", rule: "Verify presence at free mixers (Max 10/mo)" },
                  { title: "GPS Check-In at Event", pts: "+5 pts", rule: "Verify presence at structured events (Max 12/mo)" },
                  { title: "GPS Check-In at Experience Trip", pts: "+12 pts", rule: "Verify presence at premium trip (Max 1/mo)" },
                  { title: "Active Weekly Streak (Level 1)", pts: "+1 pt", rule: "1 consecutive week of GPS check-ins" },
                  { title: "Active Weekly Streak (Level 2)", pts: "+2 pts", rule: "2 consecutive weeks of GPS check-ins" },
                  { title: "Active Weekly Streak (Level 3)", pts: "+4 pts", rule: "3 consecutive weeks of GPS check-ins" },
                  { title: "Active Monthly Streak (Level 4)", pts: "+8 pts", rule: "Active throughout whole calendar month" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between text-left">
                    <div>
                      <div className="text-xs font-black text-neutral-700">{item.title}</div>
                      <div className="text-[9px] text-neutral-400 font-medium leading-none mt-1">{item.rule}</div>
                    </div>
                    <span className="text-xs font-extrabold text-sky-600 shrink-0 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Referrals & Reviews */}
            <div className="space-y-4">
              <h3 className="text-xs text-neutral-400 font-black uppercase tracking-wider border-b border-neutral-100 pb-1.5">3. Referral, Reviews & Bonuses</h3>
              
              <div className="space-y-2">
                {[
                  { title: "Referral Registration", pts: "+1 pt", rule: "Gradual step 1: referred member signs up" },
                  { title: "Referral RSVP", pts: "+1 pt", rule: "Gradual step 2: referred member locks tickets" },
                  { title: "Referral GPS Check-In", pts: "+2 pts", rule: "Gradual step 3: referred member attends event" },
                  { title: "Positive Verified Review", pts: "+1 pt", rule: "From verified participants after mixers" },
                  { title: "Verified Birthday Reward", pts: "+5 pts", rule: "Annual verified birthdate celebration" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between text-left">
                    <div>
                      <div className="text-xs font-black text-neutral-700">{item.title}</div>
                      <div className="text-[9px] text-neutral-400 font-medium leading-none mt-1">{item.rule}</div>
                    </div>
                    <span className="text-xs font-extrabold text-sky-600 shrink-0 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Deductions & Penalties Panel */}
          <div className="bg-red-50/50 border border-red-100 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs text-red-700 font-black uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" /> Cancellation, No-Show & Safety Deductions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Cancellation */}
              <div className="bg-white p-3 rounded-2xl border border-red-100/50 text-left">
                <div className="text-xs font-black text-neutral-800">Cancellations</div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Over 24 Hours before:</span>
                    <span className="text-red-500 font-extrabold">-2 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Last-Minute (&lt;24h):</span>
                    <span className="text-red-500 font-extrabold">-5 pts</span>
                  </div>
                </div>
              </div>

              {/* No-Shows */}
              <div className="bg-white p-3 rounded-2xl border border-red-100/50 text-left">
                <div className="text-xs font-black text-neutral-800">No-Show (Fail GPS Check-in)</div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Meetup No-Show:</span>
                    <span className="text-red-500 font-extrabold">-5 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Event No-Show:</span>
                    <span className="text-red-500 font-extrabold">-8 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Experience Trip No-Show:</span>
                    <span className="text-red-500 font-extrabold">-10 pts</span>
                  </div>
                </div>
              </div>

              {/* Guideline violations */}
              <div className="bg-white p-3 rounded-2xl border border-red-100/50 text-left">
                <div className="text-xs font-black text-neutral-800">Violations & Abuse Reports</div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Negative Verified Review:</span>
                    <span className="text-red-500 font-extrabold">-2 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>3 Reports warning:</span>
                    <span className="text-red-500 font-extrabold">-2 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Minor Guideline breach:</span>
                    <span className="text-red-500 font-extrabold">-10 pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                    <span>Fraud / Fake Profile:</span>
                    <span className="text-red-500 font-extrabold">-50 pts</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── LEDGER & HISTORY LIST ── */}
        <div className="bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-[2.5rem] p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-1.5">
            <Compass className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-black text-neutral-800 tracking-tight">Recent Karma Ledger Transaction Logs</h2>
          </div>

          {activeKarma.ledger && activeKarma.ledger.length > 0 ? (
            <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {activeKarma.ledger.map((log) => (
                <div key={log.id} className="flex justify-between items-center py-3">
                  <div className="text-left">
                    <span className="text-xs font-black text-neutral-700 leading-tight block">
                      {log.description || log.action_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5 block">
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <span className={`text-xs font-extrabold tracking-tight shrink-0 ${log.point_delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {log.point_delta >= 0 ? `+${log.point_delta}` : log.point_delta} PTS
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-neutral-100 rounded-2xl text-center text-xs font-bold text-neutral-400 bg-neutral-50/50">
              No transactions logged yet. Complete tasks or RSVP to events to start earning!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function KarmaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center flex-col gap-3">
        <span className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest animate-pulse">Syncing reputation...</span>
      </div>
    }>
      <KarmaPageContent />
    </Suspense>
  );
}
