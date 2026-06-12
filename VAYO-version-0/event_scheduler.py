"""
Event Scheduler Jobs — VAYO
Two background tasks to add to your existing scheduler.py:

1. event_reminder_job     — Runs every 30 min
                            Sends 24hr reminder notifications to all attendees

2. no_show_penalty_job    — Runs every 30 min
                            Applies NO_SHOW_PENALTY (-20 karma) to users who
                            RSVP'd but never checked in, 2hrs after event ended

How to plug in:
    In your scheduler.py → start_scheduler(), add:
        asyncio.create_task(event_reminder_job())
        asyncio.create_task(no_show_penalty_job())
"""

import asyncio
import logging
import os
from datetime import datetime, timezone

from database import db_manager
from karma_models import add_karma, KarmaActionType
from notifications_router import create_notification

logger = logging.getLogger(__name__)

BASE_URL = os.getenv("VAYO_BASE_URL", "https://vayo.app")


# ----------------------------------------------------------------
# Job 1 — 24hr event reminder
# ----------------------------------------------------------------

async def event_reminder_job():
    """
    Every 30 minutes: find events starting in 20–26 hours that haven't
    had reminders sent yet, notify all confirmed attendees.

    Uses a `reminder_sent` flag on the events table:
        ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;
    """
    while True:
        try:
            await _send_event_reminders()
        except Exception as e:
            logger.error(f"[event_reminder_job] Error: {e}")
        await asyncio.sleep(1800)  # 30 minutes


async def _send_event_reminders():
    # Events starting in 20–26 hours, still active, reminder not yet sent
    upcoming = await db_manager.fetch(
        """
        SELECT event_id, title, city, venue, shareable_slug
        FROM events
        WHERE status     = 'active'
          AND reminder_sent = FALSE
          AND event_date BETWEEN NOW() + INTERVAL '20 hours'
                              AND NOW() + INTERVAL '26 hours'
        """
    )

    if not upcoming:
        return

    for event in upcoming:
        event_id = event["event_id"]
        slug = event.get("shareable_slug") or ""
        event_url = f"{BASE_URL}/events/{slug}" if slug else BASE_URL
        venue_text = f" at {event['venue']}" if event.get("venue") else f" in {event['city']}"

        # Get all attendees who RSVP'd
        attendees = await db_manager.fetch(
            """
            SELECT user_id FROM event_participants
            WHERE event_id = $1
              AND payment_status IN ('paid', 'pending')
            """,
            event_id,
        )

        notified = 0
        for row in attendees:
            try:
                await create_notification(
                    user_id=row["user_id"],
                    type="EVENT_REMINDER",
                    title="Event tomorrow!",
                    body=f"'{event['title']}' is happening tomorrow{venue_text}. See you there!",
                    reference_id=event_id,
                    action_url=event_url,
                )
                notified += 1
            except Exception as e:
                logger.warning(f"[reminder] Notification failed for user {row['user_id']}: {e}")

        # Mark reminder as sent so we don't fire again
        await db_manager.execute(
            "UPDATE events SET reminder_sent = TRUE WHERE event_id = $1",
            event_id,
        )

        logger.info(f"[reminder] Sent {notified} reminders for event '{event['title']}' ({event_id})")


# ----------------------------------------------------------------
# Job 2 — No-show karma penalty
# ----------------------------------------------------------------

async def no_show_penalty_job():
    """
    Every 30 minutes: find events that ended 2+ hours ago.
    Any attendee who RSVP'd (payment_status = paid) but never checked in
    gets NO_SHOW_PENALTY (-20 karma). Runs only once per event via
    `no_show_processed` flag:
        ALTER TABLE events ADD COLUMN IF NOT EXISTS no_show_processed BOOLEAN DEFAULT FALSE;
    """
    while True:
        try:
            await _apply_no_show_penalties()
        except Exception as e:
            logger.error(f"[no_show_penalty_job] Error: {e}")
        await asyncio.sleep(1800)  # 30 minutes


async def _apply_no_show_penalties():
    # Events that ended 2+ hours ago, not yet processed, not cancelled
    ended_events = await db_manager.fetch(
        """
        SELECT event_id, title
        FROM events
        WHERE status            = 'active'
          AND no_show_processed = FALSE
          AND event_date        < NOW() - INTERVAL '2 hours'
        """
    )

    if not ended_events:
        return

    for event in ended_events:
        event_id = event["event_id"]

        # Users who RSVP'd as paid but never checked in
        no_shows = await db_manager.fetch(
            """
            SELECT user_id FROM event_participants
            WHERE event_id         = $1
              AND payment_status   = 'paid'
              AND attendance_status = FALSE
            """,
            event_id,
        )

        penalised = 0
        for row in no_shows:
            try:
                await add_karma(
                    row["user_id"],
                    KarmaActionType.NO_SHOW_PENALTY,
                    reference_id=event_id,
                )
                await create_notification(
                    user_id=row["user_id"],
                    type="KARMA_TIER_UPGRADE",
                    title="No-show penalty applied",
                    body=f"You missed '{event['title']}' without cancelling. -20 karma applied.",
                    reference_id=event_id,
                )
                penalised += 1
            except Exception as e:
                logger.warning(f"[no_show] Penalty failed for user {row['user_id']}: {e}")

        # Mark event as processed so penalty never runs twice
        await db_manager.execute(
            "UPDATE events SET no_show_processed = TRUE WHERE event_id = $1",
            event_id,
        )

        logger.info(
            f"[no_show] Event '{event['title']}' ({event_id}): "
            f"{penalised} penalties applied, {len(no_shows) - penalised} skipped"
        )
