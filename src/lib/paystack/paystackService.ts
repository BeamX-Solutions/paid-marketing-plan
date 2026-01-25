import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CREDITS_PER_PACKAGE = parseInt(process.env.CREDITS_PER_PACKAGE || '100');
const CREDIT_EXPIRY_MONTHS = parseInt(process.env.CREDIT_EXPIRY_MONTHS || '12');

// Pricing in kobo (smallest unit for NGN)
const PACKAGE_PRICE_NGN = parseInt(process.env.PACKAGE_PRICE_NGN || '10000000'); // 100,000 NGN in kobo

type SupportedCurrency = 'NGN';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    customer: {
      id: number;
      email: string;
    };
    metadata?: {
      userId: string;
      creditsGranted: string;
      productType: string;
    };
  };
}

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      console.warn('PAYSTACK_SECRET_KEY not set in environment variables');
    }
  }

  /**
   * Generate unique payment reference
   */
  private generateReference(userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `PAY-${userId.substring(0, 8)}-${timestamp}-${random}`;
  }

  /**
   * Make API request to Paystack
   */
  private async paystackRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Paystack API request failed');
    }

    return response.json();
  }

  /**
   * Get or create Paystack customer for user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.paystackCustomerId) {
      return user.paystackCustomerId;
    }

    // Create new Paystack customer
    try {
      const response = await this.paystackRequest<{
        status: boolean;
        data: { customer_code: string };
      }>('/customer', 'POST', {
        email,
        metadata: { userId },
      });

      const customerCode = response.data.customer_code;

      // Save to database with error handling
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { paystackCustomerId: customerCode },
        });
      } catch (dbError) {
        console.error('Failed to save Paystack customer to database:', dbError);
        // Don't throw - customer is created in Paystack, we can retry saving later
      }

      return customerCode;
    } catch (error) {
      console.error('Error creating Paystack customer:', error);
      // For now, we'll proceed without customer code
      // Paystack will create one automatically during payment
      return '';
    }
  }

  /**
   * Initialize payment transaction
   */
  async initializeTransaction(
    userId: string,
    email: string,
    callbackUrl: string
  ): Promise<{ reference: string; authorizationUrl: string }> {
    const reference = this.generateReference(userId);
    const amount = PACKAGE_PRICE_NGN;
    const currency: SupportedCurrency = 'NGN';

    // Create customer first (optional but recommended)
    const customerCode = await this.getOrCreateCustomer(userId, email);

    const response = await this.paystackRequest<PaystackInitializeResponse>(
      '/transaction/initialize',
      'POST',
      {
        email,
        amount,
        currency,
        reference,
        callback_url: callbackUrl,
        customer: customerCode || undefined,
        metadata: {
          userId,
          creditsGranted: CREDITS_PER_PACKAGE.toString(),
          productType: 'credit_package',
          custom_fields: [
            {
              display_name: 'Credits',
              variable_name: 'credits_granted',
              value: CREDITS_PER_PACKAGE,
            },
          ],
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }
    );

    if (!response.status) {
      throw new Error(response.message || 'Failed to initialize payment');
    }

    return {
      reference: response.data.reference,
      authorizationUrl: response.data.authorization_url,
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
    const response = await this.paystackRequest<PaystackVerifyResponse>(
      `/transaction/verify/${reference}`
    );

    if (!response.status) {
      throw new Error(response.message || 'Failed to verify transaction');
    }

    return response.data;
  }

  /**
   * Handle successful payment (called from webhook or callback)
   */
  async handleSuccessfulPayment(reference: string): Promise<void> {
    // Verify the transaction first
    const transaction = await this.verifyTransaction(reference);

    if (transaction.status !== 'success') {
      throw new Error(`Transaction not successful. Status: ${transaction.status}`);
    }

    const userId = transaction.metadata?.userId;
    const creditsGranted = parseInt(transaction.metadata?.creditsGranted || '100');

    if (!userId) {
      throw new Error('User ID not found in transaction metadata');
    }

    // Check if this payment has already been processed (idempotency)
    const existingPurchase = await prisma.creditPurchase.findFirst({
      where: { paystackReference: reference },
    });

    if (existingPurchase) {
      console.log('Payment already processed:', reference);
      return;
    }

    // Calculate expiration date
    const purchaseDate = new Date();
    const expiresAt = new Date(purchaseDate);
    expiresAt.setMonth(expiresAt.getMonth() + CREDIT_EXPIRY_MONTHS);

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Create credit purchase record
      await tx.creditPurchase.create({
        data: {
          userId,
          creditsGranted,
          creditsRemaining: creditsGranted,
          amountPaid: transaction.amount,
          currency: transaction.currency.toLowerCase(),
          purchaseDate,
          expiresAt,
          paystackReference: reference,
          paystackTransactionId: transaction.id.toString(),
          status: 'active',
        },
      });

      // Update user's Paystack customer ID if not set
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user?.paystackCustomerId && transaction.customer?.id) {
        await tx.user.update({
          where: { id: userId },
          data: { paystackCustomerId: transaction.customer.id.toString() },
        });
      }
    });

    console.log(`Credits granted: ${creditsGranted} to user ${userId} via Paystack`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Get supported currency (NGN only for now)
   */
  getSupportedCurrency(): { code: SupportedCurrency; name: string; symbol: string } {
    return { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' };
  }

  /**
   * Get package price in Naira
   */
  getPackagePrice(): {
    amount: number;
    displayAmount: string;
    currency: string;
  } {
    const amount = PACKAGE_PRICE_NGN;
    const displayAmount = (amount / 100).toLocaleString('en-NG'); // Convert from kobo to Naira

    return {
      amount,
      displayAmount: `₦${displayAmount}`,
      currency: 'NGN',
    };
  }
}

export const paystackService = new PaystackService();
