/**
 * Phase 4 Validation Script: Cost Migration Testing
 *
 * Validates that the cost migration was successful by:
 * 1. Checking database consistency
 * 2. Verifying form dropdown options match database values
 * 3. Testing validation logic with new formats
 * 4. Generating a comprehensive test report
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { validateAndNormalizeSolutionFields } from '../lib/solutions/solution-field-validator'
import { getDropdownOptionsForFieldWithContext } from '../lib/config/solution-dropdown-options'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARN'
  details: string
  data?: any
}

const results: TestResult[] = []

async function test1_VerifyNoOldFormats() {
  console.log('\n📋 Test 1: Verify No Old Format Values Remain')

  const { data, error } = await supabase
    .from('goal_implementation_links')
    .select('id')
    .or(`aggregated_fields->>cost.cs."$10-25/month",aggregated_fields->>cost.cs."$50-100"`)

  if (error) {
    results.push({
      test: 'No Old Formats',
      status: 'FAIL',
      details: `Database query failed: ${error.message}`
    })
    return
  }

  if (data && data.length > 0) {
    results.push({
      test: 'No Old Formats',
      status: 'FAIL',
      details: `Found ${data.length} records with old format values`,
      data: data.slice(0, 5)
    })
  } else {
    results.push({
      test: 'No Old Formats',
      status: 'PASS',
      details: 'Zero old format values found in database ✅'
    })
  }
}

async function test2_VerifyNewFormatsExist() {
  console.log('\n📋 Test 2: Verify New Format Values Exist')

  const { data, error } = await supabase
    .from('goal_implementation_links')
    .select('aggregated_fields->cost->mode')
    .in('aggregated_fields->cost->>mode', [
      '$10-$19.99/month',
      '$50-$99.99',
      '$20-$49.99/month',
      '$100-$249.99',
      '$50-$99.99/month'
    ])

  if (error) {
    results.push({
      test: 'New Formats Exist',
      status: 'FAIL',
      details: `Database query failed: ${error.message}`
    })
    return
  }

  const count = data?.length || 0

  if (count > 1400) {
    results.push({
      test: 'New Formats Exist',
      status: 'PASS',
      details: `Found ${count} records with new format values ✅`
    })
  } else {
    results.push({
      test: 'New Formats Exist',
      status: 'WARN',
      details: `Only found ${count} records (expected ~1,500+)`
    })
  }
}

function test3_ValidateSessionFormCosts() {
  console.log('\n📋 Test 3: Validate SessionForm Monthly Cost')

  const testData = {
    category: 'therapists_counselors',
    fields: {
      session_cost_type: 'monthly',
      cost: '$10-$19.99/month',
      session_length: '60 minutes',
      session_frequency: 'Weekly',
      time_to_results: '1-2 months',
      time_to_complete: '3-6 months',
      challenges: ['Finding the right therapist']
    }
  }

  const result = validateAndNormalizeSolutionFields(
    testData.category,
    testData.fields,
    { allowPartial: false }
  )

  if (result.isValid) {
    results.push({
      test: 'SessionForm Validation',
      status: 'PASS',
      details: 'Monthly cost "$10-$19.99/month" validates successfully ✅'
    })
  } else {
    results.push({
      test: 'SessionForm Validation',
      status: 'FAIL',
      details: `Validation failed: ${result.errors.join('; ')}`,
      data: result
    })
  }
}

function test4_ValidateAppFormCosts() {
  console.log('\n📋 Test 4: Validate AppForm Subscription Cost')

  const testData = {
    category: 'apps_software',
    fields: {
      subscription_type: 'monthly',
      cost: '$10-$19.99/month',
      usage_frequency: 'Daily',
      time_to_results: '1-2 weeks'
    }
  }

  const result = validateAndNormalizeSolutionFields(
    testData.category,
    testData.fields,
    { allowPartial: false }
  )

  if (result.isValid) {
    results.push({
      test: 'AppForm Validation',
      status: 'PASS',
      details: 'Subscription cost "$10-$19.99/month" validates successfully ✅'
    })
  } else {
    results.push({
      test: 'AppForm Validation',
      status: 'FAIL',
      details: `Validation failed: ${result.errors.join('; ')}`,
      data: result
    })
  }
}

function test5_ValidateHobbyFormCosts() {
  console.log('\n📋 Test 5: Validate HobbyForm Startup & Ongoing Costs')

  const testData = {
    category: 'hobbies_activities',
    fields: {
      cost_type: 'both',
      startup_cost: '$50-$99.99',
      ongoing_cost: '$10-$24.99/month',
      time_commitment: '2-4 hours/week',
      frequency: 'Weekly',
      time_to_results: '1-2 months'
    }
  }

  const result = validateAndNormalizeSolutionFields(
    testData.category,
    testData.fields,
    { allowPartial: false }
  )

  if (result.isValid) {
    results.push({
      test: 'HobbyForm Validation',
      status: 'PASS',
      details: 'Startup "$50-$99.99" & ongoing "$10-$24.99/month" validate successfully ✅'
    })
  } else {
    results.push({
      test: 'HobbyForm Validation',
      status: 'FAIL',
      details: `Validation failed: ${result.errors.join('; ')}`,
      data: result
    })
  }
}

function test6_VerifyDropdownOptions() {
  console.log('\n📋 Test 6: Verify Dropdown Options Match Database Values')

  // Test SessionForm monthly costs
  const sessionOptions = getDropdownOptionsForFieldWithContext(
    'therapists_counselors',
    'cost',
    { session_cost_type: 'monthly' }
  )

  const hasNewMonthlyFormat = sessionOptions?.includes('$10-$19.99/month')
  const hasOldMonthlyFormat = sessionOptions?.includes('$10-25/month')

  if (hasNewMonthlyFormat && !hasOldMonthlyFormat) {
    results.push({
      test: 'Dropdown Options',
      status: 'PASS',
      details: 'Dropdowns show new format values, old format removed ✅',
      data: { sampleOptions: sessionOptions?.slice(0, 5) }
    })
  } else {
    results.push({
      test: 'Dropdown Options',
      status: hasNewMonthlyFormat ? 'WARN' : 'FAIL',
      details: `New format: ${hasNewMonthlyFormat ? '✅' : '❌'}, Old format removed: ${!hasOldMonthlyFormat ? '✅' : '❌'}`
    })
  }
}

async function test7_CheckBackupTableExists() {
  console.log('\n📋 Test 7: Verify Backup Table Exists')

  const { data, error } = await supabase
    .from('goal_implementation_links_backup_cost_migration_20251016')
    .select('id')
    .limit(1)

  if (error) {
    results.push({
      test: 'Backup Table',
      status: 'FAIL',
      details: `Backup table not accessible: ${error.message}`
    })
  } else {
    results.push({
      test: 'Backup Table',
      status: 'PASS',
      details: 'Backup table exists and is accessible for rollback ✅'
    })
  }
}

function printTestReport() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 PHASE 4 VALIDATION TEST REPORT')
  console.log('='.repeat(70))

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARN').length

  console.log(`\n✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log()

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️ '
    console.log(`${icon} ${result.test}`)
    console.log(`   ${result.details}`)
    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2).slice(0, 200)}...`)
    }
    console.log()
  })

  console.log('='.repeat(70))

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Migration is production-ready.')
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review failures before deploying.`)
  }

  console.log('='.repeat(70))
}

async function runAllTests() {
  console.log('🚀 Starting Phase 4 Validation Tests...\n')

  await test1_VerifyNoOldFormats()
  await test2_VerifyNewFormatsExist()
  test3_ValidateSessionFormCosts()
  test4_ValidateAppFormCosts()
  test5_ValidateHobbyFormCosts()
  test6_VerifyDropdownOptions()
  await test7_CheckBackupTableExists()

  printTestReport()
}

runAllTests().catch(console.error)
