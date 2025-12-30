# Week 3 Implementation Plan: Admin Monitoring & Security Dashboard

**Start Date:** December 27, 2024
**Target Completion:** Week 3 of Security Enhancement
**Dependencies:** Week 1 (Subdomain separation), Week 2 (2FA, Session timeout, Login alerts)

---

## Executive Summary

Week 3 focuses on **visibility and monitoring** for security administrators. This includes building a comprehensive security dashboard, audit log viewer, real-time monitoring, and analytics to help admins understand security posture and respond to threats.

### Goals
1. **Security Visibility** - Provide comprehensive view of security events
2. **Audit Trail** - Complete logging and viewing of all admin actions
3. **Metrics & Analytics** - Track 2FA adoption, login patterns, security trends
4. **Real-time Alerts** - Immediate notification of suspicious activities
5. **Compliance Support** - Meet audit and compliance requirements

---

## Features Overview

### 1. Security Dashboard 📊
**Purpose:** Central hub for security monitoring and metrics

**Components:**
- Security health scorecard
- Recent security events feed
- 2FA adoption statistics
- Active admin sessions
- Failed login attempts chart
- Geographic login map (optional)
- Critical alerts banner

**Page:** `/admin/security-dashboard`

---

### 2. Audit Log Viewer 📋
**Purpose:** Complete searchable history of all admin actions

**Features:**
- Filterable log table (by action, user, date range)
- Search functionality
- Pagination (50 entries per page)
- Export to CSV
- Action details modal
- IP address and location tracking
- User agent information

**Page:** `/admin/audit-logs`

**Log Actions to Track:**
- User management (create, update, delete, suspend)
- Role changes
- 2FA events (enable, disable, verify, fail)
- Permission changes
- Login/logout events
- Admin action failures
- Configuration changes
- Security setting modifications

---

### 3. Analytics & Metrics 📈
**Purpose:** Track security trends and adoption

**Metrics:**
- **2FA Adoption Rate**
  - Percentage of admins with 2FA enabled
  - Trend over time
  - Breakdown by role (ADMIN vs SUPER_ADMIN)

- **Login Analytics**
  - Total logins (last 24h, 7d, 30d)
  - Failed login attempts
  - Login success rate
  - Peak login times
  - Geographic distribution

- **Session Analytics**
  - Active admin sessions count
  - Average session duration
  - Session timeout events

- **Security Score**
  - Composite score based on:
    - 2FA adoption
    - Failed login rate
    - Suspicious activity count
    - Account lockouts

**Page:** `/admin/analytics`

---

### 4. Real-time Security Alerts 🚨
**Purpose:** Immediate notification of security events

**Alert Types:**
- Multiple failed login attempts (>3 in 5 min)
- New admin account created
- Admin role granted to user
- 2FA disabled by user
- Login from new location/device
- Suspicious IP addresses
- Rate limiting triggered

**Delivery Methods:**
- In-app notifications (badge on navbar)
- Email alerts (configurable)
- Slack/Discord webhooks (optional)

---

### 5. Admin Activity Monitoring 👥
**Purpose:** Track current admin activity

**Features:**
- Currently active admins list
- Last activity timestamp
- Active sessions table
- Force logout functionality (SUPER_ADMIN only)
- Session revocation
- Device management (list devices, revoke sessions)

**Page:** `/admin/activity`

---

## Database Schema Changes

### New Models

#### SecurityEvent
```prisma
model SecurityEvent {
  id            String   @id @default(cuid())
  eventType     String   // 'failed_login', 'suspicious_activity', 'rate_limit', etc.
  severity      String   // 'low', 'medium', 'high', 'critical'
  userId        String?
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  ipAddress     String?
  userAgent     String?
  location      String?  // Approximate location from IP
  details       String?  // JSON with event-specific details
  resolved      Boolean  @default(false)
  resolvedBy    String?
  resolvedAt    DateTime?
  createdAt     DateTime @default(now())

  @@index([eventType, createdAt])
  @@index([severity, resolved])
  @@index([userId])
  @@map("security_events")
}
```

#### AdminSession (Enhanced)
```prisma
model AdminSession {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionToken  String   @unique
  ipAddress     String?
  userAgent     String?
  location      String?
  deviceInfo    String?  // JSON with device details
  lastActivity  DateTime @default(now())
  expiresAt     DateTime
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  @@index([userId, isActive])
  @@index([expiresAt])
  @@map("admin_sessions")
}
```

#### SecurityMetric
```prisma
model SecurityMetric {
  id                String   @id @default(cuid())
  metricType        String   // 'login_count', '2fa_adoption', 'failed_logins', etc.
  metricValue       Float
  metricData        String?  // JSON with detailed breakdown
  period            String   // 'hourly', 'daily', 'weekly', 'monthly'
  periodStart       DateTime
  periodEnd         DateTime
  createdAt         DateTime @default(now())

  @@index([metricType, period, periodStart])
  @@map("security_metrics")
}
```

#### Notification
```prisma
model Notification {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  notificationType String // 'security_alert', 'system', 'info'
  title         String
  message       String
  priority      String   @default("medium") // 'low', 'medium', 'high', 'urgent'
  read          Boolean  @default(false)
  actionUrl     String?
  actionLabel   String?
  relatedId     String?  // ID of related event/log
  createdAt     DateTime @default(now())
  readAt        DateTime?

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}
```

---

## Implementation Tasks

### Phase 1: Database & Backend Services (Day 1)

#### Task 1.1: Update Prisma Schema
- [ ] Add SecurityEvent model
- [ ] Add AdminSession model
- [ ] Add SecurityMetric model
- [ ] Add Notification model
- [ ] Add relations to User model
- [ ] Run migration: `npx prisma db push`

#### Task 1.2: Create Security Event Service
**File:** `src/lib/security/event-logger.ts`
- [ ] `logSecurityEvent()` - Log security events
- [ ] `getRecentEvents()` - Get recent security events
- [ ] `getEventsByType()` - Filter events by type
- [ ] `markEventResolved()` - Resolve security event
- [ ] `getUnresolvedEvents()` - Get active alerts

#### Task 1.3: Create Metrics Service
**File:** `src/lib/analytics/security-metrics.ts`
- [ ] `calculate2FAAdoption()` - Calculate 2FA adoption rate
- [ ] `getLoginStats()` - Get login statistics
- [ ] `calculateSecurityScore()` - Calculate composite security score
- [ ] `aggregateMetrics()` - Aggregate metrics for period
- [ ] `getTrendData()` - Get trend data for charts

#### Task 1.4: Create Session Management Service
**File:** `src/lib/security/session-manager.ts`
- [ ] `trackSession()` - Create/update session record
- [ ] `getActiveSessions()` - Get active admin sessions
- [ ] `revokeSession()` - Force logout
- [ ] `cleanupExpiredSessions()` - Remove expired sessions
- [ ] `getSessionsByUser()` - Get user's sessions

#### Task 1.5: Create Notification Service
**File:** `src/lib/notifications/notification-service.ts`
- [ ] `createNotification()` - Create notification
- [ ] `getUnreadNotifications()` - Get unread notifications
- [ ] `markAsRead()` - Mark notification as read
- [ ] `markAllAsRead()` - Mark all as read
- [ ] `deleteNotification()` - Delete notification

---

### Phase 2: API Endpoints (Day 2)

#### Task 2.1: Security Dashboard API
**File:** `src/app/api/admin/security/dashboard/route.ts`
- [ ] GET `/api/admin/security/dashboard` - Get dashboard data
  - Security score
  - Recent events (last 10)
  - 2FA adoption stats
  - Active sessions count
  - Failed login count (24h)

#### Task 2.2: Audit Logs API
**File:** `src/app/api/admin/audit-logs/route.ts`
- [ ] GET `/api/admin/audit-logs` - Get paginated logs with filters
- [ ] GET `/api/admin/audit-logs/export` - Export logs to CSV
- [ ] GET `/api/admin/audit-logs/[id]` - Get single log details

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `action` - Filter by action type
- `userId` - Filter by user
- `startDate` - Filter by date range start
- `endDate` - Filter by date range end
- `search` - Search in details

#### Task 2.3: Analytics API
**File:** `src/app/api/admin/analytics/route.ts`
- [ ] GET `/api/admin/analytics/2fa-adoption` - 2FA adoption metrics
- [ ] GET `/api/admin/analytics/logins` - Login statistics
- [ ] GET `/api/admin/analytics/security-score` - Security score
- [ ] GET `/api/admin/analytics/trends` - Trend data for charts

#### Task 2.4: Security Events API
**File:** `src/app/api/admin/security/events/route.ts`
- [ ] GET `/api/admin/security/events` - Get unresolved events
- [ ] POST `/api/admin/security/events/[id]/resolve` - Mark event as resolved
- [ ] GET `/api/admin/security/events/recent` - Get recent events

#### Task 2.5: Sessions API
**File:** `src/app/api/admin/sessions/route.ts`
- [ ] GET `/api/admin/sessions` - Get active sessions
- [ ] POST `/api/admin/sessions/[id]/revoke` - Revoke session
- [ ] GET `/api/admin/sessions/user/[userId]` - Get user sessions

#### Task 2.6: Notifications API
**File:** `src/app/api/admin/notifications/route.ts`
- [ ] GET `/api/admin/notifications` - Get user's notifications
- [ ] POST `/api/admin/notifications/[id]/read` - Mark as read
- [ ] POST `/api/admin/notifications/read-all` - Mark all as read
- [ ] DELETE `/api/admin/notifications/[id]` - Delete notification

---

### Phase 3: Frontend Components (Day 3)

#### Task 3.1: Security Dashboard Page
**File:** `src/app/admin/security-dashboard/page.tsx`

**Components:**
- [ ] SecurityScoreCard - Shows overall security score with gauge
- [ ] RecentEventsCard - Lists recent security events
- [ ] TwoFactorStatsCard - 2FA adoption statistics with chart
- [ ] ActiveSessionsCard - Count of active admin sessions
- [ ] FailedLoginsCard - Failed login attempts chart
- [ ] QuickActionsCard - Quick links to common actions

**Layout:** 3-column grid with cards

#### Task 3.2: Audit Logs Page
**File:** `src/app/admin/audit-logs/page.tsx`

**Components:**
- [ ] AuditLogTable - Paginated table with logs
- [ ] AuditLogFilters - Filter controls (date, action, user)
- [ ] AuditLogSearch - Search bar
- [ ] ExportButton - Export to CSV
- [ ] LogDetailsModal - Modal with full log details

**Features:**
- Sortable columns
- Expandable rows for details
- Color-coded by action severity
- Icon per action type

#### Task 3.3: Analytics Page
**File:** `src/app/admin/analytics/page.tsx`

**Components:**
- [ ] TwoFactorAdoptionChart - Line chart showing 2FA adoption over time
- [ ] LoginActivityChart - Bar chart showing logins per day
- [ ] SecurityScoreHistory - Line chart showing score trend
- [ ] GeographicDistribution - Map or list of login locations
- [ ] StatsGrid - Grid of key metrics (total logins, avg session, etc.)

**Libraries:**
- Consider: Recharts, Chart.js, or Tremor for charts

#### Task 3.4: Admin Activity Page
**File:** `src/app/admin/activity/page.tsx`

**Components:**
- [ ] ActiveAdminsTable - List of currently active admins
- [ ] SessionDetailsCard - Session details for selected admin
- [ ] RevokeSessionButton - Force logout (SUPER_ADMIN only)
- [ ] ActivityTimeline - Timeline of recent admin actions

#### Task 3.5: Notification System
**File:** `src/components/admin/NotificationBell.tsx`

**Components:**
- [ ] NotificationBell - Icon with badge count
- [ ] NotificationDropdown - Dropdown with recent notifications
- [ ] NotificationItem - Individual notification item
- [ ] ViewAllLink - Link to full notifications page

**Integration:** Add to admin layout navbar

#### Task 3.6: Shared Components
**File:** `src/components/admin/security/`

- [ ] SecurityEventBadge.tsx - Badge showing event severity
- [ ] SecurityScoreGauge.tsx - Circular gauge for security score
- [ ] ActionIcon.tsx - Icon based on action type
- [ ] DateRangePicker.tsx - Date range selector for filters
- [ ] ExportButton.tsx - Reusable export button

---

### Phase 4: Real-time Features (Day 4)

#### Task 4.1: Security Event Triggers
**File:** `src/lib/security/event-triggers.ts`

Create hooks to automatically log events:
- [ ] Hook into login failures (update auth.ts)
- [ ] Hook into 2FA failures
- [ ] Hook into rate limiting
- [ ] Hook into admin action logs
- [ ] Hook into user suspensions

#### Task 4.2: Alert Generation
**File:** `src/lib/security/alert-generator.ts`

- [ ] `checkForSuspiciousActivity()` - Analyze events for patterns
- [ ] `generateAlert()` - Create notification for admins
- [ ] `sendAlertEmail()` - Email critical alerts
- [ ] `evaluateSecurityRules()` - Check against security rules

**Rules:**
- 3+ failed logins from same IP in 5 min → Alert
- New admin created → Alert all SUPER_ADMINs
- 2FA disabled → Alert user + SUPER_ADMINs
- Login from new country → Alert user

#### Task 4.3: Metrics Aggregation (Cron Job)
**File:** `src/lib/cron/metrics-aggregator.ts`

- [ ] `aggregateDailyMetrics()` - Run daily at midnight
- [ ] `aggregateHourlyMetrics()` - Run every hour
- [ ] `cleanupOldEvents()` - Remove events > 90 days
- [ ] `cleanupOldSessions()` - Remove expired sessions

**Implementation:** Use Next.js API routes with cron or external scheduler

---

### Phase 5: Integration & Polish (Day 5)

#### Task 5.1: Update Admin Layout
**File:** `src/app/admin/layout.tsx`

- [ ] Add NotificationBell to navbar
- [ ] Add security status indicator
- [ ] Add quick link to security dashboard
- [ ] Update navigation menu with new pages

#### Task 5.2: Update Existing Features

**Update Login Flow:**
- [ ] Track session in AdminSession table
- [ ] Log security events for failed logins
- [ ] Update last activity timestamp

**Update 2FA Setup:**
- [ ] Log security event when 2FA enabled
- [ ] Create notification for user
- [ ] Update metrics

**Update Admin Actions:**
- [ ] Ensure all admin actions logged
- [ ] Create notifications for critical actions
- [ ] Log security events for sensitive operations

#### Task 5.3: Add Middleware
**File:** `src/middleware.ts` (update)

- [ ] Track session activity on each request
- [ ] Update last activity timestamp
- [ ] Check for suspicious patterns
- [ ] Log geographic anomalies

---

## UI/UX Design

### Dashboard Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ 🔐 Security Dashboard                    [Last updated: now]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Security     │ │ 2FA Adoption │ │ Active       │         │
│ │ Score: 85/100│ │ 80%          │ │ Sessions: 5  │         │
│ │  ┌─────┐     │ │  ████████░░  │ │              │         │
│ │  │ 85  │     │ │              │ │  3 Admins    │         │
│ │  └─────┘     │ │ 4/5 Admins   │ │  2 Super     │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                               │
│ ┌──────────────────────────────┐ ┌─────────────────────┐   │
│ │ Recent Security Events       │ │ Failed Logins (24h) │   │
│ ├──────────────────────────────┤ ├─────────────────────┤   │
│ │ 🟡 Failed login - user@ex... │ │     ┌─┐             │   │
│ │    5 min ago                 │ │   8 │█│             │   │
│ │                              │ │   6 │█│  ┌─┐        │   │
│ │ 🟢 2FA enabled - admin@ex... │ │   4 │█│  │█│ ┌─┐    │   │
│ │    15 min ago                │ │   2 │█│┌─┤█│┌┤█│┌─┐ │   │
│ │                              │ │   0 └─┘└─┘└─┘└─┘└─┘ │   │
│ │ 🔴 Rate limit triggered      │ │     Mon Tue Wed Thu  │   │
│ │    1 hour ago                │ └─────────────────────┘   │
│ └──────────────────────────────┘                           │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                            │ │
│ │ [View Audit Logs] [Manage Sessions] [View Analytics]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Audit Logs Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Audit Logs                                                │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filters:  [Action ▾] [User ▾] [Date Range] [Export CSV]│ │
│ │ Search:   [____________________________________] [🔍]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Time       │ Action       │ User         │ IP Address   │ │
│ ├────────────┼──────────────┼──────────────┼──────────────┤ │
│ │ 2 min ago  │ 🔒 2FA_ENABLE│ admin@ex.com │ 192.168.1.1  │ │
│ │ 15 min ago │ 👤 USER_SUSP │ super@ex.com │ 192.168.1.2  │ │
│ │ 1 hour ago │ ⚠️ LOGIN_FAIL│ user@ex.com  │ 10.0.0.5     │ │
│ │ 2 hours ago│ ✏️ ROLE_CHANG│ super@ex.com │ 192.168.1.2  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Showing 1-50 of 1,247  [< Prev] [Next >]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## API Response Formats

### Dashboard Data
```typescript
{
  "securityScore": {
    "score": 85,
    "maxScore": 100,
    "breakdown": {
      "twoFactorAdoption": 20,  // out of 25
      "failedLoginRate": 18,     // out of 25
      "suspiciousActivity": 22,  // out of 25
      "accountSecurity": 25      // out of 25
    }
  },
  "twoFactorStats": {
    "totalAdmins": 5,
    "with2FA": 4,
    "adoptionRate": 80,
    "trend": "+10%"
  },
  "activeSessions": {
    "count": 5,
    "admins": 3,
    "superAdmins": 2
  },
  "recentEvents": [
    {
      "id": "evt_123",
      "type": "failed_login",
      "severity": "medium",
      "timestamp": "2024-12-27T10:30:00Z",
      "description": "Failed login attempt",
      "user": "user@example.com"
    }
  ],
  "failedLogins24h": {
    "total": 12,
    "byHour": [2, 1, 0, 0, 3, 1, 0, 2, 1, 0, 1, 1]
  }
}
```

### Audit Logs
```typescript
{
  "logs": [
    {
      "id": "log_123",
      "action": "2FA_ENABLED",
      "adminId": "usr_456",
      "adminEmail": "admin@example.com",
      "targetUserId": "usr_456",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "location": "New York, USA",
      "details": "{\"timestamp\":\"2024-12-27T10:30:00Z\"}",
      "createdAt": "2024-12-27T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1247,
    "page": 1,
    "limit": 50,
    "totalPages": 25
  }
}
```

---

## Security Considerations

### Access Control
- All Week 3 features: ADMIN or SUPER_ADMIN only
- Session revocation: SUPER_ADMIN only
- Export audit logs: SUPER_ADMIN only
- Resolve security events: SUPER_ADMIN only

### Data Privacy
- Mask sensitive data in logs (passwords, 2FA secrets)
- Anonymize IP addresses for GDPR compliance (optional)
- Auto-delete logs after retention period
- Encrypt exported CSV files

### Performance
- Index database tables for fast queries
- Cache dashboard data (1 minute TTL)
- Paginate all lists
- Lazy load charts
- Use database aggregations instead of application logic

---

## Testing Strategy

### Unit Tests
- [ ] Security event logger
- [ ] Metrics calculator
- [ ] Session manager
- [ ] Notification service

### Integration Tests
- [ ] Dashboard API returns correct data
- [ ] Audit log filtering works
- [ ] Export generates valid CSV
- [ ] Session revocation works
- [ ] Notifications created for events

### E2E Tests
- [ ] Admin can view dashboard
- [ ] Admin can filter audit logs
- [ ] SUPER_ADMIN can revoke sessions
- [ ] Notifications appear in real-time
- [ ] Charts render correctly

---

## Performance Targets

- Dashboard load time: < 2 seconds
- Audit log query: < 500ms (with indexes)
- Notification delivery: < 1 second
- CSV export: < 5 seconds for 10k rows
- Chart rendering: < 500ms

---

## Rollout Plan

### Day 1: Backend Foundation
- Database schema
- Core services
- Security event logging

### Day 2: API Layer
- All API endpoints
- Authentication/authorization
- Input validation

### Day 3: Frontend UI
- Dashboard page
- Audit logs page
- Analytics page

### Day 4: Real-time Features
- Event triggers
- Alerts
- Notifications

### Day 5: Integration & Testing
- End-to-end testing
- Bug fixes
- Documentation

---

## Success Criteria

✅ **Complete:** When all features are implemented and tested
✅ **Functional:** When admins can monitor security in real-time
✅ **Performant:** When all pages load in < 2 seconds
✅ **Secure:** When all endpoints are properly protected
✅ **Documented:** When all features have user documentation

---

## Future Enhancements (Post-Week 3)

1. **Advanced Analytics**
   - Machine learning for anomaly detection
   - Predictive security scoring
   - Behavioral analysis

2. **Integration**
   - Slack/Discord webhooks
   - PagerDuty integration
   - SIEM export (Splunk, ELK)

3. **Compliance**
   - SOC 2 reporting
   - GDPR compliance tools
   - Audit report generation

4. **Mobile App**
   - React Native app for monitoring
   - Push notifications
   - Quick actions

---

## Next Steps

1. Review and approve this plan
2. Begin Phase 1: Database & Backend Services
3. Set up development environment for charting library
4. Create UI mockups for stakeholder review

**Ready to begin implementation!**
