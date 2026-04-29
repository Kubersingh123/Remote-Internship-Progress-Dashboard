import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { KanbanBoard } from "../components/tasks/KanbanBoard";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import type { TaskItem, TaskStatus } from "../types";
import { taskService, userService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";

export function TasksPage() {
  const { user } = useAuth();
  const { callApi, loading } = useApi();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    student_id: "",
    student_ids: [] as string[],
    due_date: "",
    tags: "",
    status: "todo" as TaskStatus,
  });

  useEffect(() => {
    if (!user) return;
    const params = user.role === "student" ? { student_id: user.id } : undefined;
    void callApi(
      async () => {
        const data = await taskService.list(params);
        setTasks(
          data.map((task) => ({
            ...task,
            dueDate: task.dueDate ?? task.due_date ?? null,
            assignee: task.assignee ?? "Assigned",
            priority: task.priority ?? "medium",
          }))
        );
      },
      { errorMessage: "Unable to load tasks." }
    );
  }, [user, callApi]);

  useEffect(() => {
    if (!user || user.role === "student") return;
    void callApi(
      async () => {
        const data = await userService.list({ role: "student" });
        setStudents(data.map((item) => ({ id: item.id, name: item.name })));
      },
      { errorMessage: "Unable to load students." }
    );
  }, [user, callApi]);

  async function onMoveTask(taskId: string, nextStatus: TaskStatus) {
    const previous = tasks;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)));
    try {
      await callApi(() => taskService.update(taskId, { status: nextStatus }), {
        successMessage: "Task status updated",
        errorMessage: "Failed to update task status",
      });
    } catch {
      setTasks(previous);
    }
  }

  async function onAddTask(event: FormEvent) {
    event.preventDefault();
    const selectedStudentIds = user?.role === "admin"
      ? newTask.student_ids
      : newTask.student_id
      ? [newTask.student_id]
      : [];
    if (!newTask.title.trim() || selectedStudentIds.length === 0) return;

    await callApi(
      async () => {
        const createdResponse = await taskService.create({
          title: newTask.title,
          description: newTask.description,
          student_id: user?.role === "admin" ? undefined : newTask.student_id,
          student_ids: user?.role === "admin" ? newTask.student_ids : undefined,
          due_date: newTask.due_date || null,
          tags: newTask.tags.split(",").map((item) => item.trim()).filter(Boolean),
          status: newTask.status,
        });
        const createdTasks = Array.isArray((createdResponse as any).created)
          ? (createdResponse as { created: TaskItem[] }).created
          : [createdResponse as TaskItem];
        setTasks((prev) => [
          ...createdTasks.map((created) => ({
            ...created,
            dueDate: created.dueDate ?? created.due_date ?? null,
            assignee: "Assigned",
            priority: created.priority ?? "medium",
          })),
          ...prev,
        ]);
        setNewTask({ title: "", description: "", student_id: "", student_ids: [], due_date: "", tags: "", status: "todo" });
        setShowAddForm(false);
      },
      {
        successMessage: selectedStudentIds.length > 1 ? `${selectedStudentIds.length} tasks created` : "Task created",
        errorMessage: "Unable to create task",
      }
    );
  }

  const totalTasks = useMemo(() => tasks.length, [tasks]);

  return (
    <div className="space-y-6">
      <Card className="hover:translate-y-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kanban Tasks</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{totalTasks} tasks tracked</p>
          </div>
          {user?.role !== "student" ? (
            <Button onClick={() => setShowAddForm((s) => !s)}>
              <Plus size={16} />
              Add Task
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {showAddForm && user?.role !== "student" ? (
            <form className="mb-4 grid gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:grid-cols-2" onSubmit={onAddTask}>
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
              />
              {user?.role === "admin" ? (
                <div className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Assign Students (multiple)</p>
                  <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
                    {students.map((student) => {
                      const checked = newTask.student_ids.includes(student.id);
                      return (
                        <label key={student.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              setNewTask((prev) => ({
                                ...prev,
                                student_ids: event.target.checked
                                  ? [...prev.student_ids, student.id]
                                  : prev.student_ids.filter((id) => id !== student.id),
                              }))
                            }
                          />
                          {student.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <select
                  className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  value={newTask.student_id}
                  onChange={(event) => setNewTask((prev) => ({ ...prev, student_id: event.target.value }))}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              )}
              <Input
                placeholder="Description"
                value={newTask.description}
                onChange={(event) => setNewTask((prev) => ({ ...prev, description: event.target.value }))}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={newTask.tags}
                onChange={(event) => setNewTask((prev) => ({ ...prev, tags: event.target.value }))}
              />
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(event) => setNewTask((prev) => ({ ...prev, due_date: event.target.value }))}
              />
              <select
                className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={newTask.status}
                onChange={(event) => setNewTask((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="md:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          ) : null}
          {loading ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-300">
              Loading tasks...
            </div>
          ) : (
            <KanbanBoard tasks={tasks} onMoveTask={onMoveTask} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
