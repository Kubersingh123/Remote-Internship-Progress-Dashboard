export type Role = "admin" | "mentor" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  mentor_id?: string | null;
  github_username?: string | null;
  progress: number;
}

export interface Feedback {
  author_name: string;
  comment: string;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  week_label: string;
  content: string;
  summary: string;
  highlights: string[];
  blockers: string[];
  attachments: { name: string; path: string }[];
  feedback: Feedback[];
  student_id: string;
  mentor_id?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  student_id: string;
  mentor_id?: string | null;
  tags: string[];
  due_date?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
