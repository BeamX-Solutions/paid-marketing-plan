import Anthropic from '@anthropic-ai/sdk';
import { PlanGenerationRequest } from '../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AIService {
  static async generateMarketingPlan(request: PlanGenerationRequest): Promise<string> {
    try {
      // Check if API key is configured
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
        // Return a demo marketing plan when API key is not configured
        return this.generateDemoMarketingPlan(request);
      }

      const prompt = this.buildPrompt(request);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response format from AI service');
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate marketing plan');
    }
  }

  private static generateDemoMarketingPlan(request: PlanGenerationRequest): Promise<string> {
    const demoContent = `# Marketing Plan for ${request.businessName}

## Executive Summary

This comprehensive marketing plan has been developed for ${request.businessName}, operating in the ${request.industry} industry. With a budget of $${request.budget.toLocaleString()} over ${request.timeframe}, this plan aims to achieve the following key objectives: ${request.goals.join(', ')}.

## Market Analysis

### Industry Overview
The ${request.industry} industry presents significant opportunities for growth and customer acquisition. Current market trends show increasing demand for businesses that can deliver value to their target demographics.

### Target Audience Analysis
**Primary Target Audience:** ${request.targetAudience}

Key characteristics:
- Actively seeking solutions in the ${request.industry} space
- Decision-makers with budget authority
- Value-driven and results-oriented
- Prefer businesses that understand their specific needs

## Marketing Objectives

Based on your stated goals, we've prioritized the following objectives:

${request.goals.map((goal, index) => `${index + 1}. **${goal}**: Develop targeted campaigns and strategies to achieve this goal through multi-channel marketing approaches.`).join('\n')}

## Marketing Strategy & Tactics

### 1. Digital Marketing Foundation
- **Website Optimization**: Ensure your website converts visitors effectively
- **SEO Strategy**: Improve organic search visibility for relevant keywords
- **Content Marketing**: Create valuable content that addresses customer pain points

### 2. Lead Generation Strategy
- **Social Media Marketing**: Leverage platforms where your audience is most active
- **Email Marketing**: Nurture leads with valuable content and offers
- **Paid Advertising**: Strategic PPC campaigns on Google and social platforms

### 3. Brand Positioning
- Position ${request.businessName} as the go-to solution in ${request.industry}
- Emphasize unique value propositions that differentiate from competitors
- Build trust through social proof and testimonials

## Budget Breakdown

**Total Marketing Budget: $${request.budget.toLocaleString()} (${request.timeframe})**

- Digital Advertising: 40% ($${(request.budget * 0.4).toLocaleString()})
- Content Creation & SEO: 25% ($${(request.budget * 0.25).toLocaleString()})
- Social Media Marketing: 20% ($${(request.budget * 0.2).toLocaleString()})
- Email Marketing & Automation: 10% ($${(request.budget * 0.1).toLocaleString()})
- Analytics & Tools: 5% ($${(request.budget * 0.05).toLocaleString()})

## Implementation Timeline

### Phase 1: Foundation (First 30 days)
- Set up analytics and tracking
- Optimize website for conversions
- Establish social media presence
- Begin content creation

### Phase 2: Growth (Days 31-60)
- Launch paid advertising campaigns
- Implement email marketing sequences
- Increase content publication frequency
- Begin influencer outreach

### Phase 3: Scale (Days 61+)
- Optimize campaigns based on data
- Expand to additional channels
- Implement advanced automation
- Scale successful initiatives

## Key Performance Indicators (KPIs)

**Primary Metrics:**
- Lead Generation: Target 20% increase month-over-month
- Conversion Rate: Aim for 3-5% website conversion rate
- Cost Per Acquisition: Optimize to stay within 20% of customer lifetime value
- Brand Awareness: Track social mentions and search volume

**Secondary Metrics:**
- Website Traffic: Target 30% increase in organic traffic
- Email Open Rates: Maintain above 25% open rate
- Social Engagement: Achieve 5% average engagement rate
- Customer Retention: Focus on building long-term relationships

## Risk Assessment

**Potential Challenges:**
1. **Budget Constraints**: Monitor spending carefully to maximize ROI
2. **Market Competition**: Stay agile and responsive to competitive moves
3. **Economic Factors**: Have contingency plans for budget adjustments
4. **Technology Changes**: Keep up with platform updates and algorithm changes

**Mitigation Strategies:**
- Diversify marketing channels to reduce dependency
- Maintain flexible budget allocation
- Regular performance reviews and strategy adjustments
- Stay informed about industry trends and best practices

## Next Steps

1. **Immediate Actions (Week 1)**:
   - Set up analytics and tracking systems
   - Audit current marketing materials
   - Define brand messaging and positioning

2. **Short-term Goals (Month 1)**:
   - Launch initial campaigns
   - Begin content creation schedule
   - Establish measurement frameworks

3. **Long-term Objectives (3-6 months)**:
   - Scale successful campaigns
   - Expand market reach
   - Develop customer loyalty programs

${request.additionalInfo ? `\n## Additional Considerations\n\n${request.additionalInfo}` : ''}

---

**Note:** This is a demo marketing plan generated automatically. To get AI-powered personalized recommendations, please add your Anthropic API key to the backend environment variables.

*Generated on ${new Date().toLocaleDateString()} for ${request.businessName}*`;

    return Promise.resolve(demoContent);
  }

  private static buildPrompt(request: PlanGenerationRequest): string {
    return `Create a comprehensive marketing plan for the following business:

Business Name: ${request.businessName}
Industry: ${request.industry}
Target Audience: ${request.targetAudience}
Budget: $${request.budget}
Timeframe: ${request.timeframe}
Goals: ${request.goals.join(', ')}
${request.additionalInfo ? `Additional Information: ${request.additionalInfo}` : ''}

Please provide a detailed marketing plan that includes:

1. Executive Summary
2. Market Analysis
3. Target Audience Profile
4. Marketing Objectives
5. Marketing Strategy & Tactics
6. Budget Breakdown
7. Timeline & Milestones
8. Measurement & KPIs
9. Risk Assessment
10. Implementation Plan

Format the response in clear, professional markdown with appropriate headers and bullet points. Make it actionable and specific to the provided business information.`;
  }
}