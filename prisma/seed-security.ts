/**
 * Security Features Seed Script
 *
 * Creates test data for:
 * - Security events (various types and severities)
 * - Admin sessions
 * - Security metrics
 * - Notifications
 * - Admin actions (audit logs)
 *
 * Run with: npx ts-node prisma/seed-security.ts
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding security data...\n');

  // Get or create admin users
  const adminEmail = 'admin@example.com';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log('Creating admin user...');
    const hashedPassword = await hash('Admin123!', 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        businessName: 'System Administrator',
        industry: 'Technology',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        twoFactorEnabled: true,
      },
    });
    console.log('✓ Admin user created');
  }

  // Create test regular user
  const userEmail = 'user@example.com';
  let regularUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!regularUser) {
    console.log('Creating regular user...');
    const hashedPassword = await hash('User123!', 10);
    regularUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        businessName: 'Test User',
        industry: 'Marketing',
        role: 'USER',
        status: 'ACTIVE',
      },
    });
    console.log('✓ Regular user created');
  }

  // Clear existing test data
  console.log('\nClearing existing security data...');
  await prisma.securityEvent.deleteMany({});
  await prisma.adminSession.deleteMany({});
  await prisma.securityMetric.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.adminAction.deleteMany({});
  console.log('✓ Existing data cleared\n');

  // Create Security Events
  console.log('Creating security events...');
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const securityEvents = [
    // Successful logins
    {
      eventType: 'admin_login',
      severity: 'low',
      userId: admin.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'New York, United States',
      details: JSON.stringify({ loginMethod: 'credentials', twoFactorUsed: true }),
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      eventType: 'admin_login',
      severity: 'low',
      userId: admin.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      location: 'San Francisco, United States',
      details: JSON.stringify({ loginMethod: 'google' }),
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    // Failed login attempts
    {
      eventType: 'failed_login',
      severity: 'medium',
      userId: admin.id,
      ipAddress: '203.0.113.45',
      userAgent: 'curl/7.68.0',
      location: 'Unknown Location',
      details: JSON.stringify({ reason: 'invalid_password', attempts: 3 }),
      createdAt: new Date(dayAgo.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      eventType: 'failed_login',
      severity: 'high',
      userId: undefined,
      ipAddress: '198.51.100.23',
      userAgent: 'Python-requests/2.28.1',
      location: 'Lagos, Nigeria',
      details: JSON.stringify({ reason: 'user_not_found', email: 'hacker@example.com' }),
      createdAt: new Date(dayAgo.getTime() + 5 * 60 * 60 * 1000),
    },
    // Suspicious activity
    {
      eventType: 'suspicious_activity',
      severity: 'critical',
      userId: admin.id,
      ipAddress: '198.51.100.99',
      userAgent: 'Mozilla/5.0',
      location: 'Moscow, Russia',
      details: JSON.stringify({
        reason: 'login_from_new_location',
        previousLocation: 'New York, United States',
      }),
      createdAt: new Date(weekAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
      resolved: false,
    },
    {
      eventType: 'suspicious_activity',
      severity: 'high',
      userId: admin.id,
      ipAddress: '203.0.113.11',
      userAgent: 'Mozilla/5.0',
      location: 'Beijing, China',
      details: JSON.stringify({ reason: 'multiple_failed_logins', count: 5 }),
      createdAt: new Date(weekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      resolved: true,
      resolvedBy: admin.id,
      resolvedAt: new Date(weekAgo.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
    // 2FA events
    {
      eventType: '2fa_enabled',
      severity: 'low',
      userId: admin.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      location: 'New York, United States',
      details: JSON.stringify({ method: 'totp' }),
      createdAt: new Date(weekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      eventType: '2fa_failed',
      severity: 'medium',
      userId: admin.id,
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0',
      location: 'New York, United States',
      details: JSON.stringify({ reason: 'invalid_code' }),
      createdAt: new Date(weekAgo.getTime() + 4 * 24 * 60 * 60 * 1000),
    },
    // Rate limiting
    {
      eventType: 'rate_limit',
      severity: 'medium',
      userId: undefined,
      ipAddress: '203.0.113.77',
      userAgent: 'PostmanRuntime/7.29.2',
      location: 'Unknown Location',
      details: JSON.stringify({ endpoint: '/api/auth/login', attempts: 10 }),
      createdAt: new Date(weekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const event of securityEvents) {
    await prisma.securityEvent.create({ data: event });
  }
  console.log(`✓ Created ${securityEvents.length} security events`);

  // Create Admin Sessions
  console.log('Creating admin sessions...');
  const sessions = [
    {
      userId: admin.id,
      sessionToken: `session-${Date.now()}-1`,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      location: 'New York, United States',
      deviceInfo: JSON.stringify({
        browser: 'Chrome',
        os: 'Windows 10',
        device: 'Desktop',
      }),
      lastActivity: now,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes
      isActive: true,
    },
    {
      userId: admin.id,
      sessionToken: `session-${Date.now()}-2`,
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
      location: 'New York, United States',
      deviceInfo: JSON.stringify({
        browser: 'Safari',
        os: 'iOS 17.0',
        device: 'iPhone',
      }),
      lastActivity: new Date(now.getTime() - 10 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 20 * 60 * 1000),
      isActive: true,
    },
    {
      userId: admin.id,
      sessionToken: `session-${Date.now()}-3`,
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      location: 'San Francisco, United States',
      deviceInfo: JSON.stringify({
        browser: 'Firefox',
        os: 'macOS',
        device: 'MacBook Pro',
      }),
      lastActivity: new Date(dayAgo),
      expiresAt: new Date(dayAgo.getTime() + 30 * 60 * 1000),
      isActive: false,
    },
  ];

  for (const session of sessions) {
    await prisma.adminSession.create({ data: session });
  }
  console.log(`✓ Created ${sessions.length} admin sessions`);

  // Create Admin Actions (Audit Logs)
  console.log('Creating admin actions...');
  const actions = [
    {
      action: 'USER_CREATED',
      adminId: admin.id,
      targetUserId: regularUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        email: regularUser.email,
        role: 'USER',
        createdVia: 'admin_panel',
      }),
      createdAt: new Date(weekAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'USER_UPDATED',
      adminId: admin.id,
      targetUserId: regularUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        changes: { businessName: 'Test User Updated' },
      }),
      createdAt: new Date(weekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'USER_SUSPENDED',
      adminId: admin.id,
      targetUserId: regularUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        reason: 'Policy violation',
        duration: 'permanent',
      }),
      createdAt: new Date(weekAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'USER_UNSUSPENDED',
      adminId: admin.id,
      targetUserId: regularUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        reason: 'Appeal approved',
      }),
      createdAt: new Date(weekAgo.getTime() + 4 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'ROLE_CHANGED',
      adminId: admin.id,
      targetUserId: regularUser.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        previousRole: 'USER',
        newRole: 'USER',
      }),
      createdAt: new Date(weekAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      action: '2FA_ENABLED',
      adminId: admin.id,
      targetUserId: admin.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: JSON.stringify({
        method: 'totp',
        selfService: true,
      }),
      createdAt: new Date(weekAgo.getTime() + 6 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const action of actions) {
    await prisma.adminAction.create({ data: action });
  }
  console.log(`✓ Created ${actions.length} admin actions`);

  // Create Notifications
  console.log('Creating notifications...');
  const notifications = [
    {
      userId: admin.id,
      notificationType: 'security_alert',
      title: 'Suspicious Login Attempt Detected',
      message: 'A login attempt from an unusual location (Moscow, Russia) was detected on your account.',
      priority: 'urgent',
      read: false,
      actionUrl: '/admin/security-dashboard',
      actionLabel: 'View Details',
      relatedId: '1',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      userId: admin.id,
      notificationType: 'security_alert',
      title: 'Multiple Failed Login Attempts',
      message: '5 failed login attempts were detected from IP 203.0.113.45 in the last hour.',
      priority: 'high',
      read: false,
      actionUrl: '/admin/audit-logs',
      actionLabel: 'View Logs',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      userId: admin.id,
      notificationType: 'system',
      title: 'Security Score Updated',
      message: 'Your security score has improved to 85/100 (Grade B).',
      priority: 'medium',
      read: false,
      actionUrl: '/admin/security-dashboard',
      actionLabel: 'View Score',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
    {
      userId: admin.id,
      notificationType: 'info',
      title: 'New User Registration',
      message: 'A new user (user@example.com) has registered and is pending approval.',
      priority: 'low',
      read: true,
      readAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      actionUrl: '/admin/users',
      actionLabel: 'View User',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
    {
      userId: admin.id,
      notificationType: 'system',
      title: 'Database Backup Completed',
      message: 'Automated database backup completed successfully.',
      priority: 'low',
      read: true,
      readAt: new Date(dayAgo),
      createdAt: dayAgo,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }
  console.log(`✓ Created ${notifications.length} notifications`);

  // Create Security Metrics
  console.log('Creating security metrics...');
  const metrics = [
    {
      metricType: '2fa_adoption',
      metricValue: 50.0,
      metricData: JSON.stringify({
        totalAdmins: 2,
        adminsWithTwoFactor: 1,
        byRole: { SUPER_ADMIN: 1, ADMIN: 0 },
      }),
      period: 'daily',
      periodStart: new Date(dayAgo.setHours(0, 0, 0, 0)),
      periodEnd: new Date(dayAgo.setHours(23, 59, 59, 999)),
    },
    {
      metricType: 'login_count',
      metricValue: 15,
      metricData: JSON.stringify({
        successful: 12,
        failed: 3,
        byHour: { '08': 2, '12': 5, '15': 3, '18': 5 },
      }),
      period: 'daily',
      periodStart: new Date(dayAgo.setHours(0, 0, 0, 0)),
      periodEnd: new Date(dayAgo.setHours(23, 59, 59, 999)),
    },
    {
      metricType: 'security_score',
      metricValue: 85,
      metricData: JSON.stringify({
        grade: 'B',
        breakdown: {
          twoFactorAdoption: 12.5,
          failedLoginRate: 25,
          suspiciousActivity: 22.5,
          accountSecurity: 25,
        },
      }),
      period: 'daily',
      periodStart: new Date(dayAgo.setHours(0, 0, 0, 0)),
      periodEnd: new Date(dayAgo.setHours(23, 59, 59, 999)),
    },
  ];

  for (const metric of metrics) {
    await prisma.securityMetric.create({ data: metric });
  }
  console.log(`✓ Created ${metrics.length} security metrics`);

  console.log('\n✅ Security data seeding complete!');
  console.log('\nTest accounts:');
  console.log(`Admin: ${adminEmail} / Admin123!`);
  console.log(`User: ${userEmail} / User123!`);
  console.log('\nYou can now test the security dashboard, audit logs, and notifications.');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
