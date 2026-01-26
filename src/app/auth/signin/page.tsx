'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Show specific error messages from the auth system
        setNeedsVerification(false);
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please try again.');
        } else if (result.error.includes('verify your email')) {
          setError('Please verify your email address before signing in.');
          setNeedsVerification(true);
        } else if (result.error.includes('suspended') || result.error.includes('deactivated')) {
          setError('Your account has been suspended or deactivated. Please contact support.');
        } else if (result.error.includes('Google')) {
          setError('This account uses Google sign-in. Please sign in with Google.');
        } else {
          setError(result.error || 'Invalid credentials. Please try again.');
        }
      } else {
        // Check if user has a session
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setSendingVerification(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationSent(true);
        setError('');
      } else {
        setError(data.error || 'Failed to send verification email.');
      }
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
            <Image
              src="/logo.png"
              alt="BeamX Solutions"
              width={180}
              height={45}
              className="h-12 w-auto mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-[#0F5AE0] hover:text-[#0C48B3] mb-6 transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue creating your marketing plan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-[#0F5AE0] hover:text-[#0C48B3] font-medium transition-colors duration-300 cursor-pointer">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {verificationSent && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">Verification email sent! Please check your inbox and click the verification link.</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
                {needsVerification && !verificationSent && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={sendingVerification}
                    className="mt-2 text-sm text-[#0F5AE0] hover:text-[#0C48B3] font-medium underline cursor-pointer disabled:opacity-50"
                  >
                    {sendingVerification ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-[#0F5AE0] hover:bg-[#0C48B3] text-white rounded-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#0F5AE0] hover:text-[#0C48B3] font-medium transition-colors duration-300 cursor-pointer">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
