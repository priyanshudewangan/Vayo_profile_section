"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Search, 
  Mail, 
  LogOut, 
  RefreshCw, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Percent,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  X,
  Eye,
  Phone
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

// Helper for relative time (e.g. "2 hrs ago", "Yesterday")
function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Generate initials from email
function getEmailInitials(email) {
  if (!email) return "??";
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Generate initials from Name (falls back to email)
function getInitials(name, email) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  return getEmailInitials(email);
}

// Compute age from birthdate
function getAge(dobString) {
  if (!dobString) return "";
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} y/o`;
}

// Deterministic light-mode gradient generator based on email hash
function getAvatarGradient(email) {
  if (!email) return "from-sky-400 to-cyan-400";
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-sky-400 via-cyan-400 to-blue-400",
    "from-teal-300 via-emerald-300 to-cyan-400",
    "from-indigo-300 via-sky-300 to-cyan-400",
    "from-amber-300 via-orange-300 to-rose-300",
    "from-violet-300 via-purple-300 to-pink-300",
    "from-emerald-300 via-teal-300 to-sky-300"
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [sendingEmailMap, setSendingEmailMap] = useState({});
  const [togglingStatusMap, setTogglingStatusMap] = useState({});
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "sent"
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [sandboxModalEmail, setSandboxModalEmail] = useState(null);
  const [zoomedSelfie, setZoomedSelfie] = useState(null);

  // Toast dispatch helper
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchEmails = async (token, isRefresh = false) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/emails", {
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
        setIsAuthenticated(true);
        sessionStorage.setItem("vayo_admin_token", token);
        setAuthError("");
        if (isRefresh) {
          addToast("Dashboard records refreshed", "info");
        }
      } else {
        setAuthError(data.error || "Authentication failed.");
        sessionStorage.removeItem("vayo_admin_token");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Failed to fetch emails from database.");
      addToast("Failed to connect to database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify authentication on component load (stored in session storage)
  useEffect(() => {
    const cachedPassword = sessionStorage.getItem("vayo_admin_token");
    if (cachedPassword) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(cachedPassword);
      fetchEmails(cachedPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    fetchEmails(password);
  };

  const handleSendInvite = async (email) => {
    if (sendingEmailMap[email]) return;
    setSendingEmailMap((prev) => ({ ...prev, [email]: true }));

    try {
      const response = await fetch("/api/admin/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`Onboarding credentials sent to ${email}`, "success");
        // Update local state
        setEmails((prev) =>
          prev.map((item) =>
            item.email === email ? { ...item, status: "Sent" } : item
          )
        );
      } else if (response.status === 403 && data.sandboxRestriction) {
        setSandboxModalEmail(email);
      } else {
        addToast(data.error || "Failed to send invitation.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred while sending email.", "error");
    } finally {
      setSendingEmailMap((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleSimulateSend = async (email) => {
    setSandboxModalEmail(null);
    setSendingEmailMap((prev) => ({ ...prev, [email]: true }));

    try {
      const response = await fetch("/api/admin/send-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ email, simulate: true }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`[Simulated] Credentials set for ${email}`, "success");
        // Update local state
        setEmails((prev) =>
          prev.map((item) =>
            item.email === email ? { ...item, status: "Sent" } : item
          )
        );
      } else {
        addToast(data.error || "Failed to simulate invitation.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred during simulation.", "error");
    } finally {
      setSendingEmailMap((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleToggleApproval = async (email, newStatus) => {
    if (togglingStatusMap[email]) return;
    setTogglingStatusMap((prev) => ({ ...prev, [email]: true }));

    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ email, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`User status set to ${newStatus}`, "success");
        // Update local waitlist list state
        setEmails((prev) =>
          prev.map((item) =>
            item.email === email ? { ...item, status: newStatus } : item
          )
        );
      } else {
        addToast(data.error || "Failed to toggle status.", "error");
      }
    } catch (err) {
      console.error("Error toggling approval:", err);
      addToast("Network error occurred during approval change.", "error");
    } finally {
      setTogglingStatusMap((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    addToast("Email copied to clipboard!", "success");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vayo_admin_token");
    setIsAuthenticated(false);
    setPassword("");
    setEmails([]);
    addToast("Logged out of session", "info");
  };

  // Filter logic
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      const matchesSearch = item.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "pending") {
        return !item.status || item.status === "Pending";
      }
      if (activeTab === "sent") {
        return item.status === "Sent";
      }
      return true;
    });
  }, [emails, searchTerm, activeTab]);

  // Statistics
  const statsTotal = emails.length;
  const statsPending = emails.filter((item) => !item.status || item.status === "Pending").length;
  const statsSent = emails.filter((item) => item.status === "Sent").length;
  const inviteRate = statsTotal > 0 ? Math.round((statsSent / statsTotal) * 100) : 0;

  // Render Login state (Subtle White / Light Mode)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-[#f8fafc] text-slate-800 font-sans px-4 overflow-hidden">
        {/* Background Dot Grid and Noise overlays */}
        <div className="fixed inset-0 z-0 bg-dot-grid-light bg-noise opacity-[0.2] pointer-events-none"></div>

        {/* Ambient Glowing Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="absolute w-[550px] h-[550px] bg-sky-300/10 rounded-full blur-[130px] animate-pulse"></div>
          <div 
            className="absolute w-[450px] h-[450px] bg-cyan-400/8 rounded-full blur-[110px] translate-x-24 translate-y-24 animate-pulse" 
            style={{ animationDelay: "2.5s" }}
          ></div>
        </div>

        {/* Floating Custom Toast Alerts in Login Screen */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl backdrop-blur-3xl border text-xs font-semibold shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                toast.type === "success" 
                  ? "bg-white/80 border-emerald-200 text-emerald-800"
                  : toast.type === "error"
                  ? "bg-white/80 border-rose-200 text-rose-800"
                  : "bg-white/80 border-sky-200 text-sky-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-sky-500"
              }`}></span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Premium Lock Card */}
        <div className="w-full max-w-md relative z-10 bg-white/60 backdrop-blur-[36px] border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-[0_24px_70px_rgba(15,23,42,0.07)] text-center group">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
          
          <Link href="/" className="inline-block mb-10 hover:scale-105 hover:opacity-80 transition-all duration-300">
            {/* White logo converted to black using CSS filter for light theme contrast */}
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO" 
              width={120} 
              height={32} 
              className="h-6 w-auto" 
              style={{ filter: "brightness(0)" }}
            />
          </Link>
          
          {/* Glowing lock wrapper */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500/10 to-cyan-500/10 border border-sky-200 flex items-center justify-center mb-8 mx-auto shadow-[0_0_32px_rgba(14,165,233,0.12)] relative">
            <Lock className="w-7 h-7 text-sky-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping opacity-25"></span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Access Portal</h2>
          <p className="text-xs md:text-sm text-slate-500 mb-8 font-light max-w-[280px] mx-auto">
            Input database key credentials to manage waitlist registrations.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter Password Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400/40 focus:ring-1 focus:ring-sky-500/30 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                required
              />
            </div>
            
            {authError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-sky-500 text-white text-xs md:text-sm font-bold hover:bg-sky-600 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(14,165,233,0.25)] active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Unlocking Portal...
                </>
              ) : (
                <>
                  <span>Unlock Console</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Dashboard (Subtle White / Sky Blue Accents)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-28 px-4 md:px-8 relative font-sans overflow-x-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0 bg-dot-grid-light bg-noise opacity-[0.2] pointer-events-none"></div>

      {/* Floating Glowing Ambient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-sky-400/10 blur-[130px] pointer-events-none animate-float-slow-1"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-400/8 blur-[130px] pointer-events-none animate-float-slow-2"></div>
      </div>

      {/* Floating Custom Toast Alerts */}
      <div className="fixed top-24 right-6 z-55 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-2xl backdrop-blur-3xl border text-xs font-semibold shadow-[0_12px_40px_rgba(15,23,42,0.06)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success" 
                ? "bg-white/90 border-emerald-200 text-emerald-800"
                : toast.type === "error"
                ? "bg-white/90 border-rose-200 text-rose-800"
                : "bg-white/90 border-sky-200 text-sky-800"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-sky-500"
            }`}></span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        
        {/* Floating glassmorphic header bar */}
        <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-4 rounded-3xl bg-white/60 backdrop-blur-3xl border border-slate-200/50 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-300">
              <Image 
                src="/assets/vayo-logo.png" 
                alt="VAYO" 
                width={90} 
                height={24} 
                className="h-5 w-auto" 
                style={{ filter: "brightness(0)" }}
              />
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-200/30 text-[9px] text-sky-600 font-bold uppercase tracking-wider select-none shadow-[0_2px_10px_rgba(14,165,233,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
              Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              target="_blank"
              className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.02)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-all duration-300 cursor-pointer flex items-center gap-1.5"
            >
              <span>Logout</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Total Waitlist */}
          <div className="group bg-white/70 border border-slate-200/50 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-sky-400/20 hover:bg-white hover:shadow-md cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.02)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Total Signups</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{statsTotal}</h3>
            <p className="text-[10px] text-slate-400 font-medium">All registered waitlist entries</p>
          </div>

          {/* Card 2: Pending Invites */}
          <div className="group bg-white/70 border border-slate-200/50 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/20 hover:bg-white hover:shadow-md cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.02)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Pending Invites</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-4xl font-extrabold text-amber-600 tracking-tight leading-none mb-1">{statsPending}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Waiting for onboarding pass</p>
          </div>

          {/* Card 3: Sent Invites */}
          <div className="group bg-white/70 border border-slate-200/50 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/20 hover:bg-white hover:shadow-md cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.02)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Sent Invites</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-4xl font-extrabold text-emerald-600 tracking-tight leading-none mb-1">{statsSent}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Credentials sent successfully</p>
          </div>

          {/* Card 4: Invite Progress Gauge */}
          <div className="group bg-white/70 border border-slate-200/50 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:border-sky-400/20 hover:bg-white hover:shadow-md cursor-pointer shadow-[0_4px_20px_rgba(15,23,42,0.02)] relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-4">Onboard Rate</span>
              <h3 className="text-4xl font-extrabold text-sky-600 tracking-tight leading-none mb-1">{inviteRate}%</h3>
              <p className="text-[10px] text-slate-400 font-medium">Conversion from waitlist</p>
            </div>
            
            {/* SVG Circular progress radial ring */}
            <div className="relative w-16 h-16 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Track Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  className="stroke-slate-100 fill-transparent"
                  strokeWidth="4"
                />
                {/* Foreground Progress Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  className="stroke-sky-500 fill-transparent transition-all duration-1000 ease-out"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - inviteRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-500 font-mono">
                {inviteRate}%
              </div>
            </div>
          </div>

        </section>

        {/* Console Controls & Table Frame */}
        <main className="bg-white/70 border border-slate-200/50 rounded-[2rem] shadow-[0_24px_60px_rgba(15,23,42,0.04)] backdrop-blur-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
          
          {/* Main Controls Section */}
          <div className="flex flex-col gap-6 mb-8 pb-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Console Ledger</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
                    {filteredEmails.length} matching
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manage applications, verify submission dates, and launch direct email systems.
                </p>
              </div>

              {/* Refresh & Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEmails(password, true)}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                  title="Reload Registry"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Filter Pills and Search Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-2">
              
              {/* Custom Animated Filter Tabs */}
              <div className="flex items-center bg-slate-100/80 border border-slate-200 p-1 rounded-2xl self-start">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "all" 
                      ? "bg-white text-slate-900 border border-slate-200 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                  }`}
                >
                  All ({statsTotal})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "pending" 
                      ? "bg-amber-500 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                  }`}
                >
                  Pending ({statsPending})
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === "sent" 
                      ? "bg-sky-500 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                  }`}
                >
                  Sent ({statsSent})
                </button>
              </div>

              {/* Dynamic search input */}
              <div className="w-full md:w-80 relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter applications by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400/40 focus:ring-1 focus:ring-sky-500/30 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 w-5 h-5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Email Table Container */}
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4"></div>
              <span className="text-xs text-slate-400 tracking-wider font-semibold animate-pulse">Syncing console data...</span>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="py-28 text-center text-slate-400 text-sm font-light flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-2">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">No waitlist applications found matching the parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-4 pl-4">Applicant Profile</th>
                    <th className="pb-4">Details</th>
                    <th className="pb-4">Selected Vibes</th>
                    <th className="pb-4">Selfie</th>
                    <th className="pb-4">Registered Date</th>
                    <th className="pb-4">Transmission Status</th>
                    <th className="pb-4 pr-4 text-right">Console Triggers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                  {filteredEmails.map((item) => {
                    const isSent = item.status === "Sent";
                    const isSending = sendingEmailMap[item.email] || false;
                    const dateObj = new Date(item.created_at);
                    
                    const formattedDate = dateObj.toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const formattedTime = dateObj.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const avatarGrad = getAvatarGradient(item.email);
                    const initials = getInitials(item.name, item.email);
                    const isCurrentCopied = copiedEmail === item.email;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-all duration-300 group">
                        
                        {/* Column 1: Profile & Email */}
                        <td className="py-4 pl-4 flex items-center gap-3">
                          {/* Circle Avatar with gradients */}
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-slate-900 text-xs font-black select-none shadow-[0_2px_8px_rgba(0,0,0,0.08)] shrink-0`}>
                            {initials}
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors duration-200">
                              {item.name || "Anonymous"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {item.email}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <button
                                onClick={() => handleCopyEmail(item.email)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 w-max transition-colors cursor-pointer"
                              >
                                {isCurrentCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-500 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy email</span>
                                  </>
                                )}
                              </button>
                              {item.instagram && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <a
                                    href={`https://instagram.com/${item.instagram.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-sky-500 hover:text-sky-600 font-medium flex items-center gap-0.5"
                                  >
                                    <Instagram className="w-3 h-3" />
                                    <span>{item.instagram}</span>
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Phone & Age */}
                        <td className="py-4 text-slate-600">
                          <div className="flex flex-col gap-0.5">
                            {item.phone ? (
                              <span className="font-medium flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {item.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No phone</span>
                            )}
                            {item.birthdate ? (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {getAge(item.birthdate)} ({item.birthdate})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">No DOB</span>
                            )}
                          </div>
                        </td>

                        {/* Column 3: Vibes / Interests */}
                        <td className="py-4 max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {item.interests && item.interests.length > 0 ? (
                              item.interests.map((interest) => (
                                <span
                                  key={interest}
                                  className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] text-slate-600 font-semibold truncate"
                                  title={interest}
                                >
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>

                        {/* Column 4: Selfie preview */}
                        <td className="py-4">
                          {item.selfie_url ? (
                            <div
                              onClick={() => setZoomedSelfie(item.selfie_url)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer group/selfie shrink-0"
                            >
                              <img src={item.selfie_url} alt="Selfie" className="w-full h-full object-cover group-hover/selfie:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/selfie:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No selfie</span>
                          )}
                        </td>

                        {/* Column 5: Registered Date */}
                        <td className="py-4 text-slate-500">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{formattedDate}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formattedTime} • {getRelativeTime(item.created_at)}
                            </span>
                          </div>
                        </td>

                        {/* Column 6: Status Badge */}
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                            isSent 
                              ? "bg-emerald-50 border border-emerald-100 text-emerald-600" 
                              : "bg-amber-50 border border-amber-100 text-amber-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSent ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
                            {isSent ? "Sent" : "Pending"}
                          </span>
                        </td>

                        {/* Column 7: Action Buttons */}
                        <td className="py-4 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Direct Database Approval Toggle */}
                            <button
                              onClick={() => handleToggleApproval(item.email, isSent ? "Pending" : "Sent")}
                              disabled={togglingStatusMap[item.email]}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer border select-none ${
                                isSent
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                              } disabled:opacity-50`}
                            >
                              {togglingStatusMap[item.email] ? (
                                <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              ) : isSent ? (
                                <span>Unapprove</span>
                              ) : (
                                <span>Direct Approve</span>
                              )}
                            </button>

                            {/* Email invite triggers */}
                            <button
                              onClick={() => handleSendInvite(item.email)}
                              disabled={isSending}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer border select-none ${
                                isSent
                                  ? "bg-slate-50 border-slate-200 text-slate-550 hover:bg-slate-100 hover:text-slate-700"
                                  : "bg-sky-500 border-sky-600 text-white hover:bg-sky-600 hover:shadow-[0_4px_12px_rgba(14,165,233,0.15)]"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isSending ? (
                                <>
                                  <span className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                  <span>Sending...</span>
                                </>
                              ) : isSent ? (
                                <>
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Resend</span>
                                </>
                              ) : (
                                <>
                                  <Mail className="w-3 h-3" />
                                  <span>Mail Onboarding</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Resend Sandbox Warning Modal */}
      {sandboxModalEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 border border-slate-200 rounded-[2rem] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.15)] relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSandboxModalEmail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Resend Sandbox Limitation</h3>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Your Resend account is currently in sandbox/testing mode. It can only transmit emails to your verified account address: <strong className="text-slate-800 font-semibold">chatandewangan@gmail.com</strong>.
              <br /><br />
              Would you like to <strong className="text-sky-600 font-semibold">simulate</strong> sending the credentials for <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{sandboxModalEmail}</span>? This will update the database registration status to <span className="font-semibold text-emerald-600">Sent</span> so you can test the dashboard flow.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setSandboxModalEmail(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateSend(sandboxModalEmail)}
                className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 shadow-sm shadow-sky-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Send</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Zoomed Selfie Modal */}
      {zoomedSelfie && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setZoomedSelfie(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-white border border-slate-200 rounded-[2rem] p-3.5 shadow-[0_24px_70px_rgba(15,23,42,0.15)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedSelfie(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-slate-100 bg-slate-950">
              <img src={zoomedSelfie} alt="Verified Selfie Zoomed" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
