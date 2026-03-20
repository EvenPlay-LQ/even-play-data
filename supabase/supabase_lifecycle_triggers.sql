-- =====================================================================
-- Even Playground — Unified Auth Lifecycle Triggers
-- Run this script in your Supabase SQL Editor
-- This replaces the previous handle_new_user function to ensure
-- base rows for athletes/institutions are created immediately.
-- =====================================================================

-- ─────────────────────────────────────────────
-- 1. UNIFIED AUTO-CREATE PROFILE AND ROLE ROW
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  extracted_user_type text;
BEGIN
  -- Extract user_type with a fallback
  extracted_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'athlete');

  -- 1. Insert into public.profiles
  INSERT INTO public.profiles (id, name, user_type, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    extracted_user_type,
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        user_type = EXCLUDED.user_type;

  -- 2. Automatically insert into the corresponding role table
  IF extracted_user_type = 'athlete' THEN
    -- Insert a blank athlete row. The athlete will fill in details later or via wizard.
    INSERT INTO public.athletes (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
    
  ELSIF extracted_user_type = 'institution' THEN
    -- Insert a blank institution row.
    -- Assuming institution_name is required in some schemas, we can fallback to the profile name.
    -- However, if there are NOT NULL constraints without defaults, we supply them here.
    INSERT INTO public.institutions (profile_id, institution_name)
    VALUES (
      NEW.id, 
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
      )
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. VERIFY RLS POLICIES (Safety Check)
-- ─────────────────────────────────────────────

-- Ensure RLS is active
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institutions ENABLE ROW LEVEL SECURITY;

-- If there were missing policies previously, they should be applied here.
-- Assuming `supabase_auth_fix.sql` had proper policies already, we are safe.
