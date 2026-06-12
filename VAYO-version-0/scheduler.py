import asyncio
import logging
from datetime import datetime, timezone
from database import db_manager
from event_scheduler import event_reminder_job, no_show_penalty_job

logger = logging.getLogger(__name__)

async def cleanup_event_subchats():
    """
    Background job to close and clean up event sub-chats (Section 5.2).
    Runs every 15 minutes.
    """
    while True:
        try:
            logger.info("Running sub-chat cleanup job...")
            now = datetime.now(timezone.utc)
            
            # 1. Mark events as ended if their time has passed
            # (Assuming event_date + some duration = end time)
            # For simplicity, we mark events older than 6 hours as ended
            await db_manager.execute(
                "UPDATE meetups SET status = 'ended' WHERE status = 'finalized' AND created_at < NOW() - INTERVAL '6 hours'"
            )
            
            # 2. Delete sub-chats if marked for auto-delete
            # (This is a future-proof placeholder as per Section 5.2)
            # Find sub-chats of ended events
            ended_subchats = await db_manager.fetch(
                "SELECT event_group_id FROM meetups WHERE status = 'ended' AND event_group_id IS NOT NULL"
            )
            
            for row in ended_subchats:
                group_id = row["event_group_id"]
                # Hard delete group or just mark as closed
                await db_manager.execute("DELETE FROM group_chats WHERE id = $1", group_id)
                logger.info(f"Cleaned up sub-chat: {group_id}")
                
        except Exception as e:
            logger.error(f"Cleanup job error: {e}")
            
        await asyncio.sleep(900) # 15 minutes

def start_scheduler():
    asyncio.create_task(cleanup_event_subchats())
    asyncio.create_task(event_reminder_job())
    asyncio.create_task(no_show_penalty_job())
