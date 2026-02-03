'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    setResendStatus('sending');
    setResendMessage('');
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      if (response.ok) {
        setResendStatus('sent');
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        const data = await response.json();
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to send verification email.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Failed to send verification email. Please try again.');
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email or request a new verification link.');
      return;
    }

    // Verify email
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push('/auth/signin');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifying Your Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-8">
                Redirecting to sign in page...
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            {/* Resend verification email */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Enter your email to receive a new verification link:
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleResendVerification}
                  disabled={!resendEmail || resendStatus === 'sending'}
                  className="text-sm whitespace-nowrap"
                >
                  {resendStatus === 'sending' ? 'Sending...' : 'Resend'}
                </Button>
              </div>
              {resendStatus === 'sent' && (
                <p className="text-green-600 text-sm mt-2">{resendMessage}</p>
              )}
              {resendStatus === 'error' && (
                <p className="text-red-600 text-sm mt-2">{resendMessage}</p>
              )}
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Need help? Contact{' '}
                <a href="mailto:support@beamxsolutions.com" className="text-blue-600 hover:underline">
                  support@beamxsolutions.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
