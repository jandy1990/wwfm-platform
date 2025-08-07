import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.test.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key for bypassing RLS
)

interface ValidationResult {
  category: string
  issues: string[]
  data?: any
}

async function validateFormSubmissions() {
  console.log('🔍 Validating Form Submissions in Database')
  console.log('=========================================\n')
  
  const results: ValidationResult[] = []
  
  // 1. Check for recent test submissions
  const { data: recentSubmissions, error } = await supabase
    .from('solutions')
    .select(`
      *,
      solution_variants!inner(*),
      goal_implementation_links!inner(*)
    `)
    .gt('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
    .eq('source_type', 'user_generated')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching recent submissions:', error)
    return
  }
  
  console.log(`Found ${recentSubmissions?.length || 0} test submissions in the last hour\n`)
  
  // 2. Validate each submission
  for (const submission of recentSubmissions || []) {
    const issues: string[] = []
    
    // Check for variants
    if (!submission.solution_variants || submission.solution_variants.length === 0) {
      issues.push('❌ Missing solution variant')
    }
    
    // Check for goal links
    if (!submission.goal_implementation_links || submission.goal_implementation_links.length === 0) {
      issues.push('❌ Missing goal implementation link')
    }
    
    // Check variant type based on category
    const variantCategories = ['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare']
    const variant = submission.solution_variants?.[0]
    
    if (variantCategories.includes(submission.solution_category)) {
      if (variant?.variant_name === 'Standard') {
        issues.push('❌ Dosage category should have specific variant, not "Standard"')
      }
    } else {
      if (variant?.variant_name !== 'Standard') {
        issues.push('❌ Non-dosage category should have "Standard" variant')
      }
    }
    
    // Check required fields in solution_fields
    const link = submission.goal_implementation_links?.[0]
    if (link?.solution_fields) {
      const requiredFields = getRequiredFields(submission.solution_category)
      const missingFields = requiredFields.filter(field => 
        !link.solution_fields.hasOwnProperty(field)
      )
      
      if (missingFields.length > 0) {
        issues.push(`❌ Missing required fields: ${missingFields.join(', ')}`)
      }
      
      // Check array fields
      const arrayFields = getArrayFields(submission.solution_category)
      for (const field of arrayFields) {
        if (link.solution_fields[field] && !Array.isArray(link.solution_fields[field])) {
          issues.push(`❌ Field "${field}" should be an array but is ${typeof link.solution_fields[field]}`)
        }
      }
    }
    
    results.push({
      category: submission.solution_category,
      issues,
      data: {
        title: submission.title,
        variant: variant?.variant_name,
        fields: Object.keys(link?.solution_fields || {})
      }
    })
  }
  
  // 3. Generate report
  console.log('📊 Validation Results:')
  console.log('====================\n')
  
  const categoryCounts: Record<string, number> = {}
  let totalIssues = 0
  
  for (const result of results) {
    categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1
    totalIssues += result.issues.length
    
    if (result.issues.length > 0) {
      console.log(`\n❌ ${result.data.title} (${result.category}):`)
      result.issues.forEach(issue => console.log(`   ${issue}`))
    } else {
      console.log(`✅ ${result.data.title} (${result.category}) - All checks passed`)
    }
  }
  
  // 4. Summary
  console.log('\n\n📈 Summary:')
  console.log('==========')
  console.log(`Total submissions validated: ${results.length}`)
  console.log(`Total issues found: ${totalIssues}`)
  console.log('\nSubmissions by category:')
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`)
  })
  
  // 5. Check for missing categories
  const allCategories = [
    'medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare',
    'apps_software', 'meditation_mindfulness', 'exercise_movement', 'habits_routines',
    'therapists_counselors', 'doctors_specialists', 'coaches_mentors',
    'alternative_practitioners', 'professional_services', 'medical_procedures',
    'crisis_resources', 'products_devices', 'books_courses', 'support_groups',
    'groups_communities', 'diet_nutrition', 'sleep', 'hobbies_activities',
    'financial_products'
  ]
  
  const missingCategories = allCategories.filter(cat => !categoryCounts[cat])
  if (missingCategories.length > 0) {
    console.log('\n⚠️  Categories with no test submissions:')
    missingCategories.forEach(cat => console.log(`  - ${cat}`))
  }
}

function getRequiredFields(category: string): string[] {
  // Based on CATEGORY_CONFIG from GoalPageClient.tsx
  const fieldMap: Record<string, string[]> = {
    // Dosage forms
    medications: ['cost', 'time_to_results', 'frequency', 'length_of_use', 'effectiveness'],
    supplements_vitamins: ['cost', 'time_to_results', 'frequency', 'length_of_use', 'effectiveness'],
    natural_remedies: ['cost', 'time_to_results', 'frequency', 'length_of_use', 'effectiveness'],
    beauty_skincare: ['cost', 'time_to_results', 'skincareFrequency', 'length_of_use', 'effectiveness'],
    
    // Apps
    apps_software: ['cost', 'time_to_results', 'usage_frequency', 'subscription_type', 'effectiveness'],
    
    // Practice forms
    meditation_mindfulness: ['startup_cost', 'ongoing_cost', 'time_to_results', 'practice_length', 'effectiveness'],
    exercise_movement: ['startup_cost', 'ongoing_cost', 'time_to_results', 'frequency', 'effectiveness'],
    habits_routines: ['startup_cost', 'ongoing_cost', 'time_to_results', 'time_commitment', 'effectiveness'],
    
    // Session forms
    therapists_counselors: ['cost', 'time_to_results', 'session_frequency', 'format', 'effectiveness'],
    doctors_specialists: ['cost', 'time_to_results', 'wait_time', 'insurance_coverage', 'effectiveness'],
    coaches_mentors: ['cost', 'time_to_results', 'session_frequency', 'format', 'effectiveness'],
    
    // Other categories...
    // Add remaining categories as needed
  }
  
  return fieldMap[category] || ['effectiveness', 'time_to_results']
}

function getArrayFields(category: string): string[] {
  const arrayFieldMap: Record<string, string[]> = {
    medications: ['side_effects'],
    supplements_vitamins: ['side_effects'],
    natural_remedies: ['side_effects'],
    beauty_skincare: ['side_effects'],
    apps_software: ['challenges'],
    meditation_mindfulness: ['challenges'],
    exercise_movement: ['challenges'],
    habits_routines: ['challenges'],
    therapists_counselors: ['barriers'],
    doctors_specialists: ['barriers'],
    coaches_mentors: ['barriers'],
    products_devices: ['issues'],
    books_courses: ['issues'],
    support_groups: ['challenges'],
    groups_communities: ['challenges'],
    diet_nutrition: ['challenges'],
    sleep: ['challenges'],
    hobbies_activities: ['barriers'],
    financial_products: ['barriers']
  }
  
  return arrayFieldMap[category] || []
}

// Run validation
validateFormSubmissions().catch(console.error)
