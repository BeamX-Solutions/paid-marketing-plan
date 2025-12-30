import express from 'express';
import { body, validationResult } from 'express-validator';
import { Resend } from 'resend';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, ApiResponse } from '../types';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.use(authenticateToken);

router.post('/send-plan/:planId', [
  body('recipientEmail').isEmail().normalizeEmail(),
  body('message').optional().isString().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { planId } = req.params;
    const { recipientEmail, message } = req.body;
    const userId = req.userId!;

    const plan = await prisma.marketingPlan.findFirst({
      where: {
        id: planId,
        userId
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    if (plan.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Plan must be completed before sharing'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const emailSubject = `Marketing Plan for ${plan.businessName}`;
    const emailContent = `
      <h2>Marketing Plan for ${plan.businessName}</h2>
      
      ${message ? `<p><strong>Message from ${user?.name || user?.email}:</strong></p><p>${message}</p><hr>` : ''}
      
      <div style="white-space: pre-wrap; font-family: 'Courier New', monospace;">
        ${plan.content.replace(/\n/g, '<br>')}
      </div>
    `;

    await resend.emails.send({
      from: 'Marketing Plan Generator <noreply@yourapp.com>',
      to: recipientEmail,
      subject: emailSubject,
      html: emailContent
    });

    await prisma.analyticsEvent.create({
      data: {
        userId,
        event: 'plan_shared',
        properties: {
          planId: plan.id,
          recipientEmail,
          businessName: plan.businessName
        },
        timestamp: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Plan sent successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

router.post('/welcome', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await resend.emails.send({
      from: 'Marketing Plan Generator <noreply@yourapp.com>',
      to: user.email,
      subject: 'Welcome to Marketing Plan Generator',
      html: `
        <h2>Welcome to Marketing Plan Generator!</h2>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thank you for signing up! We're excited to help you create comprehensive marketing plans for your business.</p>
        <p>Get started by creating your first marketing plan in the dashboard.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Marketing Plan Generator Team</p>
      `
    });

    const response: ApiResponse = {
      success: true,
      message: 'Welcome email sent'
    };

    res.json(response);
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send welcome email'
    });
  }
});

export default router;