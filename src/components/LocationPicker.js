"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function LocationPicker({ onChange }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [marker, setMarker] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  const searchLocation = async () => {
    if (!search.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    setResults(data);
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const venueName = result.display_name.split(",").slice(0, 3).join(", ");
    setMarker({ lat, lng });
    setFlyTarget({ lat, lng });
    setSearch(venueName);
    setResults([]);
    onChange({ venue: venueName, lat, lng });
  };

  const handleMapClick = async ({ lat, lng }) => {
    setMarker({ lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const name = data.display_name?.split(",").slice(0, 3).join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSearch(name);
      onChange({ venue: name, lat, lng });
    } catch {
      onChange({ venue: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng });
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Search venue or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchLocation())}
          className="w-full bg-vayo-alice/40 border-2 border-vayo-sky/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-vayo-blue focus:bg-white transition-all pr-20"
        />
        <button
          type="button"
          onClick={searchLocation}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black bg-vayo-blue hover:bg-vayo-light text-white px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Search
        </button>
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[1000] bg-white border border-vayo-sky/40 rounded-xl mt-1 overflow-hidden shadow-xl max-h-48 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-vayo-alice transition-colors border-b border-vayo-sky/20 last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-vayo-sky/40 shadow-inner" style={{ height: 240 }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onMapClick={handleMapClick} />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
          {marker && <Marker position={[marker.lat, marker.lng]} />}
        </MapContainer>
      </div>

      <p className="text-[10px] text-slate-400 pl-1">
        {marker ? `📍 ${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)} — coordinates saved` : "Click the map or search to pin a location"}
      </p>
    </div>
  );
}
