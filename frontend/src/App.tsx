import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./context/AuthContext";
import { useDashboardData } from "./hooks/useDashboardData";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { TasksPage } from "./pages/TasksPage";

function ProtectedApp() {
  const { reports, tasks, setTasks, analytics, notifications, loading, refresh } = useDashboardData();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage analytics={analytics} notifications={notifications} />} />
        <Route path="/reports" element={<ReportsPage reports={reports} reload={refresh} />} />
        <Route path="/tasks" element={<TasksPage tasks={tasks} setTasks={setTasks} />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Checking session...</div>;
  }

  return user ? <ProtectedApp /> : <LoginPage />;
}
