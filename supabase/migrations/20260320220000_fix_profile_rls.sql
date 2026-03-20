-- Migration to add INSERT policies for profiles and user_roles
-- This ensures that the Signup Wizard can successfully upsert data during the setup process.

-- 1. Profiles: Allow owners to insert their own profile
-- (Though the trigger handled it, upsert requires INSERT permission)
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 2. User Roles: Allow owners to insert their own role
-- (Though the trigger handled it, upsert requires INSERT permission)
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
