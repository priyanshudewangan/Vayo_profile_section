import { supabase } from "@/lib/supabase";

export const KarmaActionType = {
  // Login & Onboarding (Max 5 pts)
  SIGNUP_PROFILE_PHOTO: "SIGNUP_PROFILE_PHOTO", // +1
  SIGNUP_EMAIL_VERIFY: "SIGNUP_EMAIL_VERIFY", // +1
  SIGNUP_PHONE_VERIFY: "SIGNUP_PHONE_VERIFY", // +1
  SIGNUP_CLAIM_ID: "SIGNUP_CLAIM_ID", // +2

  // Meetups (Max 10/month)
  MEETUP_GPS_CHECKIN: "MEETUP_GPS_CHECKIN", // +3

  // Events (Max 12/month)
  EVENT_GPS_CHECKIN: "EVENT_GPS_CHECKIN", // +5

  // Experience Trips (Max 1/month)
  TRIP_GPS_CHECKIN: "TRIP_GPS_CHECKIN", // +12

  // Referrals (Max 4/referral)
  REFERRAL_REGISTRATION: "REFERRAL_REGISTRATION", // +1
  REFERRAL_RSVP: "REFERRAL_RSVP", // +1
  REFERRAL_GPS_CHECKIN: "REFERRAL_GPS_CHECKIN", // +2

  // RSVPs
  EVENT_RSVP: "EVENT_RSVP", // +0.5

  // Streaks
  STREAK_LEVEL_1: "STREAK_LEVEL_1", // +1
  STREAK_LEVEL_2: "STREAK_LEVEL_2", // +2
  STREAK_LEVEL_3: "STREAK_LEVEL_3", // +4
  STREAK_LEVEL_4: "STREAK_LEVEL_4", // +8

  // Birthday Reward
  BIRTHDAY_REWARD: "BIRTHDAY_REWARD", // +5

  // Reviews
  POSITIVE_REVIEW: "POSITIVE_REVIEW", // +1
  NEGATIVE_REVIEW: "NEGATIVE_REVIEW", // -2

  // Cancellations
  CANCELLATION_BEFORE_24H: "CANCELLATION_BEFORE_24H", // -2
  CANCELLATION_LAST_MINUTE: "CANCELLATION_LAST_MINUTE", // -5

  // No Shows
  NO_SHOW_MEETUP: "NO_SHOW_MEETUP", // -5
  NO_SHOW_EVENT: "NO_SHOW_EVENT", // -8
  NO_SHOW_TRIP: "NO_SHOW_TRIP", // -10

  // Community Guideline Violations
  REPORTS_3: "REPORTS_3", // -2
  REPORTS_5: "REPORTS_5", // -5
  REPORTS_7: "REPORTS_7", // -10
  VIOLATION_MINOR: "VIOLATION_MINOR", // -10
  VIOLATION_REPEATED: "VIOLATION_REPEATED", // -20
  VIOLATION_FRAUD: "VIOLATION_FRAUD", // -50
};

export const KARMA_RULES = {
  [KarmaActionType.SIGNUP_PROFILE_PHOTO]: 1,
  [KarmaActionType.SIGNUP_EMAIL_VERIFY]: 1,
  [KarmaActionType.SIGNUP_PHONE_VERIFY]: 1,
  [KarmaActionType.SIGNUP_CLAIM_ID]: 2,

  [KarmaActionType.MEETUP_GPS_CHECKIN]: 3,
  [KarmaActionType.EVENT_GPS_CHECKIN]: 5,
  [KarmaActionType.TRIP_GPS_CHECKIN]: 12,

  [KarmaActionType.REFERRAL_REGISTRATION]: 1,
  [KarmaActionType.REFERRAL_RSVP]: 1,
  [KarmaActionType.REFERRAL_GPS_CHECKIN]: 2,

  [KarmaActionType.EVENT_RSVP]: 0.5,

  [KarmaActionType.STREAK_LEVEL_1]: 1,
  [KarmaActionType.STREAK_LEVEL_2]: 2,
  [KarmaActionType.STREAK_LEVEL_3]: 4,
  [KarmaActionType.STREAK_LEVEL_4]: 8,

  [KarmaActionType.BIRTHDAY_REWARD]: 5,

  [KarmaActionType.POSITIVE_REVIEW]: 1,
  [KarmaActionType.NEGATIVE_REVIEW]: -2,

  [KarmaActionType.CANCELLATION_BEFORE_24H]: -2,
  [KarmaActionType.CANCELLATION_LAST_MINUTE]: -5,

  [KarmaActionType.NO_SHOW_MEETUP]: -5,
  [KarmaActionType.NO_SHOW_EVENT]: -8,
  [KarmaActionType.NO_SHOW_TRIP]: -10,

  [KarmaActionType.REPORTS_3]: -2,
  [KarmaActionType.REPORTS_5]: -5,
  [KarmaActionType.REPORTS_7]: -10,
  [KarmaActionType.VIOLATION_MINOR]: -10,
  [KarmaActionType.VIOLATION_REPEATED]: -20,
  [KarmaActionType.VIOLATION_FRAUD]: -50,
};

export const TIER_CONFIG = [
  { label: "Explorer", min: 0, max: 84, icon: "🔭" },
  { label: "Pathfinder", min: 85, max: 250, icon: "🧭" },
  { label: "Voyager", min: 251, max: 420, icon: "🚀" },
  { label: "Conqueror", min: 421, max: 999999, icon: "🌟" },
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
