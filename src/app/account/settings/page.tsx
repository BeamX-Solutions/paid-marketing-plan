'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowLeft, Bell, Shield, Trash2, Key, Download, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailMarketing: false,
    planComplete: true,
    securityAlerts: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/user/export-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beamx-luna-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        setMessage({ type: 'success', text: 'Your data has been exported successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;

    try {
      setDeleting(true);
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/auth/signin?deleted=true');
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F5AE0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity duration-300">
                <Image
                  src="/logo.png"
                  alt="BeamX Solutions"
                  width={140}
                  height={35}
                  className="h-9 w-auto"
                  priority
                />
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-[#0F5AE0] hover:text-[#0C48B3] transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account preferences and security</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-[#0F5AE0]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500">Choose what notifications you receive</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Marketing emails</p>
                  <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, emailMarketing: !notifications.emailMarketing })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                    notifications.emailMarketing ? 'bg-[#0F5AE0] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Plan completion alerts</p>
                  <p className="text-sm text-gray-500">Get notified when your marketing plan is ready</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, planComplete: !notifications.planComplete })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                    notifications.planComplete ? 'bg-[#0F5AE0] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Security alerts</p>
                  <p className="text-sm text-gray-500">Important notifications about your account security</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                    notifications.securityAlerts ? 'bg-[#0F5AE0] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Manage your account security settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Change password</p>
                    <p className="text-sm text-gray-500">Update your password regularly for security</p>
                  </div>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-[#0F5AE0] hover:text-[#0C48B3] font-medium text-sm"
                >
                  Change
                </Link>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Two-factor authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
                <p className="text-sm text-gray-500">Manage your data and privacy preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Export your data</p>
                  <p className="text-sm text-gray-500">Download a copy of all your data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  loading={exporting}
                  className="border-[#0F5AE0] text-[#0F5AE0] hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>

              <div className="py-3">
                <Link
                  href="/legal/privacy"
                  className="text-[#0F5AE0] hover:text-[#0C48B3] font-medium text-sm"
                >
                  View Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-600">Irreversible actions</p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Delete account</p>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Are you absolutely sure?</p>
                    <p className="text-sm text-red-700 mt-1">
                      This action cannot be undone. This will permanently delete your account, all your marketing plans, and remove all your data from our servers.
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-900 mb-2">
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput('');
                    }}
                    className="text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDeleteAccount}
                    loading={deleting}
                    disabled={deleteInput !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
