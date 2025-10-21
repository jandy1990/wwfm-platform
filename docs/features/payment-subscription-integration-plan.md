# Payment & Subscription Integration Plan
## WWFM Platform - Australian Business Context

**Status**: Planning
**Created**: 2025-10-19
**Target Implementation**: TBD (after Australian business registration)
**Business Requirement**: Subscription paywall for full solution access and comment participation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Requirements](#business-requirements)
3. [Platform Comparison](#platform-comparison)
4. [Detailed Cost Analysis](#detailed-cost-analysis)
5. [Technical Architecture](#technical-architecture)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Australian Compliance](#australian-compliance)
8. [Resources & Links](#resources--links)
9. [Decision Record](#decision-record)

---

## Executive Summary

### Recommendation: **Stripe + Stripe Tax**

**Key Benefits:**
- ✅ **Lowest cost**: 2.9% vs 5%+ (74% cheaper than alternatives)
- ✅ **Best developer experience**: Industry-leading API, extensive Next.js 15 + Supabase documentation
- ✅ **Automated GST handling**: Stripe Tax manages Australian tax compliance
- ✅ **Perfect technical fit**: Aligns with WWFM's existing architecture (Next.js, Supabase, server actions)
- ✅ **Scale-ready**: Proven at enterprise scale with flexibility for future features

**Cost Savings Example:**
- At 1,000 subscribers ($10/month): **Stripe saves ~$5,000 USD/year** vs Paddle
- At 10,000 subscribers: **Saves ~$50,000 USD/year**

**Implementation Effort:**
- Estimated: 2-3 weeks (leveraging existing WWFM infrastructure)
- WWFM already has: Feature flags, RLS policies, server actions, auth system

---

## Business Requirements

### Subscription Model

**Free Tier (Anonymous & Non-Subscribers):**
- View top 5 highest-rated solutions per goal
- Browse goals and arenas
- Search functionality
- View solution metadata (effectiveness, cost, time to results)

**Paid Tier (Subscribers Only):**
- View **all solutions** for each goal (beyond top 5)
- Contribute to solution comments
- View replies to comments
- Full community participation

### Payment Requirements

1. **Recurring Subscriptions**: Monthly/annual billing
2. **International Payments**: Accept cards from any country
3. **Australian Business Entity**: Business registered in Australia
4. **GST Compliance**: Automatic GST calculation and collection for Australian customers
5. **Self-Service**: Customer portal for subscription management
6. **Trial Period**: Optional free trial capability
7. **Webhooks**: Real-time subscription status updates

---

## Platform Comparison

### Option 1: Stripe ⭐ **RECOMMENDED**

#### Pricing
- **Base rate**: 2.9% + $0.30 per transaction
- **International cards**: +1% fee
- **Currency conversion**: +1% fee
- **Stripe Tax (GST automation)**: +0.5% of transaction
- **Effective rate**: 3.4% - 4.9% all-in

#### Pros
- ✅ **Lowest fees** - 74% cheaper than Paddle/Lemon Squeezy
- ✅ **Best developer experience** - Industry-leading documentation
- ✅ **Excellent Next.js 15 + Supabase integration** - Multiple official templates
- ✅ **Stripe Tax** - Automated GST calculation and compliance
- ✅ **Largest ecosystem** - Extensive integrations and tools
- ✅ **Advanced features** - Metered billing, proration, customer portal
- ✅ **Proven at scale** - Used by thousands of SaaS companies
- ✅ **Test mode** - Realistic testing environment

#### Cons
- ⚠️ You remain merchant of record (responsible for tax filing, mitigated by Stripe Tax)
- ⚠️ More development effort than Merchant of Record solutions
- ⚠️ Requires webhook infrastructure

#### Subscription Features
- ✅ Multiple pricing tiers
- ✅ Free trials
- ✅ Proration handling
- ✅ Metered billing
- ✅ Customer self-service portal
- ✅ Dunning management (failed payment recovery)
- ✅ Tax ID validation (ABN for Australian B2B)

#### Developer Experience
- **Rating**: ⭐⭐⭐⭐⭐ Excellent
- Comprehensive API documentation
- Official Next.js starter templates
- Multiple Supabase integration guides (2025)
- Extensive webhook documentation
- Real-time event streaming
- CLI tools for testing
- Stripe Dashboard for monitoring

#### Australian/GST Support
- ✅ **Stripe Tax** automatically calculates GST
- ✅ Auto-alerts when approaching $75K AUD threshold
- ✅ ABN validation for B2B customers (reverse charge)
- ✅ Supports 10% GST rate
- ⚠️ You file GST returns (Stripe provides reports)

---

### Option 2: Paddle

#### Pricing
- **Base rate**: 5% + $0.50 per transaction
- **Effective rate**: ~5.5% all-in
- **74% more expensive than Stripe**

#### Pros
- ✅ **Merchant of Record** - Paddle handles ALL tax compliance and filing
- ✅ Advanced subscription management features
- ✅ Churn reduction tools
- ✅ Customer journey customization
- ✅ Zero tax admin burden

#### Cons
- ❌ **74% higher fees** - Significant cost at scale
- ⚠️ Less flexible API than Stripe
- ⚠️ Smaller ecosystem and community
- ⚠️ Fewer Next.js 15 integration examples
- ⚠️ Less comprehensive documentation

#### Developer Experience
- **Rating**: ⭐⭐⭐ Good but limited
- Documentation less comprehensive than Stripe
- More opinionated/less customizable
- Fewer community resources
- Easier initial setup (plug-and-play)

#### When to Choose Paddle
- You absolutely cannot handle any tax compliance (even automated)
- Budget allows for 74% higher payment fees
- Need zero development resources for payment infrastructure
- Require Merchant of Record status

---

### Option 3: Lemon Squeezy ❌ **NOT RECOMMENDED**

#### Pricing
- **Base rate**: 5% + $0.50 per transaction
- **International (non-US) surcharge**: +1.5%
- **Effective rate for Australian business**: 6.5%+
- **User reports**: Up to 12%+ after all fees

#### Why NOT Recommended
- ⚠️ **Acquired by Stripe in 2024** - Uncertain future
- ⚠️ **Higher fees for non-US businesses** (Australia qualifies)
- ⚠️ Integration challenges post-acquisition
- ⚠️ Reduced feature development
- ⚠️ Being consolidated into Stripe's offerings
- ⚠️ Target audience: Solo creators, not SaaS platforms

#### Developer Experience
- **Rating**: ⭐⭐ Limited
- User-friendly but less powerful than alternatives
- Limited Next.js 15 examples
- Uncertain roadmap post-acquisition

---

## Detailed Cost Analysis

### Fee Comparison Table

| Platform | Base Fee | International Fee | Tax Automation | Effective Rate |
|----------|----------|-------------------|----------------|----------------|
| **Stripe** | 2.9% + $0.30 | +1% | +0.5% | **3.4% - 4.9%** |
| **Paddle** | 5% + $0.50 | Included | Included (MoR) | **~5.5%** |
| **Lemon Squeezy** | 5% + $0.50 | +1.5% | Included (MoR) | **~6.5%+** |

### Cost Projections at Scale

#### Scenario 1: 100 Subscribers @ $10 USD/month

| Platform | Fee per Transaction | Monthly Revenue | Monthly Fees | Annual Fees |
|----------|---------------------|-----------------|--------------|-------------|
| **Stripe** | $0.59 | $1,000 | $59 | **$708** |
| **Paddle** | $1.00 | $1,000 | $100 | **$1,200** |
| **Lemon Squeezy** | $1.15 | $1,000 | $115 | **$1,380** |

**Stripe saves**: $492 - $672 per year

---

#### Scenario 2: 1,000 Subscribers @ $10 USD/month

| Platform | Fee per Transaction | Monthly Revenue | Monthly Fees | Annual Fees | Difference vs Stripe |
|----------|---------------------|-----------------|--------------|-------------|----------------------|
| **Stripe** | $0.59 | $10,000 | $590 | **$7,080** | - |
| **Paddle** | $1.00 | $10,000 | $1,000 | **$12,000** | **+$4,920/year** ❌ |
| **Lemon Squeezy** | $1.15 | $10,000 | $1,150 | **$13,800** | **+$6,720/year** ❌ |

**Stripe saves**: $4,920 - $6,720 per year

---

#### Scenario 3: 5,000 Subscribers @ $10 USD/month

| Platform | Monthly Revenue | Monthly Fees | Annual Fees | Difference vs Stripe |
|----------|-----------------|--------------|-------------|----------------------|
| **Stripe** | $50,000 | $2,950 | **$35,400** | - |
| **Paddle** | $50,000 | $5,000 | **$60,000** | **+$24,600/year** ❌ |
| **Lemon Squeezy** | $50,000 | $5,750 | **$69,000** | **+$33,600/year** ❌ |

**Stripe saves**: $24,600 - $33,600 per year

---

#### Scenario 4: 10,000 Subscribers @ $10 USD/month

| Platform | Monthly Revenue | Monthly Fees | Annual Fees | Difference vs Stripe |
|----------|-----------------|--------------|-------------|----------------------|
| **Stripe** | $100,000 | $5,900 | **$70,800** | - |
| **Paddle** | $100,000 | $10,000 | **$120,000** | **+$49,200/year** ❌ |
| **Lemon Squeezy** | $100,000 | $11,500 | **$138,000** | **+$67,200/year** ❌ |

**Stripe saves**: $49,200 - $67,200 per year

---

### Break-Even Analysis

**Question**: At what subscriber count does Stripe's savings justify the additional tax admin effort?

**Answer**: Immediately.

- At just **100 subscribers**: Stripe saves $492 - $672/year
- At **1,000 subscribers**: Stripe saves $4,920 - $6,720/year
- **Stripe Tax** automates most compliance work for only 0.5% fee
- Tax admin effort (even with Stripe Tax): ~2-4 hours/quarter for BAS filing
- **Hourly value of saved fees** (at 1K subs): $1,230 - $1,680/quarter ÷ 4 hours = **$307 - $420/hour**

**Conclusion**: Stripe is financially superior at any scale, even factoring in tax admin time.

---

## Technical Architecture

### WWFM's Current Infrastructure (Perfect for Stripe)

```typescript
✅ Already Built:
- Next.js 15 (App Router) ← Stripe has official support
- Supabase auth + database ← Well-documented integration path
- Feature flag system (lib/config/features.ts) ← Ready for subscription gating
- Server actions pattern ← Ideal for Stripe API calls
- RLS policies ← Easy to extend for subscription checks
- TypeScript everywhere ← Stripe has excellent TypeScript support
```

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 15 App Router)                           │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐│
│  │ Pricing Page   │  │ Goal Page    │  │ Comment Section ││
│  │ (Subscribe CTA)│  │ (Gated List) │  │ (Gated Replies) ││
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘│
│           │                  │                    │          │
│           └──────────────────┴────────────────────┘          │
│                              │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────┐
│  SERVER ACTIONS (app/actions/stripe.ts)                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ createCheckoutSession(userId, priceId)                  ││
│  │ createPortalSession(userId)                             ││
│  │ getSubscriptionStatus(userId)                           ││
│  │ cancelSubscription(userId)                              ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────┼────────────────────────────────┘
                               │
┌──────────────────────────────┼────────────────────────────────┐
│  STRIPE INTEGRATION                                           │
│  ┌─────────────────────┐    ┌───────────────────────────┐   │
│  │ Stripe Checkout     │    │ Stripe Customer Portal    │   │
│  │ (Hosted payment)    │    │ (Self-service management) │   │
│  └─────────┬───────────┘    └───────────────────────────┘   │
│            │                                                  │
│            │  Events: subscription.created,                  │
│            │          subscription.updated,                  │
│            │          subscription.deleted,                  │
│            │          invoice.payment_succeeded, etc.        │
│            ↓                                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Webhook Handler (app/api/webhooks/stripe/route.ts)     ││
│  │ - Verify signature                                      ││
│  │ - Update Supabase user_subscriptions table              ││
│  │ - Trigger email notifications (optional)                ││
│  └─────────┬───────────────────────────────────────────────┘│
└────────────┼────────────────────────────────────────────────┘
             │
┌────────────┼────────────────────────────────────────────────┐
│  SUPABASE DATABASE                                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ TABLE: user_subscriptions (NEW)                         ││
│  │ - id (uuid, primary key)                                ││
│  │ - user_id (uuid, FK → auth.users)                      ││
│  │ - stripe_customer_id (text)                             ││
│  │ - stripe_subscription_id (text)                         ││
│  │ - status (enum: active, canceled, past_due, etc.)       ││
│  │ - current_period_start (timestamp)                      ││
│  │ - current_period_end (timestamp)                        ││
│  │ - plan_id (text: monthly, annual, etc.)                 ││
│  │ - cancel_at_period_end (boolean)                        ││
│  │ - created_at (timestamp)                                ││
│  │ - updated_at (timestamp)                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ RLS POLICIES (UPDATED)                                  ││
│  │                                                          ││
│  │ goal_implementation_links:                              ││
│  │   - Public: View top 5 solutions (implementation_rank ≤ 5)││
│  │   - Subscribers: View all solutions                     ││
│  │                                                          ││
│  │ comments:                                                ││
│  │   - Public: View top-level comments                     ││
│  │   - Subscribers only: Create comments                   ││
│  │                                                          ││
│  │ comment_replies:                                         ││
│  │   - Subscribers only: View and create replies           ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Content Gating Implementation

#### Extend Existing Feature Flag System

```typescript
// lib/config/features.ts - EXTEND EXISTING

/**
 * Check if subscription is required to access full content
 */
export function isSubscriptionRequired(): boolean {
  const envFlag = process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION
  // Default to false during development/beta
  // Enable when ready to monetize
  return envFlag === 'true' || envFlag === '1'
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single()

  if (error || !data) return false

  // Check status and expiry
  return data.status === 'active' &&
         new Date(data.current_period_end) > new Date()
}

/**
 * Determine if user can access full content (all solutions, comment replies)
 */
export async function canAccessFullContent(
  userId: string | null
): Promise<boolean> {
  // Feature flag override (e.g., during beta testing)
  if (!isSubscriptionRequired()) {
    return true
  }

  // Anonymous users cannot access full content
  if (!userId) {
    return false
  }

  // Check subscription status
  return await hasActiveSubscription(userId)
}

/**
 * Determine if user can participate in comments
 */
export async function canParticipateInComments(
  userId: string | null
): Promise<boolean> {
  // Must be authenticated
  if (!userId) return false

  // Check subscription requirement
  return await canAccessFullContent(userId)
}
```

#### Database Schema - New Table

```sql
-- user_subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'unpaid'
  )),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  plan_id TEXT NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_user_subscriptions_user_id
  ON user_subscriptions(user_id);

CREATE INDEX idx_user_subscriptions_stripe_customer
  ON user_subscriptions(stripe_customer_id);

CREATE INDEX idx_user_subscriptions_status
  ON user_subscriptions(status);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "users_view_own_subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system/webhooks can modify subscriptions
-- (handled via service role key in webhook handler)
```

#### Update Existing RLS Policies

```sql
-- ========================================
-- SOLUTION ACCESS GATING
-- ========================================

-- Drop existing policy
DROP POLICY IF EXISTS "public_view_approved_solutions"
  ON goal_implementation_links;

-- New policy: Top 5 for everyone, all for subscribers
CREATE POLICY "gated_solution_access"
  ON goal_implementation_links
  FOR SELECT
  USING (
    -- Top 5 solutions always visible
    implementation_rank <= 5
    OR
    -- Subscribers see all solutions
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND current_period_end > NOW()
    )
  );

-- ========================================
-- COMMENT PARTICIPATION GATING
-- ========================================

-- Allow comment creation only for subscribers
CREATE POLICY "subscribers_create_comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND current_period_end > NOW()
    )
  );

-- ========================================
-- REPLY VISIBILITY & PARTICIPATION GATING
-- ========================================

-- Subscribers only can view replies
CREATE POLICY "subscribers_view_replies"
  ON comment_replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND current_period_end > NOW()
    )
  );

-- Subscribers only can create replies
CREATE POLICY "subscribers_create_replies"
  ON comment_replies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND current_period_end > NOW()
    )
  );
```

#### Server Actions

```typescript
// app/actions/stripe.ts
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/database/server'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Check if user already has a Stripe customer ID
  let customerId: string | undefined

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (subscription?.stripe_customer_id) {
    customerId = subscription.stripe_customer_id
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    metadata: {
      user_id: user.id,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
      },
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  // Redirect to Stripe Checkout
  redirect(session.url)
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Get customer ID
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No subscription found')
  }

  // Create portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
  })

  redirect(portalSession.url)
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return subscription
}
```

#### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use service role for webhook operations (bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_id: subscription.items.data[0]?.price.id || 'unknown',
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Failed to update subscription:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id

  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to cancel subscription:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Optional: Send confirmation email
  console.log(`Payment succeeded for invoice ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Optional: Send payment failed email
  console.log(`Payment failed for invoice ${invoice.id}`)
}
```

---

## Implementation Roadmap

### Prerequisites (Before Starting)

- [ ] **Australian business entity registered** (ABN obtained)
- [ ] **Business bank account** opened
- [ ] **Stripe account** created with Australian business details
- [ ] Decide on pricing structure (monthly/annual, trial period, etc.)

---

### Phase 1: Foundation Setup (Week 1)

**Estimated Time**: 5-8 hours

#### Stripe Configuration
- [ ] Create Stripe account (Australian entity)
- [ ] Enable **Stripe Tax** in dashboard
- [ ] Create products and pricing
  - [ ] Monthly subscription product
  - [ ] Annual subscription product (optional)
  - [ ] Set prices (e.g., $10 USD/month)
- [ ] Configure tax settings for GST (10%)
- [ ] Set up webhook endpoint URL (will configure in Phase 2)
- [ ] Generate API keys (test + live)

#### Environment Setup
- [ ] Install Stripe dependencies:
  ```bash
  npm install stripe @stripe/stripe-js
  ```
- [ ] Add environment variables to `.env.local`:
  ```bash
  # Stripe
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...

  # Feature Flags
  NEXT_PUBLIC_REQUIRE_SUBSCRIPTION=false  # Start disabled

  # Site URL
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
- [ ] Add production keys to Vercel environment variables

#### Database Setup
- [ ] Create `user_subscriptions` table (see schema above)
- [ ] Add indexes
- [ ] Enable RLS
- [ ] Add RLS policies for user access
- [ ] Test table creation with Supabase Studio

**Deliverable**: Stripe account configured, database ready, environment variables set

---

### Phase 2: Core Integration (Week 2)

**Estimated Time**: 12-16 hours

#### Server Actions
- [ ] Create `app/actions/stripe.ts`
- [ ] Implement `createCheckoutSession()`
- [ ] Implement `createPortalSession()`
- [ ] Implement `getSubscriptionStatus()`
- [ ] Add error handling and logging
- [ ] Test with Stripe test mode

#### Webhook Handler
- [ ] Create `app/api/webhooks/stripe/route.ts`
- [ ] Implement signature verification
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Handle `invoice.payment_succeeded`
- [ ] Handle `invoice.payment_failed`
- [ ] Add comprehensive logging
- [ ] Test with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  stripe trigger customer.subscription.created
  ```

#### Pricing Page
- [ ] Create `app/pricing/page.tsx`
- [ ] Display subscription plans
- [ ] Add "Subscribe" CTA buttons
- [ ] Integrate with `createCheckoutSession()` action
- [ ] Add loading states
- [ ] Test checkout flow end-to-end

#### Account Management
- [ ] Create `app/account/page.tsx` (or update existing)
- [ ] Display current subscription status
- [ ] Add "Manage Subscription" button → Customer Portal
- [ ] Show subscription details (plan, renewal date, status)
- [ ] Add cancel/renew messaging

**Deliverable**: Working subscription flow (checkout → webhook → database update)

---

### Phase 3: Content Gating (Week 3)

**Estimated Time**: 10-12 hours

#### Feature Flag Integration
- [ ] Extend `lib/config/features.ts` with subscription functions
- [ ] Implement `isSubscriptionRequired()`
- [ ] Implement `hasActiveSubscription(userId)`
- [ ] Implement `canAccessFullContent(userId)`
- [ ] Implement `canParticipateInComments(userId)`
- [ ] Add unit tests for feature flag logic

#### RLS Policy Updates
- [ ] Update `goal_implementation_links` policy (top 5 vs all)
- [ ] Add `comments` INSERT policy (subscribers only)
- [ ] Add `comment_replies` SELECT policy (subscribers only)
- [ ] Add `comment_replies` INSERT policy (subscribers only)
- [ ] Test policies with different user states:
  - [ ] Anonymous user (sees top 5)
  - [ ] Authenticated non-subscriber (sees top 5)
  - [ ] Authenticated subscriber (sees all)

#### UI Gating Components
- [ ] Create `SubscriptionGate.tsx` component
- [ ] Add "Upgrade to view all solutions" message on goal pages
- [ ] Add "Subscribe to participate" message on comments
- [ ] Add "Subscribe to view replies" message on comment replies
- [ ] Implement smooth UX for non-subscribers (clear CTAs)
- [ ] Add subscription status indicator in navigation

#### Goal Page Updates
- [ ] Modify solution list to respect gating
- [ ] Show "X more solutions available for subscribers" count
- [ ] Add prominent "Unlock all solutions" CTA
- [ ] Test with different subscription states

#### Comment Section Updates
- [ ] Hide "Add Comment" form for non-subscribers
- [ ] Show "Subscribe to comment" message
- [ ] Hide reply sections for non-subscribers
- [ ] Show "Subscribe to view replies" message
- [ ] Test comment interaction gating

**Deliverable**: Content gating fully functional, clear UX for non-subscribers

---

### Phase 4: Testing & Polish (Week 4)

**Estimated Time**: 8-10 hours

#### End-to-End Testing
- [ ] Test complete subscription flow:
  - [ ] Anonymous user browses (sees top 5 solutions)
  - [ ] User clicks "Subscribe"
  - [ ] Stripe Checkout flow completes
  - [ ] Webhook updates database
  - [ ] User sees all solutions immediately
  - [ ] User can comment and see replies
- [ ] Test subscription management:
  - [ ] View subscription details
  - [ ] Access Customer Portal
  - [ ] Update payment method
  - [ ] Cancel subscription
  - [ ] Verify access revoked after cancellation
- [ ] Test edge cases:
  - [ ] Payment failure during checkout
  - [ ] Expired subscription (past_due)
  - [ ] Canceled but still active (until period end)
  - [ ] Trial period (if implemented)

#### GST/Tax Testing
- [ ] Test with Australian test card (GST should apply)
- [ ] Test with international test card (no GST)
- [ ] Verify tax calculation in Stripe Dashboard
- [ ] Verify ABN validation for B2B (if applicable)

#### Performance & Monitoring
- [ ] Add Sentry error tracking for Stripe operations
- [ ] Add analytics events:
  - [ ] `subscription_started`
  - [ ] `subscription_canceled`
  - [ ] `checkout_abandoned`
  - [ ] `paywall_viewed`
- [ ] Configure Stripe Dashboard alerts:
  - [ ] Failed payments
  - [ ] High churn rate
  - [ ] Revenue milestones
- [ ] Test webhook reliability (retry mechanism)

#### Documentation
- [ ] Update README with subscription feature
- [ ] Document subscription management for support team
- [ ] Create internal runbook for common issues
- [ ] Document testing procedures

**Deliverable**: Production-ready subscription system with monitoring

---

### Phase 5: Production Launch (Week 5)

**Estimated Time**: 4-6 hours

#### Pre-Launch Checklist
- [ ] Switch Stripe from test mode to live mode
- [ ] Update environment variables with live keys
- [ ] Configure live webhook endpoint in Stripe Dashboard
- [ ] Verify webhook signature validation working
- [ ] Enable `NEXT_PUBLIC_REQUIRE_SUBSCRIPTION=true`
- [ ] Final test with real credit card (small amount)
- [ ] Set up Stripe billing alerts

#### Launch
- [ ] Deploy to production
- [ ] Monitor first 10 subscriptions closely
- [ ] Watch for webhook errors
- [ ] Verify GST calculation on real transactions
- [ ] Monitor user feedback on pricing/UX

#### Post-Launch Monitoring (First Week)
- [ ] Daily check: Webhook success rate
- [ ] Daily check: Payment failure rate
- [ ] Daily check: GST calculations
- [ ] Daily check: User feedback/support tickets
- [ ] Weekly review: Subscription metrics (conversions, churn)

**Deliverable**: Live subscription system with active monitoring

---

### Ongoing Maintenance

#### Monthly Tasks
- [ ] Review Stripe Dashboard for anomalies
- [ ] Check failed payment recovery
- [ ] Review churn metrics
- [ ] Analyze conversion funnel
- [ ] GST reporting preparation (quarterly)

#### Quarterly Tasks
- [ ] File BAS (GST returns) with ATO
- [ ] Review pricing strategy
- [ ] Analyze subscriber growth trends
- [ ] Consider promotional campaigns

---

## Australian Compliance

### GST (Goods and Services Tax)

#### Registration Requirements
- **Threshold**: Must register for GST when sales exceed $75,000 AUD in a 12-month period
- **Remote sellers**: If selling to Australian consumers, must register when exceeding threshold
- **Voluntary registration**: Can register before hitting threshold

#### Stripe Tax Configuration
- **Auto-calculation**: Stripe Tax calculates 10% GST for Australian customers
- **Auto-alerts**: Stripe notifies you when approaching $75K threshold
- **ABN validation**: For B2B sales, Stripe validates ABN and applies reverse charge (no GST)
- **Reports**: Stripe provides GST reports for BAS filing

#### Your Responsibilities (Even with Stripe Tax)
1. **Register for GST** when you hit $75K AUD threshold (or voluntarily earlier)
2. **File BAS** (Business Activity Statement) quarterly with ATO
   - Report GST collected
   - Report GST paid on business expenses
   - Submit via ATO online portal
3. **Keep records** (Stripe provides reports)
4. **Include ABN** on invoices (Stripe Checkout can be configured for this)

#### Recommended Setup
```
1. Get ABN (Australian Business Number) - Free from ABR
2. Enable Stripe Tax on day one (even before GST registration)
3. Let Stripe auto-alert you when approaching $75K
4. Register for GST when notified
5. Use Stripe reports for quarterly BAS filing
```

**Estimated time commitment**: 2-4 hours per quarter for BAS filing

---

### Tax Filing Timeline

| Period | Task | Deadline |
|--------|------|----------|
| **Monthly** | Review Stripe revenue reports | End of month |
| **Quarterly** | Download Stripe GST report | Within 1 week after quarter end |
| **Quarterly** | File BAS with ATO | 28th day of month following quarter end |
| **Annually** | Review overall tax strategy | Before EOFY (June 30) |

**Example**: For Q1 2025 (Jan-Mar), BAS due April 28, 2025

---

### Stripe Tax Features for Australia

```typescript
// Stripe Tax automatically handles:

✅ GST calculation (10% for Australian consumers)
✅ ABN validation (B2B reverse charge)
✅ Exemptions (certain goods/services)
✅ Tax-inclusive vs tax-exclusive pricing
✅ Reports for BAS filing
✅ Multi-currency GST calculation
✅ Registration alerts at $75K threshold
```

**Cost**: 0.5% of transaction amount (worth it for automation)

---

### Recommended Accountant/Services

Consider engaging:
- **Accountant**: For GST registration, BAS lodgment, tax advice (~$300-500/quarter)
- **Xero/MYOB**: Accounting software with ATO integration (~$30-70/month)
- **ATO Online**: Free portal for BAS lodgment (if doing yourself)

**DIY Option**: Stripe reports + ATO portal (cheapest, ~4 hours/quarter)

---

## Resources & Links

### Stripe Official Documentation

#### Core Stripe Resources
- [Stripe Australia Homepage](https://stripe.com/au)
- [Stripe Tax Documentation](https://stripe.com/docs/tax)
- [Stripe Billing/Subscriptions Guide](https://stripe.com/docs/billing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

#### Australian Tax Resources
- [Stripe Australia GST Guide](https://support.stripe.com/questions/goods-and-services-tax-(gst)-for-australia-based-businesses)
- [Stripe Tax Collection in Australia](https://docs.stripe.com/tax/supported-countries/asia-pacific/australia)
- [Stripe Tax Pricing](https://stripe.com/au/tax/pricing)

---

### Next.js + Supabase Integration Guides

#### Official Templates (2025)
1. **Vercel's Official Starter** (Most Comprehensive)
   - Repo: [vercel/nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments)
   - Features: Complete Stripe + Supabase integration, webhook handling, customer portal
   - Deploy: One-click Vercel deployment

2. **Next.js 15 + Supabase + Stripe Guide** (Most Recent)
   - Link: [DEV Community Tutorial](https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5)
   - Date: April 2025
   - Features: Step-by-step setup for Next.js 15 App Router

3. **KolbySisk Starter** (High Quality, shadcn/ui)
   - Repo: [next-supabase-stripe-starter](https://github.com/KolbySisk/next-supabase-stripe-starter)
   - Features: Modern UI, TypeScript, shadcn/ui components

4. **Medium Tutorial** (Comprehensive)
   - Link: [Implementing Stripe Subscriptions with Supabase, Next.js, and FastAPI](https://medium.com/@ojasskapre/implementing-stripe-subscriptions-with-supabase-next-js-and-fastapi-666e1aada1b5)
   - Covers: Database schema, auth flow, subscription management

#### Video Tutorials
- [Build a SaaS product with Next.js, Supabase and Stripe](https://egghead.io/courses/build-a-saas-product-with-next-js-supabase-and-stripe-61f2bc20) (egghead.io)

---

### Comparison Articles

#### Platform Comparisons (2025)
- [Stripe vs Paddle: What are the differences?](https://stackshare.io/stackups/paddle-vs-stripe)
- [Stripe vs Paddle: Which Platform Wins in 2025?](https://www.chargeblast.com/blog/stripe-vs-paddle-which-platform-wins/)
- [Paddle vs Stripe vs Lemon Squeezy Comparison](https://saasboilerplates.dev/posts/choosing-payment-providers/)
- [SaaS Payment Provider Fee Calculator](https://saasfeecalc.com/) - Interactive comparison tool

#### Developer Experience
- [Stripe vs Paddle Developer Experience](https://afficone.com/blog/stripe-vs-paddle/)
- [Payment Platforms for Solopreneurs](https://thebootstrappedfounder.com/payment-platforms-for-solopreneurs/)

---

### Australian Business Resources

#### Government Resources
- [Australian Business Register (ABN)](https://www.abr.gov.au/) - Register for ABN (free)
- [ATO GST Information](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst) - Official GST guide
- [ATO Remote Seller Obligations](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst/when-to-register-for-gst)
- [ATO Business Portal](https://www.ato.gov.au/Business/Online-services-for-business/) - For BAS lodgment

#### Accounting Software
- [Xero](https://www.xero.com/au/) - Cloud accounting with ATO integration
- [MYOB](https://www.myob.com/au) - Australian accounting software
- [QuickBooks Australia](https://quickbooks.intuit.com/au/) - Small business accounting

---

### Stripe Testing Resources

#### Test Cards
- **Australian card (GST applies)**: `4000 0036 0000 0006`
- **US card (no GST)**: `4242 4242 4242 4242`
- **Declined card**: `4000 0000 0000 0002`
- Full list: [Stripe Test Cards](https://stripe.com/docs/testing#cards)

#### Development Tools
- [Stripe CLI](https://stripe.com/docs/stripe-cli) - Local webhook testing
- [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard) - Test mode dashboard
- [Stripe API Reference](https://stripe.com/docs/api) - Complete API documentation

#### Testing Commands
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

---

### Community & Support

#### Stripe Community
- [Stripe Discord](https://stripe.com/discord) - Developer community
- [Stack Overflow - Stripe Tag](https://stackoverflow.com/questions/tagged/stripe-payments)

#### Next.js + Stripe
- [Next.js Discord](https://nextjs.org/discord) - #help-general channel
- [Vercel Community](https://github.com/vercel/next.js/discussions)

#### Supabase
- [Supabase Discord](https://discord.supabase.com/) - #help-and-questions
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## Decision Record

### Decision: **Stripe + Stripe Tax**

**Date**: 2025-10-19
**Status**: Approved for implementation (pending Australian business registration)
**Decided by**: Jack Andrews (Product Owner)
**Documented by**: Claude (AI Assistant)

---

### Context

WWFM requires a subscription payment system to:
1. Gate access to full solution lists (beyond top 5)
2. Gate comment reply visibility and participation
3. Accept international payments
4. Comply with Australian GST requirements
5. Integrate with existing Next.js 15 + Supabase architecture

---

### Options Considered

1. **Stripe + Stripe Tax** (Recommended)
2. Paddle (Merchant of Record)
3. Lemon Squeezy (Rejected)

---

### Decision Rationale

#### Why Stripe?

**1. Cost Efficiency**
- 74% cheaper than Paddle at scale
- Savings of $5K-$50K+ per year depending on subscriber count
- 0.5% Stripe Tax fee justifiable for automation value

**2. Technical Alignment**
- Perfect match for WWFM's tech stack (Next.js 15, Supabase, TypeScript)
- Multiple official integration templates available
- Extensive 2025-dated documentation
- Strong webhook infrastructure
- WWFM already has compatible architecture (feature flags, RLS, server actions)

**3. Developer Experience**
- Industry-leading API documentation
- Comprehensive TypeScript support
- Large community and ecosystem
- Proven at massive scale
- Excellent testing tools (test mode, CLI, webhooks)

**4. Compliance Automation**
- Stripe Tax automates GST calculation
- Auto-alerts at $75K AUD threshold
- ABN validation for B2B
- Detailed reports for BAS filing
- Reduces compliance burden to acceptable level (~2-4 hours/quarter)

**5. Flexibility**
- Easy to add advanced features later (metered billing, multiple tiers, trials)
- Extensive integration options
- Customer self-service portal
- Dunning management built-in

---

#### Why NOT Paddle?

**Primary Reason**: **Cost**
- 74% higher fees ($4,920 - $49,200+ extra per year)
- Cost difference far exceeds value of zero tax admin

**Secondary Reasons**:
- Less flexible API
- Smaller ecosystem
- Fewer Next.js 15 integration examples
- More opinionated (less customization)

**When Paddle Makes Sense**:
- Absolutely cannot handle tax compliance (even automated)
- Budget allows 74% higher costs
- No development resources available

---

#### Why NOT Lemon Squeezy?

**Critical Issues**:
- Acquired by Stripe in 2024 (uncertain future)
- Higher fees for non-US businesses (~6.5%+ for Australia)
- Integration challenges post-acquisition
- Reduced feature development
- Being consolidated into Stripe

**Recommendation**: Avoid entirely

---

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Tax compliance burden** | Use Stripe Tax (0.5% fee) for automation; budget 2-4 hours/quarter for BAS filing |
| **Development complexity** | Leverage existing WWFM infrastructure (feature flags, RLS); use official templates |
| **GST registration timing** | Stripe Tax alerts when approaching threshold; plan for registration process |
| **Webhook reliability** | Implement retry logic; use Stripe CLI for testing; monitor with Sentry |
| **Payment failures** | Use Stripe's built-in dunning; send user notifications; provide portal access |

---

### Success Metrics

**Phase 1 (First Month)**
- [ ] Webhook success rate >99%
- [ ] Zero subscription database inconsistencies
- [ ] GST calculation 100% accurate
- [ ] <5% checkout abandonment due to technical issues

**Phase 2 (First Quarter)**
- [ ] Subscription conversion rate >2% of free users
- [ ] Churn rate <5% monthly
- [ ] Payment failure rate <3%
- [ ] Support tickets related to billing <10% of total tickets

**Phase 3 (First Year)**
- [ ] Break even on development costs within 6 months
- [ ] Customer LTV > 12 months subscription value
- [ ] BAS filing completed on-time (100% compliance)
- [ ] Zero tax penalties

---

### Next Steps

1. ✅ Complete payment platform research (DONE)
2. ✅ Document implementation plan (DONE)
3. ⏸️ **BLOCKED**: Australian business registration
4. ⏸️ **BLOCKED**: ABN acquisition
5. ⏸️ **BLOCKED**: Business bank account setup
6. ⏳ **WAITING**: Stripe account creation (after registration)
7. ⏳ **WAITING**: Implementation Phase 1 begins

**Estimated Timeline**:
- Business registration: 2-4 weeks
- Implementation: 4 weeks (as outlined in roadmap)
- **Total time to launch**: 6-8 weeks from business registration completion

---

### Review & Updates

This document should be reviewed and updated:
- Before beginning implementation (verify Stripe features haven't changed)
- After business registration (update with ABN details)
- After Phase 1 completion (document learnings)
- Quarterly (update costs, metrics, risks)

**Last Updated**: 2025-10-19
**Next Review**: Before implementation begins (after business registration)

---

## Appendix: Quick Reference

### Environment Variables Required

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...                          # Live secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...        # Live publishable key
STRIPE_WEBHOOK_SECRET=whsec_...                        # Webhook signing secret

# Feature Flags
NEXT_PUBLIC_REQUIRE_SUBSCRIPTION=true                  # Enable paywall

# Site
NEXT_PUBLIC_SITE_URL=https://wwfm.app                 # Production URL

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...                         # For webhook handler
```

---

### Key Stripe Dashboard URLs

- **Dashboard**: https://dashboard.stripe.com/dashboard
- **Products**: https://dashboard.stripe.com/products
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Customers**: https://dashboard.stripe.com/customers
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Tax Settings**: https://dashboard.stripe.com/settings/tax
- **Billing**: https://dashboard.stripe.com/settings/billing

---

### Useful Stripe CLI Commands

```bash
# Listen for webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test subscription events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# View recent events
stripe events list

# Retrieve specific subscription
stripe subscriptions retrieve sub_xxxxx

# Retrieve customer
stripe customers retrieve cus_xxxxx
```

---

### Database Quick Checks

```sql
-- Check user's subscription status
SELECT * FROM user_subscriptions WHERE user_id = 'xxx';

-- Count active subscriptions
SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active';

-- Find expiring subscriptions (next 7 days)
SELECT * FROM user_subscriptions
WHERE status = 'active'
AND current_period_end < NOW() + INTERVAL '7 days';

-- Check for orphaned subscriptions (user deleted)
SELECT us.* FROM user_subscriptions us
LEFT JOIN auth.users u ON us.user_id = u.id
WHERE u.id IS NULL;
```

---

### Support Runbook (Common Issues)

#### Issue: Subscription shows active but user can't access content

**Check**:
1. Verify subscription in `user_subscriptions` table
2. Check `current_period_end` hasn't passed
3. Verify RLS policies are correctly configured
4. Check feature flag: `NEXT_PUBLIC_REQUIRE_SUBSCRIPTION`

**Fix**:
- Refresh subscription status from Stripe
- Clear user session cache
- Verify webhook processed successfully

---

#### Issue: Webhook failing to update database

**Check**:
1. Webhook signature verification passing?
2. Service role key correct?
3. Webhook event type handled?
4. Supabase table exists and RLS allows service role?

**Debug**:
```bash
# View recent webhook events
stripe events list --limit 10

# Resend webhook
stripe events resend evt_xxxxx
```

---

#### Issue: GST not calculating correctly

**Check**:
1. Stripe Tax enabled in dashboard?
2. Customer address/location correct?
3. Product configured as taxable?
4. Test with Australian test card

**Fix**:
- Verify tax settings in Stripe Dashboard
- Check customer's billing address
- Review tax calculation in Stripe Dashboard

---

## End of Document

**This document is ready for implementation when:**
1. Australian business entity is registered
2. ABN is obtained
3. Business bank account is set up
4. Team is ready to dedicate 4 weeks to implementation

**Total estimated effort**: 40-50 hours over 4 weeks

**Expected outcome**: Production-ready subscription system with automated GST compliance, saving $5K-$50K+ annually vs alternatives.

---

**Document Version**: 1.0
**Created**: 2025-10-19
**Authors**: Jack Andrews (requirements), Claude (research & documentation)
**Status**: Ready for implementation (pending business registration)
