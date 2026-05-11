-- ==============================================================================
-- Migration: Add institution_id to club_history
-- Description: Allows athletes to link their club history entries directly to 
-- registered institutions on the platform.
-- ==============================================================================

ALTER TABLE public.club_history
ADD COLUMN institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;

CREATE INDEX idx_club_history_institution_id ON public.club_history(institution_id);
