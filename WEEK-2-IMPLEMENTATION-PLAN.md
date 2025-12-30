# Week 2 Implementation Plan: Authentication Enhancements

**Project:** Marketing Plan Generator - Admin Security Enhancement
**Week:** 2 of 3
**Status:** 🚧 **IN PROGRESS**
**Started:** December 27, 2025

---

## Overview

Week 2 focuses on enhancing admin user authentication and session management to add multiple layers of security beyond just passwords.

**Goals:**
1. Implement Two-Factor Authentication (2FA) for admin users
2. Add admin-specific session timeout (30 minutes)
3. Send email alerts on admin login

**Security Impact:**
- 🔐 **2FA**: Prevents account takeover even with compromised passwords
- ⏱️ **Session timeout**: Reduces window of opportunity for session hijacking
- 📧 **Login alerts**: Enables quick detection of unauthorized access

---

## Feature 1: Two-Factor Authentication (2FA)

### Architecture

**TOTP-based 2FA** (Time-based One-Time Password)
- Compatible with Google Authenticator, Authy, Microsoft Authenticator
- No SMS required (more secure, no carrier dependency)
- 6-digit codes that expire every 30 seconds

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    2FA Setup Flow                            │
└─────────────────────────────────────────────────────────────┘

Admin User Login (First Time)
    │
    ├─> Enter email + password
    │
    ├─> Check if 2FA enabled
    │   └─> No: Redirect to 2FA Setup
    │
┌───▼────────────────────────────────────┐
│         2FA Setup Page                  │
├─────────────────────────────────────────┤
│  1. Generate secret (server)            │
│  2. Display QR code + manual key        │
│  3. User scans with authenticator app   │
│  4. User enters first 6-digit code      │
│  5. Verify code                         │
│  6. Generate 10 backup codes            │
│  7. User downloads backup codes         │
│  8. Mark 2FA as enabled                 │
└─────────────────────────────────────────┘
    │
    └─> 2FA Enabled ✅ → Redirect to admin dashboard


┌─────────────────────────────────────────────────────────────┐
│              2FA Login Flow (After Setup)                    │
└─────────────────────────────────────────────────────────────┘

Admin User Login (Subsequent)
    │
    ├─> Enter email + password
    │
    ├─> Password correct?
    │   ├─> No: Show error
    │   └─> Yes: Check if 2FA enabled
    │
    ├─> 2FA enabled?
    │   └─> Yes: Show 2FA verification page
    │
┌───▼────────────────────────────────────┐
│      2FA Verification Page              │
├─────────────────────────────────────────┤
│  1. Enter 6-digit code from app         │
│  2. Or enter backup code (one-time)     │
│  3. Verify code on server               │
│     ├─> Valid: Mark session as 2FA      │
│     │   verified, redirect to dashboard │
│     └─> Invalid: Show error, 3 retries  │
└─────────────────────────────────────────┘
    │
    └─> Session verified ✅ → Access granted
```

### Database Schema Changes

**Add to User model:**

```prisma
model User {
  // ... existing fields ...

  // 2FA fields
  twoFactorEnabled    Boolean   @default(false)
  twoFactorSecret     String?   // Encrypted TOTP secret
  twoFactorBackupCodes String?  // JSON array of hashed backup codes
  twoFactorSetupAt    DateTime?

  // Session tracking
  lastLoginAt         DateTime?
  lastLoginIp         String?
  lastLoginUserAgent  String?
}
```

**Migration command:**
```bash
npx prisma migrate dev --name add-2fa-fields
```

### NPM Packages Required

```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

**Package purposes:**
- `speakeasy` - Generate TOTP secrets and verify codes
- `qrcode` - Generate QR codes for authenticator apps

### API Endpoints to Create

#### 1. POST `/api/auth/2fa/setup`
**Purpose:** Generate 2FA secret and QR code

**Request:**
```typescript
{} // No body needed, uses session
```

**Response:**
```typescript
{
  secret: string;          // For manual entry
  qrCodeDataUrl: string;   // Base64 QR code image
  setupUri: string;        // otpauth:// URI
}
```

**Logic:**
1. Check if user is authenticated
2. Check if 2FA already enabled (prevent re-setup)
3. Generate TOTP secret using speakeasy
4. Create QR code with app name and user email
5. Store secret temporarily (not saved until verified)
6. Return QR code and secret

---

#### 2. POST `/api/auth/2fa/verify-setup`
**Purpose:** Verify first 2FA code and enable 2FA

**Request:**
```typescript
{
  secret: string;    // Temporary secret from setup
  token: string;     // 6-digit code from authenticator app
}
```

**Response:**
```typescript
{
  success: boolean;
  backupCodes: string[];  // 10 backup codes (shown once)
}
```

**Logic:**
1. Verify the 6-digit token against the secret
2. If valid:
   - Generate 10 backup codes
   - Hash backup codes before storing
   - Save encrypted secret to database
   - Set twoFactorEnabled = true
   - Return backup codes to user (shown once)
3. If invalid:
   - Return error, allow retry

---

#### 3. POST `/api/auth/2fa/verify`
**Purpose:** Verify 2FA code during login

**Request:**
```typescript
{
  token: string;      // 6-digit code or backup code
  useBackupCode: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Logic:**
1. Get user from session
2. If regular token:
   - Verify against user's 2FA secret
   - Allow 30-second time window
3. If backup code:
   - Hash provided code
   - Check against stored backup codes
   - If match, mark that backup code as used
   - If all backup codes used, warn user to regenerate
4. If verified, mark session as 2FA complete
5. Return success/failure

---

#### 4. POST `/api/auth/2fa/disable`
**Purpose:** Disable 2FA for account

**Request:**
```typescript
{
  password: string;    // Require password to disable
  token: string;       // Require current 2FA code
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Logic:**
1. Verify password
2. Verify 2FA token
3. If both valid:
   - Set twoFactorEnabled = false
   - Clear twoFactorSecret
   - Clear backup codes
   - Log this action
4. Send email notification

---

#### 5. POST `/api/auth/2fa/regenerate-backup-codes`
**Purpose:** Generate new backup codes

**Request:**
```typescript
{
  password: string;    // Require password
  token: string;       // Require current 2FA code
}
```

**Response:**
```typescript
{
  backupCodes: string[];  // 10 new backup codes
}
```

**Logic:**
1. Verify password and 2FA token
2. Generate 10 new backup codes
3. Hash and store
4. Return new codes (shown once)

---

### UI Components to Create

#### 1. `/admin/settings/security` - Security Settings Page

**Features:**
- Enable/disable 2FA toggle
- View 2FA status (enabled/disabled)
- QR code display during setup
- Backup codes download
- Session timeout settings
- Login history

---

#### 2. `/admin/2fa/setup` - 2FA Setup Page

**Layout:**
```
┌──────────────────────────────────────────┐
│  Set Up Two-Factor Authentication        │
├──────────────────────────────────────────┤
│                                          │
│  Step 1: Install an Authenticator App   │
│  • Google Authenticator                 │
│  • Authy                                 │
│  • Microsoft Authenticator              │
│                                          │
│  Step 2: Scan QR Code                   │
│  ┌────────────┐                          │
│  │            │                          │
│  │  QR CODE   │                          │
│  │            │                          │
│  └────────────┘                          │
│                                          │
│  Can't scan? Manual key:                 │
│  ABCD EFGH IJKL MNOP                     │
│                                          │
│  Step 3: Enter Verification Code        │
│  ┌──────────────────┐                    │
│  │  [___][___][___][___][___][___]  │   │
│  └──────────────────┘                    │
│                                          │
│  [Cancel]  [Verify and Enable]          │
└──────────────────────────────────────────┘
```

---

#### 3. `/admin/2fa/verify` - 2FA Verification Page (during login)

**Layout:**
```
┌──────────────────────────────────────────┐
│  Two-Factor Authentication               │
├──────────────────────────────────────────┤
│                                          │
│  Enter the 6-digit code from your       │
│  authenticator app                       │
│                                          │
│  ┌──────────────────┐                    │
│  │  [___][___][___][___][___][___]  │   │
│  └──────────────────┘                    │
│                                          │
│  [Verify]                                │
│                                          │
│  Lost your device?                       │
│  [Use Backup Code]                       │
│                                          │
│  [← Back to Login]                       │
└──────────────────────────────────────────┘
```

---

#### 4. Backup Codes Display Component

**Layout:**
```
┌──────────────────────────────────────────┐
│  ⚠️  Save Your Backup Codes               │
├──────────────────────────────────────────┤
│                                          │
│  Store these codes in a safe place.     │
│  Each code can only be used once.       │
│                                          │
│  1. ABCD-EFGH-IJKL                       │
│  2. MNOP-QRST-UVWX                       │
│  3. YZAB-CDEF-GHIJ                       │
│  4. KLMN-OPQR-STUV                       │
│  5. WXYZ-ABCD-EFGH                       │
│  6. IJKL-MNOP-QRST                       │
│  7. UVWX-YZAB-CDEF                       │
│  8. GHIJ-KLMN-OPQR                       │
│  9. STUV-WXYZ-ABCD                       │
│  10. EFGH-IJKL-MNOP                      │
│                                          │
│  [Download as Text]  [Print]            │
│  [I've Saved These Codes]               │
└──────────────────────────────────────────┘
```

---

### Security Considerations

1. **Secret Storage**
   - Encrypt 2FA secrets before storing in database
   - Use AES-256 encryption
   - Store encryption key in environment variable

2. **Backup Codes**
   - Hash backup codes (bcrypt) before storing
   - Generate 10 codes initially
   - Each code usable only once
   - Warn when fewer than 3 codes remain

3. **Rate Limiting**
   - Limit 2FA verification attempts to 5 per 15 minutes
   - Lock account after 10 failed attempts
   - Send email notification on repeated failures

4. **Time Sync Issues**
   - Allow 1-step time window (±30 seconds)
   - Provide troubleshooting tips for time sync

5. **Recovery Process**
   - Require email verification to disable 2FA
   - Option for SUPER_ADMIN to reset 2FA for other admins
   - Log all 2FA changes

---

## Feature 2: Admin-Specific Session Timeout

### Current Behavior
- All users (admin and regular) have same session timeout
- Session lasts 7 days by default (NextAuth default)

### New Behavior
- **Regular users:** 7 days (unchanged)
- **Admin users:** 30 minutes of inactivity
- **Session extension:** Activity extends the session

### Implementation Approach

**Option 1: NextAuth Callbacks** (Recommended)
Modify NextAuth configuration to set different maxAge based on user role.

**Option 2: Middleware Check**
Check session age in middleware and force re-login if expired.

### Code Changes

#### 1. Update `src/app/api/auth/[...nextauth]/route.ts`

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days default
},
callbacks: {
  async jwt({ token, user, account }) {
    // Set different expiry for admin users
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      // Admin session: 30 minutes
      const adminSessionDuration = 30 * 60; // 30 minutes in seconds
      token.exp = Math.floor(Date.now() / 1000) + adminSessionDuration;
    }
    return token;
  },
  async session({ session, token }) {
    // Add expiry time to session for client-side checking
    session.expiresAt = token.exp;
    return session;
  },
}
```

#### 2. Create Session Activity Tracker

**File:** `src/lib/session-activity.ts`

```typescript
/**
 * Update session activity timestamp
 * Extends admin session on each request
 */
export async function updateSessionActivity(userId: string): Promise<void> {
  // Update lastActivityAt in database or cache
  // Used to extend session on activity
}

/**
 * Check if admin session is still valid
 */
export async function isAdminSessionValid(userId: string, role: string): Promise<boolean> {
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return true; // Non-admin users not affected
  }

  const lastActivity = await getLastActivity(userId);
  const inactivityPeriod = Date.now() - lastActivity;
  const maxInactivity = 30 * 60 * 1000; // 30 minutes

  return inactivityPeriod < maxInactivity;
}
```

#### 3. Update Middleware

Add activity tracking to middleware:

```typescript
// In middleware.ts
if (token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN') {
  // Check if session is still valid
  const isValid = await isAdminSessionValid(token.sub, token.role);

  if (!isValid) {
    // Session expired, redirect to login
    return NextResponse.redirect(new URL('/admin/login?timeout=1', req.url));
  }

  // Update activity timestamp
  await updateSessionActivity(token.sub);
}
```

#### 4. Client-Side Session Monitor

**File:** `src/components/admin/SessionMonitor.tsx`

```typescript
/**
 * Monitors admin session and shows warning before timeout
 * Shows modal: "Your session will expire in 2 minutes"
 */
export function SessionMonitor() {
  useEffect(() => {
    // Check session expiry every minute
    // Show warning at 2 minutes remaining
    // Auto-logout at 0 minutes
  }, []);
}
```

---

## Feature 3: Admin Login Email Alerts

### Purpose
Notify admins immediately when their account is accessed, enabling quick detection of unauthorized access.

### Email Content

```
Subject: Admin Login Alert - [App Name]

Hello [Admin Name],

Your admin account was just accessed:

📍 Login Details:
────────────────
• Time: December 27, 2025 at 2:45 PM EST
• IP Address: 203.0.113.45
• Location: New York, USA (approximate)
• Device: Chrome on Windows 10
• 2FA Used: Yes ✅

Was this you?
────────────
If this was you, no action needed.

If this wasn't you:
1. Secure your account immediately
2. Click here to reset your password: [Link]
3. Contact support: security@beamxsolutions.com

────────────────
This is an automated security alert.
Do not reply to this email.

BeamX Solutions Security Team
```

### Implementation

#### 1. Create Email Service

**File:** `src/lib/email/admin-login-alert.ts`

```typescript
import { Resend } from 'resend';

interface LoginAlertParams {
  adminEmail: string;
  adminName: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  twoFactorUsed: boolean;
  timestamp: Date;
}

export async function sendAdminLoginAlert(params: LoginAlertParams) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Security <security@beamxsolutions.com>',
    to: params.adminEmail,
    subject: `Admin Login Alert - ${process.env.NEXT_PUBLIC_APP_NAME}`,
    html: generateLoginAlertEmail(params),
  });
}
```

#### 2. IP Geolocation (Optional)

Use free IP geolocation API to get approximate location:

```bash
npm install geoip-lite
```

```typescript
import geoip from 'geoip-lite';

function getLocationFromIp(ip: string): string {
  const geo = geoip.lookup(ip);
  if (geo) {
    return `${geo.city}, ${geo.country}`;
  }
  return 'Unknown';
}
```

#### 3. Add to Login Flow

Update login success handler:

```typescript
// After successful admin login
if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
  // Update last login info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
      lastLoginUserAgent: userAgent,
    },
  });

  // Send email alert
  await sendAdminLoginAlert({
    adminEmail: user.email,
    adminName: user.name || 'Admin',
    ipAddress: clientIp,
    userAgent: userAgent,
    location: getLocationFromIp(clientIp),
    twoFactorUsed: user.twoFactorEnabled,
    timestamp: new Date(),
  });
}
```

---

## Implementation Order

### Phase 1: Database and Dependencies (Day 1)
1. ✅ Update Prisma schema with 2FA fields
2. ✅ Run database migration
3. ✅ Install npm packages (speakeasy, qrcode, geoip-lite)
4. ✅ Update User type definitions

### Phase 2: 2FA Backend (Day 2-3)
5. ✅ Create 2FA service (`src/lib/2fa/totp-service.ts`)
6. ✅ Create backup codes service (`src/lib/2fa/backup-codes.ts`)
7. ✅ Create API endpoint: `/api/auth/2fa/setup`
8. ✅ Create API endpoint: `/api/auth/2fa/verify-setup`
9. ✅ Create API endpoint: `/api/auth/2fa/verify`
10. ✅ Create API endpoint: `/api/auth/2fa/disable`
11. ✅ Create API endpoint: `/api/auth/2fa/regenerate-backup-codes`

### Phase 3: 2FA Frontend (Day 4-5)
12. ✅ Create 2FA setup page
13. ✅ Create 2FA verification page (login flow)
14. ✅ Create backup codes display component
15. ✅ Create security settings page
16. ✅ Update login flow to check 2FA status

### Phase 4: Session Timeout (Day 6)
17. ✅ Update NextAuth configuration for admin timeout
18. ✅ Create session activity tracker
19. ✅ Update middleware with activity tracking
20. ✅ Create client-side session monitor component

### Phase 5: Login Alerts (Day 7)
21. ✅ Create email template for login alerts
22. ✅ Create email sending service
23. ✅ Add IP geolocation lookup
24. ✅ Integrate into login flow

### Phase 6: Testing and Documentation (Day 8)
25. ✅ Test complete 2FA setup flow
26. ✅ Test 2FA login flow
27. ✅ Test backup codes
28. ✅ Test session timeout
29. ✅ Test login alerts
30. ✅ Create Week 2 completion documentation

---

## Testing Checklist

### 2FA Testing
- [ ] Setup flow works end-to-end
- [ ] QR code displays correctly
- [ ] Manual secret entry works
- [ ] Verification accepts valid codes
- [ ] Verification rejects invalid codes
- [ ] Backup codes are generated
- [ ] Backup codes can be used to log in
- [ ] Backup codes can only be used once
- [ ] 2FA can be disabled with password + token
- [ ] New backup codes can be regenerated

### Session Timeout Testing
- [ ] Admin session expires after 30 minutes of inactivity
- [ ] User session lasts 7 days
- [ ] Activity extends admin session
- [ ] Warning shows 2 minutes before timeout
- [ ] Auto-logout works at timeout
- [ ] Timeout redirect includes timeout parameter

### Login Alerts Testing
- [ ] Email sent on every admin login
- [ ] Email contains correct IP address
- [ ] Email contains correct user agent
- [ ] Email contains location (if available)
- [ ] Email sent even if 2FA not enabled
- [ ] Email sent after successful 2FA verification

---

## Security Considerations

### Encryption
- 2FA secrets encrypted with AES-256
- Encryption key stored in `ENCRYPTION_KEY` environment variable
- Backup codes hashed with bcrypt

### Rate Limiting
- 2FA verification: 5 attempts per 15 minutes
- Setup endpoint: 3 attempts per hour
- Account locked after 10 failed login attempts

### Audit Logging
- Log all 2FA setup events
- Log all 2FA verification attempts
- Log all 2FA disablement
- Log all backup code regeneration
- Log all admin login events

---

## Environment Variables

```bash
# Encryption for 2FA secrets
ENCRYPTION_KEY="generate-with-openssl-rand-base64-32"

# Email alerts
ADMIN_SECURITY_EMAIL="security@beamxsolutions.com"

# Session timeout (minutes)
ADMIN_SESSION_TIMEOUT_MINUTES=30
USER_SESSION_TIMEOUT_DAYS=7
```

---

## Success Metrics

By end of Week 2:
- ✅ All admin users can enable 2FA
- ✅ 2FA is required for admin login (or enforced)
- ✅ Admin sessions timeout after 30 minutes
- ✅ Login alerts sent on every admin access
- ✅ Complete documentation created
- ✅ All tests passing

---

## Week 2 Deliverables

1. **Code:**
   - 5 new API endpoints
   - 4 new UI pages/components
   - 3 new utility libraries
   - Updated NextAuth configuration
   - Updated middleware

2. **Database:**
   - Updated User model with 2FA fields
   - Migration script

3. **Documentation:**
   - Week 2 implementation guide
   - 2FA user guide
   - Security settings documentation
   - Testing guide

**Total Estimated Lines:** ~2,000 lines of code + 1,000 lines of documentation

---

**Status:** 🚧 Ready to begin implementation
**Next Action:** Install dependencies and update database schema
