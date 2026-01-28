'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, User, Mail, Calendar, TrendingUp } from 'lucide-react';

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  email: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    businessName: string;
  } | null;
}

interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: { rating: number; _count: { rating: number } }[];
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFeedback();
    }
  }, [session, filterStatus, filterRating]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRating !== 'all') params.append('rating', filterRating);

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      plan_quality: 'bg-purple-100 text-purple-800',
      usability: 'bg-green-100 text-green-800',
      features: 'bg-orange-100 text-orange-800',
      support: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-[#0F5AE0] hover:text-[#0C48B3] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Feedback</h1>
          <p className="text-gray-600">View and analyze user feedback and ratings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
              {renderStars(Math.round(stats.averageRating))}
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</span>
              </div>
              <p className="text-sm text-gray-600">Total Feedback</p>
            </div>

            {stats.ratingDistribution.map((dist) => {
              if (dist.rating === 5) {
                return (
                  <div key={dist.rating} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900">{dist._count.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">5-Star Ratings</p>
                  </div>
                );
              }
              return null;
            })}

            {stats.ratingDistribution.filter((d) => d.rating <= 2).reduce((acc, d) => acc + d._count.rating, 0) > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-8 h-8 text-red-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.ratingDistribution.filter((d) => d.rating <= 2).reduce((acc, d) => acc + d._count.rating, 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Low Ratings (1-2)</p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No feedback yet</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {renderStars(item.rating)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {item.status}
                      </span>
                    </div>

                    {item.comment && (
                      <p className="text-gray-700 mb-4">{item.comment}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {item.user ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{item.user.businessName || `${item.user.firstName} ${item.user.lastName}` || item.user.email}</span>
                        </div>
                      ) : item.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{item.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Anonymous</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
