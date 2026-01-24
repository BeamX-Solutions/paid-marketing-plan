import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paystackService } from '@/lib/paystack/paystackService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify the transaction and process credits
    try {
      await paystackService.handleSuccessfulPayment(reference);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and credits added successfully',
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      {
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
