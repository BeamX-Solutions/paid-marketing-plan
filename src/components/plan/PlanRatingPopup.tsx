'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PlanRatingPopupProps {
  planId: string;
  delayMs?: number;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent — ready to implement as-is',
  4: 'Great, but missed out on one aspect',
  3: 'Just okay',
  2: 'Result cannot be implemented',
  1: 'Completely off the mark',
};

const PlanRatingPopup: React.FC<PlanRatingPopupProps> = ({ planId, delayMs = 30000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const storageKey = `plan-rated-${planId}`;
    if (localStorage.getItem(storageKey)) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [planId, delayMs]);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          category: 'plan_rating',
          comment: comment.trim() || null,
          planId,
        }),
      });

      localStorage.setItem(`plan-rated-${planId}`, 'true');
      setIsSubmitted(true);
      setTimeout(() => setIsVisible(false), 2000);
    } catch {
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const displayRating = hoveredRating || selectedRating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Rate Your Plan</h2>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600 fill-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you!</h3>
              <p className="text-gray-600">Your feedback helps us improve.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6 text-center">How would you rate the generated result?</p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setSelectedRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= displayRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Label */}
              <p className="text-sm text-center text-gray-600 mb-6 h-5">
                {displayRating > 0 ? RATING_LABELS[displayRating] : ''}
              </p>

              {/* Optional Comment */}
              {selectedRating > 0 && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any additional feedback? (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                />
              )}

              <Button
                onClick={handleSubmit}
                disabled={selectedRating === 0 || isSubmitting}
                className="w-full"
                loading={isSubmitting}
              >
                Submit Rating
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanRatingPopup;
