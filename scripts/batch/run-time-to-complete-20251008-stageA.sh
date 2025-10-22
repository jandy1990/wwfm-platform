#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="time_to_complete"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/time-to-complete"

GOAL_LIST=$(cat <<'GOALS'
f5dd1ba0-7141-4e74-a036-42ea76c01f3a|Improve emotional regulation
b54f0730-006a-4c77-90c0-9625d98effba|Channel anger productively
d6f8f5df-c34b-4239-b978-18d702f5936a|Develop morning routine
a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56|Beat afternoon slump
cea54b7e-3d17-47f4-964a-e8e4cd06d116|Have a flatter stomach
d8855dce-d45b-4212-8ae5-19e12ec4ebb3|Fix dry skin
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Processing $label ($goal_id) time_to_complete ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id-stageA.json"
done <<<"$GOAL_LIST"
