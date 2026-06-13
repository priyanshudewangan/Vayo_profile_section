"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bodoni_Moda, Jost } from "next/font/google";
import { 
  Home,
  Users, 
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
  Clock,
  ArrowUpRight,
  AlertCircle,
  X,
  Eye,
  Phone,
  Plus,
  MapPin,
  CalendarPlus,
  Trash2,
  Settings,
  Info,
  UserPlus
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

const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "700"] });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Custom Monthly Calendar Widget for scheduler card
const CalendarWidget = ({ events }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // First day of current month
  const firstDay = new Date(year, month, 1).getDay();
  // Number of days in current month
  const numDays = new Date(year, month + 1, 0).getDate();
  
  // Map event dates to day numbers for current month/year
  const activeEventDays = useMemo(() => {
    const days = new Set();
    events.forEach(evt => {
      if (evt.status !== 'cancelled' && evt.event_date) {
        const d = new Date(evt.event_date);
        if (d.getFullYear() === year && d.getMonth() === month) {
          days.add(d.getDate());
        }
      }
    });
    return days;
  }, [events, year, month]);

  const daysArr = [];
  // Add blank spots for days before the first day of the week
  for (let i = 0; i < firstDay; i++) {
    daysArr.push(null);
  }
  for (let i = 1; i <= numDays; i++) {
    daysArr.push(i);
  }

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full text-white">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-semibold text-neutral-400">{monthNames[month]} {year}</h4>
        <span className="text-[9px] bg-neutral-800 border border-neutral-700/50 px-2 py-0.5 rounded-full text-[#FFDE47] font-bold uppercase tracking-wider">
          Mixers Calendar
        </span>
      </div>
      
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-600 mb-1">
        {weekdays.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysArr.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const isToday = day === today.getDate();
          const hasEvent = activeEventDays.has(day);
          
          return (
            <div 
              key={`day-${day}`} 
              className={`h-7 flex items-center justify-center rounded-full transition-all ${
                hasEvent 
                  ? "bg-[#FFDE47] text-neutral-900 font-extrabold shadow-sm scale-105" 
                  : isToday
                  ? "border border-neutral-600 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
              title={hasEvent ? "Scheduled Mixer" : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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

  // Event Console states
  const [currentSection, setCurrentSection] = useState("waitlist"); // "waitlist" | "events"
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventCity, setEventCity] = useState("Bangalore");
  const [eventVenue, setEventVenue] = useState("");
  const [eventCategory, setEventCategory] = useState("social");
  const [eventTags, setEventTags] = useState("");
  const [eventMinKarma, setEventMinKarma] = useState(0);
  const [eventEntryFee, setEventEntryFee] = useState(0);
  const [eventMaxParticipants, setEventMaxParticipants] = useState("");
  const [imagePreset, setImagePreset] = useState("/assets/events/something.jpg");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [eventHostId, setEventHostId] = useState("riya@vayo.com");
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [createdEventData, setCreatedEventData] = useState(null);

  // Attendee Modal states
  const [attendeeModalEvent, setAttendeeModalEvent] = useState(null);
  const [eventAttendees, setEventAttendees] = useState([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  // Toast dispatch helper
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Handle viewing attendees
  const handleViewAttendees = async (evt) => {
    setAttendeeModalEvent(evt);
    setIsLoadingAttendees(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/events/${evt.event_id}/attendees?host_id=${encodeURIComponent(evt.host_id)}`);
      if (response.ok) {
        const data = await response.json();
        setEventAttendees(data.attendees || []);
      } else {
        addToast("Failed to fetch attendees.", "error");
      }
    } catch (err) {
      console.error("Error fetching attendees:", err);
      addToast("Failed to reach server.", "error");
    } finally {
      setIsLoadingAttendees(false);
    }
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

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/events?limit=100");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        console.error("Failed to fetch events from backend");
      }
    } catch (err) {
      console.error("Error connecting to backend events API:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventCity || !eventVenue) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    const dateObj = new Date(eventDate);
    if (dateObj <= new Date()) {
      addToast("Event date must be in the future", "error");
      return;
    }

    setIsSubmittingEvent(true);
    
    // Parse tags: split by comma, lowercase, deduplicate
    const tagsArray = eventTags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    const coverImageUrl = imagePreset === "custom" ? customImageUrl : imagePreset;

    const payload = {
      host_id: eventHostId,
      title: eventTitle,
      description: eventDescription || null,
      event_date: dateObj.toISOString(),
      city: eventCity,
      venue: eventVenue || null,
      category: eventCategory,
      interest_tags: tagsArray,
      min_karma_required: parseInt(eventMinKarma) || 0,
      entry_fee: parseInt(eventEntryFee) || 0,
      max_participants: eventMaxParticipants ? parseInt(eventMaxParticipants) : null,
      cover_image_url: coverImageUrl || "/assets/events/something.jpg"
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Event published successfully!", "success");
        setCreatedEventData(data);
        
        // Reset form
        setEventTitle("");
        setEventDescription("");
        setEventDate("");
        setEventVenue("");
        setEventTags("");
        setEventMinKarma(0);
        setEventEntryFee(0);
        setEventMaxParticipants("");
        
        // Refresh list
        fetchEvents();
      } else {
        addToast(data.detail || "Failed to publish event", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred while publishing event", "error");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleCancelEvent = async (eventId, hostId) => {
    if (!window.confirm("Are you sure you want to cancel this event? This will notify all registered participants.")) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/events/${eventId}/cancel?host_id=${encodeURIComponent(hostId)}`, {
        method: "PATCH"
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Event cancelled successfully", "success");
        fetchEvents();
      } else {
        addToast(data.detail || "Failed to cancel event", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred during cancellation", "error");
    }
  };

  // Verify authentication on component load (stored in session storage)
  useEffect(() => {
    const cachedPassword = sessionStorage.getItem("vayo_admin_token");
    if (cachedPassword) {
      setPassword(cachedPassword);
      fetchEmails(cachedPassword);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, currentSection]);

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

  // Render Login state (Premium Dark Blue Theme)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-[#020617] text-slate-100 font-sans px-4 overflow-hidden">
        {/* Background Dot Grid and Noise overlays */}
        <div className="fixed inset-0 z-0 bg-dot-grid bg-noise opacity-[0.15] pointer-events-none"></div>

        {/* Ambient Glowing Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
          <div className="absolute w-[550px] h-[550px] bg-sky-500/10 rounded-full blur-[130px] animate-pulse"></div>
          <div 
            className="absolute w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[110px] translate-x-24 translate-y-24 animate-pulse" 
            style={{ animationDelay: "2.5s" }}
          ></div>
        </div>

        {/* Floating Custom Toast Alerts in Login Screen */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
          {toasts.map((toast) => (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl backdrop-blur-3xl border text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                toast.type === "success" 
                  ? "bg-slate-900/80 border-emerald-500/20 text-emerald-400"
                  : toast.type === "error"
                  ? "bg-slate-900/80 border-rose-500/20 text-rose-400"
                  : "bg-slate-900/80 border-sky-500/20 text-sky-400"
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
        <div className="w-full max-w-md relative z-10 bg-slate-900/60 backdrop-blur-[36px] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_24px_70px_rgba(0,0,0,0.4)] text-center group">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <Link href="/" className="inline-block mb-10 hover:scale-105 hover:opacity-80 transition-all duration-300">
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO" 
              width={120} 
              height={32} 
              className="h-6 w-auto" 
            />
          </Link>
          
          {/* Glowing lock wrapper */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500/10 to-cyan-500/10 border border-sky-500/20 flex items-center justify-center mb-8 mx-auto shadow-[0_0_32px_rgba(14,165,233,0.15)] relative">
            <Lock className="w-7 h-7 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping opacity-25"></span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Access Portal</h2>
          <p className="text-xs md:text-sm text-slate-400 mb-8 font-light max-w-[280px] mx-auto">
            Input database key credentials to manage waitlist registrations.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter Password Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30 focus:bg-slate-950 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                required
              />
            </div>
            
            {authError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-sky-600 text-white text-xs md:text-sm font-bold hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(14,165,233,0.3)] active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-4"
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

  // Render Dashboard (Premium Dark Blue Theme)
  return (
    <div className={`${jost.className} min-h-screen bg-[#020617] text-slate-200 relative overflow-x-hidden selection:bg-sky-500/30`}>
      {/* Background dot grid pattern */}
      <div className="fixed inset-0 z-0 bg-dot-grid bg-noise opacity-[0.08] pointer-events-none"></div>

      {/* Floating Custom Toast Alerts */}
      <div className="fixed top-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`p-4 rounded-2xl backdrop-blur-3xl border text-xs font-semibold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
              toast.type === "success" 
                ? "bg-slate-900/90 border-emerald-500/20 text-emerald-400"
                : toast.type === "error"
                ? "bg-slate-900/90 border-rose-500/20 text-rose-400"
                : "bg-slate-900/90 border-slate-700/50 text-slate-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-slate-500"
            }`}></span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Left Fixed Sidebar Toolbar */}
      <aside className="fixed left-4 top-4 bottom-4 w-20 bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] py-8 flex flex-col items-center justify-between shadow-2xl z-50">
        {/* Top: Branding Icon */}
        <div className="flex flex-col items-center gap-1">
          <Link href="/" className="w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform">
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO" 
              width={40} 
              height={40} 
              className="w-8 h-auto object-contain" 
            />
          </Link>
          <span className="text-[8px] text-sky-400 font-bold tracking-wider uppercase mt-1">Console</span>
        </div>

        {/* Center: Navigation Icons */}
        <nav className="flex flex-col gap-5">
          {/* Home / Ledger Icon */}
          <button
            onClick={() => setCurrentSection("waitlist")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
              currentSection === "waitlist"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 scale-105"
                : "bg-slate-950/50 border border-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
            title="Waitlist Ledger"
          >
            <Users className="w-5 h-5" />
            <span className="absolute left-16 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-50">
              Waitlist Ledger
            </span>
          </button>

          {/* Mixers / Events Icon */}
          <button
            onClick={() => setCurrentSection("events")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
              currentSection === "events"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 scale-105"
                : "bg-slate-950/50 border border-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10"
            }`}
            title="Mixers Catalog"
          >
            <Calendar className="w-5 h-5" />
            <span className="absolute left-16 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-50">
              Mixers Catalog
            </span>
          </button>

          {/* Quick Create Event Plus Icon */}
          <button
            onClick={() => {
              setCurrentSection("events");
              setTimeout(() => {
                const formEl = document.getElementById("publish-event-form");
                if (formEl) {
                  formEl.scrollIntoView({ behavior: "smooth", block: "center" });
                  formEl.classList.add("ring-2", "ring-sky-500");
                  setTimeout(() => formEl.classList.remove("ring-2", "ring-sky-500"), 2000);
                }
              }, 100);
            }}
            className="w-12 h-12 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 flex items-center justify-center transition-all cursor-pointer relative group"
            title="Publish New Event"
          >
            <Plus className="w-5 h-5" />
            <span className="absolute left-16 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-50">
              Publish Event
            </span>
          </button>

          {/* Quick Focus Calendar Icon */}
          <button
            onClick={() => {
              const calEl = document.getElementById("calendar-widget-container");
              if (calEl) {
                calEl.scrollIntoView({ behavior: "smooth", block: "center" });
                calEl.classList.add("ring-2", "ring-sky-500");
                setTimeout(() => calEl.classList.remove("ring-2", "ring-sky-500"), 2000);
              }
            }}
            className="w-12 h-12 rounded-2xl bg-slate-950/50 border border-white/5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 flex items-center justify-center transition-all cursor-pointer relative group"
            title="Focus Calendar Days"
          >
            <CalendarPlus className="w-5 h-5" />
            <span className="absolute left-16 bg-sky-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm z-50">
              Focus Calendar
            </span>
          </button>
        </nav>

        {/* Bottom: Profile / Logout */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-400 cursor-default shadow-inner"
            title="Admin User"
          >
            VA
          </div>
          <button
            onClick={handleLogout}
            className="p-3 rounded-2xl bg-slate-950/50 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
            title="Logout Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-28 pr-4 md:pr-10 py-6 min-h-screen relative z-10 max-w-7xl mx-auto">
        
        {/* Dashboard Greeting Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Image 
              src="/assets/vayo-logo.png" 
              alt="VAYO" 
              width={120} 
              height={32} 
              className="h-10 w-auto object-contain" 
            />
            <div className="h-8 w-[1px] bg-slate-800 hidden md:block"></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Let's take a look at your waitlist and event catalog today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              target="_blank"
              className="px-4 py-2 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-all duration-200 flex items-center gap-1.5 shadow-lg"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Bento Top Highlights */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Featured Deep Blue status card */}
          <div className="lg:col-span-2 bg-indigo-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group min-h-[220px]">
            {/* Glowing background absolute radial blobs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-between h-full relative z-10">
              <div>
                <span className="text-[10px] text-sky-400 uppercase tracking-widest font-extrabold">Waitlist Overview</span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-2 leading-tight">
                  Conversion & Onboarding
                </h2>
              </div>
              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{statsSent}</span>
                  <span className="text-sm text-slate-400">/ {statsTotal} approved</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-medium">
                  {statsPending} candidate profiles waiting for verification keys.
                </p>
              </div>
            </div>

            {/* Circular progress gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center select-none shrink-0 bg-slate-950/50 backdrop-blur-md rounded-full border border-white/10 relative z-10 shadow-inner">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-slate-800 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  className="stroke-sky-500 fill-transparent transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - inviteRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white">{inviteRate}%</span>
                <span className="text-[8px] text-sky-400 font-extrabold uppercase tracking-wide">Rate</span>
              </div>
            </div>
          </div>

          {/* Dark calendar card */}
          <div 
            id="calendar-widget-container" 
            className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white rounded-[2.5rem] p-8 shadow-2xl min-h-[220px] relative overflow-hidden flex flex-col justify-between transition-all duration-300"
          >
            <CalendarWidget events={events} />
          </div>

        </section>

        {/* Section Switcher view render */}
        {currentSection === "waitlist" ? (
          /* WAITLIST REGISTRY LAYOUT */
          <section className="space-y-6">
            
            {/* Waitlist Control Ledger Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white">Waitlist Applications</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {filteredEmails.length} matching
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Direct access approval, email verification trigger flow, and user profile indexing.
                  </p>
                </div>

                {/* Refresh Trigger */}
                <button
                  onClick={() => fetchEmails(password, true)}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/20 text-slate-400 hover:text-sky-400 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 self-start md:self-auto"
                  title="Sync Database"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Visual Status Filter Pills */}
                <div className="flex items-center bg-slate-950/50 border border-white/5 p-1 rounded-2xl self-start">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeTab === "all"
                        ? "bg-slate-800 text-sky-400 shadow-lg"
                        : "text-slate-500 hover:text-sky-400"
                    }`}
                  >
                    All ({statsTotal})
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeTab === "pending"
                        ? "bg-slate-800 text-amber-400 shadow-lg border border-white/5"
                        : "text-slate-500 hover:text-amber-400"
                    }`}
                  >
                    Pending ({statsPending})
                  </button>
                  <button
                    onClick={() => setActiveTab("sent")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeTab === "sent"
                        ? "bg-slate-800 text-emerald-400 shadow-lg border border-white/5"
                        : "text-slate-500 hover:text-emerald-400"
                    }`}
                  >
                    Sent ({statsSent})
                  </button>
                </div>

                {/* Search Bar pill */}
                <div className="w-full lg:w-96 relative flex items-center">
                  <Search className="absolute left-4 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search applicant email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 focus:bg-slate-950 transition-all shadow-inner"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist White Ledger Cards */}
            {isLoading ? (
              <div className="py-28 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/5 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                <span className="text-xs text-slate-500 tracking-wider font-semibold animate-pulse">Syncing Waitlist...</span>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="py-28 text-center text-slate-500 text-sm font-light flex flex-col items-center justify-center gap-3 bg-slate-900/40 border border-white/5 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-slate-950/50 border border-white/5 flex items-center justify-center text-slate-700 mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 font-medium">No waitlist profiles found matching search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmails.map((item) => {
                  const isSent = item.status === "Sent";
                  const isSending = sendingEmailMap[item.email] || false;
                  const dateObj = new Date(item.created_at);
                  const formattedDate = dateObj.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) + " • " + dateObj.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const avatarGrad = getAvatarGradient(item.email);
                  const initials = getInitials(item.name, item.email);
                  const isCurrentCopied = copiedEmail === item.email;

                  return (
                    <div 
                      key={item.id} 
                      className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
                    >
                      {/* Left: Checkbox & profile metadata */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        {/* Checkbox indicator */}
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-2 shrink-0 ${
                          isSent ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-950/50 border-white/5 text-slate-700"
                        }`}>
                          {isSent ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        </div>

                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${avatarGrad} flex items-center justify-center text-slate-900 text-sm font-black select-none shadow-lg shrink-0`}>
                          {initials}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm truncate">
                            {item.name || "Anonymous"}
                          </h4>
                          <span className="text-xs text-slate-500 font-mono block select-all truncate">
                            {item.email}
                          </span>
                          
                          {/* Links / Insta */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <button
                              onClick={() => handleCopyEmail(item.email)}
                              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {isCurrentCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Copied</span>
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
                                <span className="text-slate-800 text-[9px]">•</span>
                                <a
                                  href={`https://instagram.com/${item.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/50 text-[10px] text-slate-400 font-bold hover:bg-slate-800 border border-white/5 transition-colors"
                                >
                                  <Instagram className="w-3 h-3" />
                                  <span>{item.instagram}</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mid: Profile Attributes & Vibes tag pills */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 lg:max-w-xl">
                        {/* Age / Contact details */}
                        <div className="flex flex-col gap-1 text-[11px] text-slate-500 shrink-0">
                          {item.phone && (
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              {item.phone}
                            </span>
                          )}
                          <span className="font-semibold text-slate-500">
                            {item.birthdate ? `${getAge(item.birthdate)} • ${item.birthdate}` : "No DOB"}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            Registered: {getRelativeTime(item.created_at)}
                          </span>
                        </div>

                        {/* Tag list */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Selected Vibes</span>
                          <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto pr-1">
                            {item.interests && item.interests.length > 0 ? (
                              item.interests.map((interest) => (
                                <span
                                  key={interest}
                                  className="px-2 py-0.5 rounded-md bg-slate-950/50 border border-white/5 text-[9px] text-slate-400 font-bold truncate max-w-[100px]"
                                  title={interest}
                                >
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-600 italic">None selected</span>
                            )}
                          </div>
                        </div>

                        {/* Selfie thumbnail preview */}
                        <div className="shrink-0 flex items-center justify-center">
                          {item.selfie_url ? (
                            <div
                              onClick={() => setZoomedSelfie(item.selfie_url)}
                              className="relative w-11 h-11 rounded-2xl overflow-hidden border border-white/5 shadow-lg cursor-pointer group/selfie bg-slate-950 shrink-0"
                              title="Zoom Selfie"
                            >
                              <img src={item.selfie_url} alt="Selfie" className="w-full h-full object-cover group-hover/selfie:scale-105 transition-transform duration-200" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/selfie:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600 italic bg-slate-950">
                              No image
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Invite status ledger & direct action buttons */}
                      <div className="flex items-center gap-4 shrink-0 lg:w-60 justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status Ledger</span>
                          <div className="flex items-center gap-2">
                            {/* Ledger progress bar */}
                            <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div className={`h-full rounded-full transition-all duration-500 ${isSent ? "w-full bg-emerald-500" : "w-1/3 bg-amber-500"}`}></div>
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase ${isSent ? "text-emerald-400" : "text-amber-500"}`}>
                              {isSent ? "Sent" : "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* Direct action triggers */}
                        <div className="flex flex-col gap-1 w-28">
                          <button
                            onClick={() => handleToggleApproval(item.email, isSent ? "Pending" : "Sent")}
                            disabled={togglingStatusMap[item.email]}
                            className={`w-full py-1.5 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                              isSent
                                ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400"
                                : "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400"
                            } disabled:opacity-50`}
                          >
                            {togglingStatusMap[item.email] ? "Updating..." : isSent ? "Revoke Pass" : "Approve Pass"}
                          </button>
                          
                          <button
                            onClick={() => handleSendInvite(item.email)}
                            disabled={isSending}
                            className={`w-full py-1.5 rounded-xl text-[10px] font-bold transition-all border cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSent
                                ? "bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700"
                                : "bg-sky-600 border-sky-600 text-white hover:bg-sky-500"
                            } disabled:opacity-50`}
                          >
                            {isSending ? "Sending..." : isSent ? "Resend Key" : "Send Key"}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          /* EVENT CATALOG LAYOUT */
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Publish Event Form (Col span 5) */}
            <div 
              id="publish-event-form" 
              className="lg:col-span-5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 transition-all duration-300"
            >
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-sky-400" />
                  <span>Publish Mixer Event</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Fill details below to build and broadcast a new offline community event.
                </p>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Salsa Social Nights, Quiet Writing Mixer"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Description</label>
                  <textarea
                    placeholder="Give a nice overview of the mixer..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">City *</label>
                    <input
                      type="text"
                      required
                      value={eventCity}
                      onChange={(e) => setEventCity(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Venue / Location *</label>
                    <input
                      type="text"
                      placeholder="e.g. Third Wave Coffee, Koramangala"
                      required
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Category</label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner [color-scheme:dark]"
                    >
                      <option value="social">Social</option>
                      <option value="music">Music</option>
                      <option value="tech">Tech</option>
                      <option value="sports">Sports</option>
                      <option value="food">Food</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Min Karma</label>
                    <input
                      type="number"
                      min="0"
                      value={eventMinKarma}
                      onChange={(e) => setEventMinKarma(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Entry Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={eventEntryFee}
                      onChange={(e) => setEventEntryFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Max Spots</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      min="1"
                      value={eventMaxParticipants}
                      onChange={(e) => setEventMaxParticipants(e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : "")}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Interest Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. coding, jazz, board games, travel"
                    value={eventTags}
                    onChange={(e) => setEventTags(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Assigned Host *</label>
                  <select
                    value={eventHostId}
                    onChange={(e) => setEventHostId(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner [color-scheme:dark]"
                  >
                    <option value="riya@vayo.com">Riya (riya@vayo.com)</option>
                    <option value="sarah@vayo.com">Sarah (sarah@vayo.com)</option>
                    <option value="alex@vayo.com">Alex (alex@vayo.com)</option>
                    <option value="david@vayo.com">David (david@vayo.com)</option>
                    <option value="elena@vayo.com">Elena (elena@vayo.com)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block pl-0.5">Cover Image Preset *</label>
                  <select
                    value={imagePreset}
                    onChange={(e) => setImagePreset(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500/40 focus:bg-slate-950 transition-all shadow-inner [color-scheme:dark]"
                  >
                    <option value="/assets/events/something.jpg">Acoustic Lounge Preset</option>
                    <option value="/assets/events/cards.jpg">Board Games Cafe Preset</option>
                    <option value="/assets/events/holi.jpg">Holi Colors Festival Preset</option>
                    <option value="/assets/events/outdoorevent.jpg">Outdoor Camping/Hikes Preset</option>
                    <option value="/assets/events/hangout.jpg">Quiet Café Hangout Preset</option>
                    <option value="/assets/events/sports.jpg">Sports & Fitness Preset</option>
                    <option value="custom">Custom Image URL...</option>
                  </select>

                  {imagePreset === "custom" && (
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      required
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 transition-all shadow-inner mt-1"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="w-full py-3 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50 shadow-lg"
                >
                  {isSubmittingEvent ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish Event Live</span>
                    </>
                  )}
                </button>
              </form>
              {createdEventData && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left animate-in fade-in duration-300">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Event Created Successfully!</span>
                  <span className="text-[11px] font-bold text-slate-200 block mt-1">Slug: {createdEventData.shareable_slug}</span>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdEventData.share_links?.event_url || "");
                        addToast("Copied event URL!", "success");
                      }}
                      className="px-3 py-1.5 bg-slate-950 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                      Copy Shareable Link
                    </button>
                    <button
                      onClick={() => setCreatedEventData(null)}
                      className="px-3 py-1.5 bg-slate-950 border border-white/5 text-slate-400 text-[10px] font-semibold rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Events Catalog Ledger (Col span 7) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-300" />
                  <span>Upcoming Mixer Events</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Manage active mixer registrations, review attendee counts, and trigger cancellations.
                </p>
              </div>

              {isLoadingEvents ? (
                <div className="py-28 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/5 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                  <span className="text-xs text-slate-500 font-semibold animate-pulse">Syncing event catalog...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="py-28 text-center text-slate-500 bg-slate-900/40 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3">
                  <Calendar className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-500 font-medium">No mixer events found in the database. Publish one above!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2 scrollbar-thin">
                  {events.map((evt) => {
                    const isCancelled = evt.status === "cancelled";
                    const dateObj = new Date(evt.event_date);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric" 
                    }) + " " + dateObj.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div 
                        key={evt.event_id} 
                        className={`bg-slate-900/40 backdrop-blur-md border ${isCancelled ? "border-rose-500/20 bg-rose-500/5" : "border-white/5"} rounded-3xl p-5 flex gap-4 items-start shadow-xl hover:border-white/10 transition-all duration-300 relative group/card`}
                      >
                        {/* Cover Image Thumbnail */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/5 relative bg-slate-950">
                          <img 
                            src={evt.cover_image_url || "/assets/events/something.jpg"} 
                            alt={evt.title} 
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase border border-white/10">
                            {evt.category}
                          </div>
                        </div>

                        {/* Details Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                          <h4 className="font-bold text-white truncate text-sm" title={evt.title}>
                            {evt.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              {formattedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 font-bold shrink-0" />
                              {evt.venue ? `${evt.venue}, ${evt.city}` : evt.city}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[9px] font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/50 border border-white/5 text-slate-400 font-mono">
                              Host: {evt.host_id.split("@")[0]}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5">
                              Min Karma: {evt.min_karma_required}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Fee: {evt.entry_fee === 0 ? "Free" : `₹${evt.entry_fee}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              RSVPs: {evt.participant_count || 0} / {evt.max_participants || "∞"}
                            </span>
                          </div>
                        </div>

                        {/* Action Overlay */}
                        <div className="flex flex-col gap-2 shrink-0 self-center">
                          {isCancelled ? (
                            <span className="px-3 py-1 rounded-full text-[9px] font-extrabold bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase tracking-wide">
                              Cancelled
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleViewAttendees(evt)}
                                className="p-2 rounded-xl bg-slate-950/50 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-all border border-white/5 hover:border-sky-500/20 cursor-pointer flex items-center justify-center"
                                title="View Attendees"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancelEvent(evt.event_id, evt.host_id)}
                                className="p-2 rounded-xl bg-slate-950/50 hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 transition-all border border-white/5 hover:border-rose-500/20 cursor-pointer flex items-center justify-center"
                                title="Cancel Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </section>
        )}

      </div>

      {/* Resend Sandbox Warning Modal */}
      {sandboxModalEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSandboxModalEmail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Resend Sandbox Limitation</h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              Your Resend account is currently in sandbox/testing mode. It can only transmit emails to your verified account address: <strong className="text-slate-200 font-semibold">chatandewangan@gmail.com</strong>.
              <br /><br />
              Would you like to <strong className="text-sky-400 font-semibold">simulate</strong> sending the credentials for <span className="font-mono text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">{sandboxModalEmail}</span>? This will update the database registration status to <span className="font-semibold text-emerald-400">Sent</span> so you can test the dashboard flow.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setSandboxModalEmail(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSimulateSend(sandboxModalEmail)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Send</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Attendee Registry Modal */}
      {attendeeModalEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => {
                setAttendeeModalEvent(null);
                setEventAttendees([]);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Attendee Registry</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Listing all confirmed RSVPs for: <span className="font-bold text-sky-400">{attendeeModalEvent.title}</span>
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              {isLoadingAttendees ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/5 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                  <span className="text-xs text-slate-500 font-semibold animate-pulse">Fetching participant list...</span>
                </div>
              ) : eventAttendees.length === 0 ? (
                <div className="py-20 text-center text-slate-500 bg-slate-950/50 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <UserPlus className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-500 font-medium">No one has RSVP'd to this event yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-slate-500 uppercase font-extrabold tracking-wider border-b border-white/5">
                    <div className="col-span-6">User / Identity</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3 text-right">Joined</div>
                  </div>
                  {eventAttendees.map((attendee) => (
                    <div key={attendee.user_id} className="grid grid-cols-12 items-center px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl hover:bg-slate-800 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-200">
                          {getEmailInitials(attendee.username || attendee.user_id)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">@{attendee.username || 'Anonymous'}</span>
                          <span className="text-[9px] text-slate-500 truncate max-w-[150px]">{attendee.user_id}</span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${
                          attendee.attendance_status 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-slate-800 border-white/5 text-slate-400"
                        }`}>
                          {attendee.attendance_status ? "Checked In" : attendee.payment_status}
                        </span>
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(attendee.rsvp_timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Total Capacity: {attendeeModalEvent.max_participants || "Unlimited"}
              </div>
              <button
                onClick={() => {
                  setAttendeeModalEvent(null);
                  setEventAttendees([]);
                }}
                className="px-6 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition-colors cursor-pointer shadow-lg"
              >
                Close Registry
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Zoomed Selfie Modal */}
      {zoomedSelfie && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setZoomedSelfie(null)}
        >
          <div 
            className="relative max-w-sm w-full bg-slate-900 border border-white/10 rounded-[2rem] p-3.5 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomedSelfie(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/50 hover:bg-slate-950 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
              <img src={zoomedSelfie} alt="Verified Selfie Zoomed" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
