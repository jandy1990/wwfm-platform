#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="wait_time"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/wait-time"

GOAL_LIST=$(cat <<'GOALS'
111adb63-1916-48d4-9599-4b074c10f894|Have healthier hair
684b6862-cce5-49dd-9b1a-9f1703d76bd3|Even out skin tone
9ece109e-ccc4-4010-b4ae-b216074843dd|Deal with hair loss
867d2275-157c-4b2c-8160-c8d3b8e641fe|Manage seasonal depression
96cad06d-1aa6-4f24-89b8-f1901bd10c5d|Minimize pores
db8a2938-5fe7-48b4-bb95-5b97747f91d7|Manage IBS and gut issues
00c29c5e-4dd3-4462-890a-d8d04d1196b1|Manage thyroid issues
13a6540f-d793-4007-ba52-b964e35e89ee|Manage autoimmune conditions
0606e912-64a2-4276-8426-e11b90eef1b3|Get glowing skin
c826834a-bf7e-45d4-9888-7526b8d6cba2|Get over dating anxiety
0bf5187f-21cd-4e73-a349-dc1f46dbabef|Control allergies
cea54b7e-3d17-47f4-964a-e8e4cd06d116|Have a flatter stomach
f26f7bc7-4caf-4e30-8e2a-5046f1608b5a|Break porn addiction
1a9d7daf-5e18-4ea2-bfae-6b439ebdef2c|Control acid reflux
769a0120-666e-4713-a988-16ed49516158|Reduce joint pain
c833eca2-b877-46fc-9728-102e2c282904|Fade scars and marks
0cbdcf5f-a24a-46ce-b0f2-03d2d6651c72|Remove age spots
51daef31-1271-4128-ad38-11c686598e07|Grow thicker hair
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
8616f324-f280-4902-be87-87aa7122f1f8|Reduce dark circles
b41d3f03-a5f4-4a91-8a59-951fa97f82a8|Quit marijuana dependency
668a9ad9-8748-443c-ac4b-4eef8ee0c70d|Deal with rosacea
cf920463-3968-4813-815f-613ad1c48926|Improve flexibility
4dbf47c6-8077-4441-a536-9d459c2436b2|Deal with body odor
8050920c-de2f-41bc-be0b-0a411fbfa502|Improve posture
f053571e-8118-44a4-a5c2-c3cd49a08a69|Look fit in clothes
eddd32ce-f951-4232-a80f-f1a80ec50f96|Stay flexible as I age
32d14d31-6384-459b-9de8-a6a436b8ff03|Remove unwanted hair
9522f755-f58a-4b4b-bd24-c154166a8d05|Stop abusing painkillers
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Processing $label ($goal_id) wait_time ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id.json"
done <<<"$GOAL_LIST"
