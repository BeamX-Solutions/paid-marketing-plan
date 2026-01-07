import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { sendAdminLoginAlert, getLocationFromIp } from '@/lib/email/admin-login-alert';
import { trackSession, updateSessionActivity } from '@/lib/security/session-manager';
import { logSecurityEvent } from '@/lib/security/event-logger';

const prisma = new PrismaClient();

// Session timeout constants
const ADMIN_SESSION_TIMEOUT: number = 30 * 60; // 30 minutes in seconds
const USER_SESSION_TIMEOUT: number = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Send admin login alert email (non-blocking)
 */
async function sendLoginAlertAsync(userId: string, userEmail: string, userName: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastLoginIp: true,
        lastLoginUserAgent: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) return;

    const ipAddress = user.lastLoginIp || 'unknown';
    const userAgent = user.lastLoginUserAgent || 'Unknown';
    const location = await getLocationFromIp(ipAddress);

    await sendAdminLoginAlert({
      adminEmail: userEmail,
      adminName: userName,
      ipAddress,
      userAgent,
      location: location || 'Unknown',
      twoFactorUsed: user.twoFactorEnabled || false,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to send admin login alert:', error);
    // Don't throw - login should succeed even if email fails
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: USER_SESSION_TIMEOUT, // Default for regular users
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        // Check if user is suspended or deactivated
        if (user.status !== 'ACTIVE') {
          throw new Error('Account is suspended or deactivated');
        }

        // Check if user has a password (some users may only use OAuth)
        if (!user.password) {
          throw new Error('Please sign in with Google');
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.businessName || user.email,
          businessName: user.businessName || undefined,
          industry: user.industry || undefined,
          role: user.role,
          status: user.status,
        };
      }
    }),
    // Admin-specific login provider
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          // Log failed login attempt - user not found
          logSecurityEvent({
            eventType: 'failed_login',
            severity: 'medium',
            userId: undefined,
            ipAddress: 'unknown',
            userAgent: 'unknown',
            details: {
              email: credentials.email,
              reason: 'user_not_found',
              loginType: 'admin',
            },
          }).catch(console.error);
          return null;
        }

        // Check if user is admin
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          // Log unauthorized admin access attempt
          logSecurityEvent({
            eventType: 'failed_login',
            severity: 'high',
            userId: user.id,
            ipAddress: 'unknown',
            userAgent: 'unknown',
            details: {
              email: user.email,
              reason: 'not_admin',
              actualRole: user.role,
            },
          }).catch(console.error);
          throw new Error('Unauthorized: Admin access required');
        }

        // Check if user has a password
        if (!user.password) {
          throw new Error('Password authentication not configured for this account');
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // Log failed login - invalid password
          logSecurityEvent({
            eventType: 'failed_login',
            severity: 'medium',
            userId: user.id,
            ipAddress: 'unknown',
            userAgent: 'unknown',
            details: {
              email: user.email,
              reason: 'invalid_password',
              role: user.role,
            },
          }).catch(console.error);
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.businessName || user.email,
          businessName: user.businessName || undefined,
          industry: user.industry || undefined,
          role: user.role,
          status: user.status,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Send email alert for admin logins (non-blocking)
      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        // Send alert asynchronously (don't await)
        sendLoginAlertAsync(user.id, user.email!, user.name || user.email!).catch(err => {
          console.error('Error sending login alert:', err);
        });

        // Track admin session (non-blocking)
        trackSession({
          userId: user.id,
          sessionToken: account?.access_token || `session-${Date.now()}`,
          ipAddress: 'unknown', // Will be updated from client-side
          userAgent: 'unknown', // Will be updated from client-side
          expiresAt: new Date(Date.now() + ADMIN_SESSION_TIMEOUT * 1000),
        }).catch(err => {
          console.error('Error tracking session:', err);
        });
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        // Set different expiry based on role
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        const sessionDuration = isAdmin ? ADMIN_SESSION_TIMEOUT : USER_SESSION_TIMEOUT;

        return {
          ...token,
          role: user.role,
          status: user.status,
          businessName: user.businessName,
          industry: user.industry,
          exp: Math.floor(Date.now() / 1000) + sessionDuration,
          isAdmin,
        };
      }

      // Refresh user data on update trigger
      if (trigger === 'update' && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;

          // Update expiry if role changed
          const isAdmin = dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN';
          const sessionDuration = isAdmin ? ADMIN_SESSION_TIMEOUT : USER_SESSION_TIMEOUT;
          token.exp = Math.floor(Date.now() / 1000) + sessionDuration;
          token.isAdmin = isAdmin;
        }
      }

      // Check if admin session has expired (for additional security)
      if (token.isAdmin && token.exp && typeof token.exp === 'number') {
        const now = Math.floor(Date.now() / 1000);
        if (now > token.exp) {
          // Session expired - force re-login by returning a minimal token
          return {
            ...token,
            exp: 0, // Immediately expired
          };
        }
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
          status: token.status,
          businessName: token.businessName,
          industry: token.industry,
        },
        expires: (token.exp && typeof token.exp === 'number') ? new Date(token.exp * 1000).toISOString() : session.expires,
        isAdmin: token.isAdmin || false,
      };
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

export default authOptions;