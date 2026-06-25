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

function InviteFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Form Fields State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [vayoId, setVayoId] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [instagram, setInstagram] = useState("");
  const [profession, setProfession] = useState("");
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedWeekend, setSelectedWeekend] = useState([]);

  const foodOptions = ["Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Gluten-Free", "No Preference"];
  const weekendOptions = ["Hiking & Trekking", "Cafe Hopping", "Board Games", "Movies", "Sports", "Art & Culture", "Cooking", "Travel"];
  const interestParam = searchParams.get("interest") || "";
  const [selectedVibes, setSelectedVibes] = useState(() => 
    interestParam ? [interestParam] : []
  );
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [faceStatus, setFaceStatus] = useState("idle"); // idle | checking | verified | failed
  const faceApiLoaded = React.useRef(false);

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
    setFaceStatus("checking");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      setSelfiePreview(dataUrl);
      try {
        const faceapi = await import("face-api.js");
        if (!faceApiLoaded.current) {
          await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
          faceApiLoaded.current = true;
        }
        const img = new window.Image();
        img.src = dataUrl;
        await new Promise((res) => { img.onload = res; });
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );
        if (detections.length > 0) {
          setFaceStatus("verified");
          setErrorMsg("");
        } else {
          setFaceStatus("failed");
          setErrorMsg("No face detected. Please upload a clear selfie with your face visible.");
          setSelfieFile(null);
          setSelfiePreview("");
        }
      } catch (err) {
        console.error("Face detection error:", err);
        setFaceStatus("failed");
        setErrorMsg("Could not run face check. Please try a different photo.");
        setSelfieFile(null);
        setSelfiePreview("");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleVibe = (title) => {
    setSelectedVibes((prev) =>
      prev.includes(title)
        ? prev.filter((v) => v !== title)
        : [...prev, title]
    );
  };

  const nextStep = async () => {
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
      if (!vayoId || vayoId.trim().length < 3) {
        setErrorMsg("Please enter a Vayo ID (min 3 characters).");
        return;
      }
      if (!/^[a-z0-9_]+$/.test(vayoId.trim())) {
        setErrorMsg("Vayo ID can only contain lowercase letters, numbers, and underscores.");
        return;
      }
      // Check if email already exists
      setLoading(true);
      try {
        const res = await fetch(`/api/check-status?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (res.ok && data.status && data.status !== "unregistered") {
          if (data.status === "approved") {
            router.push(`/?email=${encodeURIComponent(email)}`);
          } else {
            router.push(`/askvayo/vayo?email=${encodeURIComponent(email)}`);
          }
          return;
        }
      } catch (_) {}
      finally { setLoading(false); }
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
      if (!profession || profession.trim().length < 2) {
        setErrorMsg("Please enter your profession.");
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
      if (faceStatus === "checking") {
        setErrorMsg("Still verifying your face, please wait…");
        return;
      }
      if (faceStatus === "failed") {
        setErrorMsg("No face detected. Please upload a clear selfie with your face visible.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((prev) => prev - 1);
  };

  const uploadSelfieToStorage = async (file) => {
    setUploadingSelfie(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from("selfies")
        .upload(filePath, file);

      if (error) throw error;

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

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      let finalSelfieUrl = selfieUrl;

      if (selfieFile && !finalSelfieUrl) {
        finalSelfieUrl = await uploadSelfieToStorage(selfieFile);
        setSelfieUrl(finalSelfieUrl);
      }

      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          vayo_id: vayoId.trim().toLowerCase(),
          birthdate,
          instagram: instagram.startsWith("@") ? instagram : `@${instagram}`,
          profession,
          food_preferences: selectedFood,
          weekend_activities: selectedWeekend,
          interests: selectedVibes,
          selfie_url: finalSelfieUrl,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        // If email is already on the waitlist, treat as success and move to the next step
        if (response.status === 409) {
          router.push(`/askvayo/vayo?email=${encodeURIComponent(email)}`);
          return;
        }
        throw new Error(result.error || "Failed to submit waitlist registration.");
      }

      router.push(`/askvayo/vayo?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Form Submit Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen relative z-10 px-4 py-24 md:py-10">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] mix-blend-screen translate-x-[-20%] translate-y-[-20%]"></div>
        <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] mix-blend-screen translate-x-[20%] translate-y-[20%]"></div>
      </div>

      <div className="w-full max-w-xl mx-auto relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2.5rem] p-7 md:p-12 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Subtle Shine Effect */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              Request Invite
            </h2>
            <p className="text-xs sm:text-sm text-[#E2EFF6]/80 leading-relaxed px-4 font-medium">
              Enter your details below to join the waitlist. Vetting is completed within 48 hours.
            </p>
          </div>

          {/* Step Progress Header */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <span className="text-[10px] text-[#E2EFF6]/85 font-extrabold tracking-[3px] uppercase">
              Step {step} of 5
            </span>
            <span className="text-[10px] text-[#E2EFF6]/60 font-bold font-mono">
              {Math.round((step / 5) * 100)}% Complete
            </span>
          </div>

          {/* STEP 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999 99999"
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">
                  Vayo ID <span className="text-[#E2EFF6]/40 font-normal">· your unique handle on VAYO</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#E2EFF6]/40 text-sm font-bold">@</span>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={vayoId}
                    onChange={(e) => setVayoId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="your_id"
                    maxLength={24}
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-9 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-[#E2EFF6]/40 pl-1">Lowercase, numbers & underscores only. Can&apos;t be changed later.</span>
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Birthdate</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all [color-scheme:dark]"
                  />
                </div>
                {birthdate && (
                  <span className="text-[10px] text-[#E2EFF6]/85 pl-1 font-bold block">
                    Calculated Age: <strong className="text-white">{getAge(birthdate)}</strong> years old
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Instagram Handle</label>
                <div className="relative flex items-center">
                  <Instagram className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Profession</label>
                <div className="relative flex items-center">
                  <Sparkles className="absolute left-4 w-4 h-4 text-[#E2EFF6]/40" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Software Engineer, Designer…"
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E2EFF6] placeholder-[#E2EFF6]/40 focus:outline-none focus:border-white/45 focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Food Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {foodOptions.map((f) => (
                    <button key={f} type="button"
                      onClick={() => setSelectedFood(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${selectedFood.includes(f) ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-[#E2EFF6]/60 hover:bg-white/10"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1">Weekend Activities</label>
                <div className="flex flex-wrap gap-2">
                  {weekendOptions.map((w) => (
                    <button key={w} type="button"
                      onClick={() => setSelectedWeekend(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${selectedWeekend.includes(w) ? "bg-white/20 border-white/40 text-white" : "bg-white/5 border-white/10 text-[#E2EFF6]/60 hover:bg-white/10"}`}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Selected Vibes */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1 mb-2">Select Your Interests</label>
              <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {vibeOptions.map((vibe) => {
                  const isSelected = selectedVibes.includes(vibe.title);
                  const IconComponent = vibe.icon;
                  return (
                    <button
                      key={vibe.title}
                      type="button"
                      onClick={() => toggleVibe(vibe.title)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold tracking-wide text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isSelected
                        ? "bg-white/20 border-white/40 text-white shadow-md"
                        : "bg-white/5 border-white/10 text-[#E2EFF6]/70 hover:bg-white/10 hover:border-white/25"
                        }`}
                    >
                      <span className={`p-1.5 rounded-xl shrink-0 ${isSelected ? "bg-white text-slate-950" : "bg-white/10 text-[#E2EFF6]/60"}`}>
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
              <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1 mb-2">Verification Selfie</label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-3xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px] ${dragActive
                  ? "border-white bg-white/10"
                  : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
              >
                {selfiePreview ? (
                  <div className="relative w-full flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img
                        src={selfiePreview}
                        alt="Selfie Preview"
                        className="w-full h-full object-cover"
                      />
                      {faceStatus === "checking" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        </div>
                      )}
                    </div>

                    {faceStatus === "checking" && (
                      <p className="mt-2 text-[11px] font-bold text-white/70 animate-pulse">Scanning for face…</p>
                    )}
                    {faceStatus === "verified" && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                        <Check className="w-3 h-3 text-emerald-400"/>
                        <span className="text-[11px] font-bold text-emerald-300">Face verified ✓</span>
                      </div>
                    )}
                    {faceStatus === "failed" && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-400/30 rounded-full">
                        <AlertCircle className="w-3 h-3 text-rose-400"/>
                        <span className="text-[11px] font-bold text-rose-300">No face detected</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelfieFile(null);
                        setSelfiePreview("");
                        setSelfieUrl("");
                        setFaceStatus("idle");
                        setErrorMsg("");
                      }}
                      className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                      <Camera className="w-5 h-5 text-[#E2EFF6]/60" />
                    </div>
                    <p className="text-xs text-[#E2EFF6]/80 font-bold mb-1 pl-2 pr-2">
                      Drag & drop a verified selfie here, or{" "}
                      <label className="text-white hover:underline cursor-pointer">
                        browse files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-[10px] text-[#E2EFF6]/50 font-medium">PNG, JPG, or JPEG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Final Review */}
          {step === 5 && (
            <div className="space-y-4 text-left animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-xs text-[#E2EFF6]/80 font-bold tracking-wider block pl-1 mb-2">Review Your Details</label>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 max-h-[280px] overflow-y-auto scrollbar-thin">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  {selfiePreview ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/20">
                      <img src={selfiePreview} alt="Review Selfie" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-[#E2EFF6]/40" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{name}</h4>
                    <div className="flex flex-col gap-0.5 text-[10px] text-[#E2EFF6]/65 font-medium">
                      <span>{instagram.startsWith("@") ? instagram : `@${instagram}`}</span>
                      <span className="font-mono text-[#E2EFF6]/50">{email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#E2EFF6]/50 uppercase tracking-wider font-extrabold block mb-0.5">Phone Number</span>
                    <span className="font-bold text-[#E2EFF6]/85">{phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#E2EFF6]/50 uppercase tracking-wider font-extrabold block mb-0.5">Age</span>
                    <span className="font-bold text-[#E2EFF6]/85">{getAge(birthdate)} years old ({birthdate})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#E2EFF6]/50 uppercase tracking-wider font-extrabold block mb-1.5">Selected Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVibes.map((vib) => {
                      const vibeItem = vibeOptions.find(o => o.title === vib);
                      const Icon = vibeItem?.icon || Sparkles;
                      return (
                        <span key={vib} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] text-white font-bold flex items-center gap-1.5 select-none shadow-sm">
                          <Icon className="w-3.5 h-3.5 text-white" />
                          <span>{vib}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-300 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step Navigation Button Row */}
          <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading || uploadingSelfie}
                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none disabled:opacity-50"
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
                className="px-6 py-2.5 rounded-2xl bg-white hover:bg-neutral-100 text-slate-950 text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploadingSelfie}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-neutral-100 text-slate-950 text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || uploadingSelfie ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-[#4893C6] text-[#E2EFF6] relative overflow-x-hidden">
      {/* High-End Organic Film Grain Overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.035] pointer-events-none z-20"></div>

      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/Sky-bg.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay to enhance contrast and ensure premium aesthetic */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Clean Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 h-24 bg-transparent transition-all duration-300 pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="flex items-center decoration-none px-6 py-3 rounded-full bg-[#1a3e5c]/90 backdrop-blur-md border border-[#8DBEDC]/20 shadow-md hover:bg-[#1a3e5c] hover:border-[#8DBEDC]/40 transition-all duration-300 group">
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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#E2EFF6] font-bold">Loading Registration...</div>}>
        <InviteFormContent />
      </Suspense>
    </div>
  );
}
