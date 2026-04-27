export type UserRole = "admin" | "mentor" | "student";

export type AppRoute =
  | "dashboard"
  | "tasks"
  | "reports"
  | "analytics"
  | "settings"
  | "users"
  | "internships"
  | "progress";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mentor_id?: string | null;
  internship_id?: string | null;
  github_username?: string | null;
  progress?: number;
  created_at?: string;
}

export interface Internship {
  id: string;
  title: string;
  domain: string;
  description?: string | null;
  duration_weeks: number;
  is_active: boolean;
  created_at?: string;
}

export interface StatMetric {
  key: "interns" | "tasks" | "reports" | "pending" | "progress" | "my_reports" | "commits";
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: "users" | "list-checks" | "target" | "clock";
}

export interface PerformancePoint {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  taskName: string;
  timeAgo: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate?: string | null;
  due_date?: string | null;
  priority: TaskPriority;
  assignee: string;
  status: TaskStatus;
  student_id?: string;
  mentor_id?: string | null;
}

export interface ReportFeedback {
  author_name: string;
  comment: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  title: string;
  week_label: string;
  content: string;
  summary: string;
  highlights: string[];
  blockers: string[];
  attachments: Array<{ name: string; path: string; content_type?: string }>;
  feedback: ReportFeedback[];
  student_id: string;
  mentor_id?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsOverview {
  summary: Record<string, number>;
  summary_change?: Record<string, { percent: number; trend: "up" | "down" | "flat"; previous: number }>;
  task_status_breakdown: Array<{ name: string; value: number }>;
  task_breakdown_change?: Record<string, { percent: number; trend: "up" | "down" | "flat"; previous: number }>;
  student_progress?: Array<{ name: string; progress: number; commits?: number }>;
  trend_points?: Array<{ period: string; completed: number; pending: number; total: number }>;
  department_performance?: Array<{ department: string; score: number; projects: number }>;
}

export interface AnalyticsProgressPoint {
  week: string;
  internA: number;
  internB: number;
  internC: number;
  internD: number;
}

export interface DepartmentPerformancePoint {
  department: string;
  score: number;
  projects: number;
}
