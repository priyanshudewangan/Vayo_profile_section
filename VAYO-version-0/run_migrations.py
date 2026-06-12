import asyncio
import os
from dotenv import load_dotenv
from database import db_manager

load_dotenv()

MIGRATION_FILES = [
    "users_table.sql",
    "profile_modes_migration.sql",
    "karma_migration.sql",
    "whatsapp_migration.sql",
    "schema_fix_migration.sql",
    "add_communities.sql",
    "event_share_migration.sql",
    "events_share_migration.sql"
]

async def run_migrations():
    print("Connecting to PostgreSQL database...")
    pool = await db_manager.ensure_pool()
    print("Connected.")

    for sql_file in MIGRATION_FILES:
        if not os.path.exists(sql_file):
            print(f"Skipping missing migration file: {sql_file}")
            continue
            
        print(f"\nRunning migration: {sql_file}...")
        try:
            with open(sql_file, "r", encoding="utf-8") as f:
                sql_content = f.read()
            
            # Execute the SQL statements
            async with pool.acquire() as conn:
                await conn.execute(sql_content)
            print(f"Migration completed successfully: {sql_file}")
        except Exception as e:
            print(f"Error executing migration {sql_file}: {e}")

    await db_manager.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())
