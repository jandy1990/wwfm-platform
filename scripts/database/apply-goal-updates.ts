#!/usr/bin/env tsx

/**
 * Apply pending goal additions and renames from DATABASE_ADDITIONS.md
 *
 * Usage:
 *   npx tsx scripts/database/apply-goal-updates.ts            # dry run (no changes)
 *   npx tsx scripts/database/apply-goal-updates.ts --apply    # execute inserts + updates
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY)')
}

const supabase = createClient(supabaseUrl, serviceKey)

interface NewGoalConfig {
  title: string
  description: string
  categoryName: string
  emoji: string | null
  metaTags: string[]
  arenaOverrideSlug?: string
}

interface RenameConfig {
  oldTitle: string
  newTitle: string
  newDescription: string
}

const NEW_GOALS: NewGoalConfig[] = [
  {
    title: 'Live with social anxiety',
    description: 'Live with my social anxiety',
    categoryName: 'Anxiety & Worry',
    emoji: '🫶',
    metaTags: ['LIVE', 'SOCIAL', 'ANXIETY', 'COPE']
  },
  {
    title: 'Find life purpose',
    description: 'Find my life purpose',
    categoryName: 'Taking Control',
    emoji: '🧭',
    metaTags: ['FIND', 'PURPOSE', 'MEANING', 'DIRECTION']
  },
  {
    title: 'Improve memory',
    description: 'Improve my memory',
    categoryName: 'Learning & Development',
    emoji: '🧠',
    metaTags: ['IMPROVE', 'MEMORY', 'RECALL', 'FOCUS']
  },
  {
    title: 'Get in shape',
    description: 'Get my body in shape',
    categoryName: 'Exercise & Fitness',
    emoji: '🏃',
    metaTags: ['GET', 'SHAPE', 'FITNESS', 'ENERGY']
  },
  {
    title: 'Manage stress',
    description: 'Manage my stress',
    categoryName: 'Overwhelm & Stress',
    emoji: '🧘',
    metaTags: ['MANAGE', 'STRESS', 'BALANCE', 'CALM']
  },
  {
    title: 'Manage diabetes',
    description: 'Manage my diabetes',
    categoryName: 'Health Conditions',
    emoji: '🩸',
    metaTags: ['MANAGE', 'DIABETES', 'GLUCOSE', 'CONTROL']
  },
  {
    title: 'Manage bipolar disorder',
    description: 'Manage my bipolar disorder',
    categoryName: 'Sadness & Depression',
    emoji: '⚖️',
    metaTags: ['MANAGE', 'BIPOLAR', 'MOOD', 'STABILITY']
  },
  {
    title: 'Reduce inflammation',
    description: 'Reduce my inflammation',
    categoryName: 'Health Conditions',
    emoji: '🧊',
    metaTags: ['REDUCE', 'INFLAMMATION', 'HEAL', 'CALM']
  },
  {
    title: 'Reduce bloating',
    description: 'Reduce my bloating',
    categoryName: 'Food & Nutrition',
    emoji: '🥦',
    metaTags: ['REDUCE', 'BLOATING', 'DIGESTION', 'COMFORT']
  },
  {
    title: 'Reduce headaches',
    description: 'Reduce my headaches',
    categoryName: 'Health Conditions',
    emoji: '🤕',
    metaTags: ['REDUCE', 'HEADACHE', 'PAIN', 'RELIEF']
  },
  {
    title: 'Improve immune system',
    description: 'Improve my immune system',
    categoryName: 'Health Conditions',
    emoji: '🛡️',
    metaTags: ['IMPROVE', 'IMMUNE', 'DEFENSE', 'HEALTH']
  },
  {
    title: 'Stop hair loss',
    description: 'Stop my hair loss',
    categoryName: 'Hair & Grooming',
    emoji: '🧑‍🦱',
    metaTags: ['STOP', 'HAIR', 'LOSS', 'GROWTH']
  },
  {
    title: 'Improve skin texture',
    description: 'Improve my skin texture',
    categoryName: 'Appearance & Skin',
    emoji: '✨',
    metaTags: ['IMPROVE', 'SKIN', 'TEXTURE', 'GLOW']
  },
  {
    title: 'Stop teeth grinding',
    description: 'Stop my teeth grinding',
    categoryName: 'Sleep & Energy',
    emoji: '😬',
    metaTags: ['STOP', 'TEETH', 'GRINDING', 'SLEEP']
  },
  {
    title: 'Reduce brain fog',
    description: 'Reduce my brain fog',
    categoryName: 'Sleep & Energy',
    emoji: '🌤️',
    metaTags: ['REDUCE', 'BRAIN', 'FOG', 'CLARITY']
  },
  {
    title: 'Improve productivity',
    description: 'Improve my productivity',
    categoryName: 'Time & Productivity',
    emoji: '📈',
    metaTags: ['IMPROVE', 'PRODUCTIVITY', 'FOCUS', 'OUTPUT']
  },
  {
    title: 'Minimize distractions',
    description: 'Minimize my distractions',
    categoryName: 'Time & Productivity',
    emoji: '🔕',
    metaTags: ['MINIMIZE', 'DISTRACTIONS', 'FOCUS', 'ATTENTION']
  },
  {
    title: 'Improve public speaking',
    description: 'Improve my public speaking',
    categoryName: 'Professional Skills',
    emoji: '🎤',
    metaTags: ['IMPROVE', 'PUBLIC', 'SPEAKING', 'CONFIDENCE']
  },
  {
    title: 'Improve credit score',
    description: 'Improve my credit score',
    categoryName: 'Money Management',
    emoji: '💳',
    metaTags: ['IMPROVE', 'CREDIT', 'SCORE', 'FINANCE']
  },
  {
    title: 'Negotiate salary',
    description: 'Negotiate my salary',
    categoryName: 'Income & Earnings',
    emoji: '🤝',
    metaTags: ['NEGOTIATE', 'SALARY', 'PAY', 'VALUE']
  },
  {
    title: 'Improve communication skills',
    description: 'Improve my communication skills',
    categoryName: 'Communication & Social',
    emoji: '💬',
    metaTags: ['IMPROVE', 'COMMUNICATION', 'SKILLS', 'CONNECT']
  },
  {
    title: 'Overcome perfectionism',
    description: 'Overcome my perfectionism',
    categoryName: 'Self-Improvement',
    emoji: '🌱',
    metaTags: ['OVERCOME', 'PERFECTIONISM', 'GROWTH', 'BALANCE']
  },
  {
    title: 'Improve endurance',
    description: 'Improve my endurance',
    categoryName: 'Exercise & Fitness',
    emoji: '🏃‍♂️',
    metaTags: ['IMPROVE', 'ENDURANCE', 'STAMINA', 'TRAIN']
  },
  {
    title: 'Reduce sugar intake',
    description: 'Reduce my sugar intake',
    categoryName: 'Food & Nutrition',
    emoji: '🍓',
    metaTags: ['REDUCE', 'SUGAR', 'INTAKE', 'BALANCE']
  },
  {
    title: 'Wake up earlier',
    description: 'Wake up earlier',
    categoryName: 'Sleep & Energy',
    emoji: '⏰',
    metaTags: ['WAKE', 'EARLY', 'ROUTINE', 'MORNING']
  },
  {
    title: 'Quit caffeine',
    description: 'Quit caffeine',
    categoryName: 'Sleep & Energy',
    emoji: '🫖',
    metaTags: ['QUIT', 'CAFFEINE', 'ENERGY', 'BALANCE']
  },
  {
    title: 'Quit energy drinks',
    description: 'Quit energy drinks',
    categoryName: 'Sleep & Energy',
    emoji: '⚡',
    metaTags: ['QUIT', 'ENERGY', 'DRINKS', 'HEALTH']
  },
  {
    title: 'Quit junk food',
    description: 'Quit junk food',
    categoryName: 'Food & Nutrition',
    emoji: '🥗',
    metaTags: ['QUIT', 'JUNK', 'FOOD', 'HEALTH']
  },
  {
    title: 'Reduce screen time',
    description: 'Reduce my screen time',
    categoryName: 'Digital Life Management',
    emoji: '📵',
    metaTags: ['REDUCE', 'SCREEN', 'TIME', 'FOCUS']
  },
  {
    title: 'Do digital detox',
    description: 'Do a digital detox',
    categoryName: 'Digital Life Management',
    emoji: '🌿',
    metaTags: ['DIGITAL', 'DETOX', 'RESET', 'BALANCE']
  }
]

const RENAMES: RenameConfig[] = [
  { oldTitle: 'Quiet racing mind', newTitle: 'Stop overthinking', newDescription: 'Stop overthinking everything' },
  { oldTitle: 'Have a flatter stomach', newTitle: 'Lose belly fat', newDescription: 'Lose my belly fat' },
  { oldTitle: 'Stop insomnia', newTitle: 'Overcome insomnia', newDescription: 'Overcome my insomnia' },
  { oldTitle: 'Manage depression symptoms', newTitle: 'Live with depression', newDescription: 'Live with my depression' },
  { oldTitle: 'Control OCD behaviors', newTitle: 'Live with OCD', newDescription: 'Live with my OCD' },
  { oldTitle: 'Manage ADHD symptoms', newTitle: 'Live with ADHD', newDescription: 'Live with my ADHD' },
  { oldTitle: 'Control my temper', newTitle: 'Manage anger/temper', newDescription: 'Manage my anger and temper' },
  { oldTitle: 'Develop social ease', newTitle: 'Improve social skills', newDescription: 'Improve my social skills' },
  { oldTitle: 'Stop procrastinating', newTitle: 'Overcome procrastination', newDescription: 'Overcome my procrastination' },
  { oldTitle: 'Maintain deep focus', newTitle: 'Improve focus', newDescription: 'Improve my focus' },
  { oldTitle: 'Save money consistently', newTitle: 'Save money', newDescription: 'Save my money consistently' },
  { oldTitle: 'Build muscle mass', newTitle: 'Build muscle', newDescription: 'Build my muscle' },
  { oldTitle: 'Start exercising regularly', newTitle: 'Start exercising', newDescription: 'Start exercising regularly' },
  { oldTitle: 'Get stronger', newTitle: 'Build strength', newDescription: 'Build my strength' }
]

const program = new Command()
program.option('--apply', 'Execute inserts/updates (default is dry-run)')
program.parse()
const { apply } = program.opts<{ apply?: boolean }>()
const dryRun = !apply

type CategoryRecord = {
  id: string
  name: string
  arena_id: string
}

async function loadCategories(): Promise<Map<string, CategoryRecord>> {
  const { data, error } = await supabase.from('categories').select('id, name, arena_id')
  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`)
  }

  const map = new Map<string, CategoryRecord>()
  for (const category of data ?? []) {
    map.set(category.name.toLowerCase(), category)
  }
  return map
}

async function ensureGoalNotExists(title: string): Promise<boolean> {
  const { data, error } = await supabase.from('goals').select('id').eq('title', title).maybeSingle()
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check existing goal "${title}": ${error.message}`)
  }
  return Boolean(data)
}

async function insertNewGoals(categories: Map<string, CategoryRecord>) {
  console.log(chalk.blue('\n📥 Inserting new goals'))
  const results: Array<{ title: string; status: string; id?: string }> = []

  for (const goal of NEW_GOALS) {
    const category = categories.get(goal.categoryName.toLowerCase())
    if (!category) {
      console.log(chalk.red(`  ✖ Category not found: ${goal.categoryName} (goal: ${goal.title})`))
      continue
    }

    const exists = await ensureGoalNotExists(goal.title)
    if (exists) {
      results.push({ title: goal.title, status: 'exists' })
      console.log(chalk.yellow(`  ⚠️  Goal already exists, skipping: ${goal.title}`))
      continue
    }

    const payload = {
      title: goal.title,
      description: goal.description,
      category_id: category.id,
      arena_id: goal.arenaOverrideSlug ? await lookupArenaId(goal.arenaOverrideSlug) : category.arena_id,
      emoji: goal.emoji,
      is_approved: true,
      meta_tags: goal.metaTags
    }

    if (dryRun) {
      results.push({ title: goal.title, status: 'dry-run' })
      console.log(
        chalk.gray(
          `  🔍 Dry-run insert: ${goal.title} (category: ${goal.categoryName}, arena: ${payload.arena_id})`
        )
      )
      continue
    }

    const { data, error } = await supabase
      .from('goals')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.log(chalk.red(`  ✖ Failed to insert ${goal.title}: ${error.message}`))
      results.push({ title: goal.title, status: 'error' })
      continue
    }

    results.push({ title: goal.title, status: 'inserted', id: data?.id })
    console.log(chalk.green(`  ✅ Inserted ${goal.title} (id: ${data?.id})`))
  }

  return results
}

async function lookupArenaId(slug: string): Promise<string> {
  const { data, error } = await supabase.from('arenas').select('id').eq('slug', slug).single()
  if (error) {
    throw new Error(`Failed to resolve arena slug "${slug}": ${error.message}`)
  }
  return data.id
}

async function applyRenames() {
  console.log(chalk.blue('\n✏️  Applying goal renames'))
  const summary: Array<{ oldTitle: string; newTitle: string; status: string }> = []

  for (const rename of RENAMES) {
    const { data: current, error } = await supabase
      .from('goals')
      .select('id, title, description')
      .eq('title', rename.oldTitle)
      .single()

    if (error) {
      console.log(chalk.red(`  ✖ Could not find goal "${rename.oldTitle}": ${error.message}`))
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'missing' })
      continue
    }

    if (current.title === rename.newTitle) {
      console.log(chalk.gray(`  ⏭️  Already renamed: ${rename.oldTitle}`))
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'already-updated' })
      continue
    }

    const { data: conflict, error: conflictError } = await supabase
      .from('goals')
      .select('id')
      .eq('title', rename.newTitle)
      .maybeSingle()

    if (conflictError && conflictError.code !== 'PGRST116') {
      console.log(chalk.red(`  ✖ Conflict check failed for "${rename.newTitle}": ${conflictError.message}`))
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'error' })
      continue
    }

    if (conflict && conflict.id !== current.id) {
      console.log(
        chalk.red(
          `  ✖ Cannot rename "${rename.oldTitle}" to "${rename.newTitle}" – another goal already uses that title`
        )
      )
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'conflict' })
      continue
    }

    if (dryRun) {
      console.log(chalk.gray(`  🔍 Dry-run rename: "${rename.oldTitle}" → "${rename.newTitle}"`))
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'dry-run' })
      continue
    }

    const { error: updateError } = await supabase
      .from('goals')
      .update({
        title: rename.newTitle,
        description: rename.newDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id)

    if (updateError) {
      console.log(
        chalk.red(
          `  ✖ Failed to rename "${rename.oldTitle}" → "${rename.newTitle}": ${updateError.message}`
        )
      )
      summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'error' })
      continue
    }

    console.log(chalk.green(`  ✅ Renamed "${rename.oldTitle}" → "${rename.newTitle}"`))
    summary.push({ oldTitle: rename.oldTitle, newTitle: rename.newTitle, status: 'updated' })
  }

  return summary
}

async function main() {
  console.log(chalk.white(`Goal database update – ${dryRun ? 'DRY RUN' : 'APPLYING CHANGES'}`))
  const categories = await loadCategories()

  const insertResults = await insertNewGoals(categories)
  const renameResults = await applyRenames()

  console.log(chalk.white('\n📄 Summary'))
  console.log(
    chalk.white(
      `  New goals: ${insertResults.filter(r => r.status === 'inserted').length} inserted, ${
        insertResults.filter(r => r.status === 'exists').length
      } skipped (exists)`
    )
  )
  console.log(
    chalk.white(
      `  Renames: ${renameResults.filter(r => r.status === 'updated').length} updated, ${
        renameResults.filter(r => r.status === 'dry-run').length
      } dry-run`
    )
  )

  if (dryRun) {
    console.log(
      chalk.yellow('\nDry run complete – re-run with --apply to persist these changes once reviewed.')
    )
  }
}

main().catch(error => {
  console.error(chalk.red(`\nFatal error: ${error.message}`))
  process.exit(1)
})
