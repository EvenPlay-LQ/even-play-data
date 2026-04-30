# Project Constitution (Even Playground)

## 1. Data Schemas & Blueprint

### 1.1 Auth Confirmation Config (Supabase)
**Issue:** `{"error":"Requested path is invalid"}` happens when Site URL directs users back to the Supabase API itself instead of the frontend.
**Schema Target:**
```json
// Supabase Dashboard -> Authentication -> URL Configuration
{
  "Site URL": "https://even-play.vercel.app", // OR http://localhost:5173
  "Redirect URLs": ["https://even-play.vercel.app/**", "http://localhost:5173/**"]
}
```

### 1.2 Routing Payload (Vercel)
**Issue:** 404 NOT_FOUND on `/buzz` due to missing SPA routing.
**Schema Target:** (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 1.3 Deployment Configuration (GitHub Actions)
**Issue:** `ssh: Could not resolve hostname ftp` because the secret `FTP_SERVER` is malformed.
**Schema Target:** (GitHub Repo Secrets)
```json
{
  "FTP_SERVER": "153.92.8.30", // or "navajowhite-locust-294818.hostingersite.com"
  "FTP_USERNAME": "u248051488.evenplayground.com",
  "FTP_PASSWORD": "your_main_ftp_password"
}
```

### 1.4 Institution Sign-Up Schema
**Issue 1:** `violates check constraint "institutions_institution_type_check"` because the frontend sends `"club"` but the database constraint may not have been updated from the legacy schema (which expected `academy`).
**Issue 2:** `permission denied for schema internal` occurs when executing the upsert, possibly due to a misconfigured RLS policy or trigger that references a restricted schema.
**Issue 3:** Users get "trapped" in the wizard on error because there is no way to cancel/sign out.
**Schema Target:** (`SignupWizard.tsx` & `institutions` table)
```json
// Supabase Database: institutions table constraint
"institutions_institution_type_check": "CHECK (institution_type IN ('school', 'club', 'federation'))"

// Frontend Payload (Institution Setup)
{
  "profile_id": "uuid",
  "institution_name": "string",
  "institution_type": "school | club | federation",
  "province": "string",
  "physical_address": "string",
  "website_url": "string",
  "contact_phone": "string"
}
```

## 2. Behavioral Rules
- Architecture dictates logic; update architecture SOPs before changing code.
- Prioritize reliability over speed.
- Never guess at business logic.
- Self-Repair loop: Analyze -> Patch -> Test -> Update Architecture.

## 3. Architectural Invariants
- 3-Layer Architecture:
  - Layer 1: Architecture (SOPs in `architecture/`)
  - Layer 2: Navigation (Decision Making Module)
  - Layer 3: Tools (`tools/` atomic python/node scripts)
- Environment tokens stored securely in `.env`.
- Use `.tmp/` for intermediate ephemeral states.
- **Hostinger FTP Invariant:** Hostinger's firewall blocks GitHub Action runner IPs on the custom SFTP port (`65002`), causing `Network unreachable`. Workflows MUST use standard FTP on port `21` via `SamKirkland/FTP-Deploy-Action` with `security: loose`. The server secret name must map exactly to `FTP_SERVER`.
