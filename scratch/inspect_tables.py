import asyncio
import os
import sys
import asyncpg
from dotenv import load_dotenv

# Add VAYO-version-0 to path to load database config
sys.path.append(os.path.join(os.path.dirname(__file__), "../VAYO-version-0"))

async def main():
    load_dotenv(os.path.join(os.path.dirname(__file__), "../VAYO-version-0/.env"))
    
    db_host = os.getenv("POSTGRES_HOST", "localhost")
    db_port = int(os.getenv("POSTGRES_PORT", 5432))
    db_user = os.getenv("POSTGRES_USER", "postgres")
    db_pass = os.getenv("POSTGRES_PASSWORD", "")
    db_name = os.getenv("POSTGRES_DB", "community_matching")
    
    print(f"Connecting to local PG DB: {db_name} as {db_user}...")
    try:
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_pass,
            database=db_name
        )
        print("Connected successfully!")
        
        # Get tables
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        print("Tables in public schema:", [t['table_name'] for t in tables])
        
        # Check columns of events
        if any(t['table_name'] == 'events' for t in tables):
            columns = await conn.fetch("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'events'
            """)
            print("Columns of 'events' table:")
            for col in columns:
                print(f"  {col['column_name']}: {col['data_type']}")
        else:
            print("Table 'events' does not exist in local database.")
            
        await conn.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
