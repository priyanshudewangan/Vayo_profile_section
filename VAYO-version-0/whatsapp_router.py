"""
WhatsApp Group Join Router — Secure Admin-Approved Access

Flow:
1. Admin attaches a WhatsApp group link to an event (via admin_router)
2. Any authenticated user can REQUEST to join
3. Admin reviews and approves/rejects each request
4. Only approved users can retrieve the actual WhatsApp link

Security:
- Banned users are blocked from requesting
- WhatsApp link is NEVER exposed until admin approves
- Duplicate requests are prevented (UNIQUE constraint)
- Admin endpoints protected by get_current_admin dependency

Notifications triggered:
- WHATSAPP_JOIN_REQUEST   → Karma Ping to event host
- WHATSAPP_JOIN_APPROVED  → Karma Ping to requesting user
- WHATSAPP_JOIN_REJECTED  → Karma Ping to requesting user

Endpoints:
- POST   /api/v1/whatsapp/{event_id}/request              — Request to join
- GET    /api/v1/whatsapp/{event_id}/status                — Check own request status
- GET    /api/v1/whatsapp/{event_id}/link                  — Get link (approved only)
- GET    /api/v1/whatsapp/admin/{event_id}/requests        — Admin: list all requests
- PATCH  /api/v1/whatsapp/admin/requests/{request_id}/approve  — Admin: approve
- PATCH  /api/v1/whatsapp/admin/requests/{request_id}/reject   — Admin: reject
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Query, Depends
from pydantic import BaseModel, Field

from database import db_manager
from auth import get_current_user, get_current_admin
from notifications_router import create_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/whatsapp", tags=["WhatsApp Group"])


# ─── Request/Response Schemas ────────────────────────────────────────

class WhatsAppJoinRequestBody(BaseModel):
    """Body for requesting to join a WhatsApp group."""
    message: Optional[str] = Field(
        None,
        max_length=300,
        description="Optional message to admin explaining why you want to join"
    )


class AdminReviewBody(BaseModel):
    """Body for admin approve/reject actions."""
    admin_notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional admin notes for the review"
    )


# ─── Helper Functions ────────────────────────────────────────────────

async def _get_event_with_whatsapp(event_id: str) -> dict:
    """Fetch an event and verify it has a WhatsApp group link."""
    event = await db_manager.fetchrow(
        "SELECT event_id, title, host_id, whatsapp_group_link, status FROM events WHERE event_id = $1",
        event_id
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )
    if not event["whatsapp_group_link"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event does not have a WhatsApp group link."
        )
    if event["status"] == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event has been cancelled."
        )
    return dict(event)


async def _is_user_banned(user_id: str) -> bool:
    """Check if user has an active ban."""
    ban = await db_manager.fetchrow(
        """
        SELECT ban_id FROM user_bans
        WHERE user_id = $1 AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
        """,
        user_id
    )
    return ban is not None


# ─── User Endpoints ─────────────────────────────────────────────────

@router.post(
    "/{event_id}/request",
    status_code=status.HTTP_201_CREATED,
    summary="Request to join an event's WhatsApp group",
)
async def request_whatsapp_join(
    event_id: str,
    body: WhatsAppJoinRequestBody = None,
    current_user: dict = Depends(get_current_user),
):
    """
    Submit a request to join the WhatsApp group for an event.
    The request will be reviewed by an admin before access is granted.
    """
    user_id = current_user["sub"]

    # 1. Check if user is banned
    if await _is_user_banned(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently suspended. You cannot request to join groups."
        )

    # 2. Verify event exists and has a WhatsApp link
    event = await _get_event_with_whatsapp(event_id)

    # 3. Check for existing request (UNIQUE constraint will also catch this)
    existing = await db_manager.fetchrow(
        "SELECT id, status FROM whatsapp_join_requests WHERE event_id = $1 AND user_id = $2",
        event_id, user_id
    )
    if existing:
        if existing["status"] == "pending":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have a pending request for this group."
            )
        if existing["status"] == "approved":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already approved! Use GET /api/v1/whatsapp/{event_id}/link to get the link."
            )
        if existing["status"] == "rejected":
            # Allow re-requesting after rejection — reset to pending
            await db_manager.execute(
                """
                UPDATE whatsapp_join_requests
                SET status = 'pending', admin_notes = NULL, reviewed_by = NULL, reviewed_at = NULL, created_at = NOW()
                WHERE id = $1
                """,
                existing["id"]
            )
            logger.info(f"User {user_id} re-requested WhatsApp join for event {event_id}")
            return {
                "message": "Your request has been re-submitted for admin review.",
                "request_id": str(existing["id"]),
                "event_id": event_id,
                "status": "pending",
            }

    # 4. Create new request
    row = await db_manager.fetchrow(
        """
        INSERT INTO whatsapp_join_requests (event_id, user_id)
        VALUES ($1, $2)
        RETURNING id, created_at
        """,
        event_id, user_id
    )

    request_id = str(row["id"])

    # 5. Notify event host
    try:
        user_row = await db_manager.fetchrow(
            "SELECT username FROM users WHERE user_id = $1", user_id
        )
        username = user_row["username"] if user_row else user_id

        await create_notification(
            user_id=event["host_id"],
            actor_id=user_id,
            type="WHATSAPP_JOIN_REQUEST",
            title="WhatsApp Group Join Request",
            body=f"@{username} wants to join the WhatsApp group for '{event['title']}'",
            reference_id=request_id,
        )
    except Exception as e:
        logger.error(f"Notification failed for WhatsApp join request: {e}")

    return {
        "message": "Your request has been submitted! An admin will review it shortly.",
        "request_id": request_id,
        "event_id": event_id,
        "status": "pending",
    }


@router.get(
    "/{event_id}/status",
    summary="Check your WhatsApp join request status",
)
async def get_request_status(
    event_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Check the status of your WhatsApp group join request for an event.
    Returns: pending, approved, or rejected.
    """
    user_id = current_user["sub"]

    row = await db_manager.fetchrow(
        """
        SELECT id, status, admin_notes, reviewed_at, created_at
        FROM whatsapp_join_requests
        WHERE event_id = $1 AND user_id = $2
        """,
        event_id, user_id
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No join request found for this event. Submit one first."
        )

    return {
        "request_id": str(row["id"]),
        "event_id": event_id,
        "status": row["status"],
        "admin_notes": row["admin_notes"],
        "reviewed_at": row["reviewed_at"].isoformat() if row["reviewed_at"] else None,
        "requested_at": row["created_at"].isoformat(),
    }


@router.get(
    "/{event_id}/link",
    summary="Get the WhatsApp group link (approved users only)",
)
async def get_whatsapp_link(
    event_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Retrieve the WhatsApp group invite link.
    Only accessible if your join request has been approved by an admin.
    """
    user_id = current_user["sub"]

    # Check approval status
    row = await db_manager.fetchrow(
        """
        SELECT wjr.status, e.whatsapp_group_link, e.title
        FROM whatsapp_join_requests wjr
        JOIN events e ON wjr.event_id = e.event_id
        WHERE wjr.event_id = $1 AND wjr.user_id = $2
        """,
        event_id, user_id
    )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No join request found. Please request to join first."
        )

    if row["status"] == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your request is still pending admin review. Please wait."
        )

    if row["status"] == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your request was not approved. You cannot access this group."
        )

    # Approved — return the link
    return {
        "event_id": event_id,
        "event_title": row["title"],
        "whatsapp_group_link": row["whatsapp_group_link"],
        "message": "You are approved! Click the link to join the WhatsApp group.",
    }


# ─── Admin Endpoints ────────────────────────────────────────────────

@router.get(
    "/admin/{event_id}/requests",
    summary="Admin: View all WhatsApp join requests for an event",
)
async def admin_list_requests(
    event_id: str,
    status_filter: Optional[str] = Query(
        None,
        description="Filter by status: pending, approved, rejected. Leave empty for all."
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin),
):
    """
    View all WhatsApp group join requests for an event.
    Requires admin privileges.
    """
    # Verify event exists
    event = await db_manager.fetchrow(
        "SELECT event_id, title FROM events WHERE event_id = $1", event_id
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )

    # Build query
    if status_filter:
        rows = await db_manager.fetch(
            """
            SELECT
                wjr.id AS request_id,
                wjr.user_id,
                u.username,
                u.karma_score,
                u.tier_level,
                wjr.status,
                wjr.admin_notes,
                wjr.reviewed_by,
                wjr.reviewed_at,
                wjr.created_at
            FROM whatsapp_join_requests wjr
            JOIN users u ON wjr.user_id = u.user_id
            WHERE wjr.event_id = $1 AND wjr.status = $2
            ORDER BY wjr.created_at DESC
            LIMIT $3 OFFSET $4
            """,
            event_id, status_filter, limit, offset
        )
    else:
        rows = await db_manager.fetch(
            """
            SELECT
                wjr.id AS request_id,
                wjr.user_id,
                u.username,
                u.karma_score,
                u.tier_level,
                wjr.status,
                wjr.admin_notes,
                wjr.reviewed_by,
                wjr.reviewed_at,
                wjr.created_at
            FROM whatsapp_join_requests wjr
            JOIN users u ON wjr.user_id = u.user_id
            WHERE wjr.event_id = $1
            ORDER BY wjr.created_at DESC
            LIMIT $2 OFFSET $3
            """,
            event_id, limit, offset
        )

    # Count by status
    counts = await db_manager.fetchrow(
        """
        SELECT
            COUNT(*) AS total,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected
        FROM whatsapp_join_requests
        WHERE event_id = $1
        """,
        event_id
    )

    return {
        "event_id": event_id,
        "event_title": event["title"],
        "summary": {
            "total": counts["total"],
            "pending": counts["pending"],
            "approved": counts["approved"],
            "rejected": counts["rejected"],
        },
        "requests": [
            {
                "request_id": str(r["request_id"]),
                "user_id": r["user_id"],
                "username": r["username"],
                "karma_score": r["karma_score"],
                "tier_level": r["tier_level"],
                "status": r["status"],
                "admin_notes": r["admin_notes"],
                "reviewed_by": r["reviewed_by"],
                "reviewed_at": r["reviewed_at"].isoformat() if r["reviewed_at"] else None,
                "requested_at": r["created_at"].isoformat(),
            }
            for r in rows
        ],
    }


@router.patch(
    "/admin/requests/{request_id}/approve",
    summary="Admin: Approve a WhatsApp join request",
)
async def admin_approve_request(
    request_id: str,
    body: AdminReviewBody = None,
    current_admin: dict = Depends(get_current_admin),
):
    """
    Approve a user's request to join the WhatsApp group.
    The user will be notified and can then retrieve the group link.
    """
    admin_id = current_admin["sub"]

    # Fetch the request
    request_row = await db_manager.fetchrow(
        """
        SELECT wjr.*, e.title AS event_title, e.host_id
        FROM whatsapp_join_requests wjr
        JOIN events e ON wjr.event_id = e.event_id
        WHERE wjr.id = $1
        """,
        request_id
    )

    if not request_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found."
        )

    if request_row["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already '{request_row['status']}'. Only pending requests can be approved."
        )

    # Update status to approved
    admin_notes = body.admin_notes if body else None
    await db_manager.execute(
        """
        UPDATE whatsapp_join_requests
        SET status = 'approved', admin_notes = $1, reviewed_by = $2, reviewed_at = NOW()
        WHERE id = $3
        """,
        admin_notes, admin_id, request_id
    )

    # Notify the user
    try:
        await create_notification(
            user_id=request_row["user_id"],
            actor_id=admin_id,
            type="WHATSAPP_JOIN_APPROVED",
            title="WhatsApp Group — Approved! ✅",
            body=f"Your request to join the WhatsApp group for '{request_row['event_title']}' has been approved! Tap to get the link.",
            reference_id=request_id,
            action_url=f"/api/v1/whatsapp/{request_row['event_id']}/link",
        )
    except Exception as e:
        logger.error(f"Notification failed for WhatsApp approval: {e}")

    logger.info(f"Admin {admin_id} approved WhatsApp join request {request_id} for user {request_row['user_id']}")

    return {
        "message": "Request approved! User can now access the WhatsApp group link.",
        "request_id": request_id,
        "user_id": request_row["user_id"],
        "event_id": request_row["event_id"],
        "status": "approved",
    }


@router.patch(
    "/admin/requests/{request_id}/reject",
    summary="Admin: Reject a WhatsApp join request",
)
async def admin_reject_request(
    request_id: str,
    body: AdminReviewBody = None,
    current_admin: dict = Depends(get_current_admin),
):
    """
    Reject a user's request to join the WhatsApp group.
    The user will be notified. They can re-request later if desired.
    """
    admin_id = current_admin["sub"]

    # Fetch the request
    request_row = await db_manager.fetchrow(
        """
        SELECT wjr.*, e.title AS event_title
        FROM whatsapp_join_requests wjr
        JOIN events e ON wjr.event_id = e.event_id
        WHERE wjr.id = $1
        """,
        request_id
    )

    if not request_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found."
        )

    if request_row["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already '{request_row['status']}'. Only pending requests can be rejected."
        )

    # Update status to rejected
    admin_notes = body.admin_notes if body else None
    await db_manager.execute(
        """
        UPDATE whatsapp_join_requests
        SET status = 'rejected', admin_notes = $1, reviewed_by = $2, reviewed_at = NOW()
        WHERE id = $3
        """,
        admin_notes, admin_id, request_id
    )

    # Notify the user
    try:
        await create_notification(
            user_id=request_row["user_id"],
            actor_id=admin_id,
            type="WHATSAPP_JOIN_REJECTED",
            title="WhatsApp Group — Request Declined",
            body=f"Your request to join the WhatsApp group for '{request_row['event_title']}' was not approved.",
            reference_id=request_id,
        )
    except Exception as e:
        logger.error(f"Notification failed for WhatsApp rejection: {e}")

    logger.info(f"Admin {admin_id} rejected WhatsApp join request {request_id} for user {request_row['user_id']}")

    return {
        "message": "Request rejected. The user has been notified.",
        "request_id": request_id,
        "user_id": request_row["user_id"],
        "event_id": request_row["event_id"],
        "status": "rejected",
    }
