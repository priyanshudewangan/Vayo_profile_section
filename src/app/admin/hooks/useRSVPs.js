import { useState } from "react";
import { BACKEND_URL } from "../lib/constants";

export const useRSVPs = (password, addToast) => {
  const [rsvps, setRsvps] = useState([]);
  const [isLoadingRSVPs, setIsLoadingRSVPs] = useState(false);
  const [updatingRSVPMap, setUpdatingRSVPMap] = useState({});
  const [eventAttendees, setEventAttendees] = useState([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  const fetchRSVPs = async (token) => {
    setIsLoadingRSVPs(true);
    try {
      const response = await fetch("/api/rsvp/admin", {
        headers: { Authorization: token || password }
      });
      if (response.ok) {
        const data = await response.json();
        setRsvps(data.rsvps || []);
      }
    } catch (err) {
      console.error("Error fetching RSVPs:", err);
    } finally {
      setIsLoadingRSVPs(false);
    }
  };

  const handleUpdateRSVPStatus = async (email, eventId, newStatus) => {
    setUpdatingRSVPMap(prev => ({ ...prev, [`${email}-${eventId}`]: true }));
    try {
      const response = await fetch("/api/rsvp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ email, eventId, status: newStatus }),
      });

      if (response.ok) {
        addToast(`RSVP status updated to ${newStatus}`, "success");
        fetchRSVPs(password);
      } else {
        addToast("Failed to update RSVP status", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error updating RSVP", "error");
    } finally {
      setUpdatingRSVPMap(prev => ({ ...prev, [`${email}-${eventId}`]: false }));
    }
  };

  const fetchAttendees = async (evt) => {
    setIsLoadingAttendees(true);
    await fetchRSVPs(password);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${evt.event_id}/attendees?host_id=${encodeURIComponent(evt.host_id)}`);
      if (response.ok) {
        const data = await response.json();
        setEventAttendees(data.attendees || []);
      }
    } catch (err) {
      console.warn("Python backend offline. Using Supabase RSVP records only.");
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  return {
    rsvps,
    isLoadingRSVPs,
    fetchRSVPs,
    handleUpdateRSVPStatus,
    updatingRSVPMap,
    eventAttendees,
    setEventAttendees,
    isLoadingAttendees,
    fetchAttendees
  };
};
