import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { Resend } from 'resend';
import crypto from 'crypto';
import { validatePassword } from '@/lib/password-validation';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, businessName, industry, country, marketingConsent } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Validate password strength using the centralized validation utility
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    // Hash password with bcrypt (12 rounds is industry standard)
    const hashedPassword = await hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Create new user with hashed password
    const user = await prisma.user.create({
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        email,
        password: hashedPassword,
        businessName: businessName || null,
        industry: industry || null,
        country: country || null,
        marketingConsent: marketingConsent === true,
        emailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: verificationExpires,
        profileData: JSON.stringify({
          registrationDate: new Date().toISOString(),
          source: 'web_signup'
        })
      }
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
                <h1 style="color: white; margin: 0;">Welcome to BeamX Solutions!</h1>
              </div>

              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hello${firstName ? ` ${firstName}` : ''},</p>

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
      // Continue even if email fails - user can request new verification email
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}