-- VAYO Database Patch: Fix Events Schema
-- Run this in your Supabase SQL Editor to add missing columns to the 'events' table

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social',
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS interest_tags TEXT[] DEFAULT '{}';

-- Optional: Update host_id constraint if 'admin' is used as a placeholder
-- This allows 'admin' as a host_id even if it's not in the users table yet
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_host_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_host_id_fkey FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE SET DEFAULT;
