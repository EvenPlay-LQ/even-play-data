-- =====================================================
-- Migration: Athlete Status and Dedup
-- =====================================================

-- 1. Create the athlete_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.athlete_status AS ENUM ('stub', 'invited', 'claimed', 'merged');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Add columns to athletes (using IF NOT EXISTS to be idempotent)
ALTER TABLE public.athletes
  ADD COLUMN IF NOT EXISTS status public.athlete_status NOT NULL DEFAULT 'stub',
  ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS possible_duplicate BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  -- Note: Adding full_name so that the dedup index does not crash (athletes previously only inherited name via foreign key to profiles). Stubs need standalone names.
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. Backfill existing data safely
-- FIX: The query has been corrected to use `athletes.profile_id` and `profiles.user_type` based on our previous schema inspection.
UPDATE public.athletes
SET status = 'claimed',
    claimed_by = profile_id
WHERE profile_id IN (
  SELECT p.id FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.user_type = 'athlete'
);

-- Backfill the new full_name column from existing profiles for continuity
UPDATE public.athletes
SET full_name = (SELECT name FROM public.profiles WHERE id = public.athletes.profile_id)
WHERE profile_id IS NOT NULL AND status = 'claimed';

-- 4. Add a composite index to power the dedup lookup
CREATE INDEX IF NOT EXISTS idx_athletes_dedup
ON public.athletes (lower(full_name), date_of_birth, sport);

-- 5. Add a unique partial index on claimed_by to prevent double-claiming
CREATE UNIQUE INDEX IF NOT EXISTS idx_athletes_claimed_by
ON public.athletes (claimed_by) WHERE claimed_by IS NOT NULL;
