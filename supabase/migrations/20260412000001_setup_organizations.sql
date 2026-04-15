-- Migration: Setup M-Power Elite and Izinsele Academy organizations
-- Date: 2026-04-12
-- Purpose: Create organization administrator accounts and institutional profiles

-- ============================================================================
-- 1. CREATE USER ACCOUNTS
-- ============================================================================

-- Note: These users need to be created via Supabase Auth API or manually
-- This migration assumes the users exist and creates their institutional profiles

-- ============================================================================
-- 2. CREATE M-POWER ELITE INSTITUTION
-- ============================================================================

-- Insert M-Power Elite institution profile
-- Note: Replace 'USER_ID_MPOWER_ADMIN' with the actual user ID after account creation
INSERT INTO institutions (
  profile_id,
  institution_name,
  institution_type,
  province,
  contact_phone,
  website_url,
  safa_affiliation_number,
  sasa_registration_number,
  physical_address
) VALUES (
  NULL, -- Will be updated after user creation
  'M-Power Elite',
  'club', -- Club, Academy or Community Center
  'Gauteng',
  NULL,
  'https://mpowerelite.co.za',
  NULL,
  NULL,
  NULL
) ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================================
-- 3. CREATE IZINSELE ACADEMY INSTITUTION
-- ============================================================================

-- Insert Izinsele Academy institution profile
INSERT INTO institutions (
  profile_id,
  institution_name,
  institution_type,
  province,
  contact_phone,
  website_url,
  safa_affiliation_number,
  sasa_registration_number,
  physical_address
) VALUES (
  NULL, -- Will be updated after user creation
  'Izinsele Academy',
  'club', -- Club, Academy or Community Center
  'Gauteng',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
) ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================================
-- 4. CREATE ADMIN ROLE ASSIGNMENTS
-- ============================================================================

-- Note: These will be updated after user accounts are created
-- INSERT INTO user_roles (user_id, role) VALUES ('USER_ID_MPOWER', 'institution');
-- INSERT INTO user_roles (user_id, role) VALUES ('USER_ID_IZINSELE', 'institution');

-- ============================================================================
-- 5. ADD DOCUMENTATION NOTES
-- ============================================================================

-- Add comment for MH (Master Admin/Historical data manager)
COMMENT ON TABLE institutions IS 'MH NOTE: Source club registration requirements to facilitate easier seasonal registration processes. Contact organizations directly for historical athlete data.';

-- Add specific note for M-Power Elite
-- This will be stored in a new admin_notes table or as a comment
DO $$ 
BEGIN
  -- Check if admin_notes table exists, create if not
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notes') THEN
    CREATE TABLE admin_notes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
      note_type text CHECK (note_type IN ('registration', 'historical_data', 'compliance', 'general')),
      note_text text NOT NULL,
      created_by uuid REFERENCES profiles(id),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Master admins can view all notes" ON admin_notes 
    FOR SELECT USING (public.is_master_admin(auth.uid()));
    
    CREATE POLICY "Master admins can manage notes" ON admin_notes 
    FOR ALL USING (public.is_master_admin(auth.uid()));
  END IF;
END $$;

-- Insert MH note for M-Power Elite
INSERT INTO admin_notes (institution_id, note_type, note_text)
SELECT id, 'registration', 
  'MH ACTION: Source club registration requirements to facilitate easier seasonal registration processes. Contact M-Power Elite administration for historical athlete data and seasonal registration workflows.'
FROM institutions 
WHERE institution_name = 'M-Power Elite'
ON CONFLICT DO NOTHING;

-- Insert MH note for Izinsele Academy
INSERT INTO admin_notes (institution_id, note_type, note_text)
SELECT id, 'registration', 
  'MH ACTION: Source club registration requirements to facilitate easier seasonal registration processes. Contact Izinsele Academy administration for historical athlete data and seasonal registration workflows.'
FROM institutions 
WHERE institution_name = 'Izinsele Academy'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. GRANT APPROPRIATE PERMISSIONS
-- ============================================================================

-- Ensure institution admins have proper RLS policies
-- This is already handled by existing RLS policies, but documenting here:
-- - Institutions can manage their own athletes
-- - Institutions can create teams and fixtures
-- - Institutions can upload compliance documents
-- - Institutions can send announcements to their athletes/parents

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- After running this migration and creating user accounts, verify:
-- SELECT institution_name, institution_type, province FROM institutions WHERE institution_name IN ('M-Power Elite', 'Izinsele Academy');
-- SELECT * FROM admin_notes WHERE institution_id IN (SELECT id FROM institutions WHERE institution_name IN ('M-Power Elite', 'Izinsele Academy'));
