# Database Schema

## `users`

- `name`: string
- `email`: string, unique
- `password`: hashed string
- `role`: `admin | mentor | student`
- `mentor_id`: ObjectId, optional for students
- `github_username`: string, optional
- `progress`: number
- `created_at`: datetime

## `reports`

- `title`: string
- `week_label`: string
- `content`: markdown string
- `highlights`: string[]
- `blockers`: string[]
- `student_id`: ObjectId
- `mentor_id`: ObjectId
- `attachments`: array of file metadata
- `feedback`: array of mentor comments
- `summary`: AI-generated summary
- `created_at`: datetime
- `updated_at`: datetime

## `tasks`

- `title`: string
- `description`: string
- `student_id`: ObjectId
- `mentor_id`: ObjectId
- `status`: `todo | in_progress | done`
- `tags`: string[]
- `due_date`: datetime
- `created_at`: datetime
- `updated_at`: datetime

## `notifications`

- `user_id`: ObjectId
- `title`: string
- `message`: string
- `type`: string
- `is_read`: boolean
- `created_at`: datetime
