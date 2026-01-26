'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay before showing banner for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptNecessaryOnly = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-slide-up">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {!showPreferences ? (
              // Main Banner - Compact version
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Cookie className="w-5 h-5 text-[#0F5AE0] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-3">
                      We use cookies to enhance your experience.{' '}
                      <Link href="/legal/privacy" className="text-[#0F5AE0] hover:underline">
                        Learn more
                      </Link>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={acceptAll}
                        className="bg-[#0F5AE0] hover:bg-[#0C48B3] text-white text-xs px-3 py-1.5"
                      >
                        Accept All
                      </Button>
                      <Button
                        size="sm"
                        onClick={acceptNecessaryOnly}
                        variant="outline"
                        className="text-xs px-3 py-1.5"
                      >
                        Decline
                      </Button>
                      <button
                        onClick={() => setShowPreferences(true)}
                        className="text-xs text-gray-500 hover:text-[#0F5AE0] underline"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={acceptNecessaryOnly}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Preferences Panel - Compact version
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Cookie Preferences</h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Back"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Necessary</span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-[#0F5AE0] text-xs rounded">Required</span>
                    </div>
                    <div className="w-10 h-5 bg-[#0F5AE0] rounded-full flex items-center justify-end px-0.5 cursor-not-allowed opacity-50">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Analytics</span>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                        preferences.analytics ? 'bg-[#0F5AE0] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                      aria-label="Toggle analytics cookies"
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Marketing</span>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                        preferences.marketing ? 'bg-[#0F5AE0] justify-end' : 'bg-gray-300 justify-start'
                      }`}
                      aria-label="Toggle marketing cookies"
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={savePreferences}
                    className="bg-[#0F5AE0] hover:bg-[#0C48B3] text-white text-xs px-3 py-1.5"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    variant="outline"
                    className="text-xs px-3 py-1.5"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
