import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover'
});

const prisma = new PrismaClient();

const CREDITS_PER_PACKAGE = parseInt(process.env.CREDITS_PER_PACKAGE || '100');
const PACKAGE_PRICE_CENTS = parseInt(process.env.PACKAGE_PRICE_CENTS || '10000');
const CREDIT_EXPIRY_MONTHS = parseInt(process.env.CREDIT_EXPIRY_MONTHS || '12');

export class StripeService {
  /**
   * Create or retrieve Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId
      }
    });

    // Save to database
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id }
    });

    return customer.id;
  }

  /**
   * Create checkout session for credit purchase
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string }> {
    const customerId = await this.getOrCreateCustomer(userId, email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${CREDITS_PER_PACKAGE} Marketing Plan Credits`,
              description: `Generate ${CREDITS_PER_PACKAGE / 50} marketing plans. Credits expire after ${CREDIT_EXPIRY_MONTHS} months.`
            },
            unit_amount: PACKAGE_PRICE_CENTS
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        creditsGranted: CREDITS_PER_PACKAGE.toString(),
        productType: 'credit_package'
      }
    });

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  /**
   * Handle successful payment (called from webhook)
   */
  async handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const creditsGranted = parseInt(session.metadata?.creditsGranted || '100');

    if (!userId) {
      throw new Error('User ID not found in session metadata');
    }

    // Check if this payment has already been processed (idempotency)
    const existingPurchase = await prisma.creditPurchase.findUnique({
      where: { stripeSessionId: session.id }
    });

    if (existingPurchase) {
      console.log('Payment already processed:', session.id);
      return;
    }

    // Calculate expiration date
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setMonth(expiresAt.getMonth() + CREDIT_EXPIRY_MONTHS);

    // Create credit purchase record
    await prisma.creditPurchase.create({
      data: {
        userId,
        creditsGranted,
        creditsRemaining: creditsGranted,
        amountPaid: session.amount_total || PACKAGE_PRICE_CENTS,
        currency: session.currency || 'usd',
        purchaseDate,
        expiresAt,
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string || undefined,
        status: 'active'
      }
    });

    console.log(`Credits granted: ${creditsGranted} to user ${userId}`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
}

export const stripeService = new StripeService();