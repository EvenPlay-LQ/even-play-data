# Phase 1 Deployment Checklist

**Institutional Client Features - Attendance & Announcements**  
**Target Date:** [Insert Date]  
**Deployment Lead:** [Name]  

---

## Pre-Deployment Verification

### ✅ Code Review Complete
- [ ] All TypeScript files compile without errors
- [ ] No console.log() statements in production code
- [ ] Proper error handling implemented throughout
- [ ] Loading states present for all async operations
- [ ] Accessibility features tested (keyboard navigation, screen readers)

### ✅ Testing Complete
- [ ] Unit tests passing (if applicable)
- [ ] Integration tests passing
- [ ] Manual testing completed (see test scenarios below)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified (iOS, Android)

### ✅ Documentation Ready
- [x] INSTITUTIONAL_CLIENT_ROADMAP.md created
- [x] PHASE1_IMPLEMENTATION_SUMMARY.md created
- [x] QUICK_START_INSTITUTIONAL_FEATURES.md created
- [x] DEPLOYMENT_CHECKLIST.md created
- [ ] User tutorial videos recorded (optional)
- [ ] Release notes drafted

---

## Database Migration Steps

### Step 1: Backup Production Database
```bash
# Export current production database
pg_dump -h $PROD_DB_HOST -U postgres even_play > backups/pre_phase1_$(date +%Y%m%d_%H%M%S).sql

# Verify backup completed successfully
ls -lh backups/pre_phase1_*.sql
```

### Step 2: Apply Migration to Staging
```bash
# Connect to staging environment
cd c:\Users\pumza\Documents\EPApp\even-play-data

# Push migration to staging Supabase project
npx supabase db push --db-url "$STAGING_DB_URL"

# Verify tables created
psql "$STAGING_DB_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('attendance_sessions', 'attendance_records', 'institution_announcements', 'announcement_reads');"
```

### Step 3: Test Migration in Staging
Run verification queries:
```sql
-- Check tables exist
SELECT COUNT(*) FROM attendance_sessions;
SELECT COUNT(*) FROM attendance_records;
SELECT COUNT(*) FROM institution_announcements;
SELECT COUNT(*) FROM announcement_reads;

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE '%attendance%' OR indexname LIKE '%announcement%';

-- Check constraint exists
SELECT indexname FROM pg_indexes 
WHERE indexname = 'idx_athletes_unique_email_institution';

-- Test helper function
SELECT mark_announcement_read(gen_random_uuid());
```

### Step 4: Deploy to Production
```bash
# IMPORTANT: Only proceed if staging tests pass

# Push migration to production Supabase project
npx supabase db push --db-url "$PROD_DB_URL"

# Alternative: Manual SQL execution via Supabase Studio
# 1. Open https://app.supabase.com/project/YOUR_PROJECT_ID/sql/editor
# 2. Copy contents of: supabase/migrations/20260402100000_institutional_features_phase1.sql
# 3. Execute with admin privileges
# 4. Verify success
```

### Step 5: Verify Production Migration
```sql
-- Run same verification queries as Step 3 on production
-- Confirm all tables, indexes, and constraints exist
-- Test RLS policies by querying as different user roles
```

---

## Frontend Deployment

### Step 1: Build Production Bundle
```bash
# Install dependencies
npm install

# Run build
npm run build

# Verify build succeeded without errors
ls -lh dist/

# Test production bundle locally
npm run preview
# Open http://localhost:4173
```

### Step 2: Deploy to Hostinger
```bash
# Option A: Automated via GitHub Actions (Recommended)
git add .
git commit -m "feat: Deploy Phase 1 institutional features"
git push origin main

# GitHub Actions will automatically deploy to Hostinger
# Monitor workflow at: https://github.com/YOUR_REPO/actions

# Option B: Manual FTP/SFTP upload
# Upload contents of dist/ folder to Hostinger server
# Use FileZilla or similar FTP client
```

### Step 3: Verify Deployment
- [ ] Navigate to https://your-domain.com/dashboard/institution
- [ ] Verify "Track Attendance" card appears
- [ ] Verify "Announcements" card appears
- [ ] Click cards and verify routing works
- [ ] Test full functionality in production

---

## Post-Deployment Testing

### Critical Path Testing

#### Attendance Tracker:
- [ ] Create training session
- [ ] Create match session
- [ ] Mark single athlete as present
- [ ] Mark single athlete as absent
- [ ] Use "All Present" button
- [ ] Use "All Absent" button
- [ ] Add coach notes
- [ ] Set session duration
- [ ] View session history
- [ ] Verify data persists after page refresh

#### Announcements:
- [ ] Create low priority announcement
- [ ] Create urgent priority announcement
- [ ] Target athletes only
- [ ] Target parents only
- [ ] Target multiple audiences
- [ ] Set expiration date
- [ ] Delete announcement
- [ ] Verify read count increments

#### Duplicate Prevention:
- [ ] Add new athlete with unique email → Success
- [ ] Add athlete with existing email → Error shown
- [ ] Test case-insensitive matching (TEST@example.com)
- [ ] Verify cross-institution emails allowed

### Role-Based Access Testing:

#### Institution User:
- [ ] Can view attendance tracker
- [ ] Can create sessions
- [ ] Can post announcements
- [ ] Can add athletes
- [ ] Cannot access other institutions' data

#### Athlete User:
- [ ] Can view own attendance
- [ ] Can read announcements
- [ ] Cannot create sessions
- [ ] Cannot post announcements

#### Parent User:
- [ ] Can view child's attendance
- [ ] Can read parent-targeted announcements
- [ ] Cannot modify data

#### Master Admin:
- [ ] Can view all institutional data
- [ ] Can bypass RLS if needed
- [ ] Can monitor system health

### Performance Testing:
- [ ] Page loads in <2 seconds
- [ ] Attendance submission completes in <1 second
- [ ] Announcement creation completes in <1 second
- [ ] No console errors in browser DevTools
- [ ] No memory leaks (check Chrome DevTools Memory tab)
- [ ] Smooth scrolling and animations (60 FPS)

### Security Testing:
- [ ] Attempt to access another institution's data → Blocked
- [ ] Attempt to create duplicate athlete → Blocked
- [ ] Attempt SQL injection via form inputs → Sanitized
- [ ] Attempt XSS via announcement content → Sanitized
- [ ] Verify HTTPS enforced in production
- [ ] Verify authentication tokens properly validated

---

## Rollback Plan

### If Database Migration Fails:

#### Scenario 1: Migration Script Error
```bash
# Stop deployment immediately
# Restore from backup
psql "$PROD_DB_URL" < backups/pre_phase1_YYYYMMDD_HHMMSS.sql

# Investigate error in migration script
# Fix and re-test in staging before retrying
```

#### Scenario 2: Data Corruption
```bash
# Identify corrupted records
psql "$PROD_DB_URL" -c "SELECT * FROM athletes WHERE contact_email IS NULL;"

# Restore affected tables from backup
pg_restore --dbname="$PROD_DB_URL" --table=athletes backup_file.sql

# Or restore entire database if widespread corruption
```

### If Frontend Deployment Fails:

#### Scenario 1: Build Errors
```bash
# Revert recent code changes
git reset --hard HEAD~1

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Retry build
npm run build
```

#### Scenario 2: Runtime Errors
```bash
# Check browser console for errors
# Review Sentry/error logs
# Identify problematic component

# Quick fix: Comment out broken feature
// import AttendanceTracker from "./pages/dashboard/institution/AttendanceTracker";

# Redeploy
git add .
git commit -m "fix: Temporarily disable attendance tracker"
git push origin main
```

#### Scenario 3: Critical Bug in Production
```bash
# Immediate rollback to previous version
git revert HEAD
git push origin main

# OR manually deploy previous stable build
# Upload dist/ from last known good version

# Notify users of temporary downtime
# Investigate bug thoroughly before redeploying
```

---

## Communication Plan

### Before Deployment:
- [ ] Notify pilot institutions of upcoming features
- [ ] Schedule demo/training session
- [ ] Prepare support team for potential questions
- [ ] Update status page with maintenance window (if needed)

### During Deployment:
- [ ] Post update in team Slack channel
- [ ] Monitor deployment progress
- [ ] Keep stakeholders informed of timeline
- [ ] Document any issues encountered

### After Deployment:
- [ ] Send "Features Now Live" email to all institutional users
- [ ] Share quick start guide
- [ ] Offer office hours for Q&A
- [ ] Collect initial feedback
- [ ] Monitor usage analytics

---

## Monitoring & Observability

### Metrics to Track:

#### Adoption Metrics:
- Daily active users of attendance tracker
- Number of sessions created per day
- Announcements posted per week
- Average time to complete attendance marking
- Feature retention rate (Day 1, Day 7, Day 30)

#### Performance Metrics:
- API response times (p50, p95, p99)
- Database query execution times
- Frontend render times
- Error rates by feature
- Crash-free session percentage

#### Business Metrics:
- Institutional user satisfaction (NPS)
- Support ticket volume related to new features
- Reduction in duplicate athlete records
- Compliance reporting time savings
- User engagement scores

### Tools:
- **Sentry**: Error tracking and alerting
- **Supabase Dashboard**: Database performance
- **Google Analytics**: User behavior
- **Custom Dashboards**: Feature-specific metrics

### Alerting Thresholds:
🔴 **Critical** (Page immediately):
- Error rate > 5%
- API latency p95 > 3 seconds
- Database connection failures

🟠 **Warning** (Notify in Slack):
- Error rate > 1%
- API latency p95 > 2 seconds
- Failed login attempts spike

🟡 **Info** (Log for review):
- New user onboarding completion
- Feature adoption milestones
- Unusual traffic patterns

---

## Success Criteria

### Must Have (Go/No-Go Decision):
- [ ] Zero critical bugs
- [ ] All RLS policies functioning correctly
- [ ] Duplicate prevention working 100%
- [ ] Attendance marking end-to-end functional
- [ ] Announcements can be created and viewed
- [ ] No data loss or corruption
- [ ] <3 second page load times

### Nice to Have:
- [ ] Positive user feedback from beta testers
- [ ] Documentation complete
- [ ] Video tutorials ready
- [ ] Support team trained
- [ ] Monitoring dashboards configured

---

## Deployment Sign-Off

### Required Approvals:
- [ ] Development Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______

### Deployment Completion:
- [ ] All pre-deployment checks passed
- [ ] Database migration applied successfully
- [ ] Frontend deployed to production
- [ ] Post-deployment testing completed
- [ ] Monitoring active and healthy
- [ ] Stakeholders notified
- [ ] Documentation published

**Deployment Completed By:** _________________  
**Date/Time:** _________________  
**Status:** ✅ SUCCESS / ❌ FAILED

---

## Post-Deployment Retrospective

### What Went Well:
- 
- 
- 

### What Could Be Improved:
- 
- 
- 

### Action Items for Next Deployment:
1. 
2. 
3. 

---

## Appendix: Useful Commands

### Database Queries:
```sql
-- Count sessions created today
SELECT COUNT(*) FROM attendance_sessions 
WHERE DATE(created_at) = CURRENT_DATE;

-- Most recent announcements
SELECT title, priority, target_audience, created_at 
FROM institution_announcements 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for duplicate emails (should return 0)
SELECT institution_id, contact_email, COUNT(*) 
FROM athletes 
WHERE contact_email IS NOT NULL 
GROUP BY institution_id, contact_email 
HAVING COUNT(*) > 1;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('attendance_sessions', 'attendance_records', 'institution_announcements');
```

### Log Analysis:
```bash
# Search for errors in application logs
grep "ERROR" logs/app.log | tail -50

# Monitor real-time during deployment
tail -f logs/app.log | grep -E "(attendance|announcement|error)"

# Count API calls by endpoint
cat logs/access.log | awk '{print $7}' | sort | uniq -c | sort -rn
```

### Performance Profiling:
```bash
# Lighthouse audit
npm run lighthouse http://localhost:5173/dashboard/institution

# Web Vitals monitoring
# Install Chrome extension: Web Vitals by Google
# Monitor Core Web Vitals during usage
```

---

**Document Version:** 1.0  
**Last Updated:** April 2, 2026  
**Template Source:** Even Playground Deployment Best Practices
