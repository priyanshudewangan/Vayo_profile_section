import { useState, useMemo } from "react";

export const useWaitlist = (password, addToast) => {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sendingEmailMap, setSendingEmailMap] = useState({});
  const [togglingStatusMap, setTogglingStatusMap] = useState({});
  const [sandboxModalEmail, setSandboxModalEmail] = useState(null);

  const fetchEmails = async (token, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch("/api/admin/emails", {
        headers: {
          Authorization: token || password,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEmails(data.emails || []);
        if (!silent) {
          addToast("Dashboard records refreshed", "info");
        }
      } else {
        addToast(data.error || "Failed to fetch emails.", "error");
      }
    } catch (err) {
      console.error(err);
      if (!silent) addToast("Failed to connect to database.", "error");
    } finally {
      if (!silent) setIsLoading(false);
    }
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
      if (activeTab === "joined") {
        return item.status === "Joined";
      }
      return true;
    });
  }, [emails, searchTerm, activeTab]);

  const stats = useMemo(() => {
    const total = emails.length;
    const pending = emails.filter((item) => !item.status || item.status === "Pending").length;
    const sent = emails.filter((item) => item.status === "Sent").length;
    const joined = emails.filter((item) => item.status === "Joined").length;
    const approved = sent + joined;
    const inviteRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    
    return { total, pending, sent, joined, approved, inviteRate };
  }, [emails]);

  return {
    emails,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filteredEmails,
    stats,
    fetchEmails,
    handleSendInvite,
    handleSimulateSend,
    handleToggleApproval,
    sandboxModalEmail,
    setSandboxModalEmail,
    sendingEmailMap,
    togglingStatusMap
  };
};
