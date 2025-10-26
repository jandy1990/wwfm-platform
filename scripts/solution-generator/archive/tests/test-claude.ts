#!/usr/bin/env tsx

/**
 * Test Claude with the elegant prompt for the "Be more approachable" goal
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { getSolutionGenerationPrompt } from './prompts/master-prompts';
import { checkSpecificity } from './validate-specificity-standalone';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable.');
}

const anthropic = new Anthropic({ apiKey });

async function testClaudeWithApproachableGoal() {
  console.log('🧪 Testing Claude with elegant prompt for "Be more approachable"\n');
  console.log('=' .repeat(70));
  
  const goal = {
    title: 'Be more approachable',
    description: 'Develop a warm, welcoming presence that makes others feel comfortable approaching and talking to you',
    arena: 'Social & Relationships',
    category: 'Personal Growth'
  };
  
  console.log(`\n📋 Goal: "${goal.title}"`);
  console.log(`📝 Description: ${goal.description}\n`);
  
  const prompt = getSolutionGenerationPrompt(
    goal.title,
    goal.description,
    goal.arena,
    goal.category,
    5 // Generate 5 solutions
  );
  
  console.log('🤖 Asking Claude with our elegant prompt...\n');
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature: 0.7
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('❌ Unexpected response type');
      return;
    }
    
    // Parse the JSON response
    let solutions;
    try {
      // Remove any markdown formatting if present
      const jsonStr = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      solutions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      console.log('Raw response:', content.text);
      return;
    }
    
    console.log(`✅ Claude generated ${solutions.length} solutions\n`);
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
      
      // Check specificity
      const check = checkSpecificity(sol.title);
      
      // Check for the problematic pattern
      const hasParentheses = sol.title.includes('(e.g.,') || sol.title.includes('(using') || sol.title.includes('(via');
      
      if (check.isSpecific && check.isGoogleable && !hasParentheses) {
        console.log(`   ✅ SPECIFIC - Passes all checks`);
        results.specific.push(sol.title);
      } else {
        const issues = [];
        if (!check.isSpecific) issues.push('not specific');
        if (!check.isGoogleable) issues.push('not googleable');
        if (hasParentheses) issues.push('has parenthetical examples');
        console.log(`   ❌ VAGUE - ${issues.join(', ')}`);
        results.vague.push(sol.title);
      }
    });
    
    // Summary
    console.log('\n' + '=' .repeat(70));
    console.log('📊 RESULTS SUMMARY:');
    console.log(`  ✅ Specific solutions: ${results.specific.length}/${solutions.length}`);
    console.log(`  ❌ Vague solutions: ${results.vague.length}/${solutions.length}`);
    
    if (results.specific.length > 0) {
      console.log('\n✅ Good specific solutions from Claude:');
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
    
    // Success rate
    const successRate = (results.specific.length / solutions.length) * 100;
    console.log('\n' + '=' .repeat(70));
    console.log('🎯 CLAUDE vs GEMINI COMPARISON:');
    console.log(`Claude success rate: ${successRate.toFixed(1)}%`);
    console.log(`Gemini success rate: ~60% (from previous test)`);
    
    if (successRate >= 80) {
      console.log(`\n✅ CLAUDE IS BETTER! ${successRate.toFixed(1)}% specific solutions`);
    } else if (successRate > 60) {
      console.log(`\n⚠️  CLAUDE IS SIMILAR: ${successRate.toFixed(1)}% specific`);
    } else {
      console.log(`\n❌ CLAUDE IS WORSE: Only ${successRate.toFixed(1)}% specific`);
    }
    
  } catch (error) {
    console.error('❌ Error with Claude:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testClaudeWithApproachableGoal().catch(console.error);
}
