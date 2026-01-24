import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import authOptions from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        plans: {
          include: {
            claudeInteractions: true,
            creditTransactions: true,
          },
        },
        creditPurchases: {
          include: {
            transactions: true,
          },
        },
        securityEvents: true,
        adminSessions: true,
        notifications: true,
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        industry: user.industry,
        country: user.country,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        marketingConsent: user.marketingConsent,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        subscriptionStatus: user.subscriptionStatus,
        profileData: user.profileData,
      },
      plans: user.plans.map(plan => ({
        id: plan.id,
        businessContext: plan.businessContext,
        questionnaireResponses: plan.questionnaireResponses,
        claudeAnalysis: plan.claudeAnalysis,
        generatedContent: plan.generatedContent,
        planMetadata: plan.planMetadata,
        status: plan.status,
        completionPercentage: plan.completionPercentage,
        creditsCharged: plan.creditsCharged,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        completedAt: plan.completedAt,
        interactions: plan.claudeInteractions.length,
        transactions: plan.creditTransactions.length,
      })),
      creditPurchases: user.creditPurchases.map(purchase => ({
        id: purchase.id,
        creditsGranted: purchase.creditsGranted,
        creditsRemaining: purchase.creditsRemaining,
        amountPaid: purchase.amountPaid,
        currency: purchase.currency,
        purchaseDate: purchase.purchaseDate,
        expiresAt: purchase.expiresAt,
        status: purchase.status,
        transactionCount: purchase.transactions.length,
      })),
      securityEvents: user.securityEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        severity: event.severity,
        ipAddress: event.ipAddress,
        location: event.location,
        details: event.details,
        resolved: event.resolved,
        createdAt: event.createdAt,
      })),
      notifications: user.notifications.map(notif => ({
        id: notif.id,
        notificationType: notif.notificationType,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        read: notif.read,
        createdAt: notif.createdAt,
        readAt: notif.readAt,
      })),
      sessions: user.adminSessions.map(sess => ({
        id: sess.id,
        ipAddress: sess.ipAddress,
        location: sess.location,
        lastActivity: sess.lastActivity,
        expiresAt: sess.expiresAt,
        isActive: sess.isActive,
        createdAt: sess.createdAt,
      })),
      oauthAccounts: user.accounts.map(account => ({
        provider: account.provider,
        type: account.type,
      })),
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: userId,
        dataVersion: '1.0',
        totalPlans: user.plans.length,
        totalPurchases: user.creditPurchases.length,
        totalSecurityEvents: user.securityEvents.length,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="marketingplan-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data. Please try again.' },
      { status: 500 }
    );
  }
}
