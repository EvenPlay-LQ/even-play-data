

# Even Playground -- Revised Build Plan (Hybrid Architecture)

## Key Architectural Change

The previous plan proposed removing the Athlete and Institution dashboards. This revision **keeps both dashboards** as operational layers alongside the community navigation, creating a hybrid three-layer architecture.

## Current State
- **Database**: Empty -- no tables, no RLS, no triggers
- **Frontend**: 4 pages with mock data (Landing, Login, AthleteDashboard, InstitutionDashboard)
- **Auth**: Not wired to Supabase (LoginPage just navigates directly)
- **Supabase**: Connected (project `zkvurokcdlkuygrsfjqr`), no tables exist

---

## Architecture: Three Layers

```text
┌─────────────────────────────────────────────┐
│           PUBLIC / COMMUNITY LAYER          │
│  /buzz  /community  /zone  /profile         │
│  (unified bottom nav for all users)         │
├─────────────────────────────────────────────┤
│         ATHLETE OPERATIONAL LAYER           │
│  /dashboard/athlete                          │
│  Performance, stats, matches, progression   │
├─────────────────────────────────────────────┤
│       INSTITUTION OPERATIONAL LAYER         │
│  /dashboard/institution                      │
│  Athletes, teams, matches, verifications    │
└─────────────────────────────────────────────┘
```

- Community pages use unified `AppLayout` with 4-tab nav (Buzz, Community, Zone, Profile)
- Dashboard pages use a separate `DashboardLayout` with role-specific sidebar/nav
- Profile page includes a "Go to Dashboard" button based on user role

---

## Phase 1: Database Schema + Auth

### 1A. Single Migration -- All Tables + RLS

**Enum:**
- `app_role` (athlete, institution, coach, referee, scout, fan)

**17 Tables:**

| Table | Purpose |
|-------|---------|
| profiles | User identity (linked to auth.users) |
| user_roles | Role-based access control |
| institutions | Institution registration data |
| athletes | Sport, position, level, XP, performance |
| teams | Team identity per institution |
| team_members | Athlete-team linkage |
| matches | Fixtures with scores |
| match_stats | Per-athlete per-match performance |
| achievements | Athlete milestones |
| verifications | Verification workflow |
| posts | Buzz feed articles |
| comments | Post comments |
| likes | Post likes |
| community_groups | Community hub groups |
| merchandise | Merch items |
| notifications | User notifications |
| audit_logs | Change tracking |

**Functions:**
- `has_role(uuid, app_role)` -- security definer for RLS
- `handle_new_user()` -- trigger to auto-create profile on signup

**RLS Policies:** Read-all/update-own for profiles; role-gated write for match_stats/verifications; CRUD-own for posts/comments/likes.

### 1B. Auth Integration

- Wire `LoginPage.tsx` to Supabase Auth (email/password signup + login)
- Create `useAuth.tsx` hook (session via `onAuthStateChange`)
- Create `useProfile.tsx` hook (fetch profile + role)
- Auto-create profile + user_role on signup via DB trigger
- Add protected route wrapper component

---

## Phase 2: Navigation + Landing Page

### 2A. New AppLayout (Community Nav)

Unified 4-tab bottom nav for community pages:
- Buzz, Community, Zone, Profile
- Desktop: sidebar with labels
- Header: logo + notifications bell + "Dashboard" button (role-dependent)

### 2B. DashboardLayout (Operational Nav)

Separate layout for `/dashboard/athlete` and `/dashboard/institution`:
- Keep the existing sidebar nav pattern from current `AppLayout`
- Athlete tabs: Overview, Matches, Analytics, Highlights, Profile
- Institution tabs: Overview, Athletes, Teams, Matches, Verifications, Analytics

### 2C. Landing Page Redesign

Match reference design:
- Hero with sign-up CTA
- Stats bar (athletes, scouts, stories, sports)
- "Why Join" cards
- Feature preview sections
- Comprehensive footer

---

## Phase 3: Community Pages

### Buzz Page (`/buzz`)
- Search bar + category tabs (All, Transfers, Youth, Local, International, Live Feed)
- Article cards from `posts` table
- Featured hero article

### Community Page (`/community`)
- Community Groups section from `community_groups`
- Video highlights placeholder
- Top Fan leaderboard from `profiles.reputation`
- Merch store from `merchandise`

### Zone Page (`/zone`)
- Three sub-tabs: Participants, Compare, Marketplace
- **Participants**: Filterable athlete grid from `athletes` table
- **Compare**: Side-by-side radar/bar charts from `athletes` + `match_stats`
- **Marketplace**: Placeholder

### Profile Page (`/profile`)
- Profile header, engagement stats, editable bio
- Activity/Favorites tabs
- Settings (dark mode, language, sign out)
- **"Go to Dashboard" button** -- routes to `/dashboard/athlete` or `/dashboard/institution` based on role
- Coach M AI placeholder

---

## Phase 4: Role-Based Dashboards

### Athlete Dashboard (`/dashboard/athlete`)

Rewrite existing `AthleteDashboard.tsx`, move to `src/pages/dashboard/AthleteDashboard.tsx`.

Sections:
- **Overview**: XP bar, level, performance score, verified matches count
- **Performance Analytics**: Match history with goals/assists/minutes/rating charts
- **Achievements**: Earned badges and milestones from `achievements` table
- **Highlights**: Upload and manage video clips (Supabase Storage)
- **Progression**: Level system visualization (Rookie -> National Prospect)

Data sources: `athletes`, `match_stats`, `achievements`, `verifications`

### Institution Dashboard (`/dashboard/institution`)

Rewrite existing `InstitutionDashboard.tsx`, move to `src/pages/dashboard/InstitutionDashboard.tsx`.

Sections:
- **Overview**: Total/active athletes, pending verifications, alerts
- **Athlete Management**: Searchable athlete roster with status filters
- **Team Management**: Teams list, roster editing, season management
- **Match Management**: Create/edit fixtures, enter results and player stats
- **Verification Console**: Approve/reject athlete verifications, manage audit trail
- **Analytics**: Team averages, position depth, age breakdown, performance trends

Data sources: `institutions`, `athletes`, `teams`, `team_members`, `matches`, `match_stats`, `verifications`, `audit_logs`

---

## Phase 5: Seed Data + Polish

- Insert sample data: posts, athletes, institutions, teams, matches, merch, community groups
- Remove deprecated files (old dashboard locations)
- Verify all frontend-backend connections work end-to-end

---

## Routing Structure

```text
/                       -> LandingPage
/login                  -> LoginPage (Supabase Auth)
/buzz                   -> BuzzPage (community nav)
/community              -> CommunityPage (community nav)
/zone                   -> ZonePage (community nav)
/profile                -> ProfilePage (community nav)
/dashboard/athlete      -> AthleteDashboard (dashboard nav, role-gated)
/dashboard/athlete/*    -> Athlete sub-pages
/dashboard/institution  -> InstitutionDashboard (dashboard nav, role-gated)
/dashboard/institution/* -> Institution sub-pages
```

## Files

**Create:**
- `src/pages/BuzzPage.tsx`
- `src/pages/CommunityPage.tsx`
- `src/pages/ZonePage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/dashboard/AthleteDashboard.tsx`
- `src/pages/dashboard/InstitutionDashboard.tsx`
- `src/components/AppLayout.tsx` (rewrite -- community nav)
- `src/components/DashboardLayout.tsx` (new -- operational nav)
- `src/components/ProtectedRoute.tsx`
- `src/hooks/useAuth.tsx`
- `src/hooks/useProfile.tsx`

**Modify:**
- `src/App.tsx` (new routes)
- `src/pages/LandingPage.tsx` (redesign)
- `src/pages/LoginPage.tsx` (Supabase auth)

**Remove:**
- `src/pages/AthleteDashboard.tsx` (moved to dashboard/)
- `src/pages/InstitutionDashboard.tsx` (moved to dashboard/)

---

## Implementation Sequence

Due to the scope, this will be built across multiple messages:

1. **Message 1**: Database migration (all 17 tables + RLS + triggers + functions) + Auth hooks + LoginPage wiring
2. **Message 2**: AppLayout + DashboardLayout + Landing Page redesign + routing
3. **Message 3**: Buzz + Community + Zone + Profile pages
4. **Message 4**: Athlete Dashboard + Institution Dashboard (rewritten with Supabase integration)
5. **Message 5**: Seed data + final polish + end-to-end verification

