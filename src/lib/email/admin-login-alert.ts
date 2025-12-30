/**
 * Admin Login Email Alert Service
 * Sends email notifications when admin accounts are accessed
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface LoginAlertParams {
  adminEmail: string;
  adminName: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  twoFactorUsed: boolean;
  timestamp: Date;
}

/**
 * Parse user agent string to get device info
 */
function parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
  // Simple parsing - could use a library like ua-parser-js for more accuracy
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
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
  else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; device = userAgent.includes('iPad') ? 'Tablet' : 'Mobile'; }

  // Refine device type
  if (userAgent.includes('Mobile') && device === 'Desktop') device = 'Mobile';
  if (userAgent.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
}

/**
 * Generate HTML email for login alert
 */
function generateLoginAlertEmail(params: LoginAlertParams): string {
  const { browser, os, device } = parseUserAgent(params.userAgent);
  const formattedTime = params.timestamp.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .alert-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    .details {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      min-width: 140px;
      color: #6c757d;
    }
    .detail-value {
      color: #333;
    }
    .security-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      ${params.twoFactorUsed
        ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
        : 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;'
      }
    }
    .action-section {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .action-section h3 {
      margin-top: 0;
      color: #856404;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #dc3545;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 10px 10px 10px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      font-size: 12px;
      color: #6c757d;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Admin Login Alert</h1>
    </div>

    <p>Hello <strong>${params.adminName}</strong>,</p>

    <p>Your admin account was just accessed. If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.</p>

    <div class="details">
      <h3 style="margin-top: 0;">📍 Login Details</h3>

      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${formattedTime}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">IP Address:</span>
        <span class="detail-value">${params.ipAddress}</span>
      </div>

      ${params.location ? `
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${params.location} <em>(approximate)</em></span>
      </div>
      ` : ''}

      <div class="detail-row">
        <span class="detail-label">Device:</span>
        <span class="detail-value">${device}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Browser:</span>
        <span class="detail-value">${browser} on ${os}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">2FA Used:</span>
        <span class="detail-value">
          <span class="security-badge">
            ${params.twoFactorUsed ? '✓ Yes' : '⚠ No'}
          </span>
        </span>
      </div>
    </div>

    <div class="action-section">
      <h3>⚠️ Wasn't You?</h3>
      <p style="margin-bottom: 15px;">If you didn't make this login attempt, your account may be compromised. Take these steps immediately:</p>

      <ol style="margin: 15px 0;">
        <li>Reset your password</li>
        <li>Enable two-factor authentication if not already enabled</li>
        <li>Review recent account activity</li>
        <li>Contact support if you need assistance</li>
      </ol>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/security" class="button">
        Secure Account
      </a>
      <a href="mailto:${process.env.ADMIN_SECURITY_EMAIL || 'security@beamxsolutions.com'}" class="button" style="background: #6c757d;">
        Contact Support
      </a>
    </div>

    <p style="color: #6c757d; font-size: 14px;">
      <strong>Was this you?</strong><br>
      If this login was expected, you can safely ignore this email. We send these notifications to help keep your account secure.
    </p>

    <div class="footer">
      <p>This is an automated security alert from ${process.env.NEXT_PUBLIC_APP_NAME || 'Marketing Plan Generator'}.</p>
      <p>Please do not reply to this email. For support, contact ${process.env.ADMIN_SECURITY_EMAIL || 'security@beamxsolutions.com'}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send admin login alert email
 */
export async function sendAdminLoginAlert(params: LoginAlertParams): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping login alert email');
      return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Security <security@beamxsolutions.com>';
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Marketing Plan Generator';

    await resend.emails.send({
      from: fromEmail,
      to: params.adminEmail,
      subject: `🔐 Admin Login Alert - ${appName}`,
      html: generateLoginAlertEmail(params),
    });

    console.log(`Login alert sent to ${params.adminEmail}`);
  } catch (error) {
    console.error('Failed to send admin login alert:', error);
    // Don't throw - login should succeed even if email fails
  }
}

/**
 * Get approximate location from IP address (free service)
 * Uses ipapi.co free API (no key required, 1000 requests/day)
 */
export async function getLocationFromIp(ip: string): Promise<string | undefined> {
  try {
    // Skip for local/private IPs
    if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1') {
      return 'Local Network';
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Marketing-Plan-Generator/1.0',
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();

    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`;
    } else if (data.country_name) {
      return data.country_name;
    }

    return undefined;
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return undefined;
  }
}
