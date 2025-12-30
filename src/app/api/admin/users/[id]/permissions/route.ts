import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentAdmin, logAdminAction } from '@/lib/admin-logger';
import { PermissionUpdateSchema, mergePermissions, parsePermissions } from '@/lib/permissions-schema';
import { z } from 'zod';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current admin user
    let admin;
    try {
      admin = await getCurrentAdmin();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
          );
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
          );
        }
      }
      throw error;
    }

    // Get request body and validate
    const body = await request.json();

    // Validate request body with Zod schema
    let validatedData;
    try {
      validatedData = PermissionUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: error.errors.map(e => e.message),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { canDownloadData } = validatedData;
    const { id: userId } = await params;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        permissions: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Safely merge permissions using schema validation
    const updatedPermissionsString = mergePermissions(targetUser.permissions, {
      canDownloadData,
    });

    // Save updated permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: updatedPermissionsString,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        permissions: true,
      },
    });

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      action: canDownloadData ? 'GRANT_DOWNLOAD_PERMISSION' : 'REVOKE_DOWNLOAD_PERMISSION',
      targetUserId: userId,
      details: `${canDownloadData ? 'Granted' : 'Revoked'} data download permission for ${targetUser.email}`,
      request,
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        permissions: parsePermissions(updatedUser.permissions),
      },
      message: `Download permission ${canDownloadData ? 'granted' : 'revoked'}`,
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update user permissions' },
      { status: 500 }
    );
  }
}
