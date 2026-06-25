export const HOST_OPTIONS = [
  { id: "riya@vayo.com", name: "Riya", email: "riya@vayo.com" },
  { id: "sarah@vayo.com", name: "Sarah", email: "sarah@vayo.com" },
  { id: "alex@vayo.com", name: "Alex", email: "alex@vayo.com" },
  { id: "david@vayo.com", name: "David", email: "david@vayo.com" },
  { id: "elena@vayo.com", name: "Elena", email: "elena@vayo.com" },
];

export const CATEGORY_OPTIONS = [
  { value: "social", label: "Social" },
  { value: "music", label: "Music" },
  { value: "tech", label: "Tech" },
  { value: "sports", label: "Sports" },
  { value: "food", label: "Food" },
];

export const IMAGE_PRESETS = [
  { value: "/assets/events/something.jpg", label: "Acoustic Lounge Preset" },
  { value: "/assets/events/cards.jpg", label: "Board Games Cafe Preset" },
  { value: "/assets/events/holi.jpg", label: "Holi Colors Festival Preset" },
  { value: "/assets/events/outdoorevent.jpg", label: "Outdoor Camping/Hikes Preset" },
  { value: "/assets/events/hangout.jpg", label: "Quiet Café Hangout Preset" },
  { value: "/assets/events/sports.jpg", label: "Sports & Fitness Preset" },
  { value: "custom", label: "Custom Image URL..." },
];

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const EVENT_TYPES = [
  { value: "event",      label: "Event",      emoji: "🎭", desc: "Play, boating, sports, activity" },
  { value: "experience", label: "Experience", emoji: "🏕️", desc: "Trek, road trip, weekend getaway" },
  { value: "meetup",     label: "Meetup",     emoji: "☕", desc: "Tea & talk, casual coffee hangout" },
];

export const EXPERIENCE_CATEGORY_OPTIONS = [
  { value: "trek",       label: "Trek / Hike" },
  { value: "road_trip",  label: "Road Trip" },
  { value: "camping",    label: "Camping" },
  { value: "beach",      label: "Beach Getaway" },
  { value: "city_break", label: "City Break" },
  { value: "adventure",  label: "Adventure Sport" },
];
