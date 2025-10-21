#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="side_effects"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/side-effects"

GOAL_LIST=$(cat <<'GOALS'
9ece109e-ccc4-4010-b4ae-b216074843dd|Deal with hair loss
a2f36f44-eef3-4ecb-8558-18015468c04a|Lower blood pressure
96cad06d-1aa6-4f24-89b8-f1901bd10c5d|Minimize pores
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
0cbdcf5f-a24a-46ce-b0f2-03d2d6651c72|Remove age spots
3a8eae50-6c90-4fce-b069-156862871cfe|Manage chronic fatigue
4dbf47c6-8077-4441-a536-9d459c2436b2|Deal with body odor
5c398aef-3019-4d41-a5cb-9dedaacda4ab|Lose weight sustainably
f609b584-d74f-4b42-94a0-db56d1f32d3a|Gain healthy weight
723f006e-10fa-4c09-9270-927915a46037|Get stronger
0f89cae2-cc94-47ef-ab16-1ad45a79b746|Stop insomnia
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Finalizing $label ($goal_id) side_effects ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id.json"
done <<<"$GOAL_LIST"
