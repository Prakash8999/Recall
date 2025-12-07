import { useState } from "react";
import { KanbanColumn } from "./Column";
import { toast } from "sonner";
import { BlockTaskModal } from "./BlockTaskModal";
import { isSameDay } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface KanbanBoardProps {
  tasks: any[];
  selectedDate: Date;
}

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export function KanbanBoard({ tasks, selectedDate }: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [pendingBlockTaskId, setPendingBlockTaskId] = useState<string | null>(null);

  // Filter tasks based on selected date
  const filteredTasks = tasks.filter((task) => {
    const isToday = isSameDay(selectedDate, new Date());
    
    if (task.status === "done") {
      return task.completedAt ? isSameDay(new Date(task.completedAt), selectedDate) : false;
    } else {
      return isToday;
    }
  });

  const handleDragStart = (taskId: string) => {
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
      const taskRef = doc(db, "tasks", draggedTaskId);
      const updates: any = { status: targetStatus };
      if (targetStatus === "done") {
        updates.completedAt = Date.now();
      }
      await updateDoc(taskRef, updates);
      
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
      const taskRef = doc(db, "tasks", pendingBlockTaskId);
      await updateDoc(taskRef, {
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
    <div className="h-full p-4 md:p-6 overflow-x-auto overflow-y-hidden bg-muted/20 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
      <div className="flex h-full gap-4 md:gap-6 min-w-full w-max pb-4 px-2 snap-x snap-mandatory">
        {columns.map((col) => (
          <div key={col.id} className="w-[85vw] md:w-[350px] shrink-0 h-full flex flex-col snap-center snap-always">
            <KanbanColumn
              id={col.id}
              label={col.label}
              color={col.color}
              tasks={filteredTasks.filter((t) => t.status === col.id)}
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