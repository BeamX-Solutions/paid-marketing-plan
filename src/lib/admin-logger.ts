import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const prisma = new PrismaClient();

interface LogAdminActionParams {
  adminId: string;
  action: string;
  targetUserId?: string;
  details?: string;
  request?: NextRequest;
}

export async function logAdminAction({
  adminId,
  action,
  targetUserId,
  details,
  request,
}: LogAdminActionParams): Promise<void> {
  try {
    // Extract IP address and user agent from request if provided
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      // Try to get real IP from common headers
      ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        null;

      userAgent = request.headers.get('user-agent') || null;
    }

    // Create admin action log
    await prisma.adminAction.create({
      data: {
        adminId,
        action,
        targetUserId: targetUserId || null,
        details: details || null,
        ipAddress,
        userAgent,
      },
    });

    console.log(`Admin action logged: ${action} by ${adminId}`);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error - logging should not break the main operation
  }
}

// Helper to get current admin user for API routes
export async function getCurrentAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('UNAUTHORIZED');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}

// Helper to get current super admin user for API routes
export async function getCurrentSuperAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('UNAUTHORIZED');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN_NOT_SUPER_ADMIN');
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}
