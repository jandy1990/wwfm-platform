-- Migration: Goal Request System
-- Date: 2025-11-08
-- Purpose: Add constraints, indexes, and RLS policies for goal request functionality

-- 1. Add UNIQUE constraint to prevent duplicate pending requests
-- This handles race conditions at the database level
ALTER TABLE goal_suggestions
ADD CONSTRAINT goal_suggestions_title_normalized_status_unique
UNIQUE NULLS NOT DISTINCT (title_normalized, status);

-- Note: PostgreSQL 15+ supports UNIQUE NULLS NOT DISTINCT
-- This allows multiple NULL status values but enforces uniqueness for non-NULL
-- For older PostgreSQL, use partial index instead:
-- CREATE UNIQUE INDEX goal_suggestions_title_normalized_pending_unique
-- ON goal_suggestions (title_normalized)
-- WHERE status = 'pending';

-- 2. Make description required (helps admin understand context)
ALTER TABLE goal_suggestions
ALTER COLUMN description SET NOT NULL;

-- 3. Add user_email column for notifications (denormalized for efficiency)
ALTER TABLE goal_suggestions
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 4. Add created_goal_id to link approved requests to created goals
ALTER TABLE goal_suggestions
ADD COLUMN IF NOT EXISTS created_goal_id UUID REFERENCES goals(id);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_suggestions_status
ON goal_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_goal_suggestions_created_at_desc
ON goal_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goal_suggestions_suggested_by
ON goal_suggestions(suggested_by);

CREATE INDEX IF NOT EXISTS idx_goal_suggestions_title_normalized
ON goal_suggestions(title_normalized);

-- 6. Enable RLS (if not already enabled)
ALTER TABLE goal_suggestions ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can create goal suggestions" ON goal_suggestions;
DROP POLICY IF EXISTS "Users can view own goal suggestions" ON goal_suggestions;
DROP POLICY IF EXISTS "Admins can view all goal suggestions" ON goal_suggestions;
DROP POLICY IF EXISTS "Admins can update goal suggestions" ON goal_suggestions;

-- 8. Create RLS policies

-- Policy 1: Users can insert their own requests (email verified only)
CREATE POLICY "Users can create goal suggestions"
ON goal_suggestions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = suggested_by
  AND
  -- Check if email is confirmed (from JWT)
  (auth.jwt()->>'email_confirmed_at') IS NOT NULL
);

-- Policy 2: Users can view their own requests
CREATE POLICY "Users can view own goal suggestions"
ON goal_suggestions FOR SELECT
TO authenticated
USING (auth.uid() = suggested_by);

-- Policy 3: Admins can view all requests
CREATE POLICY "Admins can view all goal suggestions"
ON goal_suggestions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Policy 4: Admins can update requests (approve/reject)
CREATE POLICY "Admins can update goal suggestions"
ON goal_suggestions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- 9. Add comment for documentation
COMMENT ON TABLE goal_suggestions IS 'User-submitted goal requests that await admin approval. Duplicate prevention enforced via UNIQUE constraint on (title_normalized, status).';
COMMENT ON COLUMN goal_suggestions.title_normalized IS 'Lowercase, trimmed version of title for duplicate detection';
COMMENT ON COLUMN goal_suggestions.user_email IS 'Denormalized for notification purposes (avoids JOIN with auth.users)';
COMMENT ON COLUMN goal_suggestions.created_goal_id IS 'Links to the goal created when this request was approved';
