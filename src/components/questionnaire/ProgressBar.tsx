'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MARKETING_SQUARES } from '@/constants/questionnaire';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentSquare: number;
  currentQuestion: number;
  totalQuestions: number;
  completedSquares: number[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentSquare,
  currentQuestion,
  totalQuestions,
  completedSquares
}) => {
  const router = useRouter();
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleReturnToDashboard = () => {
    // Confirm before leaving if user has made progress
    if (currentQuestion > 0) {
      const confirmed = window.confirm(
        'Are you sure you want to return to the dashboard? Your progress will be saved and you can continue later.'
      );
      if (confirmed) {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header with Return Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Marketing Plan Questionnaire</h1>
          </div>
          <button
            onClick={handleReturnToDashboard}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            title="Return to Dashboard"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">Return to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Marketing Squares Progress */}
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {MARKETING_SQUARES.map((square) => (
            <div
              key={square.id}
              className={cn(
                'text-center p-2 rounded-lg text-xs transition-all duration-200',
                {
                  'bg-green-100 text-green-800 border-2 border-green-300': completedSquares.includes(square.id),
                  'bg-blue-100 text-blue-800 border-2 border-blue-300': currentSquare === square.id,
                  'bg-gray-100 text-gray-600 border border-gray-200': 
                    !completedSquares.includes(square.id) && currentSquare !== square.id
                }
              )}
            >
              <div className="font-semibold mb-1">{square.id}</div>
              <div className="hidden md:block leading-tight">{square.title}</div>
            </div>
          ))}
        </div>

        {/* Current Square Info */}
        {currentSquare > 0 && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Current Section</div>
            <div className="font-semibold text-gray-900">
              Square {currentSquare}: {MARKETING_SQUARES.find(s => s.id === currentSquare)?.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {MARKETING_SQUARES.find(s => s.id === currentSquare)?.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;