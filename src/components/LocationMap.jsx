"use client";

import React, { useEffect, useRef } from "react";
import { Navigation, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationMap({ lat, lng, venue }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Modern Custom SVG Pin Icon
  const customPinIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-vayo-blue/30 rounded-full animate-ping"></div>
        <div class="relative w-8 h-8 rounded-full bg-white border-2 border-vayo-blue flex items-center justify-center shadow-lg">
          <svg class="w-4.5 h-4.5 text-vayo-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </div>
      </div>
    `,
    className: "custom-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (!lat || !lng) return;

    // Destroy existing map instance to prevent duplication
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: false, // Prevent zoom on scroll for a smoother profile page scrolling experience
    });
    mapRef.current = map;

    // Add CartoDB Voyager modern map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Zoom buttons in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add Pin Marker
    L.marker([lat, lng], { icon: customPinIcon }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="w-full flex flex-col border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[180px] z-10 relative bg-neutral-100" 
      />
      
      {/* Footer Info & Action */}
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50/80 border-t border-neutral-100">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-vayo-blue/10 text-vayo-blue shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mixer Venue Location</span>
            <span className="text-xs font-bold text-slate-700 block truncate" title={venue || "Vayo Hub"}>
              {venue || "Vayo Hub, Bangalore"}
            </span>
          </div>
        </div>
        
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-vayo-blue text-white text-[10px] font-black uppercase tracking-wider hover:bg-vayo-light hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border-0"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  );
}
