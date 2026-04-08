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

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
