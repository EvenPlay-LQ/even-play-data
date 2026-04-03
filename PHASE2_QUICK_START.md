# Phase 2 Quick Start Guide

**Enhanced Institutional Workflows Now Live!** 🚀

---

## What's New in Phase 2?

### 1. 🏆 Multi-Squad Team Management
Organize athletes into teams by age group and skill level with full squad management.

**Access:** Dashboard → "Manage Teams" or `/dashboard/institution/teams`

### 2. ⚽ Match Fixture Scheduling  
Schedule matches, track scores, and manage competitions.

**Access:** Dashboard → "Fixtures" or `/dashboard/institution/matches`

### 3. 📄 Compliance Document Storage
Upload and track medical forms, consents, and certificates with expiry alerts.

**Access:** Dashboard → "Compliance Docs" or `/dashboard/institution/compliance`

---

## Database Migration Required

Before using these features, apply the database migration:

```bash
cd c:\Users\pumza\Documents\EPApp\even-play-data
npx supabase db push
```

OR manually run: `supabase/migrations/20260402200000_institutional_features_phase2.sql`

---

## Feature Highlights

### Team Management

**Age Groups Available:**
- U8, U10, U12, U14, U16, U18, U21 (Youth)
- Senior, Open, Masters (Adult)

**Skill Levels:**
- 🌱 Beginner
- 🌿 Intermediate  
- 🌳 Advanced
- ⭐ Elite
- 🎓 Academy
- 🏆 Development

**Squad Roles:**
- Captain (C badge)
- Vice-Captain (VC badge)
- Goalkeeper (GK position)
- Player (Standard role)

**Quick Actions:**
- Create team in <2 minutes
- Add athlete to squad with role selection
- View complete roster with search
- Remove athlete from squad

**Best Practices:**
✅ Use descriptive team names (e.g., "Thunderbirds U16 Football")  
✅ Assign captain/vice-captain for leadership structure  
✅ Update athlete status when injured/suspended  
✅ Include home venue for match logistics  

---

### Match Fixtures

**Match Statuses:**
- 📅 **Scheduled**: Future match awaiting kickoff
- 🔴 **Live**: Match in progress (animated badge)
- ✅ **Completed**: Full-time with recorded score
- ⏸️ **Postponed**: Rescheduled for later
- ❌ **Cancelled**: Match won't be played

**Score Tracking:**
- Enter full-time scores
- Mark match as completed
- View historical results
- Track goal differential

**Pro Tips:**
✅ Schedule matches at least 1 week in advance  
✅ Include competition name for league tracking  
✅ Add venue details for away supporters  
✅ Update scores within 24 hours of completion  

---

### Compliance Documents

**Document Types Supported:**
1. Medical Form (Required annually)
2. Parental Consent (Required for minors)
3. Insurance Certificate (Recommended)
4. Transfer Certificate (Inter-institution transfers)
5. Birth Certificate (Age verification)
6. Photo Release (Marketing consent)
7. Code of Conduct (Behavioral agreement)
8. Emergency Contact (Critical for safety)
9. Other (Custom documents)

**Verification Workflow:**
```
Upload → Pending Review → Verify ✓ / Reject ✗
```

**Expiry Alerts:**
- 🟢 **Valid**: Not expired
- 🟡 **Expiring Soon**: <30 days remaining (amber alert banner)
- 🔴 **Expired**: Past expiry date (red text)

**Upload Guidelines:**
✅ PDF format preferred for forms  
✅ High-resolution scans (300 DPI minimum)  
✅ File size <10MB  
✅ Clear, readable text  
✅ Include all pages of multi-page documents  

❌ No photos with shadows/glare  
❌ No password-protected files  
❌ No corrupted or incomplete documents  

---

## Step-by-Step Workflows

### Workflow 1: Creating Your First Team

**Time:** 2-3 minutes

1. Click "Manage Teams" from dashboard
2. Click "+ Create Team" button (top right)
3. Fill in team details:
   ```
   Team Name: Thunderbirds U16
   Sport: Football
   Age Group: U16
   Skill Level: Intermediate
   Season: Year-Round
   Home Venue: Main Field
   ```
4. Click "Create Team"
5. Team appears in grid with green U16 badge

---

### Workflow 2: Building Your Squad

**Time:** 5 minutes for 15-athlete squad

1. Navigate to "Manage Teams"
2. Find your newly created team
3. Click "View Squad" button
4. In "Add Athlete to Squad" section:
   - Select athlete from dropdown
   - Choose role: Captain
   - Click "+" button
5. Repeat for remaining athletes:
   - Select next athlete
   - Choose role: Vice-Captain
   - Click "+"
   - Continue with Players and Goalkeeper
6. Review squad list (should show all athletes)
7. Optional: Note jersey numbers (future feature)

**Squad Structure Example:**
```
Captain (1): John Doe #10
Vice-Captain (1): Jane Smith #8
Goalkeeper (2): Mike Johnson #1, Sarah Williams #13
Players (12): Remaining squad members
```

---

### Workflow 3: Scheduling a Match

**Time:** 3-4 minutes

1. Go to "Fixtures"
2. Click "+ Schedule Match"
3. Select teams:
   ```
   Home Team: Thunderbirds U16
   Away Team: Eagles U16 (opponent)
   ```
4. Add competition (optional):
   ```
   Competition: Regional League 2026
   ```
5. Set kickoff time:
   ```
   Date: Saturday, April 10, 2026
   Time: 10:00 AM
   ```
6. Enter venue:
   ```
   Venue: Main Field, Even Playground Sports Complex
   ```
7. Click "Schedule Match"
8. Match appears in "Upcoming" filter with "Scheduled" badge

---

### Workflow 4: Recording Match Results

**Time:** 1 minute

1. Navigate to "Fixtures"
2. Filter by "Completed" or find match in "All"
3. Click "Update Score" button
4. Enter scores in dialog:
   ```
   Home Score: 3
   Away Score: 1
   ```
5. Click "Update Score & Complete Match"
6. Dialog closes, match card updates:
   - Status changes to "Completed"
   - Score displays prominently (3 - 1)
   - Result visible to all stakeholders

---

### Workflow 5: Uploading Compliance Documents

**Time:** 2-3 minutes per document

1. Go to "Compliance Docs"
2. Click "+ Upload Document"
3. Select athlete: "John Doe"
4. Choose document type: "Medical Form"
5. Click to choose file:
   - Browse to `medical_form_john_doe_2026.pdf`
   - Select file (verify <10MB)
6. Set expiry date:
   - Click date picker
   - Select: August 31, 2026 (end of season)
7. Optional notes:
   ```
   Annual medical clearance from Dr. Sarah Johnson
   Blood type: O+
   Allergies: Penicillin (noted on form)
   ```
8. Click "Upload Document"
9. Success toast appears
10. Document card shows in grid with "Pending" status

---

### Workflow 6: Verifying Documents

**Time:** 30 seconds per document

1. Navigate to "Compliance Docs"
2. Filter by "Pending" status (optional)
3. Find document requiring verification
4. Click "View" to open in new tab
5. Review document thoroughly:
   - Check completeness (all fields filled)
   - Verify signatures present
   - Confirm dates are current
   - Ensure legibility
6. If valid: Click "Verify" button
7. If invalid: Note issues, contact submitter (future rejection workflow)
8. Badge updates from "Pending" to "Verified" with green checkmark

---

## Common Scenarios

### Scenario 1: New Athlete Joins Institution

**Complete this workflow:**
1. Add athlete to institution roster (Phase 1)
2. Upload required compliance documents:
   - Medical Form ✓
   - Parental Consent ✓
   - Insurance Certificate ✓
3. Add athlete to appropriate team(s):
   - Primary team (e.g., U16 Football)
   - Secondary team if applicable (e.g., U18 Football for advanced players)
4. Assign squad role and jersey number

---

### Scenario 2: Mid-Season Team Reorganization

**Use case:** Moving athletes between teams based on performance

1. Navigate to "Manage Teams"
2. Open squad for original team (e.g., U16)
3. Remove athlete from squad (click trash icon)
4. Navigate to new team (e.g., U18)
5. Open squad for new team
6. Add athlete to squad with appropriate role
7. Update athlete status if needed (e.g., "active" → "injured")

**Note:** Athlete history is preserved across all team changes.

---

### Scenario 3: Pre-Season Compliance Drive

**Goal:** Ensure 100% document compliance before season starts

1. Go to "Compliance Docs"
2. Filter by "All" status
3. Export athlete roster (future feature)
4. Cross-reference uploaded documents against roster
5. Identify athletes with missing/expired documents
6. Send reminder emails (manual or automated future feature)
7. Set deadline for compliance (e.g., 2 weeks before first match)
8. Monitor progress via "Expiring Soon" alert banner

---

### Scenario 4: Tournament Week Preparation

**Timeline:** 1 week before tournament

**Monday:**
- Schedule all pool matches
- Verify opposition teams are created
- Confirm venues and kickoff times

**Tuesday:**
- Upload final medical forms (check expiry dates)
- Print squad lists with jersey numbers
- Pack first aid kit and emergency contacts

**Wednesday:**
- Mark training session attendance
- Send announcement to parents with tournament schedule
- Confirm transportation arrangements

**Thursday:**
- Final squad selection (18 players for tournament)
- Update athlete statuses (confirm no last-minute injuries)
- Share match day instructions via announcements

**Friday-Sunday:**
- Tournament matches
- Live score updates (if connectivity allows)
- Photo/video upload to highlights (future feature)

---

## Mobile Usage

### Tablet Optimization (iPad/Surface):

**Team Management:**
- Perfect for sideline team sheet viewing
- Large touch targets for glove use
- Landscape orientation recommended

**Match Fixtures:**
- Real-time score entry during matches
- View upcoming fixtures at a glance
- Share fixture list with coaching staff

**Compliance:**
- Quick document photo upload from phone camera
- Instant verification on tablet
- Expiry alerts visible on lock screen

---

## Integration with Phase 1

### Combined Workflows:

#### Attendance + Team Selection:
1. Mark training attendance (Phase 1)
2. Review attendance rates
3. Select starting XI based on training participation
4. Add selected players to team squad (Phase 2)

#### Announcements + Match Reminders:
1. Schedule match (Phase 2)
2. Create announcement (Phase 1):
   ```
   Title: Match Day Reminder - U16 vs Eagles
   Content: Kickoff 10AM Saturday at Main Field. 
            Arrive 9:15AM for warm-up. 
            Bring: Kit, boots, shin guards, water bottle.
   Audience: Athletes, Parents
   Priority: High
   ```
3. Target audience receives notification

---

## Troubleshooting

### Issue: Can't see "Manage Teams" card
**Solution:** Ensure you're logged in as institution user. Check role in profile settings. Refresh dashboard.

### Issue: Team creation fails
**Solution:** 
- Verify team name is unique within your institution
- Check all required fields filled (name, sport)
- Ensure stable internet connection
- Try different browser if issue persists

### Issue: Athlete doesn't appear in squad dropdown
**Solution:**
- Confirm athlete is already in institution roster
- Check athlete isn't already in another team's squad
- Verify athlete status is "active" (not retired/transferred)

### Issue: Match scheduling shows "No teams available"
**Solution:**
- Create at least 2 teams first
- Ensure teams belong to your institution
- Refresh page after creating teams

### Issue: Document upload spinner hangs
**Solution:**
- Check file size (<10MB)
- Verify internet connection speed
- Cancel and retry upload
- Try different file format (PDF recommended)

### Issue: "Expiring Soon" alert won't dismiss
**Solution:**
- Alert persists until documents are renewed
- Renew expiring documents or update expiry dates
- Filter by "Expiring" to identify specific documents
- Contact development team if alert shows incorrect count

---

## Video Tutorials (Coming Soon)

Planned tutorial series:
- [ ] Creating and managing teams (5 min)
- [ ] Building your squad roster (4 min)
- [ ] Scheduling matches and competitions (6 min)
- [ ] Recording match results (2 min)
- [ ] Uploading compliance documents (5 min)
- [ ] Document verification workflow (3 min)
- [ ] Mobile app tips and tricks (4 min)

**Estimated release:** Week of April 15, 2026

---

## Support Resources

### Documentation:
- Full roadmap: INSTITUTIONAL_CLIENT_ROADMAP.md
- Phase 1 details: PHASE1_IMPLEMENTATION_SUMMARY.md
- Phase 2 details: PHASE2_IMPLEMENTATION_SUMMARY.md
- This guide: PHASE2_QUICK_START.md

### Getting Help:
1. Check this FAQ first
2. Review full documentation
3. Search knowledge base (coming soon)
4. Create GitHub issue with screenshots
5. Contact development team

### Feedback Channels:
- Email: product@evenplayground.com
- In-app feedback form (coming soon)
- Monthly user survey
- Quarterly stakeholder meetings

---

## What's Next?

### Phase 2.5 (Under Consideration):
- ⚽ Match events timeline (goals, cards, substitutions)
- 📊 Advanced match statistics
- 🏆 Competition standings auto-calculation
- 📹 Video highlight integration
- 📧 Email notifications for expiring documents

### Phase 3 (Q3 2026):
- 📈 Advanced analytics dashboard
- 📊 Cohort benchmarking
- 👨‍👩‍👧 Enhanced parent portal
- 📱 Mobile app optimization
- 🤖 AI-powered insights

---

## Success Metrics

### Our Goals Together:

**Team Adoption:**
- 80% of institutions create ≥2 teams
- Average squad size: 15-20 athletes
- 90% squad accuracy (correct age/skill grouping)

**Match Activity:**
- 50+ matches scheduled in first month
- 95% score completion rate
- <24 hour score update lag

**Compliance Excellence:**
- 100% document upload rate for active athletes
- <5% document rejection rate
- Zero expired documents during active season
- <48 hour verification turnaround

---

**Questions?** Reach out to the development team anytime. We're here to help you succeed! 🚀

**Last Updated:** April 2, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
