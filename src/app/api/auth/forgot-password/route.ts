import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save hashed token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/auth/reset-password?token=${resetToken}`;

    // Get the base URL for logo (use production URL or fallback)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/logo.png`;

    try {
      await resend.emails.send({
        from: 'BeamX Solutions <info@beamxsolutions.com>',
        to: email,
        subject: 'Reset Your BeamX Luna Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
              <div style="background-color: #f4f7fa; padding: 40px 20px;">
                <!-- Main Container -->
                <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                  <!-- Header with Logo -->
                  <div style="background: linear-gradient(135deg, #008BD8 0%, #02428E 100%); padding: 40px 30px; text-align: center;">
                    <img src="${logoUrl}" alt="BeamX Luna" style="height: 50px; margin-bottom: 20px;" />
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
                  </div>

                  <!-- Body Content -->
                  <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello,</p>

                    <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                      We received a request to reset the password for your BeamX Luna account. Click the button below to create a new password:
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${resetUrl}" style="background: linear-gradient(135deg, #008BD8 0%, #02428E 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(15, 90, 224, 0.3);">Reset Password</a>
                    </div>

                    <!-- Link fallback -->
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 25px 0;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">Or copy and paste this link into your browser:</p>
                      <p style="color: #0F5AE0; word-break: break-all; font-size: 13px; margin: 0;">${resetUrl}</p>
                    </div>

                    <!-- Security Notice -->
                    <div style="border-left: 4px solid #f59e0b; background-color: #fffbeb; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0;">
                        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                      </p>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      Powered by <strong style="color: #0F5AE0;">BeamX Luna</strong>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} BeamX Solutions. All rights reserved.
                    </p>
                  </div>
                </div>

                <!-- Bottom Note -->
                <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                  This email was sent by BeamX Solutions. If you have any questions, contact us at support@beamxsolutions.com
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue even if email fails (token is still valid)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
