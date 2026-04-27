import type {
  ActivityItem,
  AnalyticsProgressPoint,
  DepartmentPerformancePoint,
  DistributionPoint,
  PerformancePoint,
  StatMetric,
  TaskItem,
  User,
} from "../types";

export const demoUsers: User[] = [
  { id: "1", name: "Aarav Admin", email: "admin@example.com", role: "admin" },
  { id: "2", name: "Mira Mentor", email: "mentor@example.com", role: "mentor" },
  { id: "3", name: "Sia Student", email: "student@example.com", role: "student" },
];

export const dashboardStats: StatMetric[] = [
  { key: "interns", title: "Total Interns", value: "48", change: "+12%", trend: "up", icon: "users" },
  { key: "tasks", title: "Active Tasks", value: "127", change: "+8%", trend: "up", icon: "list-checks" },
  { key: "progress", title: "Completion Rate", value: "94%", change: "+5%", trend: "up", icon: "target" },
  { key: "pending", title: "Pending Reviews", value: "23", change: "-3%", trend: "down", icon: "clock" },
];

export const performanceData: PerformancePoint[] = [
  { month: "Jan", completed: 45, pending: 12, total: 57 },
  { month: "Feb", completed: 52, pending: 15, total: 67 },
  { month: "Mar", completed: 61, pending: 10, total: 71 },
  { month: "Apr", completed: 68, pending: 8, total: 76 },
  { month: "May", completed: 74, pending: 11, total: 85 },
  { month: "Jun", completed: 82, pending: 9, total: 91 },
];

export const taskDistributionData: DistributionPoint[] = [
  { name: "Development", value: 35, color: "#3b82f6" },
  { name: "Design", value: 25, color: "#10b981" },
  { name: "Research", value: 20, color: "#f59e0b" },
  { name: "Documentation", value: 15, color: "#6366f1" },
  { name: "Testing", value: 5, color: "#ef4444" },
];

export const recentActivities: ActivityItem[] = [
  { id: "a1", user: "Sia Student", action: "completed task", taskName: "Dashboard UI", timeAgo: "2m ago" },
  { id: "a2", user: "Mira Mentor", action: "reviewed report", taskName: "Week 6 Summary", timeAgo: "16m ago" },
  { id: "a3", user: "Aarav Admin", action: "assigned task", taskName: "API Integration", timeAgo: "48m ago" },
  { id: "a4", user: "Sia Student", action: "submitted report", taskName: "Weekly Progress", timeAgo: "1h ago" },
  { id: "a5", user: "Mira Mentor", action: "completed task", taskName: "Feedback Cycle", timeAgo: "2h ago" },
];

export const initialTasks: TaskItem[] = [
  {
    id: "t1",
    title: "Design user authentication flow",
    description: "Create wireframes and states for login and session UX.",
    tags: ["Design", "UI/UX"],
    dueDate: "Apr 18",
    priority: "high",
    assignee: "Mira",
    status: "todo",
  },
  {
    id: "t2",
    title: "Draft onboarding checklist",
    description: "Prepare checklist and starter guide for new interns.",
    tags: ["Documentation"],
    dueDate: "Apr 19",
    priority: "medium",
    assignee: "Aarav",
    status: "todo",
  },
  {
    id: "t3",
    title: "Implement dashboard API",
    description: "Connect charts and metric cards with backend routes.",
    tags: ["Development", "Backend"],
    dueDate: "Apr 17",
    priority: "high",
    assignee: "Sia",
    status: "in_progress",
  },
  {
    id: "t4",
    title: "Research competitor features",
    description: "Compare reporting and mentoring workflows.",
    tags: ["Research"],
    dueDate: "Apr 20",
    priority: "medium",
    assignee: "Sia",
    status: "in_progress",
  },
  {
    id: "t5",
    title: "Prepare release notes",
    description: "Summarize changes for sprint review.",
    tags: ["Documentation"],
    dueDate: "Apr 16",
    priority: "low",
    assignee: "Mira",
    status: "in_progress",
  },
  {
    id: "t6",
    title: "Set up analytics cards",
    description: "Build reusable chart containers and stat cards.",
    tags: ["Development", "Frontend"],
    dueDate: "Apr 14",
    priority: "low",
    assignee: "Sia",
    status: "done",
  },
  {
    id: "t7",
    title: "Create report template",
    description: "Design markdown report template for weekly updates.",
    tags: ["Design", "Content"],
    dueDate: "Apr 14",
    priority: "medium",
    assignee: "Mira",
    status: "done",
  },
];

export const analyticsProgressData: AnalyticsProgressPoint[] = [
  { week: "Week 1", internA: 45, internB: 39, internC: 50, internD: 36 },
  { week: "Week 2", internA: 58, internB: 48, internC: 63, internD: 44 },
  { week: "Week 3", internA: 71, internB: 57, internC: 75, internD: 59 },
  { week: "Week 4", internA: 86, internB: 66, internC: 84, internD: 72 },
];

export const departmentPerformanceData: DepartmentPerformancePoint[] = [
  { department: "Engineering", score: 92, projects: 18 },
  { department: "Design", score: 84, projects: 12 },
  { department: "Marketing", score: 76, projects: 10 },
  { department: "Product", score: 81, projects: 11 },
  { department: "Data Science", score: 88, projects: 9 },
];

export const sampleMarkdown = `# Weekly Internship Report

## Highlights
- Completed authentication screens and role checks
- Finalized dashboard card system
- Fixed API integration issues

## Completed Tasks
- [x] Implement login state
- [x] Build task board layout
- [ ] Add email digest notifications

## Metrics

| Metric | Last Week | This Week |
| --- | --- | --- |
| Tasks Completed | 9 | 12 |
| Bugs Closed | 4 | 6 |
| Pull Requests | 3 | 5 |

## Code Sample
\`\`\`ts
const completionRate = (done: number, total: number) =>
  total === 0 ? 0 : Math.round((done / total) * 100);
\`\`\`

## Blockers
1. Need final API docs for analytics endpoint
2. Pending review on notification strategy
`;
