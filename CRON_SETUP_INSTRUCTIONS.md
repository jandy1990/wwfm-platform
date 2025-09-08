# Supabase Edge Function Cron Job Setup

## Function Details
- **Function Name**: `check-retrospectives`
- **Function ID**: `a3acc93b-e651-45df-841a-d43a3fa3b917`
- **Status**: ACTIVE ✅

## Setup Instructions

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `wqxkhxdbxdtpuvuvgirx`
3. Go to **Edge Functions** in the left sidebar

### 2. Configure Cron Trigger
1. Find the `check-retrospectives` function in the list
2. Click on the function name
3. Go to the **Settings** or **Triggers** tab
4. Add a **Cron Trigger** with the following configuration:
   - **Schedule**: `0 9 * * *` (Daily at 9 AM UTC)
   - **Name**: `daily-retrospective-check`
   - **Description**: `Check for due retrospectives and handle reminders/expiration`

### 3. Verify Setup
After setting up the cron job, you can verify it's working by:
- Checking the function logs in the Supabase dashboard
- Monitoring the `retrospective_schedules` and `mailbox_items` tables
- The function returns stats: `{"created": X, "reminders": Y, "expired": Z}`

## Function Behavior

### What it does daily at 9 AM UTC:

1. **Creates mailbox items** for due retrospectives (status: pending → sent)
2. **Sends reminders** for existing notifications (day 1 and day 7)
3. **Expires old retrospectives** after 30 days (sent → expired)

### Expected Response Format:
```json
{
  "success": true,
  "stats": {
    "created": 1,
    "reminders": 0, 
    "expired": 0
  },
  "timestamp": "2025-09-08T02:59:27.891Z"
}
```

## Testing Commands

### Manual Test:
```bash
curl -s --location --request POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/functions/v1/check-retrospectives' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo' \
  --header 'Content-Type: application/json'
```

### Database Verification:
```sql
-- Check retrospective schedules status
SELECT id, status, notification_sent_at, reminder_count, scheduled_date 
FROM retrospective_schedules 
ORDER BY created_at DESC;

-- Check mailbox items
SELECT id, goal_title, solution_title, is_read, is_dismissed, created_at
FROM mailbox_items 
ORDER BY created_at DESC;
```

## Timezone Considerations
- **9 AM UTC** converts to:
  - 6 PM AEDT (Australian Eastern Daylight Time)
  - 1 AM PST (Pacific Standard Time)
  - 4 AM EST (Eastern Standard Time)
  - 10 AM CET (Central European Time)

Adjust the cron schedule if different timing is preferred.

## Monitoring & Alerts
Consider setting up monitoring for:
- Function execution failures
- Unexpected high/low stats numbers
- Database constraint violations
- Edge function timeout errors