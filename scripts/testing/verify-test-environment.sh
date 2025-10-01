#!/bin/bash

# WWFM Test Environment Verification Script
# Run this before executing any tests to ensure environment is ready

set -e

echo "🔍 WWFM Test Environment Verification"
echo "======================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Kill existing Next.js servers
echo -e "\n1. Checking for existing Next.js servers..."
if pgrep -f "next dev" > /dev/null; then
  echo -e "${YELLOW}⚠️  Found running Next.js servers${NC}"
  echo "   Killing processes..."
  pkill -f "next dev" || true
  sleep 2
  if pgrep -f "next dev" > /dev/null; then
    echo -e "${RED}❌ Failed to kill Next.js servers${NC}"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✅ Servers stopped${NC}"
  fi
else
  echo -e "${GREEN}✅ No existing servers found${NC}"
fi

# Check 2: Verify port 3000 is free
echo -e "\n2. Checking port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
  PID=$(lsof -ti:3000)
  echo -e "${RED}❌ Port 3000 is in use by PID $PID${NC}"
  echo "   Run: lsof -ti:3000 | xargs kill -9"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Port 3000 is free${NC}"
fi

# Check 3: Clear Next.js cache
echo -e "\n3. Clearing Next.js cache..."
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✅ Cache cleared${NC}"
else
  echo -e "${GREEN}✅ No cache to clear${NC}"
fi

# Check 4: Verify Supabase is running
echo -e "\n4. Checking Supabase status..."
if supabase status > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Supabase is running${NC}"

  # Check 5: Verify database connection
  echo -e "\n5. Checking database connection..."
  if PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"

    # Check 6: Verify reference data
    echo -e "\n6. Checking reference data..."
    ARENAS=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM arenas;" 2>/dev/null | xargs)
    CATEGORIES=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM categories;" 2>/dev/null | xargs)
    GOALS=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM goals WHERE id = '56e2801e-0d78-4abd-a795-869e5b780ae7';" 2>/dev/null | xargs)

    if [ "$ARENAS" = "0" ] || [ -z "$ARENAS" ]; then
      echo -e "${RED}❌ Arenas table is empty (found: $ARENAS)${NC}"
      echo "   Your database restore is INCOMPLETE!"
      echo "   Restore a complete dump with: npm run test:db:start && psql ..."
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${GREEN}✅ Arenas table has data (count: $ARENAS)${NC}"
    fi

    if [ "$CATEGORIES" = "0" ] || [ -z "$CATEGORIES" ]; then
      echo -e "${RED}❌ Categories table is empty (found: $CATEGORIES)${NC}"
      echo "   Your database restore is INCOMPLETE!"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${GREEN}✅ Categories table has data (count: $CATEGORIES)${NC}"
    fi

    if [ "$GOALS" = "0" ] || [ -z "$GOALS" ]; then
      echo -e "${RED}❌ Test goal not found${NC}"
      echo "   Goal ID: 56e2801e-0d78-4abd-a795-869e5b780ae7"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${GREEN}✅ Test goal exists${NC}"
    fi

    # Check 7: Verify test fixtures
    echo -e "\n7. Checking test fixtures..."
    FIXTURES=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM solutions WHERE source_type = 'test_fixture';" 2>/dev/null | xargs)

    if [ "$FIXTURES" = "0" ] || [ -z "$FIXTURES" ]; then
      echo -e "${YELLOW}⚠️  No test fixtures found${NC}"
      echo "   Run: npm run test:db:seed"
    elif [ "$FIXTURES" -lt "23" ]; then
      echo -e "${YELLOW}⚠️  Only $FIXTURES test fixtures found (expected 23)${NC}"
      echo "   Run: npm run test:db:seed"
    else
      echo -e "${GREEN}✅ Test fixtures ready (count: $FIXTURES)${NC}"
    fi

    # Check 8: Verify test user
    echo -e "\n8. Checking test user..."
    USER_EXISTS=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM auth.users WHERE email = 'test@wwfm-platform.com';" 2>/dev/null | xargs)

    if [ "$USER_EXISTS" = "0" ] || [ -z "$USER_EXISTS" ]; then
      echo -e "${YELLOW}⚠️  Test user not found${NC}"
      echo "   Run: npm run test:setup"
    else
      CONFIRMED=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM auth.users WHERE email = 'test@wwfm-platform.com' AND confirmed_at IS NOT NULL;" 2>/dev/null | xargs)

      if [ "$CONFIRMED" = "0" ]; then
        echo -e "${YELLOW}⚠️  Test user exists but not confirmed${NC}"
        echo "   Confirming user..."
        PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "UPDATE auth.users SET confirmed_at = NOW(), email_confirmed_at = NOW() WHERE email = 'test@wwfm-platform.com';" > /dev/null
        echo -e "${GREEN}✅ Test user confirmed${NC}"
      else
        echo -e "${GREEN}✅ Test user ready${NC}"
      fi
    fi

  else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    ERRORS=$((ERRORS + 1))
  fi

else
  echo -e "${RED}❌ Supabase is not running${NC}"
  echo "   Run: npm run test:db:start"
  ERRORS=$((ERRORS + 1))
fi

# Check 9: Verify .env.test.local
echo -e "\n9. Checking .env.test.local..."
if [ -f ".env.test.local" ]; then
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.test.local && \
     grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.test.local && \
     grep -q "SUPABASE_SERVICE_KEY" .env.test.local; then
    echo -e "${GREEN}✅ Environment file is configured${NC}"
  else
    echo -e "${RED}❌ Environment file is missing required keys${NC}"
    echo "   Run: npm run test:db:start (regenerates .env.test.local)"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}❌ .env.test.local not found${NC}"
  echo "   Run: npm run test:db:start"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo -e "\n======================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Environment is ready for testing.${NC}"
  echo -e "\nYou can now run:"
  echo "  npm run test:forms:chromium"
  exit 0
else
  echo -e "${RED}❌ $ERRORS check(s) failed. Please fix the issues above.${NC}"
  echo -e "\nCommon fixes:"
  echo "  1. Complete DB restore: npm run test:db:start && psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f dump.sql"
  echo "  2. Seed fixtures: npm run test:db:seed"
  echo "  3. Setup test user: npm run test:setup"
  exit 1
fi
