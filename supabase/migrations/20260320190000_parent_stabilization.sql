-- =====================================================
-- Parent Role Stabilization — Migration
-- =====================================================

-- 1. Create Parents table (if child linking or parent-specific info is needed)
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_phone TEXT,
  relationship_to_child TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

-- 2. Create Parent-Athlete junction table (for linking)
CREATE TABLE IF NOT EXISTS public.parent_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, athlete_id)
);

-- 3. Enable RLS
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_athletes ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Parents can manage their own record
CREATE POLICY "Parents can view own record" 
  ON public.parents FOR SELECT TO authenticated 
  USING (profile_id = auth.uid());

CREATE POLICY "Parents can update own record" 
  ON public.parents FOR UPDATE TO authenticated 
  USING (profile_id = auth.uid()) 
  WITH CHECK (profile_id = auth.uid());

-- Parent-Athlete links
CREATE POLICY "Parents can view their links" 
  ON public.parent_athletes FOR SELECT TO authenticated 
  USING (parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()));

CREATE POLICY "Parents can create their links" 
  ON public.parent_athletes FOR INSERT TO authenticated 
  WITH CHECK (parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()));

-- Master Admin bypass for stabilization
CREATE POLICY "Master admin full access parents"
  ON public.parents FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

CREATE POLICY "Master admin full access parent_athletes"
  ON public.parent_athletes FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- 5. Update updated_at trigger
CREATE TRIGGER parents_updated_at BEFORE UPDATE ON public.parents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
