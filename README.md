# Remote Internship Progress Dashboard

Remote Internship Progress Dashboard is a full-stack internal platform for managing internship progress across students, mentors, and admins.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + Motor
- Database: MongoDB
- Auth: JWT
- Charts: Recharts

## Features

- Role-based authentication for Admin, Mentor, and Student
- Weekly markdown reports with file uploads
- Mentor feedback on reports
- Drag-and-drop Kanban board
- Student progress tracking with completion percentages
- Notifications for submissions and feedback
- Analytics dashboard with performance charts
- Search and filtering for tasks and reports
- GitHub commit activity integration
- AI-generated report summaries

## Project Structure

```text
backend/
  app/
    api/
    core/
    db/
    schemas/
    services/
  requirements.txt
frontend/
  src/
    app/
    services/
  package.json
```

## Local Setup

### 1) Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Frontend (Vite)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 3) Health Check

- Backend health endpoint: `http://localhost:8000/api/health`

## Environment Variables

### Backend (`backend/.env`)

- `MONGODB_URL`
- `DATABASE_NAME`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `FRONTEND_URL` (comma-separated allowed, e.g. localhost + Vercel URL)
- Optional: `OPENAI_API_KEY`, `OPENAI_MODEL`, `GITHUB_TOKEN`

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL` (example: `https://your-backend-service.onrender.com/api`)

## Deployment

### A) MongoDB Atlas

1. Create Atlas cluster.
2. Create database user and whitelist access.
3. Copy connection string and use it as `MONGODB_URL`.

### B) Backend on Render

1. Create a new **Web Service** from your repo.
2. Root directory: `backend`
3. Build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add env vars in Render:
   - `MONGODB_URL`
   - `DATABASE_NAME`
   - `SECRET_KEY`
   - `ALGORITHM`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`
   - `FRONTEND_URL` (your Vercel URL, plus localhost URLs if needed)
   - Optional: `OPENAI_API_KEY`, `OPENAI_MODEL`, `GITHUB_TOKEN`
6. Verify:
   - `https://<render-service>.onrender.com/api/health`

### C) Frontend on Vercel

1. Import repo in Vercel.
2. Set project root to `frontend`.
3. Framework preset: `Vite`.
4. Add env var:
   - `VITE_API_BASE_URL=https://<render-service>.onrender.com/api`
5. Build command:
   ```bash
   npm run build
   ```
6. Output directory: `dist`

## Notes

- CORS is configured using `FRONTEND_URL` plus localhost defaults.
- Frontend no longer uses hardcoded localhost API URLs.
