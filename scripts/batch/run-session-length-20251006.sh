#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="session_length"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/session-length"

GOAL_LIST=$(cat <<'GOALS'
a198e840-8672-4c58-99fa-51245a5492d5|Maintain home value
91f8cf27-c3f2-47af-ad88-c39ccaea72d4|Start side hustle
75f672d2-518a-4587-b8b5-b2914d9ed3ba|Create will/estate plan
0cea6523-b928-4855-91a5-5c3e41e87e4b|Build a coordinated wardrobe
9f8f2896-177e-4414-b37a-d4345f5a22ea|Update my wardrobe
a1bc5222-9eac-475f-b646-be07b9e052fa|Pay off credit cards
a0473f4c-8367-45e3-9d43-ef99858a95b7|Support refugees and immigrants
7f10f31f-5ba4-4be7-a2c0-d4d244f7aa94|Find job openings
e8fe3af7-49b9-4a54-8466-ca4775c37884|Spot layoff signs
335540d0-314b-41a0-a50d-d693f828dd72|Consolidate debts
32d14d31-6384-459b-9de8-a6a436b8ff03|Remove unwanted hair
1331079c-b7d7-4196-91b8-5c9aece78ac1|Deal with tinnitus
1f467a6d-a3be-48dd-a763-049166d9a15f|Help those in need
9522f755-f58a-4b4b-bd24-c154166a8d05|Stop abusing painkillers
b54f0730-006a-4c77-90c0-9625d98effba|Channel anger productively
b279c24b-2032-425d-989e-105bd59240e1|Keep conversations going
888693d9-7498-410b-ac31-cea63ee12078|Plan for healthcare costs
2dfb4085-c5f3-484f-868f-062abb371077|Mentor young people
28a9df62-1511-4d0a-aebc-3b8d303f33d4|Leave toxic situation
ae0082f6-9e1f-47f4-be07-635a4775a10f|Build freelance career
9b2827a2-09df-40c0-8c64-e2bc998c55ec|Support education
915e6f73-dce8-4b1d-8443-5d95d002d097|Reduce household waste
d920d47a-4e2d-4499-9893-3e110fc04a23|Understand taxes
96cad06d-1aa6-4f24-89b8-f1901bd10c5d|Minimize pores
6016ad82-8b88-4776-9da9-e609e61d96a7|Plan for long-term care
0772b2d8-3194-485e-affa-3efdb8ea1b77|Bike long distances
4a3acbc1-9ba5-430b-9ac8-d0fd53810e88|Save for house
bbfa8698-398c-40e6-8bf5-c7dce0104c77|Navigate insurance options
b682e7c6-4ed9-4b54-98ec-b6c84bda73d4|Save on utilities
60c2201f-6e19-46f1-8314-7bff985af1f8|Get out of debt
acacf4ec-79b9-41eb-996e-599d21fc8df9|Build confidence
6436959e-8859-46e8-af4a-139484b6f966|Give back effectively
64dedad8-83f2-41f4-af75-8af1f0a24e73|Set social boundaries
0bceed44-3db4-4c7b-9ed4-3286ee4008b0|Prepare for job loss
97b7334e-74c7-44ff-a8c0-fc9643fb3789|Prepare for baby
c156fc35-fd76-4d7f-a253-59105975b58c|Improve posture
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
684b6862-cce5-49dd-9b1a-9f1703d76bd3|Even out skin tone
eddd32ce-f951-4232-a80f-f1a80ec50f96|Stay flexible as I age
769a0120-666e-4713-a988-16ed49516158|Reduce joint pain
0606e912-64a2-4276-8426-e11b90eef1b3|Get glowing skin
2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1|Build emotional intelligence
dca1334b-c2b4-417c-a880-43a7c5a39081|Swim regularly
1187609c-fca9-4793-8ca5-3fc34ecfaf78|Make guests comfortable
b640da48-e674-4e7d-a335-8ea29b7cb22d|Overcome eating disorders
dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64|Manage chronic pain
d76a03d4-27fb-4d52-960f-2791898e42d6|Respond not react
148cf4b8-c1fc-4cdb-81a1-56d62593386f|Plan for emergencies
97fe516b-0d28-40a4-9fbb-221e00c31d1d|Track all expenses
b20c1a4d-cedb-4913-8864-9b31ae612e07|Get a sunless tan
4474e00e-d59a-42c9-ac5c-7bda99d6578a|Change careers successfully
fe5c92b9-574a-4f73-940b-f312be38c181|Share opinions confidently
e416cef3-ff8a-4bc1-a467-8cab2855344e|Start over at 40+
1e792f27-966f-4968-bae4-c84c84989fed|Start journaling
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
c017b79a-30c7-4f72-90f2-4aff05eea0f9|Control OCD behaviors
ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f|Manage PCOS
b41d3f03-a5f4-4a91-8a59-951fa97f82a8|Quit marijuana dependency
ac62f0f5-eacf-41b3-950b-0e7ff9dd80d0|Build muscle definition
287d5b7e-4fc2-40c3-94f2-500d120bc522|Prevent injuries
104d626b-eba7-4452-96e3-9cdc872e643f|Relax in social settings
fd47e075-e2e3-4f83-8f05-096bfa7585d3|Stop emotional exhaustion
18b9a15c-0da1-4ad4-b122-7c32de779d6e|Find exercise I enjoy
e049b4c5-6d7c-4988-b205-b6f24d1362fd|Navigate autism challenges
8227b511-30b7-48b5-a482-1ba46a15af9d|Start side business
35483ae2-65df-434a-a2ef-ab563e48cea9|Reduce household expenses
2869fdad-5412-44d6-99a4-bd6ba736139b|Shop smarter for home
f182860d-f579-4704-9bc6-42ebcec532f5|Master everyday hairstyling
0ba6a398-8a4b-4b08-b43c-5ae04f0ec608|Control gaming addiction
d5f5b5c7-12d0-49ec-97be-5e97ce51a9ad|Manage business finances
3799465a-aa48-4185-99da-459ec40579ec|Write music
94a5d0ef-fae8-4cb1-bbfa-d6a3bd8dec14|Write compelling resume
28ee14b7-fab1-46d3-82c5-54b1004e2fe7|Understand cryptocurrency
417d36d6-a456-46ab-bf73-85fa8a32bc50|Get proper insurance
5f0d4198-761d-4617-a3d7-e65a833d7e4b|Coach youth sports
9cbd3fad-755f-450f-8f45-a822955ab89b|Understand investing
fec1af39-041c-4fab-ae59-d827fc09063b|Get second dates
ce72cfad-9062-4e86-acad-d9a0bec51acc|Start grassroots movement
02cdeb6e-d240-4189-9637-f020d0827287|Understand personal finance basics
bc0e64fb-56e1-4b30-a9e8-3b80e90f650f|Improve heart health
bf4e99ad-7afa-46f0-aab6-627a03649c64|Prioritize effectively
c833eca2-b877-46fc-9728-102e2c282904|Fade scars and marks
f609b584-d74f-4b42-94a0-db56d1f32d3a|Gain healthy weight
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
