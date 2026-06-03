"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function JoinFormContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [interest, setInterest] = useState(() => searchParams.get("interest") || "");
  const [iframeLoading, setIframeLoading] = useState(true);

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

  // Build the Tally source URL with standard embed options and optional email/interest pre-filling.
  // Note: Tally maps URL query parameters to form fields (e.g. Email -> email).
  const tallyUrl = `https://tally.so/embed/m6gM9k?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1${email ? `&Email=${encodeURIComponent(email)}` : ""
    }${interest ? `&Interest=${encodeURIComponent(interest)}` : ""}`;

  return (
    <>
      {/* Background Dimming Overlay */}
      <div className="fixed inset-0 bg-[#050508]/60 backdrop-blur-[8px] z-0 pointer-events-none"></div>

      <section className="flex items-start md:items-center justify-center min-h-screen relative z-10 px-4 py-24 md:py-10">

        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="absolute w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse mix-blend-screen translate-x-[-20%] translate-y-[-20%]"></div>
          <div className="absolute w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[100px] animate-pulse mix-blend-screen translate-x-[20%] translate-y-[20%]" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Premium Glassmorphism Card */}
        <div className="w-full max-w-xl mx-auto relative z-10 bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] rounded-[2.5rem] p-7 md:p-12 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] overflow-hidden">

          {/* Subtle Shine Effect */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4 text-center">
              Join Our Community
            </h2>
            <p className="text-sm md:text-base text-white/60 mb-8 leading-relaxed font-medium text-center px-4">
              Meet new people, join experiences, and be part of a growing community built around real connections.
            </p>

            {/* Embedded Tally Form */}
            <div className="w-full min-h-[450px] relative">
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-20">
                  <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                  <span className="text-xs text-white/50 tracking-wider font-medium animate-pulse">Loading secure form...</span>
                </div>
              )}
              <iframe
                key={tallyUrl} // Triggers iframe reload if the email prefill state changes
                src={tallyUrl}
                data-tally-src={tallyUrl}
                onLoad={() => setIframeLoading(false)}
                loading="lazy"
                width="100%"
                height="450"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                title="VAYO - Let's Do It 💙"
                className={`w-full border-0 transition-opacity duration-500 ${iframeLoading ? "opacity-0" : "opacity-100"}`}
              ></iframe>
              <div className="text-center mt-4">
                <a
                  href={tallyUrl.replace('&transparentBackground=1', '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/40 hover:text-indigo-400 underline transition-colors"
                >
                  Not loading? Open the form directly ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function JoinPage() {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 h-24 bg-transparent transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="flex items-center decoration-none px-6 py-3 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-lg hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group">
            <Image src="/assets/vayo-logo.png" alt="VAYO Logo" width={90} height={24} className="h-5 w-auto opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" priority />
          </Link>
        </div>
      </nav>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
        <JoinFormContent />
      </Suspense>
    </>
  );
}
