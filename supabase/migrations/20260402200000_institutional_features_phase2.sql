-- =====================================================
-- Migration: Institutional Features Phase 2
-- Description: Enhanced team management, fixtures, and compliance
-- Date: 2026-04-02
-- =====================================================

-- 1. Enhanced Teams Schema (add columns to existing teams table)
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS age_group TEXT,
ADD COLUMN IF NOT EXISTS skill_level TEXT,
ADD COLUMN IF NOT EXISTS season TEXT,
ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assistant_coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_logo_url TEXT,
ADD COLUMN IF NOT EXISTS home_venue TEXT,
ADD COLUMN IF NOT EXISTS practice_schedule JSONB,
ADD COLUMN IF NOT EXISTS team_colors TEXT[] DEFAULT '{}';

-- Add check constraints for standardized values
ALTER TABLE public.teams
ADD CONSTRAINT chk_age_group CHECK (age_group IN ('U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'Senior', 'Open', 'Masters') OR age_group IS NULL),
ADD CONSTRAINT chk_skill_level CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'elite', 'academy', 'development') OR skill_level IS NULL),
ADD CONSTRAINT chk_season CHECK (season IN ('fall', 'winter', 'spring', 'summer', 'year-round') OR season IS NULL);

-- 2. Team Squads Management Table
CREATE TABLE IF NOT EXISTS public.team_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  squad_role TEXT DEFAULT 'player' CHECK (squad_role IN ('captain', 'vice_captain', 'player', 'goalkeeper')),
  jersey_number INTEGER,
  joined_date DATE DEFAULT CURRENT_DATE,
  departure_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'injured', 'suspended', 'transferred', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, athlete_id)
);

-- 3. Competitions Table
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  competition_name TEXT NOT NULL,
  competition_type TEXT DEFAULT 'league' CHECK (competition_type IN ('league', 'cup', 'tournament', 'friendly', 'playoff')),
  sport TEXT NOT NULL,
  season TEXT,
  start_date DATE,
  end_date DATE,
  organizer TEXT,
  logo_url TEXT,
  rules_url TEXT,
  standings JSONB, -- Cached standings data
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Match Fixtures Table (enhanced from basic matches)
CREATE TABLE IF NOT EXISTS public.match_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  venue_name TEXT,
  venue_address TEXT,
  kickoff_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'postponed', 'cancelled', 'abandoned')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  half_time_home_score INTEGER,
  half_time_away_score INTEGER,
  attendance_count INTEGER,
  referee_name TEXT,
  weather_conditions TEXT,
  pitch_condition TEXT,
  live_updates JSONB, -- Real-time match events
  broadcast_url TEXT,
  highlights_url TEXT,
  match_report TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Match Events Table (goals, cards, substitutions)
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_fixtures(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'own_goal', 'assist', 'yellow_card', 'second_yellow', 'red_card', 'substitution_on', 'substitution_off', 'penalty_saved', 'penalty_missed', 'injury')),
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
  extra_minute INTEGER CHECK (extra_minute >= 0 AND extra_minute <= 15),
  description TEXT,
  metadata JSONB, -- Additional event details
  video_clip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Athlete Documents Table (Compliance)
CREATE TABLE IF NOT EXISTS public.athlete_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('medical_form', 'parental_consent', 'insurance', 'transfer_certificate', 'birth_certificate', 'photo_release', 'code_of_conduct', 'emergency_contact', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  upload_date TIMESTAMPTZ DEFAULT now(),
  expiry_date DATE,
  issued_by TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'expired', 'rejected')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Incident Reports Table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE SET NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('injury', 'disciplinary', 'safeguarding', 'equipment_failure', 'venue_issue', 'conduct_breach', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  description TEXT NOT NULL,
  witnesses TEXT[],
  actions_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed', 'escalated')),
  resolution_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_teams_age_group ON public.teams(age_group);
CREATE INDEX IF NOT EXISTS idx_teams_skill_level ON public.teams(skill_level);
CREATE INDEX IF NOT EXISTS idx_team_squads_team ON public.team_squads(team_id);
CREATE INDEX IF NOT EXISTS idx_team_squads_athlete ON public.team_squads(athlete_id);
CREATE INDEX IF NOT EXISTS idx_competitions_institution ON public.competitions(institution_id);
CREATE INDEX IF NOT EXISTS idx_match_fixtures_competition ON public.match_fixtures(competition_id);
CREATE INDEX IF NOT EXISTS idx_match_fixtures_teams ON public.match_fixtures(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_fixtures_kickoff ON public.match_fixtures(kickoff_time);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_athlete ON public.match_events(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_documents_athlete ON public.athlete_documents(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_documents_expiry ON public.athlete_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_incident_reports_institution ON public.incident_reports(institution_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_date ON public.incident_reports(incident_date);

-- 9. Enable Row Level Security
ALTER TABLE public.team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for Team Squads
DROP POLICY IF EXISTS "Institution members can view team squads" ON public.team_squads;
CREATE POLICY "Institution members can view team squads"
  ON public.team_squads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE t.id = team_squads.team_id
        AND i.profile_id = auth.uid()
    )
    OR
    athlete_id IN (
      SELECT id FROM public.athletes WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage team squads" ON public.team_squads;
CREATE POLICY "Institution admins can manage team squads"
  ON public.team_squads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE t.id = team_squads.team_id
        AND i.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE t.id = team_squads.team_id
        AND i.profile_id = auth.uid()
    )
  );

-- 11. RLS Policies for Competitions
DROP POLICY IF EXISTS "Institution members can view competitions" ON public.competitions;
CREATE POLICY "Institution members can view competitions"
  ON public.competitions FOR SELECT
  TO authenticated
  USING (
    institution_id IS NULL
    OR
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage competitions" ON public.competitions;
CREATE POLICY "Institution admins can manage competitions"
  ON public.competitions FOR ALL
  TO authenticated
  USING (
    institution_id IS NULL
    OR
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    institution_id IS NULL
    OR
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
  );

-- 12. RLS Policies for Match Fixtures
DROP POLICY IF EXISTS "Users can view match fixtures" ON public.match_fixtures;
CREATE POLICY "Users can view match fixtures"
  ON public.match_fixtures FOR SELECT
  TO authenticated
  USING (true); -- Public visibility for fixtures

DROP POLICY IF EXISTS "Institution admins can manage match fixtures" ON public.match_fixtures;
CREATE POLICY "Institution admins can manage match fixtures"
  ON public.match_fixtures FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE (t.id = match_fixtures.home_team_id OR t.id = match_fixtures.away_team_id)
        AND i.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE (t.id = match_fixtures.home_team_id OR t.id = match_fixtures.away_team_id)
        AND i.profile_id = auth.uid()
    )
  );

-- 13. RLS Policies for Match Events
DROP POLICY IF EXISTS "Users can view match events" ON public.match_events;
CREATE POLICY "Users can view match events"
  ON public.match_events FOR SELECT
  TO authenticated
  USING (true); -- Public visibility

DROP POLICY IF EXISTS "Institution admins can manage match events" ON public.match_events;
CREATE POLICY "Institution admins can manage match events"
  ON public.match_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.match_fixtures mf
      JOIN public.teams t ON (t.id = mf.home_team_id OR t.id = mf.away_team_id)
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE mf.id = match_events.match_id
        AND i.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.match_fixtures mf
      JOIN public.teams t ON (t.id = mf.home_team_id OR t.id = mf.away_team_id)
      JOIN public.institutions i ON i.id = t.institution_id
      WHERE mf.id = match_events.match_id
        AND i.profile_id = auth.uid()
    )
  );

-- 14. RLS Policies for Athlete Documents
DROP POLICY IF EXISTS "Authorized users can view athlete documents" ON public.athlete_documents;
CREATE POLICY "Authorized users can view athlete documents"
  ON public.athlete_documents FOR SELECT
  TO authenticated
  USING (
    athlete_id IN (
      SELECT id FROM public.athletes WHERE profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.athletes a
      JOIN public.institutions i ON i.id = a.institution_id
      WHERE a.id = athlete_documents.athlete_id
        AND i.profile_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.parents p
      JOIN public.parent_athletes pa ON pa.parent_id = p.id
      WHERE pa.athlete_id = athlete_documents.athlete_id
        AND p.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Institution admins can manage athlete documents" ON public.athlete_documents;
CREATE POLICY "Institution admins can manage athlete documents"
  ON public.athlete_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      JOIN public.institutions i ON i.id = a.institution_id
      WHERE a.id = athlete_documents.athlete_id
        AND i.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athletes a
      JOIN public.institutions i ON i.id = a.institution_id
      WHERE a.id = athlete_documents.athlete_id
        AND i.profile_id = auth.uid()
    )
  );

-- 15. RLS Policies for Incident Reports
DROP POLICY IF EXISTS "Authorized users can view incident reports" ON public.incident_reports;
CREATE POLICY "Authorized users can view incident reports"
  ON public.incident_reports FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE profile_id = auth.uid()
    )
    OR
    athlete_id IN (
      SELECT id FROM public.athletes WHERE profile_id = auth.uid()
    )
    OR
    reported_by = auth.uid()
    OR
    assigned_to = auth.uid()
  );

DROP POLICY IF EXISTS "Institution admins can manage incident reports" ON public.incident_reports;
CREATE POLICY "Institution admins can manage incident reports"
  ON public.incident_reports FOR ALL
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

-- 16. Helper Functions

-- Function to get team roster with athlete details
CREATE OR REPLACE FUNCTION public.get_team_roster(team_id_param UUID)
RETURNS TABLE (
  athlete_id UUID,
  full_name TEXT,
  sport TEXT,
  position TEXT,
  squad_role TEXT,
  jersey_number INTEGER,
  status TEXT,
  joined_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.full_name,
    a.sport,
    a.position,
    ts.squad_role,
    ts.jersey_number,
    ts.status,
    ts.joined_date
  FROM public.team_squads ts
  JOIN public.athletes a ON a.id = ts.athlete_id
  WHERE ts.team_id = team_id_param
    AND (ts.departure_date IS NULL OR ts.departure_date > CURRENT_DATE)
  ORDER BY 
    CASE ts.squad_role
      WHEN 'captain' THEN 1
      WHEN 'vice_captain' THEN 2
      WHEN 'goalkeeper' THEN 3
      ELSE 4
    END,
    ts.jersey_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate match statistics
CREATE OR REPLACE FUNCTION public.calculate_match_stats(match_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'home_goals', COALESCE(SUM(CASE WHEN me.event_type = 'goal' AND t.id = mf.home_team_id THEN 1 ELSE 0 END), 0),
    'away_goals', COALESCE(SUM(CASE WHEN me.event_type = 'goal' AND t.id = mf.away_team_id THEN 1 ELSE 0 END), 0),
    'home_yellow_cards', COALESCE(SUM(CASE WHEN me.event_type IN ('yellow_card', 'second_yellow') AND t.id = mf.home_team_id THEN 1 ELSE 0 END), 0),
    'away_yellow_cards', COALESCE(SUM(CASE WHEN me.event_type IN ('yellow_card', 'second_yellow') AND t.id = mf.away_team_id THEN 1 ELSE 0 END), 0),
    'home_red_cards', COALESCE(SUM(CASE WHEN me.event_type = 'red_card' AND t.id = mf.home_team_id THEN 1 ELSE 0 END), 0),
    'away_red_cards', COALESCE(SUM(CASE WHEN me.event_type = 'red_card' AND t.id = mf.away_team_id THEN 1 ELSE 0 END), 0),
    'total_events', COUNT(*)
  )
  INTO result
  FROM public.match_events me
  JOIN public.match_fixtures mf ON mf.id = me.match_id
  LEFT JOIN public.teams t ON t.id = me.team_id
  WHERE me.match_id = match_id_param;
  
  RETURN COALESCE(result, jsonb_build_object());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Grant Permissions
GRANT SELECT ON public.team_squads TO authenticated;
GRANT SELECT ON public.competitions TO authenticated;
GRANT SELECT ON public.match_fixtures TO authenticated;
GRANT SELECT ON public.match_events TO authenticated;
GRANT SELECT ON public.athlete_documents TO authenticated;
GRANT SELECT ON public.incident_reports TO authenticated;

-- 18. Comments for Documentation
COMMENT ON TABLE public.team_squads IS 'Manages athlete membership in teams with role assignments and status tracking';
COMMENT ON TABLE public.competitions IS 'Stores league, cup, and tournament information for institutional teams';
COMMENT ON TABLE public.match_fixtures IS 'Scheduled and completed matches between teams with score tracking';
COMMENT ON TABLE public.match_events IS 'Detailed match events including goals, cards, and substitutions with minute tracking';
COMMENT ON TABLE public.athlete_documents IS 'Compliance document storage with expiry tracking and verification workflow';
COMMENT ON TABLE public.incident_reports IS 'Incident reporting system for injuries, disciplinary issues, and safeguarding concerns';
