-- Schema Fix Migration
-- Adds missing tables and columns identified in code analysis.
-- Run ONCE on existing databases:
--   psql -U postgres -d community_matching -f schema_fix_migration.sql

BEGIN;

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS city                 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS region               TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility   TEXT DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_karma_score     BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_last_seen       BOOLEAN DEFAULT TRUE;

-- 2. Notifications table (used by notifications_router.py)
CREATE TABLE IF NOT EXISTS notifications (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    actor_id        TEXT,
    type            TEXT            NOT NULL,
    title           TEXT            NOT NULL,
    body            TEXT            NOT NULL,
    reference_id    TEXT,
    action_url      TEXT,
    is_read         BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications (user_id, is_read, created_at DESC);

-- 3. Notification preferences table (per-user mute settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id     TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    is_muted    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, type)
);

-- 4. Messages table (referenced by admin_router for content moderation)
CREATE TABLE IF NOT EXISTS messages (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id       TEXT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id     TEXT            REFERENCES users(user_id) ON DELETE CASCADE,
    community_id    TEXT            REFERENCES communities(community_id) ON DELETE CASCADE,
    content         TEXT            NOT NULL,
    is_deleted      BOOLEAN         DEFAULT FALSE,
    created_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender
    ON messages (sender_id, created_at DESC);

COMMIT;

-- Verify new columns
SELECT column_name, data_type, column_default
  FROM information_schema.columns
 WHERE table_name = 'users'
   AND column_name IN ('city', 'region', 'profile_visibility', 'show_karma_score', 'show_last_seen');

-- Verify new tables
SELECT table_name FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_name IN ('notifications', 'notification_preferences', 'messages');
