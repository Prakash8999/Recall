
import { TaskCard } from "./TaskCard";
import { TaskStatus } from "./Board";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  color: string;
  tasks: any[];
  onDragStart: (taskId: string) => void;
  onDrop: () => void;
  selectedTaskIds: Set<string>;
  onToggleSelection: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanColumn({
  id,
  label,
  color,
  tasks,
  onDragStart,
  onDrop,
  selectedTaskIds,
  onToggleSelection,
  onStatusChange
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden h-full",
        id === "in_progress" && "border-blue-200/50 dark:border-blue-900/50 ring-1 ring-blue-500/5",
        id === "blocked" && "border-red-200/50 dark:border-red-900/50 ring-1 ring-red-500/5",
        id === "done" && "border-green-200/50 dark:border-green-900/50 ring-1 ring-green-500/5"
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
        "p-4 flex items-center justify-between border-b bg-gradient-to-b from-white/50 to-transparent dark:from-white/5",
        id === "todo" && "border-secondary",
        id === "in_progress" && "border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10",
        id === "blocked" && "border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10",
        id === "done" && "border-green-100 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-card",
            id === "todo" && "bg-slate-400 ring-slate-200 dark:ring-slate-800",
            id === "in_progress" && "bg-blue-500 ring-blue-200 dark:ring-blue-900",
            id === "blocked" && "bg-red-500 ring-red-200 dark:ring-red-900",
            id === "done" && "bg-green-500 ring-green-200 dark:ring-green-900"
          )} />
          <h3 className="font-bold tracking-tight text-sm text-foreground uppercase opacity-90">
            {label}
          </h3>
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm",
          "bg-background/80 text-muted-foreground"
        )}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onDragStart={onDragStart}
            isSelected={selectedTaskIds.has(task._id)}
            onToggleSelection={() => onToggleSelection(task._id)}
            onStatusChange={onStatusChange}
          />
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