'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitRetrospective } from '@/app/actions/retrospectives'
import { IMPACT_OPTIONS } from '@/types/retrospectives'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  scheduleId: string
  goalTitle: string
  goalDescription: string
  solutionTitle: string
  achievementDate: string
}

export default function RetrospectiveForm({ 
  scheduleId, 
  goalTitle, 
  goalDescription,
  solutionTitle,
  achievementDate 
}: Props) {
  const router = useRouter()
  const [impact, setImpact] = useState<number | null>(null)
  const [unexpectedBenefits, setUnexpectedBenefits] = useState('')
  const [stillMaintaining, setStillMaintaining] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(achievementDate), { addSuffix: true })

  const handleSubmit = async () => {
    if (impact === null) return

    setSubmitting(true)
    try {
      await submitRetrospective(scheduleId, {
        counterfactual_impact: impact,
        worth_pursuing: impact >= 3,
        still_maintaining: stillMaintaining ?? undefined,
        unexpected_benefits: unexpectedBenefits || undefined
      })

      // Show success and redirect
      router.push('/mailbox?success=true')
    } catch (error) {
      console.error('Error submitting retrospective:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
          6-Month Reflection
        </span>
        <h1 className="text-3xl font-bold mb-2">How valuable was this achievement?</h1>
        <p className="text-gray-600 mb-4">
          You achieved this {timeAgo}
        </p>
      </div>

      {/* Achievement Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Goal achieved:</p>
            <p className="font-semibold text-lg">{goalTitle}</p>
            {goalDescription && (
              <p className="text-sm text-gray-600 mt-1">{goalDescription}</p>
            )}
          </div>
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-500 mb-1">Method used:</p>
            <p className="font-medium">{solutionTitle}</p>
          </div>
        </div>
      </div>

      {/* Main Question - About the GOAL's value */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-2">
          The Key Question
        </h2>
        <p className="text-gray-700 mb-4">
          If you hadn't achieved "{goalTitle}", how different would your life be today?
        </p>
        
        <div className="space-y-3">
          {IMPACT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setImpact(option.value)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${impact === option.value 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {impact === option.value && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Still Maintaining - About the SOLUTION's durability */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">
          About the method
        </h3>
        <p className="text-gray-600 mb-4">
          Are you still maintaining what you achieved using {solutionTitle}?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStillMaintaining(true)}
            className={`
              px-4 py-3 rounded-lg border-2 transition-all text-center
              ${stillMaintaining === true 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="text-xl mb-1">💪</div>
            <div className="font-medium">Yes, still going</div>
            <div className="text-sm mt-1">It's part of my life now</div>
          </button>
          <button
            onClick={() => setStillMaintaining(false)}
            className={`
              px-4 py-3 rounded-lg border-2 transition-all text-center
              ${stillMaintaining === false 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="text-xl mb-1">🔄</div>
            <div className="font-medium">No, it didn't stick</div>
            <div className="text-sm mt-1">Back to square one</div>
          </button>
        </div>
      </div>

      {/* Unexpected Benefits */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Any unexpected benefits? <span className="text-gray-500 font-normal text-sm">(optional)</span>
        </h3>
        <textarea
          value={unexpectedBenefits}
          onChange={(e) => setUnexpectedBenefits(e.target.value)}
          placeholder="e.g., 'Confidence boost helped at work' or 'Better sleep was a surprise'"
          className="w-full p-4 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {unexpectedBenefits.length}/500 characters
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={impact === null || submitting}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold transition-all
            ${impact === null || submitting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }
          `}
        >
          {submitting ? 'Submitting...' : 'Submit Reflection'}
        </button>
        <button
          onClick={() => router.push('/mailbox')}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Helper text */}
      <p className="text-center text-sm text-gray-500">
        Your reflection helps others understand the true value of this goal
      </p>
    </div>
  )
}