#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="startup_cost,ongoing_cost,cost,cost_type"
API_DELAY=4000
STATE_DIR=".cache/generate-v3/costs"

# Approximate Gemini call budget ~900 using goal-level totals ×1.5 multiplier
# Goal ID | Human-readable label
GOAL_LIST=$(cat <<'GOALS'
7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9|Practice self-compassion
e6ddd417-0e78-4f20-a043-08a7de10c801|Practice mindfulness
e6de646e-9a2d-4935-a785-df4dc098684d|Stop emotional eating
4474e00e-d59a-42c9-ac5c-7bda99d6578a|Change careers successfully
e416cef3-ff8a-4bc1-a467-8cab2855344e|Start over at 40+
cf920463-3968-4813-815f-613ad1c48926|Improve flexibility
23047783-3dc3-42f6-8b40-c1dd37a4693e|Complete daily priorities
0bf738fe-dbe9-4131-82d3-42c39b600296|Build home workout habit
d6ac7810-8b70-4c72-b23d-b33da6eb3fb5|Manage frustration without outbursts
e9569309-a911-4045-a416-a74827827c7c|Create good habits
cf73ce7b-8e8f-40aa-908c-6900209878a0|Quit vaping
dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb|Cope with PTSD
39790d9d-9cb3-4fda-8851-9105ad8ac7cf|Practice meditation
1e792f27-966f-4968-bae4-c84c84989fed|Start journaling
bc0e64fb-56e1-4b30-a9e8-3b80e90f650f|Improve heart health
38fc0df5-6a7a-4ebd-9bb9-79a297562886|Build muscle mass
d46ce9bb-3d80-4d94-b402-8d389e27781f|Sleep peacefully
712a1cd8-0a7b-4530-9711-d4ebff42243f|Stop losing it
5c398aef-3019-4d41-a5cb-9dedaacda4ab|Lose weight sustainably
b640da48-e674-4e7d-a335-8ea29b7cb22d|Overcome eating disorders
f0583121-dbd5-4ebe-87c3-f8fbc1f6d13c|Remember names and faces
16bbe856-4eae-45f7-ae3f-2bec6185d351|Update outdated skills
2177f4dc-41df-492d-8a7f-9c4827d689bd|Build self-discipline
01a258a6-2414-4a12-a79d-4c58d090aabe|Start writing regularly
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
