import { GeminiClient } from './gemini-client'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  deduplicateDistributionData,
  DistributionData,
  generateEnhancedPrompt,
  generateFallbackPrompt,
  getRequiredFields,
  mapFieldToDropdown,
  normalizeDistributionData,
  validateFieldData
} from '../../../../../lib/ai-generation/fields'
import { CATEGORY_FIELDS } from '../config/category-fields'
import { insertSolutionToDatabase } from '../database/inserter'
import { getV2SolutionPrompt } from '../prompts/master-prompts-v2'
import { parseJSONSafely } from '../utils/json-repair'
import chalk from 'chalk'

export interface Goal {
  id: string
  title: string
  description?: string
  arena_id?: string
  arenas?: { name: string }
  categories?: { name: string }
}

export interface GenerationOptions {
  dryRun?: boolean
  limit?: number
  forceWrite?: boolean
  dirtyOnly?: boolean
}

interface RawSolution {
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  variants?: Array<{
    amount?: number
    unit?: string
    form: string
  }>
}

const MAX_FIELD_ATTEMPTS = 2

export async function generateSolutionsForGoal(
  goal: Goal,
  supabase: SupabaseClient,
  options: GenerationOptions = {}
): Promise<number> {
  const { dryRun = false, limit = 15, forceWrite = false, dirtyOnly = false } = options
  const gemini = new GeminiClient(process.env.GEMINI_API_KEY!)
  const stats = gemini.getUsageStats()
  if (stats.requestsToday === 0) {
    console.log(chalk.cyan(`   📊 Starting fresh today (${stats.requestsRemaining} requests available)`))
  }

  console.log(chalk.gray('   🤖 Consulting AI for evidence-based solutions...'))
  const solutionsPrompt = getV2SolutionPrompt(
    goal.title,
    goal.description || '',
    goal.arenas?.name || 'general',
    goal.categories?.name || 'general',
    limit
  )
  const response = await gemini.generateContent(solutionsPrompt)

  console.log(chalk.gray(`   📝 Response length: ${response.length} characters`))
  if (response.length > 4000) {
    console.log(chalk.yellow(`   ⚠️  Response might be truncated (${response.length} chars)`))
  }

  const parsedSolutions = parseSolutions(response)
  if (parsedSolutions.length === 0) {
    console.log(chalk.yellow('   ⚠️  No solutions generated for this goal'))
    return 0
  }

  console.log(chalk.gray(`   📋 AI recommended ${parsedSolutions.length} solutions`))
  parsedSolutions
    .slice(0, 3)
    .forEach((sol, idx) => console.log(chalk.gray(`      ${idx + 1}. ${sol.title} (${sol.effectiveness}★) - ${sol.category}`)))

  if (dryRun) {
    parsedSolutions.forEach(sol => {
      console.log(chalk.gray(`      - ${sol.title} (${sol.category}): ${sol.effectiveness}★`))
    })
    return parsedSolutions.length
  }

  let insertedCount = 0

  for (const rawSolution of parsedSolutions) {
    const categoryConfig = CATEGORY_FIELDS[rawSolution.category]
    if (!categoryConfig) {
      console.log(chalk.yellow(`      ⚠️  Unknown category: ${rawSolution.category}, skipping`))
      continue
    }

    const requiredFields = getRequiredFields(rawSolution.category)
    if (requiredFields.length === 0) {
      console.log(chalk.yellow(`      ⚠️  No required fields configured for ${rawSolution.category}, skipping`))
      continue
    }

    console.log(chalk.gray(`   💾 Processing: ${rawSolution.title}`))

    const fieldMap: Record<string, DistributionData> = {}
    let failed = false

    for (const field of requiredFields) {
      try {
        const distribution = await generateFieldDistribution({
          fieldName: field,
          category: rawSolution.category,
          solutionName: rawSolution.title,
          goalTitle: goal.title,
          gemini
        })
        fieldMap[field] = distribution
      } catch (error) {
        failed = true
        console.log(
          chalk.red(
            `      ❌ Skipping ${rawSolution.title} – failed to generate ${field}: ${(error as Error).message}`
          )
        )
        break
      }
    }

    if (failed) {
      continue
    }

    try {
      await insertSolutionToDatabase(
        goal,
        {
          title: rawSolution.title,
          description: rawSolution.description,
          category: rawSolution.category,
          effectiveness: rawSolution.effectiveness,
          effectiveness_rationale: rawSolution.effectiveness_rationale,
          variants: rawSolution.variants,
          fields: fieldMap
        },
        supabase,
        categoryConfig,
        {
          forceWrite,
          dirtyOnly
        }
      )
      insertedCount++
    } catch (error) {
      console.log(chalk.red(`      ❌ Failed to insert ${rawSolution.title}: ${(error as Error).message}`))
    }
  }

  return insertedCount
}

function parseSolutions(response: string): RawSolution[] {
  try {
    const parsed = parseJSONSafely(response)
    if (!Array.isArray(parsed)) return []
    return (parsed as RawSolution[]).map(solution => ({
      ...solution,
      description: solution.description ?? '',
      variants: solution.variants ?? []
    }))
  } catch (error) {
    console.log(chalk.red(`   ❌ Failed to parse solutions JSON: ${(error as Error).message}`))
    return []
  }
}

async function generateFieldDistribution({
  fieldName,
  category,
  solutionName,
  goalTitle,
  gemini
}: {
  fieldName: string
  category: string
  solutionName: string
  goalTitle: string
  gemini: GeminiClient
}): Promise<DistributionData> {
  let attempts = 0
  let lastError = ''

  while (attempts < MAX_FIELD_ATTEMPTS) {
    try {
      const prompt =
        attempts === 0
          ? generateEnhancedPrompt(fieldName, solutionName, category, goalTitle)
          : generateFallbackPrompt(fieldName, solutionName, category, goalTitle, lastError)

      const rawResponse = await gemini.generateContent(prompt)
      const cleaned = rawResponse.replace(/```json\n?|```/g, '').trim()
      const parsed = parseJSONSafely(cleaned)
      const distribution = normalizeDistributionForStorage(category, fieldName, parsed)
      const validation = validateFieldData(distribution, fieldName, category)

      if (!validation.isValid) {
        throw new Error(validation.errors.join('; '))
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning =>
          console.log(chalk.yellow(`        ⚠️  ${fieldName}: ${warning}`))
        )
      }

      return distribution
    } catch (error) {
      lastError = (error as Error).message
      attempts++
      if (attempts >= MAX_FIELD_ATTEMPTS) {
        throw error
      }
      console.log(chalk.yellow(`        ⚠️  Retry ${attempts} for ${fieldName}: ${lastError}`))
    }
  }

  throw new Error(`Failed to generate distribution for ${fieldName}`)
}

function normalizeDistributionForStorage(
  category: string,
  fieldName: string,
  raw: any
): DistributionData {
  const base: DistributionData = {
    mode: typeof raw?.mode === 'string' ? raw.mode : '',
    totalReports: typeof raw?.totalReports === 'number' && raw.totalReports > 0 ? raw.totalReports : 100,
    dataSource: typeof raw?.dataSource === 'string' ? raw.dataSource : 'ai_training_data',
    values: Array.isArray(raw?.values)
      ? raw.values.map((value: any) => ({
          value: mapFieldToDropdown(category, fieldName, String(value?.value ?? '')),
          percentage:
            typeof value?.percentage === 'number'
              ? value.percentage
              : Math.min(100, Math.max(1, Number(value?.count ?? 1) / (raw?.totalReports || 100) * 100)),
          count:
            typeof value?.count === 'number'
              ? Math.max(1, Math.round(value.count))
              : Math.max(1, Math.round(value?.percentage ?? 0)),
          source: typeof value?.source === 'string' ? value.source : 'ai_training_data'
        }))
      : []
  }

  const deduped = deduplicateDistributionData(base)
  const normalized = normalizeDistributionData({
    ...deduped,
    mode: mapFieldToDropdown(category, fieldName, deduped.mode)
  })

  normalized.values = normalized.values.map(value => ({
    ...value,
    value: mapFieldToDropdown(category, fieldName, value.value),
    count: value.count ?? Math.max(1, Math.round((value.percentage / 100) * normalized.totalReports)),
    source: value.source || 'ai_training_data'
  }))

  return normalized
}
