import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Clock, CheckCircle2, Sparkles, BrainCircuit, MoreVertical, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { EditTaskModal } from "./EditTaskModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Doc<"tasks">;
  onDragStart: (taskId: Id<"tasks">) => void;
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const removeTask = useMutation(api.tasks.remove);
  const createTask = useMutation(api.tasks.create);
  const performAi = useAction(api.ai.chat);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await removeTask({ taskId: task._id });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleAiBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAiLoading(true);
    try {
      const prompt = `Break down the task "${task.title}" into 3 actionable sub-tasks. Return JSON: { "subtasks": ["Task 1", "Task 2"] }`;
      const result = await performAi({ prompt, asJson: true });
      const subtasks = result.subtasks || [];

      if (subtasks.length > 0) {
        for (const subtaskTitle of subtasks) {
          await createTask({
            title: subtaskTitle,
            description: `Subtask of: ${task.title}`,
            status: "todo",
          });
        }
        toast.success(`Created ${subtasks.length} subtasks!`, {
          icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
        });
      }
    } catch (error: any) {
      toast.error("AI Failed", { description: error.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiUnblock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.blockedReason) return;
    
    setIsAiLoading(true);
    try {
      const prompt = `My task "${task.title}" is blocked because: "${task.blockedReason}". Give me 3 short, strategic tips to unblock it. Return JSON: { "tips": ["Tip 1", "Tip 2", "Tip 3"] }`;
      const result = await performAi({ prompt, asJson: true });
      const tips = result.tips || [];
      
      if (tips.length > 0) {
        toast.message("Unblocking Tips", {
          description: (
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {tips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          ),
          duration: 8000,
        });
      }
    } catch (error: any) {
      toast.error("AI Failed", { description: error.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <motion.div
        layoutId={task._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05, rotate: 2, zIndex: 50 }}
        draggable
        onDragStart={() => onDragStart(task._id)}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-transparent data-[status=blocked]:border-l-red-500 data-[status=done]:border-l-green-500 data-[status=in_progress]:border-l-blue-500" data-status={task.status}>
          <CardHeader className="p-3 pb-0 space-y-0">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-sm font-medium leading-tight">
                {task.title}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-1 text-muted-foreground hover:text-foreground"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            
            {task.status === "blocked" && task.blockedReason && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-2 rounded-md mt-2">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{task.blockedReason}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 h-6 text-[10px] bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/30"
                  onClick={handleAiUnblock}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <BrainCircuit className="w-3 h-3 mr-1"/>}
                  Get Unstuck
                </Button>
              </div>
            )}

            {task.status === "todo" && (
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="w-full mt-2 h-6 text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300"
                 onClick={handleAiBreakdown}
                 disabled={isAiLoading}
               >
                 {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                 AI Breakdown
               </Button>
            )}

            <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1" title="Created at">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatDistanceToNow(task._creationTime, { addSuffix: true })}</span>
                </div>
                {task.status === "done" && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
              {task.updatedAt && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70" title="Last updated">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDistanceToNow(task.updatedAt, { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <EditTaskModal 
        task={task} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </>
  );
}