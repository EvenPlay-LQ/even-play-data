import { useState, useRef } from "react";
import { Upload, X, FileText, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  path: string;
  url: string;
  size: number;
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string;
  folder?: string;
}

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const FileUpload = ({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx",
  folder = "documents",
}: FileUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (fileList: FileList) => {
    if (!user) {
      toast({ title: "Not authenticated", description: "Please sign in first.", variant: "destructive" });
      return;
    }

    const files = Array.from(fileList).slice(0, maxFiles - uploadedFiles.length);
    if (files.length === 0) {
      toast({ title: "Limit reached", description: `Maximum ${maxFiles} files allowed.`, variant: "destructive" });
      return;
    }

    // Validate
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds ${maxSizeMB}MB limit.`, variant: "destructive" });
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid file type", description: `${file.name} is not a supported file type.`, variant: "destructive" });
        return;
      }
    }

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("profile-uploads")
        .upload(filePath, file, { upsert: false });

      if (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("profile-uploads")
        .getPublicUrl(filePath);

      newFiles.push({
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
      });
    }

    const updated = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updated);
    onUploadComplete?.(updated);
    setUploading(false);

    if (newFiles.length > 0) {
      toast({ title: "Upload complete", description: `${newFiles.length} file(s) uploaded successfully.` });
    }
  };

  const handleRemove = async (file: UploadedFile) => {
    await supabase.storage.from("profile-uploads").remove([file.path]);
    const updated = uploadedFiles.filter((f) => f.path !== file.path);
    setUploadedFiles(updated);
    onUploadComplete?.(updated);
  };

  const getIcon = (name: string) => {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return <Image className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground/60">
              Images, PDFs, Documents · Max {maxSizeMB}MB · Up to {maxFiles} files
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Uploaded file list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.path} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              {getIcon(file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(file)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
