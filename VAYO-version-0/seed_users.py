import asyncio
import os
from dotenv import load_dotenv
from database import db_manager

# Load environment variables
load_dotenv()

MOCK_PERSONAS = [
    {
        "user_id": "sarah@vayo.com",
        "username": "Sarah",
        "email": "sarah@vayo.com",
        "karma_score": 480,
        "tier_level": 3,
        "bio": "Recently moved from Mumbai! Explorer at heart. You'll find me at pottery workshops, live acoustic music gigs, and trying local street food.",
        "interest_tags": ["Pottery", "Acoustic Gigs", "Street Food", "Art Workshops"],
        "city": "Bangalore",
        "region": "Indiranagar",
        "profile_visibility": "public"
    },
    {
        "user_id": "alex@vayo.com",
        "username": "Alex",
        "email": "alex@vayo.com",
        "karma_score": 340,
        "tier_level": 2,
        "bio": "Quiet coder by day, board game strategist by night. Looking for low-pressure gatherings around cozy cafes.",
        "interest_tags": ["Board Games", "Coding", "Quiet Cafes", "Indie Music"],
        "city": "Bangalore",
        "region": "Koramangala",
        "profile_visibility": "public"
    },
    {
        "user_id": "david@vayo.com",
        "username": "David",
        "email": "david@vayo.com",
        "karma_score": 290,
        "tier_level": 1,
        "bio": "Digital marketer and amateur photographer. Let's catch sunrise views or explore the local indie scene.",
        "interest_tags": ["Photography", "Nature Walks", "Indie Music", "Networking"],
        "city": "Bangalore",
        "region": "HSR Layout",
        "profile_visibility": "public"
    },
    {
        "user_id": "riya@vayo.com",
        "username": "Riya",
        "email": "riya@vayo.com",
        "karma_score": 610,
        "tier_level": 3,
        "bio": "Event organizer and community builder. Passionate about bringing people together for meaningful off-screen activities.",
        "interest_tags": ["Community Gigs", "Public Speaking", "Music", "Active Sports"],
        "city": "Bangalore",
        "region": "Indiranagar",
        "profile_visibility": "public"
    },
    {
        "user_id": "elena@vayo.com",
        "username": "Elena",
        "email": "elena@vayo.com",
        "karma_score": 340,
        "tier_level": 2,
        "bio": "Creative freelancer and art workshop enthusiast. Passionate about design systems and finding cool co-working cafes.",
        "interest_tags": ["Art Workshops", "Creative Writing", "Design Systems", "Cafe Hopping"],
        "city": "Bangalore",
        "region": "Jayanagar",
        "profile_visibility": "public"
    }
]

async def seed():
    print("Connecting to PostgreSQL database...")
    # Initialize the database manager pool manually
    pool = await db_manager.ensure_pool()
    print("Connected.")

    # 1. Insert mock personas
    print("\nInserting mock personas...")
    for p in MOCK_PERSONAS:
        await db_manager.execute(
            """
            INSERT INTO users (
                user_id, username, email, karma_score, tier_level, 
                bio, interest_tags, city, region, profile_visibility
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id) DO UPDATE SET
                username = EXCLUDED.username,
                karma_score = EXCLUDED.karma_score,
                tier_level = EXCLUDED.tier_level,
                bio = EXCLUDED.bio,
                interest_tags = EXCLUDED.interest_tags,
                city = EXCLUDED.city,
                region = EXCLUDED.region;
            """,
            p["user_id"], p["username"], p["email"], p["karma_score"], p["tier_level"],
            p["bio"], p["interest_tags"], p["city"], p["region"], p["profile_visibility"]
        )
        print(f"Upserted mock persona: {p['username']}")

    # 2. Find all registered user emails from waitlist table in Supabase (we can fallback to seeding local users)
    # For now, let's query all existing users in the local PostgreSQL users table (which will include logged-in users)
    # and link them to these personas.
    user_rows = await db_manager.fetch("SELECT user_id, email, username FROM users WHERE user_id NOT IN ('sarah@vayo.com', 'alex@vayo.com', 'david@vayo.com', 'riya@vayo.com', 'elena@vayo.com')")
    
    # If no users exist, let's seed a placeholder user too just in case
    if not user_rows:
        print("\nNo logged-in users found in database yet. Seeding placeholder users to establish relationships...")
        default_emails = ["hello@vayo.com", "priyanshudewangan2004@gmail.com"]
        for email in default_emails:
            user_id = email
            username = email.split("@")[0]
            await db_manager.execute(
                """
                INSERT INTO users (user_id, username, email, karma_score, tier_level, bio, active_mode)
                VALUES ($1, $2, $3, 100, 1, 'Welcome to VAYO!', 'social')
                ON CONFLICT (user_id) DO NOTHING;
                """,
                user_id, username, email
            )
        user_rows = await db_manager.fetch("SELECT user_id, email, username FROM users WHERE user_id NOT IN ('sarah@vayo.com', 'alex@vayo.com', 'david@vayo.com', 'riya@vayo.com', 'elena@vayo.com')")

    print(f"\nSeeding relationships for {len(user_rows)} user(s): {[u['user_id'] for u in user_rows]}")
    for u in user_rows:
        uid = u["user_id"]
        
        # Clean existing connections and requests for this user first to ensure clean idempotency
        await db_manager.execute("DELETE FROM connections WHERE user_id_1 = $1 OR user_id_2 = $1", uid)
        await db_manager.execute("DELETE FROM follow_requests WHERE sender_id = $1 OR receiver_id = $1", uid)
        
        # Connection with Sarah (connected)
        await db_manager.execute(
            "INSERT INTO connections (user_id_1, user_id_2) VALUES ($1, 'sarah@vayo.com') ON CONFLICT DO NOTHING",
            uid
        )
        # Connection with Elena (connected)
        await db_manager.execute(
            "INSERT INTO connections (user_id_1, user_id_2) VALUES ($1, 'elena@vayo.com') ON CONFLICT DO NOTHING",
            uid
        )
        
        # Pending request from David (incoming)
        await db_manager.execute(
            """
            INSERT INTO follow_requests (sender_id, receiver_id, status)
            VALUES ('david@vayo.com', $1, 'pending')
            ON CONFLICT DO NOTHING;
            """,
            uid
        )

        # Pending request to Alex (outgoing)
        await db_manager.execute(
            """
            INSERT INTO follow_requests (sender_id, receiver_id, status)
            VALUES ($1, 'alex@vayo.com', 'pending')
            ON CONFLICT DO NOTHING;
            """,
            uid
        )

    print("\nDatabase seeding completed successfully!")
    await db_manager.close()

if __name__ == "__main__":
    asyncio.run(seed())
