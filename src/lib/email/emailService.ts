import { Resend } from 'resend';
import { GeneratedContent, BusinessContext } from '@/types';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface EmailTemplateData {
  businessName?: string;
  website?: string;
  userEmail: string;
  planId: string;
  generatedContent: GeneratedContent;
  businessContext: BusinessContext;
  createdAt: string;
  downloadUrl: string;
}

// Shared email layout wrapper
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0;">
    <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">BeamX Luna</span>
        </div>

        <!-- Card -->
        <div style="background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
            ${content}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px 0 0;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                &copy; 2026 BeamX Solutions. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
}

function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">${label}</a>`;
}

function emailDivider(): string {
  return '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">';
}

export class EmailService {
  private fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  async sendPlanCompletionEmail(data: EmailTemplateData): Promise<boolean> {
    if (!resend) {
      console.log('Email service not configured (no RESEND_API_KEY), skipping email send');
      return false;
    }

    try {
      const { businessName, userEmail } = data;
      const subject = `Your marketing plan is ready${businessName ? ` — ${businessName}` : ''}`;

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject,
        html: this.generateCompletionEmailHTML(data),
        text: this.generateCompletionEmailText(data),
      });

      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending completion email:', error);
      return false;
    }
  }

  async sendPlanShareEmail(
    data: EmailTemplateData,
    recipientEmail: string,
    senderName: string,
    message?: string
  ): Promise<boolean> {
    if (!resend) {
      console.log('Email service not configured (no RESEND_API_KEY), skipping email send');
      return false;
    }

    try {
      const { businessName } = data;
      const subject = `${senderName} shared a marketing plan with you${businessName ? ` for ${businessName}` : ''}`;

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [recipientEmail],
        subject,
        html: this.generateShareEmailHTML(data, senderName, message),
        text: this.generateShareEmailText(data, senderName, message),
      });

      console.log('Share email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending share email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, businessName?: string): Promise<boolean> {
    if (!resend) {
      console.log('Email service not configured (no RESEND_API_KEY), skipping email send');
      return false;
    }

    try {
      const subject = `Welcome to BeamX Luna${businessName ? `, ${businessName}` : ''}`;

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject,
        html: this.generateWelcomeEmailHTML(businessName),
        text: this.generateWelcomeEmailText(businessName),
      });

      console.log('Welcome email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendCreditNotificationEmail(params: {
    userEmail: string;
    businessName?: string;
    type: 'addition' | 'deduction' | 'purchase';
    amount: number;
    balanceAfter: number;
    description: string;
  }): Promise<boolean> {
    if (!resend) {
      console.log('Email service not configured (no RESEND_API_KEY), skipping credit notification email');
      return false;
    }

    try {
      const subjectMap = {
        addition: 'Credits added to your account',
        deduction: 'Credits used on your account',
        purchase: 'Credit purchase confirmed',
      };

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [params.userEmail],
        subject: `${subjectMap[params.type]} — BeamX Luna`,
        html: this.generateCreditNotificationHTML(params),
        text: this.generateCreditNotificationText(params),
      });

      console.log('Credit notification email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending credit notification email:', error);
      return false;
    }
  }

  // ─── Plan Completion ───────────────────────────────────────

  private generateCompletionEmailHTML(data: EmailTemplateData): string {
    const { businessName, website, generatedContent, downloadUrl } = data;
    const { onePagePlan, strategicInsights } = generatedContent;

    return emailWrapper(`
            <div style="padding: 32px;">
                <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Your Marketing Plan is Ready</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                    ${businessName ? `For <strong style="color: #374151;">${businessName}</strong>` : 'Your comprehensive marketing strategy is complete.'}
                </p>
                ${website ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 24px;">${website}</p>` : ''}

                <div style="text-align: center; margin: 0 0 32px;">
                    ${emailButton(downloadUrl, 'View Your Marketing Plan')}
                </div>

                ${emailDivider()}

                <h2 style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 16px;">Strategy Preview</h2>

                <p style="font-size: 13px; margin: 0 0 4px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Target Market</p>
                <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">${onePagePlan.before.targetMarket.substring(0, 150)}...</p>

                <p style="font-size: 13px; margin: 0 0 4px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Key Message</p>
                <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">${onePagePlan.before.message.substring(0, 150)}...</p>

                <p style="font-size: 13px; margin: 0 0 4px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Channels</p>
                <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">${onePagePlan.before.media.slice(0, 3).join(' · ')}</p>

                ${emailDivider()}

                <h2 style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 12px;">Key Strengths</h2>
                ${strategicInsights.strengths.slice(0, 3).map((s: string) => `<p style="font-size: 14px; color: #374151; margin: 0 0 8px; padding-left: 12px; border-left: 2px solid #e5e7eb;">${s}</p>`).join('')}

                ${emailDivider()}

                <h2 style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 12px;">What's Included</h2>
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 2;">
                    One-page marketing plan<br>
                    Implementation guide with phased action plans<br>
                    Strategic insights and analysis<br>
                    KPIs and success metrics
                </p>

                ${emailDivider()}

                <p style="font-size: 13px; color: #6b7280; margin: 0; text-align: center;">
                    Questions? Contact <a href="mailto:info@beamxsolutions.com" style="color: #2563eb; text-decoration: none;">info@beamxsolutions.com</a>
                </p>
            </div>
    `);
  }

  private generateCompletionEmailText(data: EmailTemplateData): string {
    const { businessName, website, generatedContent, downloadUrl } = data;
    const { onePagePlan, strategicInsights } = generatedContent;

    return `Your Marketing Plan is Ready${businessName ? ` — ${businessName}` : ''}
${website ? `${website}\n` : ''}
View your plan: ${downloadUrl}

---

STRATEGY PREVIEW

Target Market: ${onePagePlan.before.targetMarket.substring(0, 150)}...
Key Message: ${onePagePlan.before.message.substring(0, 150)}...
Channels: ${onePagePlan.before.media.slice(0, 3).join(', ')}

Key Strengths:
${strategicInsights.strengths.slice(0, 3).map((s: string) => `- ${s}`).join('\n')}

What's Included:
- One-page marketing plan
- Implementation guide with phased action plans
- Strategic insights and analysis
- KPIs and success metrics

Questions? Contact info@beamxsolutions.com

BeamX Luna — BeamX Solutions`;
  }

  // ─── Plan Share ────────────────────────────────────────────

  private generateShareEmailHTML(data: EmailTemplateData, senderName: string, message?: string): string {
    const { businessName, website, downloadUrl } = data;

    return emailWrapper(`
            <div style="padding: 32px;">
                <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Marketing Plan Shared With You</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                    <strong style="color: #374151;">${senderName}</strong> shared a marketing plan${businessName ? ` for <strong style="color: #374151;">${businessName}</strong>` : ''} with you.
                </p>
                ${website ? `<p style="font-size: 13px; color: #6b7280; margin: 0 0 24px;">${website}</p>` : ''}

                ${message ? `
                <div style="background: #f9fafb; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
                    <p style="font-size: 13px; color: #6b7280; margin: 0 0 6px; font-weight: 600;">Message from ${senderName}:</p>
                    <p style="font-size: 14px; color: #374151; margin: 0; font-style: italic;">"${message}"</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 0 0 16px;">
                    ${emailButton(downloadUrl, 'View Marketing Plan')}
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    No account required — click to view the full plan.
                </p>
            </div>
    `);
  }

  private generateShareEmailText(data: EmailTemplateData, senderName: string, message?: string): string {
    const { businessName, website, downloadUrl } = data;

    return `Marketing Plan Shared With You

${senderName} shared a marketing plan${businessName ? ` for ${businessName}` : ''} with you.
${website ? `${website}\n` : ''}
${message ? `Message from ${senderName}: "${message}"\n` : ''}
View the plan (no account required): ${downloadUrl}

BeamX Luna — BeamX Solutions`;
  }

  // ─── Welcome ───────────────────────────────────────────────

  private generateWelcomeEmailHTML(businessName?: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return emailWrapper(`
            <div style="padding: 32px;">
                <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Welcome to BeamX Luna</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                    ${businessName ? `Hi <strong style="color: #374151;">${businessName}</strong>, thank` : 'Thank'} you for signing up. You're ready to create your first marketing plan.
                </p>

                <h2 style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 12px;">How it works</h2>
                <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
                    <tr>
                        <td style="padding: 10px 12px 10px 0; font-size: 14px; color: #6b7280; vertical-align: top; width: 20px; font-weight: 600;">1.</td>
                        <td style="padding: 10px 0; font-size: 14px; color: #374151;">Complete our questionnaire about your business</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 12px 10px 0; font-size: 14px; color: #6b7280; vertical-align: top; font-weight: 600;">2.</td>
                        <td style="padding: 10px 0; font-size: 14px; color: #374151;">Our AI analyzes your responses and builds a strategy</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 12px 10px 0; font-size: 14px; color: #6b7280; vertical-align: top; font-weight: 600;">3.</td>
                        <td style="padding: 10px 0; font-size: 14px; color: #374151;">Receive a complete marketing plan you can implement right away</td>
                    </tr>
                </table>

                <div style="text-align: center; margin: 0 0 32px;">
                    ${emailButton(`${baseUrl}/questionnaire`, 'Create Your Plan')}
                </div>

                ${emailDivider()}

                <h2 style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 12px;">What you get</h2>
                <p style="font-size: 14px; color: #374151; margin: 0; line-height: 2;">
                    Industry-specific recommendations<br>
                    9-square marketing framework<br>
                    Phased implementation guide<br>
                    Actionable KPIs and metrics
                </p>

                ${emailDivider()}

                <p style="font-size: 13px; color: #6b7280; margin: 0; text-align: center;">
                    Questions? Contact <a href="mailto:info@beamxsolutions.com" style="color: #2563eb; text-decoration: none;">info@beamxsolutions.com</a>
                </p>
            </div>
    `);
  }

  private generateWelcomeEmailText(businessName?: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return `Welcome to BeamX Luna

${businessName ? `Hi ${businessName}, thank` : 'Thank'} you for signing up. You're ready to create your first marketing plan.

How it works:
1. Complete our questionnaire about your business
2. Our AI analyzes your responses and builds a strategy
3. Receive a complete marketing plan you can implement right away

Create your plan: ${baseUrl}/questionnaire

What you get:
- Industry-specific recommendations
- 9-square marketing framework
- Phased implementation guide
- Actionable KPIs and metrics

Questions? Contact info@beamxsolutions.com

BeamX Luna — BeamX Solutions`;
  }

  // ─── Credit Notification ───────────────────────────────────

  private generateCreditNotificationHTML(params: {
    businessName?: string;
    type: 'addition' | 'deduction' | 'purchase';
    amount: number;
    balanceAfter: number;
    description: string;
  }): string {
    const { businessName, type, amount, balanceAfter, description } = params;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const isPositive = type === 'addition' || type === 'purchase';
    const titleMap = {
      addition: 'Credits Added',
      deduction: 'Credits Used',
      purchase: 'Purchase Confirmed',
    };

    return emailWrapper(`
            <div style="padding: 32px;">
                <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px;">${titleMap[type]}</h1>
                ${businessName ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">${businessName}</p>` : '<div style="margin-bottom: 24px;"></div>'}

                <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
                    <tr>
                        <td style="padding: 12px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Amount</td>
                        <td style="padding: 12px 0; font-size: 14px; color: ${isPositive ? '#16a34a' : '#374151'}; text-align: right; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${isPositive ? '+' : '-'}${amount} credits</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Description</td>
                        <td style="padding: 12px 0; font-size: 14px; color: #374151; text-align: right; border-bottom: 1px solid #f3f4f6;">${description}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-size: 14px; color: #6b7280;">Balance</td>
                        <td style="padding: 12px 0; font-size: 14px; color: #111827; text-align: right; font-weight: 700;">${balanceAfter} credits</td>
                    </tr>
                </table>

                <div style="text-align: center;">
                    ${emailButton(`${baseUrl}/dashboard`, 'View Dashboard')}
                </div>
            </div>
    `);
  }

  private generateCreditNotificationText(params: {
    businessName?: string;
    type: 'addition' | 'deduction' | 'purchase';
    amount: number;
    balanceAfter: number;
    description: string;
  }): string {
    const { businessName, type, amount, balanceAfter, description } = params;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const isPositive = type === 'addition' || type === 'purchase';

    const titleMap = {
      addition: 'Credits Added',
      deduction: 'Credits Used',
      purchase: 'Purchase Confirmed',
    };

    return `${titleMap[type]}${businessName ? ` — ${businessName}` : ''}

Amount: ${isPositive ? '+' : '-'}${amount} credits
Description: ${description}
Balance: ${balanceAfter} credits

View dashboard: ${baseUrl}/dashboard

BeamX Luna — BeamX Solutions`;
  }
}

export const emailService = new EmailService();
