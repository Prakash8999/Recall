import { useState } from "react";
import { KanbanColumn } from "./Column";
import { toast } from "sonner";
import { BlockTaskModal } from "./BlockTaskModal";
import { isSameDay } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  tasks: any[];
  selectedDate: Date;
}

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export function KanbanBoard({ tasks, selectedDate }: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [pendingBlockTaskId, setPendingBlockTaskId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Filter tasks based on selected date
  const filteredTasks = tasks.filter((task) => {
    const isToday = isSameDay(selectedDate, new Date());

    if (task.status === "done") {
      return task.completedAt ? isSameDay(new Date(task.completedAt), selectedDate) : false;
    } else {
      return isToday;
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t._id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTaskIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedTaskIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.size} tasks?`)) return;

    try {
      const batch = writeBatch(db);
      selectedTaskIds.forEach((id) => {
        const taskRef = doc(db, "tasks", id);
        batch.delete(taskRef);
      });
      await batch.commit();

      toast.success(`Deleted ${selectedTaskIds.size} tasks`);
      setSelectedTaskIds(new Set());
    } catch (error: any) {
      toast.error("Failed to delete tasks", { description: error.message });
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    if (task.status === newStatus) return;

    if (newStatus === "in_progress") {
      const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
      if (inProgressCount >= 2) {
        toast.warning("Limit Reached", {
          description: "You can only have 2 tasks in progress at once.",
        });
        return;
      }
    }

    if (newStatus === "blocked") {
      setPendingBlockTaskId(taskId);
      setBlockModalOpen(true);
      return;
    }

    try {
      const taskRef = doc(db, "tasks", taskId);
      const updates: any = { status: newStatus };
      if (newStatus === "done") {
        updates.completedAt = Date.now();
      }
      await updateDoc(taskRef, updates);

      if (newStatus === "done") {
        toast.success("Task Completed!", {
          description: "Great job! Keep up the momentum.",
        });
      }
    } catch (error: any) {
      toast.error("Failed to update task status", {
        description: error.message,
      });
    }
  };

  const handleDrop = async (targetStatus: TaskStatus) => {
    if (!draggedTaskId) return;
    await handleStatusChange(draggedTaskId, targetStatus);
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
    <div className="h-full flex flex-col bg-muted/20">
      {/* Bulk Actions Toolbar */}
      <div className="px-4 md:px-6 py-2 border-b bg-background/50 backdrop-blur-sm flex items-center gap-4 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <Checkbox
            id="select-all"
            checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
            onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer select-none whitespace-nowrap">
            Select All New
          </label>
        </div>

        {selectedTaskIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5 duration-200 shrink-0">
            <div className="h-4 w-px bg-border mx-2" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {selectedTaskIds.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-2"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
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
                selectedTaskIds={selectedTaskIds}
                onToggleSelection={toggleTaskSelection}
                onStatusChange={handleStatusChange}
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
    </div>
  );
}