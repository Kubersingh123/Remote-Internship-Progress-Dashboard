import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { analyticsService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import type { AnalyticsOverview } from "../types";

export function AnalyticsPage() {
  const { callApi, loading } = useApi();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    void callApi(
      async () => {
        const data = await analyticsService.overview();
        setAnalytics(data);
      },
      { errorMessage: "Unable to load analytics." }
    );
  }, [callApi]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Trend (Real-Time)</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.trend_points?.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trend_points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.2} />
                  <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2.2} />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No progress data available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.department_performance?.length ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.department_performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="projects" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No department data available.</p>
          )}
        </CardContent>
      </Card>
      {loading ? <p className="text-sm text-gray-500 dark:text-gray-400">Loading analytics...</p> : null}
    </div>
  );
}
