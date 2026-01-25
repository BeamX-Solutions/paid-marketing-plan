'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Activity, Search, Check, X, UserPlus, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { validatePassword, getPasswordRequirementsText } from '@/lib/password-validation';
import { useSession } from 'next-auth/react';

type TabType = 'logs' | 'admins' | 'permissions';

interface AdminAction {
  id: string;
  action: string;
  adminEmail: string;
  targetUserEmail?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  permissions?: {
    canDownloadData?: boolean;
  };
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role;
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [activityLogs, setActivityLogs] = useState<AdminAction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchActivityLogs();
    } else if (activeTab === 'admins' || activeTab === 'permissions') {
      fetchUsers();
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/activity-log?${params}`);
      const data = await response.json();
      setActivityLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setErrorMessage('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setSuccessMessage(`User role updated to ${newRole}`);
        fetchUsers();
        if (activeTab === 'logs') fetchActivityLogs();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to update user role');
      }
    } catch (error) {
      setErrorMessage('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissions = async (userId: string, canDownloadData: boolean) => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canDownloadData }),
      });

      if (response.ok) {
        setSuccessMessage('User permissions updated');
        fetchUsers();
        if (activeTab === 'logs') fetchActivityLogs();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to update permissions');
      }
    } catch (error) {
      setErrorMessage('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setPasswordErrors([]);

    if (!newAdmin.email || !newAdmin.password) {
      setErrorMessage('Email and password are required');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(newAdmin.password);
    if (!passwordValidation.isValid) {
      setErrorMessage('Password does not meet security requirements');
      setPasswordErrors(passwordValidation.errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/users/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      if (response.ok) {
        setSuccessMessage('Admin user created successfully');
        setShowCreateAdminForm(false);
        setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
        fetchUsers();
        if (activeTab === 'logs') fetchActivityLogs();
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to create admin user');
      }
    } catch (error) {
      setErrorMessage('Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if ((activeTab === 'admins' || activeTab === 'permissions') && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return false;
    }

    return (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="mt-2 text-gray-600">Manage admin access, permissions, and view activity logs</p>
          </div>

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'logs'
                      ? 'border-[#0F5AE0] text-[#0F5AE0]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Activity Log
                </button>
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'admins'
                      ? 'border-[#0F5AE0] text-[#0F5AE0]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Manage Admins
                </button>
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'permissions'
                      ? 'border-[#0F5AE0] text-[#0F5AE0]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Permissions
                </button>
              </nav>
            </div>

            {/* Manage Admins Tab */}
            {activeTab === 'admins' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Admin Access</h2>
                    <p className="text-gray-600">View and manage admin users</p>
                  </div>
                  {isSuperAdmin && (
                    <Button
                      onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
                      variant="default"
                    >
                      <UserPlus className="w-4 h-4 mr-2 inline-block" />
                      {showCreateAdminForm ? 'Cancel' : 'Create New Admin'}
                    </Button>
                  )}
                </div>

                {/* Create Admin Form */}
                {showCreateAdminForm && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin User</h3>
                    <form onSubmit={createAdmin} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={newAdmin.firstName}
                            onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300"
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={newAdmin.lastName}
                            onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => {
                            setNewAdmin({ ...newAdmin, password: e.target.value });
                            setPasswordErrors([]);
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0F5AE0] focus:border-transparent transition-all duration-300 ${
                            passwordErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Create a strong password"
                          required
                        />
                        {passwordErrors.length === 0 ? (
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="font-medium mb-1">Password must meet these requirements:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {getPasswordRequirementsText().map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-red-600">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Password requirements not met:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  {passwordErrors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCreateAdminForm(false);
                            setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
                          }}
                          variant="default"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="default" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Admin'}
                        </Button>
                      </div>
                    </form>
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
