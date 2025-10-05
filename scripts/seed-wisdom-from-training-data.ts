#!/usr/bin/env tsx

/**
 * Seed Wisdom Data from Training Data
 *
 * Generates realistic wisdom data based on training data knowledge about
 * long-term impact of achieving various life goals. No API calls needed.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { Command } from 'commander'
import chalk from 'chalk'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const program = new Command()

program
  .name('seed-wisdom-from-training-data')
  .description('Generate wisdom data directly from training knowledge')
  .option('--dry-run', 'Preview changes without applying them')
  .parse()

const options = program.opts()
const isDryRun = Boolean(options.dryRun)

interface Goal {
  id: string
  title: string
  arena: string
}

interface WisdomData {
  lasting_value_score: number
  common_benefits: string[]
}

/**
 * Generate wisdom data based on training knowledge about goal achievement
 */
function generateWisdomForGoal(goal: Goal): WisdomData {
  const title = goal.title.toLowerCase()
  const arena = goal.arena.toLowerCase()

  // Mental Health goals tend to have high lasting impact
  if (arena.includes('mental') || arena.includes('emotional')) {
    if (title.includes('anxiety') || title.includes('calm')) {
      return {
        lasting_value_score: 4.2,
        common_benefits: [
          "Started making decisions more quickly without second-guessing myself",
          "Noticed I could handle unexpected challenges without spiraling",
          "Found myself enjoying social situations I used to avoid",
          "Developed a better relationship with uncertainty",
          "Started sleeping better without my mind racing at night",
          "Discovered I could be present in conversations instead of planning what to say next"
        ]
      }
    }
    if (title.includes('depression') || title.includes('mood')) {
      return {
        lasting_value_score: 4.3,
        common_benefits: [
          "Rediscovered hobbies and interests I'd lost touch with",
          "Found myself laughing genuinely again",
          "Started showing up for friends and family in ways I couldn't before",
          "Noticed colors seemed brighter and food tasted better",
          "Developed resilience I didn't know I had",
          "Found meaning in small daily moments I used to overlook"
        ]
      }
    }
    if (title.includes('stress') || title.includes('overwhelm')) {
      return {
        lasting_value_score: 3.8,
        common_benefits: [
          "Learned to recognize early warning signs before burning out",
          "Started setting boundaries I never thought I'd be able to maintain",
          "Found I could say no without feeling guilty",
          "Developed a more realistic sense of what I can accomplish in a day",
          "Noticed I was getting sick less often",
          "Started enjoying weekends instead of dreading Monday"
        ]
      }
    }
    if (title.includes('confidence') || title.includes('self-esteem')) {
      return {
        lasting_value_score: 4.1,
        common_benefits: [
          "Started taking on challenges I would have automatically declined",
          "Found myself speaking up in meetings without rehearsing first",
          "Stopped comparing myself to others as much",
          "Noticed people responding differently to me in social situations",
          "Started dressing in ways that felt authentic instead of safe",
          "Developed the courage to end relationships that weren't serving me"
        ]
      }
    }
    // Default mental health
    return {
      lasting_value_score: 3.9,
      common_benefits: [
        "Developed better self-awareness about my emotional patterns",
        "Found healthier ways to process difficult feelings",
        "Started being kinder to myself during setbacks",
        "Noticed improvements in my relationships",
        "Felt more in control of my mental state",
        "Discovered tools I can use for the rest of my life"
      ]
    }
  }

  // Physical Health goals
  if (arena.includes('physical')) {
    if (title.includes('sleep')) {
      return {
        lasting_value_score: 4.4,
        common_benefits: [
          "Had energy for creative projects I'd been putting off",
          "Noticed I was more patient with people",
          "Found I could learn new things more easily",
          "Started waking up naturally without an alarm",
          "Discovered I actually enjoyed mornings",
          "Felt like I got hours back in my day from being more alert"
        ]
      }
    }
    if (title.includes('weight') || title.includes('lose')) {
      return {
        lasting_value_score: 3.4,
        common_benefits: [
          "Developed a healthier relationship with food",
          "Found physical activities I actually enjoy",
          "Noticed improvements in how my clothes fit",
          "Started feeling more comfortable in my body",
          "Discovered I had more energy throughout the day",
          "Learned to recognize true hunger vs emotional eating"
        ]
      }
    }
    if (title.includes('exercise') || title.includes('fitness')) {
      return {
        lasting_value_score: 3.9,
        common_benefits: [
          "Started handling stress better through physical activity",
          "Found a community of people with similar goals",
          "Noticed I was sleeping better at night",
          "Developed mental toughness that carried into other areas",
          "Started feeling strong and capable in my daily life",
          "Discovered the mental clarity that comes after working out"
        ]
      }
    }
    if (title.includes('pain') || title.includes('chronic')) {
      return {
        lasting_value_score: 3.7,
        common_benefits: [
          "Learned to pace myself better throughout the day",
          "Found activities I can do without triggering symptoms",
          "Developed better communication with healthcare providers",
          "Started advocating for myself more effectively",
          "Discovered the connection between stress and my symptoms",
          "Found a support community that truly understands"
        ]
      }
    }
    // Default physical health
    return {
      lasting_value_score: 3.6,
      common_benefits: [
        "Felt more energetic throughout the day",
        "Noticed improvements in how my body feels",
        "Started making healthier choices in other areas",
        "Developed sustainable habits instead of quick fixes",
        "Found I could do physical activities I couldn't before",
        "Discovered the importance of preventive care"
      ]
    }
  }

  // Work & Career goals
  if (arena.includes('work') || arena.includes('career')) {
    if (title.includes('promotion') || title.includes('advance')) {
      return {
        lasting_value_score: 3.5,
        common_benefits: [
          "Gained confidence that opened doors to other opportunities",
          "Started being seen as a leader by colleagues",
          "Found I could handle more responsibility than I thought",
          "Developed negotiation skills useful beyond work",
          "Noticed increased respect from peers and management",
          "Discovered I was capable of more than I gave myself credit for"
        ]
      }
    }
    if (title.includes('interview')) {
      return {
        lasting_value_score: 3.9,
        common_benefits: [
          "Found myself more confident in everyday conversations",
          "Developed a stronger sense of self-worth",
          "Started articulating my value in relationships too",
          "Learned to tell my story in compelling ways",
          "Noticed I was better at networking naturally",
          "Discovered how to present myself authentically"
        ]
      }
    }
    if (title.includes('balance') || title.includes('burnout')) {
      return {
        lasting_value_score: 4.0,
        common_benefits: [
          "Started actually enjoying my time off instead of feeling guilty",
          "Found I was more productive during work hours",
          "Developed boundaries that improved all my relationships",
          "Noticed I was getting sick less frequently",
          "Started being present with family instead of thinking about work",
          "Discovered hobbies and interests outside of my career"
        ]
      }
    }
    // Default career
    return {
      lasting_value_score: 3.6,
      common_benefits: [
        "Developed skills that serve me across many situations",
        "Gained clarity about what I want from my career",
        "Started feeling more in control of my professional path",
        "Found confidence that extended beyond work",
        "Noticed improvements in how I communicate professionally",
        "Discovered I could advocate for myself effectively"
      ]
    }
  }

  // Relationships goals
  if (arena.includes('relationship')) {
    if (title.includes('dating') || title.includes('partner')) {
      return {
        lasting_value_score: 4.1,
        common_benefits: [
          "Learned what I actually want in a relationship",
          "Developed better communication skills across all relationships",
          "Started recognizing red flags earlier",
          "Found confidence that made me more attractive generally",
          "Discovered the importance of maintaining my own identity",
          "Learned to be vulnerable in healthy ways"
        ]
      }
    }
    if (title.includes('friend') || title.includes('social')) {
      return {
        lasting_value_score: 4.3,
        common_benefits: [
          "Found a sense of belonging I didn't have before",
          "Started feeling less lonely even when alone",
          "Developed a support network for tough times",
          "Noticed I was more confident in social situations",
          "Discovered activities and interests through friends",
          "Felt more connected to my community"
        ]
      }
    }
    if (title.includes('boundaries')) {
      return {
        lasting_value_score: 4.4,
        common_benefits: [
          "Started feeling less resentful in my relationships",
          "Found I had more energy for things I care about",
          "Noticed toxic relationships naturally falling away",
          "Developed respect for myself I'd been missing",
          "Started attracting healthier relationships",
          "Discovered saying no can strengthen connections"
        ]
      }
    }
    // Default relationships
    return {
      lasting_value_score: 3.9,
      common_benefits: [
        "Developed better communication skills",
        "Started feeling more connected to others",
        "Found healthier relationship patterns",
        "Noticed improvements in conflict resolution",
        "Discovered the importance of emotional intimacy",
        "Learned to maintain my identity while being close to others"
      ]
    }
  }

  // Financial goals
  if (arena.includes('financial') || title.includes('money') || title.includes('save')) {
    if (title.includes('debt')) {
      return {
        lasting_value_score: 4.5,
        common_benefits: [
          "Started sleeping through the night without money worries",
          "Felt a weight lifted that I'd been carrying for years",
          "Found I could make choices based on what I want, not just what I can afford",
          "Developed financial discipline that serves me in many ways",
          "Noticed reduced stress in my relationships",
          "Started dreaming about the future instead of dreading it"
        ]
      }
    }
    if (title.includes('save') || title.includes('emergency')) {
      return {
        lasting_value_score: 4.2,
        common_benefits: [
          "Started feeling secure for the first time in years",
          "Found I could handle unexpected expenses without panic",
          "Developed patience and delayed gratification skills",
          "Noticed I was making better decisions generally",
          "Started thinking long-term instead of just surviving",
          "Discovered the peace that comes with financial cushion"
        ]
      }
    }
    // Default financial
    return {
      lasting_value_score: 3.8,
      common_benefits: [
        "Developed healthier relationship with money",
        "Started feeling more in control of my financial future",
        "Found skills that will serve me for life",
        "Noticed reduced financial stress affecting everything",
        "Learned to make intentional choices with money",
        "Discovered the connection between values and spending"
      ]
    }
  }

  // Personal Growth goals
  if (arena.includes('personal growth') || arena.includes('self')) {
    if (title.includes('learn') || title.includes('skill')) {
      return {
        lasting_value_score: 3.7,
        common_benefits: [
          "Rediscovered the joy of learning I had as a child",
          "Started believing I can learn anything with practice",
          "Found a creative outlet that brings me genuine joy",
          "Developed patience with myself during the learning process",
          "Noticed improved problem-solving in other areas",
          "Discovered a community of people passionate about the same thing"
        ]
      }
    }
    if (title.includes('purpose') || title.includes('meaning')) {
      return {
        lasting_value_score: 4.6,
        common_benefits: [
          "Started making decisions aligned with my values",
          "Found direction when I felt completely lost",
          "Developed clarity about what matters to me",
          "Noticed I was more resilient during challenges",
          "Started feeling fulfilled instead of just busy",
          "Discovered work and activities that truly energize me"
        ]
      }
    }
    // Default personal growth
    return {
      lasting_value_score: 3.8,
      common_benefits: [
        "Developed greater self-awareness",
        "Started understanding my patterns and triggers",
        "Found tools for continuous improvement",
        "Noticed I was making better life choices",
        "Learned to be more compassionate with myself",
        "Discovered strengths I didn't know I had"
      ]
    }
  }

  // Productivity goals
  if (title.includes('productive') || title.includes('procrastination') || title.includes('focus')) {
    return {
      lasting_value_score: 3.6,
      common_benefits: [
        "Started finishing projects I'd been putting off for years",
        "Found I had more free time than I thought",
        "Developed systems that work with my brain, not against it",
        "Noticed reduced guilt about how I spend my time",
        "Started feeling accomplished instead of busy",
        "Discovered the satisfaction of deep work"
      ]
    }
  }

  // Default for any other goals
  return {
    lasting_value_score: 3.5,
    common_benefits: [
      "Developed greater confidence in my ability to change",
      "Started believing goals are achievable with the right approach",
      "Found tools and strategies that work for me",
      "Noticed positive changes extending to other life areas",
      "Learned what doesn't work as well as what does",
      "Discovered the importance of consistent small steps"
    ]
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🌟 Seed Wisdom Data from Training Knowledge\n'))

  if (isDryRun) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No changes will be saved\n'))
  }

  // Fetch all goals
  console.log(chalk.blue('📊 Loading all goals from database...'))
  const { data: goalsData, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      arenas!inner (
        name
      )
    `)
    .order('title')

  if (goalsError || !goalsData) {
    throw new Error(`Failed to fetch goals: ${goalsError?.message}`)
  }

  const goals: Goal[] = goalsData.map(g => {
    const arenaData = (g.arenas ?? null) as { name?: string } | null
    return {
      id: g.id,
      title: g.title,
      arena: arenaData?.name ?? 'Unknown'
    }
  })

  console.log(chalk.green(`✅ Loaded ${goals.length} goals\n`))

  let processed = 0
  let errors = 0

  // Process each goal
  for (const goal of goals) {
    try {
      console.log(chalk.cyan(`Processing: ${goal.title} (${goal.arena})`))

      // Generate wisdom data
      const wisdom = generateWisdomForGoal(goal)

      console.log(
        chalk.gray(
          `  Score: ${wisdom.lasting_value_score}/5 | Benefits: ${wisdom.common_benefits.length}`
        )
      )

      if (!isDryRun) {
        // Check if exists
        const { data: existing } = await supabase
          .from('goal_wisdom_scores')
          .select('id')
          .eq('goal_id', goal.id)
          .single()

        if (existing) {
          // Update
          const { error } = await supabase
            .from('goal_wisdom_scores')
            .update({
              lasting_value_score: wisdom.lasting_value_score,
              common_benefits: wisdom.common_benefits,
              total_retrospectives: 0,
              data_source: 'ai_training_data',
              ai_generated_at: new Date().toISOString(),
              retrospectives_6m: 0,
              retrospectives_12m: 0
            })
            .eq('goal_id', goal.id)

          if (error) throw error
          console.log(chalk.blue('  ✓ Updated'))
        } else {
          // Insert
          const { error } = await supabase.from('goal_wisdom_scores').insert({
            goal_id: goal.id,
            lasting_value_score: wisdom.lasting_value_score,
            common_benefits: wisdom.common_benefits,
            total_retrospectives: 0,
            data_source: 'ai_training_data',
            ai_generated_at: new Date().toISOString(),
            retrospectives_6m: 0,
            retrospectives_12m: 0,
            worth_pursuing_percentage: null
          })

          if (error) throw error
          console.log(chalk.green('  ✓ Inserted'))
        }
      } else {
        console.log(chalk.yellow('  [DRY RUN] Would save'))
      }

      processed++
    } catch (error) {
      console.error(chalk.red(`  ✗ Error: ${(error as Error).message}`))
      errors++
    }
  }

  // Summary
  console.log(chalk.bold.green(`\n✅ Complete!\n`))
  console.log(chalk.blue('📊 Summary:'))
  console.log(chalk.gray(`  Processed: ${processed}`))
  console.log(chalk.gray(`  Errors: ${errors}`))

  if (isDryRun) {
    console.log(chalk.yellow('\n🔍 DRY RUN - No changes were saved\n'))
  }
}

main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}\n`))
  process.exit(1)
})
