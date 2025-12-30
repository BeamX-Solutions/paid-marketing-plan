import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isAdminSubdomain, getSubdomainRedirect } from '@/lib/subdomain';
import { applyAdminSecurityHeaders, applyUserSecurityHeaders } from '@/lib/security-headers';
import { isIpWhitelisted, isIpWhitelistEnabled } from '@/lib/ip-whitelist';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if this is an admin subdomain request
    const isAdminSub = isAdminSubdomain(req);

    // Check IP whitelist for admin subdomain (if enabled)
    if (isAdminSub && isIpWhitelistEnabled() && !isIpWhitelisted(req)) {
      console.log(`[Security] IP whitelist blocked access from ${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`);
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Access Denied</title></head>
          <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h1 style="color: #dc2626; margin: 0 0 1rem 0;">Access Denied</h1>
              <p style="color: #6b7280; margin: 0;">Your IP address is not authorized to access the admin panel.</p>
            </div>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }

    // Check for subdomain redirects
    // If user is accessing /admin routes, they should be on admin subdomain
    if (pathname.startsWith('/admin')) {
      const redirectUrl = getSubdomainRedirect(req, 'admin');
      if (redirectUrl) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If on admin subdomain accessing non-admin routes, redirect to user subdomain
    if (isAdminSub && !pathname.startsWith('/admin') && !pathname.startsWith('/api/admin') && pathname !== '/account-suspended') {
      const redirectUrl = getSubdomainRedirect(req, 'user');
      if (redirectUrl) {
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Always allow admin login page - return immediately
    if (pathname === '/admin/login') {
      const response = NextResponse.next();
      return isAdminSub ? applyAdminSecurityHeaders(response) : response;
    }

    const isAdminRoute = pathname.startsWith('/admin');

    // Protect admin routes
    if (isAdminRoute) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Block suspended/deactivated users (but not on auth routes or login)
    if (token && token.status !== 'ACTIVE' && !pathname.startsWith('/api/auth') && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/account-suspended', req.url));
    }

    const response = NextResponse.next();

    // Apply security headers based on subdomain
    if (isAdminSub || isAdminRoute) {
      return applyAdminSecurityHeaders(response);
    } else {
      return applyUserSecurityHeaders(response);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always authorize login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }

        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        if (isAdminRoute) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
