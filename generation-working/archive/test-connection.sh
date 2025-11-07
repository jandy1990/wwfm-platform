#!/bin/bash

# Quick connection test for Claude Web
# Tests Supabase REST API access and checks existing solutions

echo "🔍 Testing Supabase connection..."
echo ""

SUPABASE_URL="https://wqxkhxdbxdtpuvuvgirx.supabase.co"
SERVICE_KEY="sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX"
GOAL_ID="56e2801e-0d78-4abd-a795-869e5b780ae7"

# Test 1: Basic connection
echo "Test 1: Basic connection to Supabase..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "${SUPABASE_URL}/rest/v1/solutions?limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

if [ "$response" = "200" ]; then
  echo "✅ Connection successful (HTTP $response)"
else
  echo "❌ Connection failed (HTTP $response)"
  exit 1
fi

echo ""

# Test 2: Check existing solutions for goal
echo "Test 2: Checking existing solutions for 'Reduce anxiety' goal..."
solutions=$(curl -s \
  -X GET "${SUPABASE_URL}/rest/v1/goal_implementation_links?goal_id=eq.${GOAL_ID}&select=*,solution_variants(solution_id,solutions(title,solution_category))" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

count=$(echo "$solutions" | grep -o "\"title\":" | wc -l)

echo "Found $count existing solutions for this goal"
echo ""

if [ "$count" -gt 0 ]; then
  echo "⚠️  WARNING: Goal already has solutions! Should be 0 after deletion."
  echo "First 3 solutions:"
  echo "$solutions" | grep -o '"title":"[^"]*"' | head -3
else
  echo "✅ Goal is clear - ready for fresh generation"
fi

echo ""
echo "Connection tests complete!"
echo ""
echo "Next steps:"
echo "1. If tests passed, proceed with solution generation"
echo "2. Use curl commands from SUPABASE_CONNECTION_GUIDE.md"
echo "3. Or use psql for direct SQL access"
