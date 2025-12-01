import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { KanbanBoard } from "@/components/kanban/Board";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, LayoutDashboard, ShieldAlert, Sparkles } from "lucide-react";
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-primary/20 animate-ping absolute inset-0" />
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center relative z-10">
              <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (user === null) return null;

  // Block access if not verified
  if (!user.emailVerificationTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50" />
        <div className="max-w-md w-full text-center space-y-6 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border shadow-2xl">
          <div className="bg-yellow-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ring-8 ring-yellow-500/5">
            <ShieldAlert className="w-10 h-10 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Verification Required</h1>
            <p className="text-muted-foreground">
              Please verify your email address to access your dashboard.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => signOut()} className="rounded-full px-6">Sign Out</Button>
            <Button onClick={() => setIsAuthModalOpen(true)} className="rounded-full px-6">Enter Code</Button>
          </div>
          <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative selection:bg-primary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50" />
      
      <header className="border-b bg-card/50 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center gap-2">
              FocusBoard <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">PRO</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            onClick={() => setIsNewTaskOpen(true)} 
            className="gap-2 h-9 md:h-10 text-xs md:text-sm rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Task</span>
            <span className="md:hidden">New</span>
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
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