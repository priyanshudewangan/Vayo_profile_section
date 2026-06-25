import { supabaseAdmin } from "@/lib/supabase";

const KARMA_RULES = {
  EVENT_RSVP: 10,
  GPS_CHECKIN: 20,
  EVENT_PHOTO_POST: 15,
  SIGNUP_EMAIL_VERIFY: 10,
  SIGNUP_PROFILE_PHOTO: 10,
  SIGNUP_VIBE_QUESTIONS: 20,
  SIGNUP_CLAIM_ID: 10,
};

const TIER_THRESHOLDS = [
  { tier: "Explorer",   level: 1, min: 0,   max: 84   },
  { tier: "Pathfinder", level: 2, min: 85,  max: 250  },
  { tier: "Voyager",    level: 3, min: 251, max: 420  },
  { tier: "Conqueror",  level: 4, min: 421, max: null },
];

function tierLevel(score) {
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= TIER_THRESHOLDS[i].min) return TIER_THRESHOLDS[i].level;
  }
  return 1;
}

/**
 * Award karma to a user.
 * Returns { success, new_score, points_awarded } or { success: false, error }.
 * Never throws — safe to fire-and-forget after a check-in.
 */
export async function awardKarma(email, action_type, reference_id = null) {
  try {
    const points = KARMA_RULES[action_type];
    if (!points) return { success: false, error: "Unknown action_type" };

    const { data: user, error: userErr } = await supabaseAdmin
      .from("waitlist")
      .select("karma_score")
      .eq("email", email)
      .single();

    if (userErr || !user) return { success: false, error: "User not found" };

    const newScore = Math.max(0, (user.karma_score || 0) + points);

    const [ledgerResult, scoreResult] = await Promise.all([
      supabaseAdmin.from("karma_ledger").insert([{
        email,
        action_type,
        point_delta: points,
        reference_id,
      }]),
      supabaseAdmin.from("waitlist")
        .update({ karma_score: newScore, tier_level: tierLevel(newScore) })
        .eq("email", email),
    ]);

    if (ledgerResult.error) throw ledgerResult.error;
    if (scoreResult.error) throw scoreResult.error;

    return { success: true, new_score: newScore, points_awarded: points };
  } catch (err) {
    console.error("awardKarma error:", err);
    return { success: false, error: err.message };
  }
}
