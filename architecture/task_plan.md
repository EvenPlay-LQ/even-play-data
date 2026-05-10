# Task Plan: Dashboard Data Persistence Fix
**Created:** 2026-05-10  
**Phase:** B.L.A.S.T. Protocol  
**Priority:** P0 – User-facing data loss

---

## North Star
Wizard signup data (name, bio, sport, position, squad, nationality, height, weight, DOB) must auto-populate on every dashboard and profile page the moment setup completes — no manual re-entry required.

## Root Cause (Discovery)
The `claim_athlete_profile` RPC does NOT write `full_name` or `date_of_birth` back to the `profiles` table, and the `profiles` upsert in `handleCompleteSetup` does NOT update the `name` field in the athletes table.  
The `AthleteDashboard` reads `profile?.name` from `profiles` via `athletes.profiles(*)` join — which IS updated — but the profile page reads the `athletes` record directly for sport/position/squad, which IS written.  
**The actual gap:** The `ProfilePage` shows `"No bio yet"` and blank name fields because:
1. The wizard upserts `name` into `profiles` ✅ (this DOES work)  
2. But `useProfile` can serve a stale cached profile after navigation if `refreshProfile()` race condition loses

**Second gap (athletes):** `find_or_create_athlete` creates a stub with `full_name` but the `claim_athlete_profile` RPC does NOT update `full_name` from what the user typed in step 2. If they were pre-seeded with a different name by an institution, the profile will show the institution's name, not the athlete's own input.

**Third gap (navigation race):** After `handleCompleteSetup`, `refreshProfile()` is called, then immediately `window.location.href = "/buzz"`. The browser hard-navigates before the profile re-fetch resolves, so the new page starts with stale/empty profile data.

## Blueprint

### Phase 1 – Fix `handleCompleteSetup` in `SignupWizard.tsx`
- After the profile upsert, wait for `refreshProfile()` to fully resolve before navigating
- Pass `full_name` and `date_of_birth` into `claim_athlete_profile` (add params to RPC)
- Ensure `name` is always synced back from wizard into both `profiles` AND `athletes.full_name`

### Phase 2 – Fix `claim_athlete_profile` SQL RPC
- Add `p_full_name TEXT DEFAULT NULL` and `p_date_of_birth DATE DEFAULT NULL` params
- Update the athlete row with the user-confirmed name and DOB

### Phase 3 – Fix navigation timing in `SignupWizard.tsx`
- Replace `window.location.href` hard nav with `navigate()` after `await refreshProfile()`
- Add a small guard delay only if needed

### Phase 4 – Fix `AthleteDashboard` fallback
- Ensure it reads `athlete.full_name` as a fallback display name when profile join is empty

---

## Checklist
- [x] Root cause identified
- [ ] `claim_athlete_profile` RPC updated with full_name + DOB params
- [ ] `SignupWizard.tsx` passes full_name + DOB to claim_athlete_profile
- [ ] Navigation race condition fixed (await refreshProfile before navigate)
- [ ] `AthleteDashboard` fallback name display verified
- [ ] Migration SQL written
- [ ] Findings documented
