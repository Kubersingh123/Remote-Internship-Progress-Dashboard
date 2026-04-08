import { LayoutDashboard, LogOut, NotebookTabs, SquareKanban } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "Reports", icon: NotebookTabs },
  { to: "/tasks", label: "Tasks", icon: SquareKanban },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="panel flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="text-xl font-bold text-slate-900">Remote Internship Progress Dashboard</Link>
            <p className="text-sm text-slate-500">Track reports, tasks, and mentorship momentum in one workspace.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 px-4 py-2 text-sm text-brand-700">
              {user?.name} · {user?.role}
            </div>
            <button onClick={logout} className="button-secondary flex items-center gap-2">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="panel p-4">
            <nav className="space-y-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
