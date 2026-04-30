# Task Plan: Resolve Institution Sign-Up Errors

## Phases
1. **[B] Blueprint**: Define North Star, integrations, schemas, and payload. (Current)
2. **[L] Link**: Verify Supabase connections and database schema, particularly around the `institutions` table and `internal` schema permissions.
3. **[A] Architect**: Document SOPs for the sign-up flow and database access patterns. Update any broken architecture.
4. **[S] Stylize**: Ensure the frontend error handling and UI flow correctly manage state (addressing the caching/cookie issue).
5. **[T] Trigger**: Deploy the fixes.

## Checklists
- [ ] Answer Discovery Questions
- [ ] Define Data Schema in `gemini.md`
- [ ] Investigate `institutions_institution_type_check` constraint
- [ ] Investigate `permission denied for schema internal`
- [ ] Investigate state persistence issue on page refresh
