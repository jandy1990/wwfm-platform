import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string // Optional - if not provided, it's the current page
  hideOnMobile?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && {
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.href}`
      })
    }))
  }

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const isFirst = index === 0
            
            return (
              <li
                key={index}
                className={`flex items-center ${
                  item.hideOnMobile && !isLast ? 'hidden sm:flex' : 'flex'
                }`}
              >
                {/* Add separator before item (except for first) */}
                {!isFirst && (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-1 sm:mx-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                
                {/* Breadcrumb item */}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-all duration-200 py-1 px-1 -mx-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px] flex items-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`py-1 px-1 transition-colors duration-200 ${
                      isLast ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
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