# Findings

## 2026-04-30
- User reported three distinct issues during the "Institution User Journey" sign-up:
  1. `new row for relation "institutions" violates check constraint "institutions_institution_type_check"`
  2. `permission denied for schema internal` upon completing setup.
  3. Form state seems to be improperly cached or persisted, forcing the user to clear cookies/cache to restart the flow.
