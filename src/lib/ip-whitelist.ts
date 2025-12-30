/**
 * IP Whitelist for Admin Access
 * Restricts admin access to specific IP addresses (optional)
 */

import { NextRequest } from 'next/server';

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
  // The first one is the original client
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Check if IP is in CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  // Simple CIDR check (supports IPv4 only for now)
  if (!cidr.includes('/')) {
    // Exact match
    return ip === cidr;
  }

  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Convert IP string to number
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.');
  return parts.reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

/**
 * Get admin IP whitelist from environment
 */
export function getAdminIpWhitelist(): string[] {
  const whitelist = process.env.ADMIN_IP_WHITELIST;

  if (!whitelist) {
    return [];
  }

  // Split by comma and trim
  return whitelist.split(',').map(ip => ip.trim()).filter(Boolean);
}

/**
 * Check if IP is whitelisted for admin access
 */
export function isIpWhitelisted(request: NextRequest): boolean {
  const whitelist = getAdminIpWhitelist();

  // If no whitelist configured, allow all (whitelist is optional)
  if (whitelist.length === 0) {
    return true;
  }

  const clientIp = getClientIp(request);

  // Unknown IP is not whitelisted
  if (clientIp === 'unknown') {
    return false;
  }

  // Check if client IP matches any whitelist entry
  return whitelist.some(whitelistEntry => {
    // Support both exact IP and CIDR notation
    return isIpInCidr(clientIp, whitelistEntry);
  });
}

/**
 * Check if admin IP whitelist is enabled
 */
export function isIpWhitelistEnabled(): boolean {
  const whitelist = getAdminIpWhitelist();
  return whitelist.length > 0;
}

/**
 * Get IP whitelist status for logging
 */
export function getIpWhitelistStatus(request: NextRequest): {
  enabled: boolean;
  clientIp: string;
  whitelisted: boolean;
  whitelistSize: number;
} {
  const enabled = isIpWhitelistEnabled();
  const clientIp = getClientIp(request);
  const whitelisted = isIpWhitelisted(request);
  const whitelistSize = getAdminIpWhitelist().length;

  return {
    enabled,
    clientIp,
    whitelisted,
    whitelistSize,
  };
}
