-- Base Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id                 TEXT PRIMARY KEY,
    username                TEXT,
    email                   TEXT,
    karma_score             INTEGER DEFAULT 0,
    inbox_shield_threshold  INTEGER DEFAULT 0,
    tier_level              INTEGER DEFAULT 0,
    bio                     TEXT,
    interest_tags           TEXT[] DEFAULT '{}',
    upi_id                  TEXT,
    city                    TEXT,
    region                  TEXT,
    profile_visibility      TEXT DEFAULT 'public',    -- public, connections, hidden
    show_karma_score        BOOLEAN DEFAULT TRUE,
    show_last_seen          BOOLEAN DEFAULT TRUE,
    last_seen               TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Connections Tables (for connections_router.py)
CREATE TABLE IF NOT EXISTS connections (
    user_id_1 TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS follow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS muted_users (
    muter_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    muted_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (muter_id, muted_id)
);

CREATE TABLE IF NOT EXISTS reported_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reported_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    admin_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_by TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    shared_with TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    detail_type TEXT NOT NULL, -- instagram, linkedin, twitter
    detail_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (shared_by, shared_with, detail_type)
);

-- 2. Communities Tables (for celery_tasks.py / matching)
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

CREATE TABLE IF NOT EXISTS community_members (
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    community_id TEXT NOT NULL REFERENCES communities(community_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    auto_joined BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, community_id)
);

-- 3. Events Tables (for admin_router.py / karma system)
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
    status TEXT DEFAULT 'active', -- active, cancelled, completed
    whatsapp_group_link TEXT,    -- Optional WhatsApp group invite link
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id TEXT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    payment_status TEXT DEFAULT 'pending', -- pending, paid
    attendance_status BOOLEAN DEFAULT FALSE,
    rsvp_timestamp TIMESTAMPTZ DEFAULT NOW(),
    checkin_timestamp TIMESTAMPTZ,
    PRIMARY KEY (event_id, user_id)
);

-- 3b. WhatsApp Group Join Requests (admin-approved access)
CREATE TABLE IF NOT EXISTS whatsapp_join_requests (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        TEXT            NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_id         TEXT            NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status          TEXT            DEFAULT 'pending',  -- pending, approved, rejected
    admin_notes     TEXT,
    reviewed_by     TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_event
    ON whatsapp_join_requests (event_id, status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_requests_user
    ON whatsapp_join_requests (user_id, status);

-- 4. Administration Tables (for admin_router.py bans & audit logs)
CREATE TABLE IF NOT EXISTS user_bans (
    ban_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    banned_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    ban_type TEXT NOT NULL, -- temporary, permanent
    duration_days INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lifted_at TIMESTAMPTZ,
    lifted_by TEXT,
    lift_reason TEXT
);

CREATE TABLE IF NOT EXISTS flagged_content (
    flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL, -- message, event, user_profile
    content_id TEXT NOT NULL,
    reporter_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
    admin_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notifications Tables (for notifications_router.py)
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

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id     TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    is_muted    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, type)
);

-- 6. Messages Table (for chat / admin content moderation)
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
