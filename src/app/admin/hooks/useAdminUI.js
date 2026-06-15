import { useState } from "react";

export const useAdminUI = () => {
  const [currentSection, setCurrentSection] = useState("waitlist");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [zoomedSelfie, setZoomedSelfie] = useState(null);
  const [attendeeModalEvent, setAttendeeModalEvent] = useState(null);

  const handleCopyEmail = (email, addToast) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    addToast("Email copied to clipboard!", "success");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return {
    currentSection,
    setCurrentSection,
    isSidebarHovered,
    setIsSidebarHovered,
    copiedEmail,
    handleCopyEmail,
    zoomedSelfie,
    setZoomedSelfie,
    attendeeModalEvent,
    setAttendeeModalEvent
  };
};
