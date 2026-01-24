# Paystack Migration Guide

This guide will help you migrate from Stripe to Paystack for payment processing.

## ✅ What's Been Done

The following files have been created/updated to support Paystack:

### New Files Created:
1. **`src/lib/paystack/paystackService.ts`** - Main Paystack integration service
2. **`src/app/api/webhooks/paystack/route.ts`** - Webhook handler for Paystack events
3. **`src/app/api/credits/verify/route.ts`** - Payment verification endpoint
4. **`.env.paystack.example`** - Example environment variables

### Modified Files:
1. **`prisma/schema.prisma`**
   - Changed `stripeCustomerId` → `paystackCustomerId` in User model
   - Changed `stripeSessionId` → `paystackReference` in CreditPurchase model
   - Changed `stripePaymentId` → `paystackTransactionId` in CreditPurchase model
   - Changed default currency from `usd` to `ngn`

2. **`src/app/api/credits/checkout/route.ts`**
   - Updated to use Paystack instead of Stripe
   - Added currency selection support (NGN/USD)

## 🔧 Setup Instructions

### Step 1: Get Your Paystack API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to Settings > API Keys & Webhooks
3. Copy your **Secret Key** and **Public Key**
   - For testing: use keys starting with `sk_test_` and `pk_test_`
   - For production: use keys starting with `sk_live_` and `pk_live_`

### Step 2: Update Environment Variables

1. Copy `.env.paystack.example` to `.env.local`:
   ```bash
   cp .env.paystack.example .env.local
   ```

2. Update `.env.local` with your Paystack keys:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key

   # Set your pricing (in smallest units)
   PACKAGE_PRICE_NGN=50000  # ₦500 in kobo
   PACKAGE_PRICE_USD=10000  # $100 in cents

   # Other settings
   CREDITS_PER_PACKAGE=100
   CREDIT_EXPIRY_MONTHS=12
   CREDITS_PER_PLAN=50
   ```

### Step 3: Run Database Migration

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name switch_to_paystack

# Or if in production
npx prisma migrate deploy
```

### Step 4: Setup Paystack Webhook

1. Go to Paystack Dashboard > Settings > API Keys & Webhooks
2. Click on "Webhooks" tab
3. Add a new webhook URL:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
4. Select events to listen to:
   - ✅ `charge.success` (required)
   - ✅ `transfer.success` (optional)
   - ✅ `transfer.failed` (optional)

5. For local testing, use [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 3000
   # Use the HTTPS URL: https://xxxx.ngrok.io/api/webhooks/paystack
   ```

### Step 5: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test credit purchase flow:**
   - Navigate to `/dashboard`
   - Click "Purchase Credits"
   - Select currency (NGN or USD)
   - Complete test payment using Paystack test cards:
     - Success: `4084084084084081`
     - Decline: `5060666666666666666`
     - Insufficient Funds: `507850785078507812`

3. **Verify webhook is working:**
   - Check your server logs for "Paystack webhook event received"
   - Credits should be added to user account automatically

## 📝 API Changes

### Frontend Integration

#### Old (Stripe):
```typescript
const response = await fetch('/api/credits/checkout', {
  method: 'POST',
});
const { url } = await response.json();
window.location.href = url;
```

#### New (Paystack):
```typescript
const response = await fetch('/api/credits/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    currency: 'NGN' // or 'USD'
  }),
});
const { authorizationUrl } = await response.json();
window.location.href = authorizationUrl;
```

### Payment Callback Handling

Paystack redirects back to your callback URL with the reference in the URL:
```
https://yourdomain.com/dashboard?payment=success&reference=PAY-xxxxx
```

You can verify the payment on the client side:
```typescript
const urlParams = new URLSearchParams(window.location.search);
const reference = urlParams.get('reference');

if (reference) {
  const response = await fetch(`/api/credits/verify?reference=${reference}`);
  const result = await response.json();

  if (result.success) {
    // Payment verified, credits added
    alert('Payment successful!');
  }
}
```

## 🗑️ Cleanup (Optional)

Once you've confirmed Paystack is working correctly, you can remove Stripe files:

```bash
# Remove Stripe service
rm -rf src/lib/stripe

# Remove Stripe webhook handler
rm -rf src/app/api/webhooks/stripe

# Remove Stripe from package.json
npm uninstall stripe
```

## 💰 Pricing Configuration

### Supported Currencies

1. **NGN (Nigerian Naira)** - Primary currency
   - Set via `PACKAGE_PRICE_NGN` (in kobo)
   - Example: ₦500 = 50000 kobo

2. **USD (US Dollars)** - Secondary currency
   - Set via `PACKAGE_PRICE_USD` (in cents)
   - Example: $100 = 10000 cents
   - **Note**: Requires Paystack USD account approval

### Getting USD Support

If you want to accept USD payments:
1. Log in to Paystack Dashboard
2. Navigate to Settings > Preferences
3. Request USD settlement
4. Wait for approval (usually 2-3 business days)
5. Add your USD secret key to environment variables

## 🔐 Security Considerations

1. **Never commit API keys** - Keep `.env.local` in `.gitignore`
2. **Use test keys in development** - Only use live keys in production
3. **Verify all webhooks** - Signature verification is implemented
4. **Use HTTPS in production** - Required for Paystack webhooks
5. **Validate payment amounts** - Double-check amounts server-side

## 📊 Monitoring

### Paystack Dashboard
- Monitor transactions: Dashboard > Transactions
- View customers: Dashboard > Customers
- Check disputes: Dashboard > Disputes
- Download reports: Dashboard > Reports

### Application Logs
```bash
# Check webhook logs
tail -f logs/paystack-webhooks.log

# Check payment processing
grep "Payment processed" logs/app.log
```

## 🐛 Troubleshooting

### Webhook not receiving events
- Verify webhook URL is accessible from internet
- Check Paystack webhook logs in dashboard
- Ensure signature verification is passing
- Use ngrok for local testing

### Payment not adding credits
- Check webhook signature verification
- Verify `handleSuccessfulPayment` is being called
- Check database for `CreditPurchase` records
- Look for errors in server logs

### Currency issues
- Ensure currency is uppercase ('NGN' not 'ngn')
- Verify pricing is in smallest units (kobo/cents)
- Check that currency is supported in your Paystack account

## 📞 Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Test Cards: https://paystack.com/docs/payments/test-payments

## ✨ Features

### Paystack vs Stripe Comparison

| Feature | Paystack | Stripe |
|---------|----------|--------|
| African Markets | ✅ Excellent | ⚠️ Limited |
| Local Payment Methods | ✅ Yes | ❌ No |
| Lower Transaction Fees | ✅ 1.5% + ₦100 | ❌ 2.9% + $0.30 |
| Multi-currency | ✅ NGN, USD, GHS, ZAR, KES | ✅ 135+ currencies |
| Mobile Money | ✅ Yes | ❌ No |
| Bank Transfer | ✅ Yes | ⚠️ Limited |
| USSD Payments | ✅ Yes | ❌ No |

### Supported Payment Channels

- 💳 **Card Payments** (Visa, Mastercard, Verve)
- 🏦 **Bank Transfer**
- 📱 **USSD** (for Nigerian banks)
- 💰 **Mobile Money**
- 📲 **QR Code**

## 🎉 You're All Set!

Your application now uses Paystack for payment processing. Test thoroughly in development before deploying to production.
