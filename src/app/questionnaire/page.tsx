'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestionnaireStep from '@/components/questionnaire/QuestionnaireStep';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import InsufficientCreditsModal from '@/components/credits/InsufficientCreditsModal';
import {
  BUSINESS_CONTEXT_QUESTIONS,
  QUESTIONNAIRE_QUESTIONS,
  getQuestionsBySquare,
  MARKETING_SQUARES
} from '@/constants/questionnaire';
import { BusinessContext, QuestionnaireResponses, Question } from '@/types';
import { analytics } from '@/lib/analytics/analyticsService';

const QuestionnairePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSquare, setCurrentSquare] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [completedSquares, setCompletedSquares] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState({ required: 50, available: 0 });

  // Redirect if not authenticated and track questionnaire start
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.email) {
      // Track questionnaire start
      analytics.trackQuestionnaireStart(session.user.email, responses['industry']);
      analytics.identify(session.user.email, {
        business_name: session.user.name || 'Unknown'
      });
    }
  }, [status, router, session]);

  // Get all questions in order
  const allQuestions: Question[] = [
    ...BUSINESS_CONTEXT_QUESTIONS,
    ...QUESTIONNAIRE_QUESTIONS
  ];

  const currentQuestion = allQuestions[currentQuestionIndex];
  
  // Calculate current square based on question
  useEffect(() => {
    if (currentQuestion) {
      setCurrentSquare(currentQuestion.square);
    }
  }, [currentQuestion]);

  const handleResponseChange = (value: any) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Auto-save to localStorage
    const updatedResponses = { ...responses, [currentQuestion.id]: value };
    localStorage.setItem('questionnaire_responses', JSON.stringify(updatedResponses));
  };

  const handleNext = async () => {
    // Track progress
    if (session?.user?.email) {
      analytics.trackQuestionnaireProgress(
        currentQuestion.square,
        currentQuestionIndex,
        allQuestions.length,
        session.user.email
      );
    }

    // Mark current square as completed if we're moving to a different square
    const nextQuestion = allQuestions[currentQuestionIndex + 1];
    if (nextQuestion && nextQuestion.square !== currentQuestion.square) {
      setCompletedSquares(prev => {
        if (!prev.includes(currentQuestion.square)) {
          return [...prev, currentQuestion.square];
        }
        return prev;
      });
    }

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question - generate the marketing plan
      const completionTime = Date.now() - startTime;
      if (session?.user?.email) {
        analytics.trackQuestionnaireCompleted(
          session.user.email,
          completionTime,
          responses['industry'],
          responses['business-model']
        );
      }
      await generateMarketingPlan();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const generateMarketingPlan = async () => {
    setIsGenerating(true);
    const generationStartTime = Date.now();
    
    try {
      // Structure responses according to our types
      const businessContext: Partial<BusinessContext> = {
        industry: responses['industry'],
        businessModel: responses['business-model'],
        companySize: responses['company-size'],
        yearsInOperation: responses['years-in-operation'],
        geographicScope: responses['geographic-scope'],
        primaryChallenges: responses['primary-challenges'],
        marketingMaturity: responses['marketing-maturity'],
        marketingBudget: responses['marketing-budget'],
        timeAvailability: responses['time-availability'],
        businessGoals: responses['business-goals']
      };

      // Create plan record
      const planResponse = await fetch('/api/plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessContext,
          questionnaireResponses: responses
        })
      });

      if (!planResponse.ok) {
        throw new Error('Failed to create plan');
      }

      const plan = await planResponse.json();
      
      // Track plan generation started
      if (session?.user?.email) {
        analytics.trackPlanGenerationStarted(session.user.email, plan.id);
      }
      
      // Start the AI generation process
      const generateResponse = await fetch(`/api/plans/${plan.id}/generate`, {
        method: 'POST'
      });

      // Handle insufficient credits (HTTP 402)
      if (generateResponse.status === 402) {
        const errorData = await generateResponse.json();
        setCreditInfo({
          required: errorData.creditsRequired || 50,
          available: errorData.creditsAvailable || 0
        });
        setShowInsufficientCreditsModal(true);
        setIsGenerating(false);
        return;
      }

      if (!generateResponse.ok) {
        throw new Error('Failed to generate plan');
      }

      const generateResult = await generateResponse.json();
      const generationTime = Date.now() - generationStartTime;

      // Track plan generation completed
      if (session?.user?.email) {
        analytics.trackPlanGenerationCompleted(
          session.user.email, 
          plan.id, 
          generationTime
        );
      }

      // Redirect to the results page
      router.push(`/plan/${plan.id}`);
    } catch (error) {
      console.error('Error generating plan:', error);
      
      // Track plan generation failed
      if (session?.user?.email) {
        analytics.trackPlanGenerationFailed(
          session.user.email, 
          undefined, // plan ID might not be available
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
      
      alert('Failed to generate marketing plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load saved responses on mount
  useEffect(() => {
    const saved = localStorage.getItem('questionnaire_responses');
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved responses:', error);
      }
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generating Your Marketing Plan
          </h2>
          <p className="text-gray-600">
            Claude AI is analyzing your responses and creating your personalized marketing strategy...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar
        currentSquare={currentSquare}
        currentQuestion={currentQuestionIndex}
        totalQuestions={allQuestions.length}
        completedSquares={completedSquares}
      />

      <div className="py-8">
        <QuestionnaireStep
          question={currentQuestion}
          value={responses[currentQuestion?.id]}
          onChange={handleResponseChange}
          onNext={handleNext}
          onPrev={handlePrev}
          canGoNext={currentQuestionIndex < allQuestions.length - 1}
          canGoPrev={currentQuestionIndex > 0}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === allQuestions.length - 1}
        />
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg text-xs">
          <div>Question: {currentQuestionIndex + 1} / {allQuestions.length}</div>
          <div>Square: {currentSquare}</div>
          <div>ID: {currentQuestion?.id}</div>
        </div>
      )}

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        creditsRequired={creditInfo.required}
        creditsAvailable={creditInfo.available}
      />
    </div>
  );
};

export default QuestionnairePage;