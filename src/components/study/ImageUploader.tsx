import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onImageUploaded(url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error(error);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="inline-block">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="image-upload"
            />
            <label htmlFor="image-upload">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="cursor-pointer"
                    asChild
                >
                    <span>
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Add Image
                            </>
                        )}
                    </span>
                </Button>
            </label>
        </div>
    );
}

interface ImagePreviewProps {
    url: string;
    onRemove?: () => void;
}

export function ImagePreview({ url, onRemove }: ImagePreviewProps) {
    return (
        <div className="relative inline-block group">
            <img
                src={url}
                alt="Uploaded"
                className="max-w-full h-auto rounded-lg border"
                style={{ maxHeight: '400px' }}
                loading="lazy"
            />
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
