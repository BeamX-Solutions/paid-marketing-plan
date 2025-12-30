import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email/emailService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessName } = body;

    // Send welcome email
    const success = await emailService.sendWelcomeEmail(
      session.user.email,
      businessName
    );

    if (success) {
      // Update user with business name if provided
      if (businessName) {
        try {
          await prisma.user.update({
            where: { email: session.user.email },
            data: { businessName }
          });
        } catch (updateError) {
          console.error('Failed to update user business name:', updateError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send welcome email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send welcome email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}