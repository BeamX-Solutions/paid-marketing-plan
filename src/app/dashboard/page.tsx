'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CreditBalance, CreditTransaction } from '@/types';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'plans'>('overview');

  const paymentStatus = searchParams?.get('payment');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCreditData();
    }
  }, [session, paymentStatus]);

  const fetchCreditData = async () => {
    try {
      setLoading(true);

      const [balanceRes, transactionsRes, plansRes] = await Promise.all([
        fetch('/api/credits/balance'),
        fetch('/api/credits/transactions?limit=20'),
        fetch('/api/user/plans')
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (transactionsRes.ok) {
        const transData = await transactionsRes.json();
        setTransactions(transData.transactions);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.plans);
      }
    } catch (error) {
      console.error('Error fetching credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    try {
      setPurchaseLoading(true);

      const response = await fetch('/api/credits/checkout', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const lowCreditWarning = (balance?.totalCredits || 0) < 50;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">MarketingPlan.ai</h1>
              {session?.user && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <span className="text-sm">Welcome,</span>
                  <span className="font-semibold">{session.user.name || session.user.email}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/questionnaire')}>
                Create New Plan
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Home
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Payment Status Alerts */}
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Payment Successful!</h3>
              <p className="text-sm text-green-700">Your credits have been added to your account.</p>
            </div>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900">Payment Cancelled</h3>
              <p className="text-sm text-yellow-700">Your payment was cancelled. No charges were made.</p>
            </div>
          </div>
        )}

        {/* Low Credit Warning */}
        {lowCreditWarning && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-orange-900">Low Credit Balance</h3>
                <p className="text-sm text-orange-700">
                  You have {balance?.totalCredits} credits remaining. Purchase more to continue generating plans.
                </p>
              </div>
            </div>
            <Button onClick={handlePurchaseCredits} loading={purchaseLoading}>
              Buy Credits
            </Button>
          </div>
        )}

        {/* Credit Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Total Credits</h3>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">{balance?.totalCredits || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {Math.floor((balance?.totalCredits || 0) / 50)} plans available
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Active Purchases</h3>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {balance?.purchases.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Non-expired packages</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Next Expiration</h3>
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {balance?.expiringCredits && balance.expiringCredits.length > 0 ? (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {balance.expiringCredits[0].amount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Expires {formatDate(balance.expiringCredits[0].expiresAt)}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No expiring credits</p>
            )}
          </div>
        </div>

        {/* Purchase Credits Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Purchase More Credits</h2>
              <p className="text-blue-100 mb-4">
                100 credits for $100 • Generate 2 marketing plans • Credits valid for 12 months
              </p>
              <ul className="space-y-2 text-sm text-blue-50 mb-6">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete AI-powered marketing plans
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  One-page visual plan + implementation guide
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  PDF download and sharing
                </li>
              </ul>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={handlePurchaseCredits}
                loading={purchaseLoading}
              >
                {purchaseLoading ? 'Processing...' : 'Purchase 100 Credits - $100'}
              </Button>
            </div>
            <div className="hidden md:block ml-8">
              <svg className="w-32 h-32 text-blue-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Credit Overview
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'plans'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('plans')}
              >
                My Plans
              </button>
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Transaction History
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Credit Packages</h3>
                {balance?.purchases && balance.purchases.length > 0 ? (
                  <div className="space-y-4">
                    {balance.purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {purchase.creditsGranted} Credits Package
                          </h4>
                          <p className="text-sm text-gray-500">
                            Purchased {formatDate(purchase.purchaseDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {formatDate(purchase.expiresAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {purchase.creditsRemaining}
                          </p>
                          <p className="text-sm text-gray-500">credits left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 mb-4">No active credit packages</p>
                    <Button onClick={handlePurchaseCredits} loading={purchaseLoading}>
                      Purchase Your First Package
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'plans' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Marketing Plans</h3>
                {plans.length > 0 ? (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {plan.businessName}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(plan.createdAt)}
                              </span>
                              {plan.creditsCharged > 0 && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {plan.creditsCharged} credits
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                plan.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : plan.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {plan.status === 'completed' ? (
                              <Button
                                size="sm"
                                onClick={() => router.push(`/plan/${plan.id}`)}
                              >
                                View Plan
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                              >
                                {plan.status === 'failed' ? 'Failed' : 'Processing...'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No marketing plans yet</p>
                    <Button onClick={() => router.push('/questionnaire')}>
                      Create Your First Plan
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="border-b border-gray-100 pb-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description || transaction.transactionType}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.creditAmount > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.creditAmount > 0 ? '+' : ''}
                            {transaction.creditAmount}
                          </p>
                          <p className="text-sm text-gray-500">
                            Balance: {transaction.balanceAfter}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}