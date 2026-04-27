import { useEffect, useState } from "react";
import { reportService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { MarkdownEditor } from "../components/reports/MarkdownEditor";
import type { ReportItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const REPORT_TEMPLATE = `# Weekly Internship Report

## Highlights
- 

## Completed Tasks
- [ ] 

## Metrics
| Metric | Value |
| --- | --- |
| Tasks Completed | 0 |
| Bugs Closed | 0 |

## Blockers
- 
`;

export function ReportsPage() {
  const { user } = useAuth();
  const { callApi, loading } = useApi();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const params =
      user.role === "student"
        ? { student_id: user.id }
        : user.role === "mentor"
        ? { mentor_id: user.id }
        : undefined;
    void callApi(
      async () => {
        const data = await reportService.list(params);
        setReports(data);
      },
      { errorMessage: "Unable to load reports." }
    );
  }, [user, callApi]);

  async function handleSaveReport(payload: {
    title: string;
    weekLabel: string;
    content: string;
    highlights: string[];
    blockers: string[];
    file: File | null;
  }) {
    if (user?.role !== "student") return;
    await callApi(async () => {
      const created = await reportService.create({
        title: payload.title,
        week_label: payload.weekLabel,
        content: payload.content,
        highlights: payload.highlights,
        blockers: payload.blockers,
      });
      if (payload.file) {
        await reportService.upload(created.id, payload.file);
      }
      const refreshed = await reportService.list({ student_id: user.id });
      setReports(refreshed);
    }, { successMessage: "Report saved successfully", errorMessage: "Failed to save report" });
  }

  async function submitFeedback(reportId: string) {
    const comment = feedbackDraft[reportId];
    if (!comment?.trim()) return;
    await callApi(
      async () => {
        await reportService.feedback(reportId, comment);
        setFeedbackDraft((prev) => ({ ...prev, [reportId]: "" }));
        const refreshed = await reportService.list(user?.role === "mentor" ? { mentor_id: user.id } : undefined);
        setReports(refreshed);
      },
      { successMessage: "Feedback submitted", errorMessage: "Failed to submit feedback" }
    );
  }

  return (
    <div className="space-y-6">
      {user?.role === "student" ? (
        <MarkdownEditor initialValue={REPORT_TEMPLATE} loading={loading} onSave={handleSaveReport} />
      ) : null}

      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle>Submitted Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{report.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{report.week_label}</p>
                </div>
                <p className="rounded-lg bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {report.summary}
                </p>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {report.content}
              </pre>
              {report.feedback?.length ? (
                <div className="mt-3 space-y-2">
                  {report.feedback.map((item, index) => (
                    <p key={`${report.id}-${index}`} className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                      <span className="font-semibold">{item.author_name}:</span> {item.comment}
                    </p>
                  ))}
                </div>
              ) : null}
              {user?.role !== "student" ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="Write mentor feedback..."
                    value={feedbackDraft[report.id] ?? ""}
                    onChange={(event) => setFeedbackDraft((prev) => ({ ...prev, [report.id]: event.target.value }))}
                  />
                  <Button onClick={() => submitFeedback(report.id)} disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No reports found for your role.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
