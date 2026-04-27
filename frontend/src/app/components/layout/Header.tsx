import { Bell, Menu, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import type { AppRoute } from "../../types";
import { Button } from "../ui/Button";
import { notificationService } from "../../../services/api";
import { useApi } from "../../../hooks/useApi";
import type { NotificationItem } from "../../types";

interface HeaderProps {
  route: AppRoute;
  onOpenMobileMenu: () => void;
}

const routeTitles: Record<AppRoute, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  reports: "Reports",
  analytics: "Analytics",
  internships: "Internships",
  settings: "Settings",
  users: "Users",
  progress: "My Progress",
};

export function Header({ route, onOpenMobileMenu }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { callApi } = useApi();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const isDark = theme === "dark";
  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

  useEffect(() => {
    void callApi(async () => {
      const data = await notificationService.list();
      setNotifications(data);
    }, { errorMessage: "Unable to fetch notifications." });
  }, [callApi]);

  async function markAllRead() {
    const unread = notifications.filter((item) => !item.is_read);
    if (!unread.length) return;
    await callApi(async () => {
      await Promise.all(unread.map((item) => notificationService.markRead(item.id)));
      const refreshed = await notificationService.list();
      setNotifications(refreshed);
    }, { successMessage: "Notifications updated", errorMessage: "Failed to update notifications" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/85 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          onClick={onOpenMobileMenu}
        >
          <Menu size={18} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{routeTitles[route]}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="relative rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={markAllRead}
          title="Mark notifications as read"
        >
          <Bell size={18} />
          {unreadCount > 0 ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" /> : null}
        </button>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? "Light" : "Dark"}
        </Button>
      </div>
    </header>
  );
}
