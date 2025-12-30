import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  if (session.user.status !== 'ACTIVE') {
    redirect('/account-suspended');
  }

  return session;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/admin/login');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return session;
}

/**
 * Check admin authentication for API routes
 * Returns session if authenticated, throws Response if not
 */
export async function requireAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    throw NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Check super admin authentication for pages
 * Redirects to login or home if not super admin
 */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/admin/login');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  return session;
}

/**
 * Check super admin authentication for API routes
 * Returns session if authenticated, throws Response if not
 */
export async function requireSuperAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    throw NextResponse.json(
      { error: 'Forbidden - Super admin access required' },
      { status: 403 }
    );
  }

  return session;
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

export function isSuperAdmin(session: any): boolean {
  return session?.user?.role === 'SUPER_ADMIN';
}
