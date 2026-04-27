import { useEffect, useMemo, useState } from "react";
import { analyticsService, notificationService, reportService, taskService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { PerformanceChart } from "../components/dashboard/PerformanceChart";
import { StatCard } from "../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import type { ActivityItem, AnalyticsOverview, DistributionPoint, PerformancePoint, StatMetric } from "../types";
import { useAuth } from "../../hooks/useAuth";

function formatChange(percent: number | undefined) {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) return "0%";
  let rounded = Math.round(percent);
  if (Object.is(rounded, -0)) rounded = 0;
  if (rounded > 0) return `+${rounded}%`;
  return `${rounded}%`;
}

function getDetailTone(label: string) {
  const key = label.toLowerCase();
  if (key.includes("done") || key.includes("progress")) {
    return "border-[#10b981]/30 bg-[#ecfdf5] dark:border-[#10b981]/40 dark:bg-[#10b981]/10";
  }
  if (key.includes("to do") || key.includes("in progress")) {
    return "border-[#f59e0b]/30 bg-[#fff7ed] dark:border-[#f59e0b]/40 dark:bg-[#f59e0b]/10";
  }
  if (key.includes("pending")) {
    return "border-[#ef4444]/30 bg-[#fef2f2] dark:border-[#ef4444]/40 dark:bg-[#ef4444]/10";
  }
  return "border-[#3b82f6]/30 bg-[#eff6ff] dark:border-[#3b82f6]/40 dark:bg-[#3b82f6]/10";
}

export function DashboardPage() {
  const { user } = useAuth();
  const { callApi } = useApi();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<StatMetric["key"] | null>(null);
  const [recentReports, setRecentReports] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [recentTasks, setRecentTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);

  useEffect(() => {
    if (!user) return;
    void callApi(async () => {
      const reportParams =
        user.role === "student"
          ? { student_id: user.id }
          : user.role === "mentor"
          ? { mentor_id: user.id }
          : undefined;
      const taskParams = user.role === "student" ? { student_id: user.id } : undefined;
      const [overview, notifications, reports, tasks] = await Promise.all([
        analyticsService.overview(),
        notificationService.list(),
        reportService.list(reportParams),
        taskService.list(taskParams),
      ]);
      setAnalytics(overview);
      setRecentReports(reports.slice(0, 8).map((item) => ({ id: item.id, title: item.title, created_at: item.created_at })));
      setRecentTasks(tasks.slice(0, 8).map((item) => ({ id: item.id, title: item.title, status: item.status })));
      const combined = [
        ...notifications.map((item) => ({
          id: `n-${item.id}`,
          user: "System",
          action: item.type.replace(/_/g, " "),
          taskName: item.title,
          timeAgo: new Date(item.created_at).toLocaleString(),
        })),
        ...reports.slice(0, 3).map((item) => ({
          id: `r-${item.id}`,
          user: "Student",
          action: "submitted report",
          taskName: item.title,
          timeAgo: new Date(item.created_at).toLocaleString(),
        })),
        ...tasks.slice(0, 3).map((item) => ({
          id: `t-${item.id}`,
          user: "Mentor",
          action: "updated task",
          taskName: item.title,
          timeAgo: "Recently",
        })),
      ];
      setActivity(combined.slice(0, 5));
    }, { errorMessage: "Unable to load dashboard data." });
  }, [callApi, user]);

  const stats = useMemo<StatMetric[]>(() => {
    const summary = analytics?.summary ?? {};
    const summaryChange = analytics?.summary_change ?? {};
    const pendingValue = analytics?.task_status_breakdown?.find((item) => item.name === "To Do")?.value ?? 0;
    const pendingChange = analytics?.task_breakdown_change?.["To Do"];
    if (user?.role === "student") {
      return [
        {
          key: "progress",
          title: "My Progress",
          value: `${summary.progress ?? 0}%`,
          change: formatChange(summaryChange.progress?.percent),
          trend: summaryChange.progress?.trend ?? "flat",
          icon: "target",
        },
        {
          key: "my_reports",
          title: "My Reports",
          value: String(summary.reports_submitted ?? 0),
          change: formatChange(summaryChange.reports_submitted?.percent),
          trend: summaryChange.reports_submitted?.trend ?? "flat",
          icon: "list-checks",
        },
        {
          key: "commits",
          title: "GitHub Commits",
          value: String(summary.github_commits ?? 0),
          change: formatChange(summaryChange.github_commits?.percent),
          trend: summaryChange.github_commits?.trend ?? "flat",
          icon: "users",
        },
        {
          key: "pending",
          title: "Pending Tasks",
          value: String(pendingValue),
          change: formatChange(pendingChange?.percent),
          trend: pendingChange?.trend ?? "flat",
          icon: "clock",
        },
      ];
    }
    return [
      {
        key: "interns",
        title: "Total Interns",
        value: String(summary.total_students ?? 0),
        change: formatChange(summaryChange.total_students?.percent),
        trend: summaryChange.total_students?.trend ?? "flat",
        icon: "users",
      },
      {
        key: "tasks",
        title: "Active Tasks",
        value: String(summary.total_tasks ?? 0),
        change: formatChange(summaryChange.total_tasks?.percent),
        trend: summaryChange.total_tasks?.trend ?? "flat",
        icon: "list-checks",
      },
      {
        key: "reports",
        title: "Total Reports",
        value: String(summary.total_reports ?? 0),
        change: formatChange(summaryChange.total_reports?.percent),
        trend: summaryChange.total_reports?.trend ?? "flat",
        icon: "target",
      },
      {
        key: "pending",
        title: "Pending Reviews",
        value: String(pendingValue),
        change: formatChange(pendingChange?.percent),
        trend: pendingChange?.trend ?? "flat",
        icon: "clock",
      },
    ];
  }, [analytics, user]);

  const formattedLineData = useMemo<PerformancePoint[]>(() => {
    if (!analytics?.trend_points?.length) return [];
    return analytics.trend_points.map((item) => ({
      month: item.period,
      completed: item.completed,
      pending: item.pending,
      total: item.total,
    }));
  }, [analytics]);

  const formattedPieData = useMemo<DistributionPoint[]>(() => {
    if (!analytics?.task_status_breakdown?.length) return [];
    return analytics.task_status_breakdown.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: ["#3b82f6", "#f59e0b", "#10b981"][index % 3],
    }));
  }, [analytics]);

  const modalDetails = useMemo(() => {
    if (!analytics || !selectedMetric) return null;
    const summary = analytics.summary ?? {};
    const taskMap = new Map((analytics.task_status_breakdown ?? []).map((item) => [item.name, item.value]));

    if (selectedMetric === "tasks") {
      return {
        title: "Active Tasks Details",
        stats: [
          { label: "Total", value: String(summary.total_tasks ?? 0) },
          { label: "To Do", value: String(taskMap.get("To Do") ?? 0) },
          { label: "In Progress", value: String(taskMap.get("In Progress") ?? 0) },
          { label: "Done", value: String(taskMap.get("Done") ?? 0) },
        ],
        items: recentTasks.length
          ? recentTasks.map((task) => `${task.title} (${task.status.replace("_", " ")})`)
          : ["No task records available"],
      };
    }
    if (selectedMetric === "pending") {
      const pendingItems = recentTasks.filter((task) => task.status !== "done");
      return {
        title: "Pending Tasks",
        stats: [
          { label: "To Do", value: String(taskMap.get("To Do") ?? 0) },
          { label: "In Progress", value: String(taskMap.get("In Progress") ?? 0) },
        ],
        items: pendingItems.length ? pendingItems.map((task) => task.title) : ["No pending tasks right now"],
      };
    }
    if (selectedMetric === "interns") {
      const interns = analytics.student_progress ?? [];
      return {
        title: "Intern Performance",
        stats: [
          { label: "Total Students", value: String(summary.total_students ?? 0) },
          { label: "Total Mentors", value: String(summary.total_mentors ?? 0) },
        ],
        items: interns.length ? interns.map((intern) => `${intern.name}: ${intern.progress}%`) : ["No intern data available"],
      };
    }
    if (selectedMetric === "reports" || selectedMetric === "my_reports") {
      return {
        title: "Report Details",
        stats: [{ label: "Total Reports", value: String(summary.total_reports ?? summary.reports_submitted ?? 0) }],
        items: recentReports.length
          ? recentReports.map((report) => `${report.title} - ${new Date(report.created_at).toLocaleDateString()}`)
          : ["No reports submitted yet"],
      };
    }
    if (selectedMetric === "progress") {
      return {
        title: "My Progress",
        stats: [
          { label: "Current Progress", value: `${summary.progress ?? 0}%` },
          { label: "Total Tasks", value: String(summary.total_tasks ?? 0) },
        ],
        items: recentTasks.length ? recentTasks.map((task) => task.title) : ["No tasks available"],
      };
    }
    if (selectedMetric === "commits") {
      return {
        title: "GitHub Activity",
        stats: [{ label: "Commits", value: String(summary.github_commits ?? 0) }],
        items: ["Commit count is fetched from linked GitHub account."],
      };
    }
    return null;
  }, [analytics, recentReports, recentTasks, selectedMetric]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            stat={stat}
            active={selectedMetric === stat.key}
            onClick={() => setSelectedMetric(stat.key)}
          />
        ))}
      </section>
      <PerformanceChart lineData={formattedLineData} pieData={formattedPieData} />
      <ActivityFeed items={activity} />

      {modalDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 px-4">
          <Card className="w-full max-w-2xl border-[#3b82f6]/30 hover:translate-y-0 dark:border-[#3b82f6]/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{modalDetails.title}</CardTitle>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-[#f9fafb] dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => setSelectedMetric(null)}
              >
                Close
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {modalDetails.stats.map((stat) => (
                  <div key={stat.label} className={`rounded-xl border px-3 py-2 ${getDetailTone(stat.label)}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#3b82f6]/25 bg-white p-3 dark:border-[#3b82f6]/30 dark:bg-gray-950">
                <p className="mb-2 text-sm font-medium text-[#3b82f6] dark:text-[#93c5fd]">Specific Data</p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {modalDetails.items.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
