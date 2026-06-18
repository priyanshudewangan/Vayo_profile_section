import asyncio
import os
import sys
import asyncpg
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), "../VAYO-version-0"))

async def main():
    load_dotenv(os.path.join(os.path.dirname(__file__), "../VAYO-version-0/.env"))
    
    db_host = os.getenv("POSTGRES_HOST", "localhost")
    db_port = int(os.getenv("POSTGRES_PORT", 5432))
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pass = os.getenv("POSTGRES_PASSWORD", "")
    db_name = os.getenv("POSTGRES_DB", "community_matching")
    
    try:
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_pass,
            database=db_name
        )
        events = await conn.fetch("SELECT event_id, title, status FROM events")
        print("Local Postgres Events:")
        for e in events:
            print(f"  ID: {e['event_id']}, Title: {e['title']}, Status: {e['status']}")
        await conn.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
