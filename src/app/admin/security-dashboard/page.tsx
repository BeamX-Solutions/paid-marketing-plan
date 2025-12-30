'use client';

/**
 * Security Dashboard Page
 * Comprehensive security monitoring dashboard for admin users
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardData {
  securityScore: {
    score: number;
    maxScore: number;
    grade: string;
    breakdown: {
      twoFactorAdoption: number;
      failedLoginRate: number;
      suspiciousActivity: number;
      accountSecurity: number;
    };
  };
  twoFactorStats: {
    totalAdmins: number;
    adminsWithTwoFactor: number;
    adoptionRate: number;
    trend: string;
  };
  activeSessions: {
    count: number;
  };
  recentEvents: Array<{
    id: string;
    eventType: string;
    severity: string;
    timestamp: string;
    description: string;
    user: { email: string; role: string } | null;
    resolved: boolean;
  }>;
  unresolvedAlerts: {
    count: number;
    critical: number;
    high: number;
  };
  loginStats24h: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  lastUpdated: string;
}

export default function SecurityDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/security/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor security events and system health
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Alert Banner for Unresolved Issues */}
        {data.unresolvedAlerts.count > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {data.unresolvedAlerts.count} Unresolved Security Alert{data.unresolvedAlerts.count !== 1 ? 's' : ''}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {data.unresolvedAlerts.critical > 0 && (
                      <span className="font-semibold">{data.unresolvedAlerts.critical} Critical</span>
                    )}
                    {data.unresolvedAlerts.critical > 0 && data.unresolvedAlerts.high > 0 && ', '}
                    {data.unresolvedAlerts.high > 0 && (
                      <span className="font-semibold">{data.unresolvedAlerts.high} High</span>
                    )}
                    {' priority alerts require attention'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Security Score Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
              <span className={`text-2xl font-bold ${
                data.securityScore.grade === 'A' ? 'text-green-600' :
                data.securityScore.grade === 'B' ? 'text-blue-600' :
                data.securityScore.grade === 'C' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {data.securityScore.grade}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {data.securityScore.score}
                  </div>
                  <div className="text-sm text-gray-500">out of {data.securityScore.maxScore}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      data.securityScore.score >= 90 ? 'bg-green-500' :
                      data.securityScore.score >= 70 ? 'bg-blue-500' :
                      data.securityScore.score >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${data.securityScore.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">2FA Adoption</span>
                <span className="font-medium">{data.securityScore.breakdown.twoFactorAdoption}/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed Login Rate</span>
                <span className="font-medium">{data.securityScore.breakdown.failedLoginRate}/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Suspicious Activity</span>
                <span className="font-medium">{data.securityScore.breakdown.suspiciousActivity}/25</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Security</span>
                <span className="font-medium">{data.securityScore.breakdown.accountSecurity}/25</span>
              </div>
            </div>
          </div>

          {/* 2FA Adoption Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2FA Adoption</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {data.twoFactorStats.adoptionRate}%
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {data.twoFactorStats.adminsWithTwoFactor} of {data.twoFactorStats.totalAdmins} admins
              </p>
              {data.twoFactorStats.trend && (
                <p className="text-xs text-green-600 mt-2">{data.twoFactorStats.trend} this week</p>
              )}
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${data.twoFactorStats.adoptionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/admin/settings/security"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Enable 2FA →
              </Link>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {data.activeSessions.count}
              </div>
              <p className="text-sm text-gray-500 mt-1">admin sessions</p>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Currently active
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Security Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
                <Link
                  href="/admin/audit-logs"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {data.recentEvents.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent security events
                </div>
              ) : (
                data.recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                          event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          event.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          event.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {event.severity === 'critical' || event.severity === 'high' ? '⚠' : 'ℹ'}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.description}
                        </p>
                        {event.user && (
                          <p className="text-xs text-gray-500 mt-1">
                            {event.user.email} ({event.user.role})
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {event.resolved && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Login Statistics (24h) */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Login Activity (24h)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data.loginStats24h.successful}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {data.loginStats24h.failed}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Failed</div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {data.loginStats24h.successRate}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${data.loginStats24h.successRate}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-500">
                    Total Logins: <span className="font-semibold text-gray-900">{data.loginStats24h.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/audit-logs"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">View Audit Logs</div>
                <div className="text-sm text-gray-500">Complete activity history</div>
              </div>
            </Link>

            <Link
              href="/admin/settings/security"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Security Settings</div>
                <div className="text-sm text-gray-500">Manage 2FA and more</div>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Manage Users</div>
                <div className="text-sm text-gray-500">User administration</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
