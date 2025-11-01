'use server';

import { createServerSupabaseClient } from '@/lib/database/server';

/**
 * Promotes a custom specialty to the main service_type dropdown
 * This is a manual admin action to add popular custom entries
 *
 * NOTE: This function updates the DATABASE (challenge_options or similar),
 * NOT the code config files. For code updates, manually edit:
 * - lib/config/solution-dropdown-options.ts
 * - scripts/solution-generator/config/dropdown-options.ts
 */
export async function promoteCustomSpecialty(customSpecialty: string) {
  const supabase = await createServerSupabaseClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    return { success: false, error: 'Admin access required' };
  }

  try {
    // Get usage count to verify it meets threshold
    const { data: usageData } = await supabase.rpc('get_custom_specialty_counts');

    const specialty = usageData?.find((s: any) => s.custom_specialty === customSpecialty);

    if (!specialty) {
      return { success: false, error: 'Custom specialty not found' };
    }

    if (specialty.usage_count < 10) {
      return { success: false, error: 'Custom specialty must have at least 10 uses to be promoted' };
    }

    // Log the promotion request
    console.log(`[ADMIN] Promoting custom specialty: "${customSpecialty}" (${specialty.usage_count} uses)`);
    console.log('[ADMIN] Manual action required: Update lib/config/solution-dropdown-options.ts');
    console.log('[ADMIN] Add to service_type array (alphabetically):');
    console.log(`  "${customSpecialty}",`);

    // Return instructions for manual update
    return {
      success: true,
      message: 'Promotion logged',
      instructions: {
        file: 'lib/config/solution-dropdown-options.ts',
        array: 'service_type',
        value: customSpecialty,
        usageCount: specialty.usage_count,
        note: 'Add this value to the service_type array in alphabetical order, then mirror in scripts/solution-generator/config/dropdown-options.ts'
      }
    };
  } catch (error) {
    console.error('[ADMIN] Error promoting custom specialty:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
