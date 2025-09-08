import { Database } from '@/types/supabase'

type Solution = Database['public']['Tables']['solutions']['Row']
type GoalImplementationLink = Database['public']['Tables']['goal_implementation_links']['Row'] & {
  maintenance_rate?: number | null
  maintenance_count?: number | null
}

interface Props {
  solution: Solution
  link: GoalImplementationLink
  variant?: any
}

export default function EnhancedSolutionCard({ solution, link, variant }: Props) {
  const effectiveness = link.avg_effectiveness || 0
  const ratingCount = link.rating_count || 0
  const maintenanceRate = link.maintenance_rate
  const maintenanceCount = link.maintenance_count || 0

  // Determine maintenance indicator
  const getMaintenanceIndicator = () => {
    if (!maintenanceRate || maintenanceCount < 3) return null
    
    if (maintenanceRate >= 70) {
      return { emoji: '💪', text: 'Usually sticks', color: 'text-green-600' }
    } else if (maintenanceRate >= 40) {
      return { emoji: '🔄', text: 'Mixed results', color: 'text-orange-600' }
    } else {
      return { emoji: '⚡', text: 'Often temporary', color: 'text-red-600' }
    }
  }

  const maintenance = getMaintenanceIndicator()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Solution Title */}
      <h3 className="text-lg font-semibold mb-3">{solution.title}</h3>

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
                  className={star <= Math.round(effectiveness) ? 'text-yellow-400' : 'text-gray-300'}
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

        {/* Maintenance Rate - Solution-specific */}
        {maintenance && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Long-term Success</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${maintenance.color}`}>
                {maintenance.emoji} {maintenanceRate?.toFixed(0)}% {maintenance.text}
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