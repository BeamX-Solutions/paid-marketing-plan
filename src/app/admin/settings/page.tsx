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
    // Reset to page 1 when tab changes
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

    // Validate form
    if (!newAdmin.email || !newAdmin.password) {
      setErrorMessage('Email and password are required');
      setLoading(false);
      return;
    }

    // Validate password strength
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
    // For admins and permissions tabs, only show users with ADMIN or SUPER_ADMIN role
    if ((activeTab === 'admins' || activeTab === 'permissions') && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return false;
    }

    // Apply search filter
    return (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
            <p className="mt-2 text-gray-600">Manage admin access, permissions, and view activity logs</p>
          </div>

          {/* Messages */}
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
                      ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 mr-2" />
              Permissions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Activity Log Tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Activity Log</h2>
                <p className="text-gray-600">Track all administrative actions performed on the platform</p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading activity logs...</div>
              ) : activityLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No activity logs found</div>
              ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Target User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP Address
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activityLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.adminEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.targetUserEmail || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {log.details || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.ipAddress || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pagination.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pagination.limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      logs
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === pagination.totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                    variant="primary"
                    icon={UserPlus}
                  >
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Admin'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search admins by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.role === 'SUPER_ADMIN' ? (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-600 text-white font-semibold">
                                  Super Admin
                                </span>
                              </div>
                            ) : isSuperAdmin ? (
                              user.role === 'ADMIN' ? (
                                <Button
                                  onClick={() => updateUserRole(user.id, 'USER')}
                                  variant="secondary"
                                  size="sm"
                                  disabled={loading}
                                >
                                  Revoke Admin
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => updateUserRole(user.id, 'ADMIN')}
                                  variant="primary"
                                  size="sm"
                                  disabled={loading}
                                >
                                  Make Admin
                                </Button>
                              )
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {user.role}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Permissions</h2>
                <p className="text-gray-600">Manage data download permissions for admin users</p>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search admins by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading admins...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No admins found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Download Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const canDownload = user.permissions?.canDownloadData ?? true; // Default to true
                        return (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                canDownload
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {canDownload ? 'Allowed' : 'Denied'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {canDownload ? (
                                <Button
                                  onClick={() => updateUserPermissions(user.id, false)}
                                  variant="secondary"
                                  size="sm"
                                  disabled={loading}
                                >
                                  Deny Access
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => updateUserPermissions(user.id, true)}
                                  variant="primary"
                                  size="sm"
                                  disabled={loading}
                                >
                                  Allow Access
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
