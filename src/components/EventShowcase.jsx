"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const events = [
  {
    id: "outdoors",
    title: "Outdoor Adventures",
    description: "Step outside the urban hustle. Scenic day hikes, weekend getaways, and nature treks with an energetic group of fellow wanderers.",
    media: "/assets/Sport_outdor.mp4",
    isVideo: true,
    poster: "/assets/events/outdoors.png",
    vibe: "Active • Exploration • Nature",
    bgAccent: "from-emerald-500/20 to-teal-500/20",
    borderAccent: "group-hover:border-emerald-500/40",
    details: {
      groupSize: "10 - 15 explorers",
      frequency: "Saturday mornings",
      locations: "Nandi Hills, Savandurga, Ramanagara",
      highlights: ["Scenic sunrise treks", "Shared carpools & music", "Post-hike local breakfast"]
    }
  },
  {
    id: "dinners",
    title: "Community Dinners",
    description: "Break bread and share stories. Intimate curated group dining experiences at handpicked spots designed for authentic conversation.",
    media: "/assets/community.mp4",
    isVideo: true,
    poster: "/assets/events/dinners.png",
    vibe: "Cozy • Gastronomy • Stories",
    bgAccent: "from-amber-500/20 to-orange-500/20",
    borderAccent: "group-hover:border-amber-500/40",
    details: {
      groupSize: "6 - 8 dinner guests",
      frequency: "Friday & Saturday nights",
      locations: "Indie spots in Indiranagar & Koramangala",
      highlights: ["Curated conversation menus", "Handpicked culinary spots", "Authentic offline connections"]
    }
  },
  {
    id: "boardgames",
    title: "Board Game Socials",
    description: "Sip, roll, and strategize. Unwind in cozy living rooms or local cafes with classic tabletop games and vibrant social banter.",
    media: "/assets/Board_game.mp4",
    isVideo: true,
    poster: "/assets/events/boardgames.png",
    vibe: "Playful • Strategy • Banter",
    bgAccent: "from-indigo-500/20 to-violet-500/20",
    borderAccent: "group-hover:border-indigo-500/40",
    details: {
      groupSize: "8 - 12 players",
      frequency: "Sunday afternoons",
      locations: "Vayo HQ & local boardgame cafes",
      highlights: ["30+ title game library", "Dedicated host to explain rules", "Chilled beverages & snacks"]
    }
  },
  {
    id: "sports",
    title: "Sports & Play",
    description: "Get active and stay fit. Friendly matches, weekly turf football, cricket, and badminton sessions with players of your skill level.",
    media: "/assets/4.jpg",
    isVideo: false,
    vibe: "Energetic • Teamwork • Health",
    bgAccent: "from-blue-500/20 to-sky-500/20",
    borderAccent: "group-hover:border-blue-500/40",
    details: {
      groupSize: "10 - 14 players",
      frequency: "Weekly evening slots",
      locations: "Turfs in Koramangala & HSR Layout",
      highlights: ["All skill levels welcome", "Equipment/kit provided", "Social post-match hangout"]
    }
  },
  {
    id: "holi",
    title: "Holi Celebration",
    description: "Colors, music, and endless laughter. Celebrate the festival of colors with our warm, welcoming community, making memories that last a lifetime.",
    media: "/assets/HOLI.mp4",
    isVideo: true,
    vibe: "Festive • Colors • Celebration",
    bgAccent: "from-pink-500/20 to-rose-500/20",
    borderAccent: "group-hover:border-pink-500/40",
    details: {
      groupSize: "50+ community members",
      frequency: "Annual festival special",
      locations: "Vayo Open Lawn, Bangalore",
      highlights: ["100% organic colors", "Live dhol & DJ set", "Festive gujiyas & cool thandai"]
    }
  },
  {
    id: "sankranti",
    title: "Sankranti Celebration",
    description: "Celebrate the harvest season with kites flying high, traditional festive delicacies, and a warm community sharing the joy of new beginnings.",
    media: "/assets/Sankranti_Meetup.mp4",
    isVideo: true,
    vibe: "Culture • Festival • Joy",
    bgAccent: "from-yellow-500/20 to-amber-500/20",
    borderAccent: "group-hover:border-yellow-500/40",
    details: {
      groupSize: "30+ community members",
      frequency: "Harvest festival special",
      locations: "Vayo Open Terrace, Bangalore",
      highlights: ["Kite flying competition", "Pongal cooking masterclass", "Traditional dress code"]
    }
  },
  {
    id: "cafes",
    title: "Cafe Explorations",
    description: "Unwind at the city's finest aesthetic cafes. Perfect for sharing book recommendations, trying artisanal coffees, and relaxed talks.",
    media: "/assets/Cafe_exploring.mp4",
    isVideo: true,
    vibe: "Cozy • Coffee • Conversations",
    bgAccent: "from-orange-600/20 to-amber-700/20",
    borderAccent: "group-hover:border-orange-600/40",
    details: {
      groupSize: "6 - 8 coffee lovers",
      frequency: "Saturday afternoons",
      locations: "Artisanal coffee spots in Indiranagar",
      highlights: ["Pour-over & mocha tastings", "Book swap & recommendations", "Relaxed creative chatter"]
    }
  },
  {
    id: "Social",
    title: "Socials",
    description: "Enjoy sunset views, premium light displays, and ambient acoustics with friends old and new at handpicked rooftop spots.",
    media: "/assets/IMG_5839.mp4",
    isVideo: true,
    vibe: "Skyline • Music • Vibe",
    bgAccent: "from-purple-500/20 to-fuchsia-500/20",
    borderAccent: "group-hover:border-purple-500/40",
    details: {
      groupSize: "40 - 60 members",
      frequency: "Bi-weekly Saturdays",
      locations: "Rooftop lounges & terraces",
      highlights: ["Panoramic sunset views", "Ambient acoustic sets", "Craft cocktails & drinks"]
    }
  },
  {
    id: "creative",
    title: "Creative Workshops",
    description: "Hands-on collaborative sessions from pottery making to coffee tasting. Discover new skills and share ideas with curious peers.",
    media: "/assets/IMG_5822.mp4",
    isVideo: true,
    vibe: "Artistic • Hands-On • Curious",
    bgAccent: "from-cyan-500/20 to-teal-500/20",
    borderAccent: "group-hover:border-cyan-500/40",
    details: {
      groupSize: "8 - 12 creators",
      frequency: "Alternate Sunday mornings",
      locations: "Artisanal pottery & craft studios",
      highlights: ["Expert workshop guidance", "All materials provided", "Take home your creations"]
    }
  }
];

// A performance-optimized video component that only plays when in viewport
const LazyVideo = ({ src, className, poster }) => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        root: null, // relative to the viewport
        rootMargin: "80px", // pre-load slightly before it scrolls into view
        threshold: 0.05,
      }
    );

    observer.observe(videoElement);

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isInView) {
      videoElement.play().catch((err) => {
        // Safe fallback for standard autoplay restrictions
        console.log("Autoplay interrupted or blocked:", err);
      });
    } else {
      videoElement.pause();
    }
  }, [isInView]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className={className}
      poster={poster}
    />
  );
};

export default function EventShowcase() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardId, setActiveCardId] = useState(null);

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

  const toggleFlip = (id) => {
    if (activeCardId === id) {
      setActiveCardId(null);
    } else {
      setActiveCardId(id);
    }
  };

  return (
    <div className="w-full relative py-12 overflow-hidden">
      {/* Dark backdrop overlay when a card is active/lifted */}
      <div
        className={`absolute inset-0 bg-black/60 z-30 transition-all duration-500 ${activeCardId ? "opacity-100 pointer-events-auto backdrop-blur-[2px]" : "opacity-0 pointer-events-none backdrop-blur-0"
          }`}
        onClick={() => setActiveCardId(null)}
      ></div>

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

      {/* Horizontal Scroll Area with vertical padding to prevent clipping when active card lifts */}
      <div className={`relative w-full overflow-hidden px-4 md:px-0 transition-all duration-300 ${activeCardId ? "z-40" : "z-20"}`}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pt-8 pb-12 scrollbar-hide snap-x snap-mandatory px-[max(1rem,calc((100vw-72rem)/2))] md:px-[max(2rem,calc((100vw-72rem)/2))]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event) => {
            const isCurrentActive = activeCardId === event.id;
            const isAnyActive = activeCardId !== null;
            const isOtherActive = isAnyActive && !isCurrentActive;

            return (
              <div
                key={event.id}
                className={`perspective-1000 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-start group relative h-[460px] md:h-[500px] transition-all duration-500 ease-out
                  ${isCurrentActive ? "z-40 scale-105 md:scale-[1.08] -translate-y-6" : "z-10"}
                  ${isOtherActive ? "blur-[4px] opacity-25 scale-95 pointer-events-none" : ""}
                `}
              >
                <div
                  className={`w-full h-full duration-700 preserve-3d relative transition-all duration-500
                    ${isCurrentActive ? "rotate-y-180" : ""}
                    ${isCurrentActive ? "shadow-[0_30px_80px_rgba(99,102,241,0.45)] rounded-[2rem]" : ""}
                  `}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-[2rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-md overflow-hidden hover:bg-white/[0.04] transition-all duration-500 flex flex-col justify-between">
                    <div>
                      {/* Photo/Video Area */}
                      <div className="relative w-full h-[220px] md:h-[250px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/20 to-transparent z-10"></div>
                        {event.isVideo ? (
                          <LazyVideo
                            src={event.media}
                            poster={event.poster}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <Image
                            src={event.media}
                            alt={event.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            sizes="(max-width: 768px) 100vw, 360px"
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
                      <div className="p-6 md:p-8 pt-4 md:pt-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-violet-200 transition-colors duration-300">
                          {event.title}
                        </h3>
                        <p className="text-xs md:text-sm text-white/60 leading-relaxed font-normal mt-2.5 line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Micro CTA inside card */}
                    <div className="p-6 md:p-8 pt-0">
                      <div
                        onClick={() => toggleFlip(event.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-indigo-400 hover:text-indigo-300 transition-colors duration-300 cursor-pointer select-none"
                      >
                        <span>Explore this community Vibe</span>
                        <span className="transform group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[2rem] bg-[#0c0c14] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between">
                    <div className="flex-1 flex flex-col">
                      {/* Back Side Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 tracking-[1.5px] uppercase">Inside the Vibe</span>
                          <h4 className="text-lg md:text-xl font-bold text-white mt-0.5">{event.title}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/5 border border-white/10 text-white/60">
                          {event.id.toUpperCase()}
                        </span>
                      </div>

                      {/* Details list */}
                      <div className="space-y-4 my-auto">
                        <div className="flex items-start gap-3">
                          <span className="text-sm mt-0.5">👥</span>
                          <div>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Typical Group Size</p>
                            <p className="text-xs md:text-sm text-white/80 font-medium">{event.details.groupSize}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-sm mt-0.5">🗓️</span>
                          <div>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Frequency</p>
                            <p className="text-xs md:text-sm text-white/80 font-medium">{event.details.frequency}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-sm mt-0.5">📍</span>
                          <div>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Popular Locations</p>
                            <p className="text-xs md:text-sm text-white/80 font-medium">{event.details.locations}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">Highlights</p>
                          <ul className="space-y-1.5">
                            {event.details.highlights.map((highlight, idx) => (
                              <li key={idx} className="text-[11px] md:text-xs text-violet-200/80 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Back Side Footer CTA Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
                      <button
                        onClick={() => toggleFlip(event.id)}
                        className="flex-1 py-2 px-3 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 active:scale-95 text-xs font-bold transition-all cursor-pointer"
                      >
                        &larr; Back
                      </button>
                      <Link
                        href={`/join?interest=${encodeURIComponent(event.title)}`}
                        className="flex-2 py-2 px-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-xs font-bold transition-all text-center decoration-none"
                      >
                        Join Our Community
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
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
