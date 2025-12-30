'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    const reason = prompt('Reason for status change:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/users/${params.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (response.ok) {
        fetchUser();
        alert('Status updated successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  };

  const manageCredits = async () => {
    // Credit limits (from credit-validation.ts)
    const MIN_ADJUSTMENT = -10000;
    const MAX_ADJUSTMENT = 10000;

    const amountStr = prompt(
      `Number of credits to add (negative to deduct):\n\nLimits:\n• Add: 1 to ${MAX_ADJUSTMENT.toLocaleString()} credits\n• Deduct: ${MIN_ADJUSTMENT.toLocaleString()} to -1 credits`
    );
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      alert('Invalid amount. Please enter a valid number.');
      return;
    }

    if (amount === 0) {
      alert('Amount cannot be zero.');
      return;
    }

    if (amount < MIN_ADJUSTMENT || amount > MAX_ADJUSTMENT) {
      alert(
        `Invalid amount. Must be between ${MIN_ADJUSTMENT.toLocaleString()} and ${MAX_ADJUSTMENT.toLocaleString()} credits.`
      );
      return;
    }

    const reason = prompt('Reason for adjustment:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/users/${params.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchUser();
        alert(
          `Credits ${data.operation === 'addition' ? 'added' : 'deducted'} successfully!\n\nNew balance: ${data.newBalance.toLocaleString()} credits`
        );
      } else {
        const data = await response.json();
        // Show detailed error messages
        if (data.details && Array.isArray(data.details)) {
          alert(`Error:\n\n${data.details.join('\n')}`);
        } else {
          alert(data.error || 'Failed to update credits');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update credits. Please try again.');
    }
  };

  const deleteUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('User deleted successfully');
        router.push('/admin/users');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete user');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const initiateRoleChange = (newRole: string) => {
    setPendingRole(newRole);
    setShowRoleChangeConfirm(true);
  };

  const changeUserRole = async () => {
    if (!pendingRole) return;

    try {
      const response = await fetch(`/api/admin/users/${params.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: pendingRole }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchUser();
        alert(data.message || 'Role updated successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update role');
    } finally {
      setShowRoleChangeConfirm(false);
      setPendingRole(null);
    }
  };

  const resetPassword = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setTemporaryPassword(data.temporaryPassword);
        setShowPasswordReset(true);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reset password');
    }
  };

  const copyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      alert('Password copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">User not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-600 mt-1">{user.businessName || 'No business name'}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Business Name</dt>
              <dd className="text-sm font-medium text-gray-900">{user.businessName || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Industry</dt>
              <dd className="text-sm font-medium text-gray-900">{user.industry || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {user.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : user.status === 'SUSPENDED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Total Plans</dt>
              <dd className="text-sm font-medium text-gray-900">{user._count.plans}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created At</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Login</dt>
              <dd className="text-sm font-medium text-gray-900">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="pt-4 border-t space-y-4">
          {/* Role Management Section */}
          {user.role !== 'SUPER_ADMIN' && (
            <div className="pb-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Role Management</h4>
              <div className="flex gap-2 flex-wrap">
                {isSuperAdmin && user.role !== 'SUPER_ADMIN' && (
                  <>
                    {user.role === 'USER' && (
                      <button
                        onClick={() => initiateRoleChange('ADMIN')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Promote to Admin
                      </button>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <button
                        onClick={() => initiateRoleChange('USER')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        Revoke Admin Access
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={resetPassword}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {/* Status Management Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Account Status</h4>
            <div className="flex gap-2 flex-wrap">
              {user.status !== 'SUSPENDED' && (
                <button
                  onClick={() => updateStatus('SUSPENDED')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Suspend User
                </button>
              )}
              {user.status === 'SUSPENDED' && (
                <button
                  onClick={() => updateStatus('ACTIVE')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Activate User
                </button>
              )}
              {user.status !== 'DEACTIVATED' && (
                <button
                  onClick={() => updateStatus('DEACTIVATED')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Deactivate User
                </button>
              )}
              <button
                onClick={manageCredits}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Manage Credits
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-red-700 mb-3">Danger Zone</h4>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete User Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>User account and profile data</li>
              <li>All associated marketing plans ({user._count.plans})</li>
              <li>Credit purchase history</li>
              <li>Credit transaction records</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {showRoleChangeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Confirm Role Change
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {pendingRole === 'ADMIN' ? (
                <>You are about to promote <strong>{user.email}</strong> to Admin role.</>
              ) : (
                <>You are about to revoke admin access from <strong>{user.email}</strong>.</>
              )}
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {pendingRole === 'ADMIN' ? (
                      <>
                        This will grant the user access to:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Admin dashboard and tools</li>
                          <li>User management capabilities</li>
                          <li>System configuration settings</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        This will remove the user's access to:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Admin dashboard and tools</li>
                          <li>User management capabilities</li>
                          <li>System configuration settings</li>
                          <li>All administrative privileges</li>
                        </ul>
                        <p className="mt-2 font-medium">The user can be reinstated as admin later if needed.</p>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRoleChangeConfirm(false);
                  setPendingRole(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={changeUserRole}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  pendingRole === 'ADMIN'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {pendingRole === 'ADMIN' ? 'Promote to Admin' : 'Revoke Admin Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Success Modal */}
      {showPasswordReset && temporaryPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Password Reset Successful
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              A new temporary password has been generated for <strong>{user.email}</strong>.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Password
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono select-all">
                  {temporaryPassword}
                </code>
                <button
                  onClick={copyPassword}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Copy this password now. For security reasons, it will not be shown again.
                    Share it securely with the user and advise them to change it after their first login.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setTemporaryPassword(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Plans</h3>
        {user.plans.length === 0 ? (
          <p className="text-gray-500 text-sm">No plans yet</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {user.plans.map((plan: any) => (
              <li key={plan.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.id}</p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user.creditPurchases && user.creditPurchases.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Purchases</h3>
            <ul className="divide-y divide-gray-200">
              {user.creditPurchases.map((purchase: any) => (
                <li key={purchase.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {purchase.creditsGranted} credits
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {purchase.creditsRemaining} remaining
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${(purchase.amountPaid / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {new Date(purchase.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {user.creditTransactions && user.creditTransactions.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Credit Activity</h3>
            <ul className="divide-y divide-gray-200">
              {user.creditTransactions.map((transaction: any) => (
                <li key={transaction.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.transactionType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-sm font-semibold ${
                        transaction.creditAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.creditAmount > 0 ? '+' : ''}{transaction.creditAmount}
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
