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
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("password123");
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="hover:translate-y-0">
          <CardContent className="pt-7">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                RI
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
              />
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" disabled={loading}>
                <LogIn size={16} />
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-5 rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <p className="font-semibold">Demo Accounts:</p>
              <p>admin@example.com (Admin)</p>
              <p>mentor@example.com (Mentor)</p>
              <p>student@example.com (Student)</p>
              <p className="mt-1 text-xs">Default seeded password: password123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
