'use client'

import { useState } from 'react'
import { createClient } from '@/lib/database/client'
import { usePointsAnimation } from '@/lib/hooks/usePointsAnimation'
import { FlairHelperPanel } from './FlairHelperPanel'
import { FlairSelector } from './FlairSelector'
import type { FlairType } from '@/lib/config/flair-types'

interface AddDiscussionFormProps {
  goalId: string
  goalTitle: string
  parentId?: string | null
  onSuccess: () => void
  onCancel: () => void
}

export default function AddDiscussionForm({
  goalId,
  goalTitle,
  parentId = null,
  onSuccess,
  onCancel
}: AddDiscussionFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlairs, setSelectedFlairs] = useState<FlairType[]>([])

  const supabase = createClient()
  const { triggerPoints } = usePointsAnimation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Please write something before posting.')
      return
    }

    if (content.trim().length < 10) {
      setError('Please write at least 10 characters to help others.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Basic content filtering
    const trimmedContent = content.trim()
    const lowerContent = trimmedContent.toLowerCase()
    
    // Simple profanity/spam check
    const spamPatterns = [
      'click here', 'buy now', 'limited time', 'earn money fast',
      'guaranteed results', 'miracle cure', 'secret method'
    ]
    
    const hasSuspiciousContent = spamPatterns.some(pattern => 
      lowerContent.includes(pattern)
    )

    if (hasSuspiciousContent) {
      setError('Your post contains content that may be spam. Please revise and try again.')
      setIsSubmitting(false)
      return
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be signed in to post discussions.')
        setIsSubmitting(false)
        return
      }

      // Insert discussion post
      const { error: insertError } = await supabase
        .from('goal_discussions')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          content: trimmedContent,
          parent_id: parentId,
          flair_types: selectedFlairs.length > 0 ? selectedFlairs : null
        })

      if (insertError) {
        console.error('Error creating discussion:', insertError)
        setError('Failed to post discussion. Please try again.')
      } else {
        // Trigger points animation - different points for discussion vs reply
        triggerPoints({
          userId: user.id,
          points: parentId ? 3 : 8,
          reason: parentId ? 'Replied to discussion' : 'Started a discussion'
        })
        onSuccess()
      }
    } catch (err) {
      console.error('Error posting discussion:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {parentId ? 'Reply to discussion' : 'Share your experience'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {parentId 
            ? 'Add your thoughts to this conversation'
            : `What should other people know about trying to achieve "${goalTitle}"?`
          }
        </p>
      </div>

      {/* Text Input */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId 
            ? "Share your thoughts..."
            : "Share your experience, insights, challenges, or advice about working toward this goal..."
          }
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100 resize-y min-h-[120px]"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {content.length} characters • Minimum 10 characters
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {content.trim().length >= 10 ? '✓' : '○'} Ready to post
          </div>
        </div>
      </div>

      {/* Flair Selector - Only show for new discussions (not replies) */}
      {!parentId && (
        <div>
          <FlairSelector
            selectedFlairs={selectedFlairs}
            onChange={setSelectedFlairs}
          />
          <div className="mt-1">
            <FlairHelperPanel />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || content.trim().length < 10}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? 'Posting...' : (parentId ? 'Reply' : 'Post Discussion')}
        </button>
      </div>

      {/* Community Guidelines Hint */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        <p>
          💡 <strong>Helpful posts include:</strong> Specific experiences, challenges faced, 
          timeline of results, what worked/didn't work, and advice for others.
        </p>
      </div>
    </form>
  )
}