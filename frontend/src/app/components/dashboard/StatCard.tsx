import { ArrowDownRight, ArrowUpRight, Clock3, ListChecks, Minus, Target, Users } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import type { StatMetric } from "../../types";

const iconMap = {
  users: Users,
  "list-checks": ListChecks,
  target: Target,
  clock: Clock3,
};

const toneMap: Record<StatMetric["icon"], { badge: string; border: string }> = {
  users: {
    badge: "bg-[#dbeafe] text-[#3b82f6] dark:bg-[#3b82f6]/20 dark:text-[#93c5fd]",
    border: "border-[#3b82f6]/30 dark:border-[#3b82f6]/50",
  },
  "list-checks": {
    badge: "bg-[#fff7ed] text-[#f59e0b] dark:bg-[#f59e0b]/20 dark:text-[#fbbf24]",
    border: "border-[#f59e0b]/30 dark:border-[#f59e0b]/50",
  },
  target: {
    badge: "bg-[#dcfce7] text-[#10b981] dark:bg-[#10b981]/20 dark:text-[#6ee7b7]",
    border: "border-[#10b981]/30 dark:border-[#10b981]/50",
  },
  clock: {
    badge: "bg-[#fee2e2] text-[#ef4444] dark:bg-[#ef4444]/20 dark:text-[#fca5a5]",
    border: "border-[#ef4444]/30 dark:border-[#ef4444]/50",
  },
};

export function StatCard({
  stat,
  active = false,
  onClick,
}: {
  stat: StatMetric;
  active?: boolean;
  onClick?: () => void;
}) {
  const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Minus;
  const Icon = iconMap[stat.icon];
  const tone = toneMap[stat.icon];
  const trendClass =
    stat.trend === "up"
      ? "text-[#10b981]"
      : stat.trend === "down"
      ? "text-[#ef4444]"
      : "text-gray-500 dark:text-gray-400";

  return (
    <Card className={`${tone.border} ${active ? "ring-2 ring-[#3b82f6] dark:ring-[#3b82f6]" : ""}`}>
      <CardContent className="pt-5">
        <button type="button" className="w-full text-left" onClick={onClick}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${trendClass}`}>
              <TrendIcon size={16} />
              {stat.change}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.badge}`}>
            <Icon size={19} />
          </div>
        </div>
        </button>
      </CardContent>
    </Card>
  );
}
