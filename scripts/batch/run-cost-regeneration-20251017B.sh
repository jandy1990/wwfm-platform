#!/usr/bin/env bash
set -euo pipefail

# Unified cost regeneration run for 2025-10-17 (evening session).
# Targets eight high-volume goals with an expected spend of ~880 Gemini calls.
# For each goal we run two passes:
#   1) practiceSplit() regenerates startup/ongoing cost splits for practice-heavy categories
#   2) costSweep() regenerates cost distributions for all other categories
# Each pass is followed by a scoped validator to confirm data quality.

API_DELAY="${API_DELAY:-4000}"
STATE_ROOT=".cache/generate-v3/costs"
PRACTICE_CATEGORIES="exercise_movement,habits_routines,meditation_mindfulness,hobbies_activities"
FORCE_PRACTICE="${FORCE_PRACTICE:-true}"
FORCE_COST="${FORCE_COST:-true}"

GOALS=$(
  cat <<'GOALS'
f5dd1ba0-7141-4e74-a036-42ea76c01f3a|Improve emotional regulation
d6f8f5df-c34b-4239-b978-18d702f5936a|Develop morning routine
b54f0730-006a-4c77-90c0-9625d98effba|Channel anger productively
a7c0d79e-4b60-4fb6-89c8-7dbdaff8fb56|Beat afternoon slump
cea54b7e-3d17-47f4-964a-e8e4cd06d116|Have a flatter stomach
f609b584-d74f-4b42-94a0-db56d1f32d3a|Gain healthy weight
f7c595e0-b4bf-42ee-b93e-31cf6222c5c2|Stop junk food binges
2244e53d-d88b-4e9f-98e7-3bbb3ca6dfc1|Build emotional intelligence
GOALS
)

mkdir -p "$STATE_ROOT"

run_generator() {
  local goal_id="$1"
  local label="$2"
  local field_filter="$3"
  local state_suffix="$4"
  local force_flag="$5"

  echo ""
  echo "=== ${label} (${goal_id}) — ${field_filter} ==="
  npx tsx scripts/generate-validated-fields-v3.ts \
    --goal-id="$goal_id" \
    --field-filter="$field_filter" \
    --api-delay="$API_DELAY" \
    --state-file "${STATE_ROOT}/goal-${goal_id}-${state_suffix}.json" \
    $force_flag
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

while IFS='|' read -r goal_id label; do
  [[ -z "$goal_id" ]] && continue

  practice_force_arg=""
  if [[ "${FORCE_PRACTICE}" == "true" ]]; then
    practice_force_arg="--force-regenerate"
  fi
  run_generator "$goal_id" "$label" "startup_cost,ongoing_cost,cost,cost_type" "practice" "$practice_force_arg"
  run_validator "$goal_id" "$label" "startup_cost,ongoing_cost" "$PRACTICE_CATEGORIES"

  cost_force_arg=""
  if [[ "${FORCE_COST}" == "true" ]]; then
    cost_force_arg="--force-regenerate"
  fi
  run_generator "$goal_id" "$label" "cost" "cost" "$cost_force_arg"
  run_validator "$goal_id" "$label" "cost" ""

done <<<"$GOALS"

echo ""
echo "✅ Batch complete"
