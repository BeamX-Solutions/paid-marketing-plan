'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRequired: number;
  creditsAvailable: number;
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  creditsRequired,
  creditsAvailable
}: InsufficientCreditsModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const creditShortfall = creditsRequired - creditsAvailable;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Insufficient Credits
        </h2>

        <p className="text-gray-600 text-center mb-6">
          You need {creditsRequired} credits to generate this marketing plan, but you only have {creditsAvailable} credits available.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Required:</span>
            <span className="font-semibold text-gray-900">{creditsRequired} credits</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Available:</span>
            <span className="font-semibold text-gray-900">{creditsAvailable} credits</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Need:</span>
              <span className="font-bold text-orange-600">{creditShortfall} more credits</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-blue-900">Credit Package</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            100 credits for ₦100,000 • Generate 2 marketing plans • Valid for 12 months
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/dashboard')}
          >
            Purchase Credits
          </Button>
        </div>
      </div>
    </div>
  );
}
