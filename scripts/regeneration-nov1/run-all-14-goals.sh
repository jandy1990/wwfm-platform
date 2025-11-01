#!/bin/bash

# MASTER SCRIPT: Generate Solutions for All 14 New Goals
# Estimated: 280-350 API calls total
# Runtime: 3-4 hours with rate limiting
# Date: November 1, 2025

echo "🚀 WWFM Solution Generation - All 14 New Goals"
echo "=============================================="
echo ""
echo "This will generate 15-20 solutions for each goal"
echo "Estimated API calls: 280-350"
echo "Estimated time: 3-4 hours"
echo ""
echo "Starting at: $(date)"
echo ""

# Track successes and failures
SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL_SOLUTIONS=0

# Goal 1: Live with social anxiety (HIGHEST PRIORITY)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 1/14: Live with social anxiety"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=01c3a3eb-dc71-46bd-aafb-e70d662b4342 --limit=20; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 1 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 1 failed"
fi
echo ""

# Goal 2: Improve public speaking
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 2/14: Improve public speaking"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=ecae2b05-c2ea-4f23-8f4c-b6f4a4dda85d --limit=20; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 2 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 2 failed"
fi
echo ""

# Goal 3: Minimize distractions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 3/14: Minimize distractions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=37f86c02-ebc7-4128-b3da-aef50f86da5f --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 3 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 3 failed"
fi
echo ""

# Goal 4: Overcome perfectionism
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 4/14: Overcome perfectionism"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=83b2fd9c-d746-4ba0-b27a-a9d05f60df93 --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 4 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 4 failed"
fi
echo ""

# Goal 5: Reduce brain fog
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 5/14: Reduce brain fog"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=7a498deb-f738-4002-9b37-a23904e1fa61 --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 5 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 5 failed"
fi
echo ""

# Goal 6: Stop teeth grinding
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 6/14: Stop teeth grinding"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=431c1900-1cb2-4fb2-a4ec-d72b8fe83cc3 --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 6 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 6 failed"
fi
echo ""

# Goal 7: Wake up earlier
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 7/14: Wake up earlier"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=90eead43-734f-42b3-9000-559d1bf840da --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 7 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 7 failed"
fi
echo ""

# Goal 8: Reduce sugar intake
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 8/14: Reduce sugar intake"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=e1291660-5f98-4b87-aa74-2baa7880b26c --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 8 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 8 failed"
fi
echo ""

# Goal 9: Quit caffeine
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 9/14: Quit caffeine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=a89ab8e3-495d-4862-ac8b-f2107265e3fd --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 9 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 9 failed"
fi
echo ""

# Goal 10: Reduce screen time
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 10/14: Reduce screen time"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=3e81c864-623e-4627-85d8-95ebc5898cdc --limit=15; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 10 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 10 failed"
fi
echo ""

# Goal 11: Do digital detox
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 11/14: Do digital detox"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=19ab1cdc-0838-4dea-ba45-1c5ed3510175 --limit=12; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 11 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 11 failed"
fi
echo ""

# Goal 12: Quit junk food
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 12/14: Quit junk food"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=10fe576c-55f7-49e9-bf87-ecf1bd0c774e --limit=12; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 12 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 12 failed"
fi
echo ""

# Goal 13: Quit energy drinks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 13/14: Quit energy drinks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=25f47514-202c-4b26-9c67-66c352dbac47 --limit=12; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 13 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 13 failed"
fi
echo ""

# Goal 14: Improve skin texture
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Goal 14/14: Improve skin texture"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx tsx scripts/solution-generator/index.ts --goal-id=c004a80e-facf-4d54-a4bc-f02c8603576b --limit=12; then
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo "✅ Goal 14 complete"
else
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "❌ Goal 14 failed"
fi
echo ""

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL GOALS COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Successful: $SUCCESS_COUNT/14 goals"
echo "❌ Failed: $FAIL_COUNT/14 goals"
echo ""
echo "Finished at: $(date)"
echo ""
echo "📊 Final API Usage:"
cat .gemini-usage.json
echo ""
echo "🎯 Next Steps:"
echo "1. Verify solutions in database"
echo "2. Check frontend display"
echo "3. Fix medication cost field issue (see MEDICATION_COST_FIELD_ISSUE.md)"
echo "4. Re-run for goals with skipped medications"
