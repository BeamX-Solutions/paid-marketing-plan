/**
 * Subdomain Detection and Routing
 * Handles admin.domain.com vs app.domain.com routing
 */

import { NextRequest } from 'next/server';

/**
 * Extract subdomain from request
 */
export function getSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';

  // For local development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // Check for subdomain in localhost (e.g., admin.localhost:3002)
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  // For production (e.g., admin.example.com)
  const parts = host.split('.');

  // If we have at least 3 parts (subdomain.domain.tld)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore www
    if (subdomain === 'www') {
      return null;
    }
    return subdomain;
  }

  return null;
}

/**
 * Check if current request is on admin subdomain
 */
export function isAdminSubdomain(request: NextRequest): boolean {
  const subdomain = getSubdomain(request);
  return subdomain === 'admin';
}

/**
 * Check if current request is on user subdomain (app or no subdomain)
 */
export function isUserSubdomain(request: NextRequest): boolean {
  const subdomain = getSubdomain(request);
  return subdomain === null || subdomain === 'app' || subdomain === 'www';
}

/**
 * Get base domain from request
 */
export function getBaseDomain(request: NextRequest): string {
  const host = request.headers.get('host') || '';

  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return host;
  }

  const parts = host.split('.');

  // Return domain.tld (last 2 parts)
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return host;
}

/**
 * Get admin URL for current environment
 */
export function getAdminUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseDomain = getBaseDomain(request);

  if (baseDomain.includes('localhost')) {
    return `${protocol}://admin.${baseDomain}`;
  }

  return `${protocol}://admin.${baseDomain}`;
}

/**
 * Get user app URL for current environment
 */
export function getUserAppUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseDomain = getBaseDomain(request);

  if (baseDomain.includes('localhost')) {
    return `${protocol}://${baseDomain}`;
  }

  return `${protocol}://${baseDomain}`;
}

/**
 * Redirect to appropriate subdomain if user is on wrong one
 */
export function getSubdomainRedirect(
  request: NextRequest,
  expectedSubdomain: 'admin' | 'user'
): string | null {
  const currentSubdomain = getSubdomain(request);
  const pathname = request.nextUrl.pathname;

  // If user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (expectedSubdomain === 'admin' && currentSubdomain !== 'admin') {
      // Redirect to admin subdomain
      const adminUrl = getAdminUrl(request);
      return `${adminUrl}${pathname}${request.nextUrl.search}`;
    }
  }

  // If admin user is accessing user routes on admin subdomain
  if (currentSubdomain === 'admin' && !pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    // Redirect to user subdomain
    const userUrl = getUserAppUrl(request);
    return `${userUrl}${pathname}${request.nextUrl.search}`;
  }

  return null;
}
