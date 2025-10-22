# 🚀 Push to GitHub & Deploy - Step by Step

**Date:** October 22, 2025  
**Status:** Ready to Push

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, verify:

- ✅ Codebase cleaned (test/ and contracts/ removed)
- ✅ Documentation updated
- ✅ .gitignore created
- ✅ .env.local NOT in git (sensitive data)
- ✅ Application working locally
- ✅ No console errors

---

## 🔧 Step 1: Initialize Git Repository

Open Terminal and navigate to the metacampus directory:

```bash
# Navigate to project directory
cd /Users/argenisdelarosa/Downloads/web3-meta-campus/metacampus

# Initialize git repository
git init

# Check status
git status
```

**Expected Output:**
```
Initialized empty Git repository in .../metacampus/.git/
```

---

## 📝 Step 2: Stage All Files

```bash
# Add all files to staging
git add .

# Verify what will be committed
git status
```

**Expected Output:**
```
On branch master
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   README.md
        new file:   DEPLOYMENT_GUIDE.md
        ... (many more files)
```

**Important:** Verify that `.env.local` is NOT in the list (should be ignored by .gitignore)

---

## 💾 Step 3: Create Initial Commit

```bash
# Create commit with descriptive message
git commit -m "Initial commit - MetaCAMPUS v1.0.0 Production Ready

- Cleaned codebase (removed test/ and contracts/ directories)
- Updated documentation
- Ready for production deployment
- Smart contracts deployed on Algorand TestNet
- All features tested and working"
```

**Expected Output:**
```
[master (root-commit) abc1234] Initial commit - MetaCAMPUS v1.0.0 Production Ready
 XXX files changed, XXXX insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 ...
```

---

## 🌐 Step 4: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not already installed (macOS)
brew install gh

# Login to GitHub
gh auth login
# Follow the prompts to authenticate

# Create repository and push
gh repo create metacampus \
  --public \
  --source=. \
  --remote=origin \
  --description="Blockchain-powered academic credential management system" \
  --push
```

**Expected Output:**
```
✓ Created repository YOUR_USERNAME/metacampus on GitHub
✓ Added remote https://github.com/YOUR_USERNAME/metacampus.git
✓ Pushed commits to https://github.com/YOUR_USERNAME/metacampus.git
```

### Option B: Using GitHub Website

1. **Go to GitHub:**
   - Open https://github.com/new in your browser

2. **Create Repository:**
   - Repository name: `metacampus`
   - Description: "Blockchain-powered academic credential management system"
   - Visibility: Public (or Private if you prefer)
   - **DO NOT** check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - Click "Create repository"

3. **Push to GitHub:**
   ```bash
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/metacampus.git

   # Verify remote
   git remote -v

   # Push to master branch
   git branch -M master
   git push -u origin master
   ```

**Expected Output:**
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
Delta compression using up to X threads
Compressing objects: 100% (XXX/XXX), done.
Writing objects: 100% (XXX/XXX), XXX KiB | XXX MiB/s, done.
Total XXX (delta XX), reused 0 (delta 0), pack-reused 0
To https://github.com/YOUR_USERNAME/metacampus.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

---

## ✅ Step 5: Verify GitHub Push

1. **Open GitHub Repository:**
   ```
   https://github.com/YOUR_USERNAME/metacampus
   ```

2. **Verify Files:**
   - ✅ README.md displays on homepage
   - ✅ All directories present (app/, components/, lib/, etc.)
   - ✅ .env.local NOT visible (correctly ignored)
   - ✅ Documentation files in docs/

3. **Check Repository Settings:**
   - Go to Settings → General
   - Verify repository name and description
   - Note the repository URL for Vercel

---

## 🚀 Step 6: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
# Follow the prompts to authenticate

# Deploy to production
vercel --prod

# Follow the prompts:
# ? Set up and deploy "~/path/to/metacampus"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? metacampus
# ? In which directory is your code located? ./
```

**Expected Output:**
```
🔍  Inspect: https://vercel.com/your-username/metacampus/...
✅  Production: https://metacampus.vercel.app [copied to clipboard]
```

### Option B: Using Vercel Dashboard (Recommended for First Deploy)

1. **Go to Vercel:**
   - Open https://vercel.com/new

2. **Import Git Repository:**
   - Click "Import Git Repository"
   - Select your GitHub account
   - Find and select `metacampus` repository
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `metacampus`
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
   NEXT_PUBLIC_ALGOD_PORT=443
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.4160.nodely.dev
   NEXT_PUBLIC_INDEXER_PORT=443
   NEXT_PUBLIC_INDEXER_TOKEN=
   NEXT_PUBLIC_AUTH_APP_ID=733353488
   NEXT_PUBLIC_BADGE_APP_ID=733353489
   NEXT_PUBLIC_NETWORK=TestNet
   ```

   **Important:** Add each variable one by one:
   - Name: `NEXT_PUBLIC_ALGOD_SERVER`
   - Value: `https://testnet-api.4160.nodely.dev`
   - Click "Add"
   - Repeat for all variables

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

---

## 🎉 Step 7: Verify Deployment

1. **Check Build Status:**
   - Vercel will show build progress
   - Wait for "Building" → "Completed"

2. **Open Deployed Site:**
   - Click the deployment URL (e.g., `https://metacampus.vercel.app`)
   - Or click "Visit" button

3. **Test Core Features:**
   - ✅ Landing page loads
   - ✅ Click "Connect Wallet" (should open Pera Wallet)
   - ✅ Navigate to Student Portal
   - ✅ Navigate to University Admin Portal
   - ✅ Check browser console for errors (should be none)

---

## 🔄 Step 8: Set Up Continuous Deployment

Continuous deployment is automatically enabled! Every push to master will deploy:

```bash
# Make a change
echo "# MetaCAMPUS" >> test.md

# Commit and push
git add test.md
git commit -m "Test continuous deployment"
git push origin master

# Vercel automatically deploys!
# Check: https://vercel.com/your-username/metacampus
```

---

## 📊 Post-Deployment Checklist

### Verify Everything Works

- ✅ **Landing Page:** Loads correctly
- ✅ **Wallet Connection:** Pera Wallet connects
- ✅ **Student Portal:** Accessible and functional
- ✅ **University Admin:** Can onboard students
- ✅ **Badge System:** Can request and approve badges
- ✅ **Blockchain:** Transactions work on TestNet
- ✅ **No Errors:** Browser console is clean

### Configure Vercel Settings

1. **Custom Domain (Optional):**
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Follow DNS instructions

2. **Enable Analytics:**
   - Vercel Dashboard → Your Project → Analytics
   - Click "Enable Analytics"

3. **Configure Git Integration:**
   - Settings → Git
   - Production Branch: `master`
   - Automatic Deployments: Enabled

---

## 🎯 Quick Reference

### Repository URL
```
https://github.com/YOUR_USERNAME/metacampus
```

### Deployment URL
```
https://metacampus.vercel.app
(or your custom domain)
```

### Smart Contracts
```
Auth Contract: 733353488
Badge Contract: 733353489
Network: Algorand TestNet
```

### Useful Commands
```bash
# Check git status
git status

# View commit history
git log --oneline

# Push changes
git add .
git commit -m "Your message"
git push origin master

# View Vercel deployments
vercel ls

# View deployment logs
vercel logs
```

---

## 🆘 Troubleshooting

### Git Push Fails

**Error:** "Permission denied"
```bash
# Solution: Check GitHub authentication
gh auth status

# Re-authenticate if needed
gh auth login
```

**Error:** "Remote already exists"
```bash
# Solution: Remove and re-add remote
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/metacampus.git
```

### Vercel Build Fails

**Error:** "Module not found"
```bash
# Solution: Ensure all dependencies are installed
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error:** "Environment variable not set"
```bash
# Solution: Add missing variables in Vercel Dashboard
# Settings → Environment Variables → Add
```

### Deployment Works but App Doesn't

**Issue:** Wallet won't connect
```
# Check:
1. Are you on HTTPS? (Vercel provides this automatically)
2. Are environment variables set correctly?
3. Is Pera Wallet installed?
4. Try on mobile device with Pera Wallet app
```

**Issue:** "Smart contract not found"
```
# Verify in Vercel Dashboard → Settings → Environment Variables:
NEXT_PUBLIC_AUTH_APP_ID=733353488
NEXT_PUBLIC_BADGE_APP_ID=733353489
```

---

## 📞 Need Help?

- **GitHub Issues:** https://github.com/YOUR_USERNAME/metacampus/issues
- **Vercel Support:** https://vercel.com/support
- **Algorand Discord:** https://discord.gg/algorand

---

## ✅ Success!

If you've completed all steps:

1. ✅ Code is on GitHub
2. ✅ Deployed to Vercel
3. ✅ Application is live
4. ✅ Continuous deployment enabled
5. ✅ All features working

**Congratulations! Your MetaCAMPUS application is now live! 🎉**

---

**Next Steps:**
- Share your deployment URL
- Test with real users
- Monitor Vercel analytics
- Plan MainNet migration

**Deployment URL:** `https://metacampus.vercel.app`

---

**Guide Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** Ready to Deploy ✅
