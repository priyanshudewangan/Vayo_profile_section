"""
Admin Events Extension — VAYO
Add these endpoints to your existing admin_router.py

New endpoints:
- GET    /api/v1/admin/events                        — List all events (all statuses, all cities)
- GET    /api/v1/admin/events/stats                  — Platform-wide event stats (updated with new fields)
- GET    /api/v1/admin/events/{event_id}/details     — Full event detail + attendee breakdown
- PATCH  /api/v1/admin/events/{event_id}/feature     — Feature / unfeature an event
- PATCH  /api/v1/admin/events/{event_id}/admin-update — Update event fields (now includes new fields)
- DELETE /api/v1/admin/events/{event_id}/admin-cancel — Hard cancel + notify attendees
- GET    /api/v1/admin/events/export/{event_id}      — Export attendee CSV

Step 1: Add `is_featured BOOLEAN DEFAULT FALSE` column to your events table:
    ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

Step 2: Paste the endpoints below into your existing admin_router.py file,
        below the existing @router.get("/events/stats") block.
"""

import csv
import io
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from database import db_manager
from karma_models import add_karma, KarmaActionType
from notifications_router import create_notification
from event_models import build_share_links

logger = logging.getLogger(__name__)


async def admin_list_events(
    admin_id: str = Query(..., description="Authenticated admin user ID"),
    city: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, description="active | cancelled | completed"),
    category: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    filters = []
    args = []
    idx = 1

    if city:
        filters.append(f"LOWER(e.city) = LOWER(${idx})")
        args.append(city)
        idx += 1

    if status_filter:
        filters.append(f"e.status = ${idx}")
        args.append(status_filter)
        idx += 1

    if category:
        filters.append(f"LOWER(e.category) = LOWER(${idx})")
        args.append(category)
        idx += 1

    if featured_only:
        filters.append("e.is_featured = TRUE")

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    args += [limit, offset]

    rows = await db_manager.fetch(
        f"""
        SELECT
            e.event_id, e.title, e.host_id, u.username AS host_username,
            e.city, e.category, e.interest_tags,
            e.event_date, e.entry_fee, e.max_participants,
            e.status, e.is_featured, e.shareable_slug,
            e.created_at,
            COUNT(ep.user_id) AS total_rsvp,
            COUNT(ep.user_id) FILTER (WHERE ep.attendance_status = TRUE) AS total_checkin
        FROM events e
        JOIN users u ON e.host_id = u.user_id
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        {where}
        GROUP BY e.event_id, u.username
        ORDER BY e.created_at DESC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *args,
    )

    return {
        "events": [dict(r) for r in rows],
        "count": len(rows),
        "offset": offset,
    }


async def admin_event_stats(
    admin_id: str = Query(..., description="Authenticated admin user ID"),
    days: int = Query(30, ge=1, le=365),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    summary = await db_manager.fetchrow(
        """
        SELECT
            COUNT(DISTINCT e.event_id)                                                        AS total_events,
            COUNT(DISTINCT e.event_id) FILTER (WHERE e.status = 'active')                    AS active_events,
            COUNT(DISTINCT e.event_id) FILTER (WHERE e.status = 'cancelled')                 AS cancelled_events,
            COUNT(DISTINCT e.event_id) FILTER (WHERE e.event_date >= NOW())                  AS upcoming_events,
            COUNT(DISTINCT ep.user_id)                                                        AS unique_attendees,
            COALESCE(SUM(ep.attendance_status::int), 0)                                       AS total_checkins,
            COUNT(ep.user_id)                                                                 AS total_rsvps,
            ROUND(
                CASE WHEN COUNT(ep.user_id) > 0
                THEN (SUM(ep.attendance_status::int)::float / COUNT(ep.user_id)) * 100
                ELSE 0 END, 2
            )                                                                                 AS checkin_rate_pct
        FROM events e
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE e.created_at >= NOW() - ($1 || ' days')::INTERVAL
        """,
        days,
    )

    # Top cities by event count
    top_cities = await db_manager.fetch(
        """
        SELECT city, COUNT(*) AS event_count
        FROM events
        WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
        GROUP BY city
        ORDER BY event_count DESC
        LIMIT 5
        """,
        days,
    )

    # Top categories
    top_categories = await db_manager.fetch(
        """
        SELECT category, COUNT(*) AS event_count
        FROM events
        WHERE category IS NOT NULL
          AND created_at >= NOW() - ($1 || ' days')::INTERVAL
        GROUP BY category
        ORDER BY event_count DESC
        LIMIT 5
        """,
        days,
    )

    # Top events by RSVP
    top_events = await db_manager.fetch(
        """
        SELECT
            e.event_id, e.title, e.city, e.event_date,
            u.username AS host_username,
            COUNT(ep.user_id) AS total_rsvp,
            COUNT(ep.user_id) FILTER (WHERE ep.attendance_status = TRUE) AS total_checkin
        FROM events e
        JOIN users u ON e.host_id = u.user_id
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE e.created_at >= NOW() - ($1 || ' days')::INTERVAL
        GROUP BY e.event_id, u.username
        ORDER BY total_rsvp DESC
        LIMIT 10
        """,
        days,
    )

    return {
        "period_days": days,
        "summary": dict(summary),
        "top_cities": [dict(r) for r in top_cities],
        "top_categories": [dict(r) for r in top_categories],
        "top_events_by_rsvp": [dict(r) for r in top_events],
    }


async def admin_event_details(
    event_id: str,
    admin_id: str = Query(..., description="Authenticated admin user ID"),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    event = await db_manager.fetchrow("SELECT * FROM events WHERE event_id = $1", event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    event = dict(event)

    attendees = await db_manager.fetch(
        """
        SELECT
            ep.user_id, u.username, u.karma_score,
            ep.payment_status, ep.attendance_status,
            ep.rsvp_timestamp, ep.checkin_timestamp
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.user_id
        WHERE ep.event_id = $1
        ORDER BY ep.rsvp_timestamp ASC
        """,
        event_id,
    )

    slug = event.get("shareable_slug") or ""
    share_links = build_share_links(event["title"], slug) if slug else {}

    return {
        "event": {**event, "share_links": share_links},
        "attendees": [dict(r) for r in attendees],
        "stats": {
            "total_rsvp": len(attendees),
            "total_checkin": sum(1 for r in attendees if r["attendance_status"]),
            "total_paid": sum(1 for r in attendees if r["payment_status"] == "paid"),
            "total_pending": sum(1 for r in attendees if r["payment_status"] == "pending"),
        },
    }



# @router.patch("/events/{event_id}/feature", summary="Admin: feature or unfeature an event")
async def admin_feature_event(
    event_id: str,
    admin_id: str = Query(..., description="Authenticated admin user ID"),
    featured: bool = Query(..., description="True to feature, False to unfeature"),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    event = await db_manager.fetchrow("SELECT event_id, title, is_featured FROM events WHERE event_id = $1", event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    await db_manager.execute(
        "UPDATE events SET is_featured = $1, updated_at = NOW() WHERE event_id = $2",
        featured, event_id,
    )

    await log_admin_action(
        admin_id, "feature_event" if featured else "unfeature_event",
        "event", event_id,
        f"Admin {'featured' if featured else 'unfeatured'} event",
        {"is_featured": featured},
    )

    return {
        "event_id": event_id,
        "is_featured": featured,
        "message": f"Event {'featured' if featured else 'unfeatured'} successfully.",
    }


class AdminUpdateEventRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    city: Optional[str] = None
    venue: Optional[str] = None
    category: Optional[str] = None
    interest_tags: Optional[list] = None
    min_karma_required: Optional[int] = Field(None, ge=0)
    entry_fee: Optional[int] = Field(None, ge=0)
    max_participants: Optional[int] = Field(None, gt=0)
    status: Optional[str] = Field(None, pattern="^(active|cancelled|completed)$")
    cover_image_url: Optional[str] = None


# @router.patch("/events/{event_id}/admin-update", summary="Admin: update any event field")
async def admin_update_event(
    event_id: str,
    body: AdminUpdateEventRequest,
    admin_id: str = Query(..., description="Authenticated admin user ID"),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    event = await db_manager.fetchrow("SELECT event_id FROM events WHERE event_id = $1", event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Build dynamic update — only fields explicitly provided
    update_data = body.dict(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update.")

    set_clauses = []
    params = []
    for i, (field, value) in enumerate(update_data.items(), start=1):
        set_clauses.append(f"{field} = ${i}")
        params.append(value)

    params.append(event_id)
    await db_manager.execute(
        f"UPDATE events SET {', '.join(set_clauses)}, updated_at = NOW() WHERE event_id = ${len(params)}",
        *params,
    )

    await log_admin_action(
        admin_id, "update_event", "event", event_id,
        "Admin updated event fields",
        {"updated_fields": list(update_data.keys())},
    )

    return {"event_id": event_id, "updated_fields": list(update_data.keys()), "message": "Event updated."}



# @router.delete("/events/{event_id}/admin-cancel", summary="Admin: force cancel event + notify all attendees")
async def admin_cancel_event(
    event_id: str,
    admin_id: str = Query(..., description="Authenticated admin user ID"),
    reason: str = Query(..., min_length=5, description="Reason for cancellation shown to attendees"),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    event = await db_manager.fetchrow("SELECT * FROM events WHERE event_id = $1", event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if event["status"] == "cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is already cancelled.")

    await db_manager.execute(
        "UPDATE events SET status = 'cancelled', updated_at = NOW() WHERE event_id = $1",
        event_id,
    )

    # Notify host
    try:
        await create_notification(
            user_id=event["host_id"],
            actor_id=admin_id,
            type="EVENT_REMINDER",
            title="Your event was cancelled by admin",
            body=f"Your event '{event['title']}' was cancelled. Reason: {reason}",
            reference_id=event_id,
        )
    except Exception as e:
        logger.warning(f"Host cancel notification failed: {e}")

    # Notify all attendees
    attendees = await db_manager.fetch(
        "SELECT user_id FROM event_participants WHERE event_id = $1", event_id
    )
    for row in attendees:
        try:
            await create_notification(
                user_id=row["user_id"],
                actor_id=admin_id,
                type="EVENT_REMINDER",
                title="Event cancelled",
                body=f"'{event['title']}' has been cancelled. Reason: {reason}",
                reference_id=event_id,
            )
        except Exception as e:
            logger.warning(f"Attendee cancel notification failed for {row['user_id']}: {e}")

    await log_admin_action(
        admin_id, "cancel_event", "event", event_id,
        reason, {"attendees_notified": len(attendees)},
    )

    return {
        "event_id": event_id,
        "status": "cancelled",
        "host_notified": True,
        "attendees_notified": len(attendees),
        "message": "Event cancelled. Host and all attendees notified.",
    }


# @router.get("/events/export/{event_id}", summary="Admin: export attendee list as CSV")
async def admin_export_attendees(
    event_id: str,
    admin_id: str = Query(..., description="Authenticated admin user ID"),
):
    if not await is_admin(admin_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    event = await db_manager.fetchrow("SELECT title FROM events WHERE event_id = $1", event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    rows = await db_manager.fetch(
        """
        SELECT
            u.user_id, u.username, u.email, u.karma_score,
            ep.payment_status, ep.attendance_status,
            ep.rsvp_timestamp, ep.checkin_timestamp
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.user_id
        WHERE ep.event_id = $1
        ORDER BY ep.rsvp_timestamp ASC
        """,
        event_id,
    )

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "user_id", "username", "email", "karma_score",
        "payment_status", "attendance_status",
        "rsvp_timestamp", "checkin_timestamp",
    ])
    writer.writeheader()
    for row in rows:
        writer.writerow(dict(row))

    output.seek(0)
    filename = f"attendees_{event_id}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
