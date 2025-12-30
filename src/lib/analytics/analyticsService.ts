export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

export class AnalyticsService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Track page views
  trackPageView(url: string, title?: string, userId?: string) {
    this.track('page_view', {
      page_url: url,
      page_title: title || document.title,
      user_id: userId
    });
  }

  // Track questionnaire events
  trackQuestionnaireStart(userId?: string, industry?: string) {
    this.track('questionnaire_started', {
      user_id: userId,
      industry
    });
  }

  trackQuestionnaireProgress(
    userId?: string, 
    square: number, 
    questionIndex: number, 
    totalQuestions: number
  ) {
    const progress = Math.round((questionIndex / totalQuestions) * 100);
    
    this.track('questionnaire_progress', {
      user_id: userId,
      current_square: square,
      question_index: questionIndex,
      total_questions: totalQuestions,
      progress_percentage: progress
    });
  }

  trackQuestionnaireCompleted(
    userId?: string, 
    completionTime?: number,
    industry?: string,
    businessModel?: string
  ) {
    this.track('questionnaire_completed', {
      user_id: userId,
      completion_time_ms: completionTime,
      industry,
      business_model: businessModel
    });
  }

  trackQuestionnaireAbandoned(
    userId?: string, 
    square: number, 
    questionIndex: number,
    timeSpent?: number
  ) {
    this.track('questionnaire_abandoned', {
      user_id: userId,
      abandoned_at_square: square,
      abandoned_at_question: questionIndex,
      time_spent_ms: timeSpent
    });
  }

  // Track plan generation events
  trackPlanGenerationStarted(userId?: string, planId?: string) {
    this.track('plan_generation_started', {
      user_id: userId,
      plan_id: planId
    });
  }

  trackPlanGenerationCompleted(
    userId?: string, 
    planId?: string, 
    generationTime?: number
  ) {
    this.track('plan_generation_completed', {
      user_id: userId,
      plan_id: planId,
      generation_time_ms: generationTime
    });
  }

  trackPlanGenerationFailed(
    userId?: string, 
    planId?: string, 
    error?: string
  ) {
    this.track('plan_generation_failed', {
      user_id: userId,
      plan_id: planId,
      error_message: error
    });
  }

  // Track plan interaction events
  trackPlanViewed(userId?: string, planId?: string) {
    this.track('plan_viewed', {
      user_id: userId,
      plan_id: planId
    });
  }

  trackPlanDownloaded(userId?: string, planId?: string, format: string = 'pdf') {
    this.track('plan_downloaded', {
      user_id: userId,
      plan_id: planId,
      format
    });
  }

  trackPlanShared(
    userId?: string, 
    planId?: string, 
    method: 'email' | 'link' = 'email'
  ) {
    this.track('plan_shared', {
      user_id: userId,
      plan_id: planId,
      share_method: method
    });
  }

  // Track user engagement events
  trackUserSignup(userId: string, method: 'email' | 'google' | 'credentials') {
    this.track('user_signup', {
      user_id: userId,
      signup_method: method
    });
  }

  trackUserLogin(userId: string, method: 'email' | 'google' | 'credentials') {
    this.track('user_login', {
      user_id: userId,
      login_method: method
    });
  }

  trackFeatureUsed(
    feature: string, 
    userId?: string, 
    properties?: Record<string, any>
  ) {
    this.track('feature_used', {
      user_id: userId,
      feature_name: feature,
      ...properties
    });
  }

  // Track business metrics
  trackLeadGenerated(
    userId?: string, 
    source: string = 'website', 
    campaign?: string
  ) {
    this.track('lead_generated', {
      user_id: userId,
      source,
      campaign
    });
  }

  trackEmailOpened(userId?: string, emailType: string) {
    this.track('email_opened', {
      user_id: userId,
      email_type: emailType
    });
  }

  trackEmailClicked(userId?: string, emailType: string, linkUrl?: string) {
    this.track('email_clicked', {
      user_id: userId,
      email_type: emailType,
      link_url: linkUrl
    });
  }

  // Core tracking method
  private track(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event: eventName,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    // Send to Google Analytics if configured
    this.sendToGoogleAnalytics(eventName, properties);

    // Send to our internal API for storage
    this.sendToInternalAnalytics(event);

    // Log in development
    if (this.isDevelopment) {
      console.log('📊 Analytics Event:', event);
    }
  }

  private sendToGoogleAnalytics(eventName: string, properties: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag && this.gaId) {
      window.gtag('event', eventName, {
        ...properties,
        custom_map: {
          user_id: 'user_id',
          plan_id: 'custom_plan_id'
        }
      });
    }
  }

  private async sendToInternalAnalytics(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      if (this.isDevelopment) {
        console.warn('Failed to send analytics event:', error);
      }
    }
  }

  // Utility method to identify user
  identify(userId: string, traits: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.gaId, {
        user_id: userId,
        custom_map: traits
      });
    }
  }

  // Get or generate session ID
  getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Type declarations for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}