

# Fix Build Errors and Align Frontend with Backend

## Changes

### 1. `src/pages/dashboard/athlete/AthleteHighlights.tsx`
- Line 48: `as MediaItem[]` → `as unknown as MediaItem[]`
- Line 87: `as MediaItem` → `as unknown as MediaItem`

### 2. `src/pages/dashboard/athlete/AthleteProfilePage.tsx`
- Line 76: `as ClubHistoryEntry[]` → `as unknown as ClubHistoryEntry[]`
- Line 106: `as ClubHistoryEntry` → `as unknown as ClubHistoryEntry`
- Line 84: Remove the silent `if (!athlete || !profile) return;` guard -- replace with error toast so users get feedback if data is missing

### 3. `src/pages/SignupWizard.tsx`
- Rename `city` state to use `province` terminology
- Line 102: Change `city: city || null` to `province: city || null` in the institutions upsert
- Update the UI label from "City / Location" to "Province / Region"

All three files, four type cast fixes, one field name fix, one UX improvement. No new files.

