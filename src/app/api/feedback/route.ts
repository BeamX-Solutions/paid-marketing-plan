import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import authOptions from '@/lib/auth';

const prisma = new PrismaClient();

// POST - Submit feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const { rating, category, comment, email, planId } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: session?.user?.id || null,
        planId: planId || null,
        rating: parseInt(rating),
        category: category || 'general',
        comment: comment || null,
        email: email || null,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: {
        id: feedback.id,
        rating: feedback.rating,
      },
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Get all feedback (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');

    const where: any = {};
    if (status) where.status = status;
    if (rating) where.rating = parseInt(rating);

    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const stats = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const ratingDistribution = await prisma.feedback.groupBy({
      by: ['rating'],
      _count: {
        rating: true,
      },
    });

    return NextResponse.json({
      feedback,
      stats: {
        averageRating: stats._avg.rating || 0,
        totalFeedback: stats._count.rating || 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Fetch feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
