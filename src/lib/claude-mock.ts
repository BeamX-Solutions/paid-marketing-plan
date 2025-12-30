import { BusinessContext, QuestionnaireResponses, ClaudeAnalysis, GeneratedContent } from '@/types';

export class MockClaudeService {
  async analyzeBusinessResponses(
    businessContext: BusinessContext,
    responses: QuestionnaireResponses
  ): Promise<ClaudeAnalysis> {
    // Mock analysis data
    await this.simulateDelay();

    return {
      businessModelAssessment: "Strong foundation with proven demand in target market. Current business model shows scalability potential with room for optimization in customer acquisition costs.",
      marketOpportunity: "Market size estimated at $50M+ with 15% annual growth. Digital transformation trends creating new opportunities for innovative solutions.",
      competitivePositioning: "Positioned well against direct competitors with unique value proposition. Key differentiation lies in customer service and specialized expertise.",
      customerAvatarRefinement: "Primary customer: Mid-market businesses (50-200 employees) with annual revenue $5M-$25M, seeking efficiency improvements and digital transformation.",
      strategicRecommendations: [
        "Focus on content marketing to establish thought leadership",
        "Implement referral program to leverage existing customer satisfaction",
        "Develop partnership channel for expanded market reach",
        "Optimize pricing strategy for value-based positioning"
      ],
      riskFactors: [
        "Market saturation in primary segment",
        "Seasonal demand fluctuations",
        "Dependency on key customer accounts"
      ],
      growthPotential: "High growth potential with 3x revenue scalability possible within 18 months through systematic marketing execution."
    };
  }

  async generateMarketingPlan(
    businessContext: BusinessContext,
    responses: QuestionnaireResponses,
    analysis: ClaudeAnalysis
  ): Promise<GeneratedContent> {
    await this.simulateDelay();

    return {
      onePagePlan: {
        before: {
          targetMarket: "Mid-market businesses (50-200 employees) struggling with operational efficiency, led by forward-thinking executives who value ROI-driven solutions and are actively seeking digital transformation partners.",
          message: "We help growing businesses achieve 30% operational efficiency gains through proven systems and personalized guidance, so you can focus on strategic growth instead of daily firefighting.",
          media: [
            "LinkedIn thought leadership content targeting business executives",
            "Industry-specific webinars and educational content",
            "Strategic partnerships with complementary service providers"
          ]
        },
        during: {
          leadCapture: "Free 'Efficiency Assessment' tool with personalized report delivered via email, requiring contact information and brief business details for customized insights.",
          leadNurture: "5-part email series sharing case studies, industry insights, and actionable tips, followed by invitation to exclusive 'Growth Strategy' consultation call.",
          salesConversion: "Consultative sales process with discovery call, custom proposal presentation, and clear next steps with defined ROI projections and implementation timeline."
        },
        after: {
          deliverExperience: "Structured onboarding process with dedicated success manager, clear milestones, regular check-ins, and proactive communication about progress and results.",
          lifetimeValue: "Quarterly business reviews, expansion opportunity identification, additional service offerings, and continuous optimization based on performance metrics.",
          referrals: "Systematic referral program with client success celebrations, testimonial capture, referral rewards, and partnership development with satisfied clients."
        }
      },
      implementationGuide: {
        executiveSummary: "This marketing strategy focuses on establishing your business as the go-to solution for operational efficiency in the mid-market segment. By leveraging content marketing, strategic partnerships, and a consultative sales approach, we project 150% lead generation increase within 90 days and 40% revenue growth within 12 months. The strategy emphasizes building trust through education, demonstrating value through free assessments, and maintaining relationships for long-term growth.",
        actionPlans: {
          phase1: "Days 1-30: Set up LinkedIn business profile optimization, create efficiency assessment tool, develop 5-email nurture sequence, establish tracking systems, and launch first educational webinar. Begin partnership outreach to 10 potential strategic partners.",
          phase2: "Days 31-90: Launch content marketing campaign with 2 posts per week, host monthly webinars, implement referral program structure, optimize conversion funnel based on data, and close first 3 strategic partnerships. Begin scaling successful initiatives.",
          phase3: "Days 91-180: Scale content production to daily posts, launch advanced lead magnets, expand partnership network to 20+ active relationships, implement marketing automation sequences, and develop customer success program for retention and expansion."
        },
        timeline: "Month 1: Foundation building and content creation. Month 2-3: Launch and optimize campaigns. Month 4-6: Scale successful tactics and expand reach. Month 6+: Systematic growth and continuous optimization.",
        resources: "Required investment: $5,000-$8,000 monthly for tools, content creation, and advertising. Team needs: 1 marketing coordinator (part-time initially), content creation tools, CRM system, and webinar platform.",
        kpis: "Track: Website traffic (25% monthly increase), lead generation (100+ qualified leads monthly), conversion rate (15%+ lead-to-customer), customer acquisition cost (<$500), lifetime value ($5,000+), and referral rate (20%+ of new customers).",
        templates: "Email templates for nurture sequences, social media content calendar, webinar presentation framework, sales conversation scripts, customer success playbook, and referral program materials."
      },
      strategicInsights: {
        strengths: [
          "Proven track record with existing customer base",
          "Clear value proposition with measurable ROI",
          "Strong industry expertise and credibility",
          "Personal relationships enabling trust-building"
        ],
        opportunities: [
          "Growing demand for efficiency solutions post-pandemic",
          "Underutilized digital marketing channels in target market",
          "Partnership opportunities with complementary providers",
          "Content marketing potential for thought leadership"
        ],
        positioning: "Position as the 'Efficiency Partner' for growing businesses - not just a vendor, but a strategic partner invested in client success with proven methodologies and measurable results.",
        competitiveAdvantage: "Combination of personal attention, proven methodologies, industry expertise, and commitment to measurable results sets you apart from larger, less personal competitors and smaller, less systematic providers.",
        growthPotential: "Conservative projection: 40% revenue growth year 1, 100% growth year 2. Aggressive scenario with full implementation: 75% growth year 1, 200% growth year 2.",
        risks: [
          "Market education required - mitigation: content marketing and case studies",
          "Longer sales cycles - mitigation: nurture sequences and value demonstration",
          "Competition from larger players - mitigation: personalization and niche focus"
        ],
        investments: [
          "Content marketing system and tools - $200/month",
          "CRM and marketing automation - $300/month",
          "Webinar platform and tools - $150/month",
          "Partnership development time - 10 hours/month",
          "Content creation - 20 hours/month or $1,500 outsourced"
        ],
        roi: "Expected 4:1 ROI within 6 months, 8:1 ROI within 12 months. Break-even on marketing investment typically occurs within 60-90 days of consistent implementation."
      }
    };
  }

  async generateSquareSpecificContent(
    square: number,
    businessContext: BusinessContext,
    responses: QuestionnaireResponses,
    existingAnalysis?: ClaudeAnalysis
  ): Promise<any> {
    await this.simulateDelay();

    const mockContent: Record<number, any> = {
      1: { targetMarket: "Detailed target market analysis", customerAvatar: "Primary customer profile" },
      2: { valueProposition: "Compelling value prop", messaging: "Key messages" },
      3: { channels: ["LinkedIn", "Content Marketing", "Partnerships"], strategy: "Channel strategy" },
      4: { leadMagnet: "Free assessment tool", captureStrategy: "Lead capture approach" },
      5: { nurtureSequence: "Email series", contentStrategy: "Nurture approach" },
      6: { salesProcess: "Consultative approach", conversionTactics: "Key conversion methods" },
      7: { deliveryStrategy: "Customer onboarding", experienceDesign: "Service delivery" },
      8: { retentionStrategy: "Customer success", growthTactics: "Expansion approaches" },
      9: { referralSystem: "Systematic referrals", advocacyProgram: "Customer advocacy" }
    };

    return mockContent[square] || { content: `Mock content for square ${square}` };
  }

  async validateAndRefineResponses(
    responses: Partial<QuestionnaireResponses>
  ): Promise<{ suggestions: string[]; completionScore: number }> {
    await this.simulateDelay();

    return {
      suggestions: [
        "Consider providing more specific details about your target customer demographics",
        "Clarify your unique value proposition compared to competitors",
        "Add more detail about your current marketing challenges"
      ],
      completionScore: 85
    };
  }

  private async simulateDelay(): Promise<void> {
    // Simulate API call delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  }
}