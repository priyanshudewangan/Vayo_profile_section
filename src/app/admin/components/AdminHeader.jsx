import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export const AdminHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-5">
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
          <Image
            src="/assets/vayo-logo.png"
            alt="VAYO"
            width={120}
            height={32}
            className="h-8 w-auto object-contain brightness-200"
          />
        </div>
        <div className="h-10 w-[1.5px] bg-vayo-sky/30 hidden md:block"></div>
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
            Admin Console
          </h1>
          <p className="text-[10px] text-vayo-sky/60 font-black uppercase tracking-[3px] opacity-80">
            Commune Intelligence Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="px-6 py-3 rounded-2xl bg-vayo-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-vayo-light hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-vayo-blue/20 group"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
        </Link>
      </div>
    </header>
  );
};
