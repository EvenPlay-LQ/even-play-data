-- MVP Schema Additions for Even Playground
-- Run this in your Supabase SQL Editor to add the missing tables for Phase 1.

-- 1. Club History Table
CREATE TABLE IF NOT EXISTS public.club_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    club_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Performance Tests Table
CREATE TABLE IF NOT EXISTS public.performance_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    metric_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    test_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Media Gallery Table
CREATE TABLE IF NOT EXISTS public.media_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Coach Feedback Table
CREATE TABLE IF NOT EXISTS public.coach_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.club_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_feedback ENABLE ROW LEVEL SECURITY;

-- Policies (Basic Allow-All for MVP prototyping, can be restricted later)
CREATE POLICY "Enable read access for all users" ON public.club_history FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.club_history FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON public.performance_tests FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.performance_tests FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON public.media_gallery FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.media_gallery FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON public.coach_feedback FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.coach_feedback FOR ALL TO authenticated USING (true);
