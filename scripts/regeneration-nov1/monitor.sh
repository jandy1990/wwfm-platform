#!/bin/bash

# Quick monitor script to check generation progress

echo "📊 WWFM Generation Monitor"
echo "=========================="
echo ""

# Check if process is running
if ps -p 67487 > /dev/null 2>&1; then
  echo "✅ Generation script is RUNNING (PID: 67487)"
else
  echo "⚠️  Generation script has STOPPED"
fi

echo ""
echo "📈 API Usage:"
cat .gemini-usage.json 2>/dev/null || echo "No usage data yet"

echo ""
echo "📋 Recent Progress (last 30 lines):"
tail -30 generation-log.txt 2>/dev/null || echo "No log file yet"

echo ""
echo "💡 To view full log: tail -f generation-log.txt"
echo "💡 To check completion: grep 'ALL GOALS COMPLETE' generation-log.txt"
