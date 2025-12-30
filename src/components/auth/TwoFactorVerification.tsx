'use client';

/**
 * Two-Factor Verification Component
 * Shown during login after password is verified
 */

import { useState } from 'react';

interface TwoFactorVerificationProps {
  onVerify: (token: string, useBackupCode: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export default function TwoFactorVerification({
  onVerify,
  onCancel,
  loading = false,
  error,
}: TwoFactorVerificationProps) {
  const [token, setToken] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useBackupCode) {
      // Backup codes are 12 characters with dashes (ABCD-EFGH-IJKL)
      if (token.replace(/-/g, '').length !== 12) {
        return;
      }
    } else {
      // TOTP tokens are 6 digits
      if (token.length !== 6) {
        return;
      }
    }

    await onVerify(token, useBackupCode);
  };

  const handleTokenChange = (value: string) => {
    if (useBackupCode) {
      // Allow alphanumeric and dashes for backup codes
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      setToken(cleaned);
    } else {
      // Only allow digits for TOTP
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      setToken(cleaned);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
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

          {/* Token Input */}
          <div>
            <label htmlFor="token" className="sr-only">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              id="token"
              name="token"
              type="text"
              required
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-2xl font-mono tracking-widest"
              placeholder={useBackupCode ? 'ABCD-EFGH-IJKL' : '000000'}
              maxLength={useBackupCode ? 14 : 6}
              autoComplete="off"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              {useBackupCode
                ? '12-character backup code'
                : '6-digit code that refreshes every 30 seconds'}
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || (useBackupCode ? token.replace(/-/g, '').length !== 12 : token.length !== 6)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          {/* Toggle Backup Code */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setToken('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {useBackupCode
                ? '← Use authenticator app code'
                : 'Lost your device? Use a backup code'}
            </button>
          </div>

          {/* Cancel Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Login
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Make sure your device&apos;s time is set correctly.</p>
            <p>Codes expire every 30 seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
