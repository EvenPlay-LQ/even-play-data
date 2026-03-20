-- =====================================================
-- Institution Athlete Creation Stabilization
-- Allows Institutions to create athlete profiles manually
-- =====================================================

-- 1. Relax the Foreign Key constraint on profiles.id 
-- This allows "shadow" profiles that don't yet have a corresponding auth.users entry.
-- We do this by dropping the constraint and replacing it with a weak one or none for now.
-- In a real production app, we might use a separate table, but for demo stabilization:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Add INSERT Policy for profiles
-- Allow Institutions to create profiles specifically of type 'athlete'
CREATE POLICY "Institutions can create athlete profiles" 
  ON public.profiles FOR INSERT TO authenticated 
  WITH CHECK (
    (user_type = 'athlete') AND 
    (public.has_role(auth.uid(), 'institution'))
  );

-- 3. Add INSERT Policy for athletes
-- Allow Institutions to create athletes for their own institution
CREATE POLICY "Institutions can create athlete records" 
  ON public.athletes FOR INSERT TO authenticated 
  WITH CHECK (
    institution_id IN (SELECT id FROM public.institutions WHERE profile_id = auth.uid())
  );

-- 4. Master Admin bypass for profile/athlete creation
DROP POLICY IF EXISTS "Master admin full access profiles" ON public.profiles;
CREATE POLICY "Master admin full access profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_master_admin(auth.uid()))
  WITH CHECK (public.is_master_admin(auth.uid()));

-- 5. Ensure profile_id in athletes doesn't strictly require the profile to exist in auth.users
-- (Already handled by relaxing the profiles_id_fkey)

-- 6. Add policy for user_roles (Allow institutions to assign 'athlete' role to profiles they create)
-- This is needed because handle_new_user trigger only runs on auth signups
CREATE POLICY "Institutions can assign athlete roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    (role = 'athlete') AND 
    (public.has_role(auth.uid(), 'institution'))
  );
