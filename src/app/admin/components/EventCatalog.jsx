import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarPlus, Plus, Calendar, MapPin, Trash2, Users, CheckCircle2, Clock } from "lucide-react";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });
import { HOST_OPTIONS, CATEGORY_OPTIONS, IMAGE_PRESETS } from "../lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const EventCatalog = ({
  events,
  pastEvents = [],
  isLoadingEvents,
  handleCreateEventSubmit,
  handleCancelEvent,
  isSubmittingEvent,
  createdEventData,
  setCreatedEventData,
  addToast,
  handleViewAttendees,
  // Form props
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
}) => {
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const handleSaveLocation = async (eventId, { venue, lat, lng }) => {
    setIsSavingLocation(true);
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, venue, lat, lng })
      });
      if (res.ok) {
        addToast("Location updated!", "success");
        setEditingLocationId(null);
        fetchEvents();
      } else {
        addToast("Failed to update location", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      {/* Left Column: Publish Event Form (Col span 5) */}
      <div
        id="publish-event-form"
        className="lg:col-span-5 bg-white border border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_rgba(72,147,198,0.06)] flex flex-col gap-6 md:gap-8 transition-all duration-300"
      >
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-vayo-blue/10 text-vayo-blue shadow-sm">
              <CalendarPlus className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span>Publish Event</span>
          </h3>
          <p className="text-[11px] md:text-xs text-slate-500 font-medium pl-1">
            Build and broadcast a new offline community event.
          </p>
        </div>

        <form onSubmit={handleCreateEventSubmit} className="space-y-4 md:space-y-5">
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Event Title *</Label>
            <Input
              type="text"
              placeholder="e.g. Salsa Social Nights"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Description</Label>
            <Textarea
              placeholder="Vibe overview..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={4}
              className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner resize-none min-h-[100px] md:min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Date & Time *</Label>
              <Input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 focus:border-vayo-blue focus:bg-white transition-all shadow-inner [color-scheme:light]"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">City *</Label>
              <Input
                type="text"
                required
                value={eventCity}
                onChange={(e) => setEventCity(e.target.value)}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Venue Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Vayo Hub"
                required
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-black text-vayo-blue hover:text-vayo-light transition-colors pl-1 pt-0.5 cursor-pointer"
              >
                <MapPin className="w-3 h-3" />
                {showMapPicker ? "Hide Map" : "📍 Pin on Map"}
                {eventLat && !showMapPicker && <span className="text-emerald-500 ml-1">✓ Pinned</span>}
              </button>
              {showMapPicker && (
                <div className="pt-1">
                  <LocationPicker
                    onChange={({ venue, lat, lng }) => {
                      setEventVenue(venue);
                      setEventLat(lat);
                      setEventLng(lng);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Category</Label>
              <Select value={eventCategory} onValueChange={setEventCategory}>
                <SelectTrigger className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 focus:border-vayo-blue transition-all shadow-inner h-auto">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                  {CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 focus:bg-vayo-alice focus:text-vayo-blue transition-colors cursor-pointer">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-[1px] block text-center">Karma</Label>
              <Input
                type="number"
                min="0"
                value={eventMinKarma}
                onChange={(e) => setEventMinKarma(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-2 md:px-3 py-6 md:py-7 text-xs md:text-sm text-center text-vayo-blue font-black focus:border-vayo-blue focus:bg-white transition-all shadow-inner h-auto"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-[1px] block text-center">Fee (\u20B9)</Label>
              <Input
                type="number"
                min="0"
                value={eventEntryFee}
                onChange={(e) => setEventEntryFee(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-2 md:px-3 py-6 md:py-7 text-xs md:text-sm text-center text-emerald-600 font-black focus:border-vayo-blue focus:bg-white transition-all shadow-inner h-auto"
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-[1px] block text-center">Spots</Label>
              <Input
                type="number"
                placeholder="\u221E"
                min="1"
                value={eventMaxParticipants}
                onChange={(e) => setEventMaxParticipants(e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : "")}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-2 md:px-3 py-6 md:py-7 text-xs md:text-sm text-center text-slate-800 font-black placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner h-auto"
              />
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Assigned Hub Host *</Label>
            <Select value={eventHostId} onValueChange={setEventHostId}>
              <SelectTrigger className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 focus:border-vayo-blue transition-all shadow-inner h-auto">
                <SelectValue placeholder="Select host" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                {HOST_OPTIONS.map(host => (
                  <SelectItem key={host.id} value={host.id} className="text-[10px] md:text-xs font-bold py-2 md:py-3 focus:bg-vayo-alice focus:text-vayo-blue transition-colors cursor-pointer">{host.name} <span className="opacity-40 ml-1 font-mono text-[8px] md:text-[9px]">{host.email}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cover Image */}
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Cover Image</Label>
            <Select value={imagePreset} onValueChange={setImagePreset}>
              <SelectTrigger className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 focus:border-vayo-blue transition-all shadow-inner h-auto">
                <SelectValue placeholder="Select image" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                {IMAGE_PRESETS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[10px] md:text-xs font-bold py-2 md:py-3 focus:bg-vayo-alice focus:text-vayo-blue transition-colors cursor-pointer">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {imagePreset === "custom" && (
              <input
                type="url"
                placeholder="https://..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner outline-none mt-1"
              />
            )}
            {imagePreset && imagePreset !== "custom" && (
              <img src={imagePreset} alt="preview" className="w-full h-20 object-cover rounded-xl border border-vayo-sky/30 mt-1" />
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmittingEvent}
            className="w-full py-7 md:py-8 rounded-xl md:rounded-2xl bg-vayo-blue text-white text-[10px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[3px] hover:bg-vayo-light hover:-translate-y-1 hover:shadow-xl hover:shadow-vayo-blue/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6 disabled:opacity-50 shadow-lg relative overflow-hidden group h-auto"
          >
            {isSubmittingEvent ? (
              <>
                <span className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 md:border-3 border-white/20 border-t-white rounded-full animate-spin"></span>
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                <span>Publish Event Live</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        </form>

        {createdEventData && (
          <div className="bg-emerald-50/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left animate-in zoom-in-95 duration-500 shadow-sm mt-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-100" /></div>
            <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[2px] block">Event Live!</span>
            <div className="flex gap-2 mt-4 md:mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdEventData.share_links?.event_url || "");
                  addToast("Event link copied!", "success");
                }}
                className="flex-1 bg-white border-emerald-300 text-emerald-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl hover:bg-emerald-500 hover:text-white transition-all h-9 md:h-10 shadow-sm"
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatedEventData(null)}
                className="px-3 md:px-4 bg-white border-slate-200 text-slate-400 text-[9px] md:text-[10px] font-bold uppercase rounded-lg md:rounded-xl hover:bg-slate-100 transition-all h-9 md:h-10"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Events Catalog Ledger (Col span 7) */}
      <div className="lg:col-span-7 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-1 md:px-0">
          <div className="space-y-0.5 md:space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3 drop-shadow-sm">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-vayo-sky" />
              <span>Upcoming Catalog</span>
            </h3>
            <p className="text-[10px] md:text-xs text-vayo-alice/70 font-medium tracking-wide">
              Manage events and track registrant counts.
            </p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[8px] md:text-[9px] font-black text-white uppercase tracking-[2px] shrink-0">
             <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DB LIVE
          </div>
        </div>

        {isLoadingEvents ? (
          <div className="py-20 md:py-40 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-vayo-sky/10 border-t-vayo-sky rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Calendar className="w-5 h-5 md:w-6 md:h-6 text-vayo-sky opacity-40 animate-pulse" />
              </div>
            </div>
            <span className="text-[9px] md:text-[10px] text-vayo-alice tracking-[3px] md:tracking-[4px] uppercase font-black animate-pulse opacity-80">Synchronizing</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 md:py-40 text-center flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-md border-2 border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-xl mx-2">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vayo-sky/20 mb-2">
              <CalendarPlus className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-sm md:text-base font-bold text-white opacity-80 tracking-tight">Catalog is empty</p>
              <p className="text-[10px] md:text-[11px] text-vayo-alice/40 font-medium">Publish your first community event above.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 max-h-[700px] md:max-h-[900px] overflow-y-auto pr-2 md:pr-3 scrollbar-vayo px-2 md:px-0">
            {events.map((evt) => {
              const isCancelled = evt.status === "cancelled";
              const dateObj = new Date(evt.event_date);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
              }) + " • " + dateObj.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div key={evt.event_id} className="flex flex-col">
                <div
                  className={`bg-white border-2 ${isCancelled ? "border-rose-200/50 opacity-80" : "border-vayo-sky/40 hover:border-vayo-blue/60"} rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-6 items-center shadow-[0_4px_24px_rgba(72,147,198,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group/card overflow-hidden`}
                >
                  <div className="w-full sm:w-24 sm:h-24 rounded-2xl md:rounded-3xl overflow-hidden shrink-0 border-2 border-vayo-sky/30 relative bg-slate-100 shadow-md aspect-video sm:aspect-square">
                    <img
                      src={evt.cover_image_url || "/assets/events/something.jpg"}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-2 left-2 bg-vayo-blue/90 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-black text-white uppercase tracking-wider shadow-sm">
                      {evt.category}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 md:gap-2 text-center sm:text-left">
                    <h4 className="font-black text-slate-800 truncate text-base md:text-lg tracking-tight group-hover/card:text-vayo-blue transition-colors duration-300" title={evt.title}>
                      {evt.title}
                    </h4>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 md:gap-x-4 gap-y-1 text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 bg-vayo-alice/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-vayo-sky/20">
                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-vayo-blue opacity-70" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-vayo-alice/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-vayo-sky/20">
                        <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 text-vayo-blue opacity-70" />
                        {evt.city || 'Bangalore'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap">
                      {evt.is_live && (
                        <span className="flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-rose-500 text-white text-[9px] md:text-[10px] font-black tracking-widest shadow-sm animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                          LIVE
                        </span>
                      )}
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-50 text-amber-700 border-2 border-amber-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.participant_count || 0} RSVPs
                      </span>
                      {evt.checked_in_count > 0 && (
                        <span className="flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-teal-50 text-teal-700 border-2 border-teal-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          {evt.checked_in_count} Attended
                        </span>
                      )}
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.entry_fee === 0 ? "FREE" : `\u20B9${evt.entry_fee}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 md:gap-3 shrink-0 self-center sm:self-center justify-center w-full sm:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isCancelled ? (
                      <div className="px-4 py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black bg-rose-50 border-2 border-rose-200 text-rose-600 uppercase tracking-[2px] shadow-sm animate-in zoom-in-95">
                        Cancelled
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAttendees(evt)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-vayo-alice/60 hover:bg-vayo-blue hover:text-white border-vayo-sky hover:border-vayo-blue transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest"
                        >
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          <span>Check</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocationId(editingLocationId === evt.event_id ? null : evt.event_id)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-vayo-alice/60 hover:bg-vayo-blue hover:text-white border-vayo-sky hover:border-vayo-blue transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest"
                        >
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelEvent(evt.event_id, evt.host_id)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-white hover:bg-rose-500 hover:text-white border-slate-200 hover:border-rose-500 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest text-slate-400"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Location Editor */}
                {editingLocationId === evt.event_id && (
                  <div className="bg-white border-2 border-t-0 border-vayo-sky/40 rounded-b-[2rem] md:rounded-b-[2.5rem] px-5 md:px-6 pb-5 md:pb-6 pt-4 space-y-3 -mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-vayo-blue uppercase tracking-[2px]">📍 Update Location</span>
                      {evt.lat && <span className="text-[9px] text-emerald-600 font-bold">Pinned: {Number(evt.lat).toFixed(4)}, {Number(evt.lng).toFixed(4)}</span>}
                    </div>
                    <LocationPicker onChange={(loc) => handleSaveLocation(evt.event_id, loc)} />
                    {isSavingLocation && <p className="text-[10px] text-vayo-blue font-bold animate-pulse">Saving…</p>}
                  </div>
                )}
                </div>
              );
            })}
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="space-y-4 md:space-y-5 mt-6 md:mt-8">
            <div className="flex items-center gap-3 px-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-base md:text-lg font-bold text-white/70 tracking-tight">Past Events</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-[9px] font-black tracking-widest uppercase">{pastEvents.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-vayo px-2 md:px-0">
              {pastEvents.map((evt) => {
                const dateObj = new Date(evt.event_date);
                const formattedDate = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) + " • " + dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                const attendanceRate = evt.participant_count > 0
                  ? Math.round((evt.checked_in_count / evt.participant_count) * 100)
                  : 0;
                return (
                  <div key={evt.event_id} className="bg-white/10 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-center opacity-80 hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full sm:w-16 sm:h-16 rounded-xl md:rounded-2xl overflow-hidden shrink-0 bg-white/10 aspect-video sm:aspect-square">
                      <img src={evt.cover_image_url || "/assets/events/something.jpg"} alt={evt.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-center sm:text-left">
                      <h4 className="font-black text-white truncate text-sm md:text-base tracking-tight">{evt.title}</h4>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[9px] text-white/50 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.city || 'Bangalore'}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10 text-[9px] font-black tracking-widest">
                          {evt.participant_count || 0} RSVPs
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/20 text-[9px] font-black tracking-widest">
                          <CheckCircle2 className="w-3 h-3" />
                          {evt.checked_in_count || 0} Attended ({attendanceRate}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
