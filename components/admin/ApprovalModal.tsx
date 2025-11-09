'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ApprovalModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Goal request details */
  request: {
    id: string
    title: string
    description: string
    arena_id: string | null
    suggested_by: string
    created_at: string
  }
  /** Available categories for selection */
  categories: Array<{
    id: string
    name: string
    arena_id: string
    arena_name?: string
  }>
  /** Callback when admin approves */
  onApprove: (requestId: string, categoryId: string, adminNotes: string) => Promise<void>
  /** Loading state */
  isProcessing: boolean
}

/**
 * Approval modal for goal requests
 *
 * Admin selects a category and optionally adds notes before approving.
 * Filters categories by arena if request has arena_id specified.
 */
export default function ApprovalModal({
  isOpen,
  onClose,
  request,
  categories,
  onApprove,
  isProcessing
}: ApprovalModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  // Filter categories by arena if specified
  const filteredCategories = request.arena_id
    ? categories.filter((cat) => cat.arena_id === request.arena_id)
    : categories

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategoryId('')
      setAdminNotes('')
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isProcessing, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryId) return

    await onApprove(request.id, categoryId, adminNotes)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isProcessing ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-modal-title"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-50 to-green-50 dark:from-green-900/10 dark:to-green-900/10 px-6 py-5 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <h3
                  id="approval-modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  Approve Goal Request
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                           transition-colors rounded-md
                           focus:outline-none focus:ring-2 focus:ring-green-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Request Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {request.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {request.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Requested: {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Select Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isProcessing}
                required
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-green-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <option value="">Choose a category...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.arena_name ? `(${cat.arena_name})` : ''}
                  </option>
                ))}
              </select>
              {request.arena_id && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Showing categories for selected arena only
                </p>
              )}
            </div>

            {/* Admin Notes */}
            <div className="mb-6">
              <label
                htmlFor="admin-notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Admin Notes (Optional)
              </label>
              <textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={isProcessing}
                placeholder="Add any notes about categorization, modifications, or implementation details..."
                rows={3}
                className="
                  w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-green-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none
                "
                maxLength={500}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Approve Button */}
              <button
                type="submit"
                disabled={!categoryId || isProcessing}
                className="
                  w-full
                  bg-gradient-to-r from-green-600 to-green-600
                  hover:from-green-700 hover:to-green-700
                  text-white
                  font-semibold
                  py-3.5 px-6
                  rounded-lg
                  border-2 border-green-700
                  transition-all duration-200
                  shadow-md hover:shadow-xl
                  transform hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:transform-none disabled:shadow-md
                "
              >
                {isProcessing ? 'Creating Goal...' : 'Approve & Create Goal'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
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

            {/* Info Box */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                ℹ️ Approving will create a new goal in the selected category and notify the requester.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
