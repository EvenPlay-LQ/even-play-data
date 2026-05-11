# Progress Log: Dashboard Data Persistence Fix

## 2026-05-10

### What Was Done
1. **Diagnosed** the bug from user complaint screenshot — profile page shows "No bio yet" and blank fields after wizard completion.
2. **Traced** the full data flow: wizard → profiles upsert → find_or_create_athlete RPC → claim_athlete_profile RPC → navigate → dashboard.
3. **Identified 3 root causes:**
   - RC1: Navigation race (`window.location.href` fires before `refreshProfile()` resolves)
   - RC2: `claim_athlete_profile` doesn't sync `full_name`/`date_of_birth` from wizard input
   - RC3: `AthleteDashboard` has no fallback when `profiles` join is temporarily empty

### Patches Applied

#### 1. SQL Migration (RC2)
- File: `supabase/migrations/20260510000000_patch_claim_athlete_profile_name_dob.sql`
- Added `p_full_name TEXT DEFAULT NULL` and `p_date_of_birth DATE DEFAULT NULL` params
- `UPDATE` now sets `full_name = COALESCE(p_full_name, full_name)` and `date_of_birth = COALESCE(p_date_of_birth, date_of_birth)`
- Backward-compatible (new params are DEFAULT NULL)

#### 2. SignupWizard.tsx (RC1 + RC2)
- Passes `p_full_name: name.trim()` and `p_date_of_birth: dateOfBirth || null` to `claim_athlete_profile` call
- Removed `setTimeout(() => window.location.href = "/buzz", 400)` → replaced with `navigate("/buzz", { replace: true })` after awaited `refreshProfile()`
- All 3 remaining `window.location.href` → `navigate()` hard-nav instances fixed (institution modal + "Go to Dashboard" button)

#### 3. AthleteDashboard.tsx (RC3)
- Avatar initials and H1 now use `profile?.name || athlete?.full_name || "Athlete"` fallback chain

### Pending Actions
- [ ] Apply migration to Supabase production via SQL Editor
- [ ] Test end-to-end athlete signup flow
- [ ] Test institution signup flow
- [ ] Verify profile page shows name+bio after wizard completion

### Errors Encountered
- Chunk 3 of multi_replace had stale target content — resolved by viewing the file and applying the fix individually.

### Next Step
Apply the SQL migration to Supabase and do end-to-end test.
