import { NextRequest, NextResponse } from 'next/server';
import { paystackService } from '@/lib/paystack/paystackService';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = paystackService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the event
    const event = JSON.parse(payload);
    console.log('Paystack webhook event received:', event.event);

    // Handle the event
    switch (event.event) {
      case 'charge.success': {
        // Payment was successful
        const reference = event.data.reference;
        console.log(`Processing successful payment: ${reference}`);

        try {
          await paystackService.handleSuccessfulPayment(reference);
          console.log(`Payment processed successfully: ${reference}`);
        } catch (error) {
          console.error('Error processing payment:', error);
          // Return 200 to prevent Paystack from retrying
          // but log the error for manual investigation
          return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        break;
      }

      case 'transfer.success':
      case 'transfer.failed':
      case 'transfer.reversed':
        // Handle transfer events if needed in the future
        console.log(`Transfer event: ${event.event}`, event.data);
        break;

      default:
        // Unknown event type
        console.log(`Unhandled Paystack event type: ${event.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable body parsing for this route to get raw body for signature verification
export const runtime = 'nodejs';
