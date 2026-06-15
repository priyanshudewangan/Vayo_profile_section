import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminLogin = ({ 
  password, 
  setPassword, 
  login, 
  isLoading, 
  authError, 
  toasts 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    login(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-vayo-blue text-slate-800 font-sans px-4 overflow-hidden selection:bg-vayo-blue/20">
      {/* Background Dot Grid and Noise overlays */}
      <div className="fixed inset-0 z-0 bg-dot-grid-light bg-noise opacity-50 pointer-events-none"></div>

      {/* Ambient Glowing Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute w-[650px] h-[650px] bg-vayo-sky/20 rounded-full blur-[140px] animate-pulse"></div>
        <div
          className="absolute w-[500px] h-[500px] bg-vayo-pale/20 rounded-full blur-[120px] translate-x-32 translate-y-32 animate-pulse"
          style={{ animationDelay: "2.5s" }}
        ></div>
      </div>

      {/* Floating Custom Toast Alerts */}
      <div className="fixed top-8 right-8 z-[100] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-3xl backdrop-blur-2xl border text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500 ${toast.type === "success"
              ? "bg-white/95 border-emerald-500/20 text-emerald-600"
              : toast.type === "error"
                ? "bg-white/95 border-rose-500/20 text-rose-600"
                : "bg-white/95 border-vayo-sky text-vayo-blue"
              }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/10" : toast.type === "error" ? "bg-rose-500/10" : "bg-vayo-blue/10"
            }`}>
              <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-vayo-blue"
                }`}></span>
            </div>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Premium Light-Blue Lock Card */}
      <div className="w-full max-w-md relative z-10 bg-white/70 backdrop-blur-[48px] border border-vayo-sky rounded-[3rem] p-10 md:p-16 shadow-[0_32px_80px_rgba(72,147,198,0.15)] text-center group transition-all duration-500 hover:shadow-[0_32px_90px_rgba(72,147,198,0.2)]">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-vayo-sky to-transparent"></div>

        <Link href="/" className="inline-block mb-12 hover:scale-105 hover:opacity-80 transition-all duration-500 ease-out">
          <Image
            src="/assets/vayo-logo.png"
            alt="VAYO"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {/* Glowing lock wrapper */}
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-vayo-alice to-white border-2 border-vayo-sky/40 flex items-center justify-center mb-10 mx-auto shadow-[0_16px_40px_rgba(72,147,198,0.12)] relative group-hover:scale-110 transition-transform duration-700 ease-out">
          <Lock className="w-9 h-9 text-vayo-blue transition-all duration-500" />
          <span className="absolute inset-0 rounded-[2rem] border-2 border-vayo-sky animate-ping opacity-20 pointer-events-none"></span>
          {/* Inner decorative corner */}
          <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-vayo-blue/20 rounded-tr-sm"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-vayo-blue/20 rounded-bl-sm"></div>
        </div>

        <div className="space-y-2 mb-10">
          <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase">Access Portal</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[2px] max-w-[280px] mx-auto opacity-70">
            Database key credentials required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group/input">
            <Input
              type="password"
              placeholder="Enter Password Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white/80 border-2 rounded-2xl px-6 py-8 text-sm text-slate-800 placeholder:text-slate-300 focus:bg-white transition-all duration-300 shadow-sm ${
                authError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : "border-vayo-sky/60 focus:border-vayo-blue focus:ring-vayo-blue/10"
              }`}
              required
            />
          </div>

          {authError && (
            <div className="flex items-center justify-center gap-2 text-[10px] text-rose-500 font-black uppercase tracking-widest animate-in shake duration-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-8 rounded-2xl bg-vayo-blue text-white text-xs font-black uppercase tracking-[3px] hover:bg-vayo-light hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(72,147,198,0.3)] active:translate-y-0 transition-all duration-500 cursor-pointer flex items-center justify-center gap-3 mt-6 shadow-lg shadow-vayo-blue/20 overflow-hidden relative"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-3 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <span>Enter Console</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        </form>
      </div>
    </div>
  );
};
