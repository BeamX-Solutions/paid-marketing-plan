/**
 * Security Headers Configuration
 * Different CSP and security policies for admin vs user subdomains
 */

import { NextResponse } from 'next/server';

/**
 * Stricter Content Security Policy for admin subdomain
 * Note: Next.js requires unsafe-inline and unsafe-eval in development mode
 */
const ADMIN_CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],  // Required for Next.js
  'style-src': ["'self'", "'unsafe-inline'"],  // Allow inline styles for admin UI
  'font-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],  // No external APIs
  'frame-src': ["'none'"],  // No iframes allowed in admin
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Convert CSP object to header string
 */
function cspToString(csp: Record<string, string[]>): string {
  return Object.entries(csp)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply user security headers
 */
export function applyUserSecurityHeaders(response: NextResponse): NextResponse {
  // Don't apply CSP for user-facing site to ensure analytics work
  // Only apply minimal security headers

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Apply stricter admin security headers
 */
export function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  // Stricter Content Security Policy
  response.headers.set('Content-Security-Policy', cspToString(ADMIN_CSP));

  // X-Frame-Options - Absolutely no framing for admin
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy - Stricter for admin
  response.headers.set('Referrer-Policy', 'no-referrer');

  // Permissions-Policy - Deny everything for admin
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()'
  );

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security (HSTS) - Mandatory for admin
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Cache-Control - No caching for admin pages
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );

  // Pragma - Legacy no-cache
  response.headers.set('Pragma', 'no-cache');

  // X-Robots-Tag - Don't index admin pages
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  // Custom header to identify admin environment
  response.headers.set('X-Admin-Environment', 'true');

  return response;
}

/**
 * Security headers for API routes
 */
export function applyApiSecurityHeaders(response: NextResponse, isAdminApi: boolean = false): NextResponse {
  // CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  if (isAdminApi) {
    // Admin API: Only allow admin subdomain
    const allowedOrigins = process.env.ADMIN_ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.length > 0) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  } else {
    // User API: Allow user origins
    const allowedOrigins = process.env.USER_ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.length > 0) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  }

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // Cache-Control for API
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
