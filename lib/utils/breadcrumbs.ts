// lib/utils/breadcrumbs.ts
// Pure utility function for creating breadcrumb items (no client-side features)

export interface BreadcrumbItem {
  label: string
  href?: string // Optional - if not provided, it's the current page
  hideOnMobile?: boolean
}

// Helper function to create breadcrumb items for different pages
export function createBreadcrumbs(type: 'arena' | 'category' | 'goal', data: {
  arena?: { name: string; slug: string }
  category?: { name: string; slug: string }
  goal?: { title: string }
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/', hideOnMobile: true },
    { label: 'Browse', href: '/browse', hideOnMobile: true }
  ]

  if (data.arena) {
    items.push({
      label: data.arena.name,
      href: type === 'arena' ? undefined : `/arena/${data.arena.slug}`,
      hideOnMobile: type === 'goal' // Hide arena on mobile for goal pages
    })
  }

  if (data.category) {
    items.push({
      label: data.category.name,
      href: type === 'category' ? undefined : `/category/${data.category.slug}`
    })
  }

  if (data.goal) {
    items.push({
      label: data.goal.title
    })
  }

  return items
}
