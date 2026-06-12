# 🚀 Running the VAYO Python Backend

This guide details the steps to start the FastAPI backend server and manage its database locally on your macOS machine.

---

## 🛠️ Step-by-Step Launch Guide

Open a new terminal window on your machine and run the following commands:

### 1. Navigate to the backend directory:
```bash
cd VAYO-version-0
```

### 2. Activate the Python virtual environment:
```bash
source venv/bin/activate
```

### 3. Start the FastAPI development server:
```bash
uvicorn api:app --reload --port 8000
```

* **Server URL**: [http://localhost:8000](http://localhost:8000)
* **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs) (View and test all endpoints interactively).
* **ReDoc API Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 💾 Local Database Credentials

The backend connects to your local PostgreSQL instance on startup. The settings are saved in `VAYO-version-0/.env`:

* **Host**: `localhost`
* **Port**: `5432`
* **User**: `chata` (Mac default Homebrew role)
* **Password**: *(None/Blank)*
* **Database Name**: `community_matching`

### Running database migrations (already completed):
If you ever need to manually reset or re-run the database migrations, run this command from the `VAYO-version-0` folder:
```bash
psql -U chata -d community_matching -f users_table.sql \
  && psql -U chata -d community_matching -f schema_fix_migration.sql \
  && psql -U chata -d community_matching -f karma_migration.sql \
  && psql -U chata -d community_matching -f whatsapp_migration.sql \
  && psql -U chata -d community_matching -f events_share_migration.sql \
  && psql -U chata -d community_matching -f add_communities.sql
```

---

## ⚙️ Background Workers (Optional)

If you are testing matching logic or processing asynchronous vector searches, run the Celery worker in a separate terminal:
```bash
cd VAYO-version-0
source venv/bin/activate
celery -A celery_tasks worker --loglevel=info
```
*(Requires a running Redis server locally).*
