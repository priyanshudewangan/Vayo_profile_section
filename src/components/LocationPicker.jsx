"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationPicker({ onChange, initialLat, initialLng, initialVenue }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(initialVenue || "");
  const [coordinates, setCoordinates] = useState({
    lat: initialLat || 12.9716, // Default to Bangalore
    lng: initialLng || 77.5946,
  });

  // Modern SVG Pin Icon
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

    // Destroy existing map instance if it exists to avoid multiple re-renders
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 15,
      zoomControl: false,
    });
    mapRef.current = map;

    // Add CartoDB Voyager premium/modern map layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
    }).addTo(map);

    // Zoom buttons in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initialize/Create Marker
    const marker = L.marker([coordinates.lat, coordinates.lng], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Dragend Handler
    marker.on("dragend", async (e) => {
      const { lat, lng } = e.target.getLatLng();
      updateCoordinates(lat, lng);
    });

    // Map Click Handler (Reverse Geocoding)
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updateCoordinates(lat, lng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const updateCoordinates = async (lat, lng) => {
    setCoordinates({ lat, lng });
    if (mapRef.current) {
      mapRef.current.panTo([lat, lng]);
    }
    
    // Reverse Geocode using Nominatim API to get address details
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      if (response.ok) {
        const data = await response.json();
        const addressName = data.display_name;
        setSelectedVenue(addressName);
        onChange({ venue: addressName, lat, lng });
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      // Even if geocoding fails, trigger state update with empty venue
      onChange({ venue: selectedVenue || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const { lat, lon, display_name } = results[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          setCoordinates({ lat: latitude, lng: longitude });
          setSelectedVenue(display_name);
          setSearchQuery("");

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
          }
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          }

          onChange({ venue: display_name, lat: latitude, lng: longitude });
        } else {
          alert("Location not found. Please try a different query.");
        }
      }
    } catch (err) {
      console.error("Geocoding search error:", err);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search venue or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-vayo-blue focus:bg-white transition-all shadow-inner focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 bg-vayo-blue text-white rounded-xl hover:bg-vayo-light transition-all flex items-center justify-center shadow-md disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-black uppercase tracking-wider">Search</span>}
        </button>
      </div>

      {/* Selected Location Details */}
      {selectedVenue && (
        <div className="flex items-start gap-2 p-3 bg-vayo-alice/20 border border-vayo-sky/30 rounded-xl text-[11px] text-slate-600 font-medium">
          <MapPin className="w-4 h-4 text-vayo-blue shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-800 block">Selected Venue</span>
            <span className="block truncate text-slate-500" title={selectedVenue}>{selectedVenue}</span>
            <span className="font-mono text-[9px] text-slate-400 mt-0.5 block">
              Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[220px] rounded-2xl border-2 border-vayo-sky/40 overflow-hidden shadow-inner z-10" 
      />
    </div>
  );
}
