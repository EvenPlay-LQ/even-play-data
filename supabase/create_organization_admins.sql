-- Script: Create Organization Admin Accounts
-- Date: 2026-04-12
-- Purpose: Create user accounts for M-Power Elite and Izinsele Academy administrators
-- IMPORTANT: This script should be run in Supabase SQL Editor or via Supabase CLI

-- ============================================================================
-- INSTRUCTIONS FOR MASTER ADMIN
-- ============================================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Temporary passwords will be generated - share securely with users
-- 3. Users should reset passwords on first login
-- 4. After running, update the institutions table with the profile_id

-- ============================================================================
-- 1. CREATE M-POWER ELITE ADMIN ACCOUNT
-- ============================================================================

-- Create auth user for M-Power Elite admin
-- Email: coach@malwandlahlekane.co.za
DO $$
DECLARE
  mpower_user_id uuid;
  mpower_institution_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO mpower_user_id 
  FROM auth.users 
  WHERE email = 'coach@malwandlahlekane.co.za';
  
  IF mpower_user_id IS NULL THEN
    -- Create user via Supabase Auth (this requires using the Admin API)
    -- For now, we'll insert into profiles and note that auth user needs to be created
    RAISE NOTICE 'M-Power Elite admin account needs to be created via Supabase Dashboard or Admin API';
    RAISE NOTICE 'Email: coach@malwandlahlekane.co.za';
    RAISE NOTICE 'After creation, update the institutions table with the user ID';
  ELSE
    RAISE NOTICE 'M-Power Elite admin user already exists with ID: %', mpower_user_id;
  END IF;
  
  -- Get M-Power Elite institution ID
  SELECT id INTO mpower_institution_id 
  FROM institutions 
  WHERE institution_name = 'M-Power Elite';
  
  IF mpower_institution_id IS NOT NULL AND mpower_user_id IS NOT NULL THEN
    -- Update institution with profile_id
    UPDATE institutions 
    SET profile_id = mpower_user_id
    WHERE id = mpower_institution_id;
    
    RAISE NOTICE 'M-Power Elite institution updated with admin profile_id';
  END IF;
  
END $$;

-- ============================================================================
-- 2. CREATE IZINSELE ACADEMY ADMIN ACCOUNT
-- ============================================================================

-- Create auth user for Izinsele Academy admin
DO $$
DECLARE
  izinsele_user_id uuid;
  izinsele_institution_id uuid;
BEGIN
  -- Check if user already exists (you'll need to specify the email)
  -- For now, using placeholder
  RAISE NOTICE 'Izinsele Academy admin account needs to be created';
  RAISE NOTICE 'Please specify admin email and create via Supabase Dashboard';
  
  -- Get Izinsele Academy institution ID
  SELECT id INTO izinsele_institution_id 
  FROM institutions 
  WHERE institution_name = 'Izinsele Academy';
  
  IF izinsele_institution_id IS NOT NULL THEN
    RAISE NOTICE 'Izinsele Academy institution exists with ID: %', izinsele_institution_id;
    RAISE NOTICE 'After creating admin user, update profile_id in institutions table';
  END IF;
  
END $$;

-- ============================================================================
-- 3. MANUAL STEPS FOR MASTER ADMIN
-- ============================================================================

/*
MANUAL STEPS TO COMPLETE SETUP:

Step 1: Create M-Power Elite Admin User
-----------------------------------------
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Email: coach@malwandlahlekane.co.za
4. Set a temporary password (e.g., MPower2026!Temp)
5. Click "Create user"
6. Copy the User ID (UUID)
7. Run this SQL:
   UPDATE institutions 
   SET profile_id = 'USER_ID_COPIED' 
   WHERE institution_name = 'M-Power Elite';

Step 2: Create Izinsele Academy Admin User
-------------------------------------------
1. Determine the admin email for Izinsele Academy
2. Go to Supabase Dashboard → Authentication → Users
3. Click "Add User" → "Create new user"
4. Enter email and set temporary password
5. Click "Create user"
6. Copy the User ID (UUID)
7. Run this SQL:
   UPDATE institutions 
   SET profile_id = 'USER_ID_COPIED' 
   WHERE institution_name = 'Izinsele Academy';

Step 3: Assign Institution Role
--------------------------------
For each admin user, ensure they have the 'institution' role:
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'institution')
ON CONFLICT (user_id, role) DO NOTHING;

Step 4: Verify Setup
---------------------
Run these queries to verify:

-- Check institutions
SELECT 
  i.institution_name,
  i.institution_type,
  p.name as admin_name,
  p.email
FROM institutions i
LEFT JOIN profiles p ON p.id = i.profile_id
WHERE i.institution_name IN ('M-Power Elite', 'Izinsele Academy');

-- Check user roles
SELECT 
  ur.user_id,
  ur.role,
  i.institution_name
FROM user_roles ur
JOIN institutions i ON i.profile_id = ur.user_id
WHERE i.institution_name IN ('M-Power Elite', 'Izinsele Academy');

-- Check admin notes
SELECT 
  i.institution_name,
  an.note_type,
  an.note_text
FROM admin_notes an
JOIN institutions i ON i.id = an.institution_id
WHERE i.institution_name IN ('M-Power Elite', 'Izinsele Academy');

Step 5: Share Credentials
--------------------------
1. Send welcome email to each admin with:
   - Login URL
   - Temporary password
   - Instructions to reset password
   - Link to institution dashboard

Step 6: Historical Data Import
-------------------------------
1. Contact MH to source club registration requirements
2. Use BulkImportWizard (when built) to import historical athlete data
3. Or manually add athletes via InstitutionAthletes page
*/

-- ============================================================================
-- 4. QUICK REFERENCE: Institution Admin Capabilities
-- ============================================================================

/*
Once setup is complete, organization admins can:

✅ Add/manage athlete profiles (stub records)
✅ Create and manage teams
✅ Schedule fixtures and matches
✅ Track attendance for training/matches
✅ Upload compliance documents
✅ Send announcements to athletes/parents
✅ View performance analytics
✅ Manage verification workflows
✅ Export data (when BulkExportManager is built)

For M-Power Elite specifically:
- Admin: coach@malwandlahlekane.co.za
- Can add historical athlete data
- Can manage seasonal registrations
- Full institution dashboard access

For Izinsele Academy:
- Admin: [TBD - specify email]
- Similar capabilities as M-Power Elite
- Independent organization with separate data
*/
