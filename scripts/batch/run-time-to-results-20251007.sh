#!/usr/bin/env bash
set -euo pipefail

FIELD_FILTER="time_to_results"
API_DELAY=6000
STATE_DIR=".cache/generate-v3/time-to-results"

GOAL_LIST=$(cat <<'GOALS'
0606e912-64a2-4276-8426-e11b90eef1b3|Get glowing skin
2c2be634-4586-4b4b-8da8-b1a2795eb3bc|Stop gambling
af1e1baf-3379-43aa-a2be-6cf621d35bd6|Save money consistently
789c75b4-daf7-4a80-96c2-8dc2c0875fbc|Express emotions healthily
8b6c106c-dc95-4367-b5a2-1578a3775d35|Learn self-defense
e783dbdf-c1c7-43a3-9751-06ab573240e5|Start exercising regularly
a5169243-f97b-4cc7-98ce-79c2a5ac9997|Stop self-harm
18b9a15c-0da1-4ad4-b122-7c32de779d6e|Find exercise I enjoy
0bf5187f-21cd-4e73-a349-dc1f46dbabef|Control allergies
0bfa9bd6-794a-4663-9262-9f2aa640f34e|Start yoga practice
8050920c-de2f-41bc-be0b-0a411fbfa502|Improve posture
54101067-5731-4744-9b47-ce95f90a62b5|Have healthy nails
7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9|Practice self-compassion
e6de646e-9a2d-4935-a785-df4dc098684d|Stop emotional eating
a660050e-780c-44c8-be6a-1cfdfeaaf82d|Land dream job
867d2275-157c-4b2c-8160-c8d3b8e641fe|Manage seasonal depression
0bf738fe-dbe9-4131-82d3-42c39b600296|Build home workout habit
7338e1ae-8bdf-4b9f-bdf5-eb5021aad086|Change negative self-talk
823cb2dc-1b96-4f64-8de8-2ee71974ba08|Stop migraines
3a8eae50-6c90-4fce-b069-156862871cfe|Manage chronic fatigue
4474e00e-d59a-42c9-ac5c-7bda99d6578a|Change careers successfully
fe5c92b9-574a-4f73-940b-f312be38c181|Share opinions confidently
e416cef3-ff8a-4bc1-a467-8cab2855344e|Start over at 40+
cf920463-3968-4813-815f-613ad1c48926|Improve flexibility
c826834a-bf7e-45d4-9888-7526b8d6cba2|Get over dating anxiety
94a5d0ef-fae8-4cb1-bbfa-d6a3bd8dec14|Write compelling resume
d08a7dde-e7fe-42e8-af4e-752cef7a7355|Complete a marathon
27f38396-bd04-4d86-9af8-5a7a8240c2ae|Worry less
a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56|Beat afternoon slump
cf73ce7b-8e8f-40aa-908c-6900209878a0|Quit vaping
d6ac7810-8b70-4c72-b23d-b33da6eb3fb5|Manage frustration without outbursts
cfc96452-e4b1-47e2-a286-8d1d834b2af7|Quiet racing mind
1331079c-b7d7-4196-91b8-5c9aece78ac1|Deal with tinnitus
43d81f73-c2b4-4c5d-9ee0-ea44e7d2c5ae|Improve balance
723f006e-10fa-4c09-9270-927915a46037|Get stronger
1e792f27-966f-4968-bae4-c84c84989fed|Start journaling
f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c|Maintain deep focus
ca9d28b4-ad04-4a0c-9cbd-5bdf9699968f|Manage PCOS
d76a03d4-27fb-4d52-960f-2791898e42d6|Respond not react
ef3ff425-3d80-4689-b9a9-c542d580254d|Control oily skin
bfdedb5e-b7d1-4dc8-b2ff-30cda27d6eb8|Manage ADHD symptoms
91db190f-4fd5-4091-ab9d-3a88c73bb233|Control my temper
68099253-5b89-48cf-a8dd-08f5118b9c19|Break bad habits
f7c595e0-b4bf-42ee-b93e-31cf6222c5c2|Stop junk food binges
0bceed44-3db4-4c7b-9ed4-3286ee4008b0|Prepare for job loss
38fc0df5-6a7a-4ebd-9bb9-79a297562886|Build muscle mass
e049b4c5-6d7c-4988-b205-b6f24d1362fd|Navigate autism challenges
2177f4dc-41df-492d-8a7f-9c4827d689bd|Build self-discipline
4bc9eecd-0815-46a8-812f-5745ae369b3e|Fall asleep faster
e6ddd417-0e78-4f20-a043-08a7de10c801|Practice mindfulness
f26f7bc7-4caf-4e30-8e2a-5046f1608b5a|Break porn addiction
0772b2d8-3194-485e-affa-3efdb8ea1b77|Bike long distances
f0583121-dbd5-4ebe-87c3-f8fbc1f6d13c|Remember names and faces
2633f500-9b34-449a-bb87-9dce0d203a31|Control inflammation
5c398aef-3019-4d41-a5cb-9dedaacda4ab|Lose weight sustainably
b41d3f03-a5f4-4a91-8a59-951fa97f82a8|Quit marijuana dependency
552e81a6-7580-4956-a0cb-8893ce9e55b7|Navigate menopause
5ceb513d-b531-4e35-ad74-221cb6dff539|Develop perseverance
23047783-3dc3-42f6-8b40-c1dd37a4693e|Complete daily priorities
7f10f31f-5ba4-4be7-a2c0-d4d244f7aa94|Find job openings
712a1cd8-0a7b-4530-9711-d4ebff42243f|Stop losing it
0f89cae2-cc94-47ef-ab16-1ad45a79b746|Stop insomnia
ae0082f6-9e1f-47f4-be07-635a4775a10f|Build freelance career
8616f324-f280-4902-be87-87aa7122f1f8|Reduce dark circles
dd761c23-9b37-4f60-b9bc-7f1a27eb9cdb|Cope with PTSD
fd47e075-e2e3-4f83-8f05-096bfa7585d3|Stop emotional exhaustion
6e15bc27-d903-4126-ac8c-1720f99ab561|Quit drinking
c156fc35-fd76-4d7f-a253-59105975b58c|Improve posture
39790d9d-9cb3-4fda-8851-9105ad8ac7cf|Practice meditation
1a9d7daf-5e18-4ea2-bfae-6b439ebdef2c|Control acid reflux
4b721437-85db-4ca5-8a4c-e1a54affad85|Clear up acne
1be300b4-6945-45c0-946e-934f1443053e|Lift heavier weights
965430b3-6caf-489a-8be3-fc7930951198|Heal from heartbreak
b640da48-e674-4e7d-a335-8ea29b7cb22d|Overcome eating disorders
bc0e64fb-56e1-4b30-a9e8-3b80e90f650f|Improve heart health
91d4a950-bb87-4570-b32d-cf4f4a4bb20d|TEST - Automated Testing Goal
0ba6a398-8a4b-4b08-b43c-5ae04f0ec608|Control gaming addiction
287d5b7e-4fc2-40c3-94f2-500d120bc522|Prevent injuries
c017b79a-30c7-4f72-90f2-4aff05eea0f9|Control OCD behaviors
4dbf47c6-8077-4441-a536-9d459c2436b2|Deal with body odor
25988abd-7991-4b30-9bf1-9af3e43ebfd3|Control sugar cravings
99981e39-0c39-4806-867d-62d36b2230ec|Follow through on commitments
77682cc2-1fc5-4781-a1db-e8bc10834e10|Treat wrinkles
9522f755-f58a-4b4b-bd24-c154166a8d05|Stop abusing painkillers
00c29c5e-4dd3-4462-890a-d8d04d1196b1|Manage thyroid issues
16bbe856-4eae-45f7-ae3f-2bec6185d351|Update outdated skills
9ece109e-ccc4-4010-b4ae-b216074843dd|Deal with hair loss
01a258a6-2414-4a12-a79d-4c58d090aabe|Start writing regularly
a2f36f44-eef3-4ecb-8558-18015468c04a|Lower blood pressure
016eebd2-5cb4-4e10-ba6e-1483aae4dc87|Stop breakouts
8747b8d3-96ff-42cf-8b9f-70a3c27a90c7|Manage fibromyalgia
eddd32ce-f951-4232-a80f-f1a80ec50f96|Stay flexible as I age
111adb63-1916-48d4-9599-4b074c10f894|Have healthier hair
06055c70-39d2-4a95-9347-b7bd9696041e|Drink more water
659e0530-f38f-4472-9320-1082337de090|Control my drinking
31b43af1-fb4d-4c27-bb97-91ba77c3e02e|Manage vertigo and dizziness
9efd2e89-095b-47af-8123-39138ee4ff31|Ace interviews
dcb86734-1bbc-4ab0-8ffb-b82d75fdcd64|Manage chronic pain
27cf196e-c0d2-461b-94b2-89f6143f189b|Study philosophy
fd3be08f-54a8-4f4f-81f6-1ece40895b15|Reduce social media use
98195b10-f901-4fa5-9ec1-a42b293eaed3|Manage depression symptoms
a0473f4c-8367-45e3-9d43-ef99858a95b7|Support refugees and immigrants
580ab7cb-63ae-4234-9fe4-b7e0f0fe7d9c|Stop news addiction
GOALS
)

mkdir -p "$STATE_DIR"

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue
  echo "\n=== Processing $label ($goal_id) time_to_results ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$FIELD_FILTER" \
    --api-delay="$API_DELAY" \
    --state-file "$STATE_DIR/goal-$goal_id.json"
done <<<"$GOAL_LIST"
