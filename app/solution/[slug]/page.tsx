import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getSolutionDetail, getSimilarSolutions } from '@/lib/solutions/solution-details'
import SolutionPageClient from '@/components/solution/SolutionPageClient'
import Breadcrumbs from '@/components/molecules/Breadcrumbs'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const solution = await getSolutionDetail(slug)

  if (!solution) {
    return {
      title: 'Solution Not Found | WWFM'
    }
  }

  const effectivenessText = solution.goalCount > 0
    ? `Rated ${solution.avgEffectiveness.toFixed(1)}/5 stars by ${solution.totalRatings} users across ${solution.goalCount} goals`
    : 'A solution shared on What Works For Me'

  return {
    title: `${solution.title} - Solution Review & Effectiveness | WWFM`,
    description: solution.description
      ? `${solution.description.slice(0, 150)}... ${effectivenessText}`
      : effectivenessText,
    openGraph: {
      title: `${solution.title} | WWFM Solutions`,
      description: solution.description || effectivenessText,
      type: 'article',
      siteName: 'What Works For Me'
    },
    twitter: {
      card: 'summary',
      title: `${solution.title} | WWFM`,
      description: solution.description || effectivenessText
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params
  const solution = await getSolutionDetail(slug)

  if (!solution) {
    console.error(`[DEBUG] Solution not found for slug: ${slug}`)
    notFound()
  }

  console.log(`[DEBUG] Rendering solution page for: ${solution.title} (${solution.goalCount} goals)`)

  // Get similar solutions in parallel
  const similarSolutions = await getSimilarSolutions(
    solution.solution_category || 'other',
    solution.id,
    6
  )

  // Structure variants with their goal connections for client component
  const variantsWithGoals = solution.variants.map(variant => ({
    ...variant,
    goalConnections: variant.goal_links.map(goalLink => ({
      ...goalLink,
      implementation_id: goalLink.implementation_id ?? variant.id,
      variant_name: variant.variant_name
    })),
    totalRatings: variant.goal_links.reduce((sum, gc) => sum + gc.rating_count, 0),
    avgEffectiveness: variant.goal_links.length > 0
      ? variant.goal_links.reduce((sum, gc) => sum + gc.avg_effectiveness, 0) / variant.goal_links.length
      : 0
  }))

  // Flatten goal connections from all variants for aggregated view
  const allGoalConnections = solution.variants.flatMap(variant =>
    variant.goal_links.map(goalLink => ({
      ...goalLink,
      implementation_id: variant.id,
      variant_name: variant.variant_name
    }))
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Browse', href: '/browse' },
              { label: solution.title }
            ]}
          />
        </nav>

        {/* Pass variant data to client component for proper handling */}
        <SolutionPageClient
          solution={solution}
          variantsWithGoals={variantsWithGoals}
          allGoalConnections={allGoalConnections}
          similarSolutions={similarSolutions}
        />
      </div>
    </div>
  )
}

// For static generation (future enhancement)
export async function generateStaticParams() {
  // This would be used for static generation
  // For now, we'll rely on dynamic rendering
  return []
}
