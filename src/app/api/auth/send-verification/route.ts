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

    try {
      await resend.emails.send({
        from: 'BeamX Solutions <noreply@beamxsolutions.com>',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Verify Your Email</h1>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hello${user.firstName ? ` ${user.firstName}` : ''},</p>

                <p>Thank you for signing up! Please verify your email address to get started.</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
                </div>

                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #667eea; word-break: break-all; font-size: 14px;">${verificationUrl}</p>

                <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  This link will expire in 24 hours. If you didn't create an account, please ignore this email.
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
