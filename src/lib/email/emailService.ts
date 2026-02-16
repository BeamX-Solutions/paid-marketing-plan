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

export class EmailService {
  // Update this to your verified Resend email domain
  // For testing, you can use: 'onboarding@resend.dev'
  // For production, use your verified domain: 'noreply@yourdomain.com'
  private fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  
  async sendPlanCompletionEmail(data: EmailTemplateData): Promise<boolean> {
    if (!resend) {
      console.log('Email service not configured (no RESEND_API_KEY), skipping email send');
      return false;
    }

        try {
            const { businessName, website, userEmail, generatedContent, businessContext, downloadUrl } = data;

      const subject = `🎉 Your Marketing Plan is Ready${businessName ? ` for ${businessName}` : ''}!`;

      const htmlContent = this.generateCompletionEmailHTML(data);
      const textContent = this.generateCompletionEmailText(data);

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: subject,
        html: htmlContent,
        text: textContent,
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
      const { businessName, downloadUrl } = data;
      
      const subject = `${senderName} shared a marketing plan with you${businessName ? ` for ${businessName}` : ''}`;
      
      const htmlContent = this.generateShareEmailHTML(data, senderName, message);
      const textContent = this.generateShareEmailText(data, senderName, message);

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
        text: textContent,
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
      const subject = `Welcome to BeamX Luna${businessName ? `, ${businessName}` : ''}!`;
      
      const htmlContent = this.generateWelcomeEmailHTML(businessName);
      const textContent = this.generateWelcomeEmailText(businessName);

      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      console.log('Welcome email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  private generateCompletionEmailHTML(data: EmailTemplateData): string {
    const { businessName, website, generatedContent, businessContext, downloadUrl } = data;
    const { onePagePlan, strategicInsights } = generatedContent;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Marketing Plan is Ready!</title>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">BeamX Luna</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Powered by BeamX Soutions</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">🎉 Your Marketing Plan is Complete!</h2>
                
                <p style="font-size: 16px; margin-bottom: 25px; color: #4b5563;">
                    Hi there! Great news – your comprehensive marketing plan${businessName ? ` for <strong>${businessName}</strong>` : ''} is ready for download.
                </p>
                ${website ? `<p style="font-size:14px; color:#6b7280; margin-top:8px;">Website: <a href="${website}" style="color:#2563eb; text-decoration:none;">${website}</a></p>` : ''}

                <!-- Download Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${downloadUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        📄 Download Your Marketing Plan
                    </a>
                </div>

                <!-- Quick Preview -->
                <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">Quick Preview of Your Strategy</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #1f2937;">Target Market:</strong>
                        <p style="margin: 5px 0; color: #4b5563;">${onePagePlan.before.targetMarket.substring(0, 150)}...</p>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #1f2937;">Key Message:</strong>
                        <p style="margin: 5px 0; color: #4b5563;">${onePagePlan.before.message.substring(0, 150)}...</p>
                    </div>
                    
                    <div>
                        <strong style="color: #1f2937;">Recommended Channels:</strong>
                        <ul style="margin: 5px 0; color: #4b5563; padding-left: 20px;">
                            ${onePagePlan.before.media.slice(0, 3).map(channel => `<li>${channel}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Key Insights -->
                <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #15803d; margin: 0 0 15px; font-size: 18px;">Key Strategic Insights</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #166534;">
                        ${strategicInsights.strengths.slice(0, 3).map(strength => `<li style="margin-bottom: 8px;">${strength}</li>`).join('')}
                    </ul>
                </div>

                <!-- What's Included -->
                <div style="margin: 30px 0;">
                    <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">What's Included in Your Plan:</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ One-page visual marketing plan</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ Comprehensive implementation guide</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ Strategic insights and analysis</li>
                        <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">✅ Phased action plans (30/60/90 days)</li>
                        <li style="padding: 8px 0;">✅ KPIs and success metrics</li>
                    </ul>
                </div>

                <!-- Next Steps -->
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #92400e; margin: 0 0 15px; font-size: 18px;">Next Steps</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #92400e;">
                        <li style="margin-bottom: 8px;">Download and review your complete marketing plan</li>
                        <li style="margin-bottom: 8px;">Share it with your team for feedback and alignment</li>
                        <li style="margin-bottom: 8px;">Start with Phase 1 activities (first 30 days)</li>
                        <li>Schedule a follow-up to track your progress</li>
                    </ol>
                </div>

                <!-- Support -->
                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
                    <p style="margin: 0; color: #6b7280;">Need help implementing your plan?</p>
                    <a href="mailto:info@beamxsolutions.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">Contact our support team</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    This plan was generated using BeamX Luna's advanced reasoning capabilities
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © 2026 BeamX Solutions. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateCompletionEmailText(data: EmailTemplateData): string {
    const { businessName, website, generatedContent, downloadUrl } = data;
    const { onePagePlan, strategicInsights } = generatedContent;

    return `
🎉 Your Marketing Plan is Complete!

Hi there! Great news – your comprehensive marketing plan${businessName ? ` for ${businessName}` : ''} is ready for download.
${website ? `Website: ${website}\n\n` : ''}

Download Your Plan: ${downloadUrl}

QUICK PREVIEW:
Target Market: ${onePagePlan.before.targetMarket.substring(0, 150)}...
Key Message: ${onePagePlan.before.message.substring(0, 150)}...
Recommended Channels: ${onePagePlan.before.media.slice(0, 3).join(', ')}

KEY INSIGHTS:
${strategicInsights.strengths.slice(0, 3).map(strength => `• ${strength}`).join('\n')}

WHAT'S INCLUDED:
✅ One-page visual marketing plan
✅ Comprehensive implementation guide  
✅ Strategic insights and analysis
✅ Phased action plans (30/60/90 days)
✅ KPIs and success metrics

NEXT STEPS:
1. Download and review your complete marketing plan
2. Share it with your team for feedback and alignment
3. Start with Phase 1 activities (first 30 days)
4. Schedule a follow-up to track your progress

Need help? Contact us at info@beamxsolutions.com

© 2026 BeamX Luna - Powered by BeamX Solutions
    `;
  }

  private generateShareEmailHTML(data: EmailTemplateData, senderName: string, message?: string): string {
    const { businessName, website, downloadUrl } = data;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Marketing Plan Shared With You</title>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">BeamX Luna</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Shared Marketing Plan</p>
            </div>

            <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">📊 Marketing Plan Shared With You</h2>
                
                    <p style="font-size: 16px; margin-bottom: 25px; color: #4b5563;">
                    <strong>${senderName}</strong> has shared a marketing plan with you${businessName ? ` for <strong>${businessName}</strong>` : ''}.
                </p>
                ${website ? `<p style="font-size:14px; color:#6b7280; margin-top:8px;">Website: <a href="${website}" style="color:#2563eb; text-decoration:none;">${website}</a></p>` : ''}

                ${message ? `
                <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 16px;">Message from ${senderName}:</h3>
                    <p style="margin: 0; color: #4b5563; font-style: italic;">"${message}"</p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${downloadUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        📄 View Marketing Plan
                    </a>
                    <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0;">
                        No account required &mdash; click to view the full plan instantly.
                    </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0;">
                    This marketing plan was generated using BeamX Luna's advanced reasoning capabilities.
                </p>
            </div>

            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © 2026 BeamX Solutions. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateShareEmailText(data: EmailTemplateData, senderName: string, message?: string): string {
    const { businessName, website, downloadUrl } = data;

    return `
📊 Marketing Plan Shared With You

${senderName} has shared a marketing plan with you${businessName ? ` for ${businessName}` : ''}.
${website ? `Website: ${website}\n\n` : ''}

${message ? `Message from ${senderName}: "${message}"` : ''}

View Plan: ${downloadUrl}
(No account required - click to view instantly)

This marketing plan was generated using BeamX Luna's advanced reasoning capabilities.

© 2026 BeamX Solutions
    `;
  }

  private generateWelcomeEmailHTML(businessName?: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BeamX Luna</title>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #2563eb, #9333ea); color: white; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to BeamX Luna!</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">AI-Powered Marketing Plans</p>
            </div>

            <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">🎉 Welcome${businessName ? `, ${businessName}` : ''}!</h2>
                
                <p style="font-size: 16px; margin-bottom: 25px; color: #4b5563;">
                    Thank you for choosing BeamX Luna! You're about to experience the power of BeamX Luna for creating comprehensive marketing strategies.
                </p>

                <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">What happens next?</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                        <li style="margin-bottom: 8px;">Complete our intelligent questionnaire (15-20 minutes)</li>
                        <li style="margin-bottom: 8px;">BeamX Luna analyzes your responses and creates your strategy</li>
                        <li style="margin-bottom: 8px;">Receive your complete marketing plan via email</li>
                        <li>Download and start implementing immediately</li>
                    </ol>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://beamxsolutions.com/questionnaire" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        🚀 Start Creating Your Plan
                    </a>
                </div>

                <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 30px 0; border-radius: 6px;">
                    <h3 style="color: #15803d; margin: 0 0 15px; font-size: 18px;">Why BeamX Luna?</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #166534;">
                        <li style="margin-bottom: 8px;">Powered by BeamX Luna's superior reasoning</li>
                        <li style="margin-bottom: 8px;">Industry-specific recommendations</li>
                        <li style="margin-bottom: 8px;">Proven 9-square marketing framework</li>
                        <li>Actionable implementation guides</li>
                    </ul>
                </div>
            </div>

            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    Questions? Reply to this email or contact info@beamxsolutions.com
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © 2026 BeamX Solutions. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateWelcomeEmailText(businessName?: string): string {
    return `
Welcome to BeamX Luna!

Hi${businessName ? ` ${businessName}` : ''}!

Thank you for choosing BeamX Luna! You're about to experience the power of BeamX Luna for creating comprehensive marketing strategies.

WHAT HAPPENS NEXT:
1. Complete our intelligent questionnaire (15-20 minutes)
2. BeamX Luna analyzes your responses and creates your strategy
3. Receive your complete marketing plan via email
4. Download and start implementing immediately

WHY MARKETINGPLAN.AI?
• Powered by BeamX Luna's superior reasoning
• Industry-specific recommendations  
• Proven 9-square marketing framework
• Actionable implementation guides

Ready to get started? Visit: https://beamxsolutions.com/questionnaire

Questions? Contact us at info@beamxsolutions.com

© 2026 BeamX Solutions
    `;
  }
}

export const emailService = new EmailService();