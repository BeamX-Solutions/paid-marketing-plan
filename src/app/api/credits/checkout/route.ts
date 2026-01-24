import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paystackService } from '@/lib/paystack/paystackService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const email = session.user.email;

    // Get currency from request body, default to NGN
    const body = await request.json();
    const currency = (body.currency?.toUpperCase() || 'NGN') as 'NGN' | 'USD';

    // Validate currency
    if (currency !== 'NGN' && currency !== 'USD') {
      return NextResponse.json(
        { error: 'Unsupported currency. Only NGN and USD are supported.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${appUrl}/dashboard?payment=success`;

    const transaction = await paystackService.initializeTransaction(
      userId,
      email,
      currency,
      callbackUrl
    );

    return NextResponse.json({
      reference: transaction.reference,
      authorizationUrl: transaction.authorizationUrl,
      currency,
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
