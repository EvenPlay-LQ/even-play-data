-- Migration: Update institution types and sport categories
-- Date: 2026-04-12
-- Purpose: Align database constraints with updated platform requirements

-- 1. Update institution_type constraint to match new 3-category system
-- First, drop the old constraint
-- 1. Migrate any legacy types to match new 3-category system
UPDATE institutions 
SET institution_type = 'club' 
WHERE institution_type = 'academy';

-- 2. Update institution_type constraint to match new 3-category system
-- First, drop the old constraint
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_institution_type_check;

-- Add new constraint with simplified 3-category system
ALTER TABLE institutions ADD CONSTRAINT institutions_institution_type_check 
CHECK (institution_type IN ('school', 'club', 'federation'));

-- 3. Add display labels for institution types (using comment for documentation)
COMMENT ON COLUMN institutions.institution_type IS 'school: School & Educational Institution | club: Club, Academy or Community Center | federation: Federation & Association';

-- 4. No database changes needed for sports (free-text field)
-- Sport options are managed in frontend constants.ts
-- Existing data remains valid as sport is a TEXT field, not an ENUM

-- 5. Add index for institution_type for better filtering
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(institution_type);

-- 6. Add documentation comment for institution categories
COMMENT ON TABLE institutions IS 'Institutional partners: Schools, Clubs/Academies/Community Centers, Federations/Associations';
