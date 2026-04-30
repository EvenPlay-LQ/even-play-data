-- Fix Supabase Security Advisor Warnings
-- Changes the security context of views to use the invoker's permissions
-- instead of the creator's (security definer) to ensure RLS is applied.

ALTER VIEW public.v_parent_dashboard SET (security_invoker = true);
ALTER VIEW public.v_athlete_performance_trends SET (security_invoker = true);
ALTER VIEW public.v_institution_engagement SET (security_invoker = true);
ALTER VIEW public.public_athlete_profiles SET (security_invoker = true);
