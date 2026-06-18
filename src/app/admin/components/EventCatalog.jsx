"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CalendarPlus, Plus, Calendar, MapPin, Trash2, Users, CheckCircle2, UserCheck } from "lucide-react";
import { getAvatarGradient, getEmailInitials } from "../lib/utils";
import { HOST_OPTIONS, CATEGORY_OPTIONS, IMAGE_PRESETS } from "../lib/constants";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const EventCatalog = ({
  events,
  isLoadingEvents,
  handleCreateEventSubmit,
  handleCancelEvent,
  handleDeleteEvent,
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
  eventLatitude, setEventLatitude,
  eventLongitude, setEventLongitude,
  eventCategory, setEventCategory,
  eventTags, setEventTags,
  eventMinKarma, setEventMinKarma,
  eventEntryFee, setEventEntryFee,
  eventMaxParticipants, setEventMaxParticipants,
  imagePreset, setImagePreset,
  customImageUrl, setCustomImageUrl,
  eventHostId, setEventHostId,
  // Image upload props
  imageFile,
  imagePreview,
  uploadingImage,
  handleImageUpload,
  handleRemoveImage
}) => {
  const [hideCancelled, setHideCancelled] = useState(true);
  const displayedEvents = (events || []).filter(evt => !hideCancelled || evt.status !== "cancelled");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [attendedByEvent, setAttendedByEvent] = useState({});

  useEffect(() => {
    if (!events || events.filter(e => e.checked_in_count > 0).length === 0) return;
    fetch("/api/checkins")
      .then(r => r.ok ? r.json() : { checkins: [] })
      .then(data => {
        const map = {};
        for (const r of (data.checkins || [])) {
          if (!map[r.event_id]) map[r.event_id] = [];
          map[r.event_id].push(r);
        }
        setAttendedByEvent(map);
      })
      .catch(() => {});
  }, [events]);

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
            <span>Publish Mixer</span>
          </h3>
          <p className="text-[11px] md:text-xs text-slate-500 font-medium pl-1">
            Build and broadcast a new offline community event.
          </p>
        </div>

        <form onSubmit={handleCreateEventSubmit} className="space-y-4 md:space-y-5">
          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Mixer Title *</Label>
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

          <div className="space-y-1.5 md:space-y-2">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Map Location Pin *</Label>
            <LocationPicker
              initialLat={eventLatitude}
              initialLng={eventLongitude}
              initialVenue={eventVenue}
              onChange={({ venue, lat, lng }) => {
                setEventVenue(venue);
                setEventLatitude(lat);
                setEventLongitude(lng);
              }}
            />
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

          <div className="space-y-3">
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Mixer Cover Image *</Label>
            
            {/* Toggle tabs to choose Preset vs Upload */}
            <div className="flex bg-vayo-alice/60 p-1.5 rounded-xl border border-vayo-sky/20 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setImagePreset("/assets/events/something.jpg");
                  setCustomImageUrl("");
                }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${
                  imagePreset !== "custom" ? "bg-vayo-blue text-white shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Use Preset
              </button>
              <button
                type="button"
                onClick={() => setImagePreset("custom")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${
                  imagePreset === "custom" ? "bg-vayo-blue text-white shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload Poster
              </button>
            </div>

            {/* Render Preset Selector if Use Preset active */}
            {imagePreset !== "custom" && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <Select value={imagePreset} onValueChange={setImagePreset}>
                  <SelectTrigger className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 md:px-5 py-6 md:py-7 text-xs md:text-sm text-slate-800 focus:border-vayo-blue transition-all shadow-inner h-auto">
                    <SelectValue placeholder="Select preset image" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                    {IMAGE_PRESETS.filter(opt => opt.value !== "custom").map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-[10px] md:text-xs font-bold py-2 md:py-3 focus:bg-vayo-alice focus:text-vayo-blue transition-colors cursor-pointer">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Render File Uploader if Upload Poster active */}
            {imagePreset === "custom" && (
              <div className="space-y-2.5 animate-in fade-in duration-300">
                {imagePreview ? (
                  <div className="relative border-2 border-vayo-sky/50 bg-vayo-alice/20 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-vayo-sky/30 shadow-sm shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-700 block truncate">{imageFile?.name || "Uploaded Image"}</span>
                        <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Custom Poster Selected</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-full border-2 border-dashed border-vayo-sky/60 hover:border-vayo-blue bg-vayo-alice/30 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative group/dropzone">
                    <div className="w-9 h-9 rounded-full bg-vayo-blue/10 border border-vayo-sky/30 flex items-center justify-center text-vayo-blue shrink-0">
                      <Plus className="w-4 h-4 group-hover/dropzone:rotate-90 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">
                        {uploadingImage ? "Uploading poster image..." : "Upload custom event poster image"}
                      </p>
                      <label className="text-[9.5px] text-vayo-blue font-black hover:underline cursor-pointer block mt-1">
                        Browse poster file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                          }}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Max Size: 5MB (PNG, JPG, JPEG)</p>
                  </div>
                )}
                
                {/* Fallback Custom Image URL Input */}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-1">Or paste cover image URL:</span>
                  <Input
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setImagePreset("custom");
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                      } else {
                        setImagePreview("");
                      }
                    }}
                    className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl px-4 py-4 text-xs text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue transition-all"
                  />
                </div>
              </div>
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
                <span>Publish Mixer Live</span>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        </form>

        {createdEventData && (
          <div className="bg-emerald-50/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left animate-in zoom-in-95 duration-500 shadow-sm mt-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-100" /></div>
            <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[2px] block">Mixer Live!</span>
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
              Manage mixers and track registrant counts.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setHideCancelled(!hideCancelled)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                hideCancelled
                  ? "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/35"
                  : "bg-white/10 border-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {hideCancelled ? "Show Cancelled" : "Hide Cancelled"}
            </button>
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[8px] md:text-[9px] font-black text-white uppercase tracking-[2px]">
               <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DB LIVE
            </div>
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
        ) : displayedEvents.length === 0 ? (
          <div className="py-20 md:py-40 text-center flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-md border-2 border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] shadow-xl mx-2">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vayo-sky/20 mb-2">
              <CalendarPlus className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-sm md:text-base font-bold text-white opacity-80 tracking-tight">Catalog is empty</p>
              <p className="text-[10px] md:text-[11px] text-vayo-alice/40 font-medium">Publish your first community mixer above.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 max-h-[700px] md:max-h-[900px] overflow-y-auto pr-2 md:pr-3 scrollbar-vayo px-2 md:px-0">
            {displayedEvents.map((evt) => {
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
                <React.Fragment key={evt.event_id}>
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
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-50 text-amber-700 border-2 border-amber-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.participant_count || 0} RSVPs
                      </span>
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.entry_fee === 0 ? "FREE" : `\u20B9${evt.entry_fee}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 md:gap-3 shrink-0 self-center sm:self-center justify-center w-full sm:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isCancelled ? (
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black bg-rose-50 border-2 border-rose-200 text-rose-600 uppercase tracking-[2px] shadow-sm animate-in zoom-in-95">
                          Cancelled
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(evt.event_id, evt.host_id)}
                          className="rounded-xl md:rounded-2xl bg-white hover:bg-rose-600 hover:text-white border-slate-200 hover:border-rose-600 transition-all duration-300 shadow-sm flex items-center justify-center p-2 h-9 w-9 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
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
                          onClick={() => handleCancelEvent(evt.event_id, evt.host_id)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-white hover:bg-rose-500 hover:text-white border-slate-200 hover:border-rose-500 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest text-slate-400"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* GPS Check-in strip — avatar stack + count, click opens modal */}
                {(attendedByEvent[evt.event_id] || []).length > 0 && (() => {
                  const attended = attendedByEvent[evt.event_id];
                  const preview = attended.slice(0, 4);
                  const extra = attended.length - preview.length;
                  return (
                    <button
                      onClick={() => handleViewAttendees(evt)}
                      className="w-full flex items-center gap-3 bg-teal-50 border-2 border-t-0 border-teal-200 rounded-b-[2rem] md:rounded-b-[2.5rem] px-5 md:px-6 py-3 -mt-6 hover:bg-teal-100 transition-colors cursor-pointer group"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="text-[9px] font-black text-teal-700 uppercase tracking-[2px] shrink-0">GPS Check-ins</span>
                      <div className="flex items-center -space-x-2 ml-1">
                        {preview.map(r => (
                          <div key={r.id} title={r.user_email} className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient(r.user_email)} flex items-center justify-center text-white text-[8px] font-black ring-2 ring-teal-50 shrink-0`}>
                            {getEmailInitials(r.user_email)}
                          </div>
                        ))}
                        {extra > 0 && (
                          <div className="w-6 h-6 rounded-full bg-teal-200 flex items-center justify-center text-teal-700 text-[8px] font-black ring-2 ring-teal-50 shrink-0">
                            +{extra}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-teal-600 ml-1">{attended.length} attended</span>
                      <span className="ml-auto text-[9px] text-teal-400 font-semibold group-hover:text-teal-600 transition-colors">View →</span>
                    </button>
                  );
                })()}

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
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
