import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAdminAction, getCurrentAdmin } from '@/lib/admin-logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { businessName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Fetch all users with detailed information
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        industry: true,
        country: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        subscriptionStatus: true,
        marketingConsent: true,
        creditPurchases: {
          where: {
            status: 'active',
            expiresAt: { gte: new Date() },
          },
          select: {
            creditsRemaining: true,
            creditsGranted: true,
            purchaseDate: true,
            expiresAt: true,
          },
        },
        plans: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            completedAt: true,
          },
        },
        _count: {
          select: {
            plans: true,
            creditPurchases: true,
            creditTransactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals and format data for CSV
    const csvData = users.map(user => {
      const creditBalance = user.creditPurchases.reduce((sum, p) => sum + p.creditsRemaining, 0);
      const totalCreditsGranted = user.creditPurchases.reduce((sum, p) => sum + p.creditsGranted, 0);
      const completedPlans = user.plans.filter(p => p.status === 'completed').length;
      const inProgressPlans = user.plans.filter(p => p.status === 'in_progress').length;

      // Determine subscription status based on credit purchases
      let subscriptionStatus = user.subscriptionStatus || 'free';
      if (user._count.creditPurchases > 0) {
        subscriptionStatus = totalCreditsGranted >= 500 ? 'premium' : 'paid';
      }

      return {
        'User ID': user.id,
        'First Name': user.firstName || 'N/A',
        'Last Name': user.lastName || 'N/A',
        'Email': user.email,
        'Business Name': user.businessName || 'N/A',
        'Industry': user.industry || 'N/A',
        'Country': user.country || 'N/A',
        'Role': user.role,
        'Status': user.status,
        'Subscription': subscriptionStatus,
        'Marketing Consent': user.marketingConsent ? 'Yes' : 'No',
        'Credit Balance': creditBalance,
        'Total Credits Granted': totalCreditsGranted,
        'Total Plans': user._count.plans,
        'Completed Plans': completedPlans,
        'In Progress Plans': inProgressPlans,
        'Total Credit Purchases': user._count.creditPurchases,
        'Total Transactions': user._count.creditTransactions,
        'Account Created': new Date(user.createdAt).toLocaleDateString(),
        'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
      };
    });

    // Convert to CSV
    if (csvData.length === 0) {
      return new NextResponse('No users found', { status: 404 });
    }

    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...csvData.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      ),
    ];

    const csv = csvRows.join('\n');
    const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      action: 'EXPORT_USER_DATA',
      details: `Exported ${csvData.length} users to CSV. Filters: ${search ? `search="${search}"` : ''}${status ? ` status="${status}"` : ''}`,
      request,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    );
  }
}
