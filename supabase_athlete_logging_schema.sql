-- Additional tables for enhanced athlete self-logging
-- Run in Supabase SQL Editor

-- Athlete-owned match log (separate from institution-created matches)
CREATE TABLE IF NOT EXISTS public.athlete_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    opponent TEXT NOT NULL,
    match_date DATE NOT NULL,
    result TEXT CHECK (result IN ('win', 'loss', 'draw')) NOT NULL,
    score TEXT,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 90,
    rating NUMERIC(3,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance metrics snapshots (athlete can log their own)
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    speed NUMERIC(5,2),
    endurance NUMERIC(5,2),
    strength NUMERIC(5,2),
    reaction_time NUMERIC(5,3),
    agility NUMERIC(5,2),
    training_hours_per_week NUMERIC(4,1),
    recorded_at DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.athlete_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes manage own matches" ON public.athlete_matches FOR ALL TO authenticated USING (true);
CREATE POLICY "Athletes manage own metrics" ON public.performance_metrics FOR ALL TO authenticated USING (true);
