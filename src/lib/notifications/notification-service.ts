/**
 * Notification Service
 * Creates and manages in-app notifications for admin users
 */

import prisma from '@/lib/prisma';

export type NotificationType = 'security_alert' | 'system' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateNotificationParams {
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
  createdAt: Date;
  readAt?: Date;
}

/**
 * Create a new notification
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  try {
    const {
      userId,
      notificationType,
      title,
      message,
      priority = 'medium',
      actionUrl,
      actionLabel,
      relatedId,
    } = params;

    await prisma.notification.create({
      data: {
        userId,
        notificationType,
        title,
        message,
        priority,
        actionUrl,
        actionLabel,
        relatedId,
      },
    });

    console.log(`[Notification] Created ${notificationType} notification for user ${userId}`);
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notification creation should not break the application
  }
}

/**
 * Create notifications for all admins
 */
export async function createNotificationForAllAdmins(
  params: Omit<CreateNotificationParams, 'userId'>
): Promise<void> {
  try {
    // Get all active admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    // Create notifications for each admin
    await Promise.all(
      admins.map((admin: any) =>
        createNotification({
          ...params,
          userId: admin.id,
        })
      )
    );

    console.log(`[Notification] Created notifications for ${admins.length} admins`);
  } catch (error) {
    console.error('Failed to create notifications for all admins:', error);
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string): Promise<NotificationData[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return notifications.map(formatNotification);
  } catch (error) {
    console.error('Failed to get unread notifications:', error);
    return [];
  }
}

/**
 * Get all notifications for a user (with pagination)
 */
export async function getNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    includeRead?: boolean;
  }
): Promise<{
  notifications: NotificationData[];
  total: number;
  unreadCount: number;
}> {
  try {
    const { limit = 20, offset = 0, includeRead = true } = options || {};

    const where: any = { userId };
    if (!includeRead) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ createdAt: 'desc' }],
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications: notifications.map(formatNotification),
      total,
      unreadCount,
    };
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
    };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    console.log(`[Notification] Marked ${result.count} notifications as read for user ${userId}`);
    return result.count;
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}

/**
 * Delete old read notifications (cleanup)
 */
export async function deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        read: true,
        readAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[Notification] Deleted ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    console.error('Failed to delete old notifications:', error);
    return 0;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}

/**
 * Helper function to format notification data
 */
function formatNotification(notification: any): NotificationData {
  return {
    id: notification.id,
    userId: notification.userId,
    notificationType: notification.notificationType,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    read: notification.read,
    actionUrl: notification.actionUrl || undefined,
    actionLabel: notification.actionLabel || undefined,
    relatedId: notification.relatedId || undefined,
    createdAt: notification.createdAt,
    readAt: notification.readAt || undefined,
  };
}

/**
 * Create security alert notifications
 */
export async function createSecurityAlert(params: {
  eventType: string;
  severity: string;
  userId?: string;
  details?: string;
}): Promise<void> {
  const { eventType, severity, userId, details } = params;

  // Determine notification priority based on severity
  const priorityMap: Record<string, NotificationPriority> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'urgent',
  };

  const priority = priorityMap[severity] || 'medium';

  // Create notification message
  const messages: Record<string, string> = {
    failed_login: 'Multiple failed login attempts detected',
    suspicious_activity: 'Suspicious activity detected on your account',
    rate_limit: 'Account rate limited due to multiple failed attempts',
    '2fa_disabled': 'Two-factor authentication was disabled',
    admin_created: 'New admin account created',
    role_changed: 'User role was modified',
  };

  const title = `Security Alert: ${eventType.replace(/_/g, ' ').toUpperCase()}`;
  const message = messages[eventType] || details || 'Security event detected';

  // If userId provided, notify specific user; otherwise notify all admins
  if (userId) {
    await createNotification({
      userId,
      notificationType: 'security_alert',
      title,
      message,
      priority,
      actionUrl: '/admin/security-dashboard',
      actionLabel: 'View Details',
    });
  } else {
    // Critical events notify all admins
    if (priority === 'urgent' || priority === 'high') {
      await createNotificationForAllAdmins({
        notificationType: 'security_alert',
        title,
        message,
        priority,
        actionUrl: '/admin/security-dashboard',
        actionLabel: 'View Details',
      });
    }
  }
}
