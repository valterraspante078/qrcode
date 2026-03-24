---
name: microsaas-qrcode
description: Complete MicroSaaS QR Code Generator project specification with tech stack, database schema, payment flow, and implementation roadmap
version: 1.0.0
---

# MicroSaaS QR Code Generator — Complete Project Specification

## Product Vision

An ultra-fast QR Code generator with a frictionless conversion funnel. Users arrive via Google search, generate QR codes instantly without creating an account, and enter a smooth monetization flow. QR codes expire silently after 14 days for non-paying users, converting them when they need reactivation.

## User Flow

### 1. Discovery & Generation
- User searches "gerador de qr code" on Google
- Lands on minimalist landing page with centered input field
- Pastes URL → clicks "Generate" → QR code appears in <1 second with smooth animation

### 2. Account Creation (Optional)
- Modal appears: "Save your QR code for free" with option to create account or close
- **Without account**: QR code works for 14 days, then expires silently (no emails, no notifications)
- **With account**: Redirects to Dashboard with saved QR codes and analytics

### 3. Expiration & Monetization
- After 14 days (no account): QR code stops working
- When scanned, redirects to payment page: "This link is offline. Owner needs to activate it"
- User pays to reactivate: R$197/month, R$100/month (quarterly), or R$50/month (annual)
- Payment via Stripe → QR code activates immediately

## Pricing Structure

| Plan | Price | Billing | Savings |
|------|-------|---------|---------|
| Monthly | R$197/month | Monthly | - |
| Quarterly | R$100/month | R$300 every 3 months | 49% |
| Annual | R$50/month | R$600/year | 74% |

**All plans include:**
- All QR codes active
- Unlimited generation
- Basic analytics
- Device tracking (mobile/desktop)
- Export QR codes (PNG/SVG)

## Tech Stack

### Frontend
- React 19 + Vite 6
- Tailwind CSS v4
- Framer Motion (animations)
- Radix UI + Shadcn/UI (accessible components)
- React Query v5 (caching + fetching)
- Zustand (lightweight global state)

### Backend & API
- Next.js 15 App Router (API Routes)
- TypeScript 5.x (strict mode)
- Zod (schema validation)
- Stripe SDK (payments)
- QRCode.js (server-side generation)

### Infrastructure
- Vercel (deployment + edge functions)
- Supabase (PostgreSQL + Auth + Row Level Security)
- Resend (transactional emails)
- Stripe (payments + webhooks)

### Authentication
- Supabase Auth (magic link + OAuth)
- Supabase SSR helpers
- Row Level Security (RLS) policies

### Monitoring
- Vercel Analytics
- Sentry (error tracking)
- Stripe Dashboard (financial metrics)

## Database Schema (Supabase PostgreSQL)

### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  stripe_customer_id VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'mensal', 'trimestral', 'anual')),
  subscription_status VARCHAR(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired')),
  subscription_expires_at TIMESTAMP
);
```

### Table: qr_codes
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- Nullable for non-registered users
  target_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- created_at + 14 days if no account
  is_active BOOLEAN DEFAULT TRUE,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_is_active ON qr_codes(is_active);
```

### Table: scans (Analytics)
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT NOW(),
  device_type VARCHAR(50), -- 'mobile' or 'desktop'
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100)
);

CREATE INDEX idx_scans_qr_code_id ON scans(qr_code_id);
```

### Table: payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  plan_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Stripe Integration (Recommended)

### Why Stripe?
1. Most robust and well-documented API on the market
2. Native React SDK with excellent support
3. Reliable webhooks for subscription control
4. Native support for recurring payments (subscriptions)
5. Beautiful dashboard for payment management
6. Accepts international cards without issues

### Payment Flow
1. User clicks "Pay"
2. Server creates Stripe Checkout Session
3. Redirects to Stripe payment page
4. Stripe processes payment → sends webhook to server
5. Webhook updates Supabase: activates user's QR codes
6. Redirects to Dashboard with confirmation

### Critical Webhooks
```javascript
// Important Stripe webhook events to handle
const webhookHandlers = {
  'checkout.session.completed': activateAccount,
  'subscription.deleted': deactivateAccount,
  'payment_intent.payment_failed': notifyFailure,
  'customer.subscription.updated': updateSubscription
};
```

## Dashboard Features

### Overview
- Total QR codes created
- Active vs expired QR codes
- Current subscription status
- Next billing date

### Device Analytics
- Mobile vs Desktop proportion per QR code
- User Agent data from scanners
- Approximate geolocation of scans
- Most popular scanning times

### QR Code Manager
- List of all QR codes
- Individual status (active/expired/inactive)
- Scan counter per code
- Edit target URL
- Download QR code (PNG/SVG)
- Delete QR code

### Account & Billing
- Current plan with upgrade option
- Payment history
- Manage subscription (cancel, change plan)
- User profile (edit details)

## Expired QR Code Page

When someone scans an expired QR code, redirect to a specific page:

**Content:**
- Headline: "Este link está fora do ar"
- Brief, clear explanation
- CTA for QR code owner: "Você é o dono? Clique aqui para ativar"
- Link redirects to login/payment page

**Purpose:** Each scan of an expired QR code is a conversion opportunity.

## SEO Strategy

### Landing Page Optimization
Target keywords: "gerador de qr code", "criar qr code online", "qr code gratuito"

**Technical SEO:**
```html
<title>Gerador de QR Code Online Grátis | [Product Name]</title>
<meta name="description" content="Crie QR codes em segundos. Rápido, fácil e gratuito. Salve seus códigos para sempre.">
<h1>Gerador de QR Code Online — Grátis e Rápido</h1>
```

**Performance targets:**
- Load time < 1.5s (Vercel + React Server Components)
- Core Web Vitals: Green scores
- Schema markup (WebApplication type)

**Content strategy:**
- Blog post: "Como usar QR codes para negócios"
- FAQ page for long-tail keywords
- Case studies for conversion

## Implementation Roadmap

### Phase 1 — Foundation (Week 1-2)
- [ ] Setup Next.js + Supabase + Vercel project
- [ ] Configure Supabase Auth
- [ ] Create database migrations
- [ ] Basic QR code generator (without account)
- [ ] Environment variables configuration

### Phase 2 — Core Product (Week 3-4)
- [ ] SEO-optimized landing page
- [ ] Fast generation flow (<1s response time)
- [ ] 14-day expiration system
- [ ] Expired QR code redirect page
- [ ] Basic analytics tracking

### Phase 3 — Monetization (Week 5-6)
- [ ] Complete Stripe integration
- [ ] Webhook handlers + automatic activation
- [ ] Pricing plans implementation (monthly/quarterly/annual)
- [ ] Custom payment page
- [ ] Email notifications (Resend)

### Phase 4 — Dashboard (Week 7-8)
- [ ] Complete dashboard with analytics
- [ ] QR code manager interface
- [ ] Device and geolocation data
- [ ] Subscription management
- [ ] User profile editor

### Phase 5 — Polish & Launch (Week 9-10)
- [ ] End-to-end tests
- [ ] Animations and micro-interactions
- [ ] UI/UX review
- [ ] Performance optimization
- [ ] Final deployment + monitoring setup
- [ ] Launch marketing campaign

## Critical Business Rules

### IMPORTANT: Silent Expiration
- **NO email communication about expiration**
- **NO countdown notifications**
- **NO warnings before the 14-day mark**
- QR codes simply stop working after 14 days
- User only discovers when someone tries to scan

### Payment Activation Flow
- Payment confirmation → immediate activation (via webhook)
- No manual intervention required
- Stripe handles all recurring billing
- Automatic reactivation on successful payment

## File Structure

```
microsaas-qrcode/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── qr-codes/
│   │   └── settings/
│   ├── api/
│   │   ├── generate/
│   │   ├── stripe/
│   │   │   ├── checkout/
│   │   │   └── webhooks/
│   │   └── qr/
│   ├── expired/
│   │   └── [id]/
│   ├── layout.tsx
│   └── page.tsx (landing)
├── components/
│   ├── ui/ (shadcn)
│   ├── QRGenerator.tsx
│   ├── Dashboard/
│   └── Analytics/
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── utils.ts
├── hooks/
│   └── useQRCode.ts
└── types/
    └── database.ts
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Success Metrics

### Launch Goals (3 months)
- 1,000 QR codes generated
- 5% conversion rate (free → paid)
- $5,000 MRR (Monthly Recurring Revenue)

### Growth Metrics
- Organic search traffic (Google)
- QR code scan rate
- Dashboard engagement time
- Churn rate < 5%

---

## Agent Instructions

When implementing this project in Google Antigravity:

1. **Start with database**: Create Supabase project and run all migrations first
2. **Build landing page**: Focus on speed and SEO optimization
3. **Implement QR generation**: Server-side with caching for performance
4. **Add Stripe integration**: Set up webhooks before building payment UI
5. **Create dashboard**: Use React Query for all data fetching
6. **Test expiration flow**: Verify 14-day logic works correctly
7. **Deploy to Vercel**: Use preview deployments for testing

**Testing Checklist:**
- [ ] QR code generates in <1 second
- [ ] Landing page loads in <1.5 seconds
- [ ] Stripe webhook activates QR codes immediately
- [ ] Expired QR codes redirect correctly
- [ ] Dashboard shows accurate analytics
- [ ] Mobile responsive design works perfectly

**Security Considerations:**
- Implement Row Level Security (RLS) on all Supabase tables
- Validate all Stripe webhooks with signature verification
- Rate limit QR code generation endpoint
- Sanitize all user inputs (URLs)
- Use environment variables for all secrets
