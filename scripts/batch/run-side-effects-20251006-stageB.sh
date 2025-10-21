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
31b43af1-fb4d-4c27-bb97-91ba77c3e02e|Manage vertigo and dizziness
8616f324-f280-4902-be87-87aa7122f1f8|Reduce dark circles
2633f500-9b34-449a-bb87-9dce0d203a31|Control inflammation
d7c3a613-c5fe-4aba-bc68-78b221f07f3d|Control blood sugar
0cbdcf5f-a24a-46ce-b0f2-03d2d6651c72|Remove age spots
a2f36f44-eef3-4ecb-8558-18015468c04a|Lower blood pressure
3a8eae50-6c90-4fce-b069-156862871cfe|Manage chronic fatigue
4dbf47c6-8077-4441-a536-9d459c2436b2|Deal with body odor
f182860d-f579-4704-9bc6-42ebcec532f5|Master everyday hairstyling
dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64|Manage chronic pain
84dd439a-19c9-4a2d-ac3d-bd268d90c963|Master makeup basics
f7c595e0-b4bf-42ee-b93e-31cf6222c5c2|Stop junk food binges
5c398aef-3019-4d41-a5cb-9dedaacda4ab|Lose weight sustainably
96cad06d-1aa6-4f24-89b8-f1901bd10c5d|Minimize pores
1a9d7daf-5e18-4ea2-bfae-6b439ebdef2c|Control acid reflux
38fc0df5-6a7a-4ebd-9bb9-79a297562886|Build muscle mass
104d626b-eba7-4452-96e3-9cdc872e643f|Relax in social settings
659e0530-f38f-4472-9320-1082337de090|Control my drinking
668a9ad9-8748-443c-ac4b-4eef8ee0c70d|Deal with rosacea
a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56|Beat afternoon slump
bf74d2f1-3c7e-43b4-bf93-748afec276e9|Look put together
fd47e075-e2e3-4f83-8f05-096bfa7585d3|Stop emotional exhaustion
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
