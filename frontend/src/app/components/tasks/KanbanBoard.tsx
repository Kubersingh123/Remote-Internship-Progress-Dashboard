import { Calendar, Flag } from "lucide-react";
import { useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { cn } from "../../lib/cn";
import type { TaskItem, TaskPriority, TaskStatus } from "../../types";

const DND_TASK_TYPE = "KANBAN_TASK";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

interface KanbanBoardProps {
  tasks: TaskItem[];
  onMoveTask: (taskId: string, nextStatus: TaskStatus) => void;
}

function priorityClass(priority: TaskPriority) {
  if (priority === "high") return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300";
  if (priority === "medium") return "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
}

function TaskCard({ task }: { task: TaskItem }) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: DND_TASK_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <article
      ref={dragRef}
      className={cn(
        "cursor-move rounded-xl border border-gray-200 bg-white p-3 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600",
        isDragging && "opacity-40"
      )}
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{task.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Calendar size={12} />
          {task.dueDate}
        </span>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1", priorityClass(task.priority))}>
          <Flag size={12} />
          {task.priority}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">Assignee: {task.assignee}</p>
    </article>
  );
}

function DropColumn({
  title,
  status,
  tasks,
  onMoveTask,
}: {
  title: string;
  status: TaskStatus;
  tasks: TaskItem[];
  onMoveTask: (taskId: string, nextStatus: TaskStatus) => void;
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop<{ id: string; status: TaskStatus }, void, { isOver: boolean; canDrop: boolean }>(
    () => ({
      accept: DND_TASK_TYPE,
      drop: (item: { id: string; status: TaskStatus }) => {
        if (item.status !== status) {
          onMoveTask(item.id, status);
        }
      },
      canDrop: (item: { status: TaskStatus }) => item.status !== status,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onMoveTask, status]
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>
      <div
        ref={dropRef}
        className={cn(
          "min-h-[360px] space-y-2 rounded-xl border-2 border-dashed p-2 transition",
          isOver && canDrop
            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
            : "border-gray-200 dark:border-gray-700"
        )}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export function KanbanBoard({ tasks, onMoveTask }: KanbanBoardProps) {
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, TaskItem[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of tasks) {
      map[task.status].push(task);
    }
    return map;
  }, [tasks]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <DropColumn
            key={column.key}
            title={column.label}
            status={column.key}
            tasks={grouped[column.key]}
            onMoveTask={onMoveTask}
          />
        ))}
      </div>
    </DndProvider>
  );
}
