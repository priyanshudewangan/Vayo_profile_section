-- Run this in your Supabase SQL Editor

-- 1. Create Karma Action Enum
DO $$ BEGIN
    CREATE TYPE karma_action_type_enum AS ENUM (
        'SIGNUP_EMAIL_VERIFY',
        'SIGNUP_PROFILE_PHOTO',
        'SIGNUP_VIBE_QUESTIONS',
        'SIGNUP_CLAIM_ID',
        'EVENT_RSVP',
        'GPS_CHECKIN',
        'EVENT_PHOTO_POST',
        'EVENT_HIGH_RATING',
        'PEER_ENDORSEMENT',
        'HOST_EVENT',
        'NO_SHOW_PENALTY',
        'HOST_CANCEL_PENALTY',
        'NEGATIVE_REVIEW_PENALTY',
        'ADMIN_ADJUSTMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Karma Ledger table
CREATE TABLE IF NOT EXISTS karma_ledger (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT            NOT NULL, -- Using email as join key to match frontend patterns
    point_delta     INTEGER         NOT NULL,
    action_type     TEXT            NOT NULL, -- Simplified for compatibility
    reference_id    TEXT,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- 3. Add columns to waitlist table
ALTER TABLE waitlist
    ADD COLUMN IF NOT EXISTS karma_score             INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS inbox_shield_threshold  INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tier_level              INTEGER DEFAULT 0;

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_karma_ledger_email ON karma_ledger (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_karma_score ON waitlist (karma_score DESC);

-- Optional: Enable RLS
ALTER TABLE karma_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON karma_ledger
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON karma_ledger
    FOR INSERT WITH CHECK (true);
