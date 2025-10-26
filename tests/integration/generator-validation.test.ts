import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const execFileAsync = promisify(execFile)
const projectRoot = path.resolve(__dirname, '..', '..')
const generatorScript = path.join(projectRoot, 'scripts', 'solution-generator', 'index.ts')
const validatorScript = path.join(projectRoot, 'scripts', 'validate-field-quality.ts')

const goalId = process.env.WWFM_GENERATOR_FIXTURE_GOAL_ID ?? '56e2801e-0d78-4abd-a795-869e5b780ae7'

const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY)

describe.skipIf(!hasSupabaseEnv || !hasGeminiKey)(
  'Solution generator → validator pipeline',
  () => {
    test(
      'dry-run generation succeeds and validator reports zero issues',
      async () => {
        const env = {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV ?? 'test'
        }

        const generatorArgs = [
          generatorScript,
          `--goal-id=${goalId}`,
          '--limit=1',
          '--batch-size=1',
          '--dry-run'
        ]

        const validatorArgs = [
          validatorScript,
          `--goal-id=${goalId}`,
          '--assert-zero',
          '--show-good-quality'
        ]

        // Run generator in dry-run mode to ensure prompts/validation do not throw
        const generatorResult = await execFileAsync('npx', ['tsx', ...generatorArgs], {
          cwd: projectRoot,
          env,
          maxBuffer: 10 * 1024 * 1024
        })

        expect(generatorResult.stdout).toContain('DRY RUN MODE')

        // Validate resulting goal data must have zero issues
        const validatorResult = await execFileAsync('npx', ['tsx', ...validatorArgs], {
          cwd: projectRoot,
          env,
          maxBuffer: 10 * 1024 * 1024
        })

        expect(validatorResult.stdout).toContain('Validation Complete')
        expect(validatorResult.stdout).not.toContain('Validation detected')
      },
      { timeout: 300_000 }
    )
  }
)
