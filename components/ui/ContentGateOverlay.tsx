'use client'

import { ReactNode } from 'react'

interface ContentGateOverlayProps {
  /** Content to be gated/blurred */
  children: ReactNode
  /** Whether the content should be gated */
  isGated: boolean
  /** Callback when user attempts to access gated content */
  onAttemptAccess: () => void
  /** Message to show in the overlay */
  message: string
  /** Optional subtitle/call-to-action */
  subtitle?: string
  /** Icon to show (emoji or component) */
  icon?: string
  /** Blur intensity: 'light', 'medium', 'heavy' */
  blurIntensity?: 'light' | 'medium' | 'heavy'
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable content gating overlay component
 *
 * Renders children with optional blur overlay for anonymous users.
 * Content remains in DOM for SEO but is visually obscured.
 *
 * @example
 * <ContentGateOverlay
 *   isGated={!isLoggedIn}
 *   onAttemptAccess={() => setShowLoginModal(true)}
 *   message="Sign up to see 47 more solutions"
 *   subtitle="Join thousands finding what works"
 *   icon="🔓"
 * >
 *   <div>Gated content here</div>
 * </ContentGateOverlay>
 */
export default function ContentGateOverlay({
  children,
  isGated,
  onAttemptAccess,
  message,
  subtitle,
  icon = '🔓',
  blurIntensity = 'medium',
  className = ''
}: ContentGateOverlayProps) {
  // If not gated, just render children
  if (!isGated) {
    return <>{children}</>
  }

  const blurClass = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    heavy: 'backdrop-blur-lg'
  }[blurIntensity]

  return (
    <div className={`relative ${className}`}>
      {/* Content - rendered for SEO but visually obscured */}
      <div aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>

      {/* Blur Overlay */}
      <div
        className={`
          absolute inset-0
          ${blurClass}
          bg-white/40 dark:bg-gray-900/40
          flex items-center justify-center
          cursor-pointer
          transition-all duration-300
          hover:bg-white/50 dark:hover:bg-gray-900/50
          group
        `}
        onClick={onAttemptAccess}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onAttemptAccess()
          }
        }}
        aria-label="Locked content - Click to sign up"
      >
        {/* Call-to-action Card */}
        <div className="
          bg-white dark:bg-gray-800
          rounded-xl shadow-2xl
          px-8 py-6
          max-w-md mx-4
          border-2 border-purple-400 dark:border-purple-800
          transform group-hover:scale-105
          transition-transform duration-200
        ">
          {/* Icon */}
          {icon && (
            <div className="text-4xl mb-3 text-center">
              {icon}
            </div>
          )}

          {/* Message */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            {message}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {subtitle}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={onAttemptAccess}
            className="
              w-full
              bg-gradient-to-r from-purple-600 to-purple-600
              hover:from-purple-700 hover:to-purple-700
              text-white
              font-medium
              py-3 px-6
              rounded-lg
              border-2 border-purple-700
              transition-all duration-200
              shadow-md hover:shadow-xl
              transform hover:-translate-y-0.5
            "
          >
            Sign Up Free
          </button>

          {/* Alternative action */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            Already have an account?{' '}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAttemptAccess()
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
