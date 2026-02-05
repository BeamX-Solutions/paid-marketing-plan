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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a verification link.'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    const logoUrl = 'https://luna.beamxsolutions.com/logo.png';

    try {
      await resend.emails.send({
        from: 'BeamX Solutions <noreply@beamxsolutions.com>',
        to: email,
        subject: 'Verify Your Email - BeamX Luna',
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
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Verify Your Email</h1>
                  </div>

                  <!-- Body Content -->
                  <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello${user.firstName ? ` ${user.firstName}` : ''},</p>

                    <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
                      Please verify your email address to continue using BeamX Luna and access all features.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${verificationUrl}" style="background: linear-gradient(135deg, #008BD8 0%, #02428E 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(15, 90, 224, 0.3);">Verify Email Address</a>
                    </div>

                    <!-- Link fallback -->
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 25px 0;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">Or copy and paste this link into your browser:</p>
                      <p style="color: #0F5AE0; word-break: break-all; font-size: 13px; margin: 0;">${verificationUrl}</p>
                    </div>

                    <!-- Info Notice -->
                    <div style="border-left: 4px solid #0F5AE0; background-color: #eff6ff; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px;">
                      <p style="color: #1e40af; font-size: 14px; margin: 0;">
                        This link will expire in 24 hours. If you didn't request this email, please ignore it.
                      </p>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <!-- Social Media Links -->
                    <div style="margin-bottom: 20px;">
                      <a href="https://twitter.com/beamxsolutions" style="display: inline-block; margin: 0 8px;">
                        <img src="https://cdn-icons-png.flaticon.com/24/5968/5968830.png" alt="X" style="width: 24px; height: 24px;" />
                      </a>
                      <a href="https://linkedin.com/company/beamxsolutions" style="display: inline-block; margin: 0 8px;">
                        <img src="https://cdn-icons-png.flaticon.com/24/733/733561.png" alt="LinkedIn" style="width: 24px; height: 24px;" />
                      </a>
                      <a href="https://facebook.com/beamxsolutions" style="display: inline-block; margin: 0 8px;">
                        <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 24px; height: 24px;" />
                      </a>
                      <a href="https://instagram.com/beamxsolutions" style="display: inline-block; margin: 0 8px;">
                        <img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" style="width: 24px; height: 24px;" />
                      </a>
                    </div>
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
                  This email was sent by BeamX Solutions. If you have any questions, contact us at info@beamxsolutions.com
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
