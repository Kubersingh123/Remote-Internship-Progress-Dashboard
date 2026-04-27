import { LoginForm } from "../components/forms/LoginForm";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function LoginPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="relative hidden rounded-[2rem] bg-slate-950 p-10 text-white lg:block">
          <button onClick={toggleTheme} className="button-secondary absolute right-6 top-6 flex items-center gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light" : "Dark"}
          </button>
          <p className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-sky-200">
            Internal internship platform
          </p>
          <h1 className="mt-8 max-w-xl text-5xl font-bold leading-tight">
            Help mentors and students stay aligned every single week.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Reports, task boards, analytics, file sharing, and AI summaries all live in one focused workspace.
          </p>
        </section>
        <div className="space-y-4">
          <div className="flex justify-end lg:hidden">
            <button onClick={toggleTheme} className="button-secondary flex items-center gap-2">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
