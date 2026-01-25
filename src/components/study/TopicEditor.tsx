import { useState, useEffect } from "react";
import { Save, Loader2, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader, ImagePreview } from "./ImageUploader";
import { LinkedTasksPanel } from "./LinkedTasksPanel";
import { Topic } from "@/types/topic";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { OutputData } from "@editorjs/editorjs";
import "./editor.css";


interface TopicEditorProps {
    topicId?: string;
    initialTopic?: Topic;
    onSave?: () => void;
    onBack?: () => void;
}

export function TopicEditor({ topicId, initialTopic, onSave, onBack }: TopicEditorProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(initialTopic?.title || "");
    const [content, setContent] = useState<OutputData | undefined>(
        typeof initialTopic?.content === "object" ? initialTopic.content : undefined
    );
    const [images, setImages] = useState<string[]>(initialTopic?.images || []);
    const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initialTopic?.linkedTaskIds || []);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditMode, setIsEditMode] = useState(!topicId); // Edit mode by default for new topics

    useEffect(() => {
        if (initialTopic) {
            setTitle(initialTopic.title);
            setContent(
                typeof initialTopic.content === "object" ? initialTopic.content : undefined
            );
            setImages(initialTopic.images);
            setLinkedTaskIds(initialTopic.linkedTaskIds);
            setHasChanges(false);
        }
    }, [initialTopic]);

    useEffect(() => {
        if (isEditMode) {
            setHasChanges(true);
        }
    }, [title, content, images, linkedTaskIds, isEditMode]);

    const handleEdit = () => {
        setIsEditMode(true);
        setHasChanges(false);
    };

    const handleSave = async () => {
        if (!user?._id) return;
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        setSaving(true);
        try {
            const topicData = {
                userId: user._id,
                title: title.trim(),
                content: content || { blocks: [] }, // Store Editor.js format
                images,
                linkedTaskIds,
                updatedAt: Date.now(),
            };

            if (topicId) {
                // Update existing topic
                const topicRef = doc(db, "topics", topicId);
                await updateDoc(topicRef, topicData);
                toast.success("Topic updated");
            } else {
                // Create new topic
                const newTopicRef = doc(db, "topics", crypto.randomUUID());
                await setDoc(newTopicRef, {
                    ...topicData,
                    createdAt: Date.now(),
                });
                toast.success("Topic created");
            }

            setHasChanges(false);
            setIsEditMode(false); // Exit edit mode after saving
            onSave?.();
        } catch (error: any) {
            toast.error("Failed to save topic", { description: error.message });
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUploaded = (url: string) => {
        setImages([...images, url]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleTasksLinked = (taskIds: string[]) => {
        setLinkedTaskIds(taskIds);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                    )}
                    <h2 className="text-lg font-semibold">
                        {topicId ? "Edit Topic" : "New Topic"}
                    </h2>
                </div>

                {isEditMode ? (
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        size="sm"
                        className="gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleEdit}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-2 md:p-6 space-y-4 md:space-y-6">
                    {/* Title */}
                    <div>
                        <Input
                            placeholder="Topic Title (e.g., CAP Theorem)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl md:text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                            readOnly={!isEditMode}
                            disabled={!isEditMode}
                        />
                    </div>

                    {/* Content */}
                    <div className="border-0 md:border-2 border-border rounded-none md:rounded-lg p-1 md:pl-14 md:pr-14 md:py-6 bg-transparent md:bg-card/50 min-h-[300px] md:min-h-[500px]">
                        <RichTextEditor
                            data={content}
                            onChange={setContent}
                            placeholder="Write your notes here... Use the toolbar to format text, add code blocks, lists, and more."
                            readOnly={!isEditMode}
                        />
                    </div>


                    {/* Images */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                            {isEditMode && <ImageUploader onImageUploaded={handleImageUploaded} />}
                        </div>

                        {images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {images.map((url, index) => (
                                    <ImagePreview
                                        key={index}
                                        url={url}
                                        onRemove={isEditMode ? () => handleRemoveImage(index) : undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Linked Tasks */}
                    <div className="border-t pt-6">
                        <LinkedTasksPanel
                            topicId={topicId}
                            linkedTaskIds={linkedTaskIds}
                            onTasksLinked={handleTasksLinked}
                            readOnly={!isEditMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
