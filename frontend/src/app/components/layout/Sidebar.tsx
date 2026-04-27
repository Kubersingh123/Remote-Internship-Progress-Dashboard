import { BarChart3, BriefcaseBusiness, ClipboardList, LayoutDashboard, Settings, UserSquare2, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import type { AppRoute, User, UserRole } from "../../types";
import { Button } from "../ui/Button";

interface SidebarProps {
  user: User;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  route: AppRoute;
  icon: LucideIcon;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", route: "dashboard", icon: LayoutDashboard, roles: ["admin", "mentor", "student"] },
  { label: "Tasks", route: "tasks", icon: ClipboardList, roles: ["admin", "mentor", "student"] },
  { label: "Reports", route: "reports", icon: UserSquare2, roles: ["admin", "mentor", "student"] },
  { label: "Settings", route: "settings", icon: Settings, roles: ["admin", "mentor", "student"] },
  { label: "Analytics", route: "analytics", icon: BarChart3, roles: ["admin", "mentor"] },
  { label: "Internships", route: "internships", icon: BriefcaseBusiness, roles: ["admin"] },
  { label: "Users", route: "users", icon: Users, roles: ["admin"] },
  { label: "My Progress", route: "progress", icon: BarChart3, roles: ["student"] },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Sidebar({
  user,
  activeRoute,
  onNavigate,
  onLogout,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-gray-950 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">RI</div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">RemoteIntern</p>
          </div>
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden" onClick={onCloseMobile}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = activeRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  onCloseMobile();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                  active
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                )}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="truncate text-xs capitalize text-gray-500 dark:text-gray-400">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-center" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
