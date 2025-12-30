import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getCurrentSuperAdmin, logAdminAction } from '@/lib/admin-logger';
import { validatePassword } from '@/lib/password-validation';
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rate-limit';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(req, RATE_LIMIT_CONFIGS.adminCreation);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Get current super admin user
    let admin;
    try {
      admin = await getCurrentSuperAdmin();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
          );
        }
        if (error.message === 'FORBIDDEN_NOT_SUPER_ADMIN') {
          return NextResponse.json(
            { error: 'Forbidden - Only super admin can create admins' },
            { status: 403 }
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

    // Parse request body
    const { email, password, firstName, lastName } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Log the admin action
    await logAdminAction({
      adminId: admin.id,
      action: 'CREATE_ADMIN_USER',
      targetUserId: newAdmin.id,
      details: `Created new admin user: ${email}`,
      request: req,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
        status: newAdmin.status,
      },
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
