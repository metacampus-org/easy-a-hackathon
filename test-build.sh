#!/bin/bash

echo "Testing production build to bypass SWC dev mode issues..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! The files are valid."
    echo "You can run 'npm start' to test the production build."
else
    echo "❌ Build failed. There may be actual syntax errors."
fi
