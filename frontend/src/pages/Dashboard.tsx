import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, BarChart3, Clock } from 'lucide-react';
import { MarketingPlan, DashboardData } from '../types';
import { plansAPI, analyticsAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [plans, setPlans] = useState<MarketingPlan[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [plansResponse, dashboardResponse] = await Promise.all([
        plansAPI.getAll(),
        analyticsAPI.getDashboard()
      ]);

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      if (dashboardResponse.success && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/plans/create"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Create New Plan
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <FileText className="h-12 w-12 text-blue-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPlans}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <BarChart3 className="h-12 w-12 text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Plans</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.completedPlans}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Clock className="h-12 w-12 text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.recentActivity.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Marketing Plans</h2>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No marketing plans yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first marketing plan
            </p>
            <Link to="/plans/create" className="btn btn-primary">
              Create Your First Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {plan.businessName}
                    </h3>
                    <p className="text-gray-600 mb-2">{plan.industry}</p>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}
                      >
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created {formatDate(plan.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/plans/${plan.id}`}
                      className="btn btn-secondary text-sm"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;