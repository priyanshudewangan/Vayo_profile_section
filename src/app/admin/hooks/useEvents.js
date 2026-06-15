import { useState } from "react";
import { BACKEND_URL, HOST_OPTIONS } from "../lib/constants";

export const useEvents = (password, addToast) => {
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [createdEventData, setCreatedEventData] = useState(null);
  
  // Event creation form state
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
  const [eventHostId, setEventHostId] = useState(HOST_OPTIONS[0].id);
  const [eventLat, setEventLat] = useState(null);
  const [eventLng, setEventLng] = useState(null);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/events?limit=100`, {
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
          return;
        }
      } catch {
        console.log("Note: Python backend is currently offline.");
      }

      // Fallback to Supabase
      const sbRes = await fetch("/api/events");
      if (sbRes.ok) {
        const data = await sbRes.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.warn("Could not load events:", err);
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
      cover_image_url: coverImageUrl || "/assets/events/something.jpg",
      lat: eventLat || null,
      lng: eventLng || null
    };

    try {
      // Try FastAPI first, fall back to Supabase
      let success = false;
      let createdData = null;

      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          createdData = await response.json();
          success = true;
        }
      } catch {
        console.log("FastAPI offline, saving event to Supabase instead.");
      }

      if (!success) {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          createdData = data;
          success = true;
        } else {
          addToast(data.error || "Failed to publish event", "error");
        }
      }

      if (success) {
        addToast("Event published successfully!", "success");
        setCreatedEventData(createdData);
        resetForm();
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred while publishing event", "error");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const resetForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventVenue("");
    setEventTags("");
    setEventMinKarma(0);
    setEventEntryFee(0);
    setEventMaxParticipants("");
    setEventLat(null);
    setEventLng(null);
  };

  const handleCancelEvent = async (eventId, hostId) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/cancel?host_id=${encodeURIComponent(hostId)}`, {
        method: "PATCH"
      });

      if (response.ok) {
        addToast("Event cancelled successfully", "success");
        fetchEvents();
      } else {
        const data = await response.json();
        addToast(data.detail || "Failed to cancel event", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred during cancellation", "error");
    }
  };

  return {
    events,
    isLoadingEvents,
    fetchEvents,
    handleCreateEventSubmit,
    handleCancelEvent,
    isSubmittingEvent,
    createdEventData,
    setCreatedEventData,
    // Form states
    eventTitle, setEventTitle,
    eventDescription, setEventDescription,
    eventDate, setEventDate,
    eventCity, setEventCity,
    eventVenue, setEventVenue,
    eventCategory, setEventCategory,
    eventTags, setEventTags,
    eventMinKarma, setEventMinKarma,
    eventEntryFee, setEventEntryFee,
    eventMaxParticipants, setEventMaxParticipants,
    imagePreset, setImagePreset,
    customImageUrl, setCustomImageUrl,
    eventHostId, setEventHostId,
    eventLat, setEventLat,
    eventLng, setEventLng
  };
};
