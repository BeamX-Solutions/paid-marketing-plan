/**
 * GET /api/admin/security/dashboard
 * Returns comprehensive security dashboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculate2FAAdoption, calculateSecurityScore, getLoginStats } from '@/lib/analytics/security-metrics';
import { getRecentEvents, getUnresolvedEvents } from '@/lib/security/event-logger';
import { getActiveSessionsCount } from '@/lib/security/session-manager';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Only allow admin users
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Gather all dashboard data in parallel for performance
    const [
      securityScore,
      twoFactorStats,
      recentEvents,
      unresolvedEvents,
      activeSessionsCount,
      loginStats24h,
    ] = await Promise.all([
      calculateSecurityScore(),
      calculate2FAAdoption(),
      getRecentEvents(10),
      getUnresolvedEvents(),
      getActiveSessionsCount(),
      getLoginStats(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        new Date()
      ),
    ]);

    // Format response
    const dashboardData = {
      securityScore: {
        score: securityScore.score,
        maxScore: securityScore.maxScore,
        grade: securityScore.grade,
        breakdown: securityScore.breakdown,
      },
      twoFactorStats: {
        totalAdmins: twoFactorStats.totalAdmins,
        adminsWithTwoFactor: twoFactorStats.adminsWithTwoFactor,
        adoptionRate: twoFactorStats.adoptionRate,
        trend: twoFactorStats.trend,
        byRole: twoFactorStats.byRole,
      },
      activeSessions: {
        count: activeSessionsCount,
      },
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        severity: event.severity,
        timestamp: event.createdAt,
        description: getEventDescription(event.eventType),
        user: event.user
          ? {
              email: event.user.email,
              role: event.user.role,
            }
          : null,
        resolved: event.resolved,
      })),
      unresolvedAlerts: {
        count: unresolvedEvents.length,
        critical: unresolvedEvents.filter((e) => e.severity === 'critical').length,
        high: unresolvedEvents.filter((e) => e.severity === 'high').length,
      },
      loginStats24h: {
        total: loginStats24h.totalLogins,
        successful: loginStats24h.successfulLogins,
        failed: loginStats24h.failedLogins,
        successRate: loginStats24h.successRate,
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get human-readable event descriptions
 */
function getEventDescription(eventType: string): string {
  const descriptions: Record<string, string> = {
    failed_login: 'Failed login attempt',
    suspicious_activity: 'Suspicious activity detected',
    rate_limit: 'Rate limit triggered',
    '2fa_failed': '2FA verification failed',
    '2fa_enabled': '2FA was enabled',
    '2fa_disabled': '2FA was disabled',
    admin_created: 'New admin account created',
    role_changed: 'User role was modified',
    user_suspended: 'User account suspended',
    user_deleted: 'User account deleted',
    permission_changed: 'User permissions modified',
    login_new_location: 'Login from new location',
    login_new_device: 'Login from new device',
    password_reset: 'Password was reset',
    account_lockout: 'Account locked out',
  };

  return descriptions[eventType] || 'Security event occurred';
}
