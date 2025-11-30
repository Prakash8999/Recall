import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { KanbanBoard } from "@/components/kanban/Board";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NewTaskModal } from "@/components/kanban/NewTaskModal";
import { ProfileModal } from "@/components/ProfileModal";
import { toast } from "sonner";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const tasks = useQuery(api.tasks.list);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  if (tasks === undefined || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FocusBoard</h1>
            <p className="text-xs text-muted-foreground">Personal Kanban</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsNewTaskOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
          {user && <ProfileModal user={user} />}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <KanbanBoard tasks={tasks} />
      </main>

      <NewTaskModal 
        open={isNewTaskOpen} 
        onOpenChange={setIsNewTaskOpen} 
      />
    </div>
  );
}