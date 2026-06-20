import { supabase } from "@/lib/supabase";

export const KarmaActionType = {
  // Onboarding
  SIGNUP_EMAIL_VERIFY: "SIGNUP_EMAIL_VERIFY",
  SIGNUP_PROFILE_PHOTO: "SIGNUP_PROFILE_PHOTO",
  SIGNUP_VIBE_QUESTIONS: "SIGNUP_VIBE_QUESTIONS",
  // Events
  EVENT_RSVP: "EVENT_RSVP",
  GPS_CHECKIN: "GPS_CHECKIN",
  EVENT_PHOTO_POST: "EVENT_PHOTO_POST",
  // Social
  PEER_ENDORSEMENT: "PEER_ENDORSEMENT",
  HOST_EVENT: "HOST_EVENT",
  // Penalties
  NO_SHOW_PENALTY: "NO_SHOW_PENALTY",
  HOST_CANCEL_PENALTY: "HOST_CANCEL_PENALTY",
};

export const KARMA_RULES = {
  [KarmaActionType.SIGNUP_EMAIL_VERIFY]: 10,
  [KarmaActionType.SIGNUP_PROFILE_PHOTO]: 10,
  [KarmaActionType.SIGNUP_VIBE_QUESTIONS]: 20,
  [KarmaActionType.EVENT_RSVP]: 10,
  [KarmaActionType.GPS_CHECKIN]: 20,
  [KarmaActionType.EVENT_PHOTO_POST]: 15,
  [KarmaActionType.PEER_ENDORSEMENT]: 25,
  [KarmaActionType.HOST_EVENT]: 50,
  [KarmaActionType.NO_SHOW_PENALTY]: -20,
  [KarmaActionType.HOST_CANCEL_PENALTY]: -30,
};

export const TIER_CONFIG = [
  { label: "Beginner", min: 0, max: 299 },
  { label: "Pathfinder", min: 300, max: 499 },
  { label: "Explorer", min: 500, max: 999 },
  { label: "Conqueror", min: 1000, max: 999999 },
];

export function getTierFromScore(score) {
  const currentScore = score || 0;
  for (const tier of TIER_CONFIG) {
    if (currentScore >= tier.min && currentScore <= tier.max) {
      return tier;
    }
  }
  return TIER_CONFIG[0];
}

/**
 * Awards or deducts Karma points for a user and records it in the ledger.
 * @param {string} email - The user's email identifier
 * @param {string} actionType - From KarmaActionType enum
 * @param {string} referenceId - Optional related ID (e.g., event_id)
 * @param {string} description - Human readable reason
 */
export async function awardKarma(email, actionType, referenceId = null, description = null) {
  try {
    const points = KARMA_RULES[actionType];
    if (points === undefined) {
      throw new Error(`Unknown Karma Action: ${actionType}`);
    }

    // Insert into ledger (Trigger will auto-update total score)
    const { error } = await supabase.from("karma_ledger").insert([{
      user_id: email, // Using email as user_id based on current schema
      action_type: actionType,
      point_delta: points,
      reference_id: referenceId,
      description: description || `Awarded for ${actionType}`
    }]);

    if (error) throw error;
    
    return { success: true, pointsAwarded: points };
  } catch (error) {
    console.error("Failed to award karma:", error);
    return { success: false, error: error.message };
  }
}
