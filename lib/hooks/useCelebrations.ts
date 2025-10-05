'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

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
      {
        id: 'seeker',
        title: '🌱 Seeker!',
        message: "You've reached 100 points - just starting the journey!",
        achieved: stats.contributionPoints >= 100 && stats.contributionPoints < 150
      },
      {
        id: 'explorer',
        title: '🔍 Explorer!',
        message: "You've reached 250 points - actively discovering solutions!",
        achieved: stats.contributionPoints >= 250 && stats.contributionPoints < 300
      },
      {
        id: 'guide',
        title: '🗺️ Guide!',
        message: "You've reached 500 points - helping others navigate their path!",
        achieved: stats.contributionPoints >= 500 && stats.contributionPoints < 600
      },
      {
        id: 'pathfinder',
        title: '🧭 Pathfinder!',
        message: "You've reached 1,000 points - clearing the way for others!",
        achieved: stats.contributionPoints >= 1000 && stats.contributionPoints < 1100
      },
      {
        id: 'trailblazer',
        title: '🏔️ Trailblazer!',
        message: "You've reached 2,000 points - breaking new ground!",
        achieved: stats.contributionPoints >= 2000 && stats.contributionPoints < 2100
      },
      {
        id: 'mentor',
        title: '🌟 Mentor!',
        message: "You've reached 3,500 points - sharing wisdom with the community!",
        achieved: stats.contributionPoints >= 3500 && stats.contributionPoints < 3600
      },
      {
        id: 'sage',
        title: '💎 Sage!',
        message: '5,000 points - deep expertise and insight achieved!',
        achieved: stats.contributionPoints >= 5000 && stats.contributionPoints < 5100
      },
      {
        id: 'oracle',
        title: '👑 Oracle!',
        message: '7,500 points - legendary status achieved!',
        achieved: stats.contributionPoints >= 7500 && stats.contributionPoints < 7600
      },
      {
        id: 'luminary',
        title: '✨ Luminary!',
        message: '10,000 points! You\'re enlightening the entire community!',
        achieved: stats.contributionPoints >= 10000 && stats.contributionPoints < 10100
      }
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

        // Extra confetti for special milestones
        if (milestone.id.includes('points') || milestone.id === 'fifty_ratings') {
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

        // Auto-hide after 5 seconds
        setTimeout(() => setShowCelebration(null), 5000)

        break // Only show one at a time
      }
    }
  }, [stats])

  return {
    showCelebration,
    dismissCelebration: () => setShowCelebration(null)
  }
}
