# 🔧 Fix Vercel Deployment Issues

**Date:** October 22, 2025  
**Issue:** Vercel deploying from wrong branch (`main` instead of `master`)  
**Status:** Ready to Fix

---

## 🎯 Current Situation

### Repository Status
- **Repository:** `metacampus-org/easy-a-hackathon`
- **Your cleaned code:** On `master` branch ✅
- **Old code:** On `main` branch (and other branches)
- **Vercel:** Currently deploying from `main` (wrong branch)

### Available Branches
```
AI_Agent
BRANCH
algo-integration
ehu_ai
ehu_easyA
frontend
main          ← Old code (Vercel is using this)
master        ← Your cleaned code (Should use this)
smart-contracts
```

---

## 🚀 Solution: Fix Vercel to Deploy from Master

### Option 1: Change Production Branch in Vercel (Recommended)

1. **Go to Vercel Dashboard:**
   - Open https://vercel.com/dashboard
   - Click on your `easy-a-hackathon` project

2. **Go to Settings → Git:**
   - Click "Settings" tab
   - Click "Git" in left sidebar

3. **Change Production Branch:**
   - Find "Production Branch" section
   - Change from `main` to `master`
   - Click "Save"

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click "Redeploy" button
   - Or it will auto-deploy from master

---

### Option 2: Update `main` Branch to Match `master`

If you want to keep `main` as the production branch:

```bash
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus

# Fetch all branches
git fetch origin

# Checkout main branch
git checkout -b main origin/main

# Reset main to match master
git reset --hard master

# Force push to update main
git push origin main --force

# Switch back to master
git checkout master
```

**Warning:** This will overwrite the old `main` branch with your cleaned code.

---

### Option 3: Delete Old Branches and Keep Only Master

Clean up the repository:

```bash
# Make sure you're on master
git checkout master

# Delete main branch locally (if it exists)
git branch -D main

# Delete main branch on remote
git push origin --delete main

# Vercel will automatically switch to master
```

---

## 🔍 Verify Deployment

After fixing the branch:

1. **Check Vercel Dashboard:**
   - Go to Deployments
   - Latest deployment should show "master" branch
   - Build should succeed

2. **Check Build Logs:**
   - Click on the deployment
   - Check "Building" logs
   - Should show Next.js build succeeding

3. **Test the Site:**
   - Open deployment URL
   - Landing page should load
   - Connect wallet should work
   - No console errors

---

## 📋 Common Deployment Issues & Fixes

### Issue 1: Build Fails - "Module not found"

**Cause:** Missing dependencies or wrong directory structure

**Fix:**
```bash
# Ensure package.json is at root
ls -la package.json

# If missing, you're in wrong directory
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus

# Verify node_modules exists
ls -la node_modules

# If missing, install
npm install
```

---

### Issue 2: Build Fails - "Environment variables not set"

**Cause:** Missing environment variables in Vercel

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all 9 variables are set:
   ```
   NEXT_PUBLIC_ALGOD_SERVER
   NEXT_PUBLIC_ALGOD_PORT
   NEXT_PUBLIC_ALGOD_TOKEN
   NEXT_PUBLIC_INDEXER_SERVER
   NEXT_PUBLIC_INDEXER_PORT
   NEXT_PUBLIC_INDEXER_TOKEN
   NEXT_PUBLIC_AUTH_APP_ID
   NEXT_PUBLIC_BADGE_APP_ID
   NEXT_PUBLIC_NETWORK
   ```
3. Click "Redeploy"

---

### Issue 3: Build Succeeds but App Doesn't Work

**Cause:** Wrong branch deployed (old code)

**Fix:**
- Change production branch to `master` (see Option 1 above)
- Redeploy

---

### Issue 4: "Root Directory" Wrong in Vercel

**Cause:** Vercel looking in subdirectory

**Fix:**
1. Go to Vercel Dashboard → Settings → General
2. Find "Root Directory"
3. Should be: `./` (root)
4. If it shows something else (like `frontend/`), change to `./`
5. Click "Save"
6. Redeploy

---

## 🎯 Quick Fix Commands

### If you want to use `master` branch (Recommended):

```bash
# 1. Ensure you're on master
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus
git checkout master

# 2. Verify your code is there
ls -la package.json  # Should exist

# 3. Push to master (if not already)
git push origin master

# 4. In Vercel Dashboard:
#    Settings → Git → Production Branch → Change to "master" → Save
```

---

### If you want to update `main` branch:

```bash
# 1. Update main to match master
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus
git checkout master
git branch -D main  # Delete local main
git checkout -b main  # Create new main from master
git push origin main --force  # Update remote main

# 2. Vercel will auto-deploy from main
```

---

## 📊 Verify Everything is Correct

### Check Local Setup:
```bash
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus

# Should show master
git branch

# Should show your cleaned code commit
git log --oneline -1

# Should show package.json at root
ls -la package.json

# Should show Next.js config
ls -la next.config.mjs
```

### Check GitHub:
1. Go to https://github.com/metacampus-org/easy-a-hackathon
2. Switch to `master` branch
3. Verify you see:
   - ✅ README.md (your new one)
   - ✅ CLEANUP_COMPLETE.md
   - ✅ DEPLOYMENT_GUIDE.md
   - ✅ app/ directory
   - ✅ components/ directory
   - ✅ lib/ directory
   - ❌ test/ directory (should be gone)
   - ❌ contracts/ directory (should be gone)

### Check Vercel:
1. Go to https://vercel.com/dashboard
2. Click your project
3. Check "Deployments" tab
4. Latest deployment should show:
   - ✅ Branch: `master` (or `main` if you updated it)
   - ✅ Status: Ready (green checkmark)
   - ✅ Build time: ~2-3 minutes

---

## 🆘 Still Having Issues?

### Get Build Logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click on failed deployment
3. Click "Building" to see logs
4. Look for error messages

### Common Error Messages:

**"Cannot find module"**
- Missing dependency in package.json
- Wrong root directory

**"Build failed"**
- Check build logs for specific error
- Verify environment variables

**"Deployment failed"**
- Check if branch exists
- Verify repository access

---

## ✅ Success Checklist

After fixing:

- ✅ Vercel deploying from correct branch (`master`)
- ✅ Build succeeds (green checkmark)
- ✅ Deployment URL loads
- ✅ Landing page displays correctly
- ✅ Wallet connection works
- ✅ No console errors
- ✅ Environment variables set
- ✅ All features functional

---

## 🎯 Recommended Action

**Do this now:**

1. **In Vercel Dashboard:**
   - Settings → Git → Production Branch → Change to `master` → Save

2. **Redeploy:**
   - Deployments → Click "Redeploy" on latest deployment

3. **Wait 2-3 minutes** for build to complete

4. **Test the deployment URL**

That's it! Your cleaned code on `master` branch will be deployed. 🚀

---

**Guide Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** Ready to Fix ✅
