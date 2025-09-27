#!/usr/bin/env tsx

/**
 * Test 6 divergent prompting strategies to improve solution specificity
 * Goal: Find which approach best overcomes AI's tendency toward generic advice
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { checkSpecificity } from './validate-specificity-standalone';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Test goal that has been problematic
const TEST_GOAL = {
  title: 'Be more approachable',
  description: 'Develop a warm, welcoming presence that makes others feel comfortable approaching and talking to you',
  arena: 'Social & Relationships',
  category: 'Personal Growth'
};

interface StrategyResult {
  name: string;
  prompt: string;
  solutions: any[];
  specificCount: number;
  vagueCount: number;
  successRate: number;
  specificExamples: string[];
  vagueExamples: string[];
  hasParenthesesIssue: boolean;
}

/**
 * Strategy 1: Product Reviewer Role-Play
 */
function getProductReviewerPrompt(): string {
  return `You are a product reviewer for Wirecutter/Consumer Reports. Your job is to recommend SPECIFIC products and services you've personally tested.

For the goal "${TEST_GOAL.title}", recommend 10 solutions you would feature in your "Best Of" guide.

CRITICAL: Only mention products/services that:
- Have a website you could link to
- You could purchase/sign up for today
- Have user reviews on Amazon/App Store/Google

Format each solution as JSON:
{
  "title": "exact product/service name",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

Return as JSON array of 10 solutions.`;
}

/**
 * Strategy 2: URL Test Constraint
 */
function getURLTestPrompt(): string {
  return `Generate 10 solutions for: ${TEST_GOAL.title}

VALIDATION RULE: Before adding any solution, imagine typing it into Google.
- Would the first result be a specific website/product page?
- Could you buy it or sign up within 2 clicks?

If you can't imagine the exact URL, don't include it.

Examples of good URLs:
- headspace.com (specific meditation app)
- stronglifts.com/5x5 (specific workout program)
- thefiveminutejournal.com (specific journal product)

DON'T generate categories that lead to search results pages.

Return JSON array with format:
{
  "title": "product name that has its own website",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`;
}

/**
 * Strategy 3: Anti-Pattern with Gamification
 */
function getAntiPatternPrompt(): string {
  return `I'm going to pay you $1 for each SPECIFIC solution, but you owe me $10 for each VAGUE solution.

VAGUE (you owe $10):
- "meditation practice"
- "gratitude exercises"
- "breathing techniques"
- Anything with "practice", "techniques", "exercises", "training"
- Anything with "(e.g., ...)" or "(such as ...)"

SPECIFIC (you earn $1):
- "Headspace"
- "The Five Minute Journal"
- "4-7-8 Breathing by Dr. Andrew Weil"

Generate 10 solutions for: ${TEST_GOAL.title}

Return JSON array:
{
  "title": "specific product/service name",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

After the array, show your earnings calculation.`;
}

/**
 * Strategy 4: Brand Name First Structure
 */
function getBrandFirstPrompt(): string {
  return `Generate solutions for: ${TEST_GOAL.title}

MANDATORY FORMAT:
[Brand/Author/Creator Name] + [Specific Product/Method]

Examples:
- "Nike Run Club app"
- "Tim Ferriss's Fear-Setting Exercise"
- "Beachbody's P90X"
- "Dr. Weil's 4-7-8 Breathing"

Start with the proper noun (brand/person), then the specific thing.
If you can't name a brand/author/creator, don't include it.

Return JSON array of 10 solutions:
{
  "title": "Brand/Creator + Product Name",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`;
}

/**
 * Strategy 5: Shopping Cart Metaphor
 */
function getShoppingCartPrompt(): string {
  return `You're helping me fill my Amazon cart and bookmark specific websites.

For goal: ${TEST_GOAL.title}

List 10 items where you could:
1. Add to Amazon cart OR
2. Download from App Store OR  
3. Bookmark the signup page

Respond as if reading from your order history:
"Ordered: [exact product name as shown on receipt]"
"Downloaded: [exact app name as shown in App Store]"
"Subscribed to: [exact service name on billing statement]"

Format as JSON array:
{
  "title": "exact name from receipt/app store/billing",
  "description": "what it does",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`;
}

/**
 * Strategy 6: Citation Required Approach
 */
function getCitationPrompt(): string {
  return `Generate solutions for: ${TEST_GOAL.title}

RULE: Every solution must be "citable" - meaning you could write:

"According to [Company/Author/Creator], their [Specific Product/Method] helps with ${TEST_GOAL.title}"

Template:
- "According to Headspace, their Anxiety Pack helps with..."
- "According to Tim Ferriss, his Fear-Setting Exercise helps with..."
- "According to Nike, their Run Club app helps with..."

List just the [Company/Author/Creator]'s [Specific Product/Method] part.

Return JSON array of 10 solutions:
{
  "title": "Creator's Specific Product",
  "description": "brief description",
  "category": "from_list_below",
  "effectiveness": 3.0-5.0
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products`;
}

/**
 * Test a single strategy
 */
async function testStrategy(name: string, prompt: string): Promise<StrategyResult> {
  console.log(`\n🧪 Testing Strategy: ${name}`);
  console.log('-'.repeat(50));
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates specific, actionable solutions.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    
    // Parse JSON response
    let solutions;
    try {
      // Extract JSON array from response (handle various formats)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        solutions = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole thing
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        solutions = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw response:', content.substring(0, 500));
      return {
        name,
        prompt,
        solutions: [],
        specificCount: 0,
        vagueCount: 0,
        successRate: 0,
        specificExamples: [],
        vagueExamples: [],
        hasParenthesesIssue: false
      };
    }
    
    // Analyze results
    const result: StrategyResult = {
      name,
      prompt: prompt.substring(0, 200) + '...',
      solutions,
      specificCount: 0,
      vagueCount: 0,
      successRate: 0,
      specificExamples: [],
      vagueExamples: [],
      hasParenthesesIssue: false
    };
    
    for (const sol of solutions) {
      const check = checkSpecificity(sol.title);
      
      // Check for parentheses issue
      if (sol.title.includes('(e.g.,') || sol.title.includes('(such as')) {
        result.hasParenthesesIssue = true;
      }
      
      if (check.isSpecific && check.isGoogleable) {
        result.specificCount++;
        if (result.specificExamples.length < 3) {
          result.specificExamples.push(sol.title);
        }
      } else {
        result.vagueCount++;
        if (result.vagueExamples.length < 3) {
          result.vagueExamples.push(sol.title);
        }
      }
    }
    
    result.successRate = (result.specificCount / solutions.length) * 100;
    
    // Quick results
    console.log(`✅ Specific: ${result.specificCount}/${solutions.length}`);
    console.log(`❌ Vague: ${result.vagueCount}/${solutions.length}`);
    console.log(`📊 Success Rate: ${result.successRate.toFixed(1)}%`);
    if (result.hasParenthesesIssue) {
      console.log(`⚠️  Has "(e.g., ...)" issue`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`Error testing ${name}:`, error);
    return {
      name,
      prompt,
      solutions: [],
      specificCount: 0,
      vagueCount: 0,
      successRate: 0,
      specificExamples: [],
      vagueExamples: [],
      hasParenthesesIssue: false
    };
  }
}

/**
 * Run all strategy tests
 */
async function runAllTests() {
  console.log('🚀 TESTING 6 DIVERGENT PROMPTING STRATEGIES');
  console.log('='.repeat(70));
  console.log(`\n📋 Test Goal: "${TEST_GOAL.title}"`);
  console.log(`📝 Description: ${TEST_GOAL.description}`);
  console.log('\n' + '='.repeat(70));
  
  const strategies = [
    { name: 'Product Reviewer', getPrompt: getProductReviewerPrompt },
    { name: 'URL Test', getPrompt: getURLTestPrompt },
    { name: 'Anti-Pattern Gamification', getPrompt: getAntiPatternPrompt },
    { name: 'Brand Name First', getPrompt: getBrandFirstPrompt },
    { name: 'Shopping Cart', getPrompt: getShoppingCartPrompt },
    { name: 'Citation Required', getPrompt: getCitationPrompt }
  ];
  
  const results: StrategyResult[] = [];
  
  // Test each strategy
  for (const strategy of strategies) {
    const result = await testStrategy(strategy.name, strategy.getPrompt());
    results.push(result);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print comprehensive results
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE RESULTS COMPARISON');
  console.log('='.repeat(70));
  
  // Sort by success rate
  results.sort((a, b) => b.successRate - a.successRate);
  
  console.log('\n🏆 RANKINGS BY SUCCESS RATE:\n');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.successRate.toFixed(1)}% specific`);
    console.log(`   ✅ ${result.specificCount}/${result.solutions.length} specific`);
    console.log(`   ❌ ${result.vagueCount}/${result.solutions.length} vague`);
    if (result.hasParenthesesIssue) {
      console.log(`   ⚠️  Has "(e.g., ...)" pattern issue`);
    }
    console.log();
  });
  
  // Show examples from best performer
  const best = results[0];
  console.log('='.repeat(70));
  console.log(`\n🥇 BEST PERFORMER: ${best.name} (${best.successRate.toFixed(1)}%)\n`);
  
  if (best.specificExamples.length > 0) {
    console.log('Good specific examples generated:');
    best.specificExamples.forEach(ex => console.log(`  ✅ ${ex}`));
  }
  
  if (best.vagueExamples.length > 0) {
    console.log('\nVague examples that slipped through:');
    best.vagueExamples.forEach(ex => console.log(`  ❌ ${ex}`));
  }
  
  // Show examples from worst performer
  const worst = results[results.length - 1];
  console.log('\n' + '-'.repeat(70));
  console.log(`\n🥉 WORST PERFORMER: ${worst.name} (${worst.successRate.toFixed(1)}%)\n`);
  
  if (worst.vagueExamples.length > 0) {
    console.log('Vague examples generated:');
    worst.vagueExamples.forEach(ex => console.log(`  ❌ ${ex}`));
  }
  
  // Analysis summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 ANALYSIS SUMMARY\n');
  
  const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
  console.log(`Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
  
  const withParentheses = results.filter(r => r.hasParenthesesIssue);
  console.log(`Strategies with "(e.g.)" issue: ${withParentheses.length}/${results.length}`);
  
  const above80 = results.filter(r => r.successRate >= 80);
  const above60 = results.filter(r => r.successRate >= 60);
  
  console.log(`Strategies ≥80% specific: ${above80.length}`);
  console.log(`Strategies ≥60% specific: ${above60.length}`);
  
  // Recommendations
  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS\n');
  
  if (best.successRate >= 80) {
    console.log(`✅ USE "${best.name}" strategy - achieves ${best.successRate.toFixed(1)}% specificity`);
    
    if (best.successRate >= 90) {
      console.log('   Excellent performance! Ready for production use.');
    } else {
      console.log('   Good performance. Consider combining with post-processing.');
    }
  } else if (best.successRate >= 60) {
    console.log(`⚠️  Best strategy "${best.name}" only achieves ${best.successRate.toFixed(1)}%`);
    console.log('   Recommend combining multiple strategies or adding post-processing.');
  } else {
    console.log(`❌ All strategies < 60% effective`);
    console.log('   Need to reconsider approach or switch to Claude API.');
  }
  
  // Strategy-specific insights
  console.log('\n📝 STRATEGY-SPECIFIC INSIGHTS:\n');
  
  for (const result of results) {
    if (result.successRate >= 70) {
      console.log(`✅ "${result.name}": Effective approach`);
    } else if (result.successRate >= 50) {
      console.log(`⚠️  "${result.name}": Partially effective`);
    } else {
      console.log(`❌ "${result.name}": Not effective for this use case`);
    }
    
    if (result.hasParenthesesIssue) {
      console.log(`   Note: Still generates "(e.g., ...)" patterns`);
    }
  }
  
  // Final recommendation
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FINAL RECOMMENDATION:\n');
  
  if (best.successRate >= 80) {
    console.log(`Implement the "${best.name}" prompting strategy.`);
    console.log('\nNext steps:');
    console.log('1. Update master-prompts.ts with this approach');
    console.log('2. Test with multiple goal categories');
    console.log('3. Run full generation if consistent >80% success');
  } else {
    console.log('Consider a hybrid approach:');
    console.log(`1. Start with "${best.name}" strategy (${best.successRate.toFixed(1)}%)`);
    console.log('2. Add post-processing to clean up patterns');
    console.log('3. Validate and regenerate failures');
    console.log('4. Or switch to Claude API for better instruction following');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}