'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitRetrospective } from '@/app/actions/retrospectives'
import { IMPACT_OPTIONS } from '@/types/retrospectives'
import { FormSectionHeader } from '@/components/organisms/solutions/forms/shared'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  scheduleId: string
  goalTitle: string
  solutionTitle: string
  achievementDate?: string | null
}

export default function RetrospectiveForm({ 
  scheduleId, 
  goalTitle, 
  solutionTitle,
  achievementDate,
}: Props) {
  const router = useRouter()
  const [impact, setImpact] = useState<number | null>(null)
  const [unexpectedBenefits, setUnexpectedBenefits] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (impact === null) return

    setSubmitting(true)
    try {
      // Handle test mode - if scheduleId is a test ID, just show success
      if (scheduleId === 'test-schedule-id') {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
        alert('Test submission successful! Selected impact: ' + impact)
        setSubmitting(false)
        return
      }

      await submitRetrospective(scheduleId, {
        counterfactual_impact: impact,
        worth_pursuing: impact >= 3,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Six-Month Reflection</h1>
      </div>

      {/* Achievement Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal achieved:</p>
            <p className="font-semibold text-lg">{goalTitle}</p>
          </div>
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method used:</p>
            <p className="font-medium">{solutionTitle}</p>
          </div>
        </div>
      </div>

      {/* Main Question - About the GOAL's value */}
      <div className="space-y-6">
        <FormSectionHeader 
          icon="🎯" 
          title="Enduring Impact"
          bgColorClassName="bg-purple-100 dark:bg-purple-900"
        />
        
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            If you hadn't achieved <span className="text-blue-600 dark:text-blue-400">"{goalTitle}"</span>, how different would your life be today?
          </p>
        
          <div className="space-y-3">
            {IMPACT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setImpact(option.value)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02]
                  ${impact === option.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{option.label}</div>
                  </div>
                  {impact === option.value && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce-in">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Unexpected Benefits (Optional) */}
      <div className="space-y-6">
        <FormSectionHeader 
          icon="✨" 
          title="Unexpected Benefits (Optional)"
          bgColorClassName="bg-amber-100 dark:bg-amber-900"
        />
        
        <div className="space-y-4">
          <label htmlFor="unexpected_benefits" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Any unexpected positive changes from achieving this goal?
          </label>
          <textarea
            id="unexpected_benefits"
            value={unexpectedBenefits}
            onChange={(e) => setUnexpectedBenefits(e.target.value)}
            placeholder="e.g., Better confidence, improved relationships, new opportunities..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={impact === null || submitting}
          className={`
            w-full py-3 px-6 rounded-lg font-medium transition-all
            ${impact === null 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }
            ${submitting ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Reflection'
          )}
        </button>
      </div>
    </div>
  )
}
