import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | BeamX Solutions',
  description: 'Privacy Policy for BeamX Solutions - How we collect, use, and protect your data',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 18, 2026';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to BeamX Solutions ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketing plan generation service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using BeamX Solutions, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Register for an account (name, email address, business name)</li>
                <li>Complete questionnaires (business information, industry, country, target market details)</li>
                <li>Make purchases (payment information processed by Stripe)</li>
                <li>Contact us for support</li>
                <li>Subscribe to marketing communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use our service, we automatically collect certain information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Device and browser information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Login timestamps and session information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 AI-Generated Content</h3>
              <p className="text-gray-700 leading-relaxed">
                Your questionnaire responses are processed by Claude AI (Anthropic) to generate personalized marketing plans. This data is transmitted securely and used solely for plan generation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Create and manage your account</li>
                <li>Generate personalized marketing plans using AI</li>
                <li>Process payments and manage credits</li>
                <li>Send service-related notifications (account updates, security alerts)</li>
                <li>Provide customer support</li>
                <li>Send marketing communications (only if you've opted in)</li>
                <li>Improve our service and develop new features</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Third-Party Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share your information with trusted third-party service providers:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Anthropic (Claude AI):</strong> For AI-powered marketing plan generation</li>
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>Resend:</strong> For transactional email delivery</li>
                <li><strong>Hosting providers:</strong> For infrastructure and data storage</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, subpoenas).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Encryption in transit (TLS/SSL) and at rest</li>
                <li>Secure password hashing (bcrypt)</li>
                <li>Two-factor authentication (2FA) option</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>IP whitelisting for admin accounts</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Data Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Object:</strong> Object to certain data processing activities</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@beamxsolutions.com" className="text-blue-600 hover:underline">
                  privacy@beamxsolutions.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. Disabling cookies may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our service. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@beamxsolutions.com" className="text-blue-600 hover:underline">
                    privacy@beamxsolutions.com
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Support:</strong>{' '}
                  <a href="mailto:info@beamxsolutions.com" className="text-blue-600 hover:underline">
                    info@beamxsolutions.com
                  </a>
                </p>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-gray-600">
                This Privacy Policy is effective as of {lastUpdated} and applies to all users of BeamX Solutions.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/legal/terms"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
