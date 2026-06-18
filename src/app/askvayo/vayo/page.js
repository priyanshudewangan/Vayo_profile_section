"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const eventMedia = [
  { title: "Outdoor Adventures", src: "/assets/Sport_outdor.mp4", isVideo: true, icon: "⛰️" },
  { title: "Community Dinners", src: "/assets/community.mp4", isVideo: true, icon: "🍽️" },
  { title: "Board Game Socials", src: "/assets/Board_game.mp4", isVideo: true, icon: "🎲" },
  { title: "Sports & Play", src: "/assets/events/sports.jpg", isVideo: false, icon: "⚽" },
  { title: "Holi Celebration", src: "/assets/HOLI.mp4", isVideo: true, icon: "🎉" },
  { title: "Sankranti Celebration", src: "/assets/Sankranti_Meetup.mp4", isVideo: true, icon: "🌾" },
  { title: "Cafe Explorations", src: "/assets/Cafe_exploring.mp4", isVideo: true, icon: "☕" },
  { title: "Socials", src: "/assets/IMG_5839.mp4", isVideo: true, icon: "🌅" },
  { title: "Creative Workshops", src: "/assets/IMG_5822.mp4", isVideo: true, icon: "🎨" },
];

function ThankYouContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="min-h-screen w-full text-white relative py-20 px-4 md:px-8 flex flex-col items-center justify-start overflow-hidden font-sans bg-[#050508]">

      {/* Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/assets/bg_img_thankyou.png"
          alt="Thank You Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        {/* Soft dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-[#050508]/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Decorative Confetti Shapes */}
      <div className="absolute top-12 left-10 md:left-24 w-4 h-4 bg-[#FFD93D] rotate-12 rounded-sm opacity-80 pointer-events-none z-10"></div>
      <div className="absolute top-16 right-12 md:right-32 w-3 h-5 bg-[#FF6B6B] -rotate-45 rounded-sm opacity-70 pointer-events-none z-10"></div>
      <div className="absolute top-36 left-8 md:left-40 w-5 h-3 bg-[#4D96FF] rotate-45 rounded-sm opacity-60 pointer-events-none z-10"></div>
      <div className="absolute top-44 right-10 md:right-20 w-4 h-4 bg-yellow-500 rotate-12 rounded-sm opacity-70 pointer-events-none z-10"></div>
      <div className="absolute top-8 md:top-16 left-1/4 w-3.5 h-3.5 bg-[#6BCB77] rotate-3 pointer-events-none z-10"></div>
      <div className="absolute top-10 md:top-20 right-1/4 w-4 h-2.5 bg-[#FF8E9E] -rotate-12 pointer-events-none z-10"></div>

      <div className="w-full max-w-4xl text-center z-10 flex flex-col items-center mt-6">

        {/* Main Heading with VAYO Image */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight flex items-center justify-center flex-wrap gap-x-2.5 md:gap-x-3.5">
          Thank you for joining
          <span className="inline-flex items-center justify-center select-none">
            <Image
              src="/assets/vayo-logo.png"
              alt="VAYO"
              width={140}
              height={38}
              className="h-8 md:h-[42px] w-auto inline-block align-middle"
              priority
            />
          </span>
          !
        </h1>

        <p className="text-sm md:text-base text-white/70 font-medium max-w-2xl leading-relaxed mb-3 px-4">
          We appreciate your interest in VAYO, and can&apos;t wait to learn what experiences and vibes you share.
          We will verify your details and contact you once your registration is approved.
        </p>

        {/* Signature */}
        <p className="text-[10px] md:text-xs text-white/40 font-bold tracking-[2.5px] uppercase mb-8">
          – THE TEAM VAYO
        </p>

        {/* Registered Email (if any) */}
        {email && (
          <div className="mb-6 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-indigo-300 font-medium inline-block select-none shadow-sm">
            Registered Email: <span className="text-white font-bold">{email}</span>
          </div>
        )}

        {/* Browser Mockup Window */}
        <div className="w-full max-w-3xl mx-auto rounded-xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden bg-[#0c0c14]/40 backdrop-blur-md mt-2 mb-8">

          {/* macOS window controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 select-none">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></span>
            </div>

            <div className="hidden sm:block text-[10px] text-white/40 bg-white/5 rounded-md py-1 px-12 text-center w-56 border border-white/5 truncate font-mono">
              askvayo.com/vayo
            </div>
            <div className="w-14"></div>
          </div>

          {/* Participant Media Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 p-3 md:p-4 bg-[#050508]/20">
            {eventMedia.map((event, index) => (
              <div
                key={index}
                className="relative aspect-video sm:aspect-square md:aspect-video rounded-lg overflow-hidden bg-slate-950 group shadow-sm border border-white/5"
              >
                {event.isVideo ? (
                  <video
                    src={event.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <img
                    src={event.src}
                    alt={event.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}

                {/* Meet style Participant Label */}
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 rounded text-[8px] md:text-[10px] text-white font-medium backdrop-blur-sm flex items-center gap-1 md:gap-1.5 select-none shadow-sm">
                  <span>{event.icon}</span>
                  <span className="truncate max-w-[55px] sm:max-w-none">{event.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-slate-950 text-xs md:text-sm font-bold hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)] active:translate-y-0 transition-all duration-300 cursor-pointer shadow-md mb-8"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 h-24 bg-transparent transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="flex items-center decoration-none px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-lg hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group">
            <Image
              src="/assets/vayo-logo.png"
              alt="VAYO Logo"
              width={90}
              height={24}
              className="h-5 w-auto opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              priority
            />
          </Link>
        </div>
      </nav>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </>
  );
}
