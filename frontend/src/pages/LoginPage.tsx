import { LoginForm } from "../components/forms/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <section className="hidden rounded-[2rem] bg-slate-950 p-10 text-white lg:block">
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
        <LoginForm />
      </div>
    </div>
  );
}
