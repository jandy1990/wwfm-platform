#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="session_frequency"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/session-frequency"

GOAL_LIST=$(cat <<'GOALS'
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f|Manage PCOS
823cb2dc-1b96-4f64-8de8-2ee71974ba08|Stop migraines
97fe516b-0d28-40a4-9fbb-221e00c31d1d|Track all expenses
4474e00e-d59a-42c9-ac5c-7bda99d6578a|Change careers successfully
e416cef3-ff8a-4bc1-a467-8cab2855344e|Start over at 40+
b20c1a4d-cedb-4913-8864-9b31ae612e07|Get a sunless tan
97b7334e-74c7-44ff-a8c0-fc9643fb3789|Prepare for baby
bbe1b334-f430-4722-b994-1916341d3e1a|Manage eczema/psoriasis
cf920463-3968-4813-815f-613ad1c48926|Improve flexibility
a198e840-8672-4c58-99fa-51245a5492d5|Maintain home value
18b9a15c-0da1-4ad4-b122-7c32de779d6e|Find exercise I enjoy
fe5c92b9-574a-4f73-940b-f312be38c181|Share opinions confidently
b640da48-e674-4e7d-a335-8ea29b7cb22d|Overcome eating disorders
1e792f27-966f-4968-bae4-c84c84989fed|Start journaling
d76a03d4-27fb-4d52-960f-2791898e42d6|Respond not react
f26f7bc7-4caf-4e30-8e2a-5046f1608b5a|Break porn addiction
c017b79a-30c7-4f72-90f2-4aff05eea0f9|Control OCD behaviors
64dedad8-83f2-41f4-af75-8af1f0a24e73|Set social boundaries
4b721437-85db-4ca5-8a4c-e1a54affad85|Clear up acne
6436959e-8859-46e8-af4a-139484b6f966|Give back effectively
ac62f0f5-eacf-41b3-950b-0e7ff9dd80d0|Build muscle definition
287d5b7e-4fc2-40c3-94f2-500d120bc522|Prevent injuries
104d626b-eba7-4452-96e3-9cdc872e643f|Relax in social settings
9ece109e-ccc4-4010-b4ae-b216074843dd|Deal with hair loss
867d2275-157c-4b2c-8160-c8d3b8e641fe|Manage seasonal depression
fd47e075-e2e3-4f83-8f05-096bfa7585d3|Stop emotional exhaustion
dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64|Manage chronic pain
e049b4c5-6d7c-4988-b205-b6f24d1362fd|Navigate autism challenges
0bceed44-3db4-4c7b-9ed4-3286ee4008b0|Prepare for job loss
1187609c-fca9-4793-8ca5-3fc34ecfaf78|Make guests comfortable
db8a2938-5fe7-48b4-bb95-5b97747f91d7|Manage IBS and gut issues
8227b511-30b7-48b5-a482-1ba46a15af9d|Start side business
35483ae2-65df-434a-a2ef-ab563e48cea9|Reduce household expenses
00c29c5e-4dd3-4462-890a-d8d04d1196b1|Manage thyroid issues
2869fdad-5412-44d6-99a4-bd6ba736139b|Shop smarter for home
f182860d-f579-4704-9bc6-42ebcec532f5|Master everyday hairstyling
0ba6a398-8a4b-4b08-b43c-5ae04f0ec608|Control gaming addiction
d5f5b5c7-12d0-49ec-97be-5e97ce51a9ad|Manage business finances
dca1334b-c2b4-417c-a880-43a7c5a39081|Swim regularly
3799465a-aa48-4185-99da-459ec40579ec|Write music
94a5d0ef-fae8-4cb1-bbfa-d6a3bd8dec14|Write compelling resume
0bf5187f-21cd-4e73-a349-dc1f46dbabef|Control allergies
28ee14b7-fab1-46d3-82c5-54b1004e2fe7|Understand cryptocurrency
1a9d7daf-5e18-4ea2-bfae-6b439ebdef2c|Control acid reflux
f053571e-8118-44a4-a5c2-c3cd49a08a69|Look fit in clothes
417d36d6-a456-46ab-bf73-85fa8a32bc50|Get proper insurance
5f0d4198-761d-4617-a3d7-e65a833d7e4b|Coach youth sports
51daef31-1271-4128-ad38-11c686598e07|Grow thicker hair
9cbd3fad-755f-450f-8f45-a822955ab89b|Understand investing
fec1af39-041c-4fab-ae59-d827fc09063b|Get second dates
ce72cfad-9062-4e86-acad-d9a0bec51acc|Start grassroots movement
668a9ad9-8748-443c-ac4b-4eef8ee0c70d|Deal with rosacea
02cdeb6e-d240-4189-9637-f020d0827287|Understand personal finance basics
bc0e64fb-56e1-4b30-a9e8-3b80e90f650f|Improve heart health
4dbf47c6-8077-4441-a536-9d459c2436b2|Deal with body odor
bf4e99ad-7afa-46f0-aab6-627a03649c64|Prioritize effectively
f609b584-d74f-4b42-94a0-db56d1f32d3a|Gain healthy weight
148cf4b8-c1fc-4cdb-81a1-56d62593386f|Plan for emergencies
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Processing $label ($goal_id) session_frequency ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id.json"
done <<<"$GOAL_LIST"
