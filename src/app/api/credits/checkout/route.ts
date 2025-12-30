import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripeService } from '@/lib/stripe/stripeService';

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard?payment=success`;
    const cancelUrl = `${appUrl}/dashboard?payment=cancelled`;

    const checkoutSession = await stripeService.createCheckoutSession(
      userId,
      email,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
