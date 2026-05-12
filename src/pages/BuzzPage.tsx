import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Plus, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";
import PostCard from "@/components/PostCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BUZZ_CATEGORIES } from "@/config/constants";
import { postSchema } from "@/lib/validations";
import { handleQueryError } from "@/lib/queryHelpers";
import RssFeedWidget from "@/components/RssFeedWidget";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  category: string;
  views: number;
  created_at: string;
  author_id: string;
  profiles?: { name: string; avatar?: string | null };
  like_count: number;
  comment_count: number;
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
  const channelRef = useRef<any>(null);

  /* ---------- fetch posts with aggregates ---------- */
  const fetchPosts = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("posts")
      .select(`
        *,
        profiles(name, avatar),
        like_count:likes(count),
        comment_count:comments(count)
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      query = query.ilike("title", `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      handleQueryError(error, "Failed to load stories.");
    } else {
      // Supabase returns { count } objects for aggregated columns
      const normalised: Post[] = (data || []).map((p: any) => ({
        ...p,
        like_count:    Array.isArray(p.like_count)    ? (p.like_count[0]?.count ?? 0)    : (p.like_count ?? 0),
        comment_count: Array.isArray(p.comment_count) ? (p.comment_count[0]?.count ?? 0) : (p.comment_count ?? 0),
      }));
      setPosts(normalised);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery]);

  /* ---------- realtime — new posts ---------- */
  useEffect(() => {
    channelRef.current = (supabase as any)
      .channel("buzz-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => {
          // Refetch to get aggregates for new posts
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- increment view count ---------- */
  const handleViewIncrement = async (postId: string) => {
    await (supabase as any).rpc("increment_post_views", { pid: postId });
    // Optimistic local update
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p)
    );
  };

  /* ---------- create post ---------- */
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
      toast({ title: "Story published! 🎉" });
      setNewTitle(""); setNewContent(""); setNewCategory("");
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
      <div className="space-y-6 max-w-4xl pb-20">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
              <Zap className="h-6 w-6 text-gold" /> Buzz
            </h1>
            <p className="text-sm text-muted-foreground">Sports news, transfers &amp; stories</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Write Story
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {BUZZ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-52 rounded-2xl" />
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <PostCard post={featured} featured onViewIncrement={handleViewIncrement} />
              </motion.div>
            )}
            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <PostCard post={post} onViewIncrement={handleViewIncrement} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RSS Live Feed Widget */}
      <RssFeedWidget />

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
              <Textarea className="mt-1.5 min-h-[140px]" placeholder="Write your story..." value={newContent} onChange={(e) => setNewContent(e.target.value)} />
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
