# API Overview

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Users

- `GET /api/users`
- `GET /api/users/students/{student_id}`

## Reports

- `GET /api/reports`
- `POST /api/reports`
- `POST /api/reports/{report_id}/upload`
- `POST /api/reports/{report_id}/feedback`

## Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/{task_id}`

## Analytics

- `GET /api/analytics/overview`

## Notifications

- `GET /api/notifications`
- `PATCH /api/notifications/{notification_id}/read`
