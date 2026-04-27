import { FormEvent, useMemo, useState } from "react";
import api from "../api/client";
import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

export function TasksPage({ tasks, setTasks }: { tasks: Task[]; setTasks: (tasks: Task[]) => void }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", description: "", student_id: "", tags: "" });

  const filteredTasks = useMemo(
    () => tasks.filter((task) => `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase())),
    [tasks, search]
  );

  async function handleCreateTask(event: FormEvent) {
    event.preventDefault();
    const response = await api.post("/tasks/", {
      ...form,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    setTasks([response.data, ...tasks]);
    setForm({ title: "", description: "", student_id: "", tags: "" });
  }

  function handleBoardChange(updatedVisibleTasks: Task[]) {
    const updatedMap = new Map(updatedVisibleTasks.map((task) => [task.id, task]));
    const nextTasks = tasks.map((task) => updatedMap.get(task.id) ?? task);
    setTasks(nextTasks);
  }

  return (
    <div className="space-y-6">
      <section className="panel panel-hover p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Task Board</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Filter by title, description, or tags.</p>
          </div>
          <input className="input max-w-md" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>
      {user?.role !== "student" ? (
        <form className="panel panel-hover grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreateTask}>
          <input className="input" placeholder="Task title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          <input className="input" placeholder="Student ID" value={form.student_id} onChange={(e) => setForm((c) => ({ ...c, student_id: e.target.value }))} />
          <input className="input" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((c) => ({ ...c, tags: e.target.value }))} />
          <button className="button-primary">Create task</button>
          <textarea className="input md:col-span-2 xl:col-span-4" placeholder="Description" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
        </form>
      ) : null}
      <KanbanBoard tasks={filteredTasks} onTasksChange={handleBoardChange} />
    </div>
  );
}
