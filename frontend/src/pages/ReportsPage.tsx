import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/client";
import { MarkdownReportForm } from "../components/forms/MarkdownReportForm";
import { useAuth } from "../context/AuthContext";
import type { Report } from "../types";

export function ReportsPage({ reports, reload }: { reports: Report[]; reload: () => void }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const filteredReports = useMemo(
    () => reports.filter((report) => `${report.title} ${report.week_label} ${report.content}`.toLowerCase().includes(search.toLowerCase())),
    [reports, search]
  );

  async function submitFeedback(reportId: string) {
    await api.post(`/reports/${reportId}/feedback`, { comment: feedbackDrafts[reportId] });
    setFeedbackDrafts((current) => ({ ...current, [reportId]: "" }));
    reload();
  }

  return (
    <div className="space-y-6">
      {user?.role === "student" ? <MarkdownReportForm onCreated={reload} /> : null}
      <section className="panel panel-hover p-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly Reports</h2>
          <input className="input max-w-md" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="space-y-5">
          {filteredReports.map((report) => (
            <article key={report.id} className="rounded-3xl border border-slate-200 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 dark:border-slate-700 dark:hover:border-sky-700">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{report.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{report.week_label}</p>
                </div>
                <div className="rounded-xl bg-brand-50 px-4 py-2 text-sm text-brand-700 dark:bg-sky-900/30 dark:text-sky-200">
                  AI Summary: {report.summary}
                </div>
              </div>
              <div className="prose prose-slate mt-5 max-w-none dark:prose-invert">
                <ReactMarkdown>{report.content}</ReactMarkdown>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {report.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{highlight}</span>)}
                {report.blockers.map((blocker) => <span key={blocker} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">{blocker}</span>)}
              </div>
              {report.attachments.length ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Attachments</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.attachments.map((file) => <span key={file.path} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{file.name}</span>)}
                  </div>
                </div>
              ) : null}
              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mentor Feedback</p>
                {report.feedback.map((item, index) => (
                  <div key={`${report.id}-${index}`} className="rounded-xl bg-white p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-slate-100">{item.author_name}: </span>
                    {item.comment}
                  </div>
                ))}
                {user?.role !== "student" ? (
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input className="input" placeholder="Leave mentor feedback..." value={feedbackDrafts[report.id] ?? ""} onChange={(e) => setFeedbackDrafts((current) => ({ ...current, [report.id]: e.target.value }))} />
                    <button className="button-primary" onClick={() => submitFeedback(report.id)}>Submit</button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
