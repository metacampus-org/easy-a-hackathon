# MetaCAMPUS Deployment Guide

**Date:** October 22, 2025  
**Version:** 1.0.0 (Production Ready)  
**Status:** ✅ Ready for Deployment

---

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Git installed locally

---

## Step 1: Initialize Git Repository

```bash
# Navigate to the metacampus directory
cd metacampus

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Production ready MetaCAMPUS v1.0.0"
```

---

## Step 2: Create GitHub Repository

### Option A: Via GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh

# Login to GitHub
gh auth login

# Create repository and push
gh repo create metacampus --public --source=. --remote=origin --push
```

### Option B: Via GitHub Website
1. Go to https://github.com/new
2. Repository name: `metacampus`
3. Description: "Blockchain-powered academic credential management system"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

Then run:
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/metacampus.git

# Push to master
git branch -M master
git push -u origin master
```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI (Fastest)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from metacampus directory)
vercel --prod

# Follow the prompts:
# - Link to existing project? No
# - Project name: metacampus
# - Directory: ./
# - Override settings? No
```

### Option B: Via Vercel Dashboard (Recommended for First Deploy)
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account
4. Find and select `metacampus` repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

6. **Environment Variables** (CRITICAL - Add these):
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

7. Click "Deploy"

---

## Step 4: Verify Deployment

### Check Deployment Status
1. Wait for build to complete (usually 2-3 minutes)
2. Vercel will provide a URL: `https://metacampus.vercel.app` (or similar)
3. Click the URL to open your deployed app

### Test Core Functionality
1. ✅ Landing page loads
2. ✅ Wallet connection works (Pera Wallet)
3. ✅ Student portal accessible
4. ✅ University admin portal accessible
5. ✅ Blockchain transactions work

---

## Environment Variables Explained

### Required Variables (Already Set)
```bash
# Algorand Node Configuration
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_ALGOD_PORT=443
NEXT_PUBLIC_ALGOD_TOKEN=                    # Empty for public node

# Algorand Indexer Configuration
NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_INDEXER_PORT=443
NEXT_PUBLIC_INDEXER_TOKEN=                  # Empty for public node

# Smart Contract App IDs (Deployed on TestNet)
NEXT_PUBLIC_AUTH_APP_ID=733353488           # Authentication contract
NEXT_PUBLIC_BADGE_APP_ID=733353489          # Badge management contract

# Network Configuration
NEXT_PUBLIC_NETWORK=TestNet                 # TestNet or MainNet
```

### Optional Variables
```bash
# Analytics (if using Vercel Analytics)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_id_here

# Custom Domain (if configured)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

### 2. Enable Vercel Analytics (Optional)
1. Go to Vercel Dashboard → Your Project → Analytics
2. Click "Enable Analytics"
3. Free tier includes 100k events/month

### 3. Configure Git Integration
- **Automatic Deployments:** Enabled by default
- **Production Branch:** `master`
- **Preview Deployments:** All other branches
- **Deploy Hooks:** Available in Settings → Git

---

## Continuous Deployment

### Automatic Deployments
Every push to `master` branch will automatically deploy to production:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin master

# Vercel automatically deploys
```

### Preview Deployments
Create a branch for testing:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel creates preview deployment
# URL: https://metacampus-git-feature-new-feature-username.vercel.app
```

---

## Troubleshooting

### Build Fails
**Error:** "Module not found"
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error:** "Environment variable not set"
```bash
# Solution: Add missing env vars in Vercel Dashboard
# Settings → Environment Variables → Add
```

### Runtime Errors
**Error:** "Failed to connect to Algorand node"
```bash
# Check environment variables are set correctly
# Verify NEXT_PUBLIC_ALGOD_SERVER is accessible
# Test: curl https://testnet-api.4160.nodely.dev/health
```

**Error:** "Smart contract not found"
```bash
# Verify app IDs are correct:
# NEXT_PUBLIC_AUTH_APP_ID=733353488
# NEXT_PUBLIC_BADGE_APP_ID=733353489
```

### Wallet Connection Issues
**Error:** "Pera Wallet not connecting"
```bash
# Ensure you're on HTTPS (Vercel provides this automatically)
# Pera Wallet requires secure connection
# Test on mobile device with Pera Wallet app installed
```

---

## Production Checklist

### Before Deploying
- ✅ All tests passing locally
- ✅ Environment variables configured
- ✅ Smart contracts deployed and verified
- ✅ No console errors in browser
- ✅ Wallet connection working
- ✅ All features tested

### After Deploying
- ✅ Deployment successful
- ✅ Site loads correctly
- ✅ Wallet connection works
- ✅ Student portal functional
- ✅ Admin portal functional
- ✅ Blockchain transactions working
- ✅ No console errors

---

## Monitoring & Maintenance

### Vercel Dashboard
- **Deployments:** View all deployments and their status
- **Analytics:** Track page views and performance
- **Logs:** Real-time function logs
- **Speed Insights:** Performance metrics

### Blockchain Monitoring
- **Lora Explorer:** https://lora.algokit.io/testnet
- **Auth Contract:** https://lora.algokit.io/testnet/application/733353488
- **Badge Contract:** https://lora.algokit.io/testnet/application/733353489

---

## Rollback Procedure

If something goes wrong:

### Via Vercel Dashboard
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Via Git
```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Or reset to specific commit
git reset --hard COMMIT_HASH
git push origin master --force
```

---

## Migration to MainNet (Future)

When ready for production on MainNet:

1. **Deploy contracts to MainNet**
   ```bash
   # Update .env.local
   NEXT_PUBLIC_NETWORK=MainNet
   NEXT_PUBLIC_ALGOD_SERVER=https://mainnet-api.4160.nodely.dev
   NEXT_PUBLIC_INDEXER_SERVER=https://mainnet-idx.4160.nodely.dev
   ```

2. **Update App IDs**
   - Deploy auth contract to MainNet
   - Deploy badge contract to MainNet
   - Update `NEXT_PUBLIC_AUTH_APP_ID` and `NEXT_PUBLIC_BADGE_APP_ID`

3. **Test thoroughly on MainNet**
   - Use real ALGO (costs money)
   - Test all features
   - Verify transactions

4. **Update Vercel environment variables**
   - Settings → Environment Variables
   - Update all MainNet values
   - Redeploy

---

## Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Algorand Documentation](https://developer.algorand.org)
- [Pera Wallet Documentation](https://docs.perawallet.app)

### Project Documentation
- [QUICK_START.md](./docs/QUICK_START.md)
- [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)
- [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)

### Community
- Algorand Discord: https://discord.gg/algorand
- Vercel Discord: https://discord.gg/vercel

---

## Security Notes

### Environment Variables
- ✅ All sensitive data in environment variables
- ✅ Never commit `.env.local` to git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate tokens periodically

### Smart Contracts
- ✅ Contracts are immutable once deployed
- ✅ Thoroughly tested before MainNet deployment
- ✅ Use TestNet for development and testing

### Wallet Security
- ✅ Never store private keys in code
- ✅ Use Pera Wallet for secure key management
- ✅ Educate users about wallet security

---

## Cost Estimates

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- **Cost:** $0/month

### Algorand TestNet
- ✅ Free ALGO from faucet
- ✅ Free transactions
- ✅ Free smart contract deployment
- **Cost:** $0/month

### Algorand MainNet (Future)
- Transaction fees: ~0.001 ALGO per transaction
- Smart contract deployment: ~0.1 ALGO per contract
- **Estimated Cost:** $5-20/month depending on usage

---

## Success Metrics

### Performance
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds
- Lighthouse score: > 90

### Reliability
- Uptime: 99.9%
- Error rate: < 0.1%
- Successful transactions: > 99%

### User Experience
- Wallet connection success: > 95%
- Transaction success rate: > 98%
- User satisfaction: High

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** October 22, 2025  
**Status:** Production Ready ✅
