"""
FastAPI Primary Application Entrypoint
Integrates matching pipeline, social connections, administrative portal, 
and Clerk authentication / webhook integrations.
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from celery.result import AsyncResult

from celery_tasks import celery_app, process_match_task
from models import (
    UserProfileInput,
    TaskStatusResponse,
    MatchResult,
)
from database import db_manager
from auth import get_current_user, verify_clerk_webhook_signature
from connections_router import router as connections_router
from admin_router.admin_router import router as admin_router
from events_router import router as events_router
from whatsapp_router import router as whatsapp_router
from notifications_router import router as notifications_router
# from moments_router import router as moments_router
from profile_modes_router import router as profile_modes_router

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB pools
    is_test_env = db_manager.pg_pool is not None
    if not is_test_env:
        await db_manager.initialize_postgres()
    db_manager.initialize_pinecone()
    
    yield
    if not is_test_env:
        await db_manager.close()


app = FastAPI(
    title="AI-Powered Community Matching System v2.0",
    description="Intelligent onboarding with <2s matching using hybrid algorithms",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(connections_router)
app.include_router(admin_router)
app.include_router(events_router)
app.include_router(whatsapp_router)
app.include_router(notifications_router)
# app.include_router(moments_router)
app.include_router(profile_modes_router)

# Request schemas for new endpoints
class UpdateBioRequest(BaseModel):
    bio: str = Field(..., min_length=10, max_length=500, description="New user biography")
    
    @validator('bio')
    def validate_bio(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Bio must be at least 10 characters')
        return v.strip()


# Matching Endpoints
@app.post("/api/v1/match", response_model=TaskStatusResponse, status_code=202)
async def initiate_match(profile: UserProfileInput):
    task = process_match_task.apply_async(
        kwargs={"user_data": profile.dict()},
        expires=60,
    )
    return TaskStatusResponse(
        task_id=task.id,
        status="processing",
        estimated_time_ms=2000,
        websocket_channel=f"match_updates_{profile.user_id}",
    )


@app.get("/api/v1/match/{task_id}")
async def get_match_result(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)

    if task_result.state in ["PENDING", "STARTED"]:
        return {"task_id": task_id, "status": "processing"}

    if task_result.state == "FAILURE":
        return {"task_id": task_id, "status": "failed", "error": str(task_result.info)}

    if task_result.state == "SUCCESS":
        if isinstance(task_result.result, dict):
            return task_result.result
        try:
            return MatchResult(**task_result.result)
        except Exception:
            return task_result.result

    return {"task_id": task_id, "status": task_result.state.lower()}


# Health & Metadata
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "postgres": "connected" if db_manager.pg_pool else "disconnected",
        "redis": "connected"
    }


# -------------------------------------------------------------
# 1. Clerk Webhook Handler (POST /webhooks/clerk)
# -------------------------------------------------------------
@app.post("/webhooks/clerk", status_code=200)
async def clerk_webhook_handler(request: Request):
    """
    Webhook handler to receive Clerk user events (user.created, user.updated)
    and synchronize user profiles with the local PostgreSQL database.
    """
    # 1. Capture Svix validation headers
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")
    
    if not svix_id or not svix_timestamp or not svix_signature:
        logger.error("Missing Svix webhook headers")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Svix verification headers"
        )
        
    # Read raw body
    body_bytes = await request.body()
    
    # 2. Verify signature
    is_valid = verify_clerk_webhook_signature(
        body_bytes=body_bytes,
        svix_id=svix_id,
        svix_timestamp=svix_timestamp,
        svix_signature=svix_signature
    )
    
    if not is_valid:
        logger.error("Invalid Clerk webhook signature detected")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature"
        )
        
    # 3. Parse and process payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )
        
    event_type = payload.get("type")
    data = payload.get("data", {})
    
    if event_type in ("user.created", "user.updated"):
        user_id = data.get("id")
        username = data.get("username")
        
        email_addresses = data.get("email_addresses", [])
        email = None
        if email_addresses:
            email = email_addresses[0].get("email_address")
            
        if not user_id:
            logger.error(f"Clerk webhook data missing user ID: {data}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="User ID is required in Clerk webhook payload"
            )
            
        logger.info(f"Upserting user from Clerk event '{event_type}': {user_id}")
        
        # Upsert into PostgreSQL users table
        try:
            await db_manager.execute(
                """
                INSERT INTO users (user_id, username, email)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE
                SET username = EXCLUDED.username,
                    email = EXCLUDED.email;
                """,
                user_id, username, email
            )
        except Exception as e:
            logger.error(f"Failed to upsert user {user_id} into database: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database update failed"
            )
            
        return {"status": "success", "message": f"User {user_id} successfully synchronized."}
        
    logger.info(f"Ignored unsupported Clerk webhook event: {event_type}")
    return {"status": "ignored", "message": f"Event type '{event_type}' not processed."}


# -------------------------------------------------------------
# 2. PATCH /api/v1/users/{user_id}/profile (Update bio)
# -------------------------------------------------------------
@app.patch("/api/v1/users/{user_id}/profile", status_code=200)
async def update_user_profile(
    user_id: str,
    body: UpdateBioRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Updates the biography of a user after onboarding.
    Requires Clerk JWT authentication. Enforces that a user can only edit their own bio.
    """
    authenticated_id = current_user.get("sub")
    
    # Enforce standard role safety (user can only update their own profile)
    if authenticated_id != user_id:
        # Check if caller is an admin
        role = (
            current_user.get("role") or
            current_user.get("metadata", {}).get("role") or
            current_user.get("public_metadata", {}).get("role")
        )
        if role != "admin":
            logger.warning(f"User {authenticated_id} attempted unauthorized bio edit for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this profile."
            )
            
    # Verify user exists in the database
    user = await db_manager.fetchrow("SELECT user_id FROM users WHERE user_id = $1", user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' does not exist in local database."
        )
        
    # Update the user profile bio
    try:
        await db_manager.execute(
            """
            UPDATE users
            SET bio = $1
            WHERE user_id = $2;
            """,
            body.bio, user_id
        )
    except Exception as e:
        logger.error(f"Failed to update user bio in database for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database update failed"
        )
        
    return {
        "status": "success",
        "message": "Biography updated successfully.",
        "user_id": user_id
    }
