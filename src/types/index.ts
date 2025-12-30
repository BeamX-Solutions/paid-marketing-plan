export interface User {
  id: string;
  email: string;
  businessName?: string;
  industry?: string;
  profileData?: Record<string, unknown>;
  subscriptionStatus: string;
  marketingConsent: boolean;
}

export interface BusinessContext {
  industry: string;
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace';
  companySize: string;
  yearsInOperation: string;
  geographicScope: string;
  primaryChallenges: string[];
  marketingMaturity: 'beginner' | 'intermediate' | 'advanced';
  marketingBudget: string;
  timeAvailability: string;
  businessGoals: string[];
}

export interface QuestionnaireResponses {
  // Square 1: Target Market
  targetMarket: {
    demographics: Record<string, unknown>;
    psychographics: Record<string, unknown>;
    painPoints: string[];
    customerSources: string[];
    buyingBehavior: Record<string, unknown>;
    decisionProcess: Record<string, unknown>;
    budgetConstraints: Record<string, unknown>;
    communicationChannels: string[];
    testimonials: string[];
  };
  
  // Square 2: Value Proposition
  valueProposition: {
    coreProblem: string;
    uniqueAdvantages: string[];
    tangibleBenefits: string[];
    emotionalBenefits: string[];
    proofPoints: string[];
    brandPersonality: string[];
    keyMessages: string[];
    differentiation: string[];
    successStories: string[];
  };
  
  // Square 3: Media Channels
  mediaChannels: {
    currentChannels: Record<string, unknown>;
    digitalPreferences: Record<string, unknown>;
    traditionalMarketing: Record<string, unknown>;
    contentCreation: Record<string, unknown>;
    socialMedia: Record<string, unknown>;
    paidAdvertising: Record<string, unknown>;
    publicRelations: Record<string, unknown>;
    partnerships: Record<string, unknown>;
    eventMarketing: Record<string, unknown>;
  };
  
  // Square 4: Lead Capture
  leadCapture: {
    currentMethods: Record<string, unknown>;
    websiteOptimization: Record<string, unknown>;
    leadMagnets: Record<string, unknown>;
    contactCollection: Record<string, unknown>;
    landingPages: Record<string, unknown>;
    callToActions: Record<string, unknown>;
    formOptimization: Record<string, unknown>;
    leadQuality: Record<string, unknown>;
    tracking: Record<string, unknown>;
  };
  
  // Square 5: Lead Nurturing
  leadNurturing: {
    followUpProcesses: Record<string, unknown>;
    emailMarketing: Record<string, unknown>;
    crmUsage: Record<string, unknown>;
    contentMarketing: Record<string, unknown>;
    education: Record<string, unknown>;
    relationshipBuilding: Record<string, unknown>;
    personalization: Record<string, unknown>;
    automation: Record<string, unknown>;
    community: Record<string, unknown>;
  };
  
  // Square 6: Sales Conversion
  salesConversion: {
    salesProcess: Record<string, unknown>;
    salesCycle: Record<string, unknown>;
    decisionMakers: Record<string, unknown>;
    commonObjections: string[];
    pricingStrategy: Record<string, unknown>;
    proposals: Record<string, unknown>;
    contracts: Record<string, unknown>;
    salesTeam: Record<string, unknown>;
    metrics: Record<string, unknown>;
  };
  
  // Square 7: Customer Experience
  customerExperience: {
    deliveryMethod: Record<string, unknown>;
    qualityAssurance: Record<string, unknown>;
    onboarding: Record<string, unknown>;
    support: Record<string, unknown>;
    feedbackCollection: Record<string, unknown>;
    problemResolution: Record<string, unknown>;
    successMetrics: Record<string, unknown>;
    optimization: Record<string, unknown>;
    training: Record<string, unknown>;
  };
  
  // Square 8: Lifetime Value
  lifetimeValue: {
    retention: Record<string, unknown>;
    upselling: Record<string, unknown>;
    subscriptionModel: Record<string, unknown>;
    loyaltyPrograms: Record<string, unknown>;
    pricingOptimization: Record<string, unknown>;
    expansion: Record<string, unknown>;
    journeyOptimization: Record<string, unknown>;
    renewals: Record<string, unknown>;
    revenueOptimization: Record<string, unknown>;
  };
  
  // Square 9: Referral System
  referralSystem: {
    currentSources: Record<string, unknown>;
    advocacyPrograms: Record<string, unknown>;
    incentives: Record<string, unknown>;
    partnerships: Record<string, unknown>;
    wordOfMouth: Record<string, unknown>;
    successStories: Record<string, unknown>;
    communityBuilding: Record<string, unknown>;
    influencers: Record<string, unknown>;
    socialProof: Record<string, unknown>;
  };
}

export interface ClaudeAnalysis {
  businessModelAssessment: Record<string, unknown>;
  marketOpportunity: Record<string, unknown>;
  competitivePositioning: Record<string, unknown>;
  customerAvatarRefinement: Record<string, unknown>;
  strategicRecommendations: string[];
  riskFactors: string[];
  growthPotential: Record<string, unknown>;
}

export interface GeneratedContent {
  onePagePlan: {
    before: {
      targetMarket: string;
      message: string;
      media: string[];
    };
    during: {
      leadCapture: string;
      leadNurture: string;
      salesConversion: string;
    };
    after: {
      deliverExperience: string;
      lifetimeValue: string;
      referrals: string;
    };
  };
  implementationGuide: {
    executiveSummary: string;
    actionPlans: Record<string, unknown>;
    timeline: Record<string, unknown>;
    resources: Record<string, unknown>;
    kpis: Record<string, unknown>;
    templates: Record<string, unknown>;
  };
  strategicInsights: {
    strengths: string[];
    opportunities: string[];
    positioning: string;
    competitiveAdvantage: string;
    growthPotential: string;
    risks: string[];
    investments: string[];
    roi: Record<string, unknown>;
  };
}

export interface Plan {
  id: string;
  userId: string;
  businessContext: BusinessContext;
  questionnaireResponses: QuestionnaireResponses;
  claudeAnalysis?: ClaudeAnalysis;
  generatedContent?: GeneratedContent;
  planMetadata?: Record<string, unknown>;
  status: 'in_progress' | 'analyzing' | 'generating' | 'completed' | 'failed';
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ClaudeInteraction {
  id: string;
  planId: string;
  interactionType: string;
  promptData: Record<string, unknown>;
  claudeResponse: Record<string, unknown>;
  tokensUsed?: number;
  processingTimeMs?: number;
  createdAt: string;
}

export interface Industry {
  id: string;
  name: string;
  description: string;
  commonChallenges: string[];
  keyMetrics: string[];
  marketingChannels: string[];
}

export interface Question {
  id: string;
  square: number;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'range';
  options?: string[];
  required: boolean;
  helpText?: string;
  placeholder?: string;
  validation?: Record<string, unknown>;
  conditional?: {
    field: string;
    operator: 'equals' | 'includes' | 'greater_than' | 'less_than';
    value: unknown;
  };
}

export interface CreditPurchase {
  id: string;
  userId: string;
  creditsGranted: number;
  creditsRemaining: number;
  amountPaid: number;
  currency: string;
  purchaseDate: string;
  expiresAt: string;
  stripeSessionId?: string;
  stripePaymentId?: string;
  status: 'active' | 'expired' | 'refunded';
}

export interface CreditTransaction {
  id: string;
  userId: string;
  planId?: string;
  purchaseId: string;
  creditAmount: number;
  transactionType: 'plan_generation' | 'refund' | 'manual_adjustment';
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreditBalance {
  totalCredits: number;
  expiringCredits: {
    amount: number;
    expiresAt: string;
  }[];
  purchases: CreditPurchase[];
}

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}