import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps) {
  const createTask = useMutation(api.tasks.create);
  const performAi = useAction(api.ai.chat);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiDescription = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title first");
      return;
    }
    setIsAiLoading(true);
    try {
      const prompt = `Write a clear, professional description for a task titled: "${title}". Keep it concise (under 2 sentences).`;
      const text = await performAi({ prompt, asJson: false });
      setDescription(text);
      toast.success("Description generated!");
    } catch (error: any) {
      toast.error("AI Failed", { description: error.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask({
        title,
        description,
        status: "todo",
      });
      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board. Break it down into small steps.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Build landing page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description (Optional)</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-indigo-600"
                onClick={handleAiDescription}
                disabled={isAiLoading || !title.trim()}
              >
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                Auto-Write
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}