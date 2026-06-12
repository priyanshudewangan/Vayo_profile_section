-- VAYO Database Unification: Bridge Migration
-- This script creates the advanced social graph schema and migrates data from 'waitlist' to 'users'

BEGIN;

-- 1. Ensure the Karma Action Type Enum exists
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

-- 2. Create the unified 'users' table
-- Note: We include fields from 'waitlist' to make migration seamless
CREATE TABLE IF NOT EXISTS users (
    user_id                 TEXT PRIMARY KEY,
    username                TEXT,
    email                   TEXT UNIQUE,
    phone                   TEXT,
    birthdate               DATE,
    instagram               TEXT,
    interests               TEXT[] DEFAULT '{}',
    selfie_url              TEXT,
    status                  TEXT DEFAULT 'Pending',
    karma_score             INTEGER DEFAULT 0,
    inbox_shield_threshold  INTEGER DEFAULT 0,
    tier_level              INTEGER DEFAULT 0,
    bio                     TEXT,
    profile_visibility      TEXT DEFAULT 'public',
    show_karma_score        BOOLEAN DEFAULT TRUE,
    show_last_seen          BOOLEAN DEFAULT TRUE,
    last_seen               TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the Karma Ledger
CREATE TABLE IF NOT EXISTS karma_ledger (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    point_delta     INTEGER         NOT NULL,
    action_type     karma_action_type_enum NOT NULL,
    reference_id    TEXT,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- 4. Create Karma Trigger Function
CREATE OR REPLACE FUNCTION update_karma_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE users
       SET karma_score = karma_score + NEW.point_delta
     WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_karma_ledger_after_insert ON karma_ledger;
CREATE TRIGGER trg_karma_ledger_after_insert
AFTER INSERT ON karma_ledger
FOR EACH ROW EXECUTE FUNCTION update_karma_score();

-- 5. Create core social and event tables
CREATE TABLE IF NOT EXISTS connections (
    user_id_1 TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS communities (
    community_id TEXT PRIMARY KEY,
    community_name TEXT NOT NULL,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    timezone TEXT NOT NULL,
    member_count INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    host_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_date TIMESTAMPTZ NOT NULL,
    city TEXT NOT NULL,
    min_karma_required INTEGER DEFAULT 0,
    entry_fee INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    whatsapp_group_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    payment_status TEXT DEFAULT 'pending',
    attendance_status BOOLEAN DEFAULT FALSE,
    rsvp_timestamp TIMESTAMPTZ DEFAULT NOW(),
    checkin_timestamp TIMESTAMPTZ,
    PRIMARY KEY (event_id, user_id)
);

-- 6. MIGRATION DATA STEP
-- We migrate existing 'waitlist' entries into 'users'
-- Since waitlist doesn't have a user_id, we use email as the initial user_id
-- This ensures the Python backend can immediately see the users.
INSERT INTO users (user_id, email, phone, birthdate, instagram, interests, selfie_url, status, created_at)
SELECT 
    email as user_id, 
    email, 
    phone, 
    birthdate, 
    instagram, 
    interests, 
    selfie_url, 
    status, 
    created_at
FROM waitlist
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
