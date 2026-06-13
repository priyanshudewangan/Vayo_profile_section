"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Phone,
  Calendar,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  Camera,
  X,
  User,
  Mountain,
  Utensils,
  Dices,
  Trophy,
  Leaf,
  Coffee,
  Compass,
  Palette
} from "lucide-react";

// Inline Instagram icon SVG component
const Instagram = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// List of activities matching page.js with Lucide icons
const vibeOptions = [
  { title: "Outdoor Adventures", icon: Mountain },
  { title: "Community Dinners", icon: Utensils },
  { title: "Board Game Socials", icon: Dices },
  { title: "Sports & Play", icon: Trophy },
  { title: "Holi Celebration", icon: Sparkles },
  { title: "Sankranti Celebration", icon: Leaf },
  { title: "Cafe Explorations", icon: Coffee },
  { title: "Socials", icon: Compass },
  { title: "Creative Workshops", icon: Palette },
];

function JoinFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Multi-step state: 1 (Contact), 2 (Details), 3 (Vibes), 4 (Selfie), 5 (Review)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Compute age from birthdate
  const getAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle Drag & Drop events
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelfieFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelfieFile(e.target.files[0]);
    }
  };

  const handleSelfieFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be less than 5MB.");
      return;
    }

    setSelfieFile(file);
    setErrorMsg("");

    // Create a local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfiePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle vibe select toggle
  const toggleVibe = (title) => {
    setSelectedVibes((prev) =>
      prev.includes(title)
        ? prev.filter((v) => v !== title)
        : [...prev, title]
    );
  };

  // Step Navigations & Validations
  const nextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!name || name.trim().length < 2) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!email || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      if (!phone || phone.trim().length < 8) {
        setErrorMsg("Please enter a valid phone number.");
        return;
      }
    } else if (step === 2) {
      if (!birthdate) {
        setErrorMsg("Please select your birthdate.");
        return;
      }
      const age = getAge(birthdate);
      if (age < 18) {
        setErrorMsg("You must be 18 years or older to join VAYO.");
        return;
      }
      if (age > 120) {
        setErrorMsg("Please enter a valid birthdate.");
        return;
      }
      if (!instagram || instagram.trim().length < 2) {
        setErrorMsg("Please enter your Instagram handle.");
        return;
      }
    } else if (step === 3) {
      if (selectedVibes.length === 0) {
        setErrorMsg("Please select at least one vibe/interest.");
        return;
      }
    } else if (step === 4) {
      if (!selfieFile && !selfieUrl) {
        setErrorMsg("Please upload a selfie image for verification.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((prev) => prev - 1);
  };

  // Upload selfie file to Supabase Storage
  const uploadSelfieToStorage = async (file) => {
    setUploadingSelfie(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to the 'selfies' bucket
      const { data, error } = await supabase.storage
        .from("selfies")
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("selfies")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Selfie Upload Error:", err);
      throw new Error("Failed to upload image. Please verify you created the 'selfies' bucket in your Supabase console.");
    } finally {
      setUploadingSelfie(false);
    }
  };

  // Handle final form submit
  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      let finalSelfieUrl = selfieUrl;

      // Upload file if not already done
      if (selfieFile && !finalSelfieUrl) {
        finalSelfieUrl = await uploadSelfieToStorage(selfieFile);
        setSelfieUrl(finalSelfieUrl);
      }

      // Submit data to database
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          birthdate,
          instagram: instagram.startsWith("@") ? instagram : `@${instagram}`,
          interests: selectedVibes,
          selfie_url: finalSelfieUrl,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit waitlist registration.");
      }

      // Successful completion - redirect to thank you screen
      router.push(`/askvayo/vayo?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Form Submit Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Video specifically for the Join page */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-100 blur-[8px]"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/Sky-bg.mp4" type="video/mp4" />
        </video>
      </div>

      <section className="flex items-start md:items-center justify-center min-h-screen relative z-10 px-4 py-24 md:py-10">

        {/* Premium Light Glassmorphism Card */}
        <div className="w-full max-w-xl mx-auto relative z-10 bg-white/55 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] p-7 md:p-12 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.08)] overflow-hidden">

          {/* Subtle Shine Effect */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            {/* Membership Tag */}
            <div className="flex justify-center mb-6">
              <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-[9px] font-bold tracking-[2px] uppercase">
                VAYO Membership Registration
              </span>
            </div>

            {/* Step Progress Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] text-sky-600 font-extrabold tracking-[3px] uppercase">
                Step {step} of 5
              </span>
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                {Math.round((step / 5) * 100)}% Complete
              </span>
            </div>

            {/* Dynamic Interactive Progress Bar */}
            <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
              <div
                className="absolute top-0 left-0 h-full bg-sky-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.4)]"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 text-center">
              {step === 1 && "Basic Info"}
              {step === 2 && "A Little About You"}
              {step === 3 && "Select Your Vibes"}
              {step === 4 && "Selfie Verification"}
              {step === 5 && "Review Registration"}
            </h2>

            <p className="text-xs md:text-sm text-slate-500 mb-8 text-center leading-relaxed max-w-sm mx-auto font-medium font-sans">
              {step === 1 && "Let's start with your standard contact information."}
              {step === 2 && "We verify birthday & Instagram to ensure a safe, aligned community."}
              {step === 3 && "Select the experiences you are excited to do offline."}
              {step === 4 && "Upload a clear selfie. Only visible to waitlist admins for confirmation."}
              {step === 5 && "Review your information details before finalizing waitlist submission."}
            </p>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300 font-semibold shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Contact Detail (Name, Email & Phone) */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-bold tracking-wider block pl-1">Full Name</label>
                  <div className="relative flex items-center group/input">
                    <User className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/25 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-bold tracking-wider block pl-1">Email Address</label>
                  <div className="relative flex items-center group/input">
                    <Mail className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/25 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-bold tracking-wider block pl-1">Phone Number</label>
                  <div className="relative flex items-center group/input">
                    <Phone className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-500 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9999 99999"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/25 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Birthdate & Instagram */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-bold tracking-wider block pl-1">Birthdate</label>
                  <div className="relative flex items-center group/input">
                    <Calendar className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-500 transition-colors" />
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/25 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] [color-scheme:light]"
                    />
                  </div>
                  {birthdate && (
                    <span className="text-[10px] text-sky-600 pl-1 font-bold block">
                      Calculated Age: <strong className="text-slate-800">{getAge(birthdate)}</strong> years old
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 font-bold tracking-wider block pl-1">Instagram Handle</label>
                  <div className="relative flex items-center group/input">
                    <Instagram className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-500 transition-colors" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/25 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Selected Vibes */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {vibeOptions.map((vibe) => {
                    const isSelected = selectedVibes.includes(vibe.title);
                    const IconComponent = vibe.icon;
                    return (
                      <button
                        key={vibe.title}
                        type="button"
                        onClick={() => toggleVibe(vibe.title)}
                        className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold tracking-wide text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isSelected
                          ? "bg-sky-50 border-sky-500 text-sky-700 shadow-[0_4px_16px_rgba(14,165,233,0.08)]"
                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350"
                          }`}
                      >
                        <span className={`p-1.5 rounded-xl shrink-0 ${isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </span>
                        <span className="truncate">{vibe.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Selfie Upload */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-3xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px] ${dragActive
                    ? "border-sky-500 bg-sky-50/20"
                    : "border-slate-200 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50"
                    }`}
                >
                  {selfiePreview ? (
                    <div className="relative w-full flex flex-col items-center">
                      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-sky-500/50 shadow-md">
                        <img
                          src={selfiePreview}
                          alt="Selfie Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelfieFile(null);
                          setSelfiePreview("");
                          setSelfieUrl("");
                        }}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                        <Camera className="w-5 h-5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-700 font-bold mb-1 pl-2 pr-2">
                        Drag & drop a verified selfie here, or{" "}
                        <label className="text-sky-600 hover:text-sky-500 underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, or JPEG (Max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Final Review */}
            {step === 5 && (
              <div className="space-y-4 text-left animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-5 space-y-4 max-h-[280px] overflow-y-auto">
                  <div className="flex items-center gap-4 border-b border-slate-250/65 pb-4">
                    {selfiePreview ? (
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-250">
                        <img src={selfiePreview} alt="Review Selfie" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-250 flex items-center justify-center shrink-0">
                        <Camera className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{name}</h4>
                      <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 font-medium">
                        <span>{instagram.startsWith("@") ? instagram : `@${instagram}`}</span>
                        <span className="font-mono text-slate-400">{email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-0.5">Phone Number</span>
                      <span className="font-bold text-slate-800">{phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-0.5">Age</span>
                      <span className="font-bold text-slate-800">{getAge(birthdate)} years old ({birthdate})</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-1.5">Selected Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedVibes.map((vib) => {
                        const vibeItem = vibeOptions.find(o => o.title === vib);
                        const Icon = vibeItem?.icon || Sparkles;
                        return (
                          <span key={vib} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-sky-700 font-bold flex items-center gap-1.5 select-none shadow-sm">
                            <Icon className="w-3 h-3 text-sky-500" />
                            <span>{vib}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Button Row */}
            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200/60">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading || uploadingSelfie}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none shadow-[0_4px_16px_rgba(14,165,233,0.25)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || uploadingSelfie}
                  className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none shadow-[0_8px_24px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              )}
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
          <Link href="/" className="flex items-center decoration-none px-6 py-3 rounded-full bg-white/40 backdrop-blur-3xl border border-slate-200/50 shadow-md hover:bg-white/60 hover:border-slate-300/60 transition-all duration-300 group">
            <Image src="/assets/vayo-logo.png" alt="VAYO Logo" width={90} height={24} className="h-5 w-auto opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" style={{ filter: "brightness(0)" }} priority />
          </Link>
        </div>
      </nav>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
        <JoinFormContent />
      </Suspense>
    </>
  );
}
