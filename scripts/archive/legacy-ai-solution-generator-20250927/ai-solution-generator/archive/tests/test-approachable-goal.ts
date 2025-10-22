#!/usr/bin/env tsx

/**
 * Test the new specificity-enforced prompt with the "Be more approachable" goal
 * This goal previously generated vague solutions like "Practice gratitude"
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { getSolutionGenerationPrompt } from './prompts/master-prompts';
import { checkSpecificity } from './validate-specificity-standalone';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

async function testApproachableGoal() {
  console.log('🧪 Testing "Be more approachable" with new specificity-enforced prompt\n');
  console.log('=' .repeat(70));
  
  // The problematic goal
  const goal = {
    title: 'Be more approachable',
    description: 'Develop a warm, welcoming presence that makes others feel comfortable approaching and talking to you',
    arena: 'Social & Relationships',
    category: 'Personal Growth'
  };
  
  console.log(`\n📋 Goal: "${goal.title}"`);
  console.log(`📝 Description: ${goal.description}\n`);
  
  // Generate the prompt with our new specificity requirements
  const prompt = getSolutionGenerationPrompt(
    goal.title,
    goal.description,
    goal.arena,
    goal.category,
    10 // Generate 10 solutions
  );
  
  // Show key parts of the prompt
  console.log('🎯 KEY PROMPT SECTIONS:');
  console.log('-' .repeat(70));
  
  // Show opening
  const opening = prompt.split('\n').slice(0, 3).join('\n');
  console.log('Opening statement:');
  console.log(opening);
  
  // Count specificity emphasis
  console.log('\n📊 Specificity emphasis:');
  console.log(`  - "SPECIFIC" mentioned: ${(prompt.match(/SPECIFIC/gi) || []).length} times`);
  console.log(`  - "GOOGLE" mentioned: ${(prompt.match(/GOOGLE/gi) || []).length} times`);
  console.log(`  - "BRAND/APP/AUTHOR" mentioned: ${(prompt.match(/BRAND|APP NAME|AUTHOR/gi) || []).length} times`);
  
  console.log('\n' + '=' .repeat(70));
  console.log('🤖 Generating solutions with OpenAI...\n');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates specific, actionable solutions for life goals.' 
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
      console.error('❌ No response from OpenAI');
      return;
    }
    
    // Parse the JSON response
    let solutions;
    try {
      // Remove any markdown formatting if present
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      solutions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      console.log('Raw response:', content);
      return;
    }
    
    console.log(`✅ Generated ${solutions.length} solutions\n`);
    console.log('📋 SOLUTIONS ANALYSIS:');
    console.log('=' .repeat(70));
    
    // Analyze each solution
    const results = {
      specific: [] as string[],
      vague: [] as string[]
    };
    
    solutions.forEach((sol: any, i: number) => {
      console.log(`\n${i + 1}. "${sol.title}"`);
      console.log(`   Category: ${sol.category}`);
      console.log(`   Description: ${sol.description}`);
      
      // Check specificity
      const check = checkSpecificity(sol.title);
      
      if (check.isSpecific && check.isGoogleable) {
        console.log(`   ✅ SPECIFIC - Passes all checks`);
        results.specific.push(sol.title);
      } else {
        console.log(`   ❌ VAGUE - ${check.failureReasons.join(', ')}`);
        results.vague.push(sol.title);
      }
    });
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 RESULTS SUMMARY:');
    console.log(`  ✅ Specific solutions: ${results.specific.length}/${solutions.length}`);
    console.log(`  ❌ Vague solutions: ${results.vague.length}/${solutions.length}`);
    
    if (results.specific.length > 0) {
      console.log('\n✅ Good specific solutions generated:');
      results.specific.forEach(title => {
        console.log(`  • ${title}`);
      });
    }
    
    if (results.vague.length > 0) {
      console.log('\n❌ Vague solutions that slipped through:');
      results.vague.forEach(title => {
        console.log(`  • ${title}`);
      });
    }
    
    // Compare to original problematic solutions
    console.log('\n' + '=' .repeat(70));
    console.log('📈 COMPARISON TO ORIGINAL PROBLEMATIC SOLUTIONS:');
    
    const originalVague = [
      'Practice gratitude',
      'Mindful breathing exercises',
      'Random acts of kindness',
      'Active listening techniques',
      'Positive self-talk',
      'Body language awareness'
    ];
    
    console.log('\nOriginal vague solutions from database:');
    originalVague.forEach(sol => console.log(`  ❌ ${sol}`));
    
    console.log('\nNew solutions with specificity enforcement:');
    solutions.slice(0, 6).forEach((sol: any) => {
      const isSpecific = checkSpecificity(sol.title).isSpecific;
      console.log(`  ${isSpecific ? '✅' : '❌'} ${sol.title}`);
    });
    
    // Success rate
    const successRate = (results.specific.length / solutions.length) * 100;
    console.log('\n' + '=' .repeat(70));
    if (successRate >= 80) {
      console.log(`✅ SUCCESS! ${successRate.toFixed(1)}% of solutions are specific`);
      console.log('The new prompt effectively prevents vague solutions!');
    } else if (successRate >= 50) {
      console.log(`⚠️  PARTIAL SUCCESS: ${successRate.toFixed(1)}% specific`);
      console.log('The prompt helps but may need more refinement');
    } else {
      console.log(`❌ NEEDS IMPROVEMENT: Only ${successRate.toFixed(1)}% specific`);
      console.log('The prompt needs stronger enforcement');
    }
    
  } catch (error) {
    console.error('❌ Error generating solutions:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testApproachableGoal().catch(console.error);
}