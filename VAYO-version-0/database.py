"""
Database Layer - PostgreSQL & Pinecone Integration
"""
import asyncpg
import asyncio
import logging
import os
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages PostgreSQL and Pinecone connections with lazy initialization"""
    
    def __init__(self):
        self._pg_pool: Optional[asyncpg.Pool] = None
        self.pinecone_client = None
        self.pinecone_index = None
        self._lock = asyncio.Lock()
        
    @property
    def pg_pool(self) -> asyncpg.Pool:
        """Access the pool. Note: Use await ensure_pool() first in async contexts."""
        if self._pg_pool is None:
            # We can't await here, so we rely on explicit initialization 
            # or the helper methods below.
            pass
        return self._pg_pool

    @pg_pool.setter
    def pg_pool(self, value):
        self._pg_pool = value

    async def ensure_pool(self):
        """Ensures the pool is initialized, safe for concurrent calls."""
        if self._pg_pool is not None:
            return self._pg_pool
            
        async with self._lock:
            if self._pg_pool is None:
                self._pg_pool = await asyncpg.create_pool(
                    host=os.getenv("POSTGRES_HOST", "localhost"),
                    port=int(os.getenv("POSTGRES_PORT", 5432)),
                    user=os.getenv("POSTGRES_USER", "postgres"),
                    password=os.getenv("POSTGRES_PASSWORD"),
                    database=os.getenv("POSTGRES_DB", "community_matching"),
                    min_size=5,
                    max_size=20,
                    command_timeout=15
                )
            return self._pg_pool

    async def initialize_postgres(self):
        """Compatibility method"""
        await self.ensure_pool()
            
    async def close(self):
        async with self._lock:
            if self._pg_pool:
                await self._pg_pool.close()
                self._pg_pool = None

    # Helper methods that handle initialization automatically
    async def execute(self, query: str, *args):
        pool = await self.ensure_pool()
        return await pool.execute(query, *args)

    async def fetch(self, query: str, *args):
        pool = await self.ensure_pool()
        return await pool.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        pool = await self.ensure_pool()
        return await pool.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        pool = await self.ensure_pool()
        return await pool.fetchval(query, *args)

    def initialize_pinecone(self):
        """Stub — Pinecone not yet configured. Calls are no-ops."""
        pass

    # ------------------------------------------------------------------
    # Pinecone stub methods — called by celery_tasks.py.
    # Returns None / [] so the task gracefully falls back to embedding
    # generation when Pinecone is not configured.
    # ------------------------------------------------------------------

    def get_user_vector_from_pinecone(self, user_id: str) -> Optional[List[float]]:
        """Retrieve a user's embedding vector from Pinecone. Stub returns None."""
        logger.debug("Pinecone not configured — get_user_vector_from_pinecone is a no-op")
        return None

    def save_user_vector_to_pinecone(self, user_id: str, vector: List[float]) -> None:
        """Persist a user's embedding vector to Pinecone. Stub is a no-op."""
        logger.debug("Pinecone not configured — save_user_vector_to_pinecone is a no-op")

    def vector_search(
        self,
        query_vector: List[float],
        community_ids: List[str],
        top_k: int = 10,
    ) -> List[Dict]:
        """Perform a vector similarity search in Pinecone. Stub returns empty list."""
        logger.debug("Pinecone not configured — vector_search returning empty list")
        return []

    async def get_popular_communities(self, limit: int = 10) -> List[Dict]:
        """Fallback: return most-member communities from PostgreSQL."""
        rows = await self.fetch(
            """
            SELECT community_id, community_name,
                   COALESCE(category, 'General') AS category,
                   COALESCE(member_count, 0) AS member_count,
                   0 AS recent_activity
            FROM communities
            ORDER BY member_count DESC
            LIMIT $1
            """,
            limit,
        )
        return [dict(r) for r in rows]

    async def filter_communities_by_location(self, city: str, timezone: str, limit: int = 1000) -> List[Dict]:
        query = """
            SELECT community_id, community_name,
                   COALESCE(category, 'General') AS category,
                   COALESCE(member_count, 0) AS member_count,
                   0 AS recent_activity
            FROM communities
            WHERE city = $1 AND timezone = $2 AND is_active = true
            LIMIT $3
        """
        rows = await self.fetch(query, city, timezone, limit)
        return [dict(row) for row in rows]

db_manager = DatabaseManager()
