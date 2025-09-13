'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/database/client'
import AddDiscussionForm from './AddDiscussionForm'

interface Discussion {
  id: string
  content: string
  upvotes: number
  reply_count: number
  created_at: string
  updated_at: string
  is_edited: boolean
  parent_id: string | null
  user_id: string
  users: {
    username: string | null
    avatar_url: string | null
  }
  replies?: Discussion[]
}

interface CommunityDiscussionsProps {
  goalId: string
  goalTitle: string
  sortBy?: string
}

export default function CommunityDiscussions({ goalId, goalTitle, sortBy = 'newest' }: CommunityDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())

  const supabase = createClient()

  // Get current user and their votes
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      
      // Get user's existing votes for this goal's discussions
      if (user?.id) {
        const { data: votes } = await supabase
          .from('discussion_votes')
          .select('discussion_id')
          .eq('user_id', user.id)
        
        if (votes) {
          setUserVotes(new Set(votes.map(v => v.discussion_id)))
        }
      }
    }
    getUser()
  }, [goalId])

  // Fetch discussions for this goal
  const fetchDiscussions = async () => {
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('goal_discussions')
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .eq('goal_id', goalId)
      .is('parent_id', null) // Only top-level discussions
      .order(sortBy === 'newest' ? 'created_at' : 'upvotes', { ascending: false })

    if (error) {
      console.error('Error fetching discussions:', error)
    } else {
      // Fetch replies for each discussion
      const discussionsWithReplies = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: replies } = await supabase
            .from('goal_discussions')
            .select(`
              *,
              users (
                username,
                avatar_url
              )
            `)
            .eq('parent_id', discussion.id)
            .order('created_at', { ascending: true })

          return {
            ...discussion,
            replies: replies || []
          }
        })
      )
      
      setDiscussions(discussionsWithReplies)
    }
    
    setIsLoading(false)
  }

  // Handle upvote/un-upvote
  const handleUpvote = async (discussionId: string, currentUpvotes: number) => {
    if (!currentUserId) {
      alert('Please sign in to vote on discussions')
      return
    }

    const hasVoted = userVotes.has(discussionId)
    
    if (hasVoted) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('discussion_votes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('discussion_id', discussionId)
      
      if (!deleteError) {
        // Update discussion upvotes count
        const { error: updateError } = await supabase
          .from('goal_discussions')
          .update({ upvotes: Math.max(0, currentUpvotes - 1) })
          .eq('id', discussionId)
        
        if (!updateError) {
          setUserVotes(prev => {
            const newVotes = new Set(prev)
            newVotes.delete(discussionId)
            return newVotes
          })
          
          setDiscussions(prev => prev.map(d => 
            d.id === discussionId 
              ? { ...d, upvotes: Math.max(0, currentUpvotes - 1) }
              : {
                  ...d,
                  replies: d.replies?.map(r => 
                    r.id === discussionId 
                      ? { ...r, upvotes: Math.max(0, currentUpvotes - 1) }
                      : r
                  )
                }
          ))
        }
      }
    } else {
      // Add vote
      const { error: insertError } = await supabase
        .from('discussion_votes')
        .insert({
          user_id: currentUserId,
          discussion_id: discussionId,
          vote_type: 'upvote'
        })
      
      if (!insertError) {
        // Update discussion upvotes count
        const { error: updateError } = await supabase
          .from('goal_discussions')
          .update({ upvotes: currentUpvotes + 1 })
          .eq('id', discussionId)
        
        if (!updateError) {
          setUserVotes(prev => new Set(prev).add(discussionId))
          
          setDiscussions(prev => prev.map(d => 
            d.id === discussionId 
              ? { ...d, upvotes: currentUpvotes + 1 }
              : {
                  ...d,
                  replies: d.replies?.map(r => 
                    r.id === discussionId 
                      ? { ...r, upvotes: currentUpvotes + 1 }
                      : r
                  )
                }
          ))
        }
      }
    }
  }

  // Handle new discussion/reply
  const handleNewPost = () => {
    fetchDiscussions() // Refresh discussions
    setShowAddForm(false)
    setReplyToId(null)
  }

  // Handle edit post
  const handleEdit = (discussionId: string, currentContent: string) => {
    setEditingPostId(discussionId)
    setEditContent(currentContent)
  }

  // Save edit
  const saveEdit = async () => {
    if (!editContent.trim() || !editingPostId) return
    
    const { error } = await supabase
      .from('goal_discussions')
      .update({ 
        content: editContent.trim(),
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingPostId)
    
    if (!error) {
      // Update local state
      setDiscussions(prev => prev.map(d => 
        d.id === editingPostId 
          ? { ...d, content: editContent.trim(), is_edited: true }
          : {
              ...d,
              replies: d.replies?.map(r => 
                r.id === editingPostId 
                  ? { ...r, content: editContent.trim(), is_edited: true }
                  : r
              )
            }
      ))
      setEditingPostId(null)
      setEditContent('')
    }
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingPostId(null)
    setEditContent('')
  }

  // Handle delete post
  const handleDelete = async (discussionId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    const { error } = await supabase
      .from('goal_discussions')
      .delete()
      .eq('id', discussionId)
    
    if (!error) {
      setDiscussions(prev => prev.filter(d => d.id !== discussionId))
    }
  }

  // Handle report content
  const handleReport = async (discussionId: string, reason: string) => {
    const { error } = await supabase
      .from('content_flags')
      .insert({
        content_type: 'goal_discussion',
        content_id: discussionId,
        reason: reason
      })

    if (!error) {
      alert('Content reported. Thank you for helping keep our community safe.')
    }
  }

  useEffect(() => {
    fetchDiscussions()
  }, [goalId, sortBy])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {discussions && discussions.length > 0 ? (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <DiscussionPost
              key={discussion.id}
              discussion={discussion}
              onUpvote={handleUpvote}
              onReply={(id) => {
                setReplyToId(id)
                setShowAddForm(true)
              }}
              onReport={handleReport}
              onEdit={handleEdit}
              onDelete={handleDelete}
              editingPostId={editingPostId}
              editContent={editContent}
              setEditContent={setEditContent}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              currentUserId={currentUserId}
              userVotes={userVotes}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">💬</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Start the conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share your experience or ask a question about this goal.
          </p>
        </div>
      )}
    </>
  )
}

// Individual Discussion Post Component
function DiscussionPost({ 
  discussion, 
  onUpvote, 
  onReply, 
  onReport,
  onEdit,
  onDelete,
  editingPostId,
  editContent,
  setEditContent,
  saveEdit,
  cancelEdit,
  currentUserId,
  userVotes
}: {
  discussion: Discussion
  onUpvote: (id: string, currentUpvotes: number) => void
  onReply: (id: string) => void
  onReport: (id: string, reason: string) => void
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  editingPostId: string | null
  editContent: string
  setEditContent: (content: string) => void
  saveEdit: () => void
  cancelEdit: () => void
  currentUserId?: string
  userVotes: Set<string>
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 relative">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {discussion.users?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {discussion.users?.username || 'Anonymous'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(discussion.created_at)}
              {discussion.is_edited && ' (edited)'}
            </div>
          </div>
        </div>
        
        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {currentUserId === discussion.user_id && (
                <>
                  <button
                    onClick={() => {
                      onEdit(discussion.id, discussion.content)
                      setShowActions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Edit post
                  </button>
                  <button
                    onClick={() => {
                      onDelete(discussion.id)
                      setShowActions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Delete post
                  </button>
                  <hr className="border-gray-200 dark:border-gray-600" />
                </>
              )}
              <button
                onClick={() => {
                  onReport(discussion.id, 'inappropriate')
                  setShowActions(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Report as inappropriate
              </button>
              <button
                onClick={() => {
                  onReport(discussion.id, 'spam')
                  setShowActions(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
              >
                Report as spam
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content - Edit Mode */}
      {editingPostId === discussion.id ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
            rows={4}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={cancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Post Content - View Mode */
        <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100 mb-4">
          <p className="whitespace-pre-wrap">{discussion.content}</p>
        </div>
      )}

      {/* Post Actions - Enhanced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={() => onUpvote(discussion.id, discussion.upvotes)}
            className={`flex items-center space-x-1 transition-colors group ${
              userVotes.has(discussion.id)
                ? 'text-blue-600 dark:text-blue-400'
                : 'hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <svg 
              className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                userVotes.has(discussion.id) ? 'fill-current' : ''
              }`} 
              fill={userVotes.has(discussion.id) ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>{discussion.upvotes} helpful</span>
          </button>
          
          <button
            onClick={() => onReply(discussion.id)}
            className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Reply</span>
          </button>

          {discussion.reply_count > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showReplies ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
              </svg>
              <span>
                {showReplies ? 'Hide' : 'Show'} {discussion.reply_count} {discussion.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>
        
        {/* Thread indicator */}
        {discussion.reply_count > 0 && (
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h8a2 2 0 002-2V8" />
            </svg>
            {discussion.reply_count} in thread
          </div>
        )}
      </div>

      {/* Replies - Enhanced Threading */}
      {showReplies && discussion.replies && discussion.replies.length > 0 && (
        <div className="mt-6 relative">
          {/* Threading line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent dark:from-blue-800"></div>
          
          <div className="pl-8 space-y-4">
            {discussion.replies.map((reply) => (
              <div key={reply.id} className="relative">
                {/* Threading connector */}
                <div className="absolute -left-8 top-4 w-6 h-0.5 bg-blue-200 dark:bg-blue-800"></div>
                <div className="absolute -left-8 top-4 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-600 rounded-full transform -translate-x-0.5 -translate-y-0.5"></div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border-l-2 border-blue-200 dark:border-blue-800">
                  {/* Reply Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {reply.users?.username?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {reply.users?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">↳ replying</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(reply.created_at)}
                      </span>
                      {currentUserId === reply.user_id && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onEdit(reply.id, reply.content)}
                            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">•</span>
                          <button
                            onClick={() => onDelete(reply.id)}
                            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Reply Content */}
                  {editingPostId === reply.id ? (
                    <div className="mb-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap mb-3">
                      {reply.content}
                    </div>
                  )}
                  
                  {/* Reply Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => onUpvote(reply.id, reply.upvotes)}
                      className={`flex items-center space-x-1 text-xs transition-colors ${
                        userVotes.has(reply.id)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                      }`}
                    >
                      <svg 
                        className="w-3 h-3" 
                        fill={userVotes.has(reply.id) ? 'currentColor' : 'none'} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{reply.upvotes} helpful</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}