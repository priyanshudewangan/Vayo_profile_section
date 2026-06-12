"""
Admin Panel API Router
Endpoints for administrative functions:
- GET    /api/v1/admin/reported-users          — View reported users
- POST   /api/v1/admin/reported-users/{report_id}/review — Review reported user
- GET    /api/v1/admin/flagged-content         — View flagged content
- POST   /api/v1/admin/flagged-content/{flag_id}/review — Review flagged content
- GET    /api/v1/admin/events/stats            — Event activity and attendance stats
- GET    /api/v1/admin/events/{event_id}/details — Detailed event attendance
- POST   /api/v1/admin/users/{user_id}/ban     — Ban a user
- POST   /api/v1/admin/users/{user_id}/unban   — Unban a user
- POST   /api/v1/admin/content/{content_id}/delete — Delete content
"""
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Query, Depends
from auth import get_current_user, get_current_admin
from pydantic import BaseModel, Field
from enum import Enum

from database import db_manager
from karma_models import add_karma, KarmaActionType
from notifications_router import create_notification

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


class ReviewAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    BAN_USER = "ban_user"

class ContentType(str, Enum):
    MESSAGE = "message"
    EVENT = "event"
    USER_PROFILE = "user_profile"

class BanType(str, Enum):
    TEMPORARY = "temporary"
    PERMANENT = "permanent"



class ReviewReportRequest(BaseModel):
    action: ReviewAction = Field(..., description="Action to take on the report")
    admin_notes: Optional[str] = Field(None, description="Admin notes for the review")
    ban_duration_days: Optional[int] = Field(None, description="Duration for temporary ban (required if action is ban_user)")

class FlagContentRequest(BaseModel):
    content_type: ContentType = Field(..., description="Type of content being flagged")
    content_id: str = Field(..., description="ID of the content being flagged")
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for flagging")

class ReviewFlagRequest(BaseModel):
    action: ReviewAction = Field(..., description="Action to take on the flagged content")
    admin_notes: Optional[str] = Field(None, description="Admin notes for the review")

class BanUserRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for the ban")
    ban_type: BanType = Field(..., description="Type of ban")
    duration_days: Optional[int] = Field(None, description="Duration in days (required for temporary bans)")

class DeleteContentRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for deletion")
    content_type: ContentType = Field(..., description="Type of content being deleted")



@router.get("/reported-users", summary="Get list of reported users")
async def get_reported_users(
    status_filter: Optional[str] = Query("pending", description="Filter by status: pending, reviewed, resolved, dismissed"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get paginated list of reported users with details.
    Requires admin privileges.
    """

    rows = await db_manager.pg_pool.fetch(
        """
        SELECT
            ru.id as report_id,
            ru.reporter_id,
            ru.reported_id,
            ru.reason,
            ru.status,
            ru.admin_notes,
            ru.reviewed_by,
            ru.reviewed_at,
            ru.created_at,
            u.username as reported_username,
            u.karma_score as reported_karma,
            reporter.username as reporter_username
        FROM reported_users ru
        JOIN users u ON ru.reported_id = u.user_id
        JOIN users reporter ON ru.reporter_id = reporter.user_id
        WHERE ($1 = 'all' OR ru.status = $1)
        ORDER BY ru.created_at DESC
        LIMIT $2 OFFSET $3
        """,
        status_filter,
        limit,
        offset
    )

    return {"reports": [dict(r) for r in rows]}

@router.post("/reported-users/{report_id}/review", summary="Review a reported user")
async def review_reported_user(
    report_id: str,
    body: ReviewReportRequest,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Review and take action on a reported user.
    Requires admin privileges.
    """
    report = await db_manager.pg_pool.fetchrow(
        "SELECT * FROM reported_users WHERE id = $1",
        report_id
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    if report["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report has already been reviewed"
        )

    # Update report status
    new_status = "resolved" if body.action in [ReviewAction.APPROVE, ReviewAction.REJECT] else "pending"
    if body.action == ReviewAction.BAN_USER:
        new_status = "resolved"

    await db_manager.pg_pool.execute(
        """
        UPDATE reported_users
        SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $4
        """,
        new_status, body.admin_notes, admin_id, report_id
    )

    # Take action based on review
    if body.action == ReviewAction.BAN_USER:
        if not body.ban_duration_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ban_duration_days required for ban action"
            )

        # Ban the user
        expires_at = None if body.ban_duration_days is None else datetime.utcnow() + timedelta(days=body.ban_duration_days)

        await db_manager.pg_pool.execute(
            """
            INSERT INTO user_bans (user_id, banned_by, reason, ban_type, duration_days, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            report["reported_id"], admin_id, f"Banned due to report: {report['reason']}", "temporary", body.ban_duration_days, expires_at
        )

        # Log admin action
        await log_admin_action(
            admin_id, "ban_user", "user", report["reported_id"],
            f"Banned user due to report review: {report['reason']}",
            {"report_id": report_id, "ban_duration_days": body.ban_duration_days}
        )

    return {"message": f"Report reviewed successfully. Action: {body.action.value}"}


@router.post("/content/flag", summary="Flag content for review")
async def flag_content(
    content_type: ContentType,
    content_id: str,
    current_user: dict = Depends(get_current_user),
    reason: str = Query(..., min_length=5, max_length=500, description="Reason for flagging")
):
    reporter_id = current_user["sub"]
    """
    Allow users to flag content for admin review.
    """
    # Verify reporter exists
    reporter = await db_manager.pg_pool.fetchrow(
        "SELECT user_id FROM users WHERE user_id = $1",
        reporter_id
    )
    if not reporter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporter not found"
        )

    # Insert flag
    await db_manager.pg_pool.execute(
        """
        INSERT INTO flagged_content (content_type, content_id, reporter_id, reason)
        VALUES ($1, $2, $3, $4)
        """,
        content_type, content_id, reporter_id, reason
    )

    return {"message": "Content flagged for review"}

@router.get("/flagged-content", summary="Get list of flagged content")
async def get_flagged_content(
    status_filter: Optional[str] = Query("pending", description="Filter by status"),
    content_type_filter: Optional[ContentType] = Query(None, description="Filter by content type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get paginated list of flagged content.
    Requires admin privileges.
    """

    conditions = []
    params = [status_filter, limit, offset]
    param_count = 3

    if content_type_filter:
        conditions.append(f"fc.content_type = ${param_count + 1}")
        params.append(content_type_filter)
        param_count += 1

    where_clause = "WHERE ($1 = 'all' OR fc.status = $1)"
    if conditions:
        where_clause += " AND " + " AND ".join(conditions)

    query = f"""
        SELECT
            fc.flag_id,
            fc.content_type,
            fc.content_id,
            fc.reporter_id,
            fc.reason,
            fc.status,
            fc.admin_notes,
            fc.reviewed_by,
            fc.reviewed_at,
            fc.created_at,
            reporter.username as reporter_username,
            CASE
                WHEN fc.content_type = 'message' THEN (
                    SELECT content FROM messages WHERE id = fc.content_id::uuid
                )
                WHEN fc.content_type = 'event' THEN (
                    SELECT title FROM events WHERE event_id = fc.content_id
                )
                ELSE fc.content_id
            END as content_preview
        FROM flagged_content fc
        JOIN users reporter ON fc.reporter_id = reporter.user_id
        {where_clause}
        ORDER BY fc.created_at DESC
        LIMIT $2 OFFSET $3
    """

    rows = await db_manager.pg_pool.fetch(query, *params)

    return {"flagged_content": [dict(r) for r in rows]}

@router.post("/flagged-content/{flag_id}/review", summary="Review flagged content")
async def review_flagged_content(
    flag_id: str,
    body: ReviewFlagRequest,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Review and take action on flagged content.
    Requires admin privileges.
    """

    flag = await db_manager.pg_pool.fetchrow(
        "SELECT * FROM flagged_content WHERE flag_id = $1",
        flag_id
    )
    if not flag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flagged content not found"
        )

    if flag["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content has already been reviewed"
        )

    # Update flag status
    new_status = "resolved" if body.action in [ReviewAction.APPROVE, ReviewAction.REJECT] else "pending"
    if body.action == ReviewAction.BAN_USER:
        new_status = "resolved"

    await db_manager.pg_pool.execute(
        """
        UPDATE flagged_content
        SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
        WHERE flag_id = $4
        """,
        new_status, body.admin_notes, admin_id, flag_id
    )

    # Take action based on review
    if body.action == ReviewAction.BAN_USER:
        # Ban the content owner
        if flag["content_type"] == "message":
            # Get message sender
            msg = await db_manager.pg_pool.fetchrow(
                "SELECT sender_id FROM messages WHERE id = $1",
                flag["content_id"]
            )
            if msg:
                target_user_id = msg["sender_id"]
            else:
                raise HTTPException(status_code=404, detail="Message not found")
        elif flag["content_type"] == "event":
            # Get event host
            event = await db_manager.pg_pool.fetchrow(
                "SELECT host_id FROM events WHERE event_id = $1",
                flag["content_id"]
            )
            if event:
                target_user_id = event["host_id"]
            else:
                raise HTTPException(status_code=404, detail="Event not found")
        else:
            raise HTTPException(status_code=400, detail="Unsupported content type for ban")

        # Ban the user
        await db_manager.pg_pool.execute(
            """
            INSERT INTO user_bans (user_id, banned_by, reason, ban_type, duration_days, expires_at)
            VALUES ($1, $2, $3, 'temporary', 30, NOW() + INTERVAL '30 days')
            """,
            target_user_id, admin_id, f"Banned due to flagged content: {flag['reason']}"
        )

        await log_admin_action(
            admin_id, "ban_user", "user", target_user_id,
            f"Banned user due to flagged content review: {flag['reason']}",
            {"flag_id": flag_id, "content_type": flag["content_type"]}
        )

    return {"message": f"Flagged content reviewed successfully. Action: {body.action.value}"}



@router.get("/events/stats", summary="Get event activity statistics")
async def get_event_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get event activity and attendance statistics.
    Requires admin privileges.
    """

    # Get stats for the last N days
    stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(DISTINCT e.event_id) as total_events,
            COUNT(DISTINCT CASE WHEN e.event_date >= NOW() THEN e.event_id END) as upcoming_events,
            COUNT(DISTINCT CASE WHEN e.event_date < NOW() THEN e.event_id END) as past_events,
            COALESCE(SUM(ep.attendance_status::int), 0) as total_attendance,
            COUNT(DISTINCT ep.user_id) as unique_attendees,
            AVG(CASE WHEN ep.attendance_status THEN 1 ELSE 0 END) as attendance_rate
        FROM events e
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE e.created_at >= NOW() - INTERVAL '1 day' * $1
        """,
        days
    )

    # Get top events by attendance
    top_events = await db_manager.pg_pool.fetch(
        """
        SELECT
            e.event_id,
            e.title,
            e.host_id,
            u.username as host_username,
            e.event_date,
            COUNT(ep.user_id) as total_rsvps,
            COALESCE(SUM(ep.attendance_status::int), 0) as actual_attendance,
            ROUND(
                CASE
                    WHEN COUNT(ep.user_id) > 0
                    THEN (SUM(ep.attendance_status::int)::float / COUNT(ep.user_id)) * 100
                    ELSE 0
                END, 2
            ) as attendance_percentage
        FROM events e
        JOIN users u ON e.host_id = u.user_id
        LEFT JOIN event_participants ep ON e.event_id = ep.event_id
        WHERE e.event_date < NOW()
        AND e.created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY e.event_id, e.title, e.host_id, u.username, e.event_date
        ORDER BY actual_attendance DESC
        LIMIT 10
        """,
        days
    )

    return {
        "period_days": days,
        "summary": dict(stats),
        "top_events_by_attendance": [dict(r) for r in top_events]
    }

@router.get("/events/{event_id}/details", summary="Get detailed event attendance")
async def get_event_details(
    event_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get detailed attendance information for a specific event.
    Requires admin privileges.
    """

    # Get event info
    event = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            e.*,
            u.username as host_username,
            u.karma_score as host_karma
        FROM events e
        JOIN users u ON e.host_id = u.user_id
        WHERE e.event_id = $1
        """,
        event_id
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Get participant details
    participants = await db_manager.pg_pool.fetch(
        """
        SELECT
            ep.user_id,
            u.username,
            u.karma_score,
            ep.payment_status,
            ep.attendance_status,
            ep.rsvp_timestamp,
            ep.checkin_timestamp
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.user_id
        WHERE ep.event_id = $1
        ORDER BY ep.rsvp_timestamp
        """,
        event_id
    )

    # Calculate stats
    total_rsvps = len(participants)
    actual_attendance = sum(1 for p in participants if p["attendance_status"])
    attendance_rate = (actual_attendance / total_rsvps * 100) if total_rsvps > 0 else 0

    return {
        "event": dict(event),
        "attendance_stats": {
            "total_rsvps": total_rsvps,
            "actual_attendance": actual_attendance,
            "attendance_rate": round(attendance_rate, 2)
        },
        "participants": [dict(p) for p in participants]
    }



@router.get("/users/{user_id}", summary="Get detailed user information")
async def get_user_details(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get comprehensive user information for admin review.
    Requires admin privileges.
    """

    # Get basic user info
    user = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            user_id,
            username,
            karma_score,
            tier_level,
            inbox_shield_threshold,
            created_at
        FROM users
        WHERE user_id = $1
        """,
        user_id
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Get recent karma activity (last 30 days)
    karma_activity = await db_manager.pg_pool.fetch(
        """
        SELECT
            id,
            action_type,
            point_delta,
            reference_id,
            created_at
        FROM karma_ledger
        WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 20
        """,
        user_id
    )

    # Get event participation stats
    event_stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(*) as total_events_participated,
            COUNT(CASE WHEN attendance_status = TRUE THEN 1 END) as events_attended,
            COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_events
        FROM event_participants
        WHERE user_id = $1
        """,
        user_id
    )

    # Get events hosted
    hosted_events = await db_manager.pg_pool.fetch(
        """
        SELECT
            event_id,
            title,
            event_date,
            created_at
        FROM events
        WHERE host_id = $1
        ORDER BY created_at DESC
        LIMIT 10
        """,
        user_id
    )

    # Get connection/follower counts
    connection_counts = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            (SELECT COUNT(*) FROM connections WHERE user_id_1 = $1 OR user_id_2 = $1) as total_connections,
            (SELECT COUNT(*) FROM follow_requests WHERE receiver_id = $1 AND status = 'pending') as pending_requests,
            (SELECT COUNT(*) FROM follow_requests WHERE sender_id = $1 AND status = 'pending') as sent_requests
        """,
        user_id
    )

    # Check for active bans
    active_ban = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            ban_id,
            reason,
            ban_type,
            duration_days,
            expires_at,
            created_at,
            banned_by
        FROM user_bans
        WHERE user_id = $1 AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
        """,
        user_id
    )

    # Get reporting history (as reporter)
    reporting_history = await db_manager.pg_pool.fetch(
        """
        SELECT
            ru.id as report_id,
            ru.reported_id,
            ru.reason,
            ru.status,
            ru.created_at,
            u.username as reported_username
        FROM reported_users ru
        JOIN users u ON ru.reported_id = u.user_id
        WHERE ru.reporter_id = $1
        ORDER BY ru.created_at DESC
        LIMIT 10
        """,
        user_id
    )

    # Get reported history (as reported user)
    reported_history = await db_manager.pg_pool.fetch(
        """
        SELECT
            ru.id as report_id,
            ru.reporter_id,
            ru.reason,
            ru.status,
            ru.admin_notes,
            ru.created_at,
            reporter.username as reporter_username
        FROM reported_users ru
        JOIN users reporter ON ru.reporter_id = reporter.user_id
        WHERE ru.reported_id = $1
        ORDER BY ru.created_at DESC
        LIMIT 10
        """,
        user_id
    )

    # Get flagged content history
    flagged_content = await db_manager.pg_pool.fetch(
        """
        SELECT
            fc.flag_id,
            fc.content_type,
            fc.content_id,
            fc.reason,
            fc.status,
            fc.admin_notes,
            fc.created_at
        FROM flagged_content fc
        WHERE fc.reporter_id = $1
        ORDER BY fc.created_at DESC
        LIMIT 10
        """,
        user_id
    )

    # Get chat message count (recent activity)
    message_count = await db_manager.pg_pool.fetchrow(
        """
        SELECT COUNT(*) as total_messages
        FROM messages
        WHERE sender_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
        """,
        user_id
    )

    # Calculate attendance rate
    attendance_rate = 0.0
    if event_stats["total_events_participated"] > 0:
        attendance_rate = round(
            (event_stats["events_attended"] / event_stats["total_events_participated"]) * 100,
            2
        )

    return {
        "user": dict(user),
        "activity_summary": {
            "total_events_participated": event_stats["total_events_participated"],
            "events_attended": event_stats["events_attended"],
            "attendance_rate": attendance_rate,
            "paid_events": event_stats["paid_events"],
            "events_hosted": len(hosted_events),
            "total_connections": connection_counts["total_connections"],
            "pending_connection_requests": connection_counts["pending_requests"],
            "sent_connection_requests": connection_counts["sent_requests"],
            "recent_messages": message_count["total_messages"],
            "reports_made": len(reporting_history),
            "reports_received": len(reported_history),
            "content_flagged": len(flagged_content)
        },
        "recent_karma_activity": [dict(activity) for activity in karma_activity],
        "hosted_events": [dict(event) for event in hosted_events],
        "active_ban": dict(active_ban) if active_ban else None,
        "reporting_history": [dict(report) for report in reporting_history],
        "reported_history": [dict(report) for report in reported_history],
        "flagged_content": [dict(flag) for flag in flagged_content]
    }

@router.get("/users", summary="Search and list users")
async def search_users(
    search_query: Optional[str] = Query(None, description="Search by username or user_id"),
    karma_min: Optional[int] = Query(None, description="Minimum karma score"),
    karma_max: Optional[int] = Query(None, description="Maximum karma score"),
    tier_filter: Optional[str] = Query(None, description="Filter by tier level"),
    banned_only: bool = Query(False, description="Show only banned users"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Search and list users with filtering options.
    Requires admin privileges.
    """

    # Build query conditions
    conditions = []
    params = [limit, offset]
    param_count = 2

    if search_query:
        conditions.append(f"(u.username ILIKE ${param_count + 1} OR u.user_id ILIKE ${param_count + 1})")
        params.append(f"%{search_query}%")
        param_count += 1

    if karma_min is not None:
        conditions.append(f"u.karma_score >= ${param_count + 1}")
        params.append(karma_min)
        param_count += 1

    if karma_max is not None:
        conditions.append(f"u.karma_score <= ${param_count + 1}")
        params.append(karma_max)
        param_count += 1

    if tier_filter:
        conditions.append(f"u.tier_level = ${param_count + 1}")
        params.append(tier_filter)
        param_count += 1

    if banned_only:
        conditions.append("ub.is_active = TRUE")
        join_clause = """
        JOIN user_bans ub ON u.user_id = ub.user_id
        """
    else:
        join_clause = """
        LEFT JOIN user_bans ub ON u.user_id = ub.user_id AND ub.is_active = TRUE
        """

    where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

    query = f"""
        SELECT
            u.user_id,
            u.username,
            u.karma_score,
            u.tier_level,
            u.created_at,
            CASE WHEN ub.ban_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned,
            ub.reason as ban_reason,
            ub.ban_type,
            ub.expires_at
        FROM users u
        {join_clause}
        {where_clause}
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
    """

    users = await db_manager.pg_pool.fetch(query, *params)

    # Get total count for pagination
    count_query = f"""
        SELECT COUNT(*) as total
        FROM users u
        {join_clause}
        {where_clause}
    """
    total_count = await db_manager.pg_pool.fetchval(count_query, *params[2:])  # Skip limit and offset

    return {
        "users": [dict(user) for user in users],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }
    }

@router.post("/users/{user_id}/ban", summary="Ban a user")
async def ban_user(
    user_id: str,
    body: BanUserRequest,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Ban a user from the platform.
    Requires admin privileges.
    """

    # Check if user exists
    user = await db_manager.pg_pool.fetchrow(
        "SELECT user_id FROM users WHERE user_id = $1",
        user_id
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already banned
    existing_ban = await db_manager.pg_pool.fetchrow(
        "SELECT ban_id FROM user_bans WHERE user_id = $1 AND is_active = TRUE",
        user_id
    )
    if existing_ban:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already banned"
        )

    # Calculate expiry
    expires_at = None
    if body.ban_type == BanType.TEMPORARY:
        if not body.duration_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="duration_days required for temporary bans"
            )
        expires_at = datetime.utcnow() + timedelta(days=body.duration_days)

    # Insert ban
    await db_manager.pg_pool.execute(
        """
        INSERT INTO user_bans (user_id, banned_by, reason, ban_type, duration_days, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        user_id, admin_id, body.reason, body.ban_type.value, body.duration_days, expires_at
    )

    # Log admin action
    await log_admin_action(
        admin_id, "ban_user", "user", user_id, body.reason,
        {"ban_type": body.ban_type.value, "duration_days": body.duration_days}
    )

    return {"message": f"User {user_id} has been banned"}

@router.post("/users/{user_id}/unban", summary="Unban a user")
async def unban_user(
    user_id: str,
    reason: str = Query(..., min_length=5, max_length=500, description="Reason for unbanning"),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Unban a user from the platform.
    Requires admin privileges.
    """

    # Update active ban
    result = await db_manager.pg_pool.execute(
        """
        UPDATE user_bans
        SET is_active = FALSE, lifted_at = NOW(), lifted_by = $2, lift_reason = $3
        WHERE user_id = $1 AND is_active = TRUE
        """,
        user_id, admin_id, reason
    )

    if result == "UPDATE 0":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not currently banned"
        )

    # Log admin action
    await log_admin_action(
        admin_id, "unban_user", "user", user_id, reason
    )

    return {"message": f"User {user_id} has been unbanned"}



@router.post("/content/{content_id}/delete", summary="Delete content")
async def delete_content(
    content_id: str,
    body: DeleteContentRequest,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Delete content from the platform.
    Requires admin privileges.
    """

    # Handle different content types
    if body.content_type == ContentType.MESSAGE:
        # Delete message
        result = await db_manager.pg_pool.execute(
            "DELETE FROM messages WHERE id = $1",
            content_id
        )
    elif body.content_type == ContentType.EVENT:
        # Delete event (cascade will handle participants)
        result = await db_manager.pg_pool.execute(
            "DELETE FROM events WHERE event_id = $1",
            content_id
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported content type for deletion"
        )

    if result == "DELETE 0":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Log admin action
    await log_admin_action(
        admin_id, "delete_content", body.content_type.value, content_id, body.reason
    )

    return {"message": f"Content {content_id} has been deleted"}


@router.get("/system/health", summary="Get system health and performance metrics")
async def get_system_health(
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get comprehensive system health metrics.
    Requires admin privileges.
    """

    # Database connection stats
    db_stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            count(*) as active_connections
        FROM pg_stat_activity
        WHERE state = 'active'
        """
    )

    # Table sizes
    table_sizes = await db_manager.pg_pool.fetch(
        """
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
        """
    )

    # Recent errors (if we had error logging table)
    # For now, just return basic stats

    return {
        "database": {
            "active_connections": db_stats["active_connections"],
            "table_sizes": [dict(table) for table in table_sizes]
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/users/bulk-karma-adjust", summary="Bulk karma adjustment for multiple users")
async def bulk_karma_adjust(
    body: dict,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Apply karma adjustments to multiple users at once.
    Body: {"user_ids": ["user1", "user2"], "point_delta": 100, "reason": "Bulk adjustment"}
    """

    user_ids = body.get("user_ids", [])
    point_delta = body.get("point_delta", 0)
    reason = body.get("reason", "Bulk admin adjustment")

    if not user_ids or not isinstance(user_ids, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_ids must be a non-empty list"
        )

    # Insert karma adjustments for all users
    for user_id in user_ids:
        await db_manager.pg_pool.execute(
            """
            INSERT INTO karma_ledger (user_id, action_type, point_delta, reference_id)
            VALUES ($1, $2, $3, $4)
            """,
            user_id,
            KarmaActionType.ADMIN_ADJUSTMENT.value,
            point_delta,
            f"bulk_adjustment_{admin_id}"
        )

        # Log admin action
        await log_admin_action(
            admin_id, "bulk_karma_adjust", "user", user_id, reason,
            {"point_delta": point_delta, "bulk_operation": True}
        )

    return {
        "message": f"Applied {point_delta} karma points to {len(user_ids)} users",
        "users_affected": len(user_ids)
    }



@router.patch("/events/{event_id}/admin-update", summary="Admin update event details")
async def admin_update_event(
    event_id: str,
    body: dict,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Allow admins to update event details.
    Body can include: title, description, min_karma_required, entry_fee, max_participants, status
    """

    # Get current event
    event = await db_manager.pg_pool.fetchrow(
        "SELECT * FROM events WHERE event_id = $1",
        event_id
    )
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Build update query dynamically
    update_fields = []
    params = [event_id]
    param_count = 1

    allowed_fields = ["title", "description", "min_karma_required", "entry_fee", "max_participants", "status", "whatsapp_group_link"]
    for field in allowed_fields:
        if field in body:
            param_count += 1
            update_fields.append(f"{field} = ${param_count}")
            params.append(body[field])

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )

    update_query = f"""
        UPDATE events
        SET {', '.join(update_fields)}, updated_at = NOW()
        WHERE event_id = $1
    """

    await db_manager.pg_pool.execute(update_query, *params)

    # Log admin action
    await log_admin_action(
        admin_id, "update_event", "event", event_id, "Admin updated event details",
        {"updated_fields": list(body.keys())}
    )

    return {"message": "Event updated successfully"}

@router.delete("/events/{event_id}/admin-cancel", summary="Admin cancel event")
async def admin_cancel_event(
    event_id: str,
    reason: str = Query(..., description="Reason for cancellation"),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Allow admins to cancel events.
    """

    # Update event status to cancelled
    result = await db_manager.pg_pool.execute(
        """
        UPDATE events
        SET status = 'cancelled', updated_at = NOW()
        WHERE event_id = $1 AND status != 'cancelled'
        """,
        event_id
    )

    if result == "UPDATE 0":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event not found or already cancelled"
        )

    # Log admin action
    await log_admin_action(
        admin_id, "cancel_event", "event", event_id, reason
    )

    return {"message": "Event cancelled successfully"}


@router.post("/notifications/broadcast", summary="Send system-wide notification")
async def broadcast_notification(
    body: dict,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Send a notification to all users or filtered group.
    Body: {"title": "Message", "body": "Content", "target_users": ["user1"] or "all"}
    """

    title = body.get("title", "").strip()
    message_body = body.get("body", "").strip()
    target_users = body.get("target_users", "all")

    if not title or not message_body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and body are required"
        )

    if target_users == "all":
        # Get all users
        users = await db_manager.pg_pool.fetch(
            "SELECT user_id FROM users"
        )
        target_user_ids = [user["user_id"] for user in users]
    elif isinstance(target_users, list):
        target_user_ids = target_users
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_users must be 'all' or a list of user IDs"
        )

    # Send notifications
    notification_count = 0
    for user_id in target_user_ids:
        try:
            await create_notification(
                user_id=user_id,
                actor_id=admin_id,
                type="SYSTEM_ANNOUNCEMENT",
                title=title,
                body=message_body,
                reference_id=f"broadcast_{admin_id}_{datetime.utcnow().timestamp()}"
            )
            notification_count += 1
        except Exception as e:
            # Log error but continue
            print(f"Failed to send notification to {user_id}: {e}")

    # Log admin action
    await log_admin_action(
        admin_id, "broadcast_notification", "system", "all_users",
        f"Broadcast notification: {title}",
        {"notification_count": notification_count, "target_users": target_users}
    )

    return {
        "message": f"Notification sent to {notification_count} users",
        "recipient_count": notification_count
    }


@router.get("/audit-logs", summary="Get admin action audit logs")
async def get_audit_logs(
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    target_type: Optional[str] = Query(None, description="Filter by target type"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get comprehensive audit logs of all admin actions.
    Requires admin privileges.
    """

    # Build query conditions — $1=days, $2=limit, $3=offset; additional filters start at $4
    conditions = ["aa.created_at >= NOW() - INTERVAL '1 day' * $1"]
    params = [days, limit, offset]
    param_count = 3

    if action_type:
        conditions.append(f"aa.action_type = ${param_count + 1}")
        params.append(action_type)
        param_count += 1

    if target_type:
        conditions.append(f"aa.target_type = ${param_count + 1}")
        params.append(target_type)
        param_count += 1

    where_clause = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT
            aa.action_id,
            aa.admin_id,
            aa.action_type,
            aa.target_type,
            aa.target_id,
            aa.reason,
            aa.details,
            aa.created_at,
            u.username as admin_username
        FROM admin_actions aa
        JOIN users u ON aa.admin_id = u.user_id
        {where_clause}
        ORDER BY aa.created_at DESC
        LIMIT $2 OFFSET $3
    """

    logs = await db_manager.pg_pool.fetch(query, *params)

    # Get total count (reuse same params — $1=days, skip $2/$3 limit/offset)
    count_query = f"""
        SELECT COUNT(*) as total
        FROM admin_actions aa
        {where_clause}
    """
    total_count = await db_manager.pg_pool.fetchval(count_query, *params)

    return {
        "audit_logs": [dict(log) for log in logs],
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total_count
        }
    }


@router.get("/export/users", summary="Export user data")
async def export_users(
    format: str = Query("json", description="Export format: json or csv"),
    include_sensitive: bool = Query(False, description="Include sensitive data"),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Export user data for backup or analysis.
    Requires admin privileges.
    """

    # Get user data
    users = await db_manager.pg_pool.fetch(
        """
        SELECT
            user_id,
            username,
            karma_score,
            tier_level,
            inbox_shield_threshold,
            created_at
        FROM users
        ORDER BY created_at
        """
    )

    if format.lower() == "csv":
        # Convert to CSV format
        import csv
        import io

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=users[0].keys() if users else [])
        writer.writeheader()
        writer.writerows([dict(user) for user in users])

        return {
            "format": "csv",
            "data": output.getvalue(),
            "record_count": len(users)
        }
    else:
        # JSON format
        return {
            "format": "json",
            "data": [dict(user) for user in users],
            "record_count": len(users)
        }


@router.get("/moderation-queue", summary="Get prioritized moderation queue")
async def get_moderation_queue(
    priority_filter: Optional[str] = Query(None, description="Filter by priority: high, medium, low"),
    limit: int = Query(50, ge=1, le=200),
    current_admin: dict = Depends(get_current_admin)
): 
    admin_id = current_admin["sub"]
    """
    Get a prioritized queue of items needing moderation.
    Items are scored by urgency and severity.
    """

    # Get pending reports with priority scoring
    reports = await db_manager.pg_pool.fetch(
        """
        SELECT
            ru.id as item_id,
            'user_report' as item_type,
            ru.reporter_id,
            ru.reported_id,
            ru.reason,
            ru.created_at,
            u.username as reported_username,
            u.karma_score as reported_karma,
            -- Priority scoring based on karma, recency, and severity
            CASE
                WHEN u.karma_score > 500 THEN 3  -- High karma users need quick resolution
                WHEN ru.created_at > NOW() - INTERVAL '1 day' THEN 2  -- Recent reports
                ELSE 1  -- Normal priority
            END as priority_score,
            CASE
                WHEN u.karma_score > 500 THEN 'high'
                WHEN ru.created_at > NOW() - INTERVAL '1 day' THEN 'medium'
                ELSE 'low'
            END as priority_level
        FROM reported_users ru
        JOIN users u ON ru.reported_id = u.user_id
        WHERE ru.status = 'pending'
        ORDER BY priority_score DESC
        LIMIT $1
        """,
        limit
    )

    # Get pending flagged content
    flagged_content = await db_manager.pg_pool.fetch(
        """
        SELECT
            fc.flag_id as item_id,
            'flagged_content' as item_type,
            fc.reporter_id,
            fc.content_type,
            fc.content_id,
            fc.reason,
            fc.created_at,
            -- Priority scoring for content
            CASE
                WHEN fc.content_type = 'message' THEN 2  -- Messages are quick to review
                WHEN fc.content_type = 'event' THEN 3     -- Events affect many users
                ELSE 1
            END as priority_score,
            CASE
                WHEN fc.content_type = 'event' THEN 'high'
                WHEN fc.content_type = 'message' THEN 'medium'
                ELSE 'low'
            END as priority_level
        FROM flagged_content fc
        WHERE fc.status = 'pending'
        ORDER BY priority_score DESC
        LIMIT $1
        """,
        limit
    )

    # Combine and sort by priority
    all_items = [dict(item) for item in reports] + [dict(item) for item in flagged_content]
    all_items.sort(key=lambda x: (x['priority_score'], x['created_at']), reverse=True)

    # Apply priority filter if specified
    if priority_filter:
        all_items = [item for item in all_items if item['priority_level'] == priority_filter]

    # Limit results
    all_items = all_items[:limit]

    return {
        "moderation_queue": all_items,
        "total_pending": len(all_items),
        "breakdown": {
            "user_reports": len([r for r in reports]),
            "flagged_content": len([f for f in flagged_content])
        }
    }


@router.get("/settings", summary="Get platform settings")
async def get_platform_settings(
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get current platform configuration settings.
    Requires admin privileges.
    """

    # For now, return hardcoded settings. In production, these would come from a settings table
    settings = {
        "karma": {
            "max_daily_karma_gain": 100,
            "min_karma_for_connections": 50,
            "inbox_shield_max": 1000
        },
        "events": {
            "max_rsvp_per_user": 10,
            "checkin_radius_meters": 200,
            "max_events_per_host": 5
        },
        "moderation": {
            "auto_ban_threshold": 3,  # reports before auto-ban
            "content_flag_threshold": 5,
            "report_cooldown_hours": 24
        },
        "notifications": {
            "max_daily_notifications": 50,
            "notification_retention_days": 30
        }
    }

    return {"settings": settings}

@router.patch("/settings", summary="Update platform settings")
async def update_platform_settings(
    body: dict,
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Update platform configuration settings.
    Requires admin privileges.
    """

    # In production, this would update a settings table
    # For now, just log the attempted changes

    # Log admin action
    await log_admin_action(
        admin_id, "update_settings", "system", "platform_settings",
        "Updated platform settings",
        {"updated_settings": body}
    )

    return {
        "message": "Settings updated successfully",
        "updated_fields": list(body.keys())
    }


@router.get("/analytics/users", summary="Get user analytics and statistics")
async def get_user_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_admin: dict = Depends(get_current_admin)
):
    admin_id = current_admin["sub"]
    """
    Get comprehensive user analytics for admin dashboard.
    Requires admin privileges.
    """

    # User registration stats
    registration_stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' * $1 THEN 1 END) as new_users_period,
            AVG(karma_score) as avg_karma,
            COUNT(CASE WHEN karma_score >= 1000 THEN 1 END) as high_karma_users
        FROM users
        """,
        days
    )

    # Tier distribution
    tier_distribution = await db_manager.pg_pool.fetch(
        """
        SELECT
            tier_level,
            COUNT(*) as user_count
        FROM users
        WHERE tier_level IS NOT NULL
        GROUP BY tier_level
        ORDER BY tier_level
        """
    )

    # Active users (users with recent activity)
    active_users = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(DISTINCT kl.user_id) as users_with_karma_activity,
            COUNT(DISTINCT m.sender_id) as users_messaging,
            COUNT(DISTINCT ep.user_id) as users_participating_events
        FROM users u
        LEFT JOIN karma_ledger kl ON u.user_id = kl.user_id AND kl.created_at >= NOW() - INTERVAL '1 day' * $1
        LEFT JOIN messages m ON u.user_id = m.sender_id AND m.created_at >= NOW() - INTERVAL '1 day' * $1
        LEFT JOIN event_participants ep ON u.user_id = ep.user_id AND ep.rsvp_timestamp >= NOW() - INTERVAL '1 day' * $1
        """,
        days
    )

    # Ban statistics
    ban_stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_bans,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' * $1 THEN 1 END) as new_bans_period,
            COUNT(CASE WHEN ban_type = 'permanent' AND is_active = TRUE THEN 1 END) as permanent_bans
        FROM user_bans
        """,
        days
    )

    # Reporting activity
    reporting_stats = await db_manager.pg_pool.fetchrow(
        """
        SELECT
            COUNT(*) as total_reports,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' * $1 THEN 1 END) as reports_period,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports
        FROM reported_users
        """,
        days
    )

    # Top karma gainers
    top_karma_gainers = await db_manager.pg_pool.fetch(
        """
        SELECT
            u.user_id,
            u.username,
            u.karma_score,
            SUM(kl.point_delta) as karma_gained
        FROM users u
        JOIN karma_ledger kl ON u.user_id = kl.user_id
        WHERE kl.created_at >= NOW() - INTERVAL '1 day' * $1 AND kl.point_delta > 0
        GROUP BY u.user_id, u.username, u.karma_score
        ORDER BY karma_gained DESC
        LIMIT 10
        """,
        days
    )

    return {
        "period_days": days,
        "user_registration": dict(registration_stats),
        "tier_distribution": [dict(tier) for tier in tier_distribution],
        "user_activity": dict(active_users),
        "ban_statistics": dict(ban_stats),
        "reporting_activity": dict(reporting_stats),
        "top_karma_gainers": [dict(user) for user in top_karma_gainers]
    }



# is_admin() removed — admin role verification is handled by get_current_admin() dependency

async def log_admin_action(
    admin_id: str,
    action_type: str,
    target_type: str,
    target_id: str,
    reason: str,
    details: dict = None
):
    """
    Log an admin action for audit purposes.
    """
    try:
        await db_manager.pg_pool.execute(
            """
            INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb)
            """,
            admin_id, action_type, target_type, target_id, reason,
            json.dumps(details) if details else "{}"
        )
    except Exception as e:
        # Log error but don't fail the operation
        print(f"Failed to log admin action: {e}")

