# Insufficient Credits Flow - Test Guide

## Overview
This guide shows how to test the insufficient credits flow both manually and automatically.

---

## Quick Summary

**What happens when a user has insufficient credits:**
1. User tries to generate a plan
2. Server checks credit balance BEFORE deducting
3. If insufficient: Returns HTTP 402 with details
4. Frontend shows professional modal with:
   - Exact credit breakdown
   - Pricing information
   - "Purchase Credits" button

**Key Feature:** NO credits are deducted if the user has insufficient credits.

---

## Automatic Test Results

✅ **Authentication:** Properly requires login (HTTP 401)
✅ **Error Response:** Returns correct HTTP 402 with detailed breakdown
✅ **UI Component:** InsufficientCreditsModal verified
✅ **Credit Check:** Performed BEFORE deduction
✅ **Refund Logic:** Automatic refund if generation fails after deduction

---

## Test Scenarios Covered

| Scenario | Required | Available | Shortfall | Result | Action |
|----------|----------|-----------|-----------|--------|--------|
| Zero credits | 50 | 0 | 50 | ❌ Fail | Show modal |
| Partial credits | 50 | 25 | 25 | ❌ Fail | Show modal |
| Almost enough | 50 | 49 | 1 | ❌ Fail | Show modal |
| Exact credits | 50 | 50 | 0 | ✅ Pass | Generate |
| More than enough | 50 | 100 | 0 | ✅ Pass | Generate |

---

## API Response Details

### Insufficient Credits (HTTP 402)

```json
{
  "error": "Insufficient credits",
  "message": "You need 50 credits to generate a plan. You have 25 credits.",
  "creditsRequired": 50,
  "creditsAvailable": 25,
  "purchaseUrl": "/dashboard"
}
```

**HTTP Status:** 402 Payment Required
**Credits per plan:** 50 (configurable via `CREDITS_PER_PLAN` env variable)

---

## UI Modal Display

### Visual Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│              ⚠️  (Orange Icon)              │
│                                             │
│         Insufficient Credits                │
│                                             │
│  You need 50 credits to generate this      │
│  marketing plan, but you only have 25      │
│  credits available.                        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Required:     50 credits            │   │
│  │ Available:    25 credits            │   │
│  │ ─────────────────────────────────── │   │
│  │ Need:         25 more credits  🔴   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 💰 Credit Package                   │   │
│  │                                     │   │
│  │ 100 credits for $100 • Generate 2  │   │
│  │ marketing plans • Valid for 12     │   │
│  │ months                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [ Cancel ]    [ Purchase Credits ]        │
│                                             │
└─────────────────────────────────────────────┘
```

### Color Scheme
- **Warning Icon:** Orange background, orange icon
- **Shortfall Amount:** Orange/Red text
- **Package Info Box:** Blue background
- **Cancel Button:** Outline style
- **Purchase Button:** Primary blue

---

## Manual Testing Steps

### Option 1: Using Browser DevTools

1. **Login** to the application at http://localhost:3002
2. **Create a new plan** by filling out the questionnaire
3. **Open DevTools** (F12) → Network tab
4. **Click "Generate Plan"** button
5. **Observe the response:**
   - If you have insufficient credits: See HTTP 402 response
   - Modal should appear automatically

### Option 2: Database Manipulation

#### Step 1: Check Current Credits

```bash
# Option A: Using Prisma Studio (Visual)
cd backend
npx prisma studio

# Navigate to CreditPurchase table
# Find your user's purchases and check creditsRemaining
```

#### Step 2: Set Credits to Zero (for testing)

Create a test script:

```javascript
// test-set-zero-credits.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setZeroCredits(userEmail) {
  // Set all credit purchases to 0
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  await prisma.creditPurchase.updateMany({
    where: { userId: user.id },
    data: { creditsRemaining: 0 }
  });

  console.log(`Set ${userEmail} to 0 credits`);
}

// Usage: node test-set-zero-credits.js
setZeroCredits('your-email@example.com');
```

#### Step 3: Test the Flow

1. Login with the user account
2. Create/select a plan
3. Click "Generate Plan"
4. **Expected:** Insufficient Credits modal appears

#### Step 4: Restore Credits

```javascript
// test-add-credits.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCredits(userEmail, amount) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

  await prisma.creditPurchase.create({
    data: {
      userId: user.id,
      creditsGranted: amount,
      creditsRemaining: amount,
      amountPaid: 0,
      currency: 'usd',
      status: 'active',
      expiresAt,
      stripeSessionId: `manual_test_${Date.now()}`
    }
  });

  console.log(`Added ${amount} credits to ${userEmail}`);
}

// Usage: node test-add-credits.js
addCredits('your-email@example.com', 100);
```

---

## Complete User Journey

### Scenario: User with 25 credits tries to generate a plan

1. **User Action:** Clicks "Generate Plan" button
   ```
   UI: Loading spinner appears
   ```

2. **API Request:** POST /api/plans/[plan-id]/generate
   ```javascript
   // Request sent to server
   ```

3. **Server Check:** `hasSufficientCredits(userId, 50)`
   ```javascript
   // Returns: false (user has 25, needs 50)
   ```

4. **Server Response:** HTTP 402
   ```json
   {
     "error": "Insufficient credits",
     "message": "You need 50 credits to generate a plan. You have 25 credits.",
     "creditsRequired": 50,
     "creditsAvailable": 25,
     "purchaseUrl": "/dashboard"
   }
   ```

5. **Frontend:** InsufficientCreditsModal opens
   ```
   UI: Modal appears with breakdown
   ```

6. **User Choice:**
   - **Option A:** Click "Cancel" → Modal closes, returns to plan page
   - **Option B:** Click "Purchase Credits" → Redirects to /dashboard

7. **If Purchase Credits clicked:**
   ```
   Navigate to: /dashboard
   User sees: Credit purchase options
   ```

---

## Code Flow

### Server-Side (API Route)

```javascript
// src/app/api/plans/[id]/generate/route.ts

// Line 47-61: Credit check BEFORE deduction
const hasSufficient = await creditService.hasSufficientCredits(
  plan.user.id,
  CREDITS_PER_PLAN
);

if (!hasSufficient) {
  const balance = await creditService.getUserCreditBalance(plan.user.id);
  return NextResponse.json({
    error: 'Insufficient credits',
    message: `You need ${CREDITS_PER_PLAN} credits to generate a plan. You have ${balance.totalCredits} credits.`,
    creditsRequired: CREDITS_PER_PLAN,
    creditsAvailable: balance.totalCredits,
    purchaseUrl: '/dashboard'
  }, { status: 402 });
}

// Line 64-76: Only deduct credits if check passed
await creditService.deductCredits(
  plan.user.id,
  CREDITS_PER_PLAN,
  planId,
  'Marketing plan generation'
);
```

### Client-Side (Frontend)

The frontend component handles the 402 response and displays the modal:

```typescript
// src/components/credits/InsufficientCreditsModal.tsx

<InsufficientCreditsModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  creditsRequired={50}
  creditsAvailable={25}
/>
```

---

## Safety Features

### 1. Pre-Check Before Deduction
✅ Credits are checked BEFORE any deduction
✅ If insufficient, NO credits are removed
✅ User is notified immediately

### 2. Automatic Refund on Failure
✅ If generation fails AFTER deduction, credits are refunded
✅ Refund is logged in database
✅ User is notified of the error

### 3. Transaction Safety
✅ All credit operations use database transactions
✅ Atomic operations prevent partial states
✅ Rollback on any failure

---

## Testing Checklist

- [ ] User with 0 credits sees modal
- [ ] User with partial credits (< 50) sees modal
- [ ] User with exact credits (50) can generate
- [ ] User with excess credits (> 50) can generate
- [ ] Modal shows correct credit amounts
- [ ] Modal shows correct shortfall calculation
- [ ] "Cancel" button closes modal
- [ ] "Purchase Credits" button redirects to /dashboard
- [ ] No credits deducted when insufficient
- [ ] Credits refunded if generation fails
- [ ] HTTP 402 status code returned
- [ ] Error message is user-friendly

---

## Pricing Information

**Displayed in Modal:**
- **Package:** 100 credits for $100
- **Value:** Generate 2 marketing plans
- **Validity:** 12 months from purchase
- **Per-plan cost:** 50 credits

**Cost Analysis:**
- 100 credits = $100
- 50 credits per plan
- Effective cost: $50 per plan
- 2 plans per package

---

## Support & Troubleshooting

### Issue: Modal doesn't appear

**Check:**
1. Is the API returning HTTP 402? (Check Network tab)
2. Is the response structure correct?
3. Are there any console errors?

### Issue: Credits deducted even with insufficient balance

**This should never happen!**

**Investigation:**
1. Check credit balance before attempt
2. Check API response (should be 402, not 200)
3. Check database transaction logs
4. If occurred, check refund logs

### Issue: Wrong credit amounts shown

**Check:**
1. `CREDITS_PER_PLAN` environment variable
2. User's actual credit balance
3. API response data structure

---

## Environment Variables

```bash
# .env.local

# Credits required per plan generation
CREDITS_PER_PLAN=50

# Base URL for redirects
NEXTAUTH_URL=http://localhost:3002
```

---

## Related Files

**API Routes:**
- `src/app/api/plans/[id]/generate/route.ts` - Main generation logic
- `src/app/api/credits/balance/route.ts` - Get user credit balance

**UI Components:**
- `src/components/credits/InsufficientCreditsModal.tsx` - Error modal
- `src/components/credits/CreditBalanceWidget.tsx` - Balance display

**Services:**
- `src/lib/credits/creditService.ts` - Credit management logic

**Database Schema:**
- `backend/prisma/schema.prisma` - Credit purchase model

---

## Conclusion

The insufficient credits flow is designed to:
1. ✅ Prevent frustration (check before deduction)
2. ✅ Provide clarity (exact amounts shown)
3. ✅ Enable conversion (easy purchase path)
4. ✅ Ensure safety (automatic refunds)
5. ✅ Build trust (transparent pricing)

**Result:** Professional, user-friendly credit management that protects users and encourages purchases.
