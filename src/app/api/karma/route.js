export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { KARMA_RULES } from "@/lib/karma";

// Aligned with frontend tiers (src/app/profile/page.js)
const TIER_CONFIG = {
  Explorer: { label: "Explorer", min: 0, max: 84, level: 1, next: "Pathfinder", icon: "🔭" },
  Pathfinder: { label: "Pathfinder", min: 85, max: 250, level: 2, next: "Voyager", icon: "🧭" },
  Voyager: { label: "Voyager", min: 251, max: 420, level: 3, next: "Conqueror", icon: "🚀" },
  Conqueror: { label: "Conqueror", min: 421, max: null, level: 4, next: null, icon: "🌟" }
};

function computeTier(score) {
  for (const [tier, config] of Object.entries(TIER_CONFIG)) {
    if (score >= config.min && (config.max === null || score <= config.max)) {
      return { tier, ...config };
    }
  }
  return { tier: "Explorer", ...TIER_CONFIG.Explorer };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // 1. Get user karma score and profile from waitlist
    const { data: user, error: userError } = await supabase
      .from("waitlist")
      .select("karma_score, tier_level, inbox_shield_threshold")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Get history from ledger
    const { data: ledger, error: ledgerError } = await supabase
      .from("karma_ledger")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(50);

    const score = user.karma_score || 0;
    const tierInfo = computeTier(score);

    // Calculate progressToNext percentage
    let progressToNext = 0;
    if (tierInfo && tierInfo.max !== null) {
      const range = tierInfo.max - tierInfo.min + 1;
      progressToNext = Math.min(100, Math.round(((score - tierInfo.min) / range) * 100));
    } else {
      progressToNext = 100;
    }

    // 3. Compute dynamic breakdown categories from ledger
    let profileSetupPoints = 0;
    let eventRsvpPoints = 0;
    let eventRsvpCount = 0;
    let gpsCheckinPoints = 0;
    let communityPoints = 0;

    const profileSetupActions = ["SIGNUP_EMAIL_VERIFY", "SIGNUP_PROFILE_PHOTO", "SIGNUP_PHONE_VERIFY", "SIGNUP_CLAIM_ID"];

    if (ledger) {
      ledger.forEach(item => {
        const action = item.action_type;
        const delta = item.point_delta;

        if (profileSetupActions.includes(action)) {
          profileSetupPoints += delta;
        } else if (action === "EVENT_RSVP") {
          eventRsvpPoints += delta;
          eventRsvpCount += 1;
        } else if (action === "MEETUP_GPS_CHECKIN" || action === "EVENT_GPS_CHECKIN" || action === "TRIP_GPS_CHECKIN" || action === "GPS_CHECKIN") {
          gpsCheckinPoints += delta;
        } else {
          communityPoints += delta;
        }
      });
    }

    const hasPhoto = ledger ? ledger.some(item => item.action_type === "SIGNUP_PROFILE_PHOTO") : false;
    const hasEmail = ledger ? ledger.some(item => item.action_type === "SIGNUP_EMAIL_VERIFY") : false;
    const hasPhone = ledger ? ledger.some(item => item.action_type === "SIGNUP_PHONE_VERIFY") : false;
    const hasId = ledger ? ledger.some(item => item.action_type === "SIGNUP_CLAIM_ID") : false;

    const setupItems = [
      { label: "Upload Profile Photo", done: hasPhoto, max: 1 },
      { label: "Verify Email Address", done: hasEmail, max: 1 },
      { label: "Verify Phone Number", done: hasPhone, max: 1 },
      { label: "Create Unique User ID", done: hasId, max: 2 }
    ];

    const response = {
      email,
      total: score, // UI expects total
      tier: tierInfo.tier, // UI uses matching keys (Explorer, Pathfinder, Voyager, Conqueror)
      tierIcon: tierInfo.icon,
      nextTier: tierInfo.next,
      nextTierMin: tierInfo.next ? TIER_CONFIG[tierInfo.next].min : null,
      tierMin: tierInfo.min,
      progressToNext,
      breakdown: {
        profileSetup: { points: profileSetupPoints, max: 5, items: setupItems },
        eventRsvps: { points: eventRsvpPoints, count: eventRsvpCount },
        gpsCheckins: { points: gpsCheckinPoints },
        community: { points: communityPoints }
      },
      ledger: ledger || []
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Karma API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, action_type, reference_id } = await request.json();

    if (!email || !action_type) {
      return NextResponse.json({ error: "Email and action_type are required" }, { status: 400 });
    }

    const pointDelta = KARMA_RULES[action_type];
    if (pointDelta === undefined) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // 1. Check if user exists in waitlist
    const { data: user, error: userError } = await supabase
      .from("waitlist")
      .select("karma_score, id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Insert into ledger
    const { error: ledgerError } = await supabase
      .from("karma_ledger")
      .insert([
        {
          email,
          action_type,
          point_delta: pointDelta,
          reference_id
        }
      ]);

    if (ledgerError) throw ledgerError;

    // 3. Update user score manually in waitlist
    const newScore = Math.max(0, (user.karma_score || 0) + pointDelta);
    const tierInfo = computeTier(newScore);
    
    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ 
        karma_score: newScore,
        tier_level: tierInfo?.level || 1
      })
      .eq("email", email);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      new_score: newScore,
      tier: tierInfo?.tier || "Explorer"
    });

  } catch (err) {
    console.error("Karma Award Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
