"""
Events Router — VAYO
Endpoints:
- POST   /api/v1/events                          — Create event (returns share links instantly)
- GET    /api/v1/events                          — List upcoming events (filter by city/category/tags)
- GET    /api/v1/events/{event_id}               — Get event by ID
- GET    /api/v1/events/slug/{slug}              — Get event by shareable slug (public, no auth)
- POST   /api/v1/events/{event_id}/rsvp          — RSVP to event
- DELETE /api/v1/events/{event_id}/rsvp          — Cancel RSVP
- POST   /api/v1/events/{event_id}/checkin       — GPS check-in (within 200m)
- GET    /api/v1/events/{event_id}/attendees     — Attendee list (host only)
- GET    /api/v1/events/{event_id}/stats         — Event stats (host only)
- PATCH  /api/v1/events/{event_id}/cancel        — Cancel event (host only)
"""

import math
import uuid
import os
import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Query, status

from database import db_manager
from karma_models import add_karma, has_required_karma, KarmaActionType
from notifications_router import create_notification
from event_models import (
    CreateEventRequest,
    CreateEventResponse,
    RSVPRequest,
    RSVPResponse,
    CheckinRequest,
    CheckinResponse,
    EventResponse,
    EventAttendeesResponse,
    EventStatsResponse,
    AttendeeItem,
    ShareLinks,
    generate_slug,
    build_share_links,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/events", tags=["Events"])

CHECKIN_RADIUS_METERS = 200
BASE_URL = os.getenv("VAYO_BASE_URL", "https://vayo.app")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in meters between two GPS coordinates."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def _get_event_or_404(event_id: str) -> dict:
    row = await db_manager.fetchrow("SELECT * FROM events WHERE event_id = $1", event_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event '{event_id}' not found.")
    return dict(row)


async def _get_user_or_404(user_id: str) -> dict:
    row = await db_manager.fetchrow("SELECT user_id, username, karma_score FROM users WHERE user_id = $1", user_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")
    return dict(row)


async def _participant_counts(event_id: str) -> dict:
    row = await db_manager.fetchrow(
        """
        SELECT
            COUNT(*) FILTER (WHERE payment_status IN ('paid', 'pending')) AS total_rsvp,
            COUNT(*) FILTER (WHERE attendance_status = TRUE)              AS total_checked_in,
            COUNT(*) FILTER (WHERE payment_status = 'paid')               AS total_paid,
            COUNT(*) FILTER (WHERE payment_status = 'pending')            AS total_pending
        FROM event_participants
        WHERE event_id = $1
        """,
        event_id,
    )
    return dict(row)


def _build_event_response(event: dict, counts: dict, include_share: bool = True) -> EventResponse:
    slug = event.get("shareable_slug") or ""
    share = ShareLinks(**build_share_links(event["title"], slug, BASE_URL)) if include_share and slug else None
    spots_remaining = None
    if event.get("max_participants"):
        spots_remaining = max(0, event["max_participants"] - counts["total_rsvp"])

    return EventResponse(
        event_id=event["event_id"],
        title=event["title"],
        description=event.get("description"),
        host_id=event["host_id"],
        event_date=event["event_date"],
        city=event["city"],
        venue=event.get("venue"),
        latitude=event.get("latitude"),
        longitude=event.get("longitude"),
        category=event.get("category"),
        interest_tags=event.get("interest_tags") or [],
        min_karma_required=event.get("min_karma_required", 0),
        entry_fee=event.get("entry_fee", 0),
        max_participants=event.get("max_participants"),
        cover_image_url=event.get("cover_image_url"),
        shareable_slug=slug,
        status=event.get("status", "active"),
        participant_count=counts["total_rsvp"],
        checked_in_count=counts["total_checked_in"],
        share_links=share,
        created_at=event["created_at"],
    )


@router.post("", response_model=CreateEventResponse, status_code=status.HTTP_201_CREATED,
             summary="Create event. Returns share links instantly for WhatsApp, Snapchat, Instagram.")
async def create_event(body: CreateEventRequest):
    await _get_user_or_404(body.host_id)

    event_id = f"evt_{uuid.uuid4().hex[:10]}"
    slug = generate_slug(body.title, event_id)

    await db_manager.execute(
        """
        INSERT INTO events (
            event_id, title, description, host_id,
            event_date, city, venue,
            latitude, longitude,
            category, interest_tags,
            min_karma_required, entry_fee, max_participants,
            cover_image_url, shareable_slug, status
        ) VALUES (
            $1,  $2,  $3,  $4,
            $5,  $6,  $7,
            $8,  $9,
            $10, $11,
            $12, $13, $14,
            $15, $16, 'active'
        )
        """,
        event_id, body.title, body.description, body.host_id,
        body.event_date, body.city, body.venue,
        body.latitude, body.longitude,
        body.category, body.interest_tags,
        body.min_karma_required, body.entry_fee, body.max_participants,
        body.cover_image_url, slug,
    )

    await add_karma(body.host_id, KarmaActionType.HOST_EVENT, reference_id=event_id)

    share_links = ShareLinks(**build_share_links(body.title, slug, BASE_URL))

    return CreateEventResponse(
        event_id=event_id,
        title=body.title,
        host_id=body.host_id,
        shareable_slug=slug,
        share_links=share_links,
        message="Event created. HOST_EVENT karma awarded. Share links ready!",
    )


@router.get("", summary="List upcoming events. Filter by city, category, interest tags.")
async def list_events(
    city: Optional[str] = Query(None, description="Filter by city"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tags: Optional[List[str]] = Query(None, description="Filter by interest tags (any match)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    filters = ["event_date >= NOW()", "status = 'active'"]
    args = []
    idx = 1

    if city:
        filters.append(f"LOWER(city) = LOWER(${idx})")
        args.append(city)
        idx += 1

    if category:
        filters.append(f"LOWER(category) = LOWER(${idx})")
        args.append(category)
        idx += 1

    if tags:
        filters.append(f"interest_tags && ${idx}::text[]")
        args.append(tags)
        idx += 1

    where = " AND ".join(filters)
    args += [limit, offset]

    rows = await db_manager.fetch(
        f"""
        SELECT
            e.*,
            COUNT(ep.user_id) FILTER (WHERE ep.payment_status IN ('paid','pending')) AS participant_count
        FROM events e
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE {where}
        GROUP BY e.event_id
        ORDER BY e.event_date ASC
        LIMIT ${idx} OFFSET ${idx + 1}
        """,
        *args,
    )

    events = []
    for r in rows:
        d = dict(r)
        counts = {"total_rsvp": d.pop("participant_count", 0), "total_checked_in": 0, "total_paid": 0, "total_pending": 0}
        events.append(_build_event_response(d, counts, include_share=False))

    return {"events": events, "count": len(events), "offset": offset}


@router.get("/slug/{slug}", response_model=EventResponse,
            summary="Get event by shareable slug. Public — anyone with the link can view.")
async def get_event_by_slug(slug: str):
    row = await db_manager.fetchrow("SELECT * FROM events WHERE shareable_slug = $1", slug)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with slug '{slug}' not found.")

    event = dict(row)
    counts = await _participant_counts(event["event_id"])
    return _build_event_response(event, counts)


@router.get("/user/{user_id}", summary="Get all events a user has RSVP'd to.")
async def get_user_rsvps(user_id: str):
    await _get_user_or_404(user_id)

    rows = await db_manager.fetch(
        """
        SELECT 
            e.*,
            ep.payment_status,
            ep.attendance_status,
            ep.rsvp_timestamp,
            (SELECT COUNT(*) FROM event_participants ep2 WHERE ep2.event_id = e.event_id) as participant_count
        FROM events e
        JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE ep.user_id = $1
        ORDER BY e.event_date ASC
        """,
        user_id
    )

    events = []
    for r in rows:
        d = dict(r)
        # We don't use all the counts here to keep it simple for the profile view
        counts = {
            "total_rsvp": d.pop("participant_count", 0), 
            "total_checked_in": 0, 
            "total_paid": 0, 
            "total_pending": 0
        }
        events.append(_build_event_response(d, counts, include_share=True))

    return {"events": events, "count": len(events)}


@router.get("/{event_id}", response_model=EventResponse, summary="Get event by ID.")
async def get_event(event_id: str):
    event = await _get_event_or_404(event_id)
    counts = await _participant_counts(event_id)
    return _build_event_response(event, counts)



@router.post("/{event_id}/rsvp", response_model=RSVPResponse,
             summary="RSVP to event. Blocked if karma too low or event full.")
async def rsvp_event(event_id: str, body: RSVPRequest):
    event = await _get_event_or_404(event_id)
    await _get_user_or_404(body.user_id)

    if event.get("status") != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is no longer active.")

    # Karma gate
    if event.get("min_karma_required", 0) > 0:
        if not await has_required_karma(body.user_id, event["min_karma_required"]):
            user = await db_manager.fetchrow("SELECT karma_score FROM users WHERE user_id = $1", body.user_id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough karma. Required: {event['min_karma_required']}, you have: {user['karma_score']}.",
            )

    # Capacity check
    if event.get("max_participants"):
        counts = await _participant_counts(event_id)
        if counts["total_rsvp"] >= event["max_participants"]:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event is fully booked.")

    # Duplicate check
    existing = await db_manager.fetchrow(
        "SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2",
        event_id, body.user_id,
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already RSVP'd to this event.")

    payment_status = "pending" if event.get("entry_fee", 0) > 0 else "paid"

    await db_manager.execute(
        "INSERT INTO event_participants (event_id, user_id, payment_status) VALUES ($1, $2, $3)",
        event_id, body.user_id, payment_status,
    )

    await add_karma(body.user_id, KarmaActionType.EVENT_RSVP, reference_id=event_id)

    counts = await _participant_counts(event_id)

    # Notify host
    try:
        attendee = await db_manager.fetchrow("SELECT username FROM users WHERE user_id = $1", body.user_id)
        name = attendee["username"] if attendee else body.user_id
        await create_notification(
            user_id=event["host_id"],
            actor_id=body.user_id,
            type="EVENT_MATCH",
            title="New RSVP",
            body=f"@{name} RSVP'd to your event '{event['title']}'",
            reference_id=event_id,
        )
    except Exception as e:
        logger.warning(f"RSVP notification failed for event {event_id}: {e}")

    return RSVPResponse(
        event_id=event_id,
        user_id=body.user_id,
        payment_status=payment_status,
        participant_count=counts["total_rsvp"],
        message="RSVP successful. EVENT_RSVP karma awarded.",
    )


@router.delete("/{event_id}/rsvp", status_code=status.HTTP_200_OK,
               summary="Cancel your RSVP. Only allowed before event starts.")
async def cancel_rsvp(event_id: str, user_id: str = Query(..., description="User cancelling their RSVP")):
    event = await _get_event_or_404(event_id)

    from datetime import datetime, timezone
    if event["event_date"].replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel RSVP after event has started.")

    existing = await db_manager.fetchrow(
        "SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2",
        event_id, user_id,
    )
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No RSVP found to cancel.")

    await db_manager.execute(
        "DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2",
        event_id, user_id,
    )

    return {"event_id": event_id, "user_id": user_id, "message": "RSVP cancelled successfully."}



@router.post("/{event_id}/checkin", response_model=CheckinResponse,
             summary="GPS check-in. Must be within 200m of event. Awards GPS_CHECKIN karma.")
async def checkin_event(event_id: str, body: CheckinRequest):
    event = await _get_event_or_404(event_id)

    if event.get("latitude") is None or event.get("longitude") is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event has no GPS location. Check-in unavailable.")

    participant = await db_manager.fetchrow(
        "SELECT attendance_status FROM event_participants WHERE event_id = $1 AND user_id = $2",
        event_id, body.user_id,
    )
    if participant is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You must RSVP before checking in.")
    if participant["attendance_status"]:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already checked in.")

    distance = haversine_distance(body.latitude, body.longitude, event["latitude"], event["longitude"])
    if distance > CHECKIN_RADIUS_METERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too far from event. You are {round(distance)}m away, must be within {CHECKIN_RADIUS_METERS}m.",
        )

    await db_manager.execute(
        """
        UPDATE event_participants
        SET attendance_status = TRUE, checkin_timestamp = NOW()
        WHERE event_id = $1 AND user_id = $2
        """,
        event_id, body.user_id,
    )

    await add_karma(body.user_id, KarmaActionType.GPS_CHECKIN, reference_id=event_id)

    return CheckinResponse(
        event_id=event_id,
        user_id=body.user_id,
        distance_meters=round(distance),
        checked_in=True,
        message="Check-in successful. GPS_CHECKIN karma awarded.",
    )


@router.get("/{event_id}/attendees", response_model=EventAttendeesResponse,
            summary="Get attendee list. Pass host_id to verify ownership.")
async def get_attendees(event_id: str, host_id: str = Query(..., description="Must match the event host")):
    event = await _get_event_or_404(event_id)

    if event["host_id"] != host_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the event host can view attendees.")

    rows = await db_manager.fetch(
        """
        SELECT
            ep.user_id, u.username,
            ep.payment_status, ep.attendance_status, ep.rsvp_timestamp
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.user_id
        WHERE ep.event_id = $1
        ORDER BY ep.rsvp_timestamp ASC
        """,
        event_id,
    )

    attendees = [AttendeeItem(**dict(r)) for r in rows]
    counts = await _participant_counts(event_id)

    return EventAttendeesResponse(
        event_id=event_id,
        total_rsvp=counts["total_rsvp"],
        total_checked_in=counts["total_checked_in"],
        attendees=attendees,
    )



@router.get("/{event_id}/stats", response_model=EventStatsResponse,
            summary="Quick stats for host dashboard.")
async def get_event_stats(event_id: str, host_id: str = Query(..., description="Must match the event host")):
    event = await _get_event_or_404(event_id)

    if event["host_id"] != host_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the event host can view stats.")

    counts = await _participant_counts(event_id)
    spots_remaining = None
    if event.get("max_participants"):
        spots_remaining = max(0, event["max_participants"] - counts["total_rsvp"])

    return EventStatsResponse(
        event_id=event_id,
        title=event["title"],
        total_rsvp=counts["total_rsvp"],
        total_checked_in=counts["total_checked_in"],
        total_paid=counts["total_paid"],
        total_pending_payment=counts["total_pending"],
        spots_remaining=spots_remaining,
    )



@router.patch("/{event_id}/cancel", status_code=status.HTTP_200_OK,
              summary="Cancel event. Notifies all attendees. Applies HOST_CANCEL_PENALTY karma.")
async def cancel_event(event_id: str, host_id: str = Query(..., description="Must match the event host")):
    event = await _get_event_or_404(event_id)

    if event["host_id"] != host_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the event host can cancel this event.")

    if event.get("status") == "cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is already cancelled.")

    await db_manager.execute(
        "UPDATE events SET status = 'cancelled', updated_at = NOW() WHERE event_id = $1",
        event_id,
    )

    await add_karma(host_id, KarmaActionType.HOST_CANCEL_PENALTY, reference_id=event_id)

    # Notify all attendees
    attendee_rows = await db_manager.fetch(
        "SELECT user_id FROM event_participants WHERE event_id = $1",
        event_id,
    )
    for row in attendee_rows:
        try:
            await create_notification(
                user_id=row["user_id"],
                actor_id=host_id,
                type="EVENT_REMINDER",
                title="Event cancelled",
                body=f"'{event['title']}' has been cancelled by the host.",
                reference_id=event_id,
            )
        except Exception as e:
            logger.warning(f"Cancel notification failed for user {row['user_id']}: {e}")

    return {
        "event_id": event_id,
        "status": "cancelled",
        "attendees_notified": len(attendee_rows),
        "message": "Event cancelled. HOST_CANCEL_PENALTY karma applied. Attendees notified.",
    }
