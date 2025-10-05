'use client'

import { useState, useTransition } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { toggleGoalFollow } from '@/app/actions/goal-following'
import { logger } from '@/lib/utils/logger'

interface FollowGoalButtonProps {
  goalId: string
  initialIsFollowing: boolean
  initialFollowerCount: number
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showCount?: boolean
}

export default function FollowGoalButton({
  goalId,
  initialIsFollowing,
  initialFollowerCount,
  variant = 'outline',
  size = 'default',
  showCount = false
}: FollowGoalButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [isPending, startTransition] = useTransition()

  const handleToggleFollow = async () => {
    // Optimistic update
    const previousIsFollowing = isFollowing
    const previousFollowerCount = followerCount

    setIsFollowing(!isFollowing)
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))

    startTransition(async () => {
      try {
        const result = await toggleGoalFollow(goalId)

        if (result.success) {
          // Update with server response
          setIsFollowing(result.isFollowing)
          setFollowerCount(result.followerCount)
        } else {
          // Revert on error
          setIsFollowing(previousIsFollowing)
          setFollowerCount(previousFollowerCount)
          logger.error('FollowGoalButton: toggle failed', {
            error: result.error,
            goalId
          })
        }
      } catch (error) {
        // Revert on exception
        setIsFollowing(previousIsFollowing)
        setFollowerCount(previousFollowerCount)
        logger.error(
          'FollowGoalButton: unexpected error',
          error instanceof Error ? error : { error, goalId }
        )
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isPending}
      className={`transition-all ${
        isFollowing
          ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
          : ''
      }`}
      aria-label={isFollowing ? 'Unfollow goal' : 'Follow goal'}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-all ${
            isFollowing ? 'fill-current' : ''
          }`}
        />
      )}
      <span>
        {isFollowing ? 'Following' : 'Follow'}
        {showCount && followerCount > 0 && ` (${followerCount})`}
      </span>
    </Button>
  )
}
