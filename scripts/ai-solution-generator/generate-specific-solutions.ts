#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { categoryFieldsConfig } from './config/category-fields';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Validation functions to ensure specificity
function isSpecificSolution(solution: string): boolean {
  // Check for generic category terms that shouldn't appear alone
  const genericTerms = [
    'meditation', 'therapy', 'exercise', 'diet', 'mindfulness',
    'breathing', 'journaling', 'yoga', 'counseling', 'coaching',
    'medication', 'supplement', 'vitamin', 'herb', 'remedy'
  ];
  
  const lowerSolution = solution.toLowerCase();
  
  // If it's just a generic term (possibly with "practice" or "try"), it's not specific
  for (const term of genericTerms) {
    if (lowerSolution === term || 
        lowerSolution === `${term} practice` ||
        lowerSolution === `practice ${term}` ||
        lowerSolution === `try ${term}`) {
      return false;
    }
  }
  
  // Must contain at least one of these indicators of specificity
  const specificityIndicators = [
    /\d/, // Contains numbers (e.g., "5-minute", "10mg", "4-7-8")
    /[A-Z][a-z]+\s+[A-Z]/, // Proper nouns (e.g., "Headspace App")
    /".*"/, // Quoted method names
    /\bapp\b/i, // References an app
    /\bbook\b/i, // References a book
    /\bprogram\b/i, // References a program
    /\bmethod\b/i, // References a specific method
    /\btechnique\b/i, // References a specific technique
    /\bprotocol\b/i, // References a protocol
  ];
  
  return specificityIndicators.some(pattern => pattern.test(solution));
}

function isGoogleable(solution: string): boolean {
  // Check if the solution would return specific results when googled
  // This is a heuristic - solutions with proper nouns, numbers, or specific formats are more googleable
  
  const hasProperNoun = /[A-Z][a-z]+/.test(solution) && solution !== solution.toLowerCase();
  const hasNumbers = /\d/.test(solution);
  const hasSpecificFormat = /\b(app|book|course|program|method|technique)\b/i.test(solution);
  const hasBrandOrAuthor = /\b(by|from|with)\s+[A-Z]/.test(solution);
  
  return hasProperNoun || hasNumbers || hasSpecificFormat || hasBrandOrAuthor;
}

interface GeneratedSolution {
  name: string;
  description: string;
  category: string;
  fields: Record<string, any>;
}

async function generateSpecificSolutions(goalTitle: string, goalDescription: string, count: number = 10): Promise<GeneratedSolution[]> {
  const systemPrompt = `You are an expert at recommending SPECIFIC, actionable solutions to life challenges.

CRITICAL REQUIREMENTS:
1. Every solution MUST be googleable - searching for it should return specific results
2. Every solution MUST be immediately actionable - someone can do/buy/join it today
3. Every solution MUST include specifics like:
   - Product/app/book names (e.g., "Headspace", "Calm", "YNAB")
   - Author names (e.g., "by Tim Ferriss", "by Brené Brown")
   - Specific protocols (e.g., "4-7-8 breathing", "5x5 StrongLifts")
   - Brand names (e.g., "Nature Made Vitamin D3", "NOW Foods Magnesium")
   - Course/program names (e.g., "Couch to 5K", "Starting Strength")

NEVER suggest generic categories like:
- ❌ "meditation" → ✅ "Headspace anxiety pack"
- ❌ "therapy" → ✅ "BetterHelp online CBT therapy"
- ❌ "exercise" → ✅ "Couch to 5K running app"
- ❌ "budgeting" → ✅ "You Need A Budget (YNAB) app"
- ❌ "journaling" → ✅ "The Five Minute Journal"

Each solution should be something a person could immediately search for and find/purchase/start.`;

  const userPrompt = `Generate ${count} SPECIFIC solutions for this goal:
Title: ${goalTitle}
Description: ${goalDescription}

Return a JSON array where each solution has:
- name: The specific solution name (must be googleable)
- description: Brief description of what it is and how it helps
- category: One of these categories: ${Object.keys(categoryFieldsConfig).join(', ')}
- fields: An object with the required fields for that category

For each category, include these required fields:
${Object.entries(categoryFieldsConfig).map(([cat, config]) => 
  `${cat}: ${config.required.join(', ')}`
).join('\n')}

Remember: Be SPECIFIC. Include product names, authors, apps, protocols with numbers, etc.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');

    const parsed = JSON.parse(content);
    const solutions: GeneratedSolution[] = parsed.solutions || parsed;

    // Validate each solution
    const validSolutions = solutions.filter(sol => {
      if (!isSpecificSolution(sol.name)) {
        console.warn(`❌ Rejected non-specific solution: "${sol.name}"`);
        return false;
      }
      if (!isGoogleable(sol.name)) {
        console.warn(`❌ Rejected non-googleable solution: "${sol.name}"`);
        return false;
      }
      console.log(`✅ Accepted specific solution: "${sol.name}"`);
      return true;
    });

    return validSolutions;
  } catch (error) {
    console.error('Error generating solutions:', error);
    throw error;
  }
}

async function insertSolutionsToDatabase(
  goalId: string,
  solutions: GeneratedSolution[]
): Promise<void> {
  for (const solution of solutions) {
    try {
      // Insert the solution
      const { data: solutionData, error: solutionError } = await supabase
        .from('solutions')
        .insert({
          solution_name: solution.name,
          solution_category: solution.category,
          is_user_submitted: false,
          source_type: 'ai_specific', // New source type to distinguish from vague ones
          status: 'approved'
        })
        .select()
        .single();

      if (solutionError) {
        console.error(`Error inserting solution "${solution.name}":`, solutionError);
        continue;
      }

      // Insert the solution variant
      const { data: variantData, error: variantError } = await supabase
        .from('solution_variants')
        .insert({
          solution_id: solutionData.id,
          variant_name: solution.name,
          is_primary: true
        })
        .select()
        .single();

      if (variantError) {
        console.error(`Error inserting variant for "${solution.name}":`, variantError);
        continue;
      }

      // Insert the goal implementation link with fields
      const { error: linkError } = await supabase
        .from('goal_implementation_links')
        .insert({
          goal_id: goalId,
          implementation_id: variantData.id,
          solution_fields: solution.fields,
          effectiveness: Math.floor(Math.random() * 2) + 3.5, // Random between 3.5-4.5
          is_ai_suggested: true
        });

      if (linkError) {
        console.error(`Error linking solution "${solution.name}" to goal:`, linkError);
        continue;
      }

      console.log(`✅ Successfully inserted: "${solution.name}"`);
    } catch (error) {
      console.error(`Error processing solution "${solution.name}":`, error);
    }
  }
}

async function testGeneration() {
  console.log('🧪 Testing solution generation with specificity requirements...\n');

  // Test with a sample goal
  const testGoal = {
    id: 'test-goal-id',
    title: 'Reduce anxiety',
    description: 'Find effective ways to manage and reduce daily anxiety'
  };

  console.log(`Generating solutions for: "${testGoal.title}"\n`);

  try {
    const solutions = await generateSpecificSolutions(
      testGoal.title,
      testGoal.description,
      5 // Generate just 5 for testing
    );

    console.log(`\n📊 Generated ${solutions.length} valid specific solutions:\n`);
    solutions.forEach((sol, i) => {
      console.log(`${i + 1}. ${sol.name} (${sol.category})`);
      console.log(`   ${sol.description}`);
      console.log(`   Fields:`, JSON.stringify(sol.fields, null, 2));
    });

    // Optionally insert to database
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nInsert these to database? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        await insertSolutionsToDatabase(testGoal.id, solutions);
        console.log('\n✅ Solutions inserted to database');
      } else {
        console.log('\n⏭️  Skipped database insertion');
      }
      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testGeneration();
}

export { generateSpecificSolutions, isSpecificSolution, isGoogleable };