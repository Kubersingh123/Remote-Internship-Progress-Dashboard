import { AnalyticsCharts } from "../components/charts/AnalyticsCharts";
import { MetricCard } from "../components/layout/MetricCard";
import type { Notification } from "../types";

export function DashboardPage({ analytics, notifications }: { analytics: any; notifications: Notification[] }) {
  const summary = analytics?.summary ?? {};

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students / Progress" value={summary.total_students ?? summary.progress ?? 0} hint="Active learner visibility" />
        <MetricCard label="Mentors / Commits" value={summary.total_mentors ?? summary.github_commits ?? 0} hint="Mentor coverage or student GitHub activity" />
        <MetricCard label="Reports" value={summary.total_reports ?? summary.reports_submitted ?? 0} hint="Weekly updates captured" />
        <MetricCard label="Tasks" value={summary.total_tasks ?? 0} hint="Kanban workload overview" />
      </section>
      <AnalyticsCharts analytics={analytics} />
      <section className="panel panel-hover p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Notifications</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{notifications.length} items</span>
        </div>
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-sky-700 dark:hover:bg-slate-800/70">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
