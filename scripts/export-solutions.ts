#!/usr/bin/env tsx

/**
 * Export all AI-generated solutions to a readable markdown file
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const CATEGORIES = [
  'medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare',
  'therapists_counselors', 'doctors_specialists', 'coaches_mentors', 'alternative_practitioners',
  'apps_software', 'products_devices', 'books_courses', 
  'exercise_movement', 'meditation_mindfulness', 'habits_routines', 'diet_nutrition', 'sleep_hygiene',
  'support_groups', 'groups_communities', 'hobbies_activities',
  'professional_services', 'medical_procedures', 'financial_products', 'crisis_resources'
]

const CATEGORY_LABELS: Record<string, string> = {
  medications: '💊 Medications',
  supplements_vitamins: '💊 Supplements & Vitamins',
  natural_remedies: '🌿 Natural Remedies',
  beauty_skincare: '✨ Beauty & Skincare',
  therapists_counselors: '🩺 Therapists & Counselors',
  doctors_specialists: '👨‍⚕️ Doctors & Specialists',
  coaches_mentors: '🎯 Coaches & Mentors',
  alternative_practitioners: '🔮 Alternative Practitioners',
  apps_software: '📱 Apps & Software',
  products_devices: '📦 Products & Devices',
  books_courses: '📚 Books & Courses',
  exercise_movement: '🏃 Exercise & Movement',
  meditation_mindfulness: '🧘 Meditation & Mindfulness',
  habits_routines: '📅 Habits & Routines',
  diet_nutrition: '🥗 Diet & Nutrition',
  sleep_hygiene: '😴 Sleep & Hygiene',
  support_groups: '🤝 Support Groups',
  groups_communities: '👥 Groups & Communities',
  hobbies_activities: '🎨 Hobbies & Activities',
  professional_services: '💼 Professional Services',
  medical_procedures: '⚕️ Medical Procedures',
  financial_products: '💰 Financial Products',
  crisis_resources: '🚨 Crisis Resources'
}

async function exportSolutions() {
  let markdown = `# AI Solutions Export - September 1, 2025
## Attribution Required Strategy - Complete Export

### Summary
- **Total Solutions Generated**: 746
- **Categories Covered**: All 23 categories
- **Generation Time**: 2:36 AM - 4:21 AM (1 hour 45 minutes)
- **Strategy**: Attribution Required (100% specificity achieved)
- **Gemini Requests Used**: 921/1000

---

## Solutions by Category

`

  for (const category of CATEGORIES) {
    console.log(`Fetching ${category}...`)
    
    // Get solutions for this category
    const { data: solutions, error } = await supabase
      .from('solutions')
      .select(`
        id,
        title,
        description,
        solution_category,
        created_at,
        solution_variants!inner (
          variant_name,
          goal_implementation_links (
            avg_effectiveness,
            goals (
              title
            )
          )
        )
      `)
      .eq('solution_category', category)
      .gt('created_at', '2025-09-01 02:00:00')
      .not('title', 'like', '%(Test)%')
      .order('title')

    if (error) {
      console.error(`Error fetching ${category}:`, error)
      continue
    }

    if (!solutions || solutions.length === 0) {
      continue
    }

    markdown += `### ${CATEGORY_LABELS[category] || category} (${solutions.length} solutions)\n\n`

    for (const solution of solutions) {
      const goals = new Set<string>()
      let totalEffectiveness = 0
      let effectivenessCount = 0

      // Collect unique goals and calculate average effectiveness
      for (const variant of solution.solution_variants || []) {
        for (const link of variant.goal_implementation_links || []) {
          if (link.goals?.title) {
            goals.add(link.goals.title)
          }
          if (link.avg_effectiveness) {
            totalEffectiveness += parseFloat(link.avg_effectiveness)
            effectivenessCount++
          }
        }
      }

      const avgEffectiveness = effectivenessCount > 0 
        ? (totalEffectiveness / effectivenessCount).toFixed(2)
        : 'N/A'

      markdown += `#### ${solution.title}\n`
      markdown += `- **Description**: ${solution.description}\n`
      markdown += `- **Average Rating**: ${avgEffectiveness}/5.00\n`
      markdown += `- **Connected Goals**: ${goals.size > 0 ? Array.from(goals).join(', ') : 'None yet'}\n`
      markdown += `\n`
    }
  }

  // Write to file
  const outputPath = path.join(process.cwd(), 'docs', 'ai-solutions-export-complete.md')
  fs.writeFileSync(outputPath, markdown)
  console.log(`\n✅ Export complete! Saved to: ${outputPath}`)
}

exportSolutions().catch(console.error)