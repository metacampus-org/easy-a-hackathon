#!/bin/bash

echo "🚀 MetaCAMPUS Environment Setup Script"
echo "======================================"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Your existing .env.local was not modified."
        exit 0
    fi
fi

# Check if .env.example exists
if [ ! -f .env.example ]; then
    echo "❌ Error: .env.example not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Copy template
echo "📋 Copying .env.example to .env.local..."
cp .env.example .env.local

echo ""
echo "✅ .env.local created!"
echo ""
echo "📝 Now you need to edit .env.local with YOUR values:"
echo ""
echo "Required changes:"
echo "  1. NEXT_PUBLIC_SUPER_ADMIN_WALLET - Your Pera Wallet address (58 characters)"
echo "  2. DB_PASSWORD - Your PostgreSQL password"
echo ""
echo "Optional changes:"
echo "  3. DB_USER - PostgreSQL username (default: postgres)"
echo "  4. DB_NAME - Database name (default: metacampus_db)"
echo ""
echo "Values already set correctly:"
echo "  ✅ NEXT_PUBLIC_ALGOD_URL (using free public node)"
echo "  ✅ NEXT_PUBLIC_INDEXER_URL (using free public indexer)"
echo "  ✅ NEXT_PUBLIC_ALGORAND_NETWORK (testnet)"
echo "  ✅ NEXT_PUBLIC_APP_ID (set to 0, update after deployment)"
echo ""
echo "Edit the file:"
echo "  nano .env.local"
echo "  # or"
echo "  code .env.local"
echo ""
echo "After editing, start the dev server:"
echo "  npm run dev"
echo ""
