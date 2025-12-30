/**
 * Admin Session Management Service
 * Tracks and manages admin user sessions for monitoring and security
 */

import prisma from '@/lib/prisma';
import { getLocationFromIp } from '@/lib/email/admin-login-alert';

export interface CreateSessionParams {
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}

export interface SessionInfo {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: any;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Parse user agent to extract device information
 */
function parseDeviceInfo(userAgent?: string): any {
  if (!userAgent) return null;

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    device = userAgent.includes('iPad') ? 'Tablet' : 'Mobile';
  }

  return { browser, os, device };
}

/**
 * Track a new admin session
 */
export async function trackSession(params: CreateSessionParams): Promise<void> {
  try {
    const { userId, sessionToken, ipAddress, userAgent, expiresAt } = params;

    // Get location from IP
    let location: string | undefined;
    if (ipAddress) {
      location = await getLocationFromIp(ipAddress);
    }

    // Parse device info
    const deviceInfo = parseDeviceInfo(userAgent);

    await prisma.adminSession.create({
      data: {
        userId,
        sessionToken,
        ipAddress,
        userAgent,
        location,
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        expiresAt,
        isActive: true,
      },
    });

    console.log(`[Session] New admin session created for user ${userId}`);
  } catch (error) {
    console.error('Failed to track session:', error);
    // Don't throw - session tracking should not break login
  }
}

/**
 * Update session activity timestamp
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await prisma.adminSession.updateMany({
      where: {
        sessionToken,
        isActive: true,
      },
      data: {
        lastActivity: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to update session activity:', error);
  }
}

/**
 * Get all active admin sessions
 */
export async function getActiveSessions(): Promise<SessionInfo[]> {
  try {
    const sessions = await prisma.adminSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      userEmail: session.user.email,
      userRole: session.user.role,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined,
      location: session.location || undefined,
      deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      createdAt: session.createdAt,
    }));
  } catch (error) {
    console.error('Failed to get active sessions:', error);
    return [];
  }
}

/**
 * Get sessions for a specific user
 */
export async function getSessionsByUser(userId: string): Promise<SessionInfo[]> {
  try {
    const sessions = await prisma.adminSession.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      userEmail: session.user.email,
      userRole: session.user.role,
      ipAddress: session.ipAddress || undefined,
      userAgent: session.userAgent || undefined,
      location: session.location || undefined,
      deviceInfo: session.deviceInfo ? JSON.parse(session.deviceInfo) : null,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
      createdAt: session.createdAt,
    }));
  } catch (error) {
    console.error('Failed to get sessions by user:', error);
    return [];
  }
}

/**
 * Revoke a session (force logout)
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.adminSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
      },
    });

    console.log(`[Session] Session ${sessionId} revoked`);
    return true;
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }
}

/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.adminSession.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    console.log(`[Session] Revoked ${result.count} sessions for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Failed to revoke user sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.adminSession.updateMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            lastActivity: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          },
        ],
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    console.log(`[Session] Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return 0;
  }
}

/**
 * Get active sessions count
 */
export async function getActiveSessionsCount(): Promise<number> {
  try {
    const count = await prisma.adminSession.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return count;
  } catch (error) {
    console.error('Failed to get active sessions count:', error);
    return 0;
  }
}
