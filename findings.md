# B.L.A.S.T. Findings - Session: Diagnosing Deployment Blank Screen

## Initial Context
- **Domain:** evenplayground.com
- **Hosting:** Hostinger (via GitHub Actions FTP)
- **Framework:** Vite + React + TypeScript
- **Status:** Successful push, but site shows a blank screen.

## Discoveries
- User cleared `public_html` manually, but new deployment still results in blank screen.
- Screenshot shows `evenplayground.com` with a title "Even Playground" but no content (white screen).
- Hostinger file manager shows a list of files (from screenshot).
- **CRITICAL DISCOVERY:** The file manager shows the *entire project root* (e.g., `.git`, `src`, `node_modules`, `dist`) is present in the production environment. This indicates the deployment is uploading the root instead of (or in addition to) the `dist` contents.
- **Manual Access:** FTP client (FileZilla) is set up and working for manual file management.

## Constraints
- Hostinger FTP requires standard FTP (port 21) due to firewall.
- Must use `SamKirkland/FTP-Deploy-Action`.

## Root Causes Identified
1. **Missing public assets:** The `public/` directory was not being copied to the `dist/` folder during build. The `vite.config.ts` did not explicitly set `publicDir: "public"`.
2. **Missing SPA routing:** The Hostinger server needs a `_redirects` file for client-side routing to work (Vercel-style rewrites).

## Solutions Applied
1. **vite.config.ts:** Added explicit `publicDir: "public"` to ensure static assets are copied to dist.
2. **public/_redirects:** Created a Netlify/Vercel-compatible redirect file for SPA routing:
   ```
   /*    /index.html   200
   ```
3. **.htaccess:** The existing `.htaccess` file should be checked for Apache mod_rewrite rules.

## Next Steps
- Run a new deployment to test the fixes
- Verify static assets (manifest.json, favicon) load correctly
- Verify client-side routing works
