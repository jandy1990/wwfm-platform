# Content Gating Feature Flag

## Overview

The content gating feature can be easily toggled on/off using an environment variable. This allows for flexible deployment strategies (e.g., disabled for beta testing, enabled for production launch).

## Environment Variable

**Variable name:** `NEXT_PUBLIC_ENABLE_CONTENT_GATING`

**Location:** `.env.local` (local development) or Vercel environment variables (production)

**Values:**
- `true` or `1` - Content gating **enabled** (anonymous users see limited content)
- `false` or omitted - Content gating **disabled** (everyone sees all content)

**Default:** `false` (disabled for safer beta testing)

## What Content Gating Controls

When **enabled** (anonymous users have limited access):
- **Solutions:** Anonymous users see only top 5 solutions per goal
- **Discussion Replies:** Anonymous users see gated overlays instead of reply content
- **Sorting/Filtering:** Disabled for anonymous users (prompts to sign in)
- **SEO:** Unaffected - search engines still see all solution titles via metadata

When **disabled** (everyone has full access):
- **Solutions:** All users see all solutions regardless of auth status
- **Discussion Replies:** All users can read all replies
- **Sorting/Filtering:** Available to everyone
- **SEO:** Same - metadata includes all solutions

## How to Toggle

### For Local Development

1. Open `.env.local`
2. Find or add the line: `NEXT_PUBLIC_ENABLE_CONTENT_GATING=false`
3. Change to `true` to enable or `false` to disable
4. Restart your Next.js dev server (`npm run dev`)

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add/update `NEXT_PUBLIC_ENABLE_CONTENT_GATING` with value `true` or `false`
4. Redeploy your application

## Use Cases

### Beta Testing Phase
```bash
NEXT_PUBLIC_ENABLE_CONTENT_GATING=false
```
- All beta testers can access full content without signing up
- Easier onboarding and testing experience
- Collects feedback on full platform functionality

### Production Launch
```bash
NEXT_PUBLIC_ENABLE_CONTENT_GATING=true
```
- Encourages user sign-ups to access full content
- Creates user accounts for future engagement
- Maintains SEO visibility while gating content

## Technical Implementation

### Server-Side Gating
- `lib/config/features.ts` - Feature flag logic
- `app/goal/[id]/page.tsx` - Server component uses `getEffectiveAuthStatus()`
- Data filtering happens before sending to client (secure)

### Client-Side UI
- `components/goal/GoalPageClient.tsx` - Solution list gating
- `components/goal/CommunityDiscussions.tsx` - Reply gating
- UI checks `isContentGatingEnabled()` for overlay display

### Database Layer
- RLS policies allow reading all content (for flexibility)
- UI controls what users actually see
- Write operations always require authentication

## Security Notes

- Content gating is **server-side enforced** for solutions (data never sent to client)
- Cannot be bypassed via DOM inspection or browser plugins
- RLS policies always protect write operations
- Feature flag only affects read access presentation
