'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { requestGoal } from '@/app/actions/request-goal'

interface GoalRequestFormProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Pre-filled search query */
  searchQuery?: string
}

/**
 * Goal request form modal
 *
 * Allows users to request new goals when search returns no results.
 * Features:
 * - Pre-filled title from search query
 * - Required description (20-500 chars)
 * - Optional arena selection
 * - Email notification opt-in
 * - Rate limiting (5 requests per 24 hours)
 * - Duplicate detection
 *
 * Mobile-friendly with keyboard handling and safe area insets.
 */
export default function GoalRequestForm({
  isOpen,
  onClose,
  searchQuery = ''
}: GoalRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(searchQuery)
  const [description, setDescription] = useState('')
  const [arenaId, setArenaId] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)

  // Validation state
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  // Reset form when search query changes
  useEffect(() => {
    setTitle(searchQuery)
  }, [searchQuery])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
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
  }, [isOpen, isSubmitting, onClose])

  // Reset validation when fields change
  useEffect(() => {
    if (titleError) setTitleError('')
  }, [title, titleError])

  useEffect(() => {
    if (descriptionError) setDescriptionError('')
  }, [description, descriptionError])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    let isValid = true

    // Validate title (10-200 chars)
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Goal title is required')
      isValid = false
    } else if (trimmedTitle.length < 10) {
      setTitleError('Please be more specific (at least 10 characters)')
      isValid = false
    } else if (trimmedTitle.length > 200) {
      setTitleError('Title must be less than 200 characters')
      isValid = false
    }

    // Validate description (20-500 chars)
    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      setDescriptionError('Description is required')
      isValid = false
    } else if (trimmedDescription.length < 20) {
      setDescriptionError('Please provide more detail (at least 20 characters)')
      isValid = false
    } else if (trimmedDescription.length > 500) {
      setDescriptionError('Description must be less than 500 characters')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await requestGoal({
        title: title.trim(),
        description: description.trim(),
        arena_id: arenaId,
        notify
      })

      if (result.success) {
        toast.success(result.message || 'Request submitted!')

        // Reset form
        setTitle('')
        setDescription('')
        setArenaId(null)
        setNotify(true)

        // Close modal
        onClose()
      } else {
        if (result.isDuplicate) {
          toast.error(result.error || 'This goal has already been requested')
        } else {
          toast.error(result.error || 'Failed to submit request')
        }
      }
    } catch (error) {
      console.error('Error submitting goal request:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom)]">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-request-modal-title"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 px-6 py-5 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💡</span>
                <h3
                  id="goal-request-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  Request a Goal
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                           transition-colors rounded-md
                           focus:outline-none focus:ring-2 focus:ring-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Introduction */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Request a new goal and we'll review it for inclusion.
            </p>

            {/* Title Field */}
            <div className="mb-4">
              <label
                htmlFor="goal-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Reduce anxiety in social situations"
                className={`
                  w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${titleError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                `}
                maxLength={200}
              />
              {titleError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {titleError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {title.length}/200 characters (minimum 10)
              </p>
            </div>

            {/* Description Field */}
            <div className="mb-4">
              <label
                htmlFor="goal-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Why is this goal needed? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Tell us more about this challenge and why it would be valuable to have solutions for it..."
                rows={4}
                className={`
                  w-full px-3 py-2 border rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none
                  ${descriptionError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                `}
                maxLength={500}
              />
              {descriptionError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {descriptionError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters (minimum 20)
              </p>
            </div>

            {/* Arena Selection (Optional) */}
            <div className="mb-4">
              <label
                htmlFor="goal-arena"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Which area of life? (Optional)
              </label>
              <select
                id="goal-arena"
                value={arenaId || ''}
                onChange={(e) => setArenaId(e.target.value || null)}
                disabled={isSubmitting}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="">Not sure / Other</option>
                <option value="f4c44a71-8ff6-4015-a994-bf0d67842911">Beauty & Wellness</option>
                <option value="1b0cd1a1-c4fd-452b-a6c3-c1bccce4fd19">Community</option>
                <option value="d33f04f1-c32a-481c-88f7-aa4d65203516">Creativity</option>
                <option value="be32e097-e327-4746-ba0a-ce01bbe6cc55">Feeling & Emotion</option>
                <option value="8d4f91b5-d065-4636-be83-2bfdb397ca11">Finances</option>
                <option value="f9cddd14-c617-48ad-aa1a-f75a8f105b3a">House & Home</option>
                <option value="0502f3ff-fd7d-4fb5-ade0-58bc256978bc">Life Direction</option>
                <option value="b09902f6-38dc-4bf1-bd74-51283feece1c">Personal Growth</option>
                <option value="b8c9d0cf-658a-4f40-a2a6-6a63ac27c06b">Physical Health</option>
                <option value="bd45696d-0be1-498b-a8d2-4bbaa9e5206b">Relationships</option>
                <option value="6ce23046-c80c-4885-8658-256f58a59c3d">Socialising</option>
                <option value="2b1ec154-512f-4314-a415-f39171e54898">Technology & Modern Life</option>
                <option value="f640ffc1-5e44-4f40-a6a5-474522d798ad">Work & Career</option>
              </select>
            </div>

            {/* Notification Opt-in */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 w-4 h-4 text-purple-600 bg-white dark:bg-gray-700
                             border-gray-300 dark:border-gray-600 rounded
                             focus:ring-2 focus:ring-purple-500
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Email me when this request is reviewed
                </span>
              </label>
            </div>

            {/* Rate Limit Info */}
            <div className="mb-6 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ You can submit up to 5 goal requests per day. We review all requests carefully to maintain quality.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
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
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:transform-none disabled:shadow-md
                "
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  w-full
                  bg-white dark:bg-gray-700
                  border-2 border-gray-300 dark:border-gray-600
                  hover:border-gray-400 dark:hover:border-gray-500
                  text-gray-700 dark:text-gray-200
                  font-semibold
                  py-3 px-6
                  rounded-lg
                  transition-all duration-200
                  hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
