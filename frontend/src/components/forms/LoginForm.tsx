import { FormEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "student@example.com", password: "password123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch {
      setError("Unable to sign in. Check your backend and demo credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel panel-hover mx-auto max-w-md space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your role-based account to continue.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <input className="input" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
        <input type="password" className="input" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button className="button-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
        Demo accounts can be created through the register endpoint for `admin`, `mentor`, and `student`.
      </div>
    </form>
  );
}
