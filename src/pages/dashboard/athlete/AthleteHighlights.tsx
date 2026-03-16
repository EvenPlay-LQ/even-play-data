import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface MediaItem {
  id: string;
  media_type: "image" | "video";
  file_url: string;
  description: string | null;
  created_at: string;
}

const AthleteHighlights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [athlete, setAthlete] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData } = await supabase
        .from("athletes").select("id").eq("profile_id", user.id).maybeSingle();
      if (athleteData) {
        setAthlete(athleteData);
        const { data } = await supabase
          .from("media_gallery" as any)
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false });
        setMedia((data || []) as MediaItem[]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !athlete) return;
    setUploading(true);

    const ext = selectedFile.name.split(".").pop();
    const path = `athlete_media/${athlete.id}/${Date.now()}.${ext}`;
    const mediaType = selectedFile.type.startsWith("video") ? "video" : "image";

    const { error: uploadError } = await supabase.storage.from("athlete_media").upload(path, selectedFile);
    if (uploadError) {
      handleQueryError(uploadError, "Upload failed. Check storage bucket is created.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("athlete_media").getPublicUrl(path);
    const { data: newItem, error: insertError } = await supabase
      .from("media_gallery" as any)
      .insert([{ athlete_id: athlete.id, media_type: mediaType, file_url: publicUrl, description }])
      .select()
      .single();

    if (insertError) { handleQueryError(insertError); }
    else {
      setMedia([newItem as MediaItem, ...media]);
      setSelectedFile(null);
      setPreview(null);
      setDescription("");
      setShowForm(false);
      toast({ title: "Media uploaded!" });
    }
    setUploading(false);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    const path = fileUrl.split("/athlete_media/")[1];
    if (path) await supabase.storage.from("athlete_media").remove([`athlete_media/${path}`]);
    const { error } = await supabase.from("media_gallery" as any).delete().eq("id", id);
    if (error) handleQueryError(error);
    else {
      setMedia(media.filter(m => m.id !== id));
      toast({ title: "Media removed." });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Media Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">Images and video highlights from your career.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {showForm ? "Cancel" : "Upload Media"}
          </Button>
        </div>

        {/* Upload Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h2 className="font-display font-semibold text-foreground">Upload Image or Video</h2>
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />

                {!preview ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to choose a file</span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-muted h-48">
                    {selectedFile?.type.startsWith("video") ? (
                      <video src={preview} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => { setPreview(null); setSelectedFile(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                )}
                <div>
                  <Label>Description (optional)</Label>
                  <Input className="mt-1" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a caption..." />
                </div>
                <Button className="w-full" onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        {media.length === 0 ? (
          <div className="text-center py-20">
            <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">No media yet</h3>
            <p className="text-sm text-muted-foreground">Upload images and videos to build your highlight reel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative aspect-square bg-muted rounded-xl overflow-hidden border border-border"
              >
                {item.media_type === "video" ? (
                  <video src={item.file_url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.file_url} alt={item.description || ""} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.media_type === "video" && (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <button onClick={() => handleDelete(item.id, item.file_url)}
                      className="w-8 h-8 bg-destructive/80 rounded-full flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white line-clamp-1">{item.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteHighlights;
