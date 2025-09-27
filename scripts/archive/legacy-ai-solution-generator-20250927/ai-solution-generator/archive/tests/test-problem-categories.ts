#!/usr/bin/env tsx

/**
 * Test specifically problematic categories like habits_routines
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = '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';

const anthropic = new Anthropic({
  apiKey: apiKey
});

// Test categories that should be problematic
const problemCategories = [
  {
    category: 'habits_routines',
    goalTitle: 'Be more approachable',
    goalDesc: 'Develop warm, welcoming presence'
  },
  {
    category: 'habits_routines',
    goalTitle: 'Improve communication',
    goalDesc: 'Better interpersonal communication skills'
  },
  {
    category: 'natural_remedies',
    goalTitle: 'Reduce stress',
    goalDesc: 'Natural stress reduction methods'
  },
  {
    category: 'exercise_movement',
    goalTitle: 'Improve posture',
    goalDesc: 'Better body alignment and posture'
  }
];

async function testCategory(test: typeof problemCategories[0]) {
  const prompt = `
Generate 5 solutions for: ${test.goalTitle}
Context: ${test.goalDesc}

IMPORTANT: All solutions MUST be in the category: ${test.category}

CORE REQUIREMENT: Only recommend real products, services, books, or apps that actually exist.
Every solution must have a specific name that can be Googled.

For ${test.category}, consider:
- Specific apps or programs
- Books with methodologies
- Named techniques with creators
- Branded courses or systems

NEVER write things like:
- "X Practice (using Y method)"
- "X Training (e.g., workshops)"
- Generic practices without specific names

Return a JSON array where each solution has:
{
  "title": "Specific product/service/method name",
  "category": "${test.category}"
}

Return only the JSON array.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    
    const content = response.content[0];
    if (content.type !== 'text') return [];
    
    const jsonStr = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error:`, error);
    return [];
  }
}

async function runTest() {
  console.log('🔍 TESTING PROBLEMATIC CATEGORIES\n');
  console.log('=' .repeat(70));
  
  for (const test of problemCategories) {
    console.log(`\n📋 Category: ${test.category}`);
    console.log(`   Goal: "${test.goalTitle}"`);
    console.log(`   Context: ${test.goalDesc}\n`);
    
    const solutions = await testCategory(test);
    
    let vagueCount = 0;
    for (const sol of solutions) {
      // Check for problematic patterns
      const hasParentheses = sol.title.includes('(e.g.') || 
                            sol.title.includes('(using') || 
                            sol.title.includes('(via');
      const hasPractice = sol.title.toLowerCase().includes('practice') && 
                         !sol.title.includes('Best Practice');
      const hasTraining = sol.title.toLowerCase().includes('training') &&
                          !sol.title.includes('Training Club') &&
                          !sol.title.includes('Training App');
      const hasExercises = sol.title.toLowerCase().includes('exercises') &&
                          !sol.title.includes('Exercise App');
      const hasTechnique = sol.title.toLowerCase().includes('technique') &&
                          !sol.title.match(/\d/); // No numbers like "4-7-8"
      
      const isVague = hasParentheses || 
                     (hasPractice && !sol.title.includes('App')) ||
                     (hasTraining && !sol.title.includes('App')) ||
                     (hasExercises && !sol.title.includes('App')) ||
                     (hasTechnique && !sol.title.includes('by'));
      
      if (isVague) vagueCount++;
      
      console.log(`   ${isVague ? '❌' : '✅'} "${sol.title}"`);
      if (isVague) {
        const reasons = [];
        if (hasParentheses) reasons.push('has parenthetical examples');
        if (hasPractice) reasons.push('generic "practice"');
        if (hasTraining) reasons.push('generic "training"');
        if (hasExercises) reasons.push('generic "exercises"');
        if (hasTechnique) reasons.push('generic "technique"');
        console.log(`      Issues: ${reasons.join(', ')}`);
      }
    }
    
    console.log(`   📊 Result: ${vagueCount}/5 vague (${(vagueCount/5*100).toFixed(0)}%)`);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('💡 INSIGHTS:\n');
  
  console.log('The problem is that for categories like habits_routines:');
  console.log('1. There often AREN\'T specific branded products');
  console.log('2. The AI tries to suggest practices but has no specific app/book to name');
  console.log('3. It falls back to generic descriptions with examples\n');
  
  console.log('POTENTIAL SOLUTIONS:');
  console.log('1. For habits_routines → push toward habit-tracking APPS');
  console.log('2. For natural_remedies → push toward specific BRANDS');
  console.log('3. For exercise_movement → push toward specific PROGRAMS or APPS');
  console.log('4. Accept that some categories need different validation rules');
}

// Run the test
if (require.main === module) {
  runTest().catch(console.error);
}