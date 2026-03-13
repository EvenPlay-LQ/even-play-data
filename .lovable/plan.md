

# Phase 3-5: Modular Config System + Final Polish

## What Will Be Done

Extract all hardcoded constants from page components into centralized config files, fix the level names inconsistency, and do final cleanup.

## Files to Create

### `src/config/constants.ts`
Centralized shared constants:
- **`LEVEL_NAMES`** -- unified map (currently inconsistent between `AthleteDashboard` lines 8-11 and `ZonePage` lines 20-23). Will use the AthleteDashboard version (Rookie, Beginner, Developing, Competitive, Starter, Advanced, Elite, Provincial, National Prospect, Professional).
- **`ICON_MAP`** -- achievement icon lookup (currently in `AthleteDashboard` lines 14-16)
- **`BUZZ_CATEGORIES`** -- post category tabs (currently in `BuzzPage` line 8)
- **`SPORT_OPTIONS`** -- sport filter list (currently in `ZonePage` lines 103-108)
- **`XP_TO_NEXT_LEVEL`** -- function `(level) => (level + 1) * 600` (currently in `AthleteDashboard` line 88)

### `src/config/landing.ts`
Landing page marketing content:
- **`LANDING_STATS`** -- the 4 stat items (lines 10-15)
- **`WHY_JOIN_CARDS`** -- the 4 persona cards (lines 17-42)
- **`FEATURE_SECTIONS`** -- the 3 feature previews (lines 44-60)
- **`FOOTER_LINKS`** -- quick links, athlete links, support links (lines 298-319)

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/AthleteDashboard.tsx` | Import `LEVEL_NAMES`, `ICON_MAP`, `xpToNextLevel` from config, remove local definitions |
| `src/pages/ZonePage.tsx` | Import `LEVEL_NAMES`, `SPORT_OPTIONS` from config, remove local `levelNames` |
| `src/pages/BuzzPage.tsx` | Import `BUZZ_CATEGORIES` from config, remove local `categories` |
| `src/pages/LandingPage.tsx` | Import `LANDING_STATS`, `WHY_JOIN_CARDS`, `FEATURE_SECTIONS`, `FOOTER_LINKS` from config, remove local arrays |

## Key Fix

The level names inconsistency between AthleteDashboard and ZonePage will be resolved by both importing from one source. Using the AthleteDashboard naming (Rookie -> Beginner -> Developing -> Competitive -> Starter -> Advanced -> Elite -> Provincial -> National Prospect -> Professional).

## No Database Changes

This is purely a frontend refactor -- no migrations, no seed data changes.

