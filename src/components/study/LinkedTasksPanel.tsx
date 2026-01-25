import { useState, useEffect } from "react";
import { Link2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface LinkedTasksPanelProps {
    topicId?: string;
    linkedTaskIds: string[];
    onTasksLinked: (taskIds: string[]) => void;
    readOnly?: boolean;
}

export function LinkedTasksPanel({ topicId, linkedTaskIds, onTasksLinked, readOnly = false }: LinkedTasksPanelProps) {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [showTaskPicker, setShowTaskPicker] = useState(false);

    useEffect(() => {
        if (!user?._id) return;

        const q = query(collection(db, "tasks"), where("userId", "==", user._id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map((doc) => ({
                _id: doc.id,
                ...doc.data(),
            }));
            setAllTasks(tasksData);
        });

        return () => unsubscribe();
    }, [user?._id]);

    const linkedTasks = allTasks.filter((task) => linkedTaskIds.includes(task._id));
    const availableTasks = allTasks.filter((task) => !linkedTaskIds.includes(task._id));

    const handleToggleTask = async (taskId: string) => {
        const newLinkedTaskIds = linkedTaskIds.includes(taskId)
            ? linkedTaskIds.filter((id) => id !== taskId)
            : [...linkedTaskIds, taskId];

        onTasksLinked(newLinkedTaskIds);

        // Update the task's linkedTopicId
        if (topicId) {
            try {
                const taskRef = doc(db, "tasks", taskId);
                await updateDoc(taskRef, {
                    linkedTopicId: linkedTaskIds.includes(taskId) ? null : topicId,
                });
            } catch (error) {
                console.error("Failed to update task link:", error);
            }
        }
    };

    const handleRemoveTask = async (taskId: string) => {
        const newLinkedTaskIds = linkedTaskIds.filter((id) => id !== taskId);
        onTasksLinked(newLinkedTaskIds);

        if (topicId) {
            try {
                const taskRef = doc(db, "tasks", taskId);
                await updateDoc(taskRef, { linkedTopicId: null });
                toast.success("Task unlinked");
            } catch (error) {
                toast.error("Failed to unlink task");
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Linked Kanban Tasks
                </h3>
                {!readOnly && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTaskPicker(!showTaskPicker)}
                        className="gap-2"
                    >
                        <Plus className="w-3 h-3" />
                        Link Task
                    </Button>
                )}
            </div>

            {/* Linked Tasks */}
            {linkedTasks.length > 0 && (
                <div className="space-y-2">
                    {linkedTasks.map((task) => (
                        <div
                            key={task._id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium">{task.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    Status: {task.status.replace("_", " ")}
                                </p>
                            </div>
                            {!readOnly && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveTask(task._id)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {linkedTasks.length === 0 && !showTaskPicker && (
                <p className="text-sm text-muted-foreground">
                    No linked tasks. Link tasks to connect your study notes with your work.
                </p>
            )}

            {/* Task Picker */}
            {showTaskPicker && (
                <div className="border rounded-lg p-4 space-y-2 bg-card">
                    <p className="text-sm font-medium mb-3">Select tasks to link:</p>
                    {availableTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No available tasks to link
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                                    onClick={() => handleToggleTask(task._id)}
                                >
                                    <Checkbox
                                        checked={linkedTaskIds.includes(task._id)}
                                        onCheckedChange={() => handleToggleTask(task._id)}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm">{task.title}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {task.status.replace("_", " ")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
