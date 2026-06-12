import asyncio
import os
from dotenv import load_dotenv
from database import db_manager

load_dotenv()

async def seed_notifications():
    print("Connecting to database...")
    await db_manager.ensure_pool()
    print("Connected.")

    # Get non-mock users
    users = await db_manager.fetch(
        "SELECT user_id FROM users WHERE user_id NOT IN ('sarah@vayo.com', 'alex@vayo.com', 'david@vayo.com', 'riya@vayo.com', 'elena@vayo.com')"
    )

    for u in users:
        uid = u["user_id"]
        print(f"\nSeeding notifications for user: {uid}")

        # Try to find the follow request from david@vayo.com to this user
        req = await db_manager.fetchrow(
            "SELECT id FROM follow_requests WHERE sender_id = 'david@vayo.com' AND receiver_id = $1 LIMIT 1",
            uid
        )
        req_id = str(req["id"]) if req else None

        # Clean existing notifications for this user first
        await db_manager.execute("DELETE FROM notifications WHERE user_id = $1", uid)

        # 1. Connect Request from David
        if req_id:
            await db_manager.execute(
                """
                INSERT INTO notifications (user_id, actor_id, type, title, body, reference_id, is_read)
                VALUES ($1, 'david@vayo.com', 'CONNECT_REQUEST', 'New Karma Connect Request', $2, $3, FALSE)
                """,
                uid, f"@David wants to Karma Connect with you", req_id
            )
            print("Seeded CONNECT_REQUEST notification.")

        # 2. Connect Accepted from Sarah
        await db_manager.execute(
            """
            INSERT INTO notifications (user_id, actor_id, type, title, body, is_read)
            VALUES ($1, 'sarah@vayo.com', 'CONNECT_ACCEPTED', 'Karma Connect Accepted!', '@Sarah accepted your Karma Connect request. You can now chat!', FALSE)
            """,
            uid
        )
        print("Seeded CONNECT_ACCEPTED notification.")

        # 3. Karma Tier Upgrade
        await db_manager.execute(
            """
            INSERT INTO notifications (user_id, type, title, body, is_read)
            VALUES ($1, 'KARMA_TIER_UPGRADE', 'Vibe Alert — Level Up!', 'You have reached Pathfinder! New features unlocked.', FALSE)
            """,
            uid
        )
        print("Seeded KARMA_TIER_UPGRADE notification.")

    print("\nNotification seeding completed successfully!")
    await db_manager.close()

if __name__ == "__main__":
    asyncio.run(seed_notifications())
