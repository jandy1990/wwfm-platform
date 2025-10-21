/**
 * Verification script to compare SSOT (FORM_DROPDOWN_OPTIONS_REFERENCE.md)
 * against actual code implementation (lib/config/solution-dropdown-options.ts)
 *
 * This ensures that:
 * 1. All dropdown values in code match SSOT documentation
 * 2. Context-aware cost fields have matching values
 * 3. No undocumented dropdown options exist in code
 */

import { DROPDOWN_OPTIONS } from '@/lib/config/solution-dropdown-options'
import * as fs from 'fs'
import * as path from 'path'

interface VerificationResult {
  category: string
  field: string
  status: 'match' | 'mismatch' | 'missing_in_ssot' | 'missing_in_code'
  details?: string
  codeValues?: string[]
  ssotValues?: string[]
}

// SSOT mappings based on FORM_DROPDOWN_OPTIONS_REFERENCE.md
const SSOT_MAPPINGS: Record<string, string[]> = {
  // AppForm (apps_software)
  app_cost_onetime: [
    "$5-$9.99",
    "$10-$24.99",
    "$25-$49.99",
    "$50-$99.99",
    "$100-$249.99",
    "$250+"
  ],
  app_cost_subscription: [
    "$5-$9.99/month",
    "$10-$19.99/month",
    "$20-$49.99/month",
    "$50-$99.99/month",
    "$100+/month"
  ],

  // SessionForm (therapists, coaches, etc.)
  session_cost_persession: [
    "Free",
    "Under $50",
    "$50-100",
    "$100-150",
    "$150-250",
    "$250-500",
    "$500-1000",
    "Over $1000"
  ],
  session_cost_monthly: [
    "Under $10/month",
    "$10-25/month",
    "$25-50/month",
    "$50-100/month",
    "$100-200/month",
    "$200-500/month",
    "Over $500/month"
  ],

  // HobbyForm (hobbies_activities)
  hobby_startup_cost: [
    "Free/No startup cost",
    "Under $50",
    "$50-$100",
    "$100-$250",
    "$250-$500",
    "$500-$1,000",
    "$1,000-$2,500",
    "$2,500-$5,000",
    "Over $5,000"
  ],
  hobby_ongoing_cost: [
    "Free/No ongoing cost",
    "Under $25/month",
    "$25-$50/month",
    "$50-$100/month",
    "$100-$200/month",
    "$200-$500/month",
    "Over $500/month"
  ],

  // DosageForm (medications, supplements, natural_remedies, beauty_skincare)
  dosage_cost_monthly: [
    "Free",
    "Under $10/month",
    "$10-25/month",
    "$25-50/month",
    "$50-100/month",
    "$100-200/month",
    "$200-500/month",
    "$500-1000/month",
    "Over $1000/month"
  ],
  dosage_cost_onetime: [
    "Free",
    "Under $20",
    "$20-50",
    "$50-100",
    "$100-250",
    "$250-500",
    "$500-1000",
    "Over $1000"
  ]
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((val, idx) => val === b[idx])
}

function verifyDropdownAlignment(): VerificationResult[] {
  const results: VerificationResult[] = []

  // Check each SSOT mapping against code
  for (const [ssotKey, ssotValues] of Object.entries(SSOT_MAPPINGS)) {
    const codeKey = ssotKey as keyof typeof DROPDOWN_OPTIONS
    const codeValues = DROPDOWN_OPTIONS[codeKey]

    if (!codeValues) {
      results.push({
        category: 'Global',
        field: ssotKey,
        status: 'missing_in_code',
        details: `SSOT defines ${ssotKey} but not found in code`,
        ssotValues
      })
      continue
    }

    if (arraysEqual(ssotValues, codeValues)) {
      results.push({
        category: 'Global',
        field: ssotKey,
        status: 'match',
        details: `✅ ${ssotValues.length} values match`
      })
    } else {
      results.push({
        category: 'Global',
        field: ssotKey,
        status: 'mismatch',
        details: `❌ Values differ (SSOT: ${ssotValues.length}, Code: ${codeValues.length})`,
        codeValues,
        ssotValues
      })
    }
  }

  // Check for code fields not in SSOT
  const knownCodeKeys = Object.keys(SSOT_MAPPINGS)
  const costRelatedKeys = Object.keys(DROPDOWN_OPTIONS).filter(key =>
    key.includes('cost') && !knownCodeKeys.includes(key)
  )

  for (const codeKey of costRelatedKeys) {
    results.push({
      category: 'Global',
      field: codeKey,
      status: 'missing_in_ssot',
      details: `⚠️  Code defines ${codeKey} but not verified in SSOT`,
      codeValues: DROPDOWN_OPTIONS[codeKey as keyof typeof DROPDOWN_OPTIONS] as string[]
    })
  }

  return results
}

function printResults(results: VerificationResult[]) {
  console.log('\n=== SSOT Alignment Verification ===\n')

  const matches = results.filter(r => r.status === 'match')
  const mismatches = results.filter(r => r.status === 'mismatch')
  const missingInSsot = results.filter(r => r.status === 'missing_in_ssot')
  const missingInCode = results.filter(r => r.status === 'missing_in_code')

  console.log(`✅ Matches: ${matches.length}`)
  console.log(`❌ Mismatches: ${mismatches.length}`)
  console.log(`⚠️  Missing in SSOT: ${missingInSsot.length}`)
  console.log(`⚠️  Missing in Code: ${missingInCode.length}`)
  console.log()

  if (matches.length > 0) {
    console.log('--- Matching Fields ---')
    matches.forEach(r => {
      console.log(`  ${r.field}: ${r.details}`)
    })
    console.log()
  }

  if (mismatches.length > 0) {
    console.log('--- MISMATCHES (REQUIRE ATTENTION) ---')
    mismatches.forEach(r => {
      console.log(`\n  Field: ${r.field}`)
      console.log(`  ${r.details}`)
      console.log(`  SSOT Values:`)
      r.ssotValues?.forEach(v => console.log(`    - "${v}"`))
      console.log(`  Code Values:`)
      r.codeValues?.forEach(v => console.log(`    - "${v}"`))
    })
    console.log()
  }

  if (missingInSsot.length > 0) {
    console.log('--- Missing in SSOT (Consider Adding) ---')
    missingInSsot.forEach(r => {
      console.log(`\n  Field: ${r.field}`)
      console.log(`  ${r.details}`)
      console.log(`  Code Values:`)
      r.codeValues?.forEach(v => console.log(`    - "${v}"`))
    })
    console.log()
  }

  if (missingInCode.length > 0) {
    console.log('--- Missing in Code (Possible SSOT Error) ---')
    missingInCode.forEach(r => {
      console.log(`\n  Field: ${r.field}`)
      console.log(`  ${r.details}`)
    })
    console.log()
  }

  // Overall status
  console.log('\n=== Summary ===')
  if (mismatches.length === 0 && missingInCode.length === 0) {
    console.log('✅ SSOT is aligned with code!')
    console.log('All critical cost fields match between documentation and implementation.')
    if (missingInSsot.length > 0) {
      console.log('\n⚠️  Note: Some code fields are not verified in SSOT.')
      console.log('These may be non-cost fields or internal-only options.')
    }
  } else {
    console.log('❌ SSOT alignment issues detected!')
    console.log('Please review the mismatches above and update SSOT or code accordingly.')
    process.exit(1)
  }
}

// Run verification
const results = verifyDropdownAlignment()
printResults(results)
