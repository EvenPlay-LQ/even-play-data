# Findings: Dashboard Data Not Persisting After Wizard

## Complaint Summary
Users complete the signup/user-creation wizard but their data (name, bio, sport, position, etc.) does not appear on the dashboard — they see "No bio yet", blank names, and 0s for stats.

## Data Flow Audit

### Athlete Flow
```
SignupWizard.handleCompleteSetup()
  ├─ supabase.from("profiles").upsert({ name, bio, user_type, setup_complete })  ← WRITES OK
  ├─ supabase.rpc("find_or_create_athlete", { p_full_name, p_date_of_birth, p_sport, p_email, p_position })
  │    └─ Creates/finds athletes row with: full_name, date_of_birth, sport, position, contact_email, status='stub'
  ├─ supabase.rpc("claim_athlete_profile", { p_athlete_id, p_profile_id, p_position, p_squad, p_nationality, p_height_cm, p_weight_kg, p_mysafa_id, p_playing_style })
  │    └─ UPDATES athletes: profile_id, status='claimed', position, squad, nationality, height_cm, weight_kg, mysafa_id, playing_style
  │    ❌ MISSING: full_name NOT updated (user may have confirmed/edited in step 2)
  │    ❌ MISSING: date_of_birth NOT synced  
  └─ refreshProfile() called, then window.location.href = "/buzz"
       ❌ RACE: Hard nav fires before DB refresh resolves
```

### AthleteDashboard Data Read
```
supabase.from("athletes").select("*, profiles(*)").eq("profile_id", user.id)
  → athlete.full_name  (from athletes table)
  → profile.name       (from profiles via JOIN)
  → athlete.sport, position, squad, secondary_sports, xp_points, level, etc.
```

**If athlete row has stale/wrong full_name, the dashboard H1 shows wrong name.**

### ProfilePage Data Read  
```
supabase.from("profiles").select("*").eq("id", effectiveId)
  → viewProfile.name, bio, user_type, favorite_sport
  └─ Then fetches athletes.* for sport/position/squad enrichment
```

**The `profiles` row IS updated by the wizard (name + bio) — but if the user reaches ProfilePage before the profile cache clears, they see stale data.**

## Root Causes (Ranked by Impact)

### RC1: Navigation Race Condition (HIGH IMPACT)
`window.location.href = "/buzz"` causes a full page reload immediately after `refreshProfile()` is called but BEFORE it resolves. The new page context starts with empty profile data.

**Fix:** `await refreshProfile()` then `navigate("/buzz")` using React Router (soft nav preserves context).

### RC2: `claim_athlete_profile` Missing Name/DOB Sync (MEDIUM IMPACT)  
If an institution pre-created a stub athlete with a slightly different name, `claim_athlete_profile` does NOT overwrite `full_name` with what the user typed. The athlete dashboard shows the institution's name.

**Fix:** Add `p_full_name` and `p_date_of_birth` params to `claim_athlete_profile` and update the row.

### RC3: `AthleteDashboard` Uses Profile Join for Display Name (LOW IMPACT)
If the profiles join fails (RLS, timing), the dashboard falls back to nothing. Should use `athlete.full_name` as a reliable fallback.

## Constraints
- `claim_athlete_profile` is `SECURITY DEFINER` — safe to modify the UPDATE body
- Adding optional params with DEFAULT NULL is backward-compatible
- `refreshProfile` in `useProfile.tsx` calls `fetchProfile(true)` — uses `.order()` trick to bust cache
- `window.location.href` bypasses React Router context, losing any in-memory state
