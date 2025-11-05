/**
 * Claude Web Generator Configuration
 *
 * Optimized for Claude Code on the Web with:
 * - Rich, comprehensive prompts (not terse like Gemini)
 * - Real-time validation at every step
 * - Parallel batch processing (10 tasks simultaneously)
 * - Checkpoint/resume for multi-session generation
 */

export const CLAUDE_WEB_CONFIG = {
  // Batch Processing
  BATCH_SIZE: 10, // Process 10 goals in parallel (Max 10 tasks in Claude Web)
  MAX_PARALLEL_TASKS: 10,
  SOLUTIONS_PER_GOAL: 20, // Target number of solutions per goal

  // Quality Thresholds
  MIN_EFFECTIVENESS: 3.0, // Minimum effectiveness rating
  TARGET_DISTRIBUTION_OPTIONS: 5, // Target 5-8 options per field distribution
  MIN_DISTRIBUTION_OPTIONS: 4, // Minimum acceptable diversity

  // Validation Flags
  ENABLE_LAUGH_TEST: true, // Validate titles pass "friend test"
  ENABLE_DUPLICATE_CHECK: true, // Check for duplicates after each batch
  ENABLE_SSOT_VALIDATION: true, // Verify field compliance with GoalPageClient.tsx
  ENABLE_DROPDOWN_VALIDATION: true, // Check all values match form dropdowns

  // Checkpoint Settings
  CHECKPOINT_AFTER_EACH_BATCH: true,
  CHECKPOINT_FILE: 'scripts/claude-web-generator/.checkpoint.json',

  // Cost Tracking
  ESTIMATED_COST_PER_GOAL: 2.5, // USD (based on Max 5x subscription)
  BUDGET_ALERT_THRESHOLD: 800, // Alert when approaching $1000 budget

  // Retry Logic
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 3000,

  // Progress Reporting
  REPORT_EVERY_N_GOALS: 10,
  SAVE_DETAILED_LOGS: true,
  LOG_FILE: 'scripts/claude-web-generator/.generation-log.json',
}

// High-priority goals (high traffic, strategic importance)
export const HIGH_PRIORITY_GOALS = [
  'Reduce anxiety',
  'Sleep better',
  'Overcome insomnia',
  'Fall asleep faster',
  'Stop overthinking',
  'Deal with depression',
  'Manage stress',
  'Quit smoking',
  'Quit drinking',
  'Make friends',
  'Deal with loneliness',
  'Get in shape',
  'Lose weight',
  'Build muscle',
  'Improve focus',
  'Stop procrastinating',
  'Build confidence',
  'Overcome social anxiety',
  'Deal with breakup',
  'Save money'
]

// Categories requiring special attention (common miscategorization)
export const TRICKY_CATEGORIES = {
  medications: [
    'Must have specific drug name (e.g., "Sertraline (Zoloft)")',
    'Avoid generic descriptors (e.g., "antidepressants")',
    'Include both generic and brand name where common'
  ],
  habits_routines: [
    'Must be a specific practice (e.g., "Morning Pages")',
    'Avoid generic categories (e.g., "journaling")',
    'Should be googleable/have a name'
  ],
  books_courses: [
    'Must include author name (e.g., "Atomic Habits by James Clear")',
    'Avoid generic descriptors (e.g., "self-help books")',
    'Should be a real, purchasable book/course'
  ],
  apps_software: [
    'Must be specific app name (e.g., "Headspace")',
    'Avoid generic categories (e.g., "meditation apps")',
    'Should be available in app stores'
  ]
}

// Generation mode
export type GenerationMode = 'full' | 'high-priority' | 'single-goal' | 'resume'

export interface CheckpointData {
  mode: GenerationMode
  totalGoals: number
  processedGoals: number
  successfulGenerations: number
  failedGenerations: number
  currentBatch: number
  lastProcessedGoalId: string
  timestamp: string
  estimatedCostSoFar: number
  validationResults: {
    laughTestFailures: number
    duplicatesFound: number
    ssotViolations: number
    dropdownViolations: number
  }
}
