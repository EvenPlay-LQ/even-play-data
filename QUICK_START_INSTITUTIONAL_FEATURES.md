# Institutional Features - Quick Start Guide

**Phase 1 Core Features Now Live!** 🎉

---

## What's New?

### 1. 📊 Attendance Tracking
Track athlete participation in training sessions, matches, meetings, and assessments.

**Access:** Dashboard → "Track Attendance" card or `/dashboard/institution/attendance`

### 2. 📢 Announcements System  
Broadcast messages to athletes, parents, and coaches with priority targeting.

**Access:** Dashboard → "Announcements" card or `/dashboard/institution/announcements`

### 3. ✅ Duplicate Email Prevention
Automatic prevention of duplicate athlete records within your institution.

---

## Database Migration Required

Before using these features, apply the database migration:

```bash
cd c:\Users\pumza\Documents\EPApp\even-play-data
npx supabase db push
```

OR manually run: `supabase/migrations/20260402100000_institutional_features_phase1.sql`

---

## Feature Highlights

### Attendance Tracker

**Session Types Available:**
- 🏃 Training Session
- ⚽ Match  
- 👥 Team Meeting
- 📋 Fitness Assessment
- 📌 Other

**Quick Actions:**
- **"All Present"** button for instant roll call
- **"All Absent"** for cancelled sessions
- Individual status: Present ✓ | Late 🕐 | Excused ℹ️ | Absent ✕

**Best Practices:**
✅ Mark attendance within 24 hours of session  
✅ Add coaching notes for context  
✅ Use location field for multi-venue tracking  
✅ Set appropriate duration for compliance reporting  

---

### Announcements

**Priority Levels:**
- 🔴 **Urgent**: Immediate attention required (e.g., venue changes, cancellations)
- 🟠 **High**: Important updates (e.g., schedule changes, payment reminders)
- 🔵 **Normal**: Regular communications (e.g., weekly newsletters)
- ⚪ **Low**: General information (e.g., upcoming events)

**Audience Targeting:**
Click badges to select:
- Athletes only
- Parents only  
- Coaches only
- Any combination
- Leave empty = Everyone

**Pro Tips:**
✅ Use urgent priority sparingly (max 1/month)  
✅ Set expiration dates for time-sensitive content  
✅ Keep titles under 60 characters  
✅ Include clear calls-to-action in content  

---

### Adding Athletes

**New Validation:**
Email addresses must be unique within your institution. System will block duplicates with error message.

**Example Flow:**
```
1. Click "+ Add Athlete"
2. Enter: John Doe
3. Email: john.doe@example.com
4. Sport: Football
5. Position: Striker
6. Submit → Creates stub record
7. Athlete receives invitation email
8. They claim profile when signing up
```

**If You See "Duplicate Email":**
- Search roster for existing athlete
- Check if athlete already has a profile
- Use alternative email (parent/guardian)
- Contact admin to merge duplicate records

---

## User Roles & Permissions

### Institution Admin Can:
✅ Create/edit/delete attendance sessions  
✅ Mark attendance for any athlete  
✅ Post announcements to all audiences  
✅ Delete outdated announcements  
✅ Add new athletes to roster  
✅ View all institutional data  

### Athletes Can:
✅ View their own attendance history  
✅ Read announcements targeted to athletes  
✅ View their profile and stats  

### Parents Can:
✅ View child's attendance records  
✅ Read announcements targeted to parents  
✅ Link to multiple children  

---

## Mobile Usage

Both features are optimized for tablet/mobile use:

**Attendance on iPad:**
- Perfect for sideline marking during training
- Large touch targets for gloves use
- Works offline (syncs when connection restored)

**Announcements on Phone:**
- Quick broadcast from anywhere
- Push notifications for urgent messages
- Voice-to-text for faster composition

---

## Reporting & Analytics

### Current Capabilities:
- View session history (last 10 sessions)
- See read counts on announcements
- Track individual athlete attendance

### Coming Soon (Next Sprint):
- CSV export for compliance reports
- Term-based filtering
- Attendance rate percentages
- Trend charts and graphs
- Bulk operations

---

## Troubleshooting

### Issue: Can't see "Track Attendance" card
**Solution:** Ensure you're logged in as institution user. Check role in profile settings.

### Issue: Attendance won't save
**Solution:** 
1. Check internet connection
2. Verify all required fields filled (type, date)
3. Ensure at least one athlete marked
4. Refresh page and try again

### Issue: Announcement not visible to parents
**Solution:**
1. Edit announcement
2. Add "Parents" to target audience
3. Save changes
4. Ask parent to refresh app

### Issue: "Duplicate email" when adding athlete
**Solution:**
1. Search roster for existing record
2. Check spelling variations (TEST@example.com vs test@example.com)
3. Use different email (parent/guardian)
4. Contact admin if truly not found

---

## Support Resources

### Documentation:
- Full roadmap: `INSTITUTIONAL_CLIENT_ROADMAP.md`
- Implementation details: `PHASE1_IMPLEMENTATION_SUMMARY.md`
- This guide: `QUICK_START_INSTITUTIONAL_FEATURES.md`

### Getting Help:
1. Check this FAQ first
2. Review full documentation
3. Create GitHub issue with screenshots
4. Contact development team

### Video Tutorials (Coming Soon):
- [ ] How to track attendance (3 min)
- [ ] Creating effective announcements (2 min)
- [ ] Managing your athlete roster (4 min)
- [ ] Understanding RLS policies (5 min)

---

## Feedback & Suggestions

We want to hear from you! Share your experience:

**Positive Feedback:**
- What's working well?
- Which feature saves you the most time?
- How has this improved your workflow?

**Improvement Ideas:**
- What's missing?
- What's confusing or difficult?
- What would make this 10x better?

**Submit Feedback:**
- Email: product@evenplayground.com
- In-app feedback form (coming soon)
- Monthly user survey

---

## What's Next?

### Phase 2 Preview (Sprint 3-4):
- 🏆 Multi-squad team management
- 📅 Fixture scheduling system
- 📁 Compliance document storage
- 👨‍👩‍👧 Parent portal MVP

### Future Enhancements Under Consideration:
- Recurring session templates
- Automated absence notifications
- Integration with school MIS systems
- QR code check-in for events
- Attendance leaderboards

---

## Success Metrics

### Our Goals Together:
- 90%+ attendance logging rate
- 3+ announcements per week
- <5 minute setup time per session
- Zero duplicate athlete records
- 100% user adoption by Q3

### Your Impact:
Every attendance session logged and announcement sent makes Even Playground better for everyone. Thank you for being an early adopter!

---

**Questions?** Reach out to the development team anytime. We're here to help you succeed! 🚀

**Last Updated:** April 2, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
