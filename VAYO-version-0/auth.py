"""
Clerk Authentication and Webhook Verification Module
"""
import os
import hmac
import hashlib
import base64
import logging
from typing import Dict, Optional
import jwt
from jwt import PyJWKClient
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db_manager

logger = logging.getLogger(__name__)

# FastAPI Security Scheme for Bearer Token
security_scheme = HTTPBearer(auto_error=False)

# JWK Client Cache
_jwk_client: Optional[PyJWKClient] = None

def get_jwk_client() -> PyJWKClient:
    """Gets or initializes the PyJWKClient for Clerk JWKS verification."""
    global _jwk_client
    if _jwk_client is None:
        jwks_url = os.getenv("CLERK_JWKS_URL")
        if not jwks_url:
            # Try to build JWKS URL if Clerk API URL or Frontend API is present
            clerk_api_url = os.getenv("CLERK_API_URL") or os.getenv("CLERK_FRONTEND_API")
            if clerk_api_url:
                if not clerk_api_url.startswith("http"):
                    clerk_api_url = f"https://{clerk_api_url}"
                jwks_url = f"{clerk_api_url.rstrip('/')}/.well-known/jwks.json"
        
        if not jwks_url:
            logger.warning("CLERK_JWKS_URL is not set. Token verification might fail unless CLERK_JWT_PUBLIC_KEY is provided.")
            jwks_url = "https://api.clerk.com/v1/jwks"  # fallback default
            
        _jwk_client = PyJWKClient(jwks_url)
    return _jwk_client


def verify_clerk_jwt(token: str) -> Dict:
    """
    Decodes and verifies a custom local JWT access token.
    Uses the shared JWT_SECRET environment variable.
    """
    jwt_secret = os.getenv("JWT_SECRET")
    if not jwt_secret:
        logger.warning("JWT_SECRET is not configured in environment. Using default fallback.")
        jwt_secret = "9d8f376f9202a0a256bd4dcf3c8808940428f6e2b10a2624ea3550e502c3886f"
        
    try:
        return jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError as e:
        logger.error(f"JWT Token Expired: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid JWT Token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"JWT Verification Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )



async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict:
    """
    FastAPI dependency to extract and verify custom JWT user identity from request headers.
    Returns the decoded token claims dictionary. Auto-creates user row if missing.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    claims = verify_clerk_jwt(credentials.credentials)
    
    user_id = claims.get("sub")
    email = claims.get("email")
    username = claims.get("username") or (email.split("@")[0] if email else "User")
    
    if user_id:
        try:
            # Check if user already exists
            row = await db_manager.fetchrow("SELECT user_id FROM users WHERE user_id = $1", user_id)
            if not row:
                logger.info(f"User {user_id} not found in database. Initializing user row.")
                await db_manager.execute(
                    """
                    INSERT INTO users (user_id, username, email, karma_score, tier_level, bio, active_mode)
                    VALUES ($1, $2, $3, 100, 1, 'Welcome to VAYO!', 'social')
                    ON CONFLICT (user_id) DO NOTHING;
                    """,
                    user_id, username, email
                )
        except Exception as e:
            logger.error(f"Error checking/initializing user {user_id} in database: {e}")
            
    return claims



async def get_current_admin(current_user: Dict = Depends(get_current_user)) -> Dict:
    """
    FastAPI dependency that enforces the caller must be an authorized admin.
    Checks user claims for the 'admin' role in public metadata or direct role claim.
    """
    # Clerk public metadata is mapped to 'metadata' or 'public_metadata' or 'role' in JWT templates
    role = (
        current_user.get("role") or
        current_user.get("metadata", {}).get("role") or
        current_user.get("public_metadata", {}).get("role")
    )
    
    if role != "admin":
        logger.warning(f"Unauthorized admin access attempt by user: {current_user.get('sub')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
        
    return current_user


def verify_clerk_webhook_signature(
    body_bytes: bytes,
    svix_id: str,
    svix_timestamp: str,
    svix_signature: str,
    secret: Optional[str] = None
) -> bool:
    """
    Verifies Clerk Webhook signature using Svix headers.
    Avoids mandatory external svix package dependency by implementing standard HMAC-SHA256 verification.
    """
    webhook_secret = secret or os.getenv("CLERK_WEBHOOK_SECRET")
    if not webhook_secret:
        logger.error("CLERK_WEBHOOK_SECRET is not configured. Webhook signature verification rejected.")
        return False
        
    # Remove whsec_ prefix if present
    if webhook_secret.startswith("whsec_"):
        webhook_secret = webhook_secret[6:]
        
    try:
        secret_bytes = base64.b64decode(webhook_secret)
    except Exception:
        # Fallback to direct bytes if not standard base64
        secret_bytes = webhook_secret.encode("utf-8")
        
    to_sign = f"{svix_id}.{svix_timestamp}.".encode("utf-8") + body_bytes
    
    # Extract the signatures from the svix-signature header
    signatures = svix_signature.split(" ")
    for sig in signatures:
        if not sig.startswith("v1,"):
            continue
        received_sig = sig[3:]
        try:
            received_sig_bytes = base64.b64decode(received_sig)
        except Exception:
            continue
            
        # Compute expected signature
        expected_sig_bytes = hmac.new(secret_bytes, to_sign, hashlib.sha256).digest()
        
        if hmac.compare_digest(expected_sig_bytes, received_sig_bytes):
            return True
            
    return False
