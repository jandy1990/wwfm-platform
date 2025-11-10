// lib/utils/breadcrumbs.ts
// Pure utility function for creating breadcrumb items (no client-side features)

export interface BreadcrumbItem {
  label: string
  href?: string // Optional - if not provided, it's the current page
  hideOnMobile?: boolean
}

// Helper function to create breadcrumb items for different pages
// Simplified to: Home → Browse → Category → Goal (no arena layer)
export function createBreadcrumbs(type: 'category' | 'goal', data: {
  category?: { name: string; slug: string }
  goal?: { title: string }
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/', hideOnMobile: true },
    { label: 'Browse', href: '/browse', hideOnMobile: true }
  ]

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
