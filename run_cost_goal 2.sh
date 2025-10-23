#!/usr/bin/env bash
set -euo pipefail
goal="$1"
field_filter="$2"
state_suffix="$3"
label="$4"
LOG_FILE="cost-run.log"

echo "\n=== $label ($goal) $field_filter ===" | tee -a "$LOG_FILE"
CMD_OUTPUT=$(npx tsx scripts/generate-validated-fields-v3.ts \
  --goal-id="$goal" \
  --field-filter="$field_filter" \
  --api-delay=6000 \
  --state-file ".cache/generate-v3/costs/goal-$goal-$state_suffix.json")
echo "$CMD_OUTPUT" | tee -a "$LOG_FILE"
CALLS=$(echo "$CMD_OUTPUT" | rg "API calls made" | tail -1 | awk '{print $4}')
if [ -z "$CALLS" ]; then
  CALLS=0
fi
echo "[Summary] $label ($goal) calls used: $CALLS" | tee -a "$LOG_FILE"
