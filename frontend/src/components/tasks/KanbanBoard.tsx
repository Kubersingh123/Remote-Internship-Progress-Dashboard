import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import api from "../../api/client";
import type { Task } from "../../types";

const columns = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
] as const;

export function KanbanBoard({ tasks, onTasksChange }: { tasks: Task[]; onTasksChange: (tasks: Task[]) => void }) {
  async function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) {
      return;
    }

    const nextTasks = tasks.map((task) =>
      task.id === result.draggableId
        ? { ...task, status: result.destination!.droppableId as Task["status"] }
        : task
    );
    onTasksChange(nextTasks);

    const movedTask = nextTasks.find((task) => task.id === result.draggableId);
    if (movedTask) {
      await api.patch(`/tasks/${movedTask.id}`, { status: movedTask.status });
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <Droppable droppableId={column.key} key={column.key}>
            {(provided) => (
              <section className="panel panel-hover p-4" ref={provided.innerRef} {...provided.droppableProps}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{column.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {tasks.filter((task) => task.status === column.key).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.filter((task) => task.status === column.key).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(dragProvided) => (
                        <article
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-600 dark:hover:bg-slate-800"
                        >
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-sky-900/30 dark:text-sky-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </article>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </section>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
