#!/bin/bash

# WWFM Test Fix Script
# This script helps fix the failing tests

echo "🔧 Fixing WWFM Form Tests"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the wwfm-platform root directory"
    exit 1
fi

echo "📋 Step 1: Checking environment variables..."
if [ ! -f ".env.test.local" ]; then
    echo "Creating .env.test.local..."
    cat > .env.test.local << 'EOF'
# Test Environment Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUyODMxNSwiZXhwIjoyMDYzMTA0MzE1fQ.arAvRK1WciToeeiIvGQkSv7l4OX5_PpJ3I8fPN_gU7c
TEST_GOAL_ID=56e2801e-0d78-4abd-a795-869e5b780ae7
EOF
    echo "✅ Created .env.test.local"
else
    echo "✅ .env.test.local exists"
fi

echo ""
echo "📋 Step 2: Checking if dev server is running..."
curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Dev server not running!"
    echo ""
    echo "🚀 Starting dev server in background..."
    echo "   (This may take 10-15 seconds)"
    npm run dev > dev-server.log 2>&1 &
    DEV_PID=$!
    echo "   Dev server PID: $DEV_PID"
    
    # Wait for server to be ready
    echo -n "   Waiting for server"
    for i in {1..30}; do
        curl -s http://localhost:3000 > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo " ✅"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    curl -s http://localhost:3000 > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo " ❌"
        echo "Failed to start dev server. Check dev-server.log for errors."
        exit 1
    fi
else
    echo "✅ Dev server is running"
fi

echo ""
echo "📋 Step 3: Running diagnostic script..."
node scripts/diagnose-test-failures.js

echo ""
echo "=========================="
echo "✅ Setup Complete!"
echo "=========================="
echo ""
echo "The tests should work now. If they still fail:"
echo ""
echo "1. Check that all test fixtures have '(Test)' suffix"
echo "2. Verify authentication is working"
echo "3. Look at the test output for specific errors"
echo ""
echo "To run tests manually:"
echo "  npm run test:forms"
echo ""
echo "To run a specific form test:"
echo "  npm run test:forms -- app-form"
