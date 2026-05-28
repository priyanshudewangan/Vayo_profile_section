"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

const events = [
  {
    id: "outdoors",
    title: "Outdoor Adventures",
    description: "Step outside the urban hustle. Scenic day hikes, weekend getaways, and nature treks with an energetic group of fellow wanderers.",
    media: "/assets/Sport_outdor.MOV",
    isVideo: true,
    vibe: "Active • Exploration • Nature",
    bgAccent: "from-emerald-500/20 to-teal-500/20",
    borderAccent: "group-hover:border-emerald-500/40"
  },
  {
    id: "dinners",
    title: "Community Dinners",
    description: "Break bread and share stories. Intimate curated group dining experiences at handpicked spots designed for authentic conversation.",
    media: "/assets/community.MOV",
    isVideo: true,
    vibe: "Cozy • Gastronomy • Stories",
    bgAccent: "from-amber-500/20 to-orange-500/20",
    borderAccent: "group-hover:border-amber-500/40"
  },
  {
    id: "boardgames",
    title: "Board Game Socials",
    description: "Sip, roll, and strategize. Unwind in cozy living rooms or local cafes with classic tabletop games and vibrant social banter.",
    media: "/assets/Board_game.MOV",
    isVideo: true,
    vibe: "Playful • Strategy • Banter",
    bgAccent: "from-indigo-500/20 to-violet-500/20",
    borderAccent: "group-hover:border-indigo-500/40"
  },
  {
    id: "sports",
    title: "Sports & Play",
    description: "Get active and stay fit. Friendly matches, weekly turf football, cricket, and badminton sessions with players of your skill level.",
    media: "/assets/4.jpg",
    isVideo: false,
    vibe: "Energetic • Teamwork • Health",
    bgAccent: "from-blue-500/20 to-sky-500/20",
    borderAccent: "group-hover:border-blue-500/40"
  },
  {
    id: "holi",
    title: "Holi Celebration",
    description: "Colors, music, and endless laughter. Celebrate the festival of colors with our warm, welcoming community, making memories that last a lifetime.",
    media: "/assets/HOLI.MOV",
    isVideo: true,
    vibe: "Festive • Colors • Celebration",
    bgAccent: "from-pink-500/20 to-rose-500/20",
    borderAccent: "group-hover:border-pink-500/40"
  },
  {
    id: "sankranti",
    title: "Sankranti Celebration",
    description: "Celebrate the harvest season with kites flying high, traditional festive delicacies, and a warm community sharing the joy of new beginnings.",
    media: "/assets/Sankranti_Meetup.MOV",
    isVideo: true,
    vibe: "Culture • Festival • Joy",
    bgAccent: "from-yellow-500/20 to-amber-500/20",
    borderAccent: "group-hover:border-yellow-500/40"
  },
  {
    id: "cafes",
    title: "Cafe Explorations",
    description: "Unwind at the city's finest aesthetic cafes. Perfect for sharing book recommendations, trying artisanal coffees, and relaxed talks.",
    media: "/assets/Cafe_exploring.MOV",
    isVideo: true,
    vibe: "Cozy • Coffee • Conversations",
    bgAccent: "from-orange-600/20 to-amber-700/20",
    borderAccent: "group-hover:border-orange-600/40"
  },
  {
    id: "Social",
    title: "Socials",
    description: "Enjoy sunset views, premium light displays, and ambient acoustics with friends old and new at handpicked rooftop spots.",
    media: "/assets/IMG_5839.MOV",
    isVideo: true,
    vibe: "Skyline • Music • Vibe",
    bgAccent: "from-purple-500/20 to-fuchsia-500/20",
    borderAccent: "group-hover:border-purple-500/40"
  },
  {
    id: "creative",
    title: "Creative Workshops",
    description: "Hands-on collaborative sessions from pottery making to coffee tasting. Discover new skills and share ideas with curious peers.",
    media: "/assets/IMG_5822.MOV",
    isVideo: true,
    vibe: "Artistic • Hands-On • Curious",
    bgAccent: "from-cyan-500/20 to-teal-500/20",
    borderAccent: "group-hover:border-cyan-500/40"
  }
];

export default function EventShowcase() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    setScrollProgress(scrollLeft / maxScroll);
  };

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const scrollAmount = 340;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="w-full relative py-12">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4 max-w-6xl mx-auto z-10 relative">
        <div>
          <span className="text-xs font-bold text-violet-400 tracking-[3px] uppercase">Highlights</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mt-1">
            Life Happens Offline
          </h2>
          <p className="text-sm md:text-base text-white/50 mt-2 max-w-xl">
            Swipe less, live more. Discover the types of curated activities that bring our members together every week.
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto mb-1">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="relative w-full overflow-hidden px-4 md:px-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-[max(1rem,calc((100vw-72rem)/2))] md:px-[max(2rem,calc((100vw-72rem)/2))]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-start group relative rounded-[2rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-md overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-[460px] md:h-[500px]"
            >
              {/* Card top border highlight on hover */}
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${event.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              {/* Photo/Video Area */}
              <div className="relative w-full h-[220px] md:h-[250px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent z-10"></div>
                {event.isVideo ? (
                  <video
                    src={event.media}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <img
                    src={event.media}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                )}

                {/* Vibe Tag overlay */}
                <div className="absolute bottom-3 left-4 z-20">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/10 text-violet-300">
                    {event.vibe}
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-violet-200 transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal mt-3 line-clamp-4">
                    {event.description}
                  </p>
                </div>

                {/* Micro CTA inside card */}
                <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-indigo-400 transition-colors duration-300">
                  <span>Explore this community Vibe</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Progress Bar Indicator */}
      <div className="max-w-6xl mx-auto px-4 mt-2 flex justify-center z-10 relative">
        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(10, scrollProgress * 100))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
