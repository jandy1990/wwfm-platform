'use client'

import { useState, useEffect, useMemo } from 'react'
import { voteWisdomBenefit, getBenefitVoteCounts, getUserBenefitVotes } from '@/app/actions/vote-wisdom-benefit'
import { createClient } from '@/lib/database/client'

interface Props {
  goalId: string
  benefits: string[]
  initialShowCount?: number
}

/**
 * Displays unexpected benefits as voteable cards
 * Pattern follows community discussions with helpful voting
 */
export default function WisdomBenefitCards({ goalId, benefits, initialShowCount = 3 }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({})

  const supabase = useMemo(() => createClient(), [])

  // Get current user and their votes
  useEffect(() => {
    const loadVotingData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Load vote counts
      const counts = await getBenefitVoteCounts(goalId, benefits)
      setVoteCounts(counts)

      // Load user's votes
      if (user?.id) {
        const votes = await getUserBenefitVotes(goalId, user.id)
        setUserVotes(votes)
      }
    }

    loadVotingData()
  }, [goalId, benefits])

  // Randomize benefit order (but consistent per render)
  const randomizedBenefits = useMemo(() => {
    const shuffled = [...benefits]
    // Use goal ID as seed for consistent randomization
    let seed = goalId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    for (let i = shuffled.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280
      const j = Math.floor((seed / 233280) * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [benefits, goalId])

  const displayedBenefits = showAll ? randomizedBenefits : randomizedBenefits.slice(0, initialShowCount)

  const handleVote = async (benefitText: string) => {
    if (!currentUserId) {
      alert('Please sign in to vote on benefits')
      return
    }

    // Optimistic update
    setIsVoting(prev => ({ ...prev, [benefitText]: true }))

    const hadVoted = userVotes.has(benefitText)
    const currentCount = voteCounts[benefitText] || 0

    // Update UI immediately
    if (hadVoted) {
      setUserVotes(prev => {
        const newVotes = new Set(prev)
        newVotes.delete(benefitText)
        return newVotes
      })
      setVoteCounts(prev => ({
        ...prev,
        [benefitText]: Math.max(0, currentCount - 1)
      }))
    } else {
      setUserVotes(prev => new Set(prev).add(benefitText))
      setVoteCounts(prev => ({
        ...prev,
        [benefitText]: currentCount + 1
      }))
    }

    // Call server action
    const result = await voteWisdomBenefit(goalId, benefitText)

    if (!result.success) {
      // Revert on error
      if (hadVoted) {
        setUserVotes(prev => new Set(prev).add(benefitText))
        setVoteCounts(prev => ({
          ...prev,
          [benefitText]: currentCount
        }))
      } else {
        setUserVotes(prev => {
          const newVotes = new Set(prev)
          newVotes.delete(benefitText)
          return newVotes
        })
        setVoteCounts(prev => ({
          ...prev,
          [benefitText]: Math.max(0, currentCount)
        }))
      }
      alert(result.error || 'Failed to vote. Please try again.')
    }

    setIsVoting(prev => ({ ...prev, [benefitText]: false }))
  }

  if (benefits.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {displayedBenefits.map((benefit, index) => {
          const count = voteCounts[benefit] || 0
          const hasVoted = userVotes.has(benefit)
          const voting = isVoting[benefit] || false

          return (
            <div
              key={`${benefit}-${index}`}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="flex-1 text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                  {benefit}
                </p>
                <button
                  onClick={() => handleVote(benefit)}
                  disabled={voting}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    hasVoted
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${hasVoted ? 'scale-110' : ''}`}
                    fill={hasVoted ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span>{count}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {benefits.length > initialShowCount && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 px-4 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          {showAll ? '↑ Show less' : `→ See all ${benefits.length} benefits`}
        </button>
      )}
    </div>
  )
}
