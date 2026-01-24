import { useState, useEffect } from "react";
import { Search, Clock, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Topic } from "@/types/topic";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

interface TopicsListProps {
    onTopicSelect: (topicId: string) => void;
    onNewTopic: () => void;
}

export function TopicsList({ onTopicSelect, onNewTopic }: TopicsListProps) {
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user?._id) return;

        const q = query(
            collection(db, "topics"),
            where("userId", "==", user._id),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const topicsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Topic[];
            setTopics(topicsData);
        });

        return () => unsubscribe();
    }, [user?._id]);

    // Client-side search - only search in title (content is OutputData object)
    const filteredTopics = topics.filter((topic) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return topic.title.toLowerCase().includes(query);
    });

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b px-4 md:px-6 py-4 space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All Topics</h2>
                    <Button onClick={onNewTopic} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Topic
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search topics by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto">
                {filteredTopics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <p className="text-muted-foreground mb-4">
                            {searchQuery ? "No topics found" : "No topics yet"}
                        </p>
                        {!searchQuery && (
                            <Button onClick={onNewTopic} variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Create your first topic
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredTopics.map((topic) => (
                            <button
                                key={topic.id}
                                onClick={() => onTopicSelect(topic.id)}
                                className="w-full text-left px-4 md:px-6 py-4 hover:bg-muted/50 transition-colors"
                            >
                                <h3 className="font-medium mb-1 line-clamp-1">{topic.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                    {typeof topic.content === 'string' ? topic.content : "Click to view content"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(topic.updatedAt, { addSuffix: true })}
                                    </div>
                                    {topic.linkedTaskIds.length > 0 && (
                                        <div>
                                            {topic.linkedTaskIds.length} linked task{topic.linkedTaskIds.length !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
