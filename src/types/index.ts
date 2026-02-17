export interface User {
  id: string;
  email: string;
  businessName?: string;
  website?: string;
  industry?: string;
  profileData?: Record<string, any>;
  subscriptionStatus: string;
  marketingConsent: boolean;
}

export interface BusinessContext {
  industry: string;
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace';
  businessName?: string;
  website?: string;
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
    demographics: Record<string, any>;
    psychographics: Record<string, any>;
    painPoints: string[];
    customerSources: string[];
    buyingBehavior: Record<string, any>;
    decisionProcess: Record<string, any>;
    budgetConstraints: Record<string, any>;
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
    currentChannels: Record<string, any>;
    digitalPreferences: Record<string, any>;
    traditionalMarketing: Record<string, any>;
    contentCreation: Record<string, any>;
    socialMedia: Record<string, any>;
    paidAdvertising: Record<string, any>;
    publicRelations: Record<string, any>;
    partnerships: Record<string, any>;
    eventMarketing: Record<string, any>;
  };
  
  // Square 4: Lead Capture
  leadCapture: {
    currentMethods: Record<string, any>;
    websiteOptimization: Record<string, any>;
    leadMagnets: Record<string, any>;
    contactCollection: Record<string, any>;
    landingPages: Record<string, any>;
    callToActions: Record<string, any>;
    formOptimization: Record<string, any>;
    leadQuality: Record<string, any>;
    tracking: Record<string, any>;
  };
  
  // Square 5: Lead Nurturing
  leadNurturing: {
    followUpProcesses: Record<string, any>;
    emailMarketing: Record<string, any>;
    crmUsage: Record<string, any>;
    contentMarketing: Record<string, any>;
    education: Record<string, any>;
    relationshipBuilding: Record<string, any>;
    personalization: Record<string, any>;
    automation: Record<string, any>;
    community: Record<string, any>;
  };
  
  // Square 6: Sales Conversion
  salesConversion: {
    salesProcess: Record<string, any>;
    salesCycle: Record<string, any>;
    decisionMakers: Record<string, any>;
    commonObjections: string[];
    pricingStrategy: Record<string, any>;
    proposals: Record<string, any>;
    contracts: Record<string, any>;
    salesTeam: Record<string, any>;
    metrics: Record<string, any>;
  };
  
  // Square 7: Customer Experience
  customerExperience: {
    deliveryMethod: Record<string, any>;
    qualityAssurance: Record<string, any>;
    onboarding: Record<string, any>;
    support: Record<string, any>;
    feedbackCollection: Record<string, any>;
    problemResolution: Record<string, any>;
    successMetrics: Record<string, any>;
    optimization: Record<string, any>;
    training: Record<string, any>;
  };
  
  // Square 8: Lifetime Value
  lifetimeValue: {
    retention: Record<string, any>;
    upselling: Record<string, any>;
    subscriptionModel: Record<string, any>;
    loyaltyPrograms: Record<string, any>;
    pricingOptimization: Record<string, any>;
    expansion: Record<string, any>;
    journeyOptimization: Record<string, any>;
    renewals: Record<string, any>;
    revenueOptimization: Record<string, any>;
  };
  
  // Square 9: Referral System
  referralSystem: {
    currentSources: Record<string, any>;
    advocacyPrograms: Record<string, any>;
    incentives: Record<string, any>;
    partnerships: Record<string, any>;
    wordOfMouth: Record<string, any>;
    successStories: Record<string, any>;
    communityBuilding: Record<string, any>;
    influencers: Record<string, any>;
    socialProof: Record<string, any>;
  };
}

export interface ClaudeAnalysis {
  businessModelAssessment: Record<string, any>;
  marketOpportunity: Record<string, any>;
  competitivePositioning: Record<string, any>;
  customerAvatarRefinement: Record<string, any>;
  strategicRecommendations: string[];
  riskFactors: string[];
  growthPotential: Record<string, any>;
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
    actionPlans: Record<string, any>;
    timeline: Record<string, any>;
    resources: Record<string, any>;
    kpis: Record<string, any>;
    templates: Record<string, any>;
  };
  strategicInsights: {
    strengths: string[];
    opportunities: string[];
    positioning: string;
    competitiveAdvantage: string;
    growthPotential: string;
    risks: string[];
    investments: string[];
    roi: Record<string, any>;
  };
}

export interface Plan {
  id: string;
  userId: string;
  businessContext: BusinessContext;
  questionnaireResponses: QuestionnaireResponses;
  claudeAnalysis?: ClaudeAnalysis;
  generatedContent?: GeneratedContent;
  planMetadata?: Record<string, any>;
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
  promptData: Record<string, any>;
  claudeResponse: Record<string, any>;
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
  maxSelections?: number;
  validation?: Record<string, any>;
  conditional?: {
    field: string;
    operator: 'equals' | 'includes' | 'greater_than' | 'less_than';
    value: any;
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
  metadata?: Record<string, any>;
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