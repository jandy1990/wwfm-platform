'use client'

import { useState, useEffect, useCallback } from 'react'
import { MailboxItem } from '@/types/retrospectives'
import { getMailboxItems, markAsRead, dismissRetrospective } from '@/app/actions/retrospectives'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function Mailbox({ userId }: { userId: string }) {
  const [items, setItems] = useState<MailboxItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadMailbox = useCallback(async () => {
    try {
      const mailboxItems = await getMailboxItems(userId)
      setItems(mailboxItems)
    } catch (error) {
      console.error('Error loading mailbox:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadMailbox()
  }, [loadMailbox])

  const handleDismiss = async (item: MailboxItem) => {
    try {
      await dismissRetrospective(item.retrospective_schedule_id)
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error('Error dismissing:', error)
    }
  }

  const handleOpen = async (item: MailboxItem) => {
    if (!item.is_read) {
      await markAsRead(item.id)
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, is_read: true } : i
      ))
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No check-ins pending
        </h3>
        <p className="text-gray-600">
          We'll notify you here when it's time to reflect on your achievements
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Check-ins</h2>
        <span className="text-sm text-gray-500">
          {items.filter(i => !i.is_read).length} unread
        </span>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className={`
            border rounded-lg p-4 transition-all
            ${item.is_read ? 'bg-white border-gray-200' : 'bg-purple-50 border-purple-200'}
            hover:shadow-md
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {!item.is_read && (
                  <span className="inline-block w-2 h-2 bg-purple-600 rounded-full"></span>
                )}
                <h3 className="font-semibold text-gray-900">
                  6-Month Reflection
                </h3>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.achievement_date), { addSuffix: true })}
                </span>
              </div>

              <p className="text-gray-700 mb-3">
                You achieved <strong>{item.goal_title}</strong> using{' '}
                <strong>{item.solution_title}</strong>
              </p>

              <p className="text-sm text-gray-600 mb-4">
                Take 30 seconds to share how this has impacted your life
              </p>

              <div className="flex gap-3">
                <Link
                  href={`/retrospective/${item.retrospective_schedule_id}`}
                  onClick={() => handleOpen(item)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Share Reflection
                </Link>
                <button
                  onClick={() => handleDismiss(item)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            <div className="ml-4 text-2xl">
              💭
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
