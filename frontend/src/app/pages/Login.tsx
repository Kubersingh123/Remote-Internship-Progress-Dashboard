import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { FormEvent } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      showToast({ type: "success", title: "Logged in successfully" });
    } catch {
      setError("Invalid credentials. Please check your email/password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-base font-bold text-blue-600 shadow-2xl shadow-blue-950/30">
                RI
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-normal text-white">RemoteIntern</h1>
                <p className="mt-1 text-sm font-medium text-blue-100">Remote Internship Progress Dashboard</p>
              </div>
            </div>

            <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-normal text-white">
              Manage internship progress with calm, clear visibility.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/90">
              Track tasks, reports, feedback, and analytics in one place.
            </p>

            <div className="mt-10 grid gap-4">
              {["Progress Tracking", "Task Management", "Mentor Feedback"].map((feature) => (
                <div
                  key={feature}
                  className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl shadow-blue-950/10 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20 text-sm font-bold text-blue-100 ring-1 ring-white/15">
                    {feature
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <p className="text-sm font-semibold text-white">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Card className="border-white/20 bg-white/90 shadow-2xl shadow-blue-950/25 backdrop-blur-xl hover:translate-y-0 dark:border-white/10 dark:bg-gray-950/80">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-base font-bold text-white shadow-lg shadow-blue-500/30">
                  RI
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RemoteIntern</h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Remote Internship Progress Dashboard</p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to continue to your dashboard</p>
              </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</span>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
              />
              </label>
              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              ) : null}
              <Button className="h-11 w-full shadow-lg shadow-blue-500/20" disabled={loading}>
                <LogIn size={16} />
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </section>
      </motion.div>
    </div>
  );
}
