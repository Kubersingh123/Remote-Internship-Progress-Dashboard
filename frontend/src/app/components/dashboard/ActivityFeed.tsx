import type { ActivityItem } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

function initials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
              {initials(item.user)}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-semibold">{item.user}</span> {item.action}{" "}
                <span className="font-semibold">{item.taskName}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.timeAgo}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
