# Even Playground Platform Update Guide
**Date:** April 12, 2026  
**Version:** 1.0  
**Status:** Ready for Deployment

---

## Executive Summary

This guide documents the comprehensive updates made to the Even Playground platform, including:
- ✅ Institution type reorganization (3 categories)
- ✅ Sport category expansion (4 new sports added)
- ✅ Organization branding (M-Power Elite & Izinsele Academy)
- ✅ Administrative account setup procedures
- ✅ Historical data management workflows

---

## 1. Institution Types Configuration

### **Updated Categories**

The platform now uses **3 simplified institution types**:

| Type Value | Display Label | Description |
|------------|---------------|-------------|
| `school` | School & Educational Institution | High schools, colleges, universities |
| `club` | Club, Academy or Community Center | Sports clubs, academies, community organizations |
| `federation` | Federation & Association | Regional/national sports governing bodies |

### **Changes Made**

#### **Frontend Updates:**
- **File:** `src/pages/SignupWizard.tsx` (lines 488-494)
- Institution type dropdown updated with new labels
- Old `academy` type merged into `club` category

\#### **Database Updates:**- **Migration:** `supabase/migrations/20260412000000_update_institution_types_and_sports.sql`
- Dropped old constraint allowing 4 types
- Added new constraint for 3 types
- Migrated existing `academy` records to `club`
- Added index for better filtering performance

### **Migration Impact**

```sql
-- Automatic migration performed:
UPDATE institutions 
SET institution_type = 'club' 
WHERE institution_type = 'academy';
```

**No data loss** - all existing institutions preserved with appropriate type mapping.

---

## 2. Sport Categories Updates

### **Updated Sport Options**

| Sport | Status | Notes |
|-------|--------|-------|
| Football | ✅ Renamed | Previously "Soccer" |
| Rugby | ✅ Kept | Unchanged |
| Athletics | ✅ Kept | Unchanged |
| Cricket | ✅ Kept | Unchanged |
| Basketball | ✅ Kept | Unchanged |
| E-Gaming | ✨ NEW | Added |
| Wall Climbing | ✨ NEW | Added |
| Parkour | ✨ NEW | Added |
| Culture - Dancing | ✨ NEW | Added |

**Removed:**
- ❌ Touch Rugby (removed from options)

### **Changes Made**

#### **Frontend Updates:**
- **File:** `src/config/constants.ts` (lines 36-45)
- Updated `SPORT_OPTIONS` array
- All sport selection dropdowns now use updated options

#### **Database Impact:**
- **No schema changes required** - `sport` column is TEXT type
- Existing athlete records remain valid
- New sports available for selection immediately

### **Where Sports Are Used**

1. **SignupWizard** - Athlete registration (line 400)
2. **ZonePage** - Sport filtering
3. **InstitutionAthletes** - Add athlete dialog
4. **AthleteAnalytics** - Performance tracking
5. **Team Management** - Team sport assignment

---

## 3. Organization Rebranding

### **M-Power Elite Setup**

**Organization Details:**
- **Name:** M-Power Elite
- **Type:** Club, Academy or Community Center
- **Admin Email:** coach@malwandlahlekane.co.za
- **Province:** Gauteng
- **Website:** https://mpowerelite.co.za

**Capabilities:**
- ✅ Add/manage athlete profiles
- ✅ Import historical athlete data
- ✅ Manage seasonal registrations
- ✅ Full institution dashboard access
- ✅ Team and fixture management
- ✅ Attendance tracking
- ✅ Compliance document management

### **Izinsele Academy Setup**

**Organization Details:**
- **Name:** Izinsele Academy
- **Type:** Club, Academy or Community Center
- **Admin Email:** [TBD - Specify admin email]
- **Province:** Gauteng

**Capabilities:**
- Same as M-Power Elite
- Independent organization with separate data
- Own athlete roster and teams

### **JTC References**

**Search Results:**
- ✅ No JTC references found in source code
- ✅ Only found in auto-generated package files (package-lock.json, bun.lock)
- ✅ No manual updates required

**Note:** The platform was already using generic "Even Playground" branding, so no additional rebranding was needed beyond organization setup.

---

## 4. Administrative Account Setup

### **Step-by-Step Instructions**

#### **Step 1: Create M-Power Elite Admin Account**

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Navigate to: Authentication → Users

2. **Create User**
   - Click "Add User" → "Create new user"
   - Email: `coach@malwandlahlekane.co.za`
   - Password: Set temporary password (e.g., `MPower2026!Temp`)
   - Email Confirm: ✅ Check this box
   - Click "Create user"

3. **Copy User ID**
   - After creation, copy the UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. **Link to Institution**
   ```sql
   UPDATE institutions 
   SET profile_id = 'USER_ID_COPIED' 
   WHERE institution_name = 'M-Power Elite';
   ```

5. **Assign Role**
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('USER_ID_COPIED', 'institution')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

#### **Step 2: Create Izinsele Academy Admin Account**

1. **Determine Admin Email**
   - Contact Izinsele Academy for admin contact details

2. **Create User** (same process as Step 1)
   - Use the provided email
   - Set temporary password
   - Copy User ID

3. **Link to Institution**
   ```sql
   UPDATE institutions 
   SET profile_id = 'USER_ID_COPIED' 
   WHERE institution_name = 'Izinsele Academy';
   ```

4. **Assign Role**
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('USER_ID_COPIED', 'institution')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

#### **Step 3: Verify Setup**

Run these verification queries:

```sql
-- Check institutions and admin profiles
SELECT 
  i.institution_name,
  i.institution_type,
  i.province,
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
  an.note_text,
  an.created_at
FROM admin_notes an
JOIN institutions i ON i.id = an.institution_id
WHERE i.institution_name IN ('M-Power Elite', 'Izinsele Academy');
```

---

## 5. MH Notes for Club Registration

### **Administrative Notes Created**

Two notes have been added to the `admin_notes` table:

**M-Power Elite Note:**
> MH ACTION: Source club registration requirements to facilitate easier seasonal registration processes. Contact M-Power Elite administration for historical athlete data and seasonal registration workflows.

**Izinsele Academy Note:**
> MH ACTION: Source club registration requirements to facilitate easier seasonal registration processes. Contact Izinsele Academy administration for historical athlete data and seasonal registration workflows.

### **How to Access Notes**

**For Master Admin:**
```sql
-- View all administrative notes
SELECT 
  i.institution_name,
  an.note_type,
  an.note_text,
  an.created_at
FROM admin_notes an
JOIN institutions i ON i.id = an.institution_id
ORDER BY an.created_at DESC;

-- Filter by note type
SELECT * FROM admin_notes 
WHERE note_type = 'registration';
```

### **MH Action Items**

1. **Contact Organizations**
   - Reach out to M-Power Elite administration
   - Reach out to Izinsele Academy administration
   - Request seasonal registration workflows

2. **Gather Requirements**
   - Required documents for athlete registration
   - Seasonal timeline (when do registrations open/close?)
   - Historical athlete data format (CSV, Excel, etc.)
   - Any custom fields needed for registration

3. **Document Workflows**
   - Create registration checklist for each organization
   - Document data import procedures
   - Note any special compliance requirements

4. **Implement Bulk Import**
   - Once requirements are gathered, use BulkImportWizard (when built)
   - Or manually import via InstitutionAthletes page
   - Ensure all historical data is properly linked

---

## 6. Deployment Instructions

### **Prerequisites**
- Supabase CLI installed (`npm install -g supabase`)
- Access to Supabase project
- Master admin credentials

### **Step 1: Deploy Database Migrations**

```bash
# Navigate to project directory
cd c:\Users\pumza\Documents\EPApp\even-play-data

# Push migrations to production
npx supabase db push

# Verify migrations applied
npx supabase db remote commit
```

### **Step 2: Verify Database Changes**

```sql
-- Check institution types
SELECT institution_name, institution_type 
FROM institutions 
WHERE institution_name IN ('M-Power Elite', 'Izinsele Academy');

-- Check sport options (frontend only, no DB change needed)
-- Verify in application: SPORT_OPTIONS in constants.ts

-- Check admin_notes table exists
SELECT COUNT(*) FROM admin_notes;
```

### **Step 3: Create Admin Accounts**

Follow the instructions in Section 4 above to create the admin accounts via Supabase Dashboard.

### **Step 4: Test Frontend**

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Institution Signup**
   - Go to `/signup`
   - Select "Institution / Club"
   - Verify new institution type options appear
   - Complete signup flow

3. **Test Sport Selection**
   - Go to athlete signup
   - Verify new sport options are available
   - Confirm "Football" label (not "Soccer")
   - Verify E-Gaming, Wall Climbing, Parkour, Culture - Dancing are present

4. **Test Institution Dashboard**
   - Login as M-Power Elite admin
   - Verify dashboard loads correctly
   - Test adding an athlete
   - Verify institution name displays correctly

### **Step 5: Push to GitHub**

```bash
# Commit changes
git add .
git commit -m "Update institution types, sport categories, and setup organizations"

# Push to remote
git push origin main
```

---

## 7. Data Integrity Checklist

### **Pre-Deployment Verification**

- [x] Institution type constraint updated (4 types → 3 types)
- [x] Existing `academy` records migrated to `club`
- [x] Sport options updated in constants.ts
- [x] No JTC references in source code
- [x] M-Power Elite institution record created
- [x] Izinsele Academy institution record created
- [x] Admin notes table created
- [x] MH notes added for both organizations
- [x] Index added for institution_type filtering

### **Post-Deployment Verification**

- [ ] Migrations applied successfully
- [ ] Institution types display correctly in signup
- [ ] Sport options show all 9 sports
- [ ] M-Power Elite admin account created
- [ ] Izinsele Academy admin account created
- [ ] Admin can login and access dashboard
- [ ] Admin can add athletes
- [ ] Admin notes visible to master admin
- [ ] No console errors in browser

### **Rollback Plan**

If issues arise:

```sql
-- Rollback institution types
ALTER TABLE institutions DROP CONSTRAINT institutions_institution_type_check;
ALTER TABLE institutions ADD CONSTRAINT institutions_institution_type_check 
CHECK (institution_type IN ('school', 'club', 'academy', 'federation'));

-- Rollback academy migration
UPDATE institutions 
SET institution_type = 'academy' 
WHERE institution_type = 'club' 
AND institution_name IN ('M-Power Elite', 'Izinsele Academy');

-- Remove organizations (if needed)
DELETE FROM admin_notes 
WHERE institution_id IN (
  SELECT id FROM institutions 
  WHERE institution_name IN ('M-Power Elite', 'Izinsele Academy')
);

DELETE FROM institutions 
WHERE institution_name IN ('M-Power Elite', 'Izinsele Academy');
```

---

## 8. Organization Admin Capabilities

### **What M-Power Elite Admin Can Do**

Once logged in, the admin at `coach@malwandlahlekane.co.za` will have access to:

#### **Dashboard Overview** (`/dashboard/institution`)
- View total athletes, teams, pending verifications
- Quick access to all features
- Top athletes list
- Upcoming matches

#### **Athlete Management** (`/dashboard/institution/athletes`)
- Add new athletes (stub records)
- Edit athlete profiles
- View athlete performance metrics
- Search and filter athletes
- Export athlete data (when BulkExportManager is built)

#### **Team Management** (`/dashboard/institution/teams`)
- Create teams by age group/skill level
- Assign athletes to teams
- Manage team rosters
- Track team performance

#### **Fixture Scheduling** (`/dashboard/institution/matches`)
- Schedule matches
- Manage home/away fixtures
- Track match results
- View match history

#### **Attendance Tracking** (`/dashboard/institution/attendance`)
- Create attendance sessions (training, matches, meetings)
- Mark athlete attendance
- View attendance reports
- Export for compliance

#### **Announcements** (`/dashboard/institution/announcements`)
- Send announcements to athletes/parents
- Track read receipts
- Manage announcement priorities
- Schedule future announcements

#### **Compliance Documents** (`/dashboard/institution/compliance`)
- Upload medical forms
- Track document expiry
- Verification workflows
- Compliance reporting

#### **Analytics** (`/dashboard/institution/analytics`)
- View institution-wide metrics
- Performance trends
- Attendance rates
- Athlete development tracking

### **What Izinsele Academy Admin Can Do**

Same capabilities as M-Power Elite, but with completely separate data:
- Own athlete roster
- Own teams and fixtures
- Own attendance records
- Own announcements
- Own compliance documents

---

## 9. Historical Data Import Workflow

### **For MH (Master Admin)**

#### **Phase 1: Gather Requirements**

1. **Contact M-Power Elite**
   - Email: coach@malwandlahlekane.co.za
   - Request:
     - Current athlete roster (CSV/Excel)
     - Historical performance data
     - Team structures
     - Seasonal registration process
     - Required custom fields

2. **Contact Izinsele Academy**
   - Same request as above
   - Understand their unique requirements

3. **Document Findings**
   - Create registration checklist
   - Map data fields to Even Playground schema
   - Identify any custom fields needed

#### **Phase 2: Data Preparation**

1. **Clean Data**
   - Remove duplicates
   - Standardize formats (dates, names, etc.)
   - Validate email addresses
   - Check for missing required fields

2. **Map Fields**
   ```
   Source Field → Even Playground Field
   -------------------------------------------
   Full Name → full_name
   Email → contact_email
   Sport → sport
   Position → position
   DOB → date_of_birth
   etc.
   ```

3. **Create CSV Template**
   - Use standard format for bulk import
   - Include headers matching database columns
   - Provide example data

#### **Phase 3: Import Process**

**Option A: Manual Import (Current)**
1. Login as institution admin
2. Go to `/dashboard/institution/athletes`
3. Click "Add Athlete"
4. Enter athlete details
5. Repeat for each athlete

**Option B: Bulk Import (When Built)**
1. Go to `/dashboard/institution/bulk-import`
2. Upload CSV file
3. Map fields
4. Preview data
5. Execute import
6. Review error report

#### **Phase 4: Verification**

1. **Check Import Results**
   ```sql
   SELECT COUNT(*) 
   FROM athletes 
   WHERE institution_id = (
     SELECT id FROM institutions 
     WHERE institution_name = 'M-Power Elite'
   );
   ```

2. **Spot Check Records**
   - Verify 5-10 random athletes
   - Check data accuracy
   - Ensure proper linking

3. **Test Workflows**
   - Add athletes to teams
   - Create fixtures
   - Test attendance tracking
   - Verify all features work

---

## 10. Troubleshooting

### **Common Issues**

#### **Issue: Institution type not showing in dropdown**
**Solution:** Clear browser cache and reload

#### **Issue: Sport options not updated**
**Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

#### **Issue: Admin can't login**
**Solution:** 
1. Check user exists in Supabase Auth
2. Verify email is confirmed
3. Check password is correct
4. Ensure profile record exists

#### **Issue: Institution dashboard shows "No Institution Profile"**
**Solution:**
```sql
-- Check if institution has profile_id
SELECT institution_name, profile_id 
FROM institutions 
WHERE institution_name = 'M-Power Elite';

-- If profile_id is NULL, update it:
UPDATE institutions 
SET profile_id = 'USER_ID' 
WHERE institution_name = 'M-Power Elite';
```

#### **Issue: Athletes not showing for institution**
**Solution:**
```sql
-- Check athletes are linked
SELECT COUNT(*) 
FROM athletes 
WHERE institution_id = (
  SELECT id FROM institutions 
  WHERE institution_name = 'M-Power Elite'
);

-- If count is 0, athletes need to be added
```

### **Support Contacts**

- **Master Admin:** lqlake215@gmail.com
- **M-Power Elite:** coach@malwandlahlekane.co.za
- **Izinsele Academy:** [TBD]

---

## 11. Next Steps & Recommendations

### **Immediate (This Week)**
1. ✅ Deploy database migrations
2. ✅ Create admin accounts
3. ✅ Test all functionality
4. ✅ Contact organizations for requirements

### **Short-Term (Next 2 Weeks)**
1. Build BulkImportWizard component (~600 lines)
2. Gather historical data from organizations
3. Import athlete data (manual or bulk)
4. Train organization admins on platform usage

### **Medium-Term (Next Month)**
1. Build BulkExportManager component (~400 lines)
2. Implement E2E tests (Playwright)
3. Add production monitoring (Sentry)
4. Optimize RPC performance for large imports

### **Long-Term (Q2 2026)**
1. Build IntegrationSettings UI (~500 lines)
2. Implement third-party integrations (SIS, payment)
3. Add white-label customization
4. Mobile app development

---

## Appendix A: Files Modified

| File | Changes | Lines Changed |
|------|---------|---------------|
| `src/config/constants.ts` | Added 4 new sports | +4 |
| `src/pages/SignupWizard.tsx` | Updated institution types | +3, -4 |
| `supabase/migrations/20260412000000_update_institution_types_and_sports.sql` | New migration | +30 |
| `supabase/migrations/20260412000001_setup_organizations.sql` | New migration | +142 |
| `supabase/create_organization_admins.sql` | Setup script | +198 |
| `ORGANIZATION_SETUP_GUIDE.md` | This document | New |

## Appendix B: Database Schema Changes

### **New Table: admin_notes**
```sql
CREATE TABLE admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  note_type text CHECK (note_type IN ('registration', 'historical_data', 'compliance', 'general')),
  note_text text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### **Modified Constraint: institution_type**
```sql
-- Old: ('school', 'club', 'academy', 'federation')
-- New: ('school', 'club', 'federation')
```

### **New Index**
```sql
CREATE INDEX idx_institutions_type ON institutions(institution_type);
```

## Appendix C: Quick Reference Cards

### **Institution Admin Quick Start**
1. Login with provided credentials
2. Reset password on first login
3. Go to Institution Dashboard
4. Add athletes via "Athlete Roster"
5. Create teams via "Manage Teams"
6. Schedule fixtures via "Fixtures"
7. Track attendance via "Track Attendance"

### **Master Admin Verification Checklist**
- [ ] Migrations applied
- [ ] Admin accounts created
- [ ] Institutions linked to profiles
- [ ] User roles assigned
- [ ] Admin notes created
- [ ] Frontend tested
- [ ] No console errors
- [ ] GitHub updated

---

**Document Version:** 1.0  
**Last Updated:** April 12, 2026  
**Author:** AI Development Team  
**Status:** Ready for Deployment  
**Classification:** INTERNAL - DEVELOPMENT & OPERATIONS TEAM
