import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import type { Notification, Report, Task } from "../types";

export function useDashboardData() {
  const [reports, setReports] = useState<Report[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [reportsRes, tasksRes, analyticsRes, notificationsRes] = await Promise.all([
      api.get("/reports/"),
      api.get("/tasks/"),
      api.get("/analytics/overview"),
      api.get("/notifications/"),
    ]);
    setReports(reportsRes.data);
    setTasks(tasksRes.data);
    setAnalytics(analyticsRes.data);
    setNotifications(notificationsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reports, setReports, tasks, setTasks, analytics, notifications, loading, refresh };
}
