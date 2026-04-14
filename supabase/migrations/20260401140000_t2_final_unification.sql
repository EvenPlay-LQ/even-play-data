-- =====================================================
-- Migration: T2 Final Unification and Cleanup (REVISED)
-- =====================================================

-- 1. Ensure 'fan' role is present in enums (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fan';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'fan';

-- 2. HARD ALIGNMENT: Resolve Parent Table Set A/B Conflict
-- Dropping legacy 'Set A' tables if they exist to prevent schema mismatch
DROP TABLE IF EXISTS public.parent_athlete_links CASCADE;
-- If public.parents exists but uses user_id (Old Set A), we must drop it to allow Set B to align.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parents' AND column_name = 'user_id') THEN
    DROP TABLE public.parents CASCADE;
  END IF;
END $$;

-- 3. Standardize unified Parents table (Set B Convention)
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_phone TEXT,
  relationship_to_child TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

-- 4. Standardize Parent-Athlete junction table
CREATE TABLE IF NOT EXISTS public.parent_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent','guardian','sibling')),
  verified BOOLEAN NOT NULL DEFAULT false,
  linked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, athlete_id)
);

-- 5. Athlete Invites table (Phase 2 Claim Flow)
CREATE TABLE IF NOT EXISTS public.athlete_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_by_role TEXT NOT NULL CHECK (invited_by_role IN ('institution','parent')),
  email_sent_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','used','expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON public.athlete_invites(token);

-- 6. Public Profiles View
CREATE OR REPLACE VIEW public.public_athlete_profiles AS
SELECT
  a.id,
  a.full_name,
  a.sport,
  a.position,
  a.status,
  p.avatar,
  p.bio
FROM public.athletes a
LEFT JOIN public.profiles p ON p.id = a.profile_id
WHERE a.status = 'claimed';

GRANT SELECT ON public.public_athlete_profiles TO authenticated, anon;

-- 7. RLS for new/updated tables
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_invites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Parents can manage own record" ON public.parents FOR ALL USING (profile_id = auth.uid());
  CREATE POLICY "invite_creator_access" ON public.athlete_invites FOR ALL USING (invited_by = auth.uid());
  CREATE POLICY "parent_reads_own_children" ON public.athletes 
    FOR SELECT USING (
      id IN (
        SELECT athlete_id FROM public.parent_athletes pa
        JOIN public.parents p ON pa.parent_id = p.id
        WHERE p.profile_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Final Constraint Relaxation for Athletes (The core T2 requirement)
ALTER TABLE public.athletes ALTER COLUMN profile_id DROP NOT NULL;
