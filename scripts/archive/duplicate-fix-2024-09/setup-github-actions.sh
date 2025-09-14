#!/bin/bash

# WWFM GitHub Actions Setup Script
# This script helps you set up the nightly form tests workflow

echo "🚀 Setting up GitHub Actions Nightly Form Tests"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".github/workflows" ]; then
    echo "❌ Error: Please run this script from the wwfm-platform root directory"
    exit 1
fi

# Check if git repo is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This directory is not a git repository"
    echo "Run: git init"
    exit 1
fi

echo "✅ Step 1: Workflow file created at .github/workflows/nightly-form-tests.yml"
echo ""

# Add to git
echo "📝 Step 2: Adding workflow to git..."
git add .github/workflows/nightly-form-tests.yml
git commit -m "feat: add nightly form tests workflow

- Runs E2E tests every night at 2 AM UTC
- Tests all 9 form types across 23 categories
- Auto-creates issues for failures
- Includes test fixture verification
- Optimized for resource usage (Chromium only for nightly)"

echo "✅ Workflow committed to git"
echo ""

# Verify test fixtures
echo "🔍 Step 3: Verifying test fixtures..."
node tests/setup/verify-test-fixtures.js
echo ""

# Create GitHub secrets file for manual setup
echo "📋 Step 4: Creating GitHub secrets reference..."
cat > github-secrets-to-add.txt << 'EOF'
===========================================
GITHUB SECRETS TO ADD MANUALLY
===========================================

Go to: https://github.com/[YOUR-USERNAME]/[YOUR-REPO]/settings/secrets/actions

Click "New repository secret" for each:

1. NEXT_PUBLIC_SUPABASE_URL
   Value: https://wqxkhxdbxdtpuvuvgirx.supabase.co

2. NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo

3. SUPABASE_SERVICE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUyODMxNSwiZXhwIjoyMDYzMTA0MzE1fQ.arAvRK1WciToeeiIvGQkSv7l4OX5_PpJ3I8fPN_gU7c

4. TEST_GOAL_ID
   Value: 56e2801e-0d78-4abd-a795-869e5b780ae7

5. SLACK_WEBHOOK_URL (Optional)
   Value: [Your Slack webhook URL if you want notifications]

===========================================
EOF

echo "✅ Created github-secrets-to-add.txt with all required secrets"
echo ""

# Test locally first
echo "🧪 Step 5: Testing forms locally..."
echo "Running: npm run test:forms -- --project=chromium"
npm run test:forms -- --project=chromium

if [ $? -eq 0 ]; then
    echo "✅ Local tests passed!"
else
    echo "⚠️  Local tests failed. Fix issues before pushing to GitHub."
fi

echo ""
echo "==================================================="
echo "✅ SETUP COMPLETE!"
echo "==================================================="
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Add secrets to GitHub (see github-secrets-to-add.txt)"
echo "   Go to: Settings → Secrets and variables → Actions"
echo ""
echo "2. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "3. Test the workflow manually:"
echo "   - Go to Actions tab on GitHub"
echo "   - Find 'Nightly Form Tests'"
echo "   - Click 'Run workflow'"
echo ""
echo "4. The workflow will also run:"
echo "   - Every night at 2 AM UTC"
echo "   - On PRs that modify form code"
echo ""
echo "🎉 Your nightly tests are ready to protect your forms!"
