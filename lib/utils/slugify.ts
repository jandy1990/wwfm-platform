/**
 * Generates SEO-friendly slugs for solutions
 * Creates URLs like: /solution/headspace-app-a1b2c3d4
 */

export function generateSolutionSlug(title: string, id: string): string {
  // Create base slug from title
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens

  // Use first 8 chars of UUID for uniqueness (remove hyphens)
  const shortId = id.replace(/-/g, '').substring(0, 8)

  return `${baseSlug}-${shortId}`
}

export function parseSolutionSlug(slug: string): string | null {
  try {
    // Extract the UUID portion (last 8 chars after final hyphen)
    const parts = slug.split('-')
    const shortId = parts[parts.length - 1]

    // Validate it's 8 alphanumeric characters
    if (shortId && shortId.length === 8 && /^[a-f0-9]+$/i.test(shortId)) {
      return shortId
    }

    return null
  } catch {
    return null
  }
}

export function getSolutionUrl(title: string, id: string): string {
  const slug = generateSolutionSlug(title, id)
  return `/solution/${slug}`
}

// For use in components that only have the slug
export function getSolutionUrlFromSlug(slug: string): string {
  return `/solution/${slug}`
}