import { useState } from "react";
import { BACKEND_URL, HOST_OPTIONS } from "../lib/constants";
import { supabase } from "@/lib/supabase";

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
  const [eventLatitude, setEventLatitude] = useState(12.9716);
  const [eventLongitude, setEventLongitude] = useState(77.5946);

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB", "error");
      return;
    }

    setUploadingImage(true);
    setImageFile(file);

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `event_posters/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to public "selfies" storage bucket
      const { data, error } = await supabase.storage
        .from("selfies")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("selfies")
        .getPublicUrl(fileName);

      setCustomImageUrl(publicUrl);
      setImagePreset("custom");
      addToast("Image uploaded successfully!", "success");
    } catch (err) {
      console.error("Image Upload Error:", err);
      addToast("Failed to upload image. Please try again.", "error");
      setImageFile(null);
      setImagePreview("");
      setCustomImageUrl("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCustomImageUrl("");
    setImagePreset("/assets/events/something.jpg");
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      // 1. Fetch from Next.js API (Supabase / local JSON)
      const nextResponse = await fetch(`/api/events`);
      let nextEvents = [];
      if (nextResponse.ok) {
        const data = await nextResponse.json();
        nextEvents = data.events || [];
      }

      // 2. Fetch from Python backend (local Postgres)
      let pythonEvents = [];
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const response = await fetch(`${BACKEND_URL}/api/v1/events?limit=100`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          pythonEvents = data.events || [];
        }
      } catch (err) {
        console.log("Python backend offline or failed during fetch sync:", err.message);
      }

      // 3. Merge and deduplicate by event_id
      const mergedMap = {};
      nextEvents.forEach(e => {
        mergedMap[e.event_id] = e;
      });
      pythonEvents.forEach(e => {
        mergedMap[e.event_id] = {
          ...mergedMap[e.event_id],
          ...e
        };
      });

      const sortedEvents = Object.values(mergedMap).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setEvents(sortedEvents);
    } catch (err) {
      console.error("Fetch Events Error:", err);
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
      latitude: parseFloat(eventLatitude) || 12.9716,
      longitude: parseFloat(eventLongitude) || 77.5946
    };

    try {
      const response = await fetch(`/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": password
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        addToast("Event published successfully!", "success");
        setCreatedEventData(data);
        resetForm();
        fetchEvents();
      } else {
        addToast(data.error || data.detail || "Failed to publish event", "error");
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
    setImageFile(null);
    setImagePreview("");
    setCustomImageUrl("");
    setImagePreset("/assets/events/something.jpg");
    setEventLatitude(12.9716);
    setEventLongitude(77.5946);
  };

  const handleCancelEvent = async (eventId, hostId) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    try {
      // 1. Cancel in Next.js backend (Supabase / local JSON)
      const nextResponse = await fetch(`/api/events`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": password
        },
        body: JSON.stringify({
          event_id: eventId,
          status: "cancelled"
        })
      });

      // 2. Try to cancel in Python backend (local Postgres)
      try {
        await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/cancel?host_id=${encodeURIComponent(hostId)}`, {
          method: "PATCH"
        });
      } catch (err) {
        console.warn("Python backend offline or failed during cancel sync:", err.message);
      }

      if (nextResponse.ok) {
        addToast("Event cancelled successfully", "success");
        fetchEvents();
      } else {
        const data = await nextResponse.json();
        addToast(data.error || "Failed to cancel event", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred during cancellation", "error");
    }
  };

  const handleDeleteEvent = async (eventId, hostId) => {
    if (!window.confirm("Are you sure you want to permanently delete this event and all its RSVPs? This action cannot be undone.")) {
      return;
    }

    try {
      // 1. Delete in Next.js backend (Supabase / local JSON)
      const nextResponse = await fetch(`/api/events?eventId=${encodeURIComponent(eventId)}`, {
        method: "DELETE",
        headers: {
          "Authorization": password
        }
      });

      // 2. Try to cancel/delete in Python backend if needed (optional fallback)
      try {
        await fetch(`${BACKEND_URL}/api/v1/events/${eventId}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.warn("Python backend offline or failed during delete sync:", err.message);
      }

      if (nextResponse.ok) {
        addToast("Event deleted permanently", "success");
        fetchEvents();
      } else {
        const data = await nextResponse.json();
        addToast(data.error || "Failed to delete event", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error occurred during event deletion", "error");
    }
  };

  return {
    events,
    isLoadingEvents,
    fetchEvents,
    handleCreateEventSubmit,
    handleCancelEvent,
    handleDeleteEvent,
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
    eventLatitude, setEventLatitude,
    eventLongitude, setEventLongitude,
    imagePreset, setImagePreset,
    customImageUrl, setCustomImageUrl,
    eventHostId, setEventHostId,
    // Image upload states & handlers
    imageFile, setImageFile,
    imagePreview, setImagePreview,
    uploadingImage, setUploadingImage,
    handleImageUpload,
    handleRemoveImage
  };
};
