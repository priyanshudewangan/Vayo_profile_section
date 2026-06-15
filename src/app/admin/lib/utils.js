import React from "react";

// Inline Instagram icon SVG component
export const Instagram = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Helper for relative time (e.g. "2 hrs ago", "Yesterday")
export function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Generate initials from email
export function getEmailInitials(email) {
  if (!email) return "??";
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Generate initials from Name (falls back to email)
export function getInitials(name, email) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  return getEmailInitials(email);
}

// Compute age from birthdate
export function getAge(dobString) {
  if (!dobString) return "";
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} y/o`;
}

// Deterministic light-mode gradient generator based on email hash
export function getAvatarGradient(email) {
  if (!email) return "from-sky-400 to-cyan-400";
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-sky-400 via-cyan-400 to-blue-400",
    "from-teal-300 via-emerald-300 to-cyan-400",
    "from-indigo-300 via-sky-300 to-cyan-400",
    "from-amber-300 via-orange-300 to-rose-300",
    "from-violet-300 via-purple-300 to-pink-300",
    "from-emerald-300 via-teal-300 to-sky-300"
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
