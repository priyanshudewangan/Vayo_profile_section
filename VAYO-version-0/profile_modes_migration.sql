-- ============================================================
-- VAYO Migration: Profile Modes, Verification Flags,
--                 Moments Table, Community Mode Tagging
-- Run this against your existing PostgreSQL database.
-- All statements are safe to re-run (IF NOT EXISTS / DO NOTHING).
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. PROFILE MODE COLUMNS  (users table)
-- ────────────────────────────────────────────────────────────

-- active_mode drives which bio/persona the frontend renders.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS active_mode   TEXT    DEFAULT 'social'
        CHECK (active_mode IN ('social', 'bff', 'bizz'));

-- Per-mode bios (social re-uses existing `bio` column).
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS social_bio    TEXT,
    ADD COLUMN IF NOT EXISTS bff_bio       TEXT,
    ADD COLUMN IF NOT EXISTS bizz_bio      TEXT;

-- Bizz-mode professional fields.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS bizz_role     TEXT,
    ADD COLUMN IF NOT EXISTS bizz_company  TEXT;

-- Back-fill: copy existing bio → social_bio for current users.
UPDATE users
SET social_bio = bio
WHERE social_bio IS NULL
  AND bio IS NOT NULL;


-- ────────────────────────────────────────────────────────────
-- 2. VERIFICATION FLAGS  (users table)
-- ────────────────────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS selfie_verified  BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bizz_verified    BOOLEAN DEFAULT FALSE;


-- ────────────────────────────────────────────────────────────
-- 3. MOMENTS TABLE  (user photos per event / free-form)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS moments (
    moment_id    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      TEXT         NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
    -- event_id is optional — moments can be standalone or event-linked
    event_id     TEXT         REFERENCES events(event_id)         ON DELETE SET NULL,
    image_url    TEXT         NOT NULL,
    caption      TEXT,
    location_tag TEXT,                     -- free-form city / venue string
    mode         TEXT         DEFAULT 'social'
                     CHECK (mode IN ('social', 'bff', 'bizz')),
    is_deleted   BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moments_user
    ON moments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_moments_event
    ON moments (event_id, created_at DESC)
    WHERE event_id IS NOT NULL;


-- ────────────────────────────────────────────────────────────
-- 4. COMMUNITY MODE TAGGING
-- ────────────────────────────────────────────────────────────

-- Tag each community with the mode it belongs to.
ALTER TABLE communities
    ADD COLUMN IF NOT EXISTS mode  TEXT  DEFAULT 'social'
        CHECK (mode IN ('social', 'bff', 'bizz'));

-- Tag each membership row too — a user may join the same community
-- from different modes in theory, but more importantly the frontend
-- can filter "my BFF squads" vs "my social communities" cheaply.
ALTER TABLE community_members
    ADD COLUMN IF NOT EXISTS mode  TEXT  DEFAULT 'social'
        CHECK (mode IN ('social', 'bff', 'bizz'));

-- Index for fast per-mode filtering on both tables.
CREATE INDEX IF NOT EXISTS idx_communities_mode
    ON communities (mode, is_active);

CREATE INDEX IF NOT EXISTS idx_community_members_mode
    ON community_members (user_id, mode);
