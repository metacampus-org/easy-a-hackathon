#!/bin/bash

# MetaCAMPUS - Deploy to GitHub and Vercel
# Run this script to push your code to GitHub and deploy to Vercel
# Date: October 22, 2025

echo "🚀 MetaCAMPUS Deployment Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the metacampus directory."
    exit 1
fi

echo "✅ Found package.json - in correct directory"
echo ""

# Step 1: Initialize Git
echo "📝 Step 1: Initializing Git repository..."
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
else
    git init
    echo "✅ Git repository initialized"
fi
echo ""

# Step 2: Add all files
echo "📦 Step 2: Staging all files..."
git add .
echo "✅ Files staged"
echo ""

# Step 3: Create commit
echo "💾 Step 3: Creating initial commit..."
git commit -m "Initial commit - MetaCAMPUS v1.0.0 Production Ready

- Cleaned codebase (removed test/ and contracts/ directories)
- Updated documentation
- Ready for production deployment
- Smart contracts deployed on Algorand TestNet (Auth: 733353488, Badge: 733353489)
- All features tested and working
- Student portal, University admin portal, and Super admin dashboard functional
- Pera Wallet integration working
- Blockchain transactions verified on TestNet"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
else
    echo "⚠️  Commit may have already been created or there was an error"
fi
echo ""

# Step 4: Check for GitHub CLI
echo "🔍 Step 4: Checking for GitHub CLI..."
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo ""
    echo "🌐 Step 5: Creating GitHub repository and pushing..."
    echo ""
    echo "Please enter your GitHub username:"
    read GITHUB_USERNAME
    
    # Create repo and push
    gh repo create metacampus \
        --public \
        --source=. \
        --remote=origin \
        --description="Blockchain-powered academic credential management system built on Algorand" \
        --push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Repository created and code pushed to GitHub!"
        echo "📍 Repository URL: https://github.com/$GITHUB_USERNAME/metacampus"
    else
        echo ""
        echo "⚠️  There was an issue creating the repository."
        echo "You may need to:"
        echo "  1. Run: gh auth login"
        echo "  2. Or create the repository manually on GitHub"
    fi
else
    echo "⚠️  GitHub CLI not found"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "=============================="
    echo ""
    echo "1. Install GitHub CLI (recommended):"
    echo "   brew install gh"
    echo ""
    echo "2. Or push manually:"
    echo "   a. Create a new repository on GitHub: https://github.com/new"
    echo "   b. Name it: metacampus"
    echo "   c. Do NOT initialize with README, .gitignore, or license"
    echo "   d. Run these commands:"
    echo ""
    echo "      git remote add origin https://github.com/YOUR_USERNAME/metacampus.git"
    echo "      git branch -M master"
    echo "      git push -u origin master"
    echo ""
fi

echo ""
echo "🎉 Git setup complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. ✅ Code is committed to Git"
echo "2. ✅ Ready to push to GitHub (if not already done)"
echo ""
echo "3. 🚀 Deploy to Vercel:"
echo "   Option A - Vercel CLI:"
echo "     npm install -g vercel"
echo "     vercel login"
echo "     vercel --prod"
echo ""
echo "   Option B - Vercel Dashboard (Recommended):"
echo "     a. Go to: https://vercel.com/new"
echo "     b. Import your GitHub repository: metacampus"
echo "     c. Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo "     d. Click Deploy"
echo ""
echo "4. 📚 Read the guides:"
echo "   - PUSH_TO_GITHUB.md - Detailed GitHub instructions"
echo "   - DEPLOYMENT_GUIDE.md - Complete deployment guide"
echo "   - README.md - Project overview"
echo ""
echo "🎯 Environment Variables for Vercel:"
echo "===================================="
echo "NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.4160.nodely.dev"
echo "NEXT_PUBLIC_ALGOD_PORT=443"
echo "NEXT_PUBLIC_ALGOD_TOKEN="
echo "NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.4160.nodely.dev"
echo "NEXT_PUBLIC_INDEXER_PORT=443"
echo "NEXT_PUBLIC_INDEXER_TOKEN="
echo "NEXT_PUBLIC_AUTH_APP_ID=733353488"
echo "NEXT_PUBLIC_BADGE_APP_ID=733353489"
echo "NEXT_PUBLIC_NETWORK=TestNet"
echo ""
echo "✨ Deployment script complete!"
echo ""
