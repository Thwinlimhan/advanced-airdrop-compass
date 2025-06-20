#!/bin/bash

# Quick Fix Script for Advanced Crypto Airdrop Compass
# This script applies the critical fixes to get the project running

echo "🔧 Applying critical fixes to Advanced Crypto Airdrop Compass..."

PROJECT_DIR="/workspace/user_input_files"

# 1. Backup original files
echo "📋 Creating backups..."
cp "$PROJECT_DIR/package.json" "$PROJECT_DIR/package.json.backup"
cp "$PROJECT_DIR/vite.config.ts" "$PROJECT_DIR/vite.config.ts.backup"

# 2. Apply fixed package.json
echo "📦 Fixing package.json..."
cp "/workspace/fixed_package.json" "$PROJECT_DIR/package.json"

# 3. Apply fixed vite.config.ts
echo "⚙️ Fixing vite.config.ts..."
cp "/workspace/fixed_vite.config.ts" "$PROJECT_DIR/vite.config.ts"

# 4. Add ESLint configuration
echo "🔍 Adding ESLint configuration..."
cp "/workspace/.eslintrc.json" "$PROJECT_DIR/.eslintrc.json"

# 5. Update README
echo "📖 Updating README..."
cp "/workspace/enhanced_README.md" "$PROJECT_DIR/README.md"

# 6. Create .env.local template if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo "🔐 Creating .env.local template..."
    cat > "$PROJECT_DIR/.env.local" << EOF
# Google Gemini API Key for AI features
GEMINI_API_KEY=your_api_key_here

# Backend API URL (optional, defaults to localhost:3001)
API_BASE_URL=http://localhost:3001/api/v1
EOF
fi

echo "✅ Fixes applied successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. cd $PROJECT_DIR"
echo "2. Add your Gemini API key to .env.local"
echo "3. npm install"
echo "4. npm run dev"
echo ""
echo "📊 For comprehensive upgrade recommendations, see:"
echo "   /workspace/crypto_airdrop_compass_review_report.md"

# Make the script executable
chmod +x "/workspace/quick_fix_script.sh"
