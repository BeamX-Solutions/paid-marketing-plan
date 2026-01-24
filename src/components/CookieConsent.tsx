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
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            {!showPreferences ? (
              // Main Banner
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Cookie className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      We Value Your Privacy
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                      By clicking "Accept All," you consent to our use of cookies. You can customize your preferences or
                      decline non-essential cookies.{' '}
                      <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                        Learn more in our Privacy Policy
                      </Link>
                      .
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={acceptAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Accept All
                      </Button>
                      <Button
                        onClick={acceptNecessaryOnly}
                        variant="outline"
                      >
                        Necessary Only
                      </Button>
                      <Button
                        onClick={() => setShowPreferences(true)}
                        variant="outline"
                      >
                        Customize
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={acceptNecessaryOnly}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close banner and accept necessary cookies only"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              // Preferences Panel
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Back to main banner"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Manage your cookie preferences below. Some cookies are essential for the site to function.
                </p>

                <div className="space-y-4 mb-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Required
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Essential for the website to function properly. These cookies enable core functionality
                        such as security, authentication, and session management.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our website by collecting and reporting
                        information anonymously. This helps us improve our service.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                          preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                        aria-label="Toggle analytics cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Used to track visitors across websites to display relevant advertisements and encourage
                        them to engage. We may share this information with advertisers.
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                          preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                        }`}
                        aria-label="Toggle marketing cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={savePreferences}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    onClick={acceptAll}
                    variant="outline"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" />
    </>
  );
}
