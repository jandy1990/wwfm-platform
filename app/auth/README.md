# Authentication System

**Location:** `/app/auth`
**Last Updated:** November 2, 2025

## Overview

WWFM uses a simple binary authentication system: logged out vs logged in. No complex roles, moderators, or permission levels at this stage.

## User Roles

- **Simple binary system:** Logged out vs Logged in
- **No complex roles** (no moderators, admins, etc. at this stage)

## Current Implementation

- **Default:** All pages are public - users can browse goals/solutions without logging in
- **Contribution:** Unauthenticated users trying to contribute get redirected to login
- **Protected Routes:** Dashboard, solution submission, retrospectives, mailbox require authentication

## Authentication Provider

**Supabase Auth** with email verification:
- Email/password authentication
- Email verification required before contribution
- Session management handled by Supabase
- RLS policies enforce data access control

## Protected vs Public Routes

### Protected Routes (Require Auth)
- `/dashboard/*` - User dashboard and analytics
- `/goal/[id]/add-solution` - Solution contribution form
- `/retrospective/*` - Retrospective features
- `/mailbox/*` - Messaging/notification system

### Public Routes
All other routes are publicly accessible:
- `/browse` - Main browsing experience
- `/arena/[slug]` - Arena pages
- `/category/[slug]` - Category pages
- `/goal/[id]` - Goal pages (viewing only)

## Future Authentication Plans

### Scroll Depth Limit (Planned)
- **After certain scroll depth** (e.g., 10 solutions), require login
- **Rationale:** Give taste of value, then require account for full access
- **Additional Benefit:** Protects content from AI scraping

### Anti-Scraping Strategy
**Goal:** Allow Google indexing while preventing AI training on content

**Implementation:**
1. **robots.txt:** Block known AI crawlers (GPTBot, CCBot, anthropic-ai, etc.) ✅
2. **Authentication gate:** Require login after viewing 10 solutions (primary protection)
3. **Terms of Service:** Explicitly prohibit AI training use
4. **Reality check:** Good actors respect robots.txt, bad actors ignore it

**Decision:** Authentication is the primary defense against scraping

## Auth Routes

### `/auth/signin`
- Email/password login
- Redirects to dashboard or original destination after login

### `/auth/signup`
- New user registration
- Email verification required
- Sends verification email via Supabase

### `/auth/callback`
- OAuth callback handler
- Email verification redirect
- Error handling for auth flows

### `/auth/reset-password`
- Password reset request
- Email link sent via Supabase

### `/auth/update-password`
- Password change after reset
- Requires valid reset token

## Implementation Files

- **Auth pages:** `app/auth/*`
- **Auth helpers:** `lib/database/server.ts`, `lib/database/client.ts`
- **Middleware:** Next.js middleware for protected routes
- **RLS Policies:** Database-level access control (see `docs/database/schema.md`)

## Key Design Decisions

| Decision | Reasoning | Status |
|----------|-----------|--------|
| Simple auth: logged out vs logged in | No complex roles needed yet | ✅ Confirmed |
| All pages public by default | Low barrier to entry for discovery | ✅ Confirmed |
| Future: Scroll depth limits | Give value taste, then require account | 📋 Planned |
| Protected routes for contribution | Maintain data quality and accountability | ✅ Confirmed |
| Block AI crawlers via robots.txt | Prevent training while allowing Google | ✅ Implemented |
| Auth as primary anti-scraping | More effective than robots.txt | ✅ Confirmed |

## Security Considerations

**Row Level Security (RLS):**
- All user data protected by RLS policies
- Users can only access their own private data
- Public data (aggregated effectiveness) accessible to all
- Service role key bypasses RLS (admin operations only)

**Email Verification:**
- Required before users can contribute solutions
- Prevents spam/fake accounts
- Managed by Supabase Auth

**Session Management:**
- Sessions handled by Supabase
- Automatic token refresh
- Secure httpOnly cookies

## Known Issues & Future Work

**To Verify:**
- [ ] Confirm unauthenticated users redirect to login when trying to contribute
- [ ] Test auth middleware on all protected routes

**Future Improvements:**
1. Implement scroll depth authentication gate (anti-scraping)
2. Add social auth providers (Google, GitHub, etc.)
3. Implement "Remember me" functionality
4. Add 2FA for high-value accounts
