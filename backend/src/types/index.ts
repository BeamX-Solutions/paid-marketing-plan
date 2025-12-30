export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingPlan {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  targetAudience: string;
  budget: number;
  timeframe: string;
  goals: string[];
  content: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanGenerationRequest {
  businessName: string;
  industry: string;
  targetAudience: string;
  budget: number;
  timeframe: string;
  goals: string[];
  additionalInfo?: string;
}

export interface AuthRequest extends Express.Request {
  userId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}