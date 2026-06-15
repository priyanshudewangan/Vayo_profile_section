"use client";

import { usePathname } from "next/navigation";

export default function BackgroundVideo() {
  const pathname = usePathname();

  // Do not render the background video on the /join, /askvayo/vayo, or /profile pages to prevent heavy memory/GPU usage
  // and to allow clean layouts.
  if (pathname === "/join" || pathname === "/invite" || pathname === "/askvayo/vayo" || pathname === "/profile") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050508]">
      <video
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/pin_bg_2.mp4" type="video/mp4" />
      </video>
      {/* Subtle responsive background gradients for mobile to keep premium feel under the video */}
      <div className="md:hidden absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-indigo-900/15 blur-[120px] pointer-events-none"></div>
      <div className="md:hidden absolute bottom-[20%] right-[-20%] w-[80%] h-[60%] rounded-full bg-violet-900/15 blur-[120px] pointer-events-none"></div>
    </div>
  );
}
