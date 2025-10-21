'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { MILESTONES } from '@/lib/milestones'

export interface Milestone {
  id: string
  title: string
  message: string
  achieved: boolean
}

interface Stats {
  contributionPoints: number
  ratingsCount: number
  commentsCount: number
  helpfulVotes: number
  solutionsCount: number
}

export function useCelebrations(stats: Stats | null) {
  const [showCelebration, setShowCelebration] = useState<Milestone | null>(null)

  useEffect(() => {
    if (!stats || typeof window === 'undefined') return

    // Generate milestone celebrations from centralized MILESTONES constant
    const pointsMilestones: Milestone[] = MILESTONES.map((milestone, index) => {
      const nextMilestone = MILESTONES[index + 1]
      const upperBound = nextMilestone ? nextMilestone.threshold : milestone.threshold + 100

      return {
        id: milestone.key,
        title: `${milestone.emoji} ${milestone.name}!`,
        message: `You've reached ${milestone.threshold.toLocaleString()} points - ${milestone.description}!`,
        achieved: stats.contributionPoints >= milestone.threshold && stats.contributionPoints < upperBound
      }
    })

    const milestones: Milestone[] = [
      {
        id: 'first_rating',
        title: '🎉 First Rating!',
        message: 'You just helped someone find what works!',
        achieved: stats.ratingsCount === 1
      },
      {
        id: 'five_ratings',
        title: '⭐ Rating Streak!',
        message: "You've rated 5 solutions - you're building the community!",
        achieved: stats.ratingsCount === 5
      },
      {
        id: 'ten_ratings',
        title: '🏆 Double Digits!',
        message: '10 ratings! Your insights are invaluable.',
        achieved: stats.ratingsCount === 10
      },
      {
        id: 'twenty_five_ratings',
        title: '🌟 Quarter Century!',
        message: '25 ratings! You\'re a community pillar!',
        achieved: stats.ratingsCount === 25
      },
      {
        id: 'fifty_ratings',
        title: '💎 Half Century!',
        message: '50 ratings! Your expertise is shining through!',
        achieved: stats.ratingsCount === 50
      },
      {
        id: 'first_discussion',
        title: '💬 Conversation Starter!',
        message: 'Your first discussion could help countless others!',
        achieved: stats.commentsCount === 1
      },
      {
        id: 'five_discussions',
        title: '🗣️ Voice of Wisdom!',
        message: '5 discussions! Keep sharing your experiences!',
        achieved: stats.commentsCount === 5
      },
      {
        id: 'first_helpful_vote',
        title: '👍 Someone Appreciates You!',
        message: 'You got your first helpful vote!',
        achieved: stats.helpfulVotes === 1
      },
      {
        id: 'five_helpful_votes',
        title: '🌈 Helping Hand!',
        message: '5 people found your insights helpful!',
        achieved: stats.helpfulVotes === 5
      },
      {
        id: 'ten_helpful_votes',
        title: '🌟 Community Hero!',
        message: '10 people found your insights helpful!',
        achieved: stats.helpfulVotes === 10
      },
      // Points milestones are now generated from MILESTONES constant above
      ...pointsMilestones
    ]

    // Get celebrated milestones from localStorage
    const celebratedMilestones = JSON.parse(localStorage.getItem('celebratedMilestones') || '[]')

    // Check for newly achieved milestones
    for (const milestone of milestones) {
      if (milestone.achieved && !celebratedMilestones.includes(milestone.id)) {
        // Show celebration
        setShowCelebration(milestone)

        // Fire confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })

        // Extra confetti for special milestones (point milestones + rating milestones)
        const isMilestoneCelebration = MILESTONES.some(m => m.key === milestone.id)
        if (isMilestoneCelebration || milestone.id === 'fifty_ratings') {
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            })
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            })
          }, 250)
        }

        // Mark as celebrated
        celebratedMilestones.push(milestone.id)
        localStorage.setItem('celebratedMilestones', JSON.stringify(celebratedMilestones))

        // Auto-hide after 8 seconds (gives users time to read)
        setTimeout(() => setShowCelebration(null), 8000)

        break // Only show one at a time
      }
    }
  }, [stats])

  return {
    showCelebration,
    dismissCelebration: () => setShowCelebration(null)
  }
}
