import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { KanbanBoard } from "@/components/kanban/Board";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, LayoutDashboard, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NewTaskModal } from "@/components/kanban/NewTaskModal";
import { ProfileModal } from "@/components/ProfileModal";
import { toast } from "sonner";
import { AuthModal } from "@/components/AuthModal";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const tasks = useQuery(api.tasks.list);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  if (user === null) return null;

  // Block access if not verified
  if (!user.emailVerificationTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="bg-yellow-500/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold">Verification Required</h1>
          <p className="text-muted-foreground">
            Please verify your email address to access your dashboard.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
            <Button onClick={() => setIsAuthModalOpen(true)}>Enter Code</Button>
          </div>
          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">FocusBoard</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">Personal Kanban</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Button onClick={() => setIsNewTaskOpen(true)} className="gap-2 h-9 md:h-10 text-xs md:text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Task</span>
            <span className="md:hidden">New</span>
          </Button>
          {user && <ProfileModal user={user} />}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <KanbanBoard tasks={tasks} />
      </main>

      <NewTaskModal 
        open={isNewTaskOpen} 
        onOpenChange={setIsNewTaskOpen} 
      />
    </div>
  );
}