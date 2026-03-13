

# Phase 3: Rewrite Dashboards with Supabase + Seed Data

## Status Check

The community pages (Buzz, Community, Zone, Profile) were already built with full Supabase integration during Phase 2. The remaining work is:

1. **Both dashboards still use hardcoded mock data** -- need to connect to Supabase
2. **Database tables are empty** -- need seed data for everything to work
3. **No `handle_new_user` trigger exists** in the database (triggers section shows none)

## What Will Be Built

### 1. Fix Missing Trigger

The `handle_new_user()` function exists but no trigger is attached. Create a migration to attach it to `auth.users` on INSERT. **Wait -- we cannot attach triggers to `auth` schema.** Instead, we need to verify the trigger exists via Supabase dashboard or use a different approach. Actually, looking at the migration tool constraints, the trigger on `auth.users` was likely created in the initial migration but just not showing. We'll verify this works during testing.

### 2. Seed Demo Data

Insert sample data into all tables so the platform has content to display:

- **5 sample profiles** (with matching auth concept -- these will be referenced by ID)
- **1 institution** (Cape Town Academy)
- **5 athletes** with varying sports, levels, and performance scores
- **2 teams** under the institution
- **4 matches** with scores
- **Match stats** for athletes across matches
- **6 achievements** for athletes
- **8 posts** across categories (transfers, youth, local, international)
- **3 community groups**
- **4 merchandise items**
- **3 verifications**

Since we can't create auth users via SQL, we'll seed the data tables directly using known UUIDs, and the profiles will be "demo" profiles. The seed data will use the Supabase insert tool (not migration).

### 3. Rewrite Athlete Dashboard

Replace all mock data with Supabase queries:

- Fetch athlete record via `athletes` table joined with `profiles` (where `profile_id = auth.uid()`)
- Fetch recent matches via `match_stats` joined with `matches`
- Fetch achievements from `achievements` table
- Calculate XP percentage, level name from athlete data
- Performance trend from match_stats averages
- Show loading states and empty states

### 4. Rewrite Institution Dashboard

Replace all mock data with Supabase queries:

- Fetch institution via `institutions` table (where `profile_id = auth.uid()`)
- Count athletes linked to institution
- Fetch pending verifications count
- Fetch top athletes by performance_score
- Fetch upcoming matches for institution's teams
- Calculate team averages from match_stats
- Show loading states and empty states

### 5. Enhance Profile Page

Add real community stats by counting:
- Posts by the user (`posts` where `author_id = uid`)
- Likes received
- Teams followed (placeholder)

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/AthleteDashboard.tsx` | Full rewrite -- replace mock data with Supabase queries |
| `src/pages/InstitutionDashboard.tsx` | Full rewrite -- replace mock data with Supabase queries |
| `src/pages/ProfilePage.tsx` | Add real post/like counts from Supabase |

## Seed Data (via insert tool)

Insert into: `profiles`, `institutions`, `athletes`, `teams`, `team_members`, `matches`, `match_stats`, `achievements`, `posts`, `community_groups`, `merchandise`, `verifications`

All using consistent UUIDs so foreign keys resolve correctly.

## RLS Consideration

Seed data inserts will use the service role (via insert tool), bypassing RLS. The seeded profiles won't have matching auth.users entries, so they'll appear as read-only demo data. Real users who sign up will get their own profiles via the trigger and can create their own athlete/institution records.

## Implementation Order

1. Seed all demo data (insert tool calls)
2. Rewrite `AthleteDashboard.tsx` with Supabase integration
3. Rewrite `InstitutionDashboard.tsx` with Supabase integration
4. Enhance `ProfilePage.tsx` with real counts

