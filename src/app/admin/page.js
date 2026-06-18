"use client";
import React, { useEffect } from "react";
import { Jost } from "next/font/google";

// Hooks
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useWaitlist } from "./hooks/useWaitlist";
import { useEvents } from "./hooks/useEvents";
import { useRSVPs } from "./hooks/useRSVPs";
import { useAdminUI } from "./hooks/useAdminUI";

// Components
import { AdminLogin } from "./components/AdminLogin";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { StatsOverview } from "./components/StatsOverview";
import { WaitlistRegistry } from "./components/WaitlistRegistry";
import { EventCatalog } from "./components/EventCatalog";
import { RSVPConsol } from "./components/RSVPConsol";
import { SandboxModal, AttendeeModal, SelfieModal } from "./components/Modals";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export default function AdminDashboard() {
  const {
    password, setPassword,
    isAuthenticated,
    authError,
    isLoading: isAuthLoading,
    login, logout,
    toasts, addToast
  } = useAdminAuth();

  const {
    emails, isLoading: isWaitlistLoading,
    searchTerm, setSearchTerm,
    activeTab, setActiveTab,
    filteredEmails, stats: waitlistStats,
    fetchEmails,
    handleSendInvite, handleSimulateSend, handleToggleApproval,
    sandboxModalEmail, setSandboxModalEmail,
    sendingEmailMap, togglingStatusMap
  } = useWaitlist(password, addToast);

  const {
    events, isLoadingEvents, fetchEvents,
    handleCreateEventSubmit, handleCancelEvent, handleDeleteEvent,
    isSubmittingEvent, createdEventData, setCreatedEventData,
    ...eventFormProps
  } = useEvents(password, addToast);

  const {
    rsvps, isLoadingRSVPs, fetchRSVPs,
    handleUpdateRSVPStatus, updatingRSVPMap,
    isLoadingAttendees, fetchAttendees
  } = useRSVPs(password, addToast);

  const {
    currentSection, setCurrentSection,
    isSidebarHovered, setIsSidebarHovered,
    copiedEmail, handleCopyEmail,
    zoomedSelfie, setZoomedSelfie,
    attendeeModalEvent, setAttendeeModalEvent
  } = useAdminUI();

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails(password);
      fetchEvents();
      fetchRSVPs(password);
    }
  }, [isAuthenticated]);

  // Auto-refresh events + RSVPs every 10s when on those sections (picks up live check-ins)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentSection !== "events" && currentSection !== "rsvps") return;
    const id = setInterval(() => {
      fetchEvents();
      fetchRSVPs(password);
    }, 10000);
    return () => clearInterval(id);
  }, [isAuthenticated, currentSection]);

  // Handle viewing attendees
  const handleViewAttendees = (evt) => {
    setAttendeeModalEvent(evt);
    fetchAttendees(evt);
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        login={login}
        isLoading={isAuthLoading}
        authError={authError}
        toasts={toasts}
      />
    );
  }

  return (
    <div className={`${jost.className} min-h-screen bg-vayo-blue text-slate-800 relative overflow-x-hidden selection:bg-vayo-blue/10`}>
      {/* Background dot grid pattern */}
      <div className="fixed inset-0 z-0 bg-dot-grid-light bg-noise opacity-40 pointer-events-none"></div>

      {/* Floating Custom Toast Alerts */}
      {/* Floating Custom Toast Alerts - Responsive positioning */}
      <div className="fixed top-4 md:top-8 left-4 right-4 md:left-auto md:right-8 z-[100] flex flex-col gap-3 md:max-w-sm w-auto md:w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-3xl backdrop-blur-2xl border text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 md:slide-in-from-right-4 duration-500 ${toast.type === "success"
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

      <AdminSidebar
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        isExpanded={isSidebarHovered}
        setIsSidebarHovered={setIsSidebarHovered}
        handleLogout={logout}
        fetchRSVPs={fetchRSVPs}
        password={password}
      />

      <div className="p-4 md:p-10 md:pl-28 py-6 min-h-screen relative z-10 max-w-7xl mx-auto transition-all duration-300 mb-20 md:mb-0">
        <AdminHeader />
        
        <StatsOverview 
          stats={waitlistStats} 
          events={events} 
        />

        {currentSection === "waitlist" && (
          <WaitlistRegistry
            filteredEmails={filteredEmails}
            isLoading={isWaitlistLoading}
            fetchEmails={fetchEmails}
            password={password}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            stats={waitlistStats}
            sendingEmailMap={sendingEmailMap}
            handleCopyEmail={(email) => handleCopyEmail(email, addToast)}
            copiedEmail={copiedEmail}
            handleToggleApproval={handleToggleApproval}
            togglingStatusMap={togglingStatusMap}
            handleSendInvite={handleSendInvite}
            setZoomedSelfie={setZoomedSelfie}
          />
        )}

        {currentSection === "rsvps" && (
          <RSVPConsol
            rsvps={rsvps}
            isLoadingRSVPs={isLoadingRSVPs}
            fetchRSVPs={fetchRSVPs}
            password={password}
            handleUpdateRSVPStatus={handleUpdateRSVPStatus}
            updatingRSVPMap={updatingRSVPMap}
          />
        )}

        {currentSection === "events" && (
          <EventCatalog
            events={events}
            isLoadingEvents={isLoadingEvents}
            handleCreateEventSubmit={handleCreateEventSubmit}
            handleCancelEvent={handleCancelEvent}
            handleDeleteEvent={handleDeleteEvent}
            isSubmittingEvent={isSubmittingEvent}
            createdEventData={createdEventData}
            setCreatedEventData={setCreatedEventData}
            addToast={addToast}
            handleViewAttendees={handleViewAttendees}
            {...eventFormProps}
          />
        )}
      </div>

      {sandboxModalEmail && (
        <SandboxModal 
          email={sandboxModalEmail}
          setSandboxModalEmail={setSandboxModalEmail}
          handleSimulateSend={handleSimulateSend}
        />
      )}

      {attendeeModalEvent && (
        <AttendeeModal
          event={attendeeModalEvent}
          setAttendeeModalEvent={setAttendeeModalEvent}
          rsvps={rsvps}
          isLoadingAttendees={isLoadingAttendees}
          handleUpdateRSVPStatus={handleUpdateRSVPStatus}
          updatingRSVPMap={updatingRSVPMap}
        />
      )}

      {zoomedSelfie && (
        <SelfieModal 
          zoomedSelfie={zoomedSelfie}
          setZoomedSelfie={setZoomedSelfie}
        />
      )}
    </div>
  );
}
