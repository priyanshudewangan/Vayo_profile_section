"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Inline Icons for maximum reliability and build performance
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#E2EFF6]/85" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MIXERS = [
  {
    id: 1,
    image: "/assets/events/outdoorevent.jpg",
    tag: "Adventure",
    title: "Western Ghats Trek",
    date: "Saturday, 7:00 AM",
    description: "Scale new heights and catch a breathtaking sunrise with a group of explorers.",
  },
  {
    id: 2,
    image: "/assets/events/hangout.jpg",
    tag: "Social",
    title: "Rooftop Cocktail Mixer",
    date: "Friday, 8:00 PM",
    description: "Unwind with curated drinks and engaging conversations under the city lights.",
  },
  {
    id: 3,
    image: "/assets/events/cards.jpg",
    tag: "Casual",
    title: "Strategy Board Game Night",
    date: "Wednesday, 7:30 PM",
    description: "Test your skills, team up, and share laughs over a collection of indie games.",
  },
  {
    id: 4,
    image: "/assets/events/sports.jpg",
    tag: "Sports",
    title: "Midweek Turf Football",
    date: "Thursday, 8:30 PM",
    description: "Friendly, high-energy matches on the best turf in town for all skill levels.",
  },
  {
    id: 5,
    image: "/assets/events/holi.jpg",
    tag: "Festival",
    title: "VAYO Colors & Beats",
    date: "Sunday, 11:00 AM",
    description: "A premium, private Holi mixer with music, organic colors, and festive vibes.",
  },
  {
    id: 6,
    image: "/assets/events/something.jpg",
    tag: "Creative",
    title: "Art & Coffee Social",
    date: "Sunday, 3:00 PM",
    description: "Get hands-on with pottery or painting while sipping local micro-brews.",
  },
];

const DUPLICATED_MIXERS = [...MIXERS, ...MIXERS, ...MIXERS];

const STEPS = [
  {
    num: "01",
    title: "Select Your Vibes",
    desc: "Share your passions, availability, and social energy profile to customize matches.",
  },
  {
    num: "02",
    title: "Verification & Vetting",
    desc: "We review details to ensure a safe, high-intent, and authentic community.",
  },
  {
    num: "03",
    title: "Receive Invites",
    desc: "Get personalized notifications and invitations to curated local mixers and events.",
  },
  {
    num: "04",
    title: "Enjoy Belonging",
    desc: "Attend experiences, make genuine connections, and join our active private club.",
  },
];

function JoinFormContent() {
  const searchParams = useSearchParams();
  const [email] = useState(() => searchParams.get("email") || "");
  const [interest] = useState(() => searchParams.get("interest") || "");

  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const scrollXRef = useRef(0);
  const speedRef = useRef(0.8);
  const hoverProgressRef = useRef(new Array(DUPLICATED_MIXERS.length).fill(0));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [dimensions, setDimensions] = useState({ cardWidth: 290, cardHeight: 400, gap: 24 });

  // Handle responsive resizing of cards
  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 640) {
        setDimensions({ cardWidth: 240, cardHeight: 330, gap: 16 });
      } else {
        setDimensions({ cardWidth: 290, cardHeight: 400, gap: 24 });
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Main 3D requestAnimationFrame Loop
  useEffect(() => {
    let animationFrameId;
    
    const animate = () => {
      if (!containerRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      const containerWidth = containerRef.current.clientWidth;
      const screenCenter = containerWidth / 2;
      
      const cardWidth = dimensions.cardWidth;
      const gap = dimensions.gap;
      const step = cardWidth + gap;
      const totalWidth = DUPLICATED_MIXERS.length * step;
      
      // Interpolate scroll speed based on whether any card is hovered
      const isAnyCardHovered = hoveredIndex !== null;
      const targetSpeed = isAnyCardHovered ? 0.04 : 0.75;
      speedRef.current += (targetSpeed - speedRef.current) * 0.08;
      
      scrollXRef.current += speedRef.current;
      
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        
        const p = index * step;
        let x = (p - scrollXRef.current) % totalWidth;
        
        // Wrap around track boundaries
        if (x < -step) x += totalWidth;
        if (x > totalWidth - step) x -= totalWidth;
        
        const cardCenter = x + cardWidth / 2;
        const dx = cardCenter - screenCenter;
        const t = dx / (containerWidth / 2 || 1); // relative distance from viewport center
        
        const isHovered = hoveredIndex === index;
        
        // Handle custom smooth hover progress
        let hp = hoverProgressRef.current[index] || 0;
        if (isHovered) {
          hp += (1 - hp) * 0.15;
        } else {
          hp += (0 - hp) * 0.15;
        }
        hoverProgressRef.current[index] = hp;
        
        // 3D perspective calculation
        const maxTilt = 22; // max rotation degrees
        const angle = -t * maxTilt;
        const targetRotate = (1 - hp) * angle + hp * 0;
        
        // Translate Z: pushed back at edges, pulled forward on hover
        const zOffset = -Math.abs(t) * 85;
        const targetZ = (1 - hp) * zOffset + hp * 55;
        
        // Scale: smaller at edges, scaled up on hover
        const baseScale = 1 - Math.min(Math.abs(t), 1.2) * 0.12;
        const targetScale = (1 - hp) * baseScale + hp * 1.12;
        
        // Set transform inline directly on DOM for high-performance updates
        card.style.transform = `translateX(${x}px) translateZ(${targetZ}px) rotateY(${targetRotate}deg) scale(${targetScale})`;
        card.style.zIndex = hp > 0.05 ? Math.round(50 + hp * 10) : Math.round(10 - Math.abs(t) * 8);
        
        // Visual glows and border highlights matching Sky Reflection and Alice Blue
        if (hp > 0.01) {
          card.style.borderColor = `rgba(226, 239, 246, ${0.25 + hp * 0.45})`;
          card.style.boxShadow = `0 10px 40px -10px rgba(26, 62, 92, 0.3), 0 0 ${hp * 32}px ${hp * 5}px rgba(226, 239, 246, ${hp * 0.3})`;
        } else {
          card.style.borderColor = 'rgba(141, 190, 220, 0.3)'; // Sky Reflection border
          card.style.boxShadow = '0 10px 30px -10px rgba(26, 62, 92, 0.15)';
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, hoveredIndex]);

  // Tally Waitlist Integration Script
  useEffect(() => {
    const scriptId = "tally-js";
    const scriptUrl = "https://tally.so/widgets/embed.js";

    const initializeTally = () => {
      if (typeof Tally !== "undefined") {
        Tally.loadEmbeds();
      } else {
        document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((iframe) => {
          iframe.src = iframe.dataset.tallySrc;
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptUrl;
      script.onload = initializeTally;
      script.onerror = initializeTally;
      document.body.appendChild(script);
    } else {
      initializeTally();
    }
  }, [email, interest]);

  // Construct URL matching production waitlist embed parameters
  const tallyUrl = `https://tally.so/embed/m6gM9k?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1${
    email ? `&Email=${encodeURIComponent(email)}` : ""
  }${interest ? `&Interest=${encodeURIComponent(interest)}` : ""}`;

  return (
    <div className="relative z-10 w-full flex flex-col items-center">
      {/* Hero Headline Section */}
      <section className="text-center pt-32 pb-10 px-4 max-w-3xl mx-auto relative z-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E2EFF6]/10 border border-[#E2EFF6]/25 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#E2EFF6] animate-pulse"></span>
          <span className="text-xs font-bold text-[#E2EFF6] tracking-wider uppercase">VAYO WAITLIST: OPEN</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight text-[#E2EFF6]">
          Curious What <br className="sm:hidden" />
          We've Created?
        </h1>
        
        <p className="text-base sm:text-lg text-[#E2EFF6]/85 leading-relaxed max-w-xl mx-auto font-medium">
          Take a look at the mixers, activities, and celebrations happening in our community. Join the waitlist below to get vetted.
        </p>
      </section>

      {/* 3D Perspective Curved Coverflow Carousel */}
      <section className="w-full relative overflow-hidden py-14 flex items-center justify-center select-none">
        {/* Soft edge masking gradients to fade out cards on sides */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#4893C6] via-[#4893C6]/60 to-transparent z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#4893C6] via-[#4893C6]/60 to-transparent z-20"></div>

        {/* 3D Viewport wrapper */}
        <div 
          ref={containerRef}
          className="relative w-full overflow-visible"
          style={{ 
            height: `${dimensions.cardHeight + 40}px`,
            perspective: "1200px", 
            transformStyle: "preserve-3d" 
          }}
        >
          {DUPLICATED_MIXERS.map((mixer, index) => {
            const initialX = index * (dimensions.cardWidth + dimensions.gap);
            return (
              <div
                key={`${mixer.id}-${index}`}
                ref={(el) => (cardRefs.current[index] = el)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="absolute top-5 left-0 rounded-[2rem] border border-[#8DBEDC]/35 bg-white/10 backdrop-blur-md text-[#E2EFF6] transition-color-glow cursor-pointer overflow-hidden preserve-3d"
                style={{
                  width: `${dimensions.cardWidth}px`,
                  height: `${dimensions.cardHeight}px`,
                  transform: `translateX(${initialX}px) translateZ(0px) rotateY(0deg)`,
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
              >
                {/* Visual card content - styled like a premium human-designed polaroid flyer */}
                <div className="absolute inset-0 w-full h-full flex flex-col preserve-3d">
                  {/* Event Image Container (Upper Section) */}
                  <div className="relative w-full h-[55%] overflow-hidden">
                    <Image 
                      src={mixer.image} 
                      alt={mixer.title} 
                      fill 
                      sizes={`${dimensions.cardWidth}px`}
                      className="object-cover opacity-90 transition-all duration-500 pointer-events-none select-none"
                      priority={index < 5}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>
                  </div>

                  {/* Polaroid Content Area (Lower Section) - Sky Reflection and Alice Blue */}
                  <div className="w-full h-[45%] bg-[#1a3e5c]/45 border-t border-[#8DBEDC]/25 p-5 flex flex-col justify-between z-20 pointer-events-none select-none">
                    <div>
                      <span className="px-2.5 py-0.5 text-[9px] uppercase font-extrabold tracking-widest rounded-full bg-[#8DBEDC]/15 text-[#E2EFF6] border border-[#8DBEDC]/30 w-fit mb-2 inline-block">
                        {mixer.tag}
                      </span>
                      
                      <h3 className="text-base sm:text-lg font-bold text-[#E2EFF6] tracking-tight leading-tight mb-1">
                        {mixer.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E2EFF6]/80 mb-2">
                        <CalendarIcon />
                        <span>{mixer.date}</span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-[#E2EFF6]/75 leading-relaxed font-medium">
                      {mixer.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Onboarding Steps Flow */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 relative z-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E2EFF6] mb-3">
            How VAYO Works
          </h2>
          <p className="text-sm text-[#E2EFF6]/75 max-w-md mx-auto font-medium">
            Our onboarding is designed to create a safe, vetted space for meaningful local connections.
          </p>
        </div>

        <div className="flex flex-row overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
          {STEPS.map((step, idx) => (
            <div 
              key={idx}
              className="group relative bg-white/10 backdrop-blur-md hover:bg-white/15 border border-white/20 hover:border-white/35 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between h-[175px] w-[230px] shrink-0 snap-start shadow-sm text-[#E2EFF6] sm:w-auto sm:h-[200px] sm:shrink-1"
            >
              {/* Top border shine effect */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2EFF6]/0 hover:via-[#E2EFF6]/25 to-transparent transition-all duration-500"></div>

              <div>
                <span className="text-[10px] sm:text-xs font-bold text-[#E2EFF6]/70 tracking-wider font-mono">// {step.num}</span>
                <h3 className="text-base sm:text-lg font-bold text-[#E2EFF6] tracking-tight mt-2 sm:mt-3 mb-1.5 sm:mb-2">
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-[#E2EFF6]/80 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded Registration Waitlist Card */}
      <section className="w-full max-w-xl mx-auto px-4 pb-28 relative z-20">
        <div className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_24px_50px_-12px_rgba(26,62,92,0.3)] relative overflow-hidden">
          {/* Top border shine */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2EFF6]/20 to-transparent"></div>
          
          <div className="relative z-10 text-center mb-8">
            <h2 className="text-3xl font-bold text-[#E2EFF6] tracking-tight mb-3">
              Request Invite
            </h2>
            <p className="text-xs sm:text-sm text-[#E2EFF6]/80 leading-relaxed px-4 font-medium">
              Enter your details below to join the waitlist. Vetting is completed within 48 hours.
            </p>
          </div>

          {/* Embedded Tally iframe */}
          <div className="w-full min-h-[460px] relative z-10">
            <iframe
              key={tallyUrl}
              data-tally-src={tallyUrl}
              loading="lazy"
              width="100%"
              height="460"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="VAYO - Let's Do It 💙"
              className="w-full border-0"
            ></iframe>
            
            <div className="text-center mt-6">
              <a
                href={tallyUrl.replace("&transparentBackground=1", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#E2EFF6]/70 hover:text-[#E2EFF6] underline transition-colors font-bold"
              >
                Having trouble? Open registration form in a new tab ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#4893C6] text-[#E2EFF6] relative overflow-x-hidden">
      {/* High-End Organic Film Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-10"></div>

      {/* Clean Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 h-24 bg-transparent transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="flex items-center decoration-none px-6 py-3 rounded-full bg-[#1a3e5c]/90 backdrop-blur-md border border-[#8DBEDC]/20 shadow-md hover:bg-[#1a3e5c] hover:border-[#8DBEDC]/40 transition-all duration-300 group">
            {/* White logo works perfectly in this layout directly */}
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

      {/* Suspense wrapper to handle SearchParams hydration during NextJS build */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#E2EFF6] font-bold">Loading Waitlist...</div>}>
        <JoinFormContent />
      </Suspense>
    </div>
  );
}
