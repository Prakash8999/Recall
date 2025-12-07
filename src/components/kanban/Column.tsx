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
        "flex-1 flex flex-col rounded-xl border bg-card transition-all duration-300 shadow-sm hover:shadow-md",
        id === "in_progress" && "border-blue-200/50 dark:border-blue-900/50",
        id === "blocked" && "border-red-200/50 dark:border-red-900/50",
        id === "done" && "border-green-200/50 dark:border-green-900/50"
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
      <div className={cn(
        "p-3 flex items-center justify-between border-b",
        id === "todo" && "bg-secondary/30 border-secondary",
        id === "in_progress" && "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900",
        id === "blocked" && "bg-red-50/50 dark:bg-red-900/20 border-red-100 dark:border-red-900",
        id === "done" && "bg-green-50/50 dark:bg-green-900/20 border-green-100 dark:border-green-900"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", 
            id === "todo" && "bg-slate-400",
            id === "in_progress" && "bg-blue-500",
            id === "blocked" && "bg-red-500",
            id === "done" && "bg-green-500"
          )} />
          <h3 className="font-semibold tracking-tight text-sm text-foreground">
            {label}
          </h3>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border shadow-sm">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onDragStart={onDragStart} />
        ))}
        {tasks.length === 0 && (
          <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
            <div className="p-3 rounded-full bg-muted/20">
              {id === "done" ? "🎉" : "✨"}
            </div>
            <span className="text-xs font-medium">{id === "done" ? "No completed tasks" : "No tasks"}</span>
          </div>
        )}
      </div>
    </div>
  );
}