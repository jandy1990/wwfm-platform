#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="side_effects"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/side-effects"

GOAL_LIST=$(cat <<'GOALS'
111adb63-1916-48d4-9599-4b074c10f894|Have healthier hair
54101067-5731-4744-9b47-ce95f90a62b5|Have healthy nails
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
77682cc2-1fc5-4781-a1db-e8bc10834e10|Treat wrinkles
ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f|Manage PCOS
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Force regenerating $label ($goal_id) ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --force-regenerate \
    --state-file "$STATE_DIR/goal-$goal_id-force.json"
done <<<"$GOAL_LIST"
