'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LoginPromptModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Context for what the user was trying to access */
  context: string
  /** Optional custom title */
  title?: string
  /** Optional benefits to show */
  benefits?: string[]
}

/**
 * Login prompt modal for content gating
 *
 * Shown when anonymous users attempt to access gated content.
 * Follows WisdomModal pattern with backdrop blur and escape handling.
 *
 * @example
 * <LoginPromptModal
 *   isOpen={showLoginModal}
 *   onClose={() => setShowLoginModal(false)}
 *   context="see 47 more solutions"
 * />
 */
export default function LoginPromptModal({
  isOpen,
  onClose,
  context,
  title,
  benefits = [
    'See all effectiveness ratings',
    'Filter by cost, time, and category',
    'Read community discussions',
    'Save solutions and track your progress'
  ]
}: LoginPromptModalProps) {
  const router = useRouter()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const displayTitle = title || `Sign up to ${context}`

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 px-6 py-5 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔓</span>
                <h3
                  id="login-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {displayTitle}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                           transition-colors rounded-md
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Community size */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Join <span className="font-semibold text-purple-600 dark:text-purple-400">thousands of people</span> finding what works for life's challenges
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 mt-0.5 text-purple-500 dark:text-green-400">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary CTA - Create Account */}
              <button
                onClick={() => {
                  router.push('/signup')
                  onClose()
                }}
                className="
                  w-full
                  bg-gradient-to-r from-purple-600 to-purple-600
                  hover:from-purple-700 hover:to-purple-700
                  text-white
                  font-semibold
                  py-3.5 px-6
                  rounded-lg
                  border-2 border-purple-700
                  transition-all duration-200
                  shadow-md hover:shadow-xl
                  transform hover:-translate-y-0.5
                "
              >
                Create Free Account
              </button>

              {/* Secondary CTA - Sign In */}
              <button
                onClick={() => {
                  router.push('/login')
                  onClose()
                }}
                className="
                  w-full
                  bg-white dark:bg-gray-700
                  border-2 border-gray-300 dark:border-gray-600
                  hover:border-purple-300 dark:hover:border-purple-700
                  text-gray-700 dark:text-gray-200
                  font-semibold
                  py-3 px-6
                  rounded-lg
                  transition-all duration-200
                  hover:shadow-md
                "
              >
                Sign In
              </button>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
