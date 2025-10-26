#!/bin/bash
# Extract all unique error messages from failures

echo "=== UNIQUE ERROR MESSAGES ==="
grep -A 3 "^\*\*Error Message:\*\*" test-results/failures-summary.md | grep -v "^--$" | sort -u

echo ""
echo "=== UNIQUE ERROR PATTERNS ==="
grep -A 10 "^\*\*Error Patterns in Output:\*\*" test-results/failures-summary.md | grep -E "not found|Failed|Error:|Missing|Mismatch" | sort -u | head -30
