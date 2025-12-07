import { useState } from "react";
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
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { callAi } from "@/lib/ai";

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskModal({ open, onOpenChange }: NewTaskModalProps) {
  const { user } = useAuth();
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
      const systemPrompt = "You are a professional project manager. Write a concise, professional task description based on the task title provided. Include 2-3 bullet points of key steps. Do not include any conversational filler.";
      const result = await callAi(title, systemPrompt);
      setDescription(result);
      toast.success("Description generated!");
    } catch (error: any) {
      if (error.message.includes("Missing API Key")) {
        toast.error("AI Configuration Missing", { 
          description: "Please add VITE_PPLX_API_KEY to your .env.local file to use AI features." 
        });
      } else {
        toast.error("AI Failed", { description: error.message });
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiImprove = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description first");
      return;
    }
    console.log("Improving description:", description);
    setIsAiLoading(true);
    try {
      const systemPrompt = "You are a professional editor. Rewrite the input text to improve grammar, clarity, and professional tone. Return ONLY the improved text. Do NOT include any conversational filler, prefixes (like 'Improved:'), or suffixes. Do NOT repeat the input if it is already correct, just return the corrected version. Do NOT wrap in quotes.";
      const result = await callAi(description, systemPrompt);
      
      console.log("Raw AI result:", result);

      // Clean up the result just in case the AI is chatty
      let cleanedResult = result.trim();
      
      // Remove common prefixes
      cleanedResult = cleanedResult.replace(/^Here is the improved text:[\s\n]*/i, "");
      cleanedResult = cleanedResult.replace(/^\(Improved\)[\s\n]*/i, "");
      cleanedResult = cleanedResult.replace(/^Improved:[\s\n]*/i, "");
      cleanedResult = cleanedResult.replace(/^Output:[\s\n]*/i, "");
      
      // Remove common suffixes (more aggressive)
      cleanedResult = cleanedResult.replace(/[\s\n]*- Corrected for grammar.*$/i, "");
      cleanedResult = cleanedResult.replace(/[\s\n]*Note:.*$/i, "");
      
      // Remove quotes if the AI wrapped the whole thing in quotes
      if (cleanedResult.startsWith('"') && cleanedResult.endsWith('"')) {
        cleanedResult = cleanedResult.slice(1, -1);
      }

      console.log("Cleaned result:", cleanedResult);
      
      if (cleanedResult === description.trim()) {
         toast.info("No changes needed", { description: "The AI thinks your description is already great!" });
      } else {
         setDescription(cleanedResult);
         toast.success("Description improved!");
      }
    } catch (error: any) {
      console.error("AI Improve Error:", error);
      if (error.message.includes("Missing API Key")) {
        toast.error("AI Configuration Missing", { 
          description: "Please add VITE_PPLX_API_KEY to your .env.local file to use AI features." 
        });
      } else {
        toast.error("AI Failed", { description: error.message });
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user._id,
        title,
        description,
        status: "todo",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
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
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  onClick={handleAiDescription}
                  disabled={isAiLoading || !title.trim()}
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                  Auto-Write
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={handleAiImprove}
                  disabled={isAiLoading || !description.trim()}
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Wand2 className="w-3 h-3 mr-1"/>}
                  Improve
                </Button>
              </div>
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