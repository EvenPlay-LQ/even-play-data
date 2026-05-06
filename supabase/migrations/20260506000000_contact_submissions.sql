-- Migration: contact_submissions
-- Single table backing the public-facing forms on /contact, /sponsors, /careers.
-- Anyone can INSERT (forms are public). Only master_admin can read/update/delete.

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN ('contact', 'sponsor', 'careers')),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  subject TEXT CHECK (subject IS NULL OR char_length(subject) <= 300),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 200),
  sponsor_type TEXT CHECK (sponsor_type IS NULL OR char_length(sponsor_type) <= 100),
  budget_range TEXT CHECK (budget_range IS NULL OR char_length(budget_range) <= 100),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'replied', 'archived', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx
  ON public.contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_type_status_idx
  ON public.contact_submissions (submission_type, status);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public INSERT: anonymous and authenticated visitors can submit forms.
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- If a logged-in user is submitting, they may attach their user_id; otherwise it must be null.
  user_id IS NULL OR user_id = (select auth.uid())
);

-- Master admin can read all submissions.
DROP POLICY IF EXISTS "Master admin can read submissions" ON public.contact_submissions;
CREATE POLICY "Master admin can read submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.is_master_admin((select auth.uid())));

-- Master admin can update submissions (status changes, review notes).
DROP POLICY IF EXISTS "Master admin can update submissions" ON public.contact_submissions;
CREATE POLICY "Master admin can update submissions"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (public.is_master_admin((select auth.uid())))
WITH CHECK (public.is_master_admin((select auth.uid())));

-- Master admin can delete (e.g. spam).
DROP POLICY IF EXISTS "Master admin can delete submissions" ON public.contact_submissions;
CREATE POLICY "Master admin can delete submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (public.is_master_admin((select auth.uid())));

COMMENT ON TABLE public.contact_submissions IS
  'Public form submissions from /contact, /sponsors, /careers. Inserts are unauthenticated; reads gated to master_admin.';
