#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="startup_cost,ongoing_cost,cost,cost_type"
API_DELAY=4000
STATE_DIR=".cache/generate-v3/costs"

# Estimated usage ≈991 Gemini calls (totalSolutions × 1.4)
GOAL_LIST=$(cat <<'GOALS'
0bf738fe-dbe9-4131-82d3-42c39b600296|Build home workout habit
d6ac7810-8b70-4c72-b23d-b33da6eb3fb5|Manage frustration without outbursts
e9569309-a911-4045-a416-a74827827c7c|Create good habits
23047783-3dc3-42f6-8b40-c1dd37a4693e|Complete daily priorities
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
4474e00e-d59a-42c9-ac5c-7bda99d6578a|Change careers successfully
965430b3-6caf-489a-8be3-fc7930951198|Heal from heartbreak
723f006e-10fa-4c09-9270-927915a46037|Get stronger
8050920c-de2f-41bc-be0b-0a411fbfa502|Improve posture
111adb63-1916-48d4-9599-4b074c10f894|Have healthier hair
af1e1baf-3379-43aa-a2be-6cf621d35bd6|Save money consistently
659e0530-f38f-4472-9320-1082337de090|Control my drinking
789c75b4-daf7-4a80-96c2-8dc2c0875fbc|Express emotions healthily
0f025c14-a321-4579-b47c-6eb01ec800e1|Master phone photography
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
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
