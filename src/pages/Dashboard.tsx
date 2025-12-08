import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban/Board";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NewTaskModal } from "@/components/kanban/NewTaskModal";
import { ProfileModal } from "@/components/ProfileModal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!user?._id) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user._id));
    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasksData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...doc.data(),
        _id: doc.id,
        // Ensure compatibility with existing code expecting numbers/dates
        _creationTime: doc.data().createdAt || Date.now(), 
      }));
      setTasks(tasksData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?._id]);

  if (isLoading || !user) {
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

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden relative selection:bg-primary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] opacity-50" />
      
      <header className="border-b bg-card/50 backdrop-blur-xl px-3 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold tracking-tight flex items-center gap-2">
              FocusBoard <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">PRO</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-auto md:w-[240px] justify-start text-left font-normal h-9 md:h-10 text-xs md:text-sm shadow-sm px-2.5 md:px-4",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline">{date ? format(date, "PPP") : <span>Pick a date</span>}</span>
                <span className="md:hidden">{date ? format(date, "MMM d") : <span>Date</span>}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          <Button 
            onClick={() => setIsNewTaskOpen(true)} 
            className="gap-2 h-9 md:h-10 text-xs md:text-sm rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 px-3 md:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Task</span>
            <span className="md:hidden">New</span>
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          {user && <ProfileModal user={user as any} />}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <KanbanBoard tasks={tasks} selectedDate={date || new Date()} />
      </main>

      <NewTaskModal 
        open={isNewTaskOpen} 
        onOpenChange={setIsNewTaskOpen} 
      />
    </div>
  );
}