# Mailbox System

**Location:** `/app/mailbox`
**Last Updated:** November 2, 2025

## Purpose

Central notification center for user communications:
- **User Notifications:** "Someone commented on your solution"
- **System Messages:** Automated messages from the platform
- **6-Month Follow-ups:** Retrospective surveys sent 6 months after solution submission

## Key Features

### Retrospective Follow-ups (Primary Use Case)
- **Trigger:** 6 months after user submits a solution
- **Purpose:** Ask if the solution made a significant difference in their life
- **Implementation:** Triggered via Supabase cron job
- **Location:** Delivered to user's mailbox
- **Action:** Click link → Goes to `/retrospective/[id]`

### System Notifications
- Solution approval/rejection status
- New discussion replies
- Milestone achievements
- Platform updates

## What's NOT Included

- ❌ **No direct messaging between users** (not planned)
- ❌ **No real-time chat** (notifications only)
- ❌ **No external email forwarding** (inbox lives in platform)

## Data Model

**Table:** `mailbox_items`

**Key Fields:**
- `user_id` - Recipient
- `message_type` - Type of notification (retrospective, system, etc.)
- `title` - Subject line
- `content` - Message body
- `link_url` - Optional action link (e.g., `/retrospective/abc123`)
- `read_at` - Timestamp when user opened message
- `created_at` - When message was sent

**Related Tables:**
- `retrospective_schedules` - Manages when to send follow-ups
- `goal_retrospectives` - Stores retrospective responses
- `ratings` - Tracks which solutions trigger follow-ups

## User Flow

1. User submits solution that worked for a goal
2. System creates entry in `retrospective_schedules` for +6 months
3. Supabase cron job runs daily, checks for due retrospectives
4. Cron creates mailbox item with link to retrospective form
5. User sees notification badge on mailbox icon
6. User clicks to view mailbox
7. User clicks retrospective link
8. User completes retrospective survey
9. Mailbox item marked as read

## Implementation Files

- **Mailbox page:** `app/mailbox/page.tsx`
- **Mailbox API:** `app/actions/mailbox.ts` (if exists)
- **Cron job:** Configured in Supabase dashboard
- **Database:** `mailbox_items` table

## Future Enhancements

- [ ] Email digests (daily/weekly summaries sent to user email)
- [ ] Push notifications for mobile
- [ ] Rich notification types (images, embedded content)
- [ ] Notification preferences (customize what you receive)
- [ ] Mark all as read functionality
- [ ] Archive old messages
