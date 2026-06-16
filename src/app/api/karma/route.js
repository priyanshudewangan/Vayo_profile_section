import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

// Tier thresholds calibrated to 500-point max over 6 months
const TIERS = [
  { name: "Explorer",    icon: "🔭", min: 0,   max: 84  },
  { name: "Pathfinder",  icon: "🧭", min: 85,  max: 250 },
  { name: "Voyager",     icon: "🚀", min: 251, max: 420 },
  { name: "Conqueror",   icon: "🌟", min: 421, max: 500 },
];

function getTier(total) {
  return TIERS.findLast(t => total >= t.min) || TIERS[0];
}

function getNextTier(total) {
  return TIERS.find(t => total < t.min) || null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Fetch in parallel: user profile, RSVPs, moments, referrals
    const [userRes, rsvpRes, momentRes, referralRes] = await Promise.all([
      supabase.from("waitlist").select("*").eq("email", normalizedEmail).maybeSingle(),
      supabase.from("rsvps").select("event_id, status, created_at").eq("user_email", normalizedEmail),
      supabase.from("moments").select("id, created_at").eq("email", normalizedEmail),
      supabase.from("waitlist").select("id").eq("referred_by", normalizedEmail),
    ]);

    const user = userRes.data;
    const rsvps = rsvpRes.data || [];
    const moments = momentRes.data || [];
    // referralRes.error means column doesn't exist yet — treat as 0
    const referralCount = referralRes.error ? 0 : (referralRes.data?.length ?? 0);

    // ── 1. Profile Setup (max 5 pts) ──────────────────────────────────
    const profileBreakdown = [
      { label: "Profile photo uploaded",  pts: user?.selfie_url ? 1 : 0,  max: 1, done: !!user?.selfie_url },
      { label: "Email verified",           pts: user?.email ? 1 : 0,       max: 1, done: !!user?.email },
      { label: "Phone number added",       pts: user?.phone ? 1 : 0,       max: 1, done: !!user?.phone },
      { label: "Unique member ID created", pts: user ? 2 : 0,             max: 2, done: !!user },
    ];
    const profilePoints = profileBreakdown.reduce((s, i) => s + i.pts, 0);

    // ── 2. Event RSVPs (0.5 per confirmed RSVP) ───────────────────────
    const confirmedRsvps = rsvps.filter(r => r.status === "confirmed" || !r.status);
    const rsvpPoints = confirmedRsvps.length * 0.5;

    // ── 3. GPS Check-ins (not yet implemented) ────────────────────────
    const momentPoints = 0;
    const gpsPoints = 0;

    // ── 4. Community: referrals (+1 per confirmed member, max 4) ──────
    const referralPoints = Math.min(referralCount, 4);
    const communityPoints = referralPoints;

    const total = Math.round((profilePoints + rsvpPoints + momentPoints + gpsPoints + communityPoints) * 10) / 10;
    const tier = getTier(total);
    const nextTier = getNextTier(total);
    const progressToNext = nextTier
      ? Math.round(((total - tier.min) / (nextTier.min - tier.min)) * 100)
      : 100;

    return NextResponse.json({
      total,
      tier: tier.name,
      tierIcon: tier.icon,
      tierMin: tier.min,
      tierMax: tier.max,
      nextTier: nextTier?.name || null,
      nextTierIcon: nextTier?.icon || null,
      nextTierMin: nextTier?.min || null,
      progressToNext,
      breakdown: {
        profileSetup: {
          points: profilePoints,
          max: 5,
          items: profileBreakdown,
        },
        eventRsvps: {
          points: rsvpPoints,
          count: confirmedRsvps.length,
          perRsvp: 0.5,
        },
        gpsCheckins: {
          points: gpsPoints,
          count: 0,
          note: "Earn +3–12 pts per GPS check-in at events",
        },
        community: {
          points: communityPoints,
          referrals: referralCount,
          referralPts: referralPoints,
          moments: moments.length,
          note: "Streaks & reviews coming soon",
        },
      },
      monthlyCapInfo: {
        cap: 84,
        earned: total,
      },
    }, { status: 200 });

  } catch (err) {
    console.error("Karma API error:", err);
    return NextResponse.json({ error: "Failed to compute karma" }, { status: 500 });
  }
}
