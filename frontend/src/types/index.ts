export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
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
  additionalInfo?: string;
  content: string;
  status: 'draft' | 'generating' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormData {
  businessName: string;
  industry: string;
  targetAudience: string;
  budget: number;
  timeframe: string;
  goals: string[];
  additionalInfo?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardData {
  totalPlans: number;
  completedPlans: number;
  recentActivity: Array<{
    id: string;
    event: string;
    properties: Record<string, unknown>;
    timestamp: string;
  }>;
  plansByStatus: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
}