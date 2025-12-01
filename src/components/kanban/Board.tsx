import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { KanbanColumn } from "./Column";
import { toast } from "sonner";
import { BlockTaskModal } from "./BlockTaskModal";

interface KanbanBoardProps {
  tasks: Doc<"tasks">[];
}

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const updateStatus = useMutation(api.tasks.updateStatus);
  const [draggedTaskId, setDraggedTaskId] = useState<Id<"tasks"> | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [pendingBlockTaskId, setPendingBlockTaskId] = useState<Id<"tasks"> | null>(null);

  const handleDragStart = (taskId: Id<"tasks">) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = async (targetStatus: TaskStatus) => {
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t._id === draggedTaskId);
    if (!task) return;

    if (task.status === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    // Check limits locally for immediate feedback (backend also checks)
    if (targetStatus === "in_progress") {
      const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
      if (inProgressCount >= 2) {
        toast.warning("Limit Reached", {
          description: "You can only have 2 tasks in progress at once.",
        });
        setDraggedTaskId(null);
        return;
      }
    }

    if (targetStatus === "blocked") {
      setPendingBlockTaskId(draggedTaskId);
      setBlockModalOpen(true);
      setDraggedTaskId(null);
      return;
    }

    try {
      await updateStatus({ taskId: draggedTaskId, status: targetStatus });
      if (targetStatus === "done") {
        toast.success("Task Completed!", {
          description: "Great job! Keep up the momentum.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to move task", {
        description: error.message,
      });
    }
    setDraggedTaskId(null);
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!pendingBlockTaskId) return;
    try {
      await updateStatus({ 
        taskId: pendingBlockTaskId, 
        status: "blocked", 
        blockedReason: reason 
      });
      toast.info("Task Blocked", {
        description: "Don't worry, you'll unblock it soon.",
      });
    } catch (error: any) {
      toast.error("Failed to block task", {
        description: error.message,
      });
    }
    setBlockModalOpen(false);
    setPendingBlockTaskId(null);
  };

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: "todo", label: "To Do", color: "bg-secondary/50" },
    { id: "in_progress", label: "In Progress", color: "bg-blue-500/10" },
    { id: "blocked", label: "Blocked", color: "bg-red-500/10" },
    { id: "done", label: "Done", color: "bg-green-500/10" },
  ];

  return (
    <div className="h-full p-4 md:p-8 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full gap-6 min-w-full w-max md:w-full snap-x snap-mandatory md:snap-none pb-2">
        {columns.map((col) => (
          <div key={col.id} className="snap-center min-w-[85vw] md:min-w-0 md:flex-1 h-full flex flex-col">
            <KanbanColumn
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={tasks.filter((t) => t.status === col.id)}
              onDragStart={handleDragStart}
              onDrop={() => handleDrop(col.id)}
            />
          </div>
        ))}
      </div>
      <BlockTaskModal 
        open={blockModalOpen} 
        onOpenChange={setBlockModalOpen}
        onConfirm={handleBlockConfirm}
      />
    </div>
  );
}