#!/bin/bash

# Test script to generate 10 solutions for 3 random goals
# Goals selected:
# 1. "Fix dry skin" (Beauty & Wellness)
# 2. "Escape soul-crushing job" (Work & Career)  
# 3. "Handle friendship breakups" (Relationships)

echo "🧪 Testing AI Solution Generator with 3 goals"
echo "============================================="
echo ""
echo "This will generate 10 solutions for each of:"
echo "1. Fix dry skin"
echo "2. Escape soul-crushing job"
echo "3. Handle friendship breakups"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Goal 1: Fix dry skin
echo ""
echo "📊 Generating for Goal 1: Fix dry skin"
echo "---------------------------------------"
npm run generate:ai-solutions -- --goal-id=d8855dce-d45b-4212-8ae5-19e12ec4ebb3 --limit=10

# Brief pause between goals
sleep 2

# Goal 2: Escape soul-crushing job
echo ""
echo "📊 Generating for Goal 2: Escape soul-crushing job"
echo "---------------------------------------------------"
npm run generate:ai-solutions -- --goal-id=ed75e5dd-779c-40a5-8a2c-966c3d13bea2 --limit=10

# Brief pause between goals
sleep 2

# Goal 3: Handle friendship breakups
echo ""
echo "📊 Generating for Goal 3: Handle friendship breakups"
echo "----------------------------------------------------"
npm run generate:ai-solutions -- --goal-id=b48c04b6-4187-486c-9239-4676a45a3bd5 --limit=10

echo ""
echo "✅ Test generation complete!"
echo ""
echo "Run verification queries to check the data quality."
