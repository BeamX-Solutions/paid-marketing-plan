'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { X, Mail, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics/analyticsService';
import { useSession } from 'next-auth/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  businessName?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  planId,
  businessName
}) => {
  const { data: session } = useSession();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!recipientEmail.trim()) {
      setError('Please enter a recipient email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'share',
          recipientEmail: recipientEmail.trim(),
          message: message.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share plan');
      }

      // Track plan share
      if (session?.user?.email) {
        analytics.trackPlanShared(planId, 'email', session.user.email);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setRecipientEmail('');
        setMessage('');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCompletion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_completion'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend email');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Share Marketing Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Email Sent Successfully!
              </h3>
              <p className="text-green-700">
                The marketing plan has been shared via email.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Share with Others */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Share with Others
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi! I wanted to share our marketing plan with you for review..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleShare}
                    loading={isLoading}
                    className="w-full"
                    disabled={!recipientEmail.trim()}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Share Plan via Email
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Resend to Self */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resend to Yourself
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Didn't receive the original email? Click below to resend the completion email to your inbox.
                </p>
                
                <Button
                  variant="outline"
                  onClick={handleResendCompletion}
                  loading={isLoading}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Completion Email
                </Button>
              </div>

              {/* Plan Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Plan Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {businessName && (
                    <p><span className="font-medium">Business:</span> {businessName}</p>
                  )}
                  <p><span className="font-medium">Plan ID:</span> {planId.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;