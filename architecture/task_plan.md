# Task Plan: B.L.A.S.T. Protocol & Feature Expansion
**Updated:** 2026-05-11  

---

## 🎯 North Star
Ensure a seamless end-to-end user journey across athletes, institutions, and fans. Data persistence must be robust, and connections between platform entities (e.g. Institutions inviting Athletes) must require explicit consent and generate clean audit trails.

## ✅ Completed Milestones

### 1. Dashboard Data Persistence Fix (P0)
- **Root Cause Addressed:** Fixed race conditions during the signup wizard and ensured accurate data propagation from wizard to database (`claim_athlete_profile` patched to support `full_name` and `date_of_birth`).
- **Outcome:** Athletes successfully see their setup data populate immediately upon hitting their dashboard and profile pages without forced re-entry.

### 2. Database Security & Access
- **Root Cause Addressed:** Resolved Supabase linting errors related to mutable search paths on RPCs and `SECURITY DEFINER`.
- **Outcome:** RLS policies and grants locked down, ensuring proper visibility across `athletes`, `media_gallery`, `performance_metrics`, etc.

### 3. Institution ↔ Athlete Invitations (Connection Lifecycle)
- **Implementation:** Institutions can now link existing athletes by generating an invitation via the `athlete_invites` table.
- **Athlete Control:** Athletes view pending invites within their Profile UI and can **Accept** (which auto-creates a club history log and links them) or **Decline**.
- **Management:** 
  - Institutions can **Revoke** pending invites and **Remove** connected athletes.
  - Athletes can formally **Leave** an institution via their club history.
- **RLS:** Custom policies applied so athletes can read/update their specific `athlete_invites`.

---

## 🚀 Next Phases (Blueprint)

### Phase 5 – Notifications & Communication (Option 2)
- [ ] **In-App Notifications:** When an invite is sent/accepted/revoked, trigger a row insert into the `notifications` table.
- [ ] **Email Workflows:** Hook into Supabase Edge Functions or third-party webhooks to send email alerts.

### Phase 6 – Match & Tournament Features
- [ ] **Match Scheduling:** Enable institutions to schedule matches.
- [ ] **Match Statistics:** Create UI for inputting post-match stats.

### Phase 7 – Community & Buzz Feed
- [ ] **Buzz Feed Algorithm:** Refine posts fetching so athletes see relevant community buzz.
- [ ] **Fan Engagement:** Complete the fan role workflows (likes, comments).
