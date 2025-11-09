/**
 * Database Insertion Script for AI-Generated Discussions
 *
 * Inserts generated posts into goal_discussions table with proper metadata
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { GeneratedPost } from './pattern-templates';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// WWFM Research Bot user ID
const BOT_USER_ID = '00000000-0000-0000-0000-000000000002';

export interface InsertResult {
  success: boolean;
  discussionId?: string;
  error?: string;
}

/**
 * Insert a single generated post into goal_discussions
 */
export const insertDiscussion = async (
  goalId: string,
  post: GeneratedPost
): Promise<InsertResult> => {
  try {
    const { data, error } = await supabase
      .from('goal_discussions')
      .insert({
        goal_id: goalId,
        user_id: BOT_USER_ID,
        content: post.content,
        is_ai_generated: true,
        flair_types: post.flairTypes,
        ai_metadata: {
          label: 'AI-synthesized',
          generated_date: new Date().toISOString(),
          patterns_used: post.metadata.patterns_used,
          word_count: post.metadata.word_count,
          authenticity_markers: post.metadata.authenticity_markers
        },
        upvotes: 0,  // Start at 0, can be adjusted later
        reply_count: 0,
        is_edited: false,
        is_flagged: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting discussion:', error);
      return { success: false, error: error.message };
    }

    return { success: true, discussionId: data.id };

  } catch (error) {
    console.error('Exception inserting discussion:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Insert a batch of posts for a goal
 */
export const insertDiscussionBatch = async (
  goalId: string,
  posts: GeneratedPost[]
): Promise<{ inserted: number; failed: number; results: InsertResult[] }> => {
  const results: InsertResult[] = [];
  let inserted = 0;
  let failed = 0;

  for (const post of posts) {
    const result = await insertDiscussion(goalId, post);
    results.push(result);

    if (result.success) {
      inserted++;
      console.log(`✅ Inserted discussion ${result.discussionId}`);
    } else {
      failed++;
      console.error(`❌ Failed to insert: ${result.error}`);
    }

    // Brief delay between inserts
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { inserted, failed, results };
};

/**
 * Get goal ID by title
 */
export const getGoalIdByTitle = async (title: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('id')
      .ilike('title', title)
      .single();

    if (error) {
      console.error('Error finding goal:', error);
      return null;
    }

    return data?.id || null;

  } catch (error) {
    console.error('Exception finding goal:', error);
    return null;
  }
};

/**
 * Check existing discussion count for a goal
 */
export const getDiscussionCount = async (goalId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('goal_discussions')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId);

    if (error) {
      console.error('Error counting discussions:', error);
      return 0;
    }

    return count || 0;

  } catch (error) {
    console.error('Exception counting discussions:', error);
    return 0;
  }
};

/**
 * Check AI-generated discussion count for a goal
 */
export const getAIDiscussionCount = async (goalId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('goal_discussions')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', goalId)
      .eq('is_ai_generated', true);

    if (error) {
      console.error('Error counting AI discussions:', error);
      return 0;
    }

    return count || 0;

  } catch (error) {
    console.error('Exception counting AI discussions:', error);
    return 0;
  }
};

/**
 * Delete all AI discussions for a goal (for testing/regeneration)
 */
export const deleteAIDiscussions = async (goalId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('goal_discussions')
      .delete()
      .eq('goal_id', goalId)
      .eq('is_ai_generated', true)
      .select('id');

    if (error) {
      console.error('Error deleting AI discussions:', error);
      return 0;
    }

    return data?.length || 0;

  } catch (error) {
    console.error('Exception deleting AI discussions:', error);
    return 0;
  }
};

/**
 * Main execution script
 */
export const main = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: npx tsx insert-discussions.ts <command> [options]

Commands:
  count <goal-title>          Show discussion counts for a goal
  delete <goal-title>         Delete all AI discussions for a goal
  insert <goal-title> <file>  Insert discussions from JSON file

Examples:
  npx tsx insert-discussions.ts count "Reduce anxiety"
  npx tsx insert-discussions.ts delete "Reduce anxiety"
  npx tsx insert-discussions.ts insert "Reduce anxiety" ./generated-posts.json
`);
    process.exit(0);
  }

  const command = args[0];
  const goalTitle = args[1];

  if (!goalTitle) {
    console.error('Error: Goal title required');
    process.exit(1);
  }

  // Find goal
  const goalId = await getGoalIdByTitle(goalTitle);
  if (!goalId) {
    console.error(`Error: Goal "${goalTitle}" not found`);
    process.exit(1);
  }

  console.log(`Found goal: ${goalTitle} (${goalId})`);

  switch (command) {
    case 'count': {
      const total = await getDiscussionCount(goalId);
      const ai = await getAIDiscussionCount(goalId);
      const human = total - ai;
      console.log(`\nDiscussion counts for "${goalTitle}":`);
      console.log(`  Total: ${total}`);
      console.log(`  AI-generated: ${ai}`);
      console.log(`  Human: ${human}`);
      break;
    }

    case 'delete': {
      console.log(`\nDeleting AI discussions for "${goalTitle}"...`);
      const deleted = await deleteAIDiscussions(goalId);
      console.log(`✅ Deleted ${deleted} AI discussions`);
      break;
    }

    case 'insert': {
      const jsonFile = args[2];
      if (!jsonFile) {
        console.error('Error: JSON file path required');
        process.exit(1);
      }

      console.log(`\nInserting discussions from ${jsonFile}...`);

      try {
        const fs = await import('fs/promises');
        const fileContent = await fs.readFile(jsonFile, 'utf-8');
        const posts: GeneratedPost[] = JSON.parse(fileContent);

        console.log(`Found ${posts.length} posts to insert`);

        const { inserted, failed } = await insertDiscussionBatch(goalId, posts);

        console.log(`\n✅ Inserted: ${inserted}`);
        console.log(`❌ Failed: ${failed}`);

      } catch (error) {
        console.error('Error reading or inserting posts:', error);
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
