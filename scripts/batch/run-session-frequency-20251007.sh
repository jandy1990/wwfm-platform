#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="session_frequency"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/session-frequency"

GOAL_LIST=$(cat <<'GOALS'
77682cc2-1fc5-4781-a1db-e8bc10834e10|Treat wrinkles
91f8cf27-c3f2-47af-ad88-c39ccaea72d4|Start side hustle
0cea6523-b928-4855-91a5-5c3e41e87e4b|Build a coordinated wardrobe
96cad06d-1aa6-4f24-89b8-f1901bd10c5d|Minimize pores
75f672d2-518a-4587-b8b5-b2914d9ed3ba|Create will/estate plan
9f8f2896-177e-4414-b37a-d4345f5a22ea|Update my wardrobe
cea54b7e-3d17-47f4-964a-e8e4cd06d116|Have a flatter stomach
a1bc5222-9eac-475f-b646-be07b9e052fa|Pay off credit cards
32d14d31-6384-459b-9de8-a6a436b8ff03|Remove unwanted hair
a0473f4c-8367-45e3-9d43-ef99858a95b7|Support refugees and immigrants
8616f324-f280-4902-be87-87aa7122f1f8|Reduce dark circles
9522f755-f58a-4b4b-bd24-c154166a8d05|Stop abusing painkillers
7f10f31f-5ba4-4be7-a2c0-d4d244f7aa94|Find job openings
e8fe3af7-49b9-4a54-8466-ca4775c37884|Spot layoff signs
684b6862-cce5-49dd-9b1a-9f1703d76bd3|Even out skin tone
0cbdcf5f-a24a-46ce-b0f2-03d2d6651c72|Remove age spots
335540d0-314b-41a0-a50d-d693f828dd72|Consolidate debts
b54f0730-006a-4c77-90c0-9625d98effba|Channel anger productively
b41d3f03-a5f4-4a91-8a59-951fa97f82a8|Quit marijuana dependency
1331079c-b7d7-4196-91b8-5c9aece78ac1|Deal with tinnitus
eddd32ce-f951-4232-a80f-f1a80ec50f96|Stay flexible as I age
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
b279c24b-2032-425d-989e-105bd59240e1|Keep conversations going
2dfb4085-c5f3-484f-868f-062abb371077|Mentor young people
888693d9-7498-410b-ac31-cea63ee12078|Plan for healthcare costs
ae0082f6-9e1f-47f4-be07-635a4775a10f|Build freelance career
769a0120-666e-4713-a988-16ed49516158|Reduce joint pain
28a9df62-1511-4d0a-aebc-3b8d303f33d4|Leave toxic situation
c156fc35-fd76-4d7f-a253-59105975b58c|Improve posture
c06ce272-50b1-424d-ac13-fade70b170b6|Deal with excessive sweating
0772b2d8-3194-485e-affa-3efdb8ea1b77|Bike long distances
acacf4ec-79b9-41eb-996e-599d21fc8df9|Build confidence
1f467a6d-a3be-48dd-a763-049166d9a15f|Help those in need
111adb63-1916-48d4-9599-4b074c10f894|Have healthier hair
9b2827a2-09df-40c0-8c64-e2bc998c55ec|Support education
d920d47a-4e2d-4499-9893-3e110fc04a23|Understand taxes
0606e912-64a2-4276-8426-e11b90eef1b3|Get glowing skin
915e6f73-dce8-4b1d-8443-5d95d002d097|Reduce household waste
6016ad82-8b88-4776-9da9-e609e61d96a7|Plan for long-term care
4a3acbc1-9ba5-430b-9ac8-d0fd53810e88|Save for house
bbfa8698-398c-40e6-8bf5-c7dce0104c77|Navigate insurance options
b682e7c6-4ed9-4b54-98ec-b6c84bda73d4|Save on utilities
60c2201f-6e19-46f1-8314-7bff985af1f8|Get out of debt
c833eca2-b877-46fc-9728-102e2c282904|Fade scars and marks
2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1|Build emotional intelligence
c826834a-bf7e-45d4-9888-7526b8d6cba2|Get over dating anxiety
8050920c-de2f-41bc-be0b-0a411fbfa502|Improve posture
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
