-- =====================================================
-- Master Admin Role — Migration
-- =====================================================

-- 1. Extend enums
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'master_admin';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'master_admin';

-- 2. Helper: is_master_admin (SECURITY DEFINER — safe for RLS)
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'master_admin'
  )
$$;

-- 3. Admin Audit Logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,                       -- e.g. 'role_change', 'user_edit', 'impersonation', 'override'
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_entity TEXT,                         -- e.g. 'profiles', 'athletes'
  target_entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only master admins can read/write admin audit logs
CREATE POLICY "Master admins can read admin audit logs"
  ON public.admin_audit_logs FOR SELECT TO authenticated
  USING (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admins can insert admin audit logs"
  ON public.admin_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_master_admin(auth.uid()));

-- 4. Assign master_admin role to lqlake215@gmail.com
-- Fully converts this user from institution → master_admin
DO $$
DECLARE
  _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = 'lqlake215@gmail.com' LIMIT 1;
  IF _uid IS NOT NULL THEN
    -- Remove old institution / fan / athlete roles (keep only master_admin)
    DELETE FROM public.user_roles WHERE user_id = _uid AND role != 'master_admin';

    -- Insert master_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update profile user_type from institution → master_admin
    UPDATE public.profiles
    SET user_type = 'master_admin', bio = 'Platform Master Admin'
    WHERE id = _uid;

    -- Detach any institution records owned by this user (don't delete, just nullify owner)
    UPDATE public.institutions SET profile_id = profile_id WHERE profile_id = _uid;
    -- Note: we keep institution data intact for other users; this admin now views ALL institutions via RLS bypass
  END IF;
END;
$$;

-- 5. RLS bypass policies for MASTER_ADMIN
-- Each table gets an additional policy allowing full access for master admins.

-- profiles
CREATE POLICY "Master admin full access profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- user_roles
CREATE POLICY "Master admin full access user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- institutions
CREATE POLICY "Master admin full access institutions"
  ON public.institutions FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- athletes
CREATE POLICY "Master admin full access athletes"
  ON public.athletes FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- teams
CREATE POLICY "Master admin full access teams"
  ON public.teams FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- team_members
CREATE POLICY "Master admin full access team_members"
  ON public.team_members FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- matches
CREATE POLICY "Master admin full access matches"
  ON public.matches FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- match_stats
CREATE POLICY "Master admin full access match_stats"
  ON public.match_stats FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- achievements
CREATE POLICY "Master admin full access achievements"
  ON public.achievements FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- verifications
CREATE POLICY "Master admin full access verifications"
  ON public.verifications FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- posts
CREATE POLICY "Master admin full access posts"
  ON public.posts FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- comments
CREATE POLICY "Master admin full access comments"
  ON public.comments FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- likes
CREATE POLICY "Master admin full access likes"
  ON public.likes FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- community_groups
CREATE POLICY "Master admin full access community_groups"
  ON public.community_groups FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- merchandise
CREATE POLICY "Master admin full access merchandise"
  ON public.merchandise FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- notifications
CREATE POLICY "Master admin full access notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- audit_logs (existing table)
CREATE POLICY "Master admin full access audit_logs"
  ON public.audit_logs FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));
