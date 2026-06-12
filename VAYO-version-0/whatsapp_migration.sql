-- WhatsApp Group Join System Migration
-- Run ONCE after users_table.sql:
--   psql -U postgres -d community_matching -f whatsapp_migration.sql

BEGIN;

-- 1. Add WhatsApp group link column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS whatsapp_group_link TEXT;

-- 2. Create WhatsApp join requests table
CREATE TABLE IF NOT EXISTS whatsapp_join_requests (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        TEXT            NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id         TEXT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status          TEXT            DEFAULT 'pending',  -- pending, approved, rejected
    admin_notes     TEXT,
    reviewed_by     TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    UNIQUE (event_id, user_id)      -- One request per user per event
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_event
    ON whatsapp_join_requests (event_id, status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_user
    ON whatsapp_join_requests (user_id, status);

COMMIT;

-- Verify
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'whatsapp_join_requests'
 ORDER BY ordinal_position;

SELECT column_name, data_type
  FROM information_schema.columns
 WHERE table_name = 'events'
   AND column_name = 'whatsapp_group_link';
