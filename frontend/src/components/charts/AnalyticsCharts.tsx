import { BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const palette = ["#0ea5e9", "#0369a1", "#38bdf8"];

export function AnalyticsCharts({ analytics }: { analytics: any }) {
  if (!analytics) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Student Progress</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.student_progress ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Task Status</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={analytics.task_status_breakdown} dataKey="value" nameKey="name" outerRadius={95}>
                {analytics.task_status_breakdown?.map((entry: any, index: number) => (
                  <Cell key={entry.name} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
