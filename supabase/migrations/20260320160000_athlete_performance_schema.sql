-- 0. Extend athletes table with missing core fields
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS sport text;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS country text;

-- 1. athlete_matches table
CREATE TABLE IF NOT EXISTS athlete_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    opponent text NOT NULL,
    match_date date NOT NULL,
    result text CHECK (result IN ('win', 'loss', 'draw')),
    score text,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    minutes_played integer DEFAULT 90,
    rating numeric(3,1) DEFAULT 5.0,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 2. performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    speed integer DEFAULT 70,
    endurance integer DEFAULT 70,
    strength integer DEFAULT 70,
    reaction_time numeric(4,3) DEFAULT 0.350,
    agility integer DEFAULT 70,
    training_hours_per_week numeric(4,1) DEFAULT 10.0,
    recorded_at date DEFAULT current_date,
    created_at timestamptz DEFAULT now()
);

-- 3. achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'Trophy',
    date_earned date DEFAULT current_date,
    created_at timestamptz DEFAULT now()
);

-- 4. media_gallery table
CREATE TABLE IF NOT EXISTS media_gallery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    media_type text CHECK (media_type IN ('image', 'video')),
    file_url text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 5. club_history table
CREATE TABLE IF NOT EXISTS club_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    club_name text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 6. coach_feedback table
CREATE TABLE IF NOT EXISTS coach_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
    feedback_text text NOT NULL,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    created_at timestamptz DEFAULT now()
);

-- 7. performance_tests table
CREATE TABLE IF NOT EXISTS performance_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    test_name text NOT NULL,
    test_value numeric NOT NULL,
    test_unit text,
    test_date date DEFAULT current_date,
    created_at timestamptz DEFAULT now()
);

-- 8. match_stats table (detailed stats)
CREATE TABLE IF NOT EXISTS match_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    match_id uuid REFERENCES athlete_matches(id) ON DELETE CASCADE,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    yellow_cards integer DEFAULT 0,
    red_cards integer DEFAULT 0,
    minutes_played integer DEFAULT 90,
    custom_stats jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE athlete_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies based on athlete ownership
-- Note: We assume the athlete is the one inserting their own data for now.
-- For coach_feedback, institutions would insert, but athletes would view.

CREATE POLICY "Athletes can manage their own matches" ON athlete_matches
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own performance_metrics" ON performance_metrics
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own achievements" ON achievements
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own media" ON media_gallery
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own club_history" ON club_history
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can view their feedback" ON coach_feedback
    FOR SELECT USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own performance_tests" ON performance_tests
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

CREATE POLICY "Athletes can manage their own match_stats" ON match_stats
    FOR ALL USING (athlete_id IN (SELECT id FROM athletes WHERE profile_id = auth.uid()));

-- Storage Bucket Policy for athlete_media
-- (This should be run in Supabase SQL Editor if possible, but documented here)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('athlete_media', 'athlete_media', true);
