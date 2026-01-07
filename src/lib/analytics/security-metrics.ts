/**
 * Security Metrics Service
 * Calculates and aggregates security metrics for analytics and dashboard
 */

import prisma from '@/lib/prisma';

export interface TwoFactorAdoptionMetric {
  totalAdmins: number;
  adminsWithTwoFactor: number;
  adoptionRate: number;
  trend: string;
  byRole: {
    ADMIN: { total: number; with2FA: number; rate: number };
    SUPER_ADMIN: { total: number; with2FA: number; rate: number };
  };
}

export interface LoginStatsMetric {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  successRate: number;
  uniqueUsers: number;
  peakHour?: number;
  byDay: Array<{ date: string; count: number }>;
}

export interface SecurityScoreMetric {
  score: number;
  maxScore: number;
  breakdown: {
    twoFactorAdoption: number;
    failedLoginRate: number;
    suspiciousActivity: number;
    accountSecurity: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Calculate 2FA adoption rate
 */
export async function calculate2FAAdoption(): Promise<TwoFactorAdoptionMetric> {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
        status: 'ACTIVE', // Only count active users
      },
      select: {
        role: true,
        twoFactorEnabled: true,
      },
    });

    const totalAdmins = admins.length;
    const adminsWithTwoFactor = admins.filter((admin: any) => admin.twoFactorEnabled).length;
    const adoptionRate = totalAdmins > 0 ? (adminsWithTwoFactor / totalAdmins) * 100 : 0;

    // Calculate by role
    const adminUsers = admins.filter((u: any) => u.role === 'ADMIN');
    const superAdmins = admins.filter((u: any) => u.role === 'SUPER_ADMIN');

    const adminStats = {
      total: adminUsers.length,
      with2FA: adminUsers.filter((u: any) => u.twoFactorEnabled).length,
      rate:
        adminUsers.length > 0
          ? (adminUsers.filter((u: any) => u.twoFactorEnabled).length / adminUsers.length) * 100
          : 0,
    };

    const superAdminStats = {
      total: superAdmins.length,
      with2FA: superAdmins.filter((u: any) => u.twoFactorEnabled).length,
      rate:
        superAdmins.length > 0
          ? (superAdmins.filter((u: any) => u.twoFactorEnabled).length / superAdmins.length) * 100
          : 0,
    };

    // Calculate trend (compare with last week)
    // For now, we'll use a placeholder trend
    const trend = '+0%';

    return {
      totalAdmins,
      adminsWithTwoFactor,
      adoptionRate: Math.round(adoptionRate * 10) / 10,
      trend,
      byRole: {
        ADMIN: adminStats,
        SUPER_ADMIN: superAdminStats,
      },
    };
  } catch (error) {
    console.error('Failed to calculate 2FA adoption:', error);
    return {
      totalAdmins: 0,
      adminsWithTwoFactor: 0,
      adoptionRate: 0,
      trend: '0%',
      byRole: {
        ADMIN: { total: 0, with2FA: 0, rate: 0 },
        SUPER_ADMIN: { total: 0, with2FA: 0, rate: 0 },
      },
    };
  }
}

/**
 * Get login statistics for a period
 */
export async function getLoginStats(
  startDate: Date,
  endDate: Date
): Promise<LoginStatsMetric> {
  try {
    // Get all login events
    const loginEvents = await prisma.adminAction.findMany({
      where: {
        action: {
          in: ['LOGIN', 'LOGIN_SUCCESS', 'LOGIN_FAILED'],
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        action: true,
        adminId: true,
        createdAt: true,
      },
    });

    const totalLogins = loginEvents.length;
    const successfulLogins = loginEvents.filter((e: any) =>
      ['LOGIN', 'LOGIN_SUCCESS'].includes(e.action)
    ).length;
    const failedLogins = loginEvents.filter((e: any) => e.action === 'LOGIN_FAILED').length;
    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0;

    // Unique users who logged in
    const uniqueUsers = new Set(loginEvents.map((e: any) => e.adminId)).size;
    // Group by day
    const byDay: Record<string, number> = {};
    loginEvents.forEach((event: any) => {
      const date = event.createdAt.toISOString().split('T')[0];
      byDay[date] = (byDay[date] || 0) + 1;
    });

    const byDayArray = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalLogins,
      successfulLogins,
      failedLogins,
      successRate: Math.round(successRate * 10) / 10,
      uniqueUsers,
      byDay: byDayArray,
    };
  } catch (error) {
    console.error('Failed to get login stats:', error);
    return {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      successRate: 0,
      uniqueUsers: 0,
      byDay: [],
    };
  }
}

/**
 * Calculate composite security score (0-100)
 */
export async function calculateSecurityScore(): Promise<SecurityScoreMetric> {
  try {
    // Component 1: 2FA Adoption (25 points max)
    const twoFAData = await calculate2FAAdoption();
    const twoFactorScore = Math.min(25, (twoFAData.adoptionRate / 100) * 25);

    // Component 2: Failed Login Rate (25 points max)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const loginStats = await getLoginStats(last30Days, new Date());

    // Lower failed login rate = higher score
    const failedLoginRatePercent =
      loginStats.totalLogins > 0
        ? (loginStats.failedLogins / loginStats.totalLogins) * 100
        : 0;
    const failedLoginScore = Math.max(0, 25 - failedLoginRatePercent);

    // Component 3: Suspicious Activity (25 points max)
    const unresolvedEvents = await prisma.securityEvent.count({
      where: {
        resolved: false,
        severity: {
          in: ['high', 'critical'],
        },
      },
    });

    // Fewer unresolved events = higher score
    const suspiciousActivityScore = Math.max(0, 25 - unresolvedEvents * 5);

    // Component 4: Account Security (25 points max)
    // Check for suspended accounts, password reset frequency, etc.
    const suspendedAccounts = await prisma.user.count({
      where: {
        status: 'SUSPENDED',
      },
    });

    const accountSecurityScore = Math.max(0, 25 - suspendedAccounts * 2);

    // Calculate total score
    const score = Math.round(
      twoFactorScore + failedLoginScore + suspiciousActivityScore + accountSecurityScore
    );

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      score,
      maxScore: 100,
      breakdown: {
        twoFactorAdoption: Math.round(twoFactorScore),
        failedLoginRate: Math.round(failedLoginScore),
        suspiciousActivity: Math.round(suspiciousActivityScore),
        accountSecurity: Math.round(accountSecurityScore),
      },
      grade,
    };
  } catch (error) {
    console.error('Failed to calculate security score:', error);
    return {
      score: 0,
      maxScore: 100,
      breakdown: {
        twoFactorAdoption: 0,
        failedLoginRate: 0,
        suspiciousActivity: 0,
        accountSecurity: 0,
      },
      grade: 'F',
    };
  }
}

/**
 * Save metric to database for historical tracking
 */
export async function saveMetric(
  metricType: string,
  metricValue: number,
  period: 'hourly' | 'daily' | 'weekly' | 'monthly',
  metricData?: Record<string, any>
): Promise<void> {
  try {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (period) {
      case 'hourly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        periodEnd = new Date(periodStart);
        periodEnd.setHours(periodEnd.getHours() + 1);
        break;
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    await prisma.securityMetric.create({
      data: {
        metricType,
        metricValue,
        metricData: metricData ? JSON.stringify(metricData) : null,
        period,
        periodStart,
        periodEnd,
      },
    });

    console.log(`[Metrics] Saved ${metricType} metric for ${period} period`);
  } catch (error) {
    console.error('Failed to save metric:', error);
  }
}

/**
 * Get metric trend data for charts
 */
export async function getTrendData(
  metricType: string,
  period: 'hourly' | 'daily' | 'weekly' | 'monthly',
  limit: number = 30
): Promise<Array<{ date: string; value: number }>> {
  try {
    const metrics = await prisma.securityMetric.findMany({
      where: {
        metricType,
        period,
      },
      orderBy: {
        periodStart: 'desc',
      },
      take: limit,
    });

    return metrics
      .reverse()
      .map((metric: any) => ({
        date: metric.periodStart.toISOString().split('T')[0],
        value: metric.metricValue,
      }));
  } catch (error) {
    console.error('Failed to get trend data:', error);
    return [];
  }
}

/**
 * Aggregate all metrics (run periodically)
 */
export async function aggregateAllMetrics(period: 'hourly' | 'daily'): Promise<void> {
  try {
    console.log(`[Metrics] Starting ${period} aggregation...`);

    // 2FA Adoption
    const twoFAData = await calculate2FAAdoption();
    await saveMetric('2fa_adoption', twoFAData.adoptionRate, period, {
      total: twoFAData.totalAdmins,
      with2FA: twoFAData.adminsWithTwoFactor,
    });

    // Security Score
    const securityScore = await calculateSecurityScore();
    await saveMetric('security_score', securityScore.score, period, {
      grade: securityScore.grade,
      breakdown: securityScore.breakdown,
    });

    // Login Stats
    const now = new Date();
    const startDate =
      period === 'hourly'
        ? new Date(now.getTime() - 60 * 60 * 1000)
        : new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const loginStats = await getLoginStats(startDate, now);
    await saveMetric('login_count', loginStats.totalLogins, period, {
      successful: loginStats.successfulLogins,
      failed: loginStats.failedLogins,
      successRate: loginStats.successRate,
    });

    console.log(`[Metrics] ${period} aggregation complete`);
  } catch (error) {
    console.error('Failed to aggregate metrics:', error);
  }
}
