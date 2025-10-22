#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="startup_cost,ongoing_cost,cost,cost_type"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/costs"

GOAL_LIST=$(cat <<'GOALS'
8b6c106c-dc95-4367-b5a2-1578a3775d35|Learn self-defense
9522f755-f58a-4b4b-bd24-c154166a8d05|Stop abusing painkillers
e783dbdf-c1c7-43a3-9751-06ab573240e5|Start exercising regularly
6e15bc27-d903-4126-ac8c-1720f99ab561|Quit drinking
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
27f38396-bd04-4d86-9af8-5a7a8240c2ae|Worry less
98195b10-f901-4fa5-9ec1-a42b293eaed3|Manage depression symptoms
9c5ecdf7-b473-489b-9c98-866a03417710|Learn new skills
9efd2e89-095b-47af-8123-39138ee4ff31|Ace interviews
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Processing $label ($goal_id) ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id.json"
done <<<"$GOAL_LIST"
