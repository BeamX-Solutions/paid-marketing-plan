import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | BeamX Solutions',
  description: 'Terms of Service for BeamX Solutions - Legal agreement for using our service',
};

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using BeamX Solutions ("Service," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                BeamX Solutions is an AI-powered platform that helps businesses create comprehensive marketing plans through an interactive questionnaire. Our Service uses artificial intelligence (Claude AI by Anthropic) to generate personalized marketing strategies based on your business information.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The Service operates on a credit-based system where users purchase credits to generate marketing plans.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our Service, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Verify your email address</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Responsibilities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>All activities that occur under your account</li>
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or any other reason we deem necessary to protect our Service or other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Credits and Payment</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Credit System</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                BeamX Solutions uses a credit-based system:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Each marketing plan generation costs 50 credits</li>
                <li>Credits must be purchased before generating plans</li>
                <li>Credits are non-transferable and non-refundable except as required by law</li>
                <li>Credits may have expiration dates as specified at the time of purchase</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Pricing and Payments</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All payments are processed securely through Stripe. By making a purchase, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate payment information</li>
                <li>Pay all charges at the prices in effect when incurred</li>
                <li>Pay applicable taxes</li>
                <li>Authorize us to charge your payment method</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Pricing Changes</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify our pricing at any time. Price changes will not affect credits already purchased.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Refund Policy</h3>
              <p className="text-gray-700 leading-relaxed">
                Refunds are generally not provided for purchased credits. However, we may issue refunds at our sole discretion in cases of technical errors or service failures that prevent you from using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use the Service only for lawful business purposes to create marketing plans for legitimate businesses.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems (bots, scrapers) to access the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Resell, redistribute, or sublicense the Service or generated content</li>
                <li>Remove or modify any proprietary notices or labels</li>
                <li>Use the Service to generate content for harmful, fraudulent, or unethical purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Our Property</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service, including its design, features, software, and content (excluding user-generated content), is owned by us and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Generated Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You own the marketing plans generated for your business. However, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Plans are generated using AI and may contain non-unique elements</li>
                <li>We retain the right to use anonymized data to improve our Service</li>
                <li>You grant us a license to process your inputs to generate your plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Trademarks</h3>
              <p className="text-gray-700 leading-relaxed">
                "BeamX Solutions" and our logo are trademarks. You may not use them without our prior written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. AI-Generated Content Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Important disclaimers about AI-generated marketing plans:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>No Guarantees:</strong> Plans are AI-generated and provided "as is" without guarantees of accuracy, completeness, or results</li>
                <li><strong>Professional Advice:</strong> Plans are not a substitute for professional marketing, business, or legal advice</li>
                <li><strong>Your Responsibility:</strong> You must review, verify, and adapt all generated content for your specific needs</li>
                <li><strong>Industry-Specific:</strong> Plans may not account for all industry-specific regulations or requirements</li>
                <li><strong>No Warranty:</strong> We do not warrant that plans will achieve any specific business outcomes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</li>
                <li>We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose</li>
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability is limited to the amount you paid us in the 12 months preceding the claim</li>
                <li>We are not responsible for business losses, lost profits, or data loss</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Some jurisdictions do not allow certain liability limitations, so some of the above may not apply to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless BeamX Solutions, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data and Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. Please review our{' '}
                <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>{' '}
                to understand how we collect, use, and protect your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Service integrates with third-party services:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Anthropic (Claude AI):</strong> For AI-powered plan generation</li>
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>Resend:</strong> For email delivery</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Your use of these services is subject to their respective terms and policies. We are not responsible for third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Service Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by contacting us. Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Your access to the Service will cease</li>
                <li>Unused credits will be forfeited (no refunds)</li>
                <li>Your data will be deleted within 30 days</li>
                <li>Generated plans you've downloaded remain yours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a dispute:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Contact us first to attempt informal resolution</li>
                <li>If unresolved, disputes may be subject to binding arbitration</li>
                <li>You agree to waive any right to a jury trial</li>
                <li>Class action lawsuits are prohibited</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use after changes constitutes acceptance of the new Terms. If you do not agree to the changes, you must stop using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Miscellaneous</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">17.1 Entire Agreement</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms, along with our Privacy Policy, constitute the entire agreement between you and BeamX Solutions.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">17.2 Severability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">17.3 Waiver</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">17.4 Assignment</h3>
              <p className="text-gray-700 leading-relaxed">
                You may not assign or transfer these Terms without our consent. We may assign our rights without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:legal@beamxsolutions.com" className="text-blue-600 hover:underline">
                    legal@beamxsolutions.com
                  </a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Support:</strong>{' '}
                  <a href="mailto:support@beamxsolutions.com" className="text-blue-600 hover:underline">
                    support@beamxsolutions.com
                  </a>
                </p>
              </div>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-gray-600">
                By using BeamX Solutions, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Effective date: {lastUpdated}
              </p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/legal/privacy"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
