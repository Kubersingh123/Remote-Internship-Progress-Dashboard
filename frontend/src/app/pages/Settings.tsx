import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);

  if (!user) return null;

  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Profile Information</h4>
          <Input value={user.name} readOnly />
          <Input value={user.email} readOnly />
          <Input value={user.role} readOnly className="capitalize opacity-80" />
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Appearance</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current theme: {theme}</p>
          <Button variant="outline" onClick={toggleTheme}>
            Toggle Theme
          </Button>
        </section>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h4>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <input type="checkbox" checked={pushEnabled} onChange={() => setPushEnabled((s) => !s)} className="mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Push Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get real-time updates for tasks and reviews.</p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <input type="checkbox" checked={digestEnabled} onChange={() => setDigestEnabled((s) => !s)} className="mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Email Digest</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive a daily summary of internship progress.</p>
            </div>
          </label>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
