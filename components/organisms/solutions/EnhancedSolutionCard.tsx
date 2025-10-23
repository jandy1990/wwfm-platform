import { Database } from '@/types/supabase'

type Solution = Database['public']['Tables']['solutions']['Row']
type GoalImplementationLink = Database['public']['Tables']['goal_implementation_links']['Row'] & {
  lasting_benefit_rate?: number | null
  lasting_benefit_count?: number | null
}

interface Props {
  solution: Solution
  link: GoalImplementationLink
}

export default function EnhancedSolutionCard({ solution, link }: Props) {
  const effectiveness = link.avg_effectiveness || 0
  const ratingCount = link.rating_count || 0
  const lastingBenefitRate = link.lasting_benefit_rate
  const benefitCount = link.lasting_benefit_count || 0

  // Determine lasting benefit indicator
  const getBenefitIndicator = () => {
    if (!lastingBenefitRate || benefitCount < 3) return null
    
    if (lastingBenefitRate >= 70) {
      return { emoji: '💪', text: 'Lasting benefits', color: 'text-green-600' }
    } else if (lastingBenefitRate >= 40) {
      return { emoji: '🔄', text: 'Mixed results', color: 'text-orange-600' }
    } else {
      return { emoji: '⚡', text: 'Temporary fix', color: 'text-red-600' }
    }
  }

  const benefitIndicator = getBenefitIndicator()

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-lg hover:shadow-xl hover:border-purple-400 transition-all">
      {/* Solution Title */}
      <h3 className="text-xl font-bold mb-3">{solution.title}</h3>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {/* Effectiveness */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Effectiveness</span>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= Math.round(effectiveness) ? 'text-purple-600' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({ratingCount} rating{ratingCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Lasting Benefit Rate - Solution-specific */}
        {benefitIndicator && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Long-term Impact</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${benefitIndicator.color}`}>
                {benefitIndicator.emoji} {lastingBenefitRate?.toFixed(0)}% report {benefitIndicator.text}
              </span>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Category</span>
          <span className="text-sm px-2 py-1 bg-gray-100 rounded">
            {solution.solution_category.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Description if available */}
      {solution.description && (
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {solution.description}
        </p>
      )}
    </div>
  )
}
