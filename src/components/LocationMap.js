"use client";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customPin = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [30, 30],
  className: "hue-rotate-[200deg] saturate-200",
});

export default function LocationMap({ lat, lng, venue }) {
  if (!lat || !lng) return null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200/70 shadow-sm" style={{ position: "relative" }}>
      <div style={{ height: 80 }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Marker position={[lat, lng]} icon={customPin} />
        </MapContainer>
      </div>

      <div className="bg-white/95 px-2.5 py-1.5 flex items-center justify-between border-t border-neutral-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[10px] font-medium text-neutral-600 truncate max-w-[160px]">{venue || "Event Location"}</span>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded-full transition-colors shrink-0 ml-2"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Directions
        </a>
      </div>
    </div>
  );
}
