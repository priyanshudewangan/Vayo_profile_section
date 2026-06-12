-- ============================================================
-- VAYO — Events Share Feature Migration
-- Run this on top of your existing events table
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- 1. Add shareable slug (used in vayo.app/events/<slug>)
--    Unique, human-readable, auto-generated from title
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS shareable_slug TEXT UNIQUE;

-- 2. Add interest tags (array — links to user interest matching)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS interest_tags TEXT[] DEFAULT '{}';

-- 3. Add cover image URL (optional, for event page + share preview)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 4. Add venue name (human-readable location e.g. "Koramangala Social, Bangalore")
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS venue TEXT;

-- 5. Add GPS coordinates for check-in feature (carried over from old version)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 6. Add category (e.g. "music", "tech", "sports", "food")
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS category TEXT;

-- ============================================================
-- Indexes for performance
-- ============================================================

-- Slug lookup (used on every public event page load)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug
    ON events (shareable_slug)
    WHERE shareable_slug IS NOT NULL;

-- Interest tag search (GIN index for array contains queries)
CREATE INDEX IF NOT EXISTS idx_events_interest_tags
    ON events USING GIN (interest_tags);

-- Category filter
CREATE INDEX IF NOT EXISTS idx_events_category
    ON events (category)
    WHERE category IS NOT NULL;

-- ============================================================
-- Backfill: generate slugs for any existing events that don't have one
-- Format: <title-kebab-case>-<first 6 chars of event_id>
-- ============================================================
UPDATE events
SET shareable_slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
    )
) || '-' || SUBSTRING(event_id FROM 5 FOR 6)
WHERE shareable_slug IS NULL;

-- ============================================================
-- Scheduler flags (needed for event_scheduler.py)
-- ============================================================

-- Prevents reminder notifications from firing more than once per event
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Prevents no-show penalties from being applied more than once per event
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS no_show_processed BOOLEAN DEFAULT FALSE;
