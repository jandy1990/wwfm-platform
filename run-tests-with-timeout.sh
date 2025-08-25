#!/bin/bash

# Run tests with output capture
npx playwright test tests/e2e/forms --reporter=list --workers=1 > full-test-output.txt 2>&1 &
TEST_PID=$!

# Wait for 2 minutes
sleep 120

# Kill the test process
kill -TERM $TEST_PID 2>/dev/null

# Show where we got to
echo "=== Last 150 lines of test output ==="
tail -150 full-test-output.txt

# Show which test files completed
echo ""
echo "=== Test completion status ==="
grep -E "✓|✘|✓.*\[chromium\]|✘.*\[chromium\]" full-test-output.txt | tail -20