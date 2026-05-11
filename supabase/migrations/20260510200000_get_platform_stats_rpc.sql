-- ===========================================================================
-- Migration: get_platform_stats RPC
-- ===========================================================================
-- Problem: The admin dashboard fetches counts via the Supabase JS client,
-- which goes through PostgREST and is subject to RLS. The master-admin bypass
-- policies use is_master_admin() in an USING clause, but in some token/cache
-- scenarios this evaluates to false, causing the client to only see rows the
-- admin personally owns (1 athlete, 0 institutions).
--
-- Fix: Expose a SECURITY DEFINER RPC that runs as the owning role and
-- bypasses RLS entirely. The function still guards against non-admin callers.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_result    jsonb;
BEGIN
  -- Identify the calling user
  v_caller_id := auth.uid();

  -- Only master admins may call this function
  IF NOT public.is_master_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized: master_admin role required';
  END IF;

  SELECT jsonb_build_object(
    'totalUsers',        (SELECT COUNT(*) FROM public.profiles),
    'totalAthletes',     (SELECT COUNT(*) FROM public.athletes),
    'totalInstitutions', (SELECT COUNT(*) FROM public.institutions),
    'totalPosts',        (SELECT COUNT(*) FROM public.posts),
    'totalMatches',      (SELECT COUNT(*) FROM public.matches)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Restrict public execution; only authenticated users (gated by the internal
-- is_master_admin check above) and service_role may call this.
REVOKE EXECUTE ON FUNCTION public.get_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated, service_role;
