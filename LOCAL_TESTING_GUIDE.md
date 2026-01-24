# Local Testing Guide (Without ngrok)

## ✅ Quick Answers to Your Questions

### 1. Can I test with Live Keys (`sk_live_`)?

**NO!** Live keys process real money. Here's how to get test keys:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. **Toggle to "Test Mode"** at the top of the page
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)

If you don't see test keys:
- You might need to verify your Paystack account first
- Check under Settings → API Keys & Webhooks
- Look for the "Test Mode" toggle

### 2. Can I test locally without ngrok?

**YES!** The payment flow works perfectly without ngrok using **callback verification** instead of webhooks.

## 🔧 Setup for Local Testing

### Step 1: Add Test Keys to Environment

Create or update `.env.local`:

```env
# Paystack Test Keys (GET THESE FROM PAYSTACK DASHBOARD IN TEST MODE)
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key_here

# Pricing (in smallest units)
PACKAGE_PRICE_NGN=50000  # ₦500 in kobo (500 * 100)
PACKAGE_PRICE_USD=10000  # $100 in cents (100 * 100)

CREDITS_PER_PACKAGE=100
CREDIT_EXPIRY_MONTHS=12
CREDITS_PER_PLAN=50

# Local dev URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Start Development Server

```bash
npm run dev
```

## 🧪 Testing the Payment Flow

### Complete Payment Flow (No Webhook Needed):

1. **Go to Dashboard**
   ```
   http://localhost:3000/dashboard
   ```

2. **Click "Purchase Credits"**
   - Your app initializes payment with Paystack
   - You're redirected to Paystack's payment page

3. **Use Test Card**
   ```
   Card Number: 4084 0840 8408 4081
   Expiry: Any future date (e.g., 12/25)
   CVV: Any 3 digits (e.g., 123)
   PIN: 0000
   ```

4. **Complete Payment**
   - Enter the OTP sent to you (in test mode, any code works)
   - Paystack redirects you back to:
   ```
   http://localhost:3000/dashboard?payment=success&reference=PAY-xxxxx
   ```

5. **Automatic Verification**
   - Your app automatically calls `/api/credits/verify?reference=PAY-xxxxx`
   - Credits are added to your account
   - You'll see updated balance immediately

### Other Test Cards:

| Card Number | Result | Use Case |
|-------------|--------|----------|
| `4084084084084081` | ✅ Success | Normal payment |
| `5060666666666666666` | ❌ Declined | Test declined payment |
| `507850785078507812` | ❌ Insufficient Funds | Test insufficient funds |

All test cards:
- **CVV:** Any 3 digits
- **PIN:** 0000
- **Expiry:** Any future date

## 📊 Verification Methods

Your app uses **TWO** verification methods (both work without ngrok):

### Method 1: Callback Verification (Automatic)
- ✅ Works locally without ngrok
- ✅ Verifies payment when user returns to your site
- ✅ Implemented in dashboard
- User flow: Pay → Redirect back → Verify → Credits added

### Method 2: Webhook (Optional - Requires ngrok)
- ⚠️ Doesn't work on localhost
- ✅ Backup verification if user closes browser
- ❌ Requires public URL (ngrok, production, etc.)

**For local testing, Method 1 is sufficient!**

## 🔍 Monitoring Test Payments

### In Paystack Dashboard:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Make sure you're in **Test Mode**
3. Navigate to **Transactions**
4. You'll see all test payments listed

### In Your App:

Check your database:
```bash
# View credit purchases
npx prisma studio

# Or check in your app
Go to Dashboard → History tab
```

## 🐛 Troubleshooting

### "Live keys detected" error
- Make sure you're using `sk_test_` not `sk_live_`
- Check `.env.local` file
- Restart your dev server after changing env vars

### Payment succeeds but credits not added
1. Check browser console for errors
2. Verify the `/api/credits/verify` endpoint was called
3. Check server logs for verification errors
4. Manually verify: `GET http://localhost:3000/api/credits/verify?reference=YOUR_REFERENCE`

### Paystack returns error
- Verify your test keys are correct
- Make sure you're in Test Mode on Paystack dashboard
- Check that PACKAGE_PRICE_NGN is set in env

### Credits added twice
- The code has idempotency protection
- Same reference can't be processed twice
- This is normal behavior (safe)

## 🌐 When to Use ngrok

You only need ngrok for:
- ✅ Testing webhooks specifically
- ✅ Testing backup payment verification
- ✅ Simulating production-like environment

For basic payment flow testing, **you don't need ngrok!**

### If you want to test webhooks anyway:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add to Paystack Dashboard:
# https://abc123.ngrok.io/api/webhooks/paystack
```

## ✅ Checklist Before Testing

- [ ] Stop any running dev server
- [ ] Run `npx prisma generate` (if you haven't)
- [ ] Update `.env.local` with TEST keys (sk_test_)
- [ ] Set PACKAGE_PRICE_NGN=50000
- [ ] Start dev server: `npm run dev`
- [ ] Create/login to a test user account
- [ ] Go to dashboard and click "Purchase Credits"
- [ ] Use test card: 4084084084084081
- [ ] Complete payment on Paystack
- [ ] Verify you're redirected back with reference
- [ ] Check credits were added

## 💡 Tips

1. **Always use test mode** in development
2. **Test card works indefinitely** - use it as many times as you want
3. **Callback verification is production-ready** - webhooks are just backup
4. **Check Paystack dashboard** to see all test transactions
5. **100 NGN minimum** for live payments (test mode has no minimum)

## 🚀 Going to Production

When ready for production:

1. Switch to Live Mode in Paystack Dashboard
2. Get your Live keys (`sk_live_`, `pk_live_`)
3. Update production environment variables
4. Add webhook URL with live URL
5. Test with small real payment first
6. Monitor transactions closely

---

**Questions?** Check [Paystack Documentation](https://paystack.com/docs) or the main `PAYSTACK_MIGRATION_GUIDE.md`
