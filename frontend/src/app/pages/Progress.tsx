import { useEffect, useMemo, useState } from "react";
import { analyticsService } from "../../services/api";
import { useApi } from "../../hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export function ProgressPage() {
  const { callApi, loading } = useApi();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    void callApi(async () => {
      const data = await analyticsService.overview();
      setProgress(data.summary.progress ?? 0);
    }, { errorMessage: "Unable to load progress." });
  }, [callApi]);

  const progressWidthClass =
    progress >= 90 ? "w-[90%]" : progress >= 75 ? "w-4/5" : progress >= 60 ? "w-3/4" : progress >= 40 ? "w-1/2" : "w-1/3";

  const message = useMemo(() => {
    if (progress >= 80) return "Excellent momentum. Keep this pace going.";
    if (progress >= 60) return "Great consistency. Keep pushing your sprint goals.";
    if (progress >= 40) return "You are progressing steadily. Focus on closing pending tasks.";
    return "Momentum can improve. Break tasks into smaller wins this week.";
  }, [progress]);

  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle>My Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">Latest progress score: {progress}%</p>
        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800">
          <div className={`h-full rounded-full bg-blue-500 ${progressWidthClass}`} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
        {loading ? <p className="text-xs text-gray-500 dark:text-gray-400">Refreshing progress...</p> : null}
      </CardContent>
    </Card>
  );
}
