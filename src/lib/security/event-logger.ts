/**
 * Security Event Logger
 * Logs and manages security-related events for monitoring and auditing
 */

import prisma from '@/lib/prisma';
import { getLocationFromIp } from '@/lib/email/admin-login-alert';

export type EventType =
  | 'failed_login'
  | 'suspicious_activity'
  | 'rate_limit'
  | '2fa_failed'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'admin_created'
  | 'role_changed'
  | 'user_suspended'
  | 'user_deleted'
  | 'permission_changed'
  | 'login_new_location'
  | 'login_new_device'
  | 'password_reset'
  | 'account_lockout';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LogEventParams {
  eventType: EventType;
  severity: EventSeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(params: LogEventParams): Promise<void> {
  try {
    const { eventType, severity, userId, ipAddress, userAgent, details } = params;

    // Get approximate location from IP if available
    let location: string | undefined;
    if (ipAddress) {
      location = await getLocationFromIp(ipAddress);
    }

    await prisma.securityEvent.create({
      data: {
        eventType,
        severity,
        userId,
        ipAddress,
        userAgent,
        location,
        details: details ? JSON.stringify(details) : null,
      },
    });

    console.log(`[Security Event] ${eventType} (${severity}) - User: ${userId || 'unknown'}`);
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging should not break the application
  }
}

/**
 * Get recent security events
 */
export async function getRecentEvents(limit: number = 10) {
  try {
    const events = await prisma.securityEvent.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    return events.map((event: any) => ({
      ...event,
      details: event.details ? JSON.parse(event.details) : null,
    }));
  } catch (error) {
    console.error('Failed to get recent events:', error);
    return [];
  }
}

/**
 * Get events by type
 */
export async function getEventsByType(
  eventType: EventType,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    const where: any = { eventType };

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const events = await prisma.securityEvent.findMany({
      where,
      take: options?.limit || 100,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    return events.map((event: any) => ({
      ...event,
      details: event.details ? JSON.parse(event.details) : null,
    }));
  } catch (error) {
    console.error('Failed to get events by type:', error);
    return [];
  }
}

/**
 * Get unresolved security events (active alerts)
 */
export async function getUnresolvedEvents() {
  try {
    const events = await prisma.securityEvent.findMany({
      where: {
        resolved: false,
        severity: {
          in: ['high', 'critical'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    return events.map((event: any) => ({
      ...event,
      details: event.details ? JSON.parse(event.details) : null,
    }));
  } catch (error) {
    console.error('Failed to get unresolved events:', error);
    return [];
  }
}

/**
 * Mark a security event as resolved
 */
export async function markEventResolved(
  eventId: string,
  resolvedBy: string
): Promise<boolean> {
  try {
    await prisma.securityEvent.update({
      where: { id: eventId },
      data: {
        resolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      },
    });

    console.log(`[Security Event] Event ${eventId} resolved by ${resolvedBy}`);
    return true;
  } catch (error) {
    console.error('Failed to mark event as resolved:', error);
    return false;
  }
}

/**
 * Get security events count by severity
 */
export async function getEventCountBySeverity(
  startDate?: Date,
  endDate?: Date
): Promise<Record<EventSeverity, number>> {
  try {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const events = await prisma.securityEvent.groupBy({
      by: ['severity'],
      where,
      _count: true,
    });

    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    events.forEach((event: any) => {
      counts[event.severity] = event._count;
    });

    return counts as Record<EventSeverity, number>;
  } catch (error) {
    console.error('Failed to get event count by severity:', error);
    return { low: 0, medium: 0, high: 0, critical: 0 };
  }
}

/**
 * Delete old security events (for cleanup)
 */
export async function deleteOldEvents(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.securityEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        resolved: true, // Only delete resolved events
      },
    });

    console.log(`[Security Event] Deleted ${result.count} old events`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete old events:', error);
    return 0;
  }
}

/**
 * Check for suspicious patterns (helper for alert generation)
 */
export async function checkForSuspiciousPatterns(userId: string): Promise<{
  hasPattern: boolean;
  pattern?: string;
  details?: any;
}> {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Check for multiple failed logins
    const failedLogins = await prisma.securityEvent.count({
      where: {
        userId,
        eventType: 'failed_login',
        createdAt: {
          gte: last24Hours,
        },
      },
    });

    if (failedLogins >= 5) {
      return {
        hasPattern: true,
        pattern: 'multiple_failed_logins',
        details: { count: failedLogins, period: '24h' },
      };
    }

    // Check for logins from multiple locations
    const recentEvents = await prisma.securityEvent.findMany({
      where: {
        userId,
        eventType: {
          in: ['login_new_location', 'login_new_device'],
        },
        createdAt: {
          gte: last24Hours,
        },
      },
      select: {
        location: true,
      },
    });

    const uniqueLocations = new Set(
      recentEvents.map((e: any) => e.location).filter(Boolean)
    );

    if (uniqueLocations.size >= 3) {
      return {
        hasPattern: true,
        pattern: 'multiple_locations',
        details: { locations: Array.from(uniqueLocations), period: '24h' },
      };
    }

    return { hasPattern: false };
  } catch (error) {
    console.error('Failed to check for suspicious patterns:', error);
    return { hasPattern: false };
  }
}
