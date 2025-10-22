#!/bin/bash

echo "🧹 Cleaning Next.js build cache..."
rm -rf .next

echo "✅ Cache cleared! Now restart your dev server with:"
echo "   npm run dev"
