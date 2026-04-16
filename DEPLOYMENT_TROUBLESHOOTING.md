# SFTP Deployment Troubleshooting Guide

**Platform:** Even Playground  
**Deployment Target:** Hostinger via SFTP  
**Workflow:** `.github/workflows/hostinger-deploy.yml`

---

## 🔍 Understanding the Deployment Pipeline

```
Git Commit → GitHub → GitHub Actions → Build → SFTP Upload → Hostinger Server
                                                ↑
                                        This is where failures occur
```

**Important:** Git commits and SFTP deployment are separate. A failed SFTP deployment does NOT affect your code in GitHub.

---

## ✅ What Was Improved

The updated workflow now includes:

1. **Manual Trigger**: Can deploy on-demand via GitHub UI
2. **Timeout Protection**: 30-minute limit prevents hanging
3. **Better SFTP Timeouts**: 60s connect, 30s keepalive
4. **Build Verification**: Shows build size before deployment
5. **Error Messages**: Clear troubleshooting hints on failure
6. **npm ci**: Faster, more reliable dependency installation
7. **Workflow Dispatch**: Deploy without pushing code

---

## 🐛 Common SFTP Deployment Issues & Solutions

### Issue 1: Authentication Failed

**Symptoms:**
```
Error: All configured authentication methods failed
Authentication failed
```

**Solutions:**

1. **Verify GitHub Secrets:**
   - Go to: `https://github.com/EvenPlay-LQ/even-play-data/settings/secrets/actions`
   - Check these secrets exist:
     - `FTP_USERNAME`
     - `FTP_PASSWORD`
     - `FTP_SERVER`

2. **Test Credentials Manually:**
   ```bash
   sftp -P 65002 your_username@your_server
   ```

3. **Reset Hostinger SFTP Password:**
   - Log into Hostinger control panel
   - Navigate to: FTP Accounts
   - Reset password
   - Update GitHub secret: `FTP_PASSWORD`

---

### Issue 2: Connection Timeout

**Symptoms:**
```
Error: connect ETIMEDOUT
Connection timed out
```

**Solutions:**

1. **Check Server Address:**
   ```bash
   # Verify FTP_SERVER secret is correct
   # Should be something like: sgp1-ssh.hostinger.com
   ```

2. **Verify Port:**
   - Current port: `65002` (configured in workflow)
   - Hostinger SFTP typically uses port `65002` or `22`
   - Check Hostinger documentation for your plan

3. **Test Connectivity:**
   ```bash
   # From your local machine
   telnet your_server 65002
   
   # Or
   nc -zv your_server 65002
   ```

4. **Check Hostinger Status:**
   - Visit: https://status.hostinger.com
   - Look for ongoing incidents

---

### Issue 3: Permission Denied

**Symptoms:**
```
Error: Permission denied
Cannot create directory
Upload failed
```

**Solutions:**

1. **Verify Remote Path:**
   ```yaml
   remote_path: '/public_html/'  # ← Should exist on Hostinger
   ```

2. **Check SFTP User Permissions:**
   ```bash
   sftp -P 65002 your_username@your_server
   sftp> pwd
   sftp> ls -la
   ```

3. **Ensure Directory Exists:**
   - Log into Hostinger control panel
   - Verify `/public_html/` exists
   - Create if missing

4. **Check Disk Space:**
   - Hostinger dashboard → Check storage usage
   - Free up space if near limit

---

### Issue 4: Transfer Interrupted

**Symptoms:**
```
Error: Connection reset by peer
Transfer interrupted
Broken pipe
```

**Solutions:**

1. **The workflow now handles this with:**
   ```yaml
   args: >-
     -o ConnectTimeout=60
     -o ServerAliveInterval=30
     -o ServerAliveCountMax=3
   ```

2. **If still failing:**
   - Reduce `local_path` to upload fewer files
   - Split deployment into multiple steps
   - Contact Hostinger support about connection limits

---

### Issue 5: Build Fails Before Deployment

**Symptoms:**
```
Error: Build failed
npm ERR! code ELIFECYCLE
```

**Solutions:**

1. **Check Build Logs:**
   - GitHub Actions → Failed workflow → View logs
   - Look for specific error messages

2. **Test Build Locally:**
   ```bash
   npm ci
   npm run build
   ```

3. **Verify Environment Variables:**
   - Ensure all `VITE_SUPABASE_*` secrets are set
   - Check for typos in variable names

---

## 🛠 Manual Deployment (Emergency Backup)

If automated deployment keeps failing, deploy manually:

### Option 1: Using SFTP Command Line

```bash
# 1. Build locally
npm ci
npm run build

# 2. Connect via SFTP
sftp -P 65002 your_username@your_server

# 3. Navigate to public_html
cd /public_html/

# 4. Remove old files (backup first!)
mkdir backup_$(date +%Y%m%d)
mv * backup_$(date +%Y%m%d)/

# 5. Upload new files
put -r dist/* .

# 6. Verify
ls -la
exit
```

### Option 2: Using FileZilla (GUI)

1. **Download FileZilla:** https://filezilla-project.org/

2. **Configure Connection:**
   ```
   Host: sftp://your_server
   Username: your_username
   Password: your_password
   Port: 65002
   ```

3. **Upload:**
   - Left panel: Navigate to `./dist/` folder
   - Right panel: Navigate to `/public_html/`
   - Select all files → Upload

### Option 3: Using rsync (Advanced)

```bash
# Build first
npm run build

# Deploy with rsync over SSH
rsync -avz -e "ssh -p 65002" ./dist/ your_username@your_server:/public_html/
```

---

## 📊 Deployment Verification Checklist

After successful deployment:

- [ ] Workflow shows "Deployment completed successfully"
- [ ] Visit your website: `https://yourdomain.com`
- [ ] Check for 404 errors
- [ ] Verify latest features are live
- [ ] Test user authentication
- [ ] Check browser console for errors
- [ ] Verify PWA functionality (if applicable)

---

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

Add to workflow for detailed logs:

```yaml
- name: 🚀 Deploy to Hostinger (with retry)
  uses: wlixcc/SFTP-Deploy-Action@v1.2.6
  env:
    ACTIONS_RUNNER_DEBUG: true
    ACTIONS_STEP_DEBUG: true
  with:
    # ... existing config
```

### Test SFTP Action Locally

Use [act](https://github.com/nektos/act) to run workflows locally:

```bash
# Install act
brew install act  # macOS
# or
choco install act-cli  # Windows

# Run deployment workflow
act push --secret-file .secrets
```

### Check SFTP Server Logs

If you have server access:

```bash
# Hostinger SFTP logs location (may vary)
tail -f /var/log/sftp.log
tail -f /var/log/auth.log
```

---

## 📞 When to Contact Support

### Contact Hostinger Support If:
- ❌ SFTP connection consistently fails
- ❌ Server appears unreachable
- ❌ Permission issues on remote directory
- ❌ Disk space problems
- ❌ Account suspension or limits

### Contact GitHub Support If:
- ❌ GitHub Actions not triggering
- ❌ Secrets not being read
- ❌ Workflow runner issues
- ❌ Rate limiting on Actions

---

## 🎯 Quick Reference

### GitHub Secrets Required:
| Secret Name | Purpose | Example Value |
|------------|---------|---------------|
| `FTP_USERNAME` | SFTP username | `u123456789` |
| `FTP_PASSWORD` | SFTP password | `your_password` |
| `FTP_SERVER` | SFTP hostname | `sgp1-ssh.hostinger.com` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project | `zkvurokcdlkuygrsfjqr` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJ...` |
| `VITE_SUPABASE_URL` | Supabase URL | `https://...supabase.co` |

### Workflow Configuration:
| Parameter | Current Value | Notes |
|-----------|---------------|-------|
| Port | `65002` | Hostinger SFTP port |
| Remote Path | `/public_html/` | Web root |
| Local Path | `./dist/*` | Build output |
| Connect Timeout | `60s` | Time to establish connection |
| Keepalive Interval | `30s` | Ping frequency |
| Max Keepalive Count | `3` | Max missed pings before disconnect |

---

## 🔄 Recovery Procedures

### Scenario 1: Bad Deployment (Broken Site)

```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Push revert (triggers new deployment)
git push origin main

# OR manually upload backup via SFTP
```

### Scenario 2: Partial Upload (Missing Files)

```bash
# Simply re-run the workflow
# GitHub Actions → Failed workflow → Re-run
```

### Scenario 3: Rollback to Specific Version

```bash
# 1. Find commit hash
git log --oneline

# 2. Checkout specific version
git checkout <commit-hash>

# 3. Deploy manually or push to trigger workflow
git push origin main
```

---

## 📈 Monitoring & Alerts

### Set Up Deployment Notifications

Add to workflow for email/Slack/Discord alerts:

```yaml
- name: 📧 Notify on Discord
  if: failure()
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: '❌ Deployment failed for {{ EVENT_PAYLOAD.repository.full_name }}'

- name: 🎉 Notify on Success
  if: success()
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: '✅ Deployment successful!'
```

### Monitor Workflow Runs

- **GitHub Actions Tab:** https://github.com/EvenPlay-LQ/even-play-data/actions
- **Filter by workflow:** `Deploy to Hostinger via SFTP`
- **Check frequency:** Monitor for repeated failures

---

## 🎓 Best Practices

1. **Always test builds locally before pushing**
   ```bash
   npm ci && npm run build
   ```

2. **Use feature branches, not direct main pushes**
   ```bash
   git checkout -b feature/new-feature
   # ... work ...
   git push origin feature/new-feature
   # Create PR → Merge to main → Triggers deployment
   ```

3. **Keep GitHub secrets updated**
   - Rotate passwords regularly
   - Remove unused secrets
   - Use environment-specific secrets

4. **Monitor deployment logs**
   - Check after every push
   - Set up notifications for failures
   - Don't ignore warnings

5. **Maintain backup strategy**
   - Keep local copies of builds
   - Document rollback procedures
   - Test recovery process

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SFTP-Deploy-Action Documentation](https://github.com/wlixcc/SFTP-Deploy-Action)
- [Hostinger SFTP Guide](https://www.hostinger.com/tutorials/how-to-use-sftp)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v8/commands/npm-ci)

---

**Last Updated:** 2026-04-12  
**Workflow Version:** 2.0 (Improved reliability)  
**Next Review:** After first successful deployment with new workflow
