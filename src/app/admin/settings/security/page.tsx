'use client';

/**
 * Admin Security Settings Page
 * Allows admins to enable/disable 2FA, view backup codes, and manage security settings
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BackupCode {
  code: string;
  used: boolean;
}

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2FA setup state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set up 2FA');
      }

      setQrCodeUrl(data.qrCodeDataUrl);
      setSecret(data.secret);
      setShowSetup(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setSuccess('2FA has been successfully enabled!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printBackupCodes = () => {
    const printWindow = window.open('', '', 'width=600,height=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Backup Codes</title></head><body>');
      printWindow.document.write('<h1>2FA Backup Codes</h1>');
      printWindow.document.write('<p>Save these codes in a safe place. Each code can only be used once.</p>');
      printWindow.document.write('<ul>');
      backupCodes.forEach((code, i) => {
        printWindow.document.write(`<li>${i + 1}. ${code}</li>`);
      });
      printWindow.document.write('</ul>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account security and two-factor authentication
            </p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2FA Status */}
            {!showSetup && !showBackupCodes && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Two-Factor Authentication
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Add an extra layer of security to your account by requiring a code from your phone in addition to your password.
                    </p>
                    <div className="mt-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        twoFactorEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {twoFactorEnabled ? '✓ Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div>
                    {!twoFactorEnabled && (
                      <button
                        onClick={handleSetup2FA}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1e3a5f] hover:bg-[#152a45] cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f] disabled:opacity-50"
                      >
                        {loading ? 'Setting up...' : 'Enable 2FA'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2FA Setup Flow */}
            {showSetup && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Set Up Two-Factor Authentication
                </h2>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Step 1: Install an Authenticator App
                    </h3>
                    <p className="text-sm text-gray-600">
                      Download one of these apps on your phone:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Google Authenticator</li>
                      <li>Authy</li>
                      <li>Microsoft Authenticator</li>
                    </ul>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Step 2: Scan QR Code
                    </h3>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 inline-block">
                      {qrCodeUrl && (
                        <Image
                          src={qrCodeUrl}
                          alt="2FA QR Code"
                          width={200}
                          height={200}
                        />
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Can&apos;t scan? Manual key:
                    </p>
                    <code className="block mt-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono break-all">
                      {secret}
                    </code>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Step 3: Enter Verification Code
                    </h3>
                    <form onSubmit={handleVerifySetup}>
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="block w-32 px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono"
                          maxLength={6}
                          required
                        />
                        <button
                          type="submit"
                          disabled={loading || verificationCode.length !== 6}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Verify and Enable'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setShowSetup(false)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      ← Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Codes Display */}
            {showBackupCodes && backupCodes.length > 0 && (
              <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-yellow-900">
                      Save Your Backup Codes
                    </h3>
                    <p className="mt-2 text-sm text-yellow-800">
                      Store these codes in a safe place. Each code can only be used once. You&apos;ll need them to access your account if you lose your phone.
                    </p>

                    <div className="mt-4 bg-white rounded-md p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="flex items-center">
                            <span className="text-gray-500 mr-2">{index + 1}.</span>
                            <code className="font-mono text-sm">{code}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={downloadBackupCodes}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f]"
                      >
                        Download as Text
                      </button>
                      <button
                        onClick={printBackupCodes}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f]"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => setShowBackupCodes(false)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        I&apos;ve Saved These Codes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
