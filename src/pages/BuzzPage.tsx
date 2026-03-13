import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Clock, Eye, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BUZZ_CATEGORIES } from "@/config/constants";
import { postSchema } from "@/lib/validations";
import { handleQueryError } from "@/lib/queryHelpers";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  views: number;
  created_at: string;
  author_id: string;
}

const BuzzPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) handleQueryError(error, "Failed to load stories.");
    setPosts((data as unknown as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory, searchQuery]);

  const handleCreatePost = async () => {
    setFormErrors({});
    const result = postSchema.safeParse({ title: newTitle, content: newContent, category: newCategory });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setFormErrors(errs);
      return;
    }

    if (!user) return;
    setCreating(true);
    const { error } = await supabase.from("posts").insert({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      author_id: user.id,
    });

    if (error) {
      handleQueryError(error, "Failed to create post.");
    } else {
      toast({ title: "Story published!" });
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setShowCreate(false);
      fetchPosts();
    }
    setCreating(false);
  };

  const featured = posts[0];
  const rest = posts.slice(1);
  const writeCategories = BUZZ_CATEGORIES.filter((c) => c !== "All");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">Buzz</h1>
            <p className="text-sm text-muted-foreground">Sports news, transfers, and stories</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Write Story
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search stories..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BUZZ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">No stories yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to write a story!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-hero p-6 shadow-elevated cursor-pointer"
              >
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium capitalize">{featured.category}</span>
                <h2 className="text-xl font-display font-bold text-primary-foreground mt-3 mb-2">{featured.title}</h2>
                <p className="text-sm text-primary-foreground/60 line-clamp-2 mb-4">{featured.content}</p>
                <div className="flex items-center gap-4 text-xs text-primary-foreground/40">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {featured.views}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(featured.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            )}

            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex gap-4 cursor-pointer hover:shadow-elevated transition-shadow"
              >
                {post.image_url && (
                  <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">{post.category}</span>
                  <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Write a Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Title</Label>
              <Input className="mt-1.5" placeholder="Story title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              {formErrors.title && <p className="text-xs text-destructive mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <Label className="text-foreground">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {writeCategories.map((c) => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-xs text-destructive mt-1">{formErrors.category}</p>}
            </div>
            <div>
              <Label className="text-foreground">Content</Label>
              <Textarea className="mt-1.5 min-h-[120px]" placeholder="Write your story..." value={newContent} onChange={(e) => setNewContent(e.target.value)} />
              {formErrors.content && <p className="text-xs text-destructive mt-1">{formErrors.content}</p>}
            </div>
            <Button onClick={handleCreatePost} disabled={creating} className="w-full" variant="hero">
              {creating ? "Publishing..." : "Publish Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default BuzzPage;
