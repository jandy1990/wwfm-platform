/**
 * Goal Data Processing Script
 * Merges, normalizes, and deduplicates goal data from multiple sources
 */

import * as fs from 'fs';
import * as path from 'path';

// Data sources with weights for confidence scoring
const SOURCES = {
  web_research: { file: 'raw_data/web_research.txt', weight: 3 },
  reddit: { file: 'raw_data/reddit_analysis.txt', weight: 2 },
  ai_synthesis: { file: 'raw_data/ai_synthesis.txt', weight: 2 },
  autocomplete: { file: 'raw_data/autocomplete_patterns.txt', weight: 1 }
};

interface Goal {
  normalized: string;
  original: string[];
  sources: string[];
  score: number;
  category?: string;
}

// Normalize goal text
function normalizeGoal(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Remove question marks
  normalized = normalized.replace(/\?/g, '');

  // Remove common prefixes
  const prefixes = [
    'how to ',
    'how do i ',
    'how can i ',
    'ways to ',
    'i want to ',
    'want to ',
    'need to ',
    'trying to '
  ];

  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.substring(prefix.length);
      break;
    }
  }

  // Handle "get rid of" -> "reduce" or keep as is
  if (normalized.startsWith('get rid of ')) {
    normalized = normalized.replace('get rid of ', 'reduce ');
  }

  // Handle "stop being" -> "reduce" or appropriate verb
  if (normalized.startsWith('stop being ')) {
    normalized = normalized.replace('stop being ', 'reduce ');
  }

  // Handle "overcome" vs "reduce" - keep as is, they're similar

  // Remove trailing periods
  normalized = normalized.replace(/\.$/g, '');

  // Standardize spacing
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

// Calculate similarity between two strings (simple Levenshtein-like)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  // Check for exact match
  if (s1 === s2) return 1.0;

  // Check if one contains the other
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  // Check word overlap
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Extract goals from web research file
function extractWebResearchGoals(content: string): string[] {
  const goals: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Lines starting with "-" are goal statements
    if (trimmed.startsWith('- ')) {
      const goal = trimmed.substring(2);
      // Skip if it contains parentheses (usually metadata)
      if (!goal.includes('(') || goal.includes('searches)')) {
        // Remove search volume data in parentheses
        const cleaned = goal.replace(/\s*\([^)]*searches?\)/gi, '').trim();
        if (cleaned.length > 5) {
          goals.push(cleaned);
        }
      }
    }
  }

  return goals;
}

// Extract goals from Reddit file
function extractRedditGoals(content: string): string[] {
  const goals: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Lines starting with "-" are goal statements
    if (trimmed.startsWith('- ')) {
      const goal = trimmed.substring(2).trim();
      if (goal.length > 5 && !goal.startsWith('r/')) {
        goals.push(goal);
      }
    }
  }

  return goals;
}

// Extract goals from AI synthesis file
function extractAISynthesisGoals(content: string): string[] {
  const goals: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headers, comments, empty lines
    if (!trimmed.startsWith('#') &&
        !trimmed.startsWith('//') &&
        trimmed.length > 0 &&
        !trimmed.startsWith('##')) {
      // Goal statements in this file don't have prefixes
      if (trimmed.length > 5 && !trimmed.includes('goals)')) {
        goals.push(trimmed);
      }
    }
  }

  return goals;
}

// Extract goals from autocomplete file
function extractAutocompleteGoals(content: string): string[] {
  const goals: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Lines starting with "-" are goal statements
    if (trimmed.startsWith('- ')) {
      let goal = trimmed.substring(2).trim();

      // Remove "I want to" patterns that were kept in the file
      if (goal.startsWith('I want to ')) {
        goal = goal.substring(10);
      }

      if (goal.length > 5) {
        goals.push(goal);
      }
    }
  }

  return goals;
}

// Main processing function
function processGoals() {
  console.log('Starting goal processing...\n');

  const baseDir = '/Users/jackandrews/Desktop/wwfm-platform/human_endeavor';
  const goalMap = new Map<string, Goal>();

  // Process each source
  for (const [sourceName, config] of Object.entries(SOURCES)) {
    console.log(`Processing ${sourceName}...`);
    const filePath = path.join(baseDir, config.file);
    const content = fs.readFileSync(filePath, 'utf-8');

    let rawGoals: string[] = [];

    switch (sourceName) {
      case 'web_research':
        rawGoals = extractWebResearchGoals(content);
        break;
      case 'reddit':
        rawGoals = extractRedditGoals(content);
        break;
      case 'ai_synthesis':
        rawGoals = extractAISynthesisGoals(content);
        break;
      case 'autocomplete':
        rawGoals = extractAutocompleteGoals(content);
        break;
    }

    console.log(`  Extracted ${rawGoals.length} raw goals`);

    // Normalize and add to map
    for (const rawGoal of rawGoals) {
      const normalized = normalizeGoal(rawGoal);

      if (normalized.length < 5) continue; // Skip very short goals

      // Check for similar existing goals (fuzzy match)
      let matched = false;
      for (const [existingKey, existingGoal] of goalMap.entries()) {
        const sim = similarity(normalized, existingKey);

        // If very similar (>85%), merge them
        if (sim > 0.85) {
          existingGoal.original.push(rawGoal);
          if (!existingGoal.sources.includes(sourceName)) {
            existingGoal.sources.push(sourceName);
            existingGoal.score += config.weight;
          }
          matched = true;
          break;
        }
      }

      // If no match, add as new goal
      if (!matched) {
        goalMap.set(normalized, {
          normalized,
          original: [rawGoal],
          sources: [sourceName],
          score: config.weight
        });
      }
    }

    console.log(`  Current unique goals: ${goalMap.size}\n`);
  }

  console.log(`\nTotal unique goals after deduplication: ${goalMap.size}`);

  // Convert to array and sort by score
  const goals = Array.from(goalMap.values()).sort((a, b) => b.score - a.score);

  // Apply diversity bonus (goals appearing in multiple categories)
  for (const goal of goals) {
    if (goal.sources.length > 1) {
      goal.score += 1;
    }
  }

  // Re-sort after bonus
  goals.sort((a, b) => b.score - a.score);

  console.log('\nScore distribution:');
  console.log(`  Score 7+: ${goals.filter(g => g.score >= 7).length} goals`);
  console.log(`  Score 5-6: ${goals.filter(g => g.score >= 5 && g.score < 7).length} goals`);
  console.log(`  Score 3-4: ${goals.filter(g => g.score >= 3 && g.score < 5).length} goals`);
  console.log(`  Score 1-2: ${goals.filter(g => g.score >= 1 && g.score < 3).length} goals`);

  // Save intermediate processed data
  const processedPath = path.join(baseDir, 'processed', 'all_goals_scored.json');
  fs.writeFileSync(processedPath, JSON.stringify(goals, null, 2));
  console.log(`\nSaved all scored goals to: ${processedPath}`);

  // Select top 300
  const top300 = goals.slice(0, 300);

  // Generate simple text list
  const textList = top300.map((g, i) => `${i + 1}. ${g.normalized}`).join('\n');
  const textPath = path.join(baseDir, 'top_300_goals.txt');
  fs.writeFileSync(textPath, textList);
  console.log(`Saved top 300 goals to: ${textPath}`);

  // Generate detailed report
  const detailedList = top300.map((g, i) =>
    `${i + 1}. ${g.normalized}\n   Score: ${g.score} | Sources: ${g.sources.join(', ')}\n   Variations: ${g.original.slice(0, 3).join('; ')}${g.original.length > 3 ? ` (+${g.original.length - 3} more)` : ''}\n`
  ).join('\n');

  const detailedPath = path.join(baseDir, 'processed', 'top_300_detailed.txt');
  fs.writeFileSync(detailedPath, detailedList);
  console.log(`Saved detailed list to: ${detailedPath}`);

  return goals;
}

// Run processing
try {
  const goals = processGoals();
  console.log('\n✅ Processing complete!');
} catch (error) {
  console.error('Error processing goals:', error);
  process.exit(1);
}
