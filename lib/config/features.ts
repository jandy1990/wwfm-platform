/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for easy toggling of platform features.
 * Flags are controlled via environment variables for easy deployment configuration.
 */

/**
 * Check if content gating is enabled
 *
 * When enabled: Anonymous users see limited content (5 solutions, no replies)
 * When disabled: All users see all content (useful for beta testing)
 *
 * @returns true if content gating should be enforced
 */
export function isContentGatingEnabled(): boolean {
  const envFlag = process.env.NEXT_PUBLIC_ENABLE_CONTENT_GATING
  // Default to false (disabled) for safer beta testing
  // Only enable when explicitly set to 'true' or '1'
  return envFlag === 'true' || envFlag === '1'
}

/**
 * Get effective authentication status considering feature flags
 *
 * When content gating is disabled, treat all users as authenticated
 * for content access purposes (while preserving actual auth for other features)
 *
 * @param isActuallyAuthenticated - The real authentication status from Supabase
 * @returns The effective auth status to use for content gating decisions
 */
export function getEffectiveAuthStatus(isActuallyAuthenticated: boolean): boolean {
  if (!isContentGatingEnabled()) {
    // Feature disabled - everyone has access to all content
    return true
  }
  // Feature enabled - use actual authentication status
  return isActuallyAuthenticated
}
