#!/usr/bin/env tsx

/**
 * Analyze which categories tend to produce vague solutions
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { checkSpecificity } from './validate-specificity-standalone';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable.');
}

const anthropic = new Anthropic({ apiKey });

// Test different types of goals that might use different categories
const testGoals = [
  {
    title: 'Reduce anxiety',
    description: 'Find ways to manage and reduce anxiety',
    expectedCategories: ['meditation_mindfulness', 'therapists_counselors', 'medications', 'supplements_vitamins', 'books_courses', 'apps_software']
  },
  {
    title: 'Get fit',
    description: 'Improve physical fitness and strength',
    expectedCategories: ['exercise_movement', 'products_devices', 'apps_software', 'habits_routines', 'diet_nutrition']
  },
  {
    title: 'Sleep better',
    description: 'Improve sleep quality and duration',
    expectedCategories: ['sleep', 'supplements_vitamins', 'products_devices', 'habits_routines', 'meditation_mindfulness']
  },
  {
    title: 'Build better habits',
    description: 'Develop positive daily routines',
    expectedCategories: ['habits_routines', 'books_courses', 'apps_software']
  },
  {
    title: 'Manage stress naturally',
    description: 'Natural ways to reduce stress',
    expectedCategories: ['natural_remedies', 'meditation_mindfulness', 'exercise_movement']
  }
];

async function analyzeCategory(goal: typeof testGoals[0]) {
  const prompt = `
Generate 5 solutions for: ${goal.title}
Context: ${goal.description}

CORE REQUIREMENT: Only recommend real products, services, books, or apps that actually exist.

Think of this task like making a shopping list - you need to name the ACTUAL items, not categories.

EXAMPLES OF WHAT WE WANT:
✅ "Headspace" - specific app
✅ "Nature Made Magnesium" - specific brand
✅ "Atomic Habits by James Clear" - specific book

EXAMPLES OF WHAT WE DON'T WANT:
❌ "meditation practice" - too generic
❌ "magnesium supplement" - no brand
❌ "habit book" - no title

Return a JSON array where each solution has:
{
  "title": "Specific product/service name",
  "category": "category_from_list"
}

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

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
    console.error(`Error for "${goal.title}":`, error);
    return [];
  }
}

async function runAnalysis() {
  console.log('🔍 ANALYZING VAGUENESS BY CATEGORY\n');
  console.log('=' .repeat(70));
  
  const categoryStats: Record<string, { total: number; vague: number; examples: string[] }> = {};
  
  for (const goal of testGoals) {
    console.log(`\n📋 Testing: "${goal.title}"`);
    console.log(`Expected categories: ${goal.expectedCategories.join(', ')}`);
    
    const solutions = await analyzeCategory(goal);
    
    for (const sol of solutions) {
      const category = sol.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, vague: 0, examples: [] };
      }
      
      categoryStats[category].total++;
      
      const check = checkSpecificity(sol.title);
      const hasParentheses = sol.title.includes('(') && sol.title.includes(')');
      const isVague = !check.isSpecific || !check.isGoogleable || hasParentheses;
      
      console.log(`  ${isVague ? '❌' : '✅'} ${sol.title} (${category})`);
      
      if (isVague) {
        categoryStats[category].vague++;
        categoryStats[category].examples.push(sol.title);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 VAGUENESS BY CATEGORY:');
  console.log('=' .repeat(70));
  
  // Sort categories by vagueness rate
  const sortedCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      ...stats,
      vaguenessRate: (stats.vague / stats.total) * 100
    }))
    .sort((a, b) => b.vaguenessRate - a.vaguenessRate);
  
  console.log('\n🚨 MOST PROBLEMATIC CATEGORIES:');
  for (const cat of sortedCategories) {
    if (cat.vaguenessRate > 0) {
      console.log(`\n${cat.category}: ${cat.vaguenessRate.toFixed(0)}% vague (${cat.vague}/${cat.total})`);
      if (cat.examples.length > 0) {
        console.log('  Examples of vague solutions:');
        cat.examples.slice(0, 3).forEach(ex => {
          console.log(`    • "${ex}"`);
        });
      }
    }
  }
  
  console.log('\n✅ CATEGORIES THAT WORK WELL:');
  for (const cat of sortedCategories) {
    if (cat.vaguenessRate === 0) {
      console.log(`  • ${cat.category} (${cat.total} solutions, all specific)`);
    }
  }
  
  // Identify patterns
  console.log('\n' + '=' .repeat(70));
  console.log('🎯 PATTERN ANALYSIS:');
  
  const patterns = {
    practices: sortedCategories.filter(c => 
      ['habits_routines', 'exercise_movement', 'meditation_mindfulness'].includes(c.category)
    ),
    products: sortedCategories.filter(c => 
      ['products_devices', 'supplements_vitamins', 'medications'].includes(c.category)
    ),
    services: sortedCategories.filter(c => 
      ['therapists_counselors', 'professional_services'].includes(c.category)
    ),
    content: sortedCategories.filter(c => 
      ['books_courses', 'apps_software'].includes(c.category)
    )
  };
  
  for (const [type, categories] of Object.entries(patterns)) {
    if (categories.length > 0) {
      const avgVagueness = categories.reduce((sum, c) => sum + c.vaguenessRate, 0) / categories.length;
      console.log(`\n${type.toUpperCase()}:`);
      console.log(`  Average vagueness: ${avgVagueness.toFixed(1)}%`);
      categories.forEach(c => {
        console.log(`  • ${c.category}: ${c.vaguenessRate.toFixed(0)}% vague`);
      });
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('💡 KEY INSIGHTS:');
  
  // Find the pattern
  const practiceCategories = ['habits_routines', 'exercise_movement', 'meditation_mindfulness', 'natural_remedies'];
  const productCategories = ['products_devices', 'supplements_vitamins', 'medications', 'books_courses', 'apps_software'];
  
  const practiceVagueness = sortedCategories
    .filter(c => practiceCategories.includes(c.category))
    .reduce((sum, c) => sum + c.vaguenessRate, 0) / practiceCategories.length || 0;
    
  const productVagueness = sortedCategories
    .filter(c => productCategories.includes(c.category))
    .reduce((sum, c) => sum + c.vaguenessRate, 0) / productCategories.length || 0;
  
  console.log(`\n1. Practice-based categories: ${practiceVagueness.toFixed(1)}% vague`);
  console.log(`2. Product-based categories: ${productVagueness.toFixed(1)}% vague`);
  
  if (practiceVagueness > productVagueness) {
    console.log('\n⚠️  PROBLEM: Practice-based categories are much vaguer!');
    console.log('   These categories lack branded products/apps');
    console.log('   AI struggles to name specific implementations');
  }
}

// Run the analysis
if (require.main === module) {
  runAnalysis().catch(console.error);
}
