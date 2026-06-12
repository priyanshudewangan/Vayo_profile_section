"""
Notifications Router — Karma Ping + Vibe Alert
Merged best of team version + our version.

Features:
- actor_id — who triggered the notification (from team)
- title + body — frontend displays directly (from ours)
- unread_count — returned in GET (from ours)
- unread_only filter — GET ?unread_only=true (from ours)
- delete endpoint (from ours)
- graceful Redis fallback (from ours)
- response_model validation (from team)
- notification preferences / mute per type (NEW)
- deduplication — suppresses duplicate notifications within a time window (NEW)

Notification Types:
- CONNECT_REQUEST     → Karma Ping — someone sent you a Karma Connect request
- CONNECT_ACCEPTED    → Karma Ping — your Karma Connect request was accepted
- CONNECT_DECLINED    → Karma Ping — your Karma Connect request was declined
- MESSAGE_RECEIVED    → Karma Ping — you received a new message
- PEER_ENDORSEMENT    → Karma Ping — someone endorsed you (+25 karma)
- KARMA_TIER_UPGRADE  → Vibe Alert — you leveled up to a new tier
- EVENT_MATCH         → Vibe Alert — a new event matches your interests
- EVENT_REMINDER      → Vibe Alert — your event is starting soon

Real-time:
- Published to Redis channel notif_{user_id}
- WebSocket delivers instantly if user is online
- Falls back to DB if user is offline

Preferences:
- Per-user, per-type mute settings stored in notification_preferences table
- Muted types are silently suppressed in create_notification()
- GET  /api/v1/notifications/preferences/{user_id}   — fetch all preferences
- PATCH /api/v1/notifications/preferences/{user_id}  — mute or unmute a type

Deduplication:
- Suppresses duplicate (user_id + type + actor_id + reference_id) within DEDUP_WINDOW_SECONDS
- Guards against double-clicks, network retries, and race conditions
- Configurable via DEDUP_WINDOW_SECONDS constant (default: 30s)

DB Schema (run once):
    CREATE TABLE notification_preferences (
        user_id     TEXT NOT NULL,
        type        TEXT NOT NULL,
        is_muted    BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (user_id, type)
    );

    -- Optional notification deep link support
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

Endpoints:
- POST   /api/v1/notifications/send                          — Send a notification (internal)
- GET    /api/v1/notifications/{user_id}                     — Get all notifications
- PATCH  /api/v1/notifications/{id}/read                     — Mark one as read
- PATCH  /api/v1/notifications/user/{user_id}/read-all       — Mark all as read
- DELETE /api/v1/notifications/{id}                          — Delete a notification
- GET    /api/v1/notifications/preferences/{user_id}         — Get notification preferences
- PATCH  /api/v1/notifications/preferences/{user_id}         — Update a notification preference
"""

import json
import logging
import os
from typing import List, Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from database import db_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


_redis_client = None
_notifications_action_url_ensured = False


DEDUP_WINDOW_SECONDS = 30


async def get_redis():
    global _redis_client
    if _redis_client is None:
        redis_url = os.getenv("REDIS_BROKER_URL", "redis://localhost:6379/0")
        _redis_client = await aioredis.from_url(
            redis_url, encoding="utf-8", decode_responses=True
        )
    return _redis_client


async def ensure_action_url_column():
    global _notifications_action_url_ensured
    if _notifications_action_url_ensured:
        return

    try:
        async with db_manager.pg_pool.acquire() as conn:
            await conn.execute(
                "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT"
            )
        _notifications_action_url_ensured = True
    except Exception as e:
        logger.warning(
            f"Unable to ensure notifications.action_url column exists: {e}"
        )
       

NOTIFICATION_TYPES = [
    "CONNECT_REQUEST",          # Karma Ping
    "CONNECT_ACCEPTED",         # Karma Ping
    "SIMILAR_INTEREST_MATCH",
    "CONNECT_DECLINED",         # Karma Ping
    "MESSAGE_RECEIVED",         # Karma Ping
    "PEER_ENDORSEMENT",         # Karma Ping
    "KARMA_TIER_UPGRADE",       # Vibe Alert
    "EVENT_MATCH",              # Vibe Alert
    "EVENT_REMINDER",           # Vibe Alert
    "WHATSAPP_JOIN_REQUEST",    # Karma Ping — someone wants to join WhatsApp group
    "WHATSAPP_JOIN_APPROVED",   # Karma Ping — your WhatsApp join request was approved
    "WHATSAPP_JOIN_REJECTED",   # Karma Ping — your WhatsApp join request was rejected
    "SYSTEM_ANNOUNCEMENT",      # Vibe Alert — system-wide broadcast from admin
]

KARMA_PING_TYPES = {
    "CONNECT_REQUEST",
    "CONNECT_ACCEPTED",
    "CONNECT_DECLINED",
    "MESSAGE_RECEIVED",
    "PEER_ENDORSEMENT",
    "WHATSAPP_JOIN_REQUEST",
    "WHATSAPP_JOIN_APPROVED",
    "WHATSAPP_JOIN_REJECTED",
}

VIBE_ALERT_TYPES = {
    "KARMA_TIER_UPGRADE",
    "EVENT_MATCH",
    "SIMILAR_INTEREST_MATCH",
    "EVENT_REMINDER",
    "SYSTEM_ANNOUNCEMENT",
}



class SendNotificationRequest(BaseModel):
    user_id: str
    actor_id: Optional[str] = None
    type: str
    title: str = Field(..., min_length=1, max_length=100)
    body: str = Field(..., min_length=1, max_length=500)
    reference_id: Optional[str] = None
    action_url: Optional[str] = Field(
        None,
        description="Optional deep link or action URL for the notification",
        max_length=500,
    )


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    actor_id: Optional[str]
    type: str
    title: str
    body: str
    reference_id: Optional[str]
    action_url: Optional[str] = None
    is_read: bool
    created_at: str


class NotificationPreferenceUpdate(BaseModel):
    type: str = Field(..., description="Notification type to update, e.g. 'PEER_ENDORSEMENT'")
    is_muted: bool = Field(..., description="True to mute this notification type, False to unmute")



async def create_notification(
    user_id: str,
    type: str,
    title: str,
    body: str,
    actor_id: Optional[str] = None,
    reference_id: Optional[str] = None,
    action_url: Optional[str] = None,
):
    """
    Creates a notification in DB and publishes to Redis for real-time delivery.
    Called internally by chat_router, connections_router, karma_router etc.

    Guards (in order):
      1. Type validation  — unknown types are dropped immediately.
      2. Mute check       — if the user has muted this type, the notification
                            is silently suppressed (no DB write, no Redis push).
      3. Deduplication    — if an identical notification (same user_id, type,
                            actor_id, reference_id) was created within
                            DEDUP_WINDOW_SECONDS the duplicate is suppressed.
      4. Persist + push   — notification is written to the DB and published to
                            Redis for real-time WebSocket delivery.

    Usage examples:

    # New message
    await create_notification(
        user_id=receiver_id,
        actor_id=sender_id,
        type="MESSAGE_RECEIVED",
        title="New Karma Ping",
        body=f"@{sender_username} sent you a message",
        reference_id=message_id
    )

    # Karma Connect request
    await create_notification(
        user_id=receiver_id,
        actor_id=sender_id,
        type="CONNECT_REQUEST",
        title="New Karma Connect Request",
        body=f"@{sender_username} wants to Karma Connect with you",
        reference_id=request_id
    )

    # Tier upgrade
    await create_notification(
        user_id=user_id,
        type="KARMA_TIER_UPGRADE",
        title="Vibe Alert — Level Up!",
        body=f"You have reached {new_tier}! New features unlocked.",
    )
    """


    if type not in NOTIFICATION_TYPES:
        logger.warning(f"Invalid notification type: {type}")
        return None


    is_muted = await db_manager.fetchval(
        """
        SELECT is_muted
        FROM notification_preferences
        WHERE user_id = $1 AND type = $2
        """,
        user_id, type
    )
    if is_muted:
        logger.info(
            f"Notification suppressed — user {user_id} has muted type '{type}'"
        )
        return None


    duplicate = await db_manager.fetchrow(
        """
        SELECT id
        FROM notifications
        WHERE user_id        = $1
          AND type           = $2
          AND actor_id       IS NOT DISTINCT FROM $3
          AND reference_id   IS NOT DISTINCT FROM $4
          AND created_at     > NOW() - ($5 || ' seconds')::INTERVAL
        LIMIT 1
        """,
        user_id, type, actor_id, reference_id, str(DEDUP_WINDOW_SECONDS)
    )
    if duplicate:
        logger.info(
            f"Duplicate notification suppressed for user {user_id}, "
            f"type '{type}', existing id={duplicate['id']}"
        )
        return None


    await ensure_action_url_column()
    row = await db_manager.fetchrow(
        """
        INSERT INTO notifications (user_id, actor_id, type, title, body, reference_id, action_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
        """,
        user_id, actor_id, type, title, body, reference_id, action_url
    )

    notification = {
        "id": str(row["id"]),
        "user_id": user_id,
        "actor_id": actor_id,
        "type": type,
        "title": title,
        "body": body,
        "reference_id": reference_id,
        "action_url": action_url,
        "is_read": False,
        "created_at": row["created_at"].isoformat(),
    }


    try:
        rc = await get_redis()
        await rc.publish(f"notifications_{user_id}", json.dumps(notification))
        logger.info(f"Notification pushed to notifications_{user_id}: {title}")
    except Exception as e:
        logger.error(f"Redis push failed: {e} — notification saved to DB only")

    return notification



@router.post(
    "/send",
    status_code=status.HTTP_201_CREATED,
    summary="Send a notification — Karma Ping or Vibe Alert",
)
async def send_notification(body: SendNotificationRequest):
    """
    Send a notification to a user.
    Saved to DB + delivered in real time via Redis WebSocket.

    Respects mute preferences and deduplication — a 201 response does NOT
    guarantee a notification was created; it means the request was valid and
    processed.  Check the returned `suppressed` field to know if it was
    silently dropped.
    """

    if body.type not in NOTIFICATION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type '{body.type}'. Valid types: {NOTIFICATION_TYPES}"
        )

    user = await db_manager.fetchrow(
        "SELECT user_id FROM users WHERE user_id = $1", body.user_id
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{body.user_id}' not found."
        )

    notification = await create_notification(
        user_id=body.user_id,
        actor_id=body.actor_id,
        type=body.type,
        title=body.title,
        body=body.body,
        reference_id=body.reference_id,
        action_url=body.action_url,
    )


    if notification is None:
        return {
            "suppressed": True,
            "reason": "Notification was suppressed due to user mute preference or deduplication.",
            "user_id": body.user_id,
            "type": body.type,
        }

    response_payload = {
        "suppressed": False,
        "notification_id": notification["id"],
        "user_id": body.user_id,
        "type": body.type,
        "title": body.title,
        "created_at": notification["created_at"],
    }
    if body.action_url is not None:
        response_payload["action_url"] = body.action_url

    return response_payload



@router.get(
    "/{user_id}",
    response_model=None,
    summary="Get all notifications for a user",
)
async def get_notifications(
    user_id: str,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
):
    """
    Returns notifications for a user ordered newest first.
    Pass ?unread_only=true to get only unread notifications.
    """

    query = """
        SELECT id, user_id, actor_id, type, title, body, reference_id, action_url, is_read, created_at
        FROM notifications
        WHERE user_id = $1
    """
    if unread_only:
        query += " AND is_read = FALSE"
    query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"

    rows = await db_manager.fetch(query, user_id, limit, offset)

    unread_count = await db_manager.fetchval(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE",
        user_id
    )

    notifications = []
    for r in rows:
        n = dict(r)
        n["id"] = str(n["id"])
        n["created_at"] = n["created_at"].isoformat()
        notifications.append(n)

    return {
        "user_id": user_id,
        "total": len(notifications),
        "unread_count": unread_count,
        "notifications": notifications,
    }


@router.patch(
    "/{notification_id}/read",
    summary="Mark a single notification as read",
)
async def mark_notification_read(notification_id: str):
    result = await db_manager.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = $1",
        notification_id
    )

    if result == "UPDATE 0":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    return {"notification_id": notification_id, "is_read": True, "message": "Notification marked as read."}



@router.patch(
    "/user/{user_id}/read-all",
    summary="Mark all notifications as read for a user",
)
async def mark_all_notifications_read(user_id: str):
    result = await db_manager.execute(
        "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
        user_id
    )

    updated = int(result.split()[-1]) if result else 0

    return {
        "user_id": user_id,
        "marked_read": updated,
        "message": f"{updated} notification(s) marked as read.",
    }



@router.delete(
    "/{notification_id}",
    summary="Delete a notification",
)
async def delete_notification(notification_id: str):
    result = await db_manager.execute(
        "DELETE FROM notifications WHERE id = $1",
        notification_id
    )

    if result == "DELETE 0":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    return {"notification_id": notification_id, "message": "Notification deleted."}



@router.get(
    "/preferences/{user_id}",
    summary="Get notification preferences for a user",
)
async def get_notification_preferences(user_id: str):
    """
    Returns the mute preference for every notification type.

    Types that the user has never explicitly configured are returned with
    is_muted=False (the default — notifications are on).

    Example response:
    {
        "user_id": "abc123",
        "preferences": [
            {"type": "CONNECT_REQUEST",   "is_muted": false},
            {"type": "PEER_ENDORSEMENT",  "is_muted": true},
            ...
        ]
    }
    """
    rows = await db_manager.fetch(
        """
        SELECT type, is_muted
        FROM notification_preferences
        WHERE user_id = $1
        """,
        user_id
    )


    saved = {r["type"]: r["is_muted"] for r in rows}

    preferences = [
        {"type": t, "is_muted": saved.get(t, False)}
        for t in NOTIFICATION_TYPES
    ]

    return {
        "user_id": user_id,
        "preferences": preferences,
    }


@router.patch(
    "/preferences/{user_id}",
    summary="Mute or unmute a notification type for a user",
)
async def update_notification_preference(
    user_id: str,
    pref: NotificationPreferenceUpdate,
):
    """
    Mute or unmute a specific notification type for a user.

    Uses an upsert so the first call creates the row and subsequent calls
    update it.  Muting a type means create_notification() will silently
    skip it — no DB row, no Redis push.

    Example request body:
    { "type": "EVENT_MATCH", "is_muted": true }
    """
    if pref.type not in NOTIFICATION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type '{pref.type}'. Valid types: {NOTIFICATION_TYPES}"
        )

    await db_manager.execute(
        """
        INSERT INTO notification_preferences (user_id, type, is_muted)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, type)
        DO UPDATE SET is_muted = EXCLUDED.is_muted
        """,
        user_id, pref.type, pref.is_muted
    )

    action = "muted" if pref.is_muted else "unmuted"
    logger.info(f"User {user_id} {action} notification type '{pref.type}'")

    return {
        "user_id": user_id,
        "type": pref.type,
        "is_muted": pref.is_muted,
        "message": f"Notifications of type '{pref.type}' {action} for user {user_id}.",
    }
