-- Phase 7: Community & Buzz Feed Enhancements
-- Adds increment_post_views RPC and a likes_count cache column on posts

-- 1. Add denormalised like_count to posts for fast reads (optional perf optimisation)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

-- 2. Backfill existing like counts
UPDATE public.posts p
SET like_count = (SELECT COUNT(*) FROM public.likes l WHERE l.post_id = p.id);

-- 3. Trigger function to keep like_count in sync
CREATE OR REPLACE FUNCTION public.sync_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_like_count ON public.likes;
CREATE TRIGGER trg_sync_post_like_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_like_count();

-- 4. RPC: increment_post_views — atomic, avoids read-modify-write races
CREATE OR REPLACE FUNCTION public.increment_post_views(pid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.posts SET views = views + 1 WHERE id = pid;
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_views(uuid) TO authenticated;

-- 5. Grant execute on sync function (trigger only — not an RPC)
REVOKE EXECUTE ON FUNCTION public.sync_post_like_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_post_like_count() FROM anon;
