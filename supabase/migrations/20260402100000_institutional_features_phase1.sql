-- =====================================================
-- Migration: Institutional Features Phase 1
-- Description: Attendance tracking, announcements, and duplicate prevention
-- Date: 2026-04-02
-- =====================================================

-- 1. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('training', 'match', 'meeting', 'assessment', 'other')),
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_minutes INTEGER,
  location TEXT,
  coach_notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  arrival_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, athlete_id)
);

-- 3. Institution Announcements Table
CREATE TABLE IF NOT EXISTS public.institution_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Announcement Read Receipts Table
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  announcement_id UUID NOT NULL REFERENCES public.institution_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_athlete ON public.attendance_records(athlete_id);
CREATE INDEX IF NOT EXISTS idx_attendance_institution ON public.attendance_sessions(institution_id);
CREATE INDEX IF NOT EXISTS idx_announcements_institution ON public.institution_announcements(institution_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON public.announcement_reads(user_id);

-- 6. Duplicate Email Prevention - Partial Unique Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_athletes_unique_email_institution 
ON public.athletes(institution_id, contact_email) 
WHERE contact_email IS NOT NULL;

-- 7. Enable Row Level Security
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Attendance Sessions
DROP POLICY IF EXISTS "Institution members can view sessions" ON public.attendance_sessions;
CREATE POLICY "Institution members can view sessions"
  ON public.attendance_sessions FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.institution_id = attendance_sessions.institution_id
        AND a.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage sessions" ON public.attendance_sessions;
CREATE POLICY "Institution admins can manage sessions"
  ON public.attendance_sessions FOR ALL
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  );

-- 9. RLS Policies for Attendance Records
DROP POLICY IF EXISTS "Institution members can view attendance records" ON public.attendance_records;
CREATE POLICY "Institution members can view attendance records"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (
    athlete_id IN (
      SELECT id FROM public.athletes WHERE profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.attendance_sessions ast
      JOIN public.institutions i ON i.id = ast.institution_id
      WHERE ast.id = attendance_records.session_id
        AND i.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage attendance records" ON public.attendance_records;
CREATE POLICY "Institution admins can manage attendance records"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions ast
      JOIN public.institutions i ON i.id = ast.institution_id
      WHERE ast.id = attendance_records.session_id
        AND i.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions ast
      JOIN public.institutions i ON i.id = ast.institution_id
      WHERE ast.id = attendance_records.session_id
        AND i.profile_id = auth.uid()
    )
  );

-- 10. RLS Policies for Announcements
DROP POLICY IF EXISTS "Institution members can view announcements" ON public.institution_announcements;
CREATE POLICY "Institution members can view announcements"
  ON public.institution_announcements FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.institution_id = institution_announcements.institution_id
        AND a.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parents p
      JOIN public.parent_athletes pa ON pa.parent_id = p.id
      JOIN public.athletes a ON a.id = pa.athlete_id
      JOIN public.institutions i ON i.id = a.institution_id
      WHERE p.profile_id = auth.uid()
        AND i.id = institution_announcements.institution_id
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage announcements" ON public.institution_announcements;
CREATE POLICY "Institution admins can manage announcements"
  ON public.institution_announcements FOR ALL
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  );

-- 11. RLS Policies for Announcement Reads
DROP POLICY IF EXISTS "Users can view own read receipts" ON public.announcement_reads;
CREATE POLICY "Users can view own read receipts"
  ON public.announcement_reads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own read receipts" ON public.announcement_reads;
CREATE POLICY "Users can insert own read receipts"
  ON public.announcement_reads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 12. Helper Function: Mark Announcement as Read
CREATE OR REPLACE FUNCTION public.mark_announcement_read(announcement_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.announcement_reads (announcement_id, user_id)
  VALUES (announcement_id, auth.uid())
  ON CONFLICT (announcement_id, user_id) DO NOTHING;
  
  -- Update read count
  UPDATE public.institution_announcements
  SET read_count = read_count + 1
  WHERE id = announcement_id
    AND NOT EXISTS (
      SELECT 1 FROM public.announcement_reads
      WHERE announcement_id = mark_announcement_read.announcement_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Trigger: Auto-expire old announcements (optional maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_announcements()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.institution_announcements
  WHERE expires_at IS NOT NULL
    AND expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to run daily (requires pg_cron extension)
-- Note: This is commented out as it requires superuser privileges
-- SELECT cron.schedule('cleanup-announcements', '0 2 * * *', 'SELECT cleanup_expired_announcements()');

-- 14. Grant Permissions
GRANT SELECT ON public.attendance_sessions TO authenticated;
GRANT SELECT ON public.attendance_records TO authenticated;
GRANT SELECT ON public.institution_announcements TO authenticated;
GRANT SELECT ON public.announcement_reads TO authenticated;

-- 15. Add cascade delete for parent_athletes when athletes are deleted
-- (Already exists from T2 migration, but ensuring consistency)
ALTER TABLE public.parent_athletes
  DROP CONSTRAINT IF EXISTS parent_athletes_athlete_id_fkey,
  ADD CONSTRAINT parent_athletes_athlete_id_fkey
    FOREIGN KEY (athlete_id)
    REFERENCES public.athletes(id)
    ON DELETE CASCADE;

-- 16. Comment tables for documentation
COMMENT ON TABLE public.attendance_sessions IS 'Tracks training sessions, matches, meetings, and assessments for institutional attendance monitoring';
COMMENT ON TABLE public.attendance_records IS 'Individual athlete attendance records linked to sessions with status tracking';
COMMENT ON TABLE public.institution_announcements IS 'Communication hub for institutions to broadcast messages to athletes, parents, and staff';
COMMENT ON TABLE public.announcement_reads IS 'Read receipt tracking for announcement engagement metrics';
