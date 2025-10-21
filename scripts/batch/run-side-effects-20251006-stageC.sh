#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="side_effects"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/side-effects"

GOAL_LIST=$(cat <<'GOALS'
1be300b4-6945-45c0-946e-934f1443053e|Lift heavier weights
25988abd-7991-4b30-9bf1-9af3e43ebfd3|Control sugar cravings
8747b8d3-96ff-42cf-8b9f-70a3c27a90c7|Manage fibromyalgia
bbe1b334-f430-4722-b994-1916341d3e1a|Manage eczema/psoriasis
0772b2d8-3194-485e-affa-3efdb8ea1b77|Bike long distances
7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9|Practice self-compassion
823cb2dc-1b96-4f64-8de8-2ee71974ba08|Stop migraines
c826834a-bf7e-45d4-9888-7526b8d6cba2|Get over dating anxiety
f609b584-d74f-4b42-94a0-db56d1f32d3a|Gain healthy weight
cfc96452-e4b1-47e2-a286-8d1d834b2af7|Quiet racing mind
d6ac7810-8b70-4c72-b23d-b33da6eb3fb5|Manage frustration without outbursts
e6de646e-9a2d-4935-a785-df4dc098684d|Stop emotional eating
91db190f-4fd5-4091-ab9d-3a88c73bb233|Control my temper
723f006e-10fa-4c09-9270-927915a46037|Get stronger
e049b4c5-6d7c-4988-b205-b6f24d1362fd|Navigate autism challenges
552e81a6-7580-4956-a0cb-8893ce9e55b7|Navigate menopause
6e15bc27-d903-4126-ac8c-1720f99ab561|Quit drinking
1331079c-b7d7-4196-91b8-5c9aece78ac1|Deal with tinnitus
43d81f73-c2b4-4c5d-9ee0-ea44e7d2c5ae|Improve balance
0f89cae2-cc94-47ef-ab16-1ad45a79b746|Stop insomnia
cf920463-3968-4813-815f-613ad1c48926|Improve flexibility
bc0e64fb-56e1-4b30-a9e8-3b80e90f650f|Improve heart health
0ba6a398-8a4b-4b08-b43c-5ae04f0ec608|Control gaming addiction
c156fc35-fd76-4d7f-a253-59105975b58c|Improve posture
68099253-5b89-48cf-a8dd-08f5118b9c19|Break bad habits
789c75b4-daf7-4a80-96c2-8dc2c0875fbc|Express emotions healthily
97b7334e-74c7-44ff-a8c0-fc9643fb3789|Prepare for baby
a865f143-eec8-4e00-9300-4c34910a933b|Improve home lighting
eebc1755-2d21-484c-ab4d-59eb86ac0143|Learn pottery
4b721437-85db-4ca5-8a4c-e1a54affad85|Clear up acne
016eebd2-5cb4-4e10-ba6e-1483aae4dc87|Stop breakouts
ef3ff425-3d80-4689-b9a9-c542d580254d|Control oily skin
c06ce272-50b1-424d-ac13-fade70b170b6|Deal with excessive sweating
9ece109e-ccc4-4010-b4ae-b216074843dd|Deal with hair loss
4bc9eecd-0815-46a8-812f-5745ae369b3e|Fall asleep faster
c017b79a-30c7-4f72-90f2-4aff05eea0f9|Control OCD behaviors
867d2275-157c-4b2c-8160-c8d3b8e641fe|Manage seasonal depression
dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb|Cope with PTSD
0606e912-64a2-4276-8426-e11b90eef1b3|Get glowing skin
2c2be634-4586-4b4b-8da8-b1a2795eb3bc|Stop gambling
f26f7bc7-4caf-4e30-8e2a-5046f1608b5a|Break porn addiction
b41d3f03-a5f4-4a91-8a59-951fa97f82a8|Quit marijuana dependency
f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c|Maintain deep focus
580ab7cb-63ae-4234-9fe4-b7e0f0fe7d9c|Stop news addiction
eddd32ce-f951-4232-a80f-f1a80ec50f96|Stay flexible as I age
27f38396-bd04-4d86-9af8-5a7a8240c2ae|Worry less
7338e1ae-8bdf-4b9f-bdf5-eb5021aad086|Change negative self-talk
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
287d5b7e-4fc2-40c3-94f2-500d120bc522|Prevent injuries
712a1cd8-0a7b-4530-9711-d4ebff42243f|Stop losing it
d6f8f5df-c34b-4239-b978-18d702f5936a|Develop morning routine
6ea319a6-88a1-4e98-8cf2-9c04ef260ed7|Return after maternity/leave
f5dd1ba0-7141-4e74-a036-42ea76c01f3a|Improve emotional regulation
0bf5187f-21cd-4e73-a349-dc1f46dbabef|Control allergies
00c29c5e-4dd3-4462-890a-d8d04d1196b1|Manage thyroid issues
91d4a950-bb87-4570-b32d-cf4f4a4bb20d|TEST - Automated Testing Goal
f0583121-dbd5-4ebe-87c3-f8fbc1f6d13c|Remember names and faces
fe5c92b9-574a-4f73-940b-f312be38c181|Share opinions confidently
965430b3-6caf-489a-8be3-fc7930951198|Heal from heartbreak
23047783-3dc3-42f6-8b40-c1dd37a4693e|Complete daily priorities
d76a03d4-27fb-4d52-960f-2791898e42d6|Respond not react
fd3be08f-54a8-4f4f-81f6-1ece40895b15|Reduce social media use
acacf4ec-79b9-41eb-996e-599d21fc8df9|Build confidence
fec1af39-041c-4fab-ae59-d827fc09063b|Get second dates
dca1334b-c2b4-417c-a880-43a7c5a39081|Swim regularly
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
