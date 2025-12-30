import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { creditService } from '@/lib/credits/creditService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const balance = await creditService.getUserCreditBalance(session.user.id as string);

    return NextResponse.json(balance);

  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch credit balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
