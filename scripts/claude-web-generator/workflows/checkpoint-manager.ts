/**
 * Checkpoint Manager for Claude Web Generator
 *
 * Enables multi-session generation with progress tracking:
 * - Save progress after each batch
 * - Resume from last checkpoint
 * - Track costs and validation metrics
 * - Handle interruptions gracefully
 */

import fs from 'fs'
import path from 'path'
import { CheckpointData, CLAUDE_WEB_CONFIG } from '../config'

const CHECKPOINT_PATH = path.resolve(process.cwd(), CLAUDE_WEB_CONFIG.CHECKPOINT_FILE)
const CHECKPOINT_BACKUP_PATH = `${CHECKPOINT_PATH}.backup`

/**
 * Save checkpoint data
 */
export function saveCheckpoint(data: CheckpointData): void {
  try {
    // Backup existing checkpoint
    if (fs.existsSync(CHECKPOINT_PATH)) {
      fs.copyFileSync(CHECKPOINT_PATH, CHECKPOINT_BACKUP_PATH)
    }

    // Write new checkpoint
    fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(data, null, 2), 'utf-8')

    console.log(`\n💾 Checkpoint saved: Batch ${data.currentBatch}, ${data.processedGoals}/${data.totalGoals} goals`)
  } catch (error) {
    console.error(`❌ Failed to save checkpoint: ${(error as Error).message}`)
  }
}

/**
 * Load checkpoint data
 */
export function loadCheckpoint(): CheckpointData | null {
  try {
    if (!fs.existsSync(CHECKPOINT_PATH)) {
      return null
    }

    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'))

    console.log(`\n📂 Checkpoint loaded: Batch ${data.currentBatch}, ${data.processedGoals}/${data.totalGoals} goals`)
    console.log(`   Last processed: ${data.lastProcessedGoalId}`)
    console.log(`   Timestamp: ${new Date(data.timestamp).toLocaleString()}`)
    console.log(`   Cost so far: $${data.estimatedCostSoFar.toFixed(2)}`)

    return data
  } catch (error) {
    console.error(`❌ Failed to load checkpoint: ${(error as Error).message}`)

    // Try backup
    if (fs.existsSync(CHECKPOINT_BACKUP_PATH)) {
      console.log(`   Attempting to load backup checkpoint...`)
      try {
        const backup = JSON.parse(fs.readFileSync(CHECKPOINT_BACKUP_PATH, 'utf-8'))
        return backup
      } catch (backupError) {
        console.error(`   Backup also corrupted`)
      }
    }

    return null
  }
}

/**
 * Delete checkpoint (after successful completion)
 */
export function clearCheckpoint(): void {
  try {
    if (fs.existsSync(CHECKPOINT_PATH)) {
      fs.unlinkSync(CHECKPOINT_PATH)
    }
    if (fs.existsSync(CHECKPOINT_BACKUP_PATH)) {
      fs.unlinkSync(CHECKPOINT_BACKUP_PATH)
    }
    console.log(`\n🗑️  Checkpoint cleared (generation complete)`)
  } catch (error) {
    console.error(`❌ Failed to clear checkpoint: ${(error as Error).message}`)
  }
}

/**
 * Initialize new checkpoint
 */
export function initializeCheckpoint(
  mode: 'full' | 'high-priority' | 'single-goal' | 'resume',
  totalGoals: number
): CheckpointData {
  const checkpoint: CheckpointData = {
    mode,
    totalGoals,
    processedGoals: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    currentBatch: 0,
    lastProcessedGoalId: '',
    timestamp: new Date().toISOString(),
    estimatedCostSoFar: 0,
    validationResults: {
      laughTestFailures: 0,
      duplicatesFound: 0,
      ssotViolations: 0,
      dropdownViolations: 0
    }
  }

  saveCheckpoint(checkpoint)
  return checkpoint
}

/**
 * Update checkpoint after batch completion
 */
export function updateCheckpoint(
  checkpoint: CheckpointData,
  batch: {
    goalId: string
    successfulSolutions: number
    failedSolutions: number
    validationResults: {
      laughTestFailures: number
      duplicatesFound: number
      ssotViolations: number
      dropdownViolations: number
    }
  }
): CheckpointData {
  const updated: CheckpointData = {
    ...checkpoint,
    processedGoals: checkpoint.processedGoals + 1,
    successfulGenerations: checkpoint.successfulGenerations + batch.successfulSolutions,
    failedGenerations: checkpoint.failedGenerations + batch.failedSolutions,
    currentBatch: checkpoint.currentBatch + 1,
    lastProcessedGoalId: batch.goalId,
    timestamp: new Date().toISOString(),
    estimatedCostSoFar: checkpoint.estimatedCostSoFar + CLAUDE_WEB_CONFIG.ESTIMATED_COST_PER_GOAL,
    validationResults: {
      laughTestFailures:
        checkpoint.validationResults.laughTestFailures + batch.validationResults.laughTestFailures,
      duplicatesFound:
        checkpoint.validationResults.duplicatesFound + batch.validationResults.duplicatesFound,
      ssotViolations: checkpoint.validationResults.ssotViolations + batch.validationResults.ssotViolations,
      dropdownViolations:
        checkpoint.validationResults.dropdownViolations + batch.validationResults.dropdownViolations
    }
  }

  saveCheckpoint(updated)
  return updated
}

/**
 * Display checkpoint status
 */
export function displayCheckpointStatus(checkpoint: CheckpointData): void {
  console.log(`\n📊 Generation Status:`)
  console.log(`   Mode: ${checkpoint.mode}`)
  console.log(`   Progress: ${checkpoint.processedGoals}/${checkpoint.totalGoals} goals (${((checkpoint.processedGoals / checkpoint.totalGoals) * 100).toFixed(1)}%)`)
  console.log(`   Current Batch: ${checkpoint.currentBatch}`)
  console.log(`   Successful: ${checkpoint.successfulGenerations} solutions`)
  console.log(`   Failed: ${checkpoint.failedGenerations} solutions`)
  console.log(`   Cost so far: $${checkpoint.estimatedCostSoFar.toFixed(2)} / $1000 budget`)

  if (checkpoint.validationResults.laughTestFailures > 0) {
    console.log(`   ⚠️  Laugh Test Failures: ${checkpoint.validationResults.laughTestFailures}`)
  }
  if (checkpoint.validationResults.duplicatesFound > 0) {
    console.log(`   ⚠️  Duplicates Found: ${checkpoint.validationResults.duplicatesFound}`)
  }
  if (checkpoint.validationResults.ssotViolations > 0) {
    console.log(`   ⚠️  SSOT Violations: ${checkpoint.validationResults.ssotViolations}`)
  }
  if (checkpoint.validationResults.dropdownViolations > 0) {
    console.log(`   ⚠️  Dropdown Violations: ${checkpoint.validationResults.dropdownViolations}`)
  }

  // Budget warning
  if (checkpoint.estimatedCostSoFar >= CLAUDE_WEB_CONFIG.BUDGET_ALERT_THRESHOLD) {
    console.log(`\n⚠️  WARNING: Approaching $1000 budget limit!`)
    console.log(`   Estimated cost: $${checkpoint.estimatedCostSoFar.toFixed(2)}`)
    console.log(`   Budget remaining: $${(1000 - checkpoint.estimatedCostSoFar).toFixed(2)}`)
  }

  // Time estimate
  const remainingGoals = checkpoint.totalGoals - checkpoint.processedGoals
  const estimatedTimeMinutes = Math.ceil(remainingGoals / CLAUDE_WEB_CONFIG.BATCH_SIZE) * 5
  if (remainingGoals > 0) {
    console.log(`\n⏱️  Estimated time remaining: ${estimatedTimeMinutes} minutes`)
    console.log(`   (${remainingGoals} goals in ${Math.ceil(remainingGoals / CLAUDE_WEB_CONFIG.BATCH_SIZE)} batches)`)
  }
}

/**
 * Check if generation is complete
 */
export function isGenerationComplete(checkpoint: CheckpointData): boolean {
  return checkpoint.processedGoals >= checkpoint.totalGoals
}

/**
 * Get resume instructions
 */
export function getResumeInstructions(checkpoint: CheckpointData): string {
  if (isGenerationComplete(checkpoint)) {
    return `
✅ Generation complete! All ${checkpoint.totalGoals} goals processed.

Summary:
- Successful: ${checkpoint.successfulGenerations} solutions
- Failed: ${checkpoint.failedGenerations} solutions
- Total cost: $${checkpoint.estimatedCostSoFar.toFixed(2)}

To clear checkpoint:
  npm run claude:generate -- --clear-checkpoint
`
  }

  const remaining = checkpoint.totalGoals - checkpoint.processedGoals
  return `
⏸️  Generation paused at batch ${checkpoint.currentBatch}.

Progress:
- Processed: ${checkpoint.processedGoals}/${checkpoint.totalGoals} goals
- Remaining: ${remaining} goals
- Cost so far: $${checkpoint.estimatedCostSoFar.toFixed(2)}

To resume:
  npm run claude:generate -- --mode=resume

To start fresh (loses progress):
  npm run claude:generate -- --mode=full --clear-checkpoint
`
}

/**
 * Export checkpoint summary for review
 */
export function exportCheckpointSummary(checkpoint: CheckpointData): void {
  const summary = {
    status: isGenerationComplete(checkpoint) ? 'complete' : 'in_progress',
    progress: {
      processed: checkpoint.processedGoals,
      total: checkpoint.totalGoals,
      percentage: ((checkpoint.processedGoals / checkpoint.totalGoals) * 100).toFixed(1)
    },
    results: {
      successful: checkpoint.successfulGenerations,
      failed: checkpoint.failedGenerations
    },
    cost: {
      current: checkpoint.estimatedCostSoFar,
      budget: 1000,
      remaining: 1000 - checkpoint.estimatedCostSoFar
    },
    validation: checkpoint.validationResults,
    timestamp: checkpoint.timestamp,
    lastGoalId: checkpoint.lastProcessedGoalId
  }

  const summaryPath = path.resolve(process.cwd(), CLAUDE_WEB_CONFIG.LOG_FILE)
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.log(`\n📄 Summary exported to: ${summaryPath}`)
}
