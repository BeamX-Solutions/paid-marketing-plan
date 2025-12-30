# Subdomain Separation Setup Guide

## Overview

This application uses subdomain separation to enhance security by isolating admin functionality from user-facing features. Admin routes are accessed via `admin.domain.com` while user routes use the base domain `domain.com` or `app.domain.com`.

**Security Benefits:**
- 🔒 Stricter Content Security Policy (CSP) for admin pages
- 🛡️ Optional IP whitelist restriction for admin access
- 🚫 No external API calls allowed from admin subdomain
- 📝 Separate security headers and caching policies
- 🔐 Network-level isolation between admin and user traffic

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Subdomain (app.domain.com or domain.com)              │
│  ├─ /dashboard                                               │
│  ├─ /questionnaire                                           │
│  ├─ /plan/[id]                                               │
│  └─ /api/plans/*                                             │
│                                                               │
│  Admin Subdomain (admin.domain.com)                          │
│  ├─ /admin/dashboard                                         │
│  ├─ /admin/users                                             │
│  ├─ /admin/analytics                                         │
│  └─ /api/admin/*                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Development Setup

### Step 1: Configure /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)

Add these entries to your hosts file:

```
127.0.0.1   localhost
127.0.0.1   admin.localhost
127.0.0.1   app.localhost
```

**Windows Instructions:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add the lines above
4. Save and close

**Mac/Linux Instructions:**
```bash
sudo nano /etc/hosts
# Add the lines above
# Save with Ctrl+O, Exit with Ctrl+X
```

### Step 2: Update Environment Variables

Add to your `.env.local` file:

```bash
# Admin Security Configuration (Optional)
ADMIN_IP_WHITELIST=""  # Leave empty for local dev
ADMIN_ALLOWED_ORIGINS="http://admin.localhost:3002"
USER_ALLOWED_ORIGINS="http://localhost:3002,http://app.localhost:3002"
```

### Step 3: Start Development Server

```bash
npm run dev
# Server will start on port 3002
```

### Step 4: Access the Application

**User Interface:**
- http://localhost:3002 - Main user app
- http://app.localhost:3002 - Alternative user app URL

**Admin Interface:**
- http://admin.localhost:3002 - Admin dashboard
- http://admin.localhost:3002/admin/login - Admin login

---

## Production Setup

### Option 1: Subdomain DNS Configuration

Configure DNS records for your domain:

```
# A Records
@                 A     YOUR_SERVER_IP
admin             A     YOUR_SERVER_IP
app               A     YOUR_SERVER_IP (optional)
www               A     YOUR_SERVER_IP
```

### Option 2: Wildcard DNS (Recommended)

```
# A Record
*.domain.com      A     YOUR_SERVER_IP
```

### Environment Variables for Production

Update your production environment variables:

```bash
# Production URLs
NEXTAUTH_URL="https://www.beamxsolutions.com"
NEXT_PUBLIC_APP_URL="https://www.beamxsolutions.com"

# Admin Security
ADMIN_IP_WHITELIST="203.0.113.1,198.51.100.0/24"  # Your office IPs
ADMIN_ALLOWED_ORIGINS="https://admin.beamxsolutions.com"
USER_ALLOWED_ORIGINS="https://www.beamxsolutions.com,https://beamxsolutions.com"
```

### Vercel Deployment

1. **Domain Configuration in Vercel:**
   - Add domain: `beamxsolutions.com`
   - Add domain: `admin.beamxsolutions.com`
   - Add domain: `app.beamxsolutions.com` (optional)
   - Add domain: `www.beamxsolutions.com`

2. **Environment Variables:**
   Set in Vercel dashboard under Settings → Environment Variables

3. **Automatic SSL:**
   Vercel automatically provisions SSL certificates for all domains

### Other Platforms (Railway, Render, etc.)

1. Configure custom domains in platform dashboard
2. Add DNS records as specified above
3. Set environment variables in platform settings
4. Ensure SSL is enabled for all subdomains

---

## IP Whitelist Configuration

### Enable IP Whitelist

Set the `ADMIN_IP_WHITELIST` environment variable with comma-separated IPs:

```bash
# Single IP
ADMIN_IP_WHITELIST="203.0.113.1"

# Multiple IPs
ADMIN_IP_WHITELIST="203.0.113.1,203.0.113.2,203.0.113.3"

# CIDR Range (entire subnet)
ADMIN_IP_WHITELIST="203.0.113.0/24"

# Mixed
ADMIN_IP_WHITELIST="203.0.113.1,198.51.100.0/24,192.0.2.5"
```

### Finding Your IP Address

**From Command Line:**
```bash
# Windows
curl ifconfig.me

# Mac/Linux
curl ifconfig.me
# or
curl ipinfo.io/ip
```

**From Browser:**
- Visit: https://whatismyipaddress.com/

### Disable IP Whitelist

To disable IP whitelisting (allow all IPs):

```bash
ADMIN_IP_WHITELIST=""
```

### Testing IP Whitelist

1. Set `ADMIN_IP_WHITELIST` to a different IP than yours
2. Try accessing http://admin.localhost:3002
3. You should see: "Access Denied - Your IP address is not authorized"

---

## Security Headers Reference

### Admin Subdomain Headers

Stricter security policy for admin pages:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; ...
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
X-Robots-Tag: noindex, nofollow
X-Admin-Environment: true
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Key Restrictions:**
- ❌ No `unsafe-eval` in script-src
- ❌ No external API calls
- ❌ No iframes allowed
- ❌ No caching
- ❌ No search engine indexing

### User Subdomain Headers

Standard security policy for user-facing pages:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; ...
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (production only)
```

**Allowed Features:**
- ✅ Stripe integration (js.stripe.com)
- ✅ Google Fonts
- ✅ External CDNs for libraries
- ✅ Standard caching

---

## Troubleshooting

### Issue: "Cannot access admin.localhost"

**Solution:**
1. Check hosts file configuration
2. Clear browser cache
3. Try accessing with http:// (not https://)
4. Restart browser after modifying hosts file

### Issue: "IP whitelist blocking my access"

**Solution:**
1. Check your current IP: `curl ifconfig.me`
2. Verify `ADMIN_IP_WHITELIST` environment variable
3. Ensure IP is in correct format (no spaces)
4. For local dev, set `ADMIN_IP_WHITELIST=""` to disable

### Issue: "Subdomain redirect loop"

**Solution:**
1. Clear cookies for the domain
2. Check middleware logs for redirect logic
3. Ensure NEXTAUTH_URL matches your domain
4. Verify DNS records are correct

### Issue: "CORS errors on admin API"

**Solution:**
1. Check `ADMIN_ALLOWED_ORIGINS` includes your admin subdomain
2. Verify format: `http://admin.localhost:3002` (no trailing slash)
3. For production, use https:// URLs
4. Restart dev server after changing .env.local

---

## Testing Subdomain Setup

### Manual Testing Checklist

- [ ] Can access http://localhost:3002 (user app)
- [ ] Can access http://admin.localhost:3002 (admin app)
- [ ] Admin pages show stricter CSP headers (check DevTools → Network)
- [ ] User pages show standard CSP headers
- [ ] IP whitelist blocks unauthorized IPs (when enabled)
- [ ] Accessing /admin on user domain redirects to admin subdomain
- [ ] Accessing user routes on admin subdomain redirects to user domain

### Automated Testing Script

Create `scripts/test-subdomains.js`:

```javascript
const fetch = require('node-fetch');

async function testSubdomains() {
  console.log('Testing subdomain setup...\n');

  // Test 1: User subdomain
  const userResponse = await fetch('http://localhost:3002');
  console.log('✓ User subdomain accessible');

  // Test 2: Admin subdomain
  const adminResponse = await fetch('http://admin.localhost:3002/admin/login');
  console.log('✓ Admin subdomain accessible');

  // Test 3: Check security headers
  const headers = adminResponse.headers;
  const hasAdminHeader = headers.get('X-Admin-Environment') === 'true';
  console.log(hasAdminHeader ? '✓ Admin security headers present' : '✗ Admin headers missing');

  console.log('\nAll tests passed!');
}

testSubdomains().catch(console.error);
```

Run with:
```bash
node scripts/test-subdomains.js
```

---

## Migration from Current Setup

If you're upgrading from a setup without subdomain separation:

### 1. Update Bookmarks
- Old: `http://localhost:3002/admin/dashboard`
- New: `http://admin.localhost:3002/admin/dashboard`

### 2. Update API Calls
Most API calls will work automatically, but if you have hardcoded URLs, update them:

```javascript
// Before
const response = await fetch('/api/admin/users');

// After (still works, but better to be explicit)
const response = await fetch('/api/admin/users');
// Or for cross-subdomain calls:
const response = await fetch('http://admin.localhost:3002/api/admin/users');
```

### 3. Update Email Links
If you send emails with admin links:

```javascript
// Before
const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`;

// After
const loginUrl = `https://admin.${getBaseDomain()}/admin/login`;
```

### 4. Gradual Rollout
The subdomain separation is **backward compatible**. You can still access admin pages via `domain.com/admin` - they will automatically redirect to `admin.domain.com`.

---

## Security Best Practices

### ✅ Do:
- Enable IP whitelist in production for admin subdomain
- Use HTTPS in production (automatic with Vercel)
- Regularly review admin access logs
- Keep `ADMIN_IP_WHITELIST` updated when team changes
- Set short session timeout for admin users (Week 2 feature)

### ❌ Don't:
- Disable security headers in production
- Use http:// for admin in production
- Share admin IP whitelist publicly
- Allow * in CORS origins
- Use same session storage for admin and user

---

## Next Steps

**Week 1 (Completed):** ✅
- Subdomain routing
- Security headers
- IP whitelist

**Week 2 (Upcoming):**
- Two-factor authentication (2FA) for admin users
- Admin-specific session timeout (30 minutes)
- Admin login email alerts

**Week 3 (Upcoming):**
- Admin access monitoring dashboard
- Anomaly detection for suspicious admin activity
- Security event logging and alerts

---

## Support

If you encounter issues:

1. Check this guide first
2. Review console logs for errors
3. Verify environment variables are set correctly
4. Check middleware logs for routing decisions
5. Test with IP whitelist disabled to isolate issues

For additional help, contact: chimaobi@beamxsolutions.com

---

**Last Updated:** 2025-12-27
**Version:** 1.0.0 (Week 1 Implementation)
