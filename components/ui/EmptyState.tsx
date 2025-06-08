import Link from 'next/link'

interface EmptyStateProps {
  icon: string
  heading: string
  subtext: string
  actionButton?: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
  }
  className?: string
}

export default function EmptyState({
  icon,
  heading,
  subtext,
  actionButton,
  className = ''
}: EmptyStateProps) {
  const buttonClasses = actionButton?.variant === 'secondary'
    ? 'px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
    : 'px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className="text-4xl sm:text-5xl mb-2">
          {icon}
        </div>
        
        {/* Heading */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          {heading}
        </h3>
        
        {/* Subtext */}
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md">
          {subtext}
        </p>
        
        {/* Action Button */}
        {actionButton && (
          <div className="mt-6">
            {actionButton.href ? (
              <Link href={actionButton.href} className={buttonClasses}>
                {actionButton.text}
              </Link>
            ) : (
              <button 
                onClick={actionButton.onClick}
                className={buttonClasses}
              >
                {actionButton.text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}