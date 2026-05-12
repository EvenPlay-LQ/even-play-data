import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Eye, Clock, ChevronDown, ChevronUp, Send, User, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles?: { name: string; avatar?: string | null };
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    image_url?: string | null;
    category: string;
    views: number;
    created_at: string;
    author_id: string;
    profiles?: { name: string; avatar?: string | null };
    like_count?: number;
    comment_count?: number;
  };
  featured?: boolean;
  onViewIncrement?: (id: string) => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  transfers:    "bg-emerald-500/15 text-emerald-400",
  results:      "bg-blue-500/15 text-blue-400",
  analysis:     "bg-violet-500/15 text-violet-400",
  rumours:      "bg-amber-500/15 text-amber-400",
  local:        "bg-rose-500/15 text-rose-400",
  international:"bg-cyan-500/15 text-cyan-400",
  general:      "bg-muted text-muted-foreground",
};

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const PostCard = ({ post, featured = false, onViewIncrement }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]        = useState(post.like_count ?? 0);
  const [likePending, setLikePending]    = useState(false);
  const [showComments, setShowComments]  = useState(false);
  const [comments, setComments]          = useState<Comment[]>([]);
  const [commentCount, setCommentCount]  = useState(post.comment_count ?? 0);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [draft, setDraft]                = useState("");
  const [submitting, setSubmitting]      = useState(false);

  /* ---------- bootstrap like status ---------- */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .then(({ count }) => setLiked((count ?? 0) > 0));
  }, [user, post.id]);

  /* ---------- like toggle ---------- */
  const handleLike = useCallback(async () => {
    if (!user || likePending) return;
    setLikePending(true);
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    setLikePending(false);
  }, [user, liked, likePending, post.id]);

  /* ---------- load comments ---------- */
  const loadComments = useCallback(async () => {
    if (commentsLoaded) return;
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(name, avatar)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments((data as unknown as Comment[]) || []);
    setCommentsLoaded(true);
  }, [commentsLoaded, post.id]);

  const toggleComments = async () => {
    if (!showComments) await loadComments();
    if (!showComments && onViewIncrement) onViewIncrement(post.id);
    setShowComments(v => !v);
  };

  /* ---------- submit comment ---------- */
  const handleSubmitComment = async () => {
    if (!user || !draft.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, author_id: user.id, content: draft.trim() })
      .select("*, profiles(name, avatar)")
      .single();
    if (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } else {
      setComments(prev => [...prev, data as unknown as Comment]);
      setCommentCount(c => c + 1);
      setDraft("");
    }
    setSubmitting(false);
  };

  const catClass = CATEGORY_COLOR[post.category] ?? CATEGORY_COLOR.general;

  /* ============================================================
     FEATURED (hero card)
  ============================================================ */
  if (featured) {
    return (
      <div className="rounded-2xl bg-gradient-hero p-6 shadow-elevated">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${catClass}`}>
          {post.category}
        </span>
        <h2 className="text-xl font-display font-bold text-primary-foreground mt-3 mb-2 line-clamp-2">
          {post.title}
        </h2>
        <p className="text-sm text-primary-foreground/60 line-clamp-3 mb-4">{post.content}</p>

        <div className="flex items-center justify-between text-xs text-primary-foreground/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.views}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(post.created_at)}</span>
            {post.profiles?.name && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{post.profiles.name}</span>}
          </div>

          <div className="flex items-center gap-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={!user || likePending}
              className={`flex items-center gap-1 transition-colors ${liked ? "text-rose-400" : "hover:text-rose-300"}`}
              aria-label="Like post"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-400" : ""}`} />
              <span>{likeCount}</span>
            </button>

            {/* Comment toggle */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-1 hover:text-primary-foreground/70 transition-colors"
              aria-label="Toggle comments"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{commentCount}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        <CommentsSection
          show={showComments}
          comments={comments}
          draft={draft}
          setDraft={setDraft}
          submitting={submitting}
          onSubmit={handleSubmitComment}
          user={user}
          dark
        />
      </div>
    );
  }

  /* ============================================================
     REGULAR CARD
  ============================================================ */
  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
      <div className="flex gap-4 p-4">
        {post.image_url && (
          <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${catClass}`}>
            {post.category}
          </span>
          <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">{post.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
              <span>{timeAgo(post.created_at)}</span>
              {post.profiles?.name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.profiles.name}</span>}
            </div>

            <div className="flex items-center gap-2 text-xs">
              {/* Like button */}
              <button
                onClick={handleLike}
                disabled={!user || likePending}
                className={`flex items-center gap-1 transition-colors ${liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-400"}`}
                aria-label="Like post"
              >
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-500" : ""}`} />
                <span>{likeCount}</span>
              </button>

              {/* Comment toggle */}
              <button
                onClick={toggleComments}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle comments"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentCount}</span>
                {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CommentsSection
        show={showComments}
        comments={comments}
        draft={draft}
        setDraft={setDraft}
        submitting={submitting}
        onSubmit={handleSubmitComment}
        user={user}
      />
    </div>
  );
};

/* ============================================================
   CommentsSection sub-component
============================================================ */
interface CommentsSectionProps {
  show: boolean;
  comments: Comment[];
  draft: string;
  setDraft: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  user: any;
  dark?: boolean;
}

const CommentsSection = ({ show, comments, draft, setDraft, submitting, onSubmit, user, dark }: CommentsSectionProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`overflow-hidden border-t ${dark ? "border-primary/10" : "border-border"}`}
      >
        <div className={`p-4 space-y-3 ${dark ? "bg-navy/30" : "bg-muted/30"}`}>
          {/* Existing comments */}
          {comments.length > 0 ? comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${dark ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {c.profiles?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-semibold ${dark ? "text-primary-foreground/80" : "text-foreground"}`}>
                    {c.profiles?.name ?? "User"}
                  </span>
                  <span className={`text-[10px] ${dark ? "text-primary-foreground/30" : "text-muted-foreground"}`}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${dark ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{c.content}</p>
              </div>
            </div>
          )) : (
            <p className={`text-xs text-center py-2 ${dark ? "text-primary-foreground/30" : "text-muted-foreground"}`}>
              No comments yet — be the first!
            </p>
          )}

          {/* Comment input */}
          {user && (
            <div className="flex gap-2 pt-1">
              <input
                className={`flex-1 text-xs rounded-lg px-3 py-2 border outline-none focus:ring-1 focus:ring-primary ${
                  dark
                    ? "bg-navy/50 border-primary/10 text-primary-foreground/80 placeholder:text-primary-foreground/30"
                    : "bg-background border-border text-foreground placeholder:text-muted-foreground"
                }`}
                placeholder="Write a comment…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
                maxLength={500}
              />
              <button
                onClick={onSubmit}
                disabled={submitting || !draft.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                aria-label="Post comment"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PostCard;
