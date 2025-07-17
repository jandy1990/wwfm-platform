import { SourceType } from '@/lib/solutions/goal-solutions'

interface SourceBadgeProps {
  sourceType: SourceType
  size?: 'sm' | 'md'
  className?: string
}

export default function SourceBadge({ sourceType, size = 'sm', className = '' }: SourceBadgeProps) {
  const getBadgeConfig = (type: SourceType) => {
    switch (type) {
      case 'ai_generated':
        return {
          text: 'AI',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          textColor: 'text-purple-800 dark:text-purple-300',
          borderColor: 'border-purple-200 dark:border-purple-700',
          icon: '🤖'
        }
      case 'community_contributed':
        return {
          text: 'Human',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-700',
          icon: '👤'
        }
      case 'ai_enhanced':
        return {
          text: 'AI+Human',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-700',
          icon: '🤝'
        }
      case 'expert_verified':
        return {
          text: 'Verified',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          textColor: 'text-amber-800 dark:text-amber-300',
          borderColor: 'border-amber-200 dark:border-amber-700',
          icon: '✓'
        }
      case 'ai_foundation':
        return {
          text: 'AI Base',
          bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
          textColor: 'text-indigo-800 dark:text-indigo-300',
          borderColor: 'border-indigo-200 dark:border-indigo-700',
          icon: '🧠'
        }
      default:
        return {
          text: 'Unknown',
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: '?'
        }
    }
  }

  const config = getBadgeConfig(sourceType)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses}
        ${className}
      `}
      title={`Source: ${sourceType.replace('_', ' ')}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.text}</span>
    </span>
  )
}

// Helper function to get accessible description for screen readers
export function getSourceDescription(sourceType: SourceType): string {
  switch (sourceType) {
    case 'ai_generated':
      return 'AI-generated solution'
    case 'community_contributed':
      return 'Community-contributed solution'
    case 'ai_enhanced':
      return 'AI-enhanced community solution'
    case 'expert_verified':
      return 'Expert-verified solution'
    case 'ai_foundation':
      return 'AI foundation solution'
    default:
      return 'Unknown source type'
  }
}