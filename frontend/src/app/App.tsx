import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Header } from "./components/layout/Header";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import { AnalyticsPage } from "./pages/Analytics";
import { DashboardPage } from "./pages/Dashboard";
import { InternshipsPage } from "./pages/Internships";
import { LoginPage } from "./pages/Login";
import { ProgressPage } from "./pages/Progress";
import { ReportsPage } from "./pages/Reports";
import { SettingsPage } from "./pages/Settings";
import { TasksPage } from "./pages/Tasks";
import { UsersPage } from "./pages/Users";
import type { AppRoute } from "./types";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";

const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: "easeOut" },
};

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeRoute, setActiveRoute] = useState<AppRoute>("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const allowedRoutes = useMemo(() => {
    if (!user) return new Set<AppRoute>(["dashboard"]);
    if (user.role === "admin") return new Set<AppRoute>(["dashboard", "tasks", "reports", "settings", "analytics", "users", "internships"]);
    if (user.role === "mentor") return new Set<AppRoute>(["dashboard", "tasks", "reports", "settings", "analytics"]);
    return new Set<AppRoute>(["dashboard", "tasks", "reports", "settings", "progress"]);
  }, [user]);

  function navigate(route: AppRoute) {
    if (allowedRoutes.has(route)) {
      setActiveRoute(route);
    }
  }

  function renderPage(route: AppRoute) {
    if (!allowedRoutes.has(route)) return <DashboardPage />;
    switch (route) {
      case "tasks":
        return <TasksPage />;
      case "reports":
        return <ReportsPage />;
      case "analytics":
        return (
          <ProtectedRoute allowedRoles={["admin", "mentor"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        );
      case "settings":
        return <SettingsPage />;
      case "users":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        );
      case "internships":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <InternshipsPage />
          </ProtectedRoute>
        );
      case "progress":
        return (
          <ProtectedRoute allowedRoles={["student"]}>
            <ProgressPage />
          </ProtectedRoute>
        );
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        user={user}
        activeRoute={activeRoute}
        onNavigate={navigate}
        onLogout={logout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="lg:ml-64">
        <Header route={activeRoute} onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
        <main className="h-[calc(100vh-64px)] overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeRoute} {...pageMotion}>
              {renderPage(activeRoute)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
