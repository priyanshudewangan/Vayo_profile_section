"""
Profile Modes Router — VAYO
Handles the 3-mode profile system (social / bff / bizz) and verification flags.

Endpoints:
- GET    /api/v1/users/{user_id}/profile          — Full profile with mode fields
- PATCH  /api/v1/users/me/mode                    — Switch active mode
- PATCH  /api/v1/users/me/bio/{mode}              — Update a specific mode bio
- PATCH  /api/v1/users/me/bizz                    — Update bizz role + company
- GET    /api/v1/users/me/verification            — My verification status
- POST   /api/v1/users/me/verification/selfie     — Submit selfie verification request
- POST   /api/v1/users/me/verification/bizz       — Submit bizz verification request

Admin-only:
- PATCH  /api/v1/admin/users/{user_id}/verification  — Approve / reject verification
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import get_current_user, get_current_admin
from database import db_manager
from karma_models import (
    get_karma_history,
    compute_tier,
    get_next_tier_threshold,
    TIER_CONFIG,
    KarmaProfileResponse,
    InboxShieldUpdate,
    KarmaLedgerEntry
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Profile Modes"])

_VALID_MODES = {"social", "bff", "bizz"}


class SwitchModeRequest(BaseModel):
    mode: str = Field(..., description="Target mode: social | bff | bizz")


class UpdateModeBioRequest(BaseModel):
    bio: str = Field(..., min_length=5, max_length=500)


class UpdateBizzInfoRequest(BaseModel):
    bizz_role: Optional[str] = Field(None, max_length=120, description="Job title / role")
    bizz_company: Optional[str] = Field(None, max_length=120, description="Company name")
    bizz_bio: Optional[str] = Field(None, min_length=5, max_length=500)


class VerificationStatusResponse(BaseModel):
    user_id: str
    selfie_verified: bool
    bizz_verified: bool


class AdminVerificationPatchRequest(BaseModel):
    selfie_verified: Optional[bool] = None
    bizz_verified: Optional[bool] = None


@router.get("/api/v1/users/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Returns the full profile for a user, including all mode fields.
    The caller's active_mode controls which bio is surfaced as the
    primary bio in the response.
    """
    row = await db_manager.fetchrow(
        """
        SELECT
            user_id, username, karma_score, tier_level,
            active_mode,
            bio, social_bio, bff_bio, bizz_bio,
            bizz_role, bizz_company,
            selfie_verified, bizz_verified,
            interest_tags, city, region,
            profile_visibility, show_karma_score, show_last_seen, last_seen,
            created_at
        FROM users
        WHERE user_id = $1
        """,
        user_id,
    )

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    data = dict(row)

    # Respect privacy settings for non-self requests
    viewer_id: str = current_user["sub"]
    if viewer_id != user_id:
        if data["profile_visibility"] == "hidden":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This profile is private.",
            )
        if not data.get("show_karma_score"):
            data.pop("karma_score", None)
        if not data.get("show_last_seen"):
            data.pop("last_seen", None)

    # Serialise timestamps
    for ts_field in ("last_seen", "created_at"):
        if data.get(ts_field):
            data[ts_field] = data[ts_field].isoformat()

    return data


@router.patch("/api/v1/users/me/mode", status_code=status.HTTP_200_OK)
async def switch_active_mode(
    body: SwitchModeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Flips the user's active profile mode.
    The frontend should re-render the profile card immediately on success.
    """
    user_id: str = current_user["sub"]

    if body.mode not in _VALID_MODES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"mode must be one of: {', '.join(sorted(_VALID_MODES))}",
        )

    await db_manager.execute(
        "UPDATE users SET active_mode = $1 WHERE user_id = $2",
        body.mode, user_id,
    )

    return {"status": "success", "active_mode": body.mode}


@router.patch("/api/v1/users/me/bio/{mode}", status_code=status.HTTP_200_OK)
async def update_mode_bio(
    mode: str,
    body: UpdateModeBioRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Updates the bio for a specific mode.
    - social → social_bio  (also syncs the legacy `bio` column)
    - bff    → bff_bio
    - bizz   → bizz_bio
    """
    user_id: str = current_user["sub"]

    if mode not in _VALID_MODES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"mode must be one of: {', '.join(sorted(_VALID_MODES))}",
        )

    col = f"{mode}_bio"

    if mode == "social":
        # Keep the legacy `bio` column in sync for older queries
        await db_manager.execute(
            f"UPDATE users SET {col} = $1, bio = $1 WHERE user_id = $2",
            body.bio, user_id,
        )
    else:
        await db_manager.execute(
            f"UPDATE users SET {col} = $1 WHERE user_id = $2",
            body.bio, user_id,
        )

    return {"status": "success", "mode": mode, "bio": body.bio}



@router.patch("/api/v1/users/me/bizz", status_code=status.HTTP_200_OK)
async def update_bizz_info(
    body: UpdateBizzInfoRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Updates bizz-mode professional fields.
    All fields are optional — only provided fields are updated.
    """
    user_id: str = current_user["sub"]

    if not any([body.bizz_role, body.bizz_company, body.bizz_bio]):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one of: bizz_role, bizz_company, bizz_bio.",
        )

    # Build a dynamic SET clause from whichever fields were supplied
    updates: list[str] = []
    params: list = []
    idx = 1

    for field, value in [
        ("bizz_role", body.bizz_role),
        ("bizz_company", body.bizz_company),
        ("bizz_bio", body.bizz_bio),
    ]:
        if value is not None:
            updates.append(f"{field} = ${idx}")
            params.append(value)
            idx += 1

    params.append(user_id)
    sql = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ${idx}"
    await db_manager.execute(sql, *params)

    return {"status": "success", "updated_fields": [f for f, v in [
        ("bizz_role", body.bizz_role),
        ("bizz_company", body.bizz_company),
        ("bizz_bio", body.bizz_bio),
    ] if v is not None]}



@router.get("/api/v1/users/me/verification", response_model=VerificationStatusResponse)
async def get_my_verification(current_user: dict = Depends(get_current_user)):
    """Returns the caller's selfie and bizz verification status."""
    user_id: str = current_user["sub"]

    row = await db_manager.fetchrow(
        "SELECT user_id, selfie_verified, bizz_verified FROM users WHERE user_id = $1",
        user_id,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    return VerificationStatusResponse(**dict(row))


@router.post("/api/v1/users/me/verification/selfie", status_code=status.HTTP_202_ACCEPTED)
async def request_selfie_verification(
    current_user: dict = Depends(get_current_user),
):
    """
    Signals that a user has submitted their selfie for verification.
    The actual image comparison / liveness check happens outside this service
    (e.g. a dedicated verification microservice or manual admin review).
    This endpoint logs the request so admins can action it.
    """
    user_id: str = current_user["sub"]

    row = await db_manager.fetchrow(
        "SELECT selfie_verified FROM users WHERE user_id = $1", user_id
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if row["selfie_verified"]:
        return {"status": "already_verified", "message": "Selfie already verified."}

    # Record a pending admin action so the review queue sees it
    await db_manager.execute(
        """
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
        VALUES ('system', 'verification_request', 'user', $1, 'Selfie verification requested by user',
                '{"verification_type": "selfie", "status": "pending"}')
        """,
        user_id,
    )

    logger.info(f"Selfie verification requested by user {user_id}")
    return {
        "status": "pending",
        "message": "Selfie verification request submitted. You'll be notified once reviewed.",
    }



@router.post("/api/v1/users/me/verification/bizz", status_code=status.HTTP_202_ACCEPTED)
async def request_bizz_verification(
    current_user: dict = Depends(get_current_user),
):
    """
    Signals that a user has submitted documents for bizz verification
    (e.g. work email confirmation, LinkedIn link, or company ID).
    """
    user_id: str = current_user["sub"]

    row = await db_manager.fetchrow(
        "SELECT bizz_verified, bizz_role, bizz_company FROM users WHERE user_id = $1",
        user_id,
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if row["bizz_verified"]:
        return {"status": "already_verified", "message": "Bizz profile already verified."}
    if not row["bizz_role"] or not row["bizz_company"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please fill in bizz_role and bizz_company before requesting bizz verification.",
        )

    await db_manager.execute(
        """
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
        VALUES ('system', 'verification_request', 'user', $1, 'Bizz verification requested by user',
                '{"verification_type": "bizz", "status": "pending"}')
        """,
        user_id,
    )

    logger.info(f"Bizz verification requested by user {user_id}")
    return {
        "status": "pending",
        "message": "Bizz verification request submitted. You'll be notified once reviewed.",
    }



@router.patch(
    "/api/v1/admin/users/{user_id}/verification",
    status_code=status.HTTP_200_OK,
)
async def admin_set_verification(
    user_id: str,
    body: AdminVerificationPatchRequest,
    current_admin: dict = Depends(get_current_admin),
):
    """
    Admin endpoint to set selfie_verified and/or bizz_verified flags directly.
    Logs the action in admin_actions for audit trail.
    """
    if body.selfie_verified is None and body.bizz_verified is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one of: selfie_verified, bizz_verified.",
        )

    row = await db_manager.fetchrow(
        "SELECT user_id FROM users WHERE user_id = $1", user_id
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    updates: list[str] = []
    params: list = []
    idx = 1

    for field, value in [
        ("selfie_verified", body.selfie_verified),
        ("bizz_verified", body.bizz_verified),
    ]:
        if value is not None:
            updates.append(f"{field} = ${idx}")
            params.append(value)
            idx += 1

    params.append(user_id)
    await db_manager.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE user_id = ${idx}", *params
    )

    admin_id: str = current_admin["sub"]
    await db_manager.execute(
        """
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, reason, details)
        VALUES ($1, 'verification_update', 'user', $2, 'Admin updated verification flags', $3)
        """,
        admin_id,
        user_id,
        str({"selfie_verified": body.selfie_verified, "bizz_verified": body.bizz_verified}),
    )

    logger.info(
        f"Admin {admin_id} updated verification for {user_id}: "
        f"selfie={body.selfie_verified}, bizz={body.bizz_verified}"
    )

    return {
        "status": "success",
        "user_id": user_id,
        "updated": {
            k: v for k, v in [
                ("selfie_verified", body.selfie_verified),
                ("bizz_verified", body.bizz_verified),
            ]
            if v is not None
        },
    }


# -------------------------------------------------------------
# Karma Reputation Ledger Endpoints
# -------------------------------------------------------------

@router.get("/api/v1/users/{user_id}/karma", response_model=KarmaProfileResponse)
async def get_user_karma_profile(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves the user's reputation score, calculated tier, next threshold,
    inbox shield settings, and paginated ledger history.
    """
    user_row = await db_manager.fetchrow(
        "SELECT karma_score, tier_level, inbox_shield_threshold FROM users WHERE user_id = $1",
        user_id
    )
    if not user_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    score = user_row["karma_score"] or 0
    tier = compute_tier(score)
    tier_label = TIER_CONFIG[tier]["label"] if tier else "Beginner"
    next_threshold = get_next_tier_threshold(score)
    
    # Retrieve ledger entries
    history_rows = await get_karma_history(user_id, limit=50, offset=0)
    ledger = []
    for r in history_rows:
        ledger.append(
            KarmaLedgerEntry(
                id=str(r["id"]),
                action_type=r["action_type"],
                point_delta=r["point_delta"],
                reference_id=r.get("reference_id"),
                created_at=r["created_at"]
            )
        )
        
    return KarmaProfileResponse(
        user_id=user_id,
        karma_score=score,
        tier=tier,
        tier_label=tier_label,
        tier_level=user_row["tier_level"] or 1,
        next_tier_threshold=next_threshold,
        inbox_shield_threshold=user_row["inbox_shield_threshold"] or 0,
        ledger=ledger
    )


@router.patch("/api/v1/users/me/inbox-shield", status_code=status.HTTP_200_OK)
async def update_my_inbox_shield(
    body: InboxShieldUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Updates the authenticated user's inbox shield threshold.
    """
    user_id = current_user["sub"]
    
    await db_manager.execute(
        "UPDATE users SET inbox_shield_threshold = $1 WHERE user_id = $2",
        body.threshold, user_id
    )
    
    return {
        "status": "success",
        "message": "Inbox shield threshold updated successfully.",
        "threshold": body.threshold
    }

