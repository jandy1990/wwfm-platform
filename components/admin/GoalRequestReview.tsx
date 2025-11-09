'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { approveGoalRequest, rejectGoalRequest } from '@/app/actions/approve-goal-request'
import ApprovalModal from './ApprovalModal'

interface GoalRequest {
  id: string
  title: string
  description: string
  arena_id: string | null
  arena_name?: string
  suggested_by: string
  user_email: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  admin_notes?: string
}

interface Category {
  id: string
  name: string
  arena_id: string
  arena_name?: string
}

interface GoalRequestReviewProps {
  requests: GoalRequest[]
  categories: Category[]
}

export function GoalRequestReview({ requests, categories }: GoalRequestReviewProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<GoalRequest | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  // Filter to only show pending requests
  const pendingRequests = requests.filter((r) => r.status === 'pending')

  const handleApprove = async (requestId: string, categoryId: string, adminNotes: string) => {
    setProcessing(requestId)

    try {
      const result = await approveGoalRequest({
        requestId,
        categoryId,
        adminNotes
      })

      if (result.success) {
        toast.success('Goal created!', {
          description: `"${result.goalTitle}" has been added to the platform.`
        })

        // Close modal
        setShowApprovalModal(false)
        setSelectedRequest(null)

        // Refresh page to show updated list
        window.location.reload()
      } else {
        toast.error('Failed to approve', {
          description: result.error || 'Please try again.'
        })
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (request: GoalRequest) => {
    const reason = prompt(
      `Why is "${request.title}" being rejected?\n\nThis will be saved in admin notes.`
    )

    if (!reason) return

    setProcessing(request.id)

    try {
      const result = await rejectGoalRequest({
        requestId: request.id,
        reason
      })

      if (result.success) {
        toast.success('Request rejected', {
          description: 'The requester has been notified.'
        })

        // Refresh page to show updated list
        window.location.reload()
      } else {
        toast.error('Failed to reject', {
          description: result.error || 'Please try again.'
        })
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('An error occurred')
    } finally {
      setProcessing(null)
    }
  }

  const openApprovalModal = (request: GoalRequest) => {
    setSelectedRequest(request)
    setShowApprovalModal(true)
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">✨ All caught up!</p>
        <p className="text-sm">No pending goal requests to review.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Stats */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{pendingRequests.length}</span> pending{' '}
            {pendingRequests.length === 1 ? 'request' : 'requests'}
          </p>
        </div>

        {/* Request Cards */}
        {pendingRequests.map((request) => {
          const createdDate = new Date(request.created_at).toLocaleDateString()
          const daysAgo = Math.floor(
            (Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
          const isProcessing = processing === request.id

          return (
            <div
              key={request.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {request.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    {request.arena_name && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {request.arena_name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Requested {createdDate}
                      {daysAgo > 0 && ` (${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {/* Requester Info */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Requester: {request.user_email}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openApprovalModal(request)}
                  disabled={isProcessing}
                  className="
                    flex-1 px-4 py-2.5 rounded-lg font-medium transition-all
                    bg-green-600 hover:bg-green-700 text-white
                    shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isProcessing ? 'Processing...' : '✅ Approve'}
                </button>

                <button
                  onClick={() => handleReject(request)}
                  disabled={isProcessing}
                  className="
                    flex-1 px-4 py-2.5 rounded-lg font-medium transition-all
                    bg-red-600 hover:bg-red-700 text-white
                    shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          )
        })}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Review Guidelines:</strong> Approve goals that are specific, actionable,
            and align with WWFM's mission. Reject duplicates, vague requests, or goals that don't
            fit the platform's scope.
          </p>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedRequest(null)
          }}
          request={selectedRequest}
          categories={categories}
          onApprove={handleApprove}
          isProcessing={processing === selectedRequest.id}
        />
      )}
    </>
  )
}
