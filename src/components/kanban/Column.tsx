import { Doc, Id } from "@/convex/_generated/dataModel";
import { TaskCard } from "./TaskCard";
import { TaskStatus } from "./Board";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: Doc<"tasks">[];
  onDragStart: (taskId: Id<"tasks">) => void;
  onDrop: () => void;
}

export function KanbanColumn({ id, label, color, tasks, onDragStart, onDrop }: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col rounded-2xl border bg-card/40 backdrop-blur-md transition-all duration-300 shadow-sm",
        id === "in_progress" && "border-blue-200/50 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10",
        id === "blocked" && "border-red-200/50 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10",
        id === "done" && "border-green-200/50 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add("ring-2", "ring-primary/20", "bg-accent/50");
        if (id === "done") e.currentTarget.classList.add("scale-[1.01]", "shadow-xl", "border-green-400");
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("ring-2", "ring-primary/20", "bg-accent/50");
        if (id === "done") e.currentTarget.classList.remove("scale-[1.01]", "shadow-xl", "border-green-400");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("ring-2", "ring-primary/20", "bg-accent/50");
        if (id === "done") e.currentTarget.classList.remove("scale-[1.01]", "shadow-xl", "border-green-400");
        onDrop();
      }}
    >
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-card", 
            id === "todo" && "bg-slate-400 ring-slate-200 dark:ring-slate-800",
            id === "in_progress" && "bg-blue-500 ring-blue-200 dark:ring-blue-900",
            id === "blocked" && "bg-red-500 ring-red-200 dark:ring-red-900",
            id === "done" && "bg-green-500 ring-green-200 dark:ring-green-900"
          )} />
          <h3 className="font-bold tracking-tight text-sm text-foreground/80">
            {label}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground bg-background/50 border px-2 py-1 rounded-md shadow-sm">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-muted/50 rounded-xl flex flex-col items-center justify-center text-muted-foreground/50 gap-2 transition-colors hover:border-muted hover:text-muted-foreground">
            <div className="p-2 rounded-full bg-muted/30">
              {id === "done" ? "🎉" : "✨"}
            </div>
            <span className="text-xs font-medium">{id === "done" ? "Drag completed tasks here!" : "No tasks yet"}</span>
          </div>
        )}
      </div>
    </div>
  );
}