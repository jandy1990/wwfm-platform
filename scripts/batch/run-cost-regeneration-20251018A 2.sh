#!/usr/bin/env bash
set -euo pipefail

API_DELAY="${API_DELAY:-4000}"
STATE_ROOT=".cache/generate-v3/costs"
PRACTICE_CATEGORIES="exercise_movement,habits_routines,meditation_mindfulness,hobbies_activities"
FORCE_FLAGS="--force-regenerate"

# goal_id|Label|practice_pass|cost_pass|cost_opts
GOALS=$(
  cat <<'GOALS'
2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1|Build emotional intelligence|practice|cost|
e9569309-a911-4045-a416-a74827827c7c|Create good habits|practice|cost|
f36c91a3-bb0f-4cd4-906c-337e3d8a5f3c|Maintain deep focus|practice|cost|
d08a7dde-e7fe-42e8-af4e-752cef7a7355|Complete a marathon|practice|cost|
01a258a6-2414-4a12-a79d-4c58d090aabe|Start writing regularly|practice|cost|
1e792f27-966f-4968-bae4-c84c84989fed|Start journaling|practice|cost|
38fc0df5-6a7a-4ebd-9bb9-79a297562886|Build muscle mass|practice|cost|
68099253-5b89-48cf-a8dd-08f5118b9c19|Break bad habits|practice|cost|
2177f4dc-41df-492d-8a7f-9c4827d689bd|Build self-discipline|practice|cost|
2755c4b7-7156-429e-89e9-55dca536c474|Stop doomscrolling|practice|cost|
5a6203f4-f94f-4b2f-9e12-e980e908f0f7|Stop overspending|practice|cost|
0f025c14-a321-4579-b47c-6eb01ec800e1|Master phone photography|practice|cost|
7338e1ae-8bdf-4b9f-bdf5-eb5021aad086|Change negative self-talk|practice|cost|
d5f5b5c7-12d0-49ec-97be-5e97ce51a9ad|Manage business finances|practice|cost|
f0583121-dbd5-4ebe-87c3-f8fbc1f6d13c|Remember names and faces|practice|cost|
a660050e-780c-44c8-be6a-1cfdfeaaf82d|Land dream job|practice|cost|
82d7b9f1-fda0-435d-b982-d1975c75dbbf|Learn to code|practice|cost|
6ea319a6-88a1-4e98-8cf2-9c04ef260ed7|Return after maternity/leave|practice|cost|
335540d0-314b-41a0-a50d-d693f828dd72|Consolidate debts|practice|cost|
c5b82904-8202-4713-889f-3cb8d3a2f65f|Build financial stability|practice|cost|
99981e39-0c39-4806-867d-62d36b2230ec|Follow through on commitments|practice|cost|
cf23e088-e507-4160-a5bb-92152f445e78|Find causes I care about|practice|cost|
b279c24b-2032-425d-989e-105bd59240e1|Keep conversations going|-|cost|
6be41ee3-9d04-4aad-a43d-6672c90964ad|Stand out from applicants|practice|cost|
02cdeb6e-d240-4189-9637-f020d0827287|Understand personal finance basics|-|cost|
90700d46-1013-41eb-ab06-8a66abdd6286|Create a budget|practice|cost|
97fe516b-0d28-40a4-9fbb-221e00c31d1d|Track all expenses|practice|cost|
7b0d1a0a-f65a-41d9-b1cd-afedf41d52b9|Practice self-compassion|practice|cost|
GOALS
)

mkdir -p "$STATE_ROOT"

trim() {
  local var="$1"
  var="${var#${var%%[![:space:]]*}}"
  var="${var%${var##*[![:space:]]}}"
  printf '%s' "$var"
}

run_generator() {
  local goal_id="$1"
  local label="$2"
  local field_filter="$3"
  local state_suffix="$4"
  shift 4
  local extra_opts=("$@")

  echo ""
  echo "=== ${label} (${goal_id}) — ${field_filter:-skip} ==="
  if [[ -z "$field_filter" ]]; then
    echo "(skip)"
    return
  fi
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$field_filter" \
    --api-delay="$API_DELAY" \
    --state-file "${STATE_ROOT}/goal-${goal_id}-${state_suffix}.json" \
    "${extra_opts[@]}"
}

run_validator() {
  local goal_id="$1"
  local label="$2"
  local field_filter="$3"
  local category_filter="$4"

  echo ""
  echo ">>> Validator: ${label} (${goal_id}) — fields ${field_filter}"
  local args=(--goal-id="$goal_id" --field-filter="$field_filter" --show-good-quality)
  if [[ -n "$category_filter" ]]; then
    args+=(--category-filter="$category_filter")
  fi
  npm run --silent quality:validate -- "${args[@]}"
}

while IFS='|' read -r goal_id label practice_flag cost_flag cost_opts; do
  [[ -z "$goal_id" ]] && continue
  goal_id="$(trim "$goal_id")"
  label="$(trim "$label")"
  practice_flag="$(trim "$practice_flag")"
  cost_flag="$(trim "$cost_flag")"
  cost_opts="$(trim "$cost_opts")"

  if [[ "$practice_flag" == "practice" ]]; then
    run_generator "$goal_id" "$label" "startup_cost,ongoing_cost,cost,cost_type" "practice" $FORCE_FLAGS
    run_validator "$goal_id" "$label" "startup_cost,ongoing_cost" "$PRACTICE_CATEGORIES"
  fi

  if [[ "$cost_flag" == "cost" ]]; then
    # shellcheck disable=SC2086
    run_generator "$goal_id" "$label" "cost" "cost" $FORCE_FLAGS $cost_opts
    run_validator "$goal_id" "$label" "cost" ""
  fi

done <<<"$GOALS"

echo ""
echo "✅ Batch complete"
