import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2, Eye, Calendar, Clock, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
const supabaseAny = supabase as any;
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: string[];
  expires_at?: string;
  read_count: number;
  created_at: string;
  author_name?: string;
}

const InstitutionAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadInstitutionAndAnnouncements();
  }, [user]);

  const loadInstitutionAndAnnouncements = async () => {
    setLoading(true);
    
    const { data: instData } = await supabase
      .from("institutions")
      .select("id")
      .eq("profile_id", user!.id)
      .maybeSingle();
    
    if (instData) {
      setInstitution(instData);
      
      const { data: announcementData } = await supabase
        .from("institution_announcements")
        .select(`
          *,
          profiles(name)
        `)
        .eq("institution_id", instData.id)
        .order("created_at", { ascending: false });
      
      if (announcementData) {
        setAnnouncements(announcementData as unknown as Announcement[]);
      }
    }
    
    setLoading(false);
  };

  const handleCreateAnnouncement = async () => {
    if (!institution || !title.trim() || !content.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("institution_announcements").insert({
        institution_id: institution.id,
        author_id: user!.id,
        title: title.trim(),
        content: content.trim(),
        priority: priority as any,
        target_audience: targetAudience,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      
      if (error) throw error;
      
      toast({
        title: "Announcement posted!",
        description: "Your message has been shared with the selected audience.",
      });
      
      // Reset form and reload
      setTitle("");
      setContent("");
      setPriority("normal");
      setTargetAudience([]);
      setExpiresAt("");
      setCreateDialogOpen(false);
      loadInstitutionAndAnnouncements();
      
    } catch (error: any) {
      handleQueryError(error, "Failed to create announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    const { error } = await supabase.from("institution_announcements").delete().eq("id", id);
    
    if (error) {
      handleQueryError(error, "Failed to delete announcement.");
    } else {
      toast({ title: "Announcement deleted" });
      loadInstitutionAndAnnouncements();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'normal': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'low': return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    }
  };

  const getAudienceLabel = (audiences: string[]) => {
    if (audiences.length === 0) return 'Everyone';
    if (audiences.length === 3) return 'All Groups';
    return audiences.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
  };

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Announcements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Communicate with athletes, parents, and staff
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., Training Schedule Change"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Enter your announcement details..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="mt-1 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Expires At</Label>
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Target Audience</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(['athletes', 'parents', 'coaches'] as const).map(audience => (
                      <Badge
                        key={audience}
                        variant={targetAudience.includes(audience) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setTargetAudience(prev =>
                            prev.includes(audience)
                              ? prev.filter(a => a !== audience)
                              : [...prev, audience]
                          );
                        }}
                      >
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to send to everyone
                  </p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleCreateAnnouncement}
                  disabled={saving || !title.trim() || !content.trim()}
                >
                  {saving ? "Posting..." : "Post Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">
                No announcements yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Create your first announcement to communicate with your community.
              </p>
            </div>
          ) : (
            announcements.map((announcement, i) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPriorityColor(announcement.priority)}`}>
                      <Megaphone className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-lg">
                          {announcement.title}
                        </h3>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(announcement.created_at), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(announcement.created_at), "hh:mm a")}
                        </span>
                        {announcement.expires_at && isPast(new Date(announcement.expires_at)) && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {announcement.read_count} reads
                    </span>
                    <span>
                      To: {getAudienceLabel(announcement.target_audience)}
                    </span>
                  </div>
                  
                  {announcement.author_name && (
                    <span className="text-xs text-muted-foreground">
                      By: {announcement.author_name}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstitutionAnnouncements;
