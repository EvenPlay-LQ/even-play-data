

# P0 Production Readiness — Full Implementation Plan

This is a large scope touching ~20 files. Here's the breakdown organized by workstream.

---

## 1. Error Boundary Component

**Create `src/components/ErrorBoundary.tsx`** — a React class component that catches render errors and shows a user-friendly fallback with "Try Again" button. Wrap all route components in `App.tsx` with it.

---

## 2. Password Reset Flow

**Edit `src/pages/LoginPage.tsx`**:
- Add "Forgot password?" link below the password field
- When clicked, show an email-only form that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
- Show toast confirmation

**Create `src/pages/ResetPasswordPage.tsx`**:
- Public route at `/reset-password`
- Detects `type=recovery` from URL hash via `onAuthStateChange`
- Shows new password form
- Calls `supabase.auth.updateUser({ password })`
- Redirects to `/buzz` on success

**Edit `src/App.tsx`**: Add route `<Route path="/reset-password" element={<ResetPasswordPage />} />`

---

## 3. Input Validation with Zod

**Create `src/lib/validations.ts`** — zod schemas for:
- `loginSchema` (email, password min 6)
- `signupSchema` (name, email, password min 6)
- `resetPasswordSchema` (password min 6, confirm match)
- `postSchema` (title min 3 max 200, content min 10, category)
- `profileSchema` (name, bio max 500, favorite_sport)

Apply these in LoginPage, ResetPasswordPage, BuzzPage (post creation), and ProfilePage (edit form).

---

## 4. Build 10 Missing Dashboard Sub-Pages

Instead of building 10 full pages, create a modular approach:

**Create `src/pages/dashboard/athlete/` directory** with:
- `AthleteMatches.tsx` — list match_stats with match details
- `AthleteAnalytics.tsx` — performance trends, rating charts
- `AthleteAchievements.tsx` — full achievements grid
- `AthleteHighlights.tsx` — placeholder with "Upload coming soon"
- `AthleteProfile.tsx` — view/edit athlete profile fields (sport, position, province)

**Create `src/pages/dashboard/institution/` directory** with:
- `InstitutionAthletes.tsx` — full athlete roster with search/filter
- `InstitutionTeams.tsx` — teams list with member counts
- `InstitutionMatches.tsx` — all matches (scheduled, completed)
- `InstitutionVerifications.tsx` — pending/approved verifications list
- `InstitutionAnalytics.tsx` — team averages, performance distribution

Each sub-page queries Supabase directly (athlete pages filter by `profile_id = auth.uid()`, institution pages filter by `institution_id`).

**Edit `src/App.tsx`**: Add explicit routes for each sub-path (e.g., `/dashboard/athlete/matches`), wrapping each in `ProtectedRoute` and `ErrorBoundary`.

**Edit `src/pages/AthleteDashboard.tsx` and `src/pages/InstitutionDashboard.tsx`**: These remain as the "Overview" tab — no changes needed to their content.

**Routing approach**: The wildcard routes `dashboard/athlete/*` and `dashboard/institution/*` already exist. We'll use nested routing or simply map each explicit path to its component. The `DashboardLayout` wraps each sub-page for consistent sidebar/nav.

---

## 5. Post Creation UI on BuzzPage

**Edit `src/pages/BuzzPage.tsx`**:
- Add a "Write Story" FAB button (bottom-right, mobile-friendly)
- Opens a Dialog/Sheet with form: title, content (textarea), category (select from BUZZ_CATEGORIES minus "All")
- Validates with `postSchema`
- Inserts into `posts` table with `author_id = auth.uid()`
- Refetches posts on success
- Shows toast confirmation

---

## 6. Profile Editing UI on ProfilePage

**Edit `src/pages/ProfilePage.tsx`**:
- Add "Edit Profile" button on the profile header card
- Opens a Dialog with form: name, bio, favorite_sport (select from SPORT_OPTIONS)
- Validates with `profileSchema`
- Uses the existing `updateProfile` from `useProfile` hook
- Shows toast on success, updates local state

---

## 7. Fix No-Op Buttons

**CommunityPage action cards** (Join Groups, Watch Live, Rate a Ref):
- "Join Community Groups" → scroll to the groups section below (or just a toast "Coming soon")
- "Watch Live & Replays" → toast "Coming soon"
- "Rate A Ref!" → toast "Coming soon"
- "View All" on Top Fans → toast "Coming soon"

**LandingPage footer** — "For Athletes" and "Support" links are `<span>` elements with no interaction. Change to `<button>` with `onClick={() => navigate("/login")}` to match Quick Links behavior.

**ProfilePage Settings**:
- "Account" → opens same edit profile dialog
- "Dark Mode" → toast "Coming soon"
- "Language" → toast "Coming soon"  
- "Promo Code" → toast "Coming soon"

---

## 8. Supabase Query Error Handling

Wrap all Supabase queries across pages with proper error handling:
- Check `{ data, error }` return values
- On error: show toast with user-friendly message ("Failed to load data. Please try again.")
- Add a reusable pattern: create `src/lib/queryHelpers.ts` with a `handleQueryError` utility
- Apply to: BuzzPage, CommunityPage, ZonePage, ProfilePage, AthleteDashboard, InstitutionDashboard, and all new sub-pages

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/components/ErrorBoundary.tsx` |
| Create | `src/pages/ResetPasswordPage.tsx` |
| Create | `src/lib/validations.ts` |
| Create | `src/lib/queryHelpers.ts` |
| Create | `src/pages/dashboard/athlete/AthleteMatches.tsx` |
| Create | `src/pages/dashboard/athlete/AthleteAnalytics.tsx` |
| Create | `src/pages/dashboard/athlete/AthleteAchievements.tsx` |
| Create | `src/pages/dashboard/athlete/AthleteHighlights.tsx` |
| Create | `src/pages/dashboard/athlete/AthleteProfile.tsx` |
| Create | `src/pages/dashboard/institution/InstitutionAthletes.tsx` |
| Create | `src/pages/dashboard/institution/InstitutionTeams.tsx` |
| Create | `src/pages/dashboard/institution/InstitutionMatches.tsx` |
| Create | `src/pages/dashboard/institution/InstitutionVerifications.tsx` |
| Create | `src/pages/dashboard/institution/InstitutionAnalytics.tsx` |
| Edit | `src/App.tsx` — add all new routes + ErrorBoundary wrapping |
| Edit | `src/pages/LoginPage.tsx` — forgot password + zod validation |
| Edit | `src/pages/BuzzPage.tsx` — post creation dialog + error handling |
| Edit | `src/pages/ProfilePage.tsx` — edit profile dialog + fix settings buttons |
| Edit | `src/pages/CommunityPage.tsx` — fix no-op action cards |
| Edit | `src/pages/LandingPage.tsx` — fix footer links |
| Edit | `src/pages/ZonePage.tsx` — add error handling |
| Edit | `src/pages/AthleteDashboard.tsx` — add error handling |
| Edit | `src/pages/InstitutionDashboard.tsx` — add error handling |

No database changes needed — all tables and RLS policies are already in place.

