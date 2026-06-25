import React, { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarPlus, Plus, Calendar, MapPin, Trash2, Users, CheckCircle2, Clock } from "lucide-react";
import { HOST_OPTIONS, CATEGORY_OPTIONS, EXPERIENCE_CATEGORY_OPTIONS, IMAGE_PRESETS, EVENT_TYPES } from "../lib/constants";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const inputCls = "w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-4 py-6 md:py-7 text-xs md:text-sm text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner";
const numCls   = "w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl md:rounded-2xl px-2 py-6 md:py-7 text-xs text-center font-black placeholder:text-slate-300 focus:border-vayo-blue focus:bg-white transition-all shadow-inner h-auto";
const selectItemCls = "text-[10px] md:text-xs font-bold uppercase tracking-wider py-2 md:py-3 focus:bg-vayo-alice focus:text-vayo-blue transition-colors cursor-pointer";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">{label}</label>
    {children}
  </div>
);

const SmallField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-[1px] block text-center">{label}</label>
    {children}
  </div>
);

const TYPE_COLORS = {
  event:      { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", activeBg: "bg-violet-600", ring: "ring-violet-200" },
  experience: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  activeBg: "bg-amber-500",  ring: "ring-amber-200"  },
  meetup:     { bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",activeBg: "bg-emerald-600",ring: "ring-emerald-200"},
};

const TYPE_BADGE = {
  event:      "bg-violet-100 text-violet-700 border-violet-200",
  experience: "bg-amber-100 text-amber-700 border-amber-200",
  meetup:     "bg-emerald-100 text-emerald-700 border-emerald-200",
};

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
  catalogTypeFilter,
  // Form props
  eventType, setEventType,
  eventTitle, setEventTitle,
  eventDescription, setEventDescription,
  eventDuration, setEventDuration,
  eventEndDate, setEventEndDate,
  eventDate, setEventDate,
  eventCity, setEventCity,
  eventVenue, setEventVenue,
  eventLatitude, setEventLatitude,
  eventLongitude, setEventLongitude,
  eventCategory, setEventCategory,
  eventMinKarma, setEventMinKarma,
  eventEntryFee, setEventEntryFee,
  eventMaxParticipants, setEventMaxParticipants,
  imagePreset, setImagePreset,
  customImageUrl, setCustomImageUrl,
  eventHostId, setEventHostId,
  // Image upload props
  imageFile,
  imagePreview, setImagePreview,
  uploadingImage,
  handleImageUpload,
  handleRemoveImage
}) => {
  const [hideCancelled, setHideCancelled] = useState(true);

  const selectedType = EVENT_TYPES.find(t => t.value === eventType) || EVENT_TYPES[0];
  const colors = TYPE_COLORS[eventType] || TYPE_COLORS.event;

  const displayedEvents = (events || []).filter(evt => {
    if (hideCancelled && evt.status === "cancelled") return false;
    if (catalogTypeFilter !== "all" && evt.event_type !== catalogTypeFilter) return false;
    return true;
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">
      {/* Left Column: Publish Form */}
      <div
        id="publish-event-form"
        className="lg:col-span-5 bg-white border border-vayo-sky rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_rgba(72,147,198,0.06)] flex flex-col gap-6 md:gap-8 transition-all duration-300"
      >
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colors.bg} ${colors.text} shadow-sm`}>
              <CalendarPlus className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span>Publish {selectedType.label}</span>
          </h3>
          <p className="text-[11px] md:text-xs text-slate-500 font-medium pl-1">
            {selectedType.desc}
          </p>
        </div>

        <form onSubmit={handleCreateEventSubmit} className="space-y-4 md:space-y-5">

          {/* Title */}
          <Field label={`${selectedType.label} Title *`}>
            <Input type="text" required value={eventTitle} onChange={e => setEventTitle(e.target.value)}
              placeholder={eventType === "meetup" ? "e.g. Tea & Talk at Matteo" : eventType === "experience" ? "e.g. Coorg Weekend Trek" : "e.g. Improv Theatre Night"}
              className={inputCls} />
          </Field>

          {/* Description */}
          <Field label="Description">
            <Textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)}
              placeholder={eventType === "meetup" ? "What's the vibe?" : eventType === "experience" ? "Itinerary, what to bring, highlights..." : "What to expect, dress code, etc."}
              rows={3} className={`${inputCls} resize-none min-h-[90px]`} />
          </Field>

          {/* ── EVENT fields ── */}
          {eventType === "event" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date & Time *">
                <Input type="datetime-local" required value={eventDate} onChange={e => setEventDate(e.target.value)} className={`${inputCls} [color-scheme:light]`} />
              </Field>
              <Field label="City *">
                <Input type="text" required value={eventCity} onChange={e => setEventCity(e.target.value)} placeholder="Bangalore" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Venue *">
                <Input type="text" required value={eventVenue} onChange={e => setEventVenue(e.target.value)} placeholder="e.g. Ranga Shankara" className={inputCls} />
              </Field>
              <Field label="Category">
                <Select value={eventCategory} onValueChange={setEventCategory}>
                  <SelectTrigger className={`${inputCls} h-auto`}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                    {CATEGORY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className={selectItemCls}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Map Location Pin *">
              <LocationPicker initialLat={eventLatitude} initialLng={eventLongitude} initialVenue={eventVenue}
                onChange={({ venue, lat, lng }) => { setEventVenue(venue); setEventLatitude(lat); setEventLongitude(lng); }} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <SmallField label="Karma"><Input type="number" min="0" value={eventMinKarma} onChange={e => setEventMinKarma(Math.max(0, parseInt(e.target.value)||0))} className={`${numCls} text-vayo-blue`} /></SmallField>
              <SmallField label="Fee (₹)"><Input type="number" min="0" value={eventEntryFee} onChange={e => setEventEntryFee(Math.max(0, parseInt(e.target.value)||0))} className={`${numCls} text-emerald-600`} /></SmallField>
              <SmallField label="Spots"><Input type="number" min="1" placeholder="∞" value={eventMaxParticipants} onChange={e => setEventMaxParticipants(e.target.value ? Math.max(1, parseInt(e.target.value)||1) : "")} className={`${numCls} text-slate-700`} /></SmallField>
            </div>
          </>)}

          {/* ── EXPERIENCE fields ── */}
          {eventType === "experience" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date *">
                <Input type="datetime-local" required value={eventDate} onChange={e => setEventDate(e.target.value)} className={`${inputCls} [color-scheme:light]`} />
              </Field>
              <Field label="End Date">
                <Input type="datetime-local" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className={`${inputCls} [color-scheme:light]`} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City / Region *">
                <Input type="text" required value={eventCity} onChange={e => setEventCity(e.target.value)} placeholder="e.g. Coorg" className={inputCls} />
              </Field>
              <Field label="Trip Type">
                <Select value={eventCategory} onValueChange={setEventCategory}>
                  <SelectTrigger className={`${inputCls} h-auto`}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="rounded-2xl border-vayo-sky shadow-xl">
                    {EXPERIENCE_CATEGORY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value} className={selectItemCls}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Meeting Point *">
              <Input type="text" required value={eventVenue} onChange={e => setEventVenue(e.target.value)} placeholder="e.g. Majestic Bus Stand, Bangalore" className={inputCls} />
            </Field>
            <Field label="Map Location Pin *">
              <LocationPicker initialLat={eventLatitude} initialLng={eventLongitude} initialVenue={eventVenue}
                onChange={({ venue, lat, lng }) => { setEventVenue(venue); setEventLatitude(lat); setEventLongitude(lng); }} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <SmallField label="Duration"><Input type="text" placeholder="2 days" value={eventDuration} onChange={e => setEventDuration(e.target.value)} className={`${numCls} text-amber-600`} /></SmallField>
              <SmallField label="Cost/Person (₹)"><Input type="number" min="0" value={eventEntryFee} onChange={e => setEventEntryFee(Math.max(0, parseInt(e.target.value)||0))} className={`${numCls} text-emerald-600`} /></SmallField>
              <SmallField label="Group Size"><Input type="number" min="1" placeholder="∞" value={eventMaxParticipants} onChange={e => setEventMaxParticipants(e.target.value ? Math.max(1, parseInt(e.target.value)||1) : "")} className={`${numCls} text-slate-700`} /></SmallField>
            </div>
          </>)}

          {/* ── MEETUP fields ── */}
          {eventType === "meetup" && (<>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date & Time *">
                <Input type="datetime-local" required value={eventDate} onChange={e => setEventDate(e.target.value)} className={`${inputCls} [color-scheme:light]`} />
              </Field>
              <Field label="City *">
                <Input type="text" required value={eventCity} onChange={e => setEventCity(e.target.value)} placeholder="Bangalore" className={inputCls} />
              </Field>
            </div>
            <Field label="Spot / Café *">
              <Input type="text" required value={eventVenue} onChange={e => setEventVenue(e.target.value)} placeholder="e.g. Third Wave Coffee, Indiranagar" className={inputCls} />
            </Field>
            <Field label="Map Location Pin *">
              <LocationPicker initialLat={eventLatitude} initialLng={eventLongitude} initialVenue={eventVenue}
                onChange={({ venue, lat, lng }) => { setEventVenue(venue); setEventLatitude(lat); setEventLongitude(lng); }} />
            </Field>
          </>)}

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
            <Label className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[2px] block pl-1">Cover Image *</Label>
            <div className="flex bg-vayo-alice/60 p-1.5 rounded-xl border border-vayo-sky/20 gap-1.5">
              <button type="button" onClick={() => { setImagePreset("/assets/events/something.jpg"); setCustomImageUrl(""); }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${imagePreset !== "custom" ? "bg-vayo-blue text-white shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}>
                Use Preset
              </button>
              <button type="button" onClick={() => setImagePreset("custom")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all duration-300 ${imagePreset === "custom" ? "bg-vayo-blue text-white shadow-md scale-[1.02]" : "text-slate-500 hover:text-slate-700"}`}>
                Upload Poster
              </button>
            </div>

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
                    <button type="button" onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-full border-2 border-dashed border-vayo-sky/60 hover:border-vayo-blue bg-vayo-alice/30 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative group/dropzone">
                    <div className="w-9 h-9 rounded-full bg-vayo-blue/10 border border-vayo-sky/30 flex items-center justify-center text-vayo-blue shrink-0">
                      <Plus className="w-4 h-4 group-hover/dropzone:rotate-90 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">{uploadingImage ? "Uploading poster image..." : "Upload custom event poster image"}</p>
                      <label className="text-[9.5px] text-vayo-blue font-black hover:underline cursor-pointer block mt-1">
                        Browse poster file
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} className="hidden" disabled={uploadingImage} />
                      </label>
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Max Size: 5MB (PNG, JPG, JPEG)</p>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider pl-1">Or paste cover image URL:</span>
                  <Input type="url" placeholder="https://example.com/poster.jpg" value={customImageUrl}
                    onChange={(e) => { setCustomImageUrl(e.target.value); setImagePreset("custom"); setImagePreview(e.target.value || ""); }}
                    className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl px-4 py-4 text-xs text-slate-800 placeholder:text-slate-300 focus:border-vayo-blue transition-all" />
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmittingEvent}
            className={`w-full py-7 md:py-8 rounded-xl md:rounded-2xl text-white text-[10px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[3px] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 md:gap-3 mt-4 md:mt-6 disabled:opacity-50 shadow-lg relative overflow-hidden group h-auto ${
              eventType === "experience" ? "bg-amber-500 hover:bg-amber-400 hover:shadow-amber-200" :
              eventType === "meetup" ? "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-200" :
              "bg-vayo-blue hover:bg-vayo-light hover:shadow-vayo-blue/20"
            }`}
          >
            {isSubmittingEvent ? (
              <><span className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span><span>Broadcasting...</span></>
            ) : (
              <><Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /><span>Publish {selectedType.emoji} {selectedType.label} Live</span></>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        </form>

        {createdEventData && (
          <div className="bg-emerald-50/80 backdrop-blur-sm border-2 border-emerald-200 rounded-2xl md:rounded-[2rem] p-5 md:p-6 text-left animate-in zoom-in-95 duration-500 shadow-sm mt-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-100" /></div>
            <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[2px] block">Published Live!</span>
            <div className="flex gap-2 mt-4 md:mt-5">
              <Button variant="outline" size="sm"
                onClick={() => { navigator.clipboard.writeText(createdEventData.share_links?.event_url || ""); addToast("Event link copied!", "success"); }}
                className="flex-1 bg-white border-emerald-300 text-emerald-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg md:rounded-xl hover:bg-emerald-500 hover:text-white transition-all h-9 md:h-10 shadow-sm">
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCreatedEventData(null)}
                className="px-3 md:px-4 bg-white border-slate-200 text-slate-400 text-[9px] md:text-[10px] font-bold uppercase rounded-lg md:rounded-xl hover:bg-slate-100 transition-all h-9 md:h-10">
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Catalog */}
      <div className="lg:col-span-7 space-y-6 md:space-y-8">
        <div className="flex flex-col gap-4 px-1 md:px-0">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 md:space-y-1">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-3 drop-shadow-sm">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-vayo-sky" />
                <span>Upcoming Catalog</span>
              </h3>
              <p className="text-[10px] md:text-xs text-vayo-alice/70 font-medium tracking-wide">
                Manage all events, experiences & meetups.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setHideCancelled(!hideCancelled)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer ${hideCancelled ? "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/35" : "bg-white/10 border-white/10 text-white/70 hover:bg-white/15"}`}>
                {hideCancelled ? "Show Cancelled" : "Hide Cancelled"}
              </button>
              <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[8px] md:text-[9px] font-black text-white uppercase tracking-[2px]">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DB LIVE
              </div>
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
              <p className="text-[10px] md:text-[11px] text-vayo-alice/40 font-medium">Publish your first entry above.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-5 max-h-[700px] md:max-h-[900px] overflow-y-auto pr-2 md:pr-3 scrollbar-vayo px-2 md:px-0">
            {displayedEvents.map((evt) => {
              const isCancelled = evt.status === "cancelled";
              const dateObj = new Date(evt.event_date);
              const formattedDate = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " • " + dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
              const evtType = evt.event_type || "event";
              const badgeClass = TYPE_BADGE[evtType] || TYPE_BADGE.event;
              const typeInfo = EVENT_TYPES.find(t => t.value === evtType);

              return (
                <div key={evt.event_id}
                  className={`bg-white border-2 ${isCancelled ? "border-rose-200/50 opacity-80" : "border-vayo-sky/40 hover:border-vayo-blue/60"} rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-6 items-center shadow-[0_4px_24px_rgba(72,147,198,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group/card overflow-hidden`}>
                  <div className="w-full sm:w-24 sm:h-24 rounded-2xl md:rounded-3xl overflow-hidden shrink-0 border-2 border-vayo-sky/30 relative bg-slate-100 shadow-md aspect-video sm:aspect-square">
                    <img src={evt.cover_image_url || "/assets/events/something.jpg"} alt={evt.title}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute top-2 left-2 bg-vayo-blue/90 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-black text-white uppercase tracking-wider shadow-sm">
                      {evt.category}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 md:gap-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="font-black text-slate-800 truncate text-base md:text-lg tracking-tight group-hover/card:text-vayo-blue transition-colors duration-300" title={evt.title}>
                        {evt.title}
                      </h4>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${badgeClass}`}>
                        {typeInfo?.emoji} {typeInfo?.label || evtType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 md:gap-x-4 gap-y-1 text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 bg-vayo-alice/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-vayo-sky/20">
                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-vayo-blue opacity-70" />{formattedDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-vayo-alice/40 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-vayo-sky/20">
                        <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 text-vayo-blue opacity-70" />{evt.city || 'Bangalore'}
                      </span>
                      {evt.duration && (
                        <span className="flex items-center gap-1.5 bg-amber-50 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg border border-amber-100">
                          <Clock className="w-3 h-3 text-amber-500 opacity-70" />{evt.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap">
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-50 text-amber-700 border-2 border-amber-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.participant_count || 0} RSVPs
                      </span>
                      <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-100 text-[9px] md:text-[10px] font-black tracking-widest shadow-sm">
                        {evt.entry_fee === 0 ? "FREE" : `₹${evt.entry_fee}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 md:gap-3 shrink-0 self-center sm:self-center justify-center w-full sm:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isCancelled ? (
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black bg-rose-50 border-2 border-rose-200 text-rose-600 uppercase tracking-[2px] shadow-sm animate-in zoom-in-95">Cancelled</div>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(evt.event_id, evt.host_id)}
                          className="rounded-xl md:rounded-2xl bg-white hover:bg-rose-600 hover:text-white border-slate-200 hover:border-rose-600 transition-all duration-300 shadow-sm flex items-center justify-center p-2 h-9 w-9 text-slate-400 hover:text-white shrink-0 cursor-pointer" title="Delete Permanently">
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleViewAttendees(evt)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-vayo-alice/60 hover:bg-vayo-blue hover:text-white border-vayo-sky hover:border-vayo-blue transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4" /><span>Check</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCancelEvent(evt.event_id, evt.host_id)}
                          className="flex-1 sm:flex-none rounded-xl md:rounded-2xl bg-white hover:bg-rose-500 hover:text-white border-slate-200 hover:border-rose-500 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 h-9 md:h-11 px-4 md:px-6 font-black uppercase text-[9px] md:text-[10px] tracking-widest text-slate-400">
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
