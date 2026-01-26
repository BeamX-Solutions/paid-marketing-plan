'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, CreditCard, TrendingUp } from 'lucide-react';

type DateFilter = 'day' | 'month' | 'year' | 'custom' | 'all-time';

interface DashboardData {
  allTime: {
    totalUsers: number;
    activeUsers: number;
    totalPlans: number;
    completedPlans: number;
    totalRevenue: number;
    totalCreditsUsed: number;
    totalCreditsGranted: number;
  };
  filtered: {
    totalUsers: number;
    activeUsers: number;
    totalPlans: number;
    completedPlans: number;
    totalRevenue: number;
    totalCreditsUsed: number;
    totalCreditsGranted: number;
  };
}

export default function AdminDashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, country, industry, customStartDate, customEndDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('dateFilter', dateFilter);
      if (country) params.append('country', country);
      if (industry) params.append('industry', industry);
      if (dateFilter === 'custom' && customStartDate) params.append('startDate', customStartDate);
      if (dateFilter === 'custom' && customEndDate) params.append('endDate', customEndDate);

      const response = await fetch(`/api/admin/dashboard?${params.toString()}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'day':
        return 'Today';
      case 'month':
        return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return new Date().getFullYear().toString();
      case 'custom':
        return 'Custom Range';
      case 'all-time':
        return 'All Time';
      default:
        return '';
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Platform overview and metrics</p>
          </div>

          {/* All Time Metrics - Big Picture First */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Time Overview</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={`₦${data.allTime.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                icon={<span className="w-6 h-6 text-green-600 font-bold text-lg">₦</span>}
                bgColor="bg-green-50"
              />
              <MetricCard
                title="Total Users"
                value={data.allTime.totalUsers.toString()}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                bgColor="bg-blue-50"
              />
              <MetricCard
                title="Total Plans"
                value={data.allTime.totalPlans.toLocaleString()}
                subtitle={`${data.allTime.completedPlans} completed`}
                icon={<FileText className="w-6 h-6 text-indigo-600" />}
                bgColor="bg-indigo-50"
              />
              <MetricCard
                title="Credits Used"
                value={data.allTime.totalCreditsUsed.toLocaleString()}
                subtitle={`of ${data.allTime.totalCreditsGranted.toLocaleString()} granted`}
                icon={<CreditCard className="w-6 h-6 text-purple-600" />}
                bgColor="bg-purple-50"
              />
            </div>
          </div>

          {/* Filtered Section - Filter Controls + Results Together */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Filter Header and Controls */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Period</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
                  >
                    <option value="day">Today</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                    <option value="all-time">All Time</option>
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="India">India</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Education">Education</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDateFilter('month');
                      setCountry('');
                      setIndustry('');
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-300 cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filtered Results */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {getFilterLabel()} Results
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Revenue"
                  value={`₦${data.filtered.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                  icon={<span className="font-bold">₦</span>}
                  iconColor="text-green-600"
                />
                <StatCard
                  title="New Users"
                  value={data.filtered.totalUsers.toString()}
                  icon={<Users className="w-5 h-5" />}
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Plans Created"
                  value={data.filtered.totalPlans.toString()}
                  subtitle={`${data.filtered.completedPlans} completed`}
                  icon={<FileText className="w-5 h-5" />}
                  iconColor="text-purple-600"
                />
                <StatCard
                  title="Credits Used"
                  value={data.filtered.totalCreditsUsed.toLocaleString()}
                  icon={<TrendingUp className="w-5 h-5" />}
                  iconColor="text-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{data.allTime.activeUsers} / {data.allTime.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">
                    {data.allTime.totalPlans > 0
                      ? ((data.allTime.completedPlans / data.allTime.totalPlans) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Plans per User</span>
                  <span className="font-medium">
                    {data.allTime.totalUsers > 0
                      ? (data.allTime.totalPlans / data.allTime.totalUsers).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Credit Utilization</span>
                  <span className="font-medium">
                    {data.allTime.totalCreditsGranted > 0
                      ? ((data.allTime.totalCreditsUsed / data.allTime.totalCreditsGranted) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">All Time Revenue</span>
                  <span className="font-medium text-green-600">₦{data.allTime.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{getFilterLabel()} Revenue</span>
                  <span className="font-medium text-blue-600">₦{data.filtered.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Revenue per User</span>
                  <span className="font-medium">
                    ₦{data.allTime.totalUsers > 0
                      ? (data.allTime.totalRevenue / data.allTime.totalUsers).toLocaleString('en-NG', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
        <div className={iconColor}>{icon}</div>
      </div>
      <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
