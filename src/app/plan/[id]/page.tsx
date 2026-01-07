'use client';

import React, { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types';
import Button from '@/components/ui/Button';
import ShareModal from '@/components/plan/ShareModal';
import { Download, Share, Mail } from 'lucide-react';
import { analytics } from '@/lib/analytics/analyticsService';

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

interface PlanWithUser extends Plan {
  user?: {
    businessName?: string;
  };
}

const PlanPage: React.FC<PlanPageProps> = ({ params }) => {
  const { id: planId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchPlan();
    }
  }, [status, planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}`);

      if (!response.ok) {
        throw new Error('Plan not found');
      }

      const planData = await response.json();
      setPlan(planData);

      // Track plan view
      if (session?.user?.email) {
        analytics.trackPlanViewed(session.user.email, planId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}/download`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `marketing-plan-${plan?.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      // Track PDF download
      if (session?.user?.email) {
        analytics.trackPlanDownloaded(session.user.email, planId, 'pdf');
      }
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your marketing plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!plan || !plan.generatedContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Still Generating</h1>
          <p className="text-gray-600 mb-6">Your marketing plan is still being generated. Please check back in a few minutes.</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const { onePagePlan, implementationGuide, strategicInsights } = plan.generatedContent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Marketing Plan</h1>
              <p className="text-gray-600">Generated on {new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => setShowShareModal(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* One-Page Plan */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">One-Page Marketing Plan</h2>
              
              {/* Before Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">BEFORE (Prospects)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Target Market</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.before.targetMarket}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.before.message}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Media</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      {onePagePlan.before.media.map((channel, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {channel}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* During Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-green-600 mb-4">DURING (Leads)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lead Capture</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.during.leadCapture}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lead Nurture</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.during.leadNurture}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sales Conversion</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.during.salesConversion}</p>
                  </div>
                </div>
              </div>

              {/* After Section */}
              <div>
                <h3 className="text-xl font-semibold text-purple-600 mb-4">AFTER (Customers)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Deliver Experience</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.after.deliverExperience}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lifetime Value</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.after.lifetimeValue}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Referrals</h4>
                    <p className="text-gray-700 text-sm">{onePagePlan.after.referrals}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Implementation Guide</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h3>
                <p className="text-gray-700">{implementationGuide.executiveSummary}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase 1 (First 30 Days)</h3>
                  <p className="text-gray-700">{implementationGuide.actionPlans.phase1}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase 2 (Days 31-90)</h3>
                  <p className="text-gray-700">{implementationGuide.actionPlans.phase2}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Phase 3 (Days 91-180)</h3>
                  <p className="text-gray-700">{implementationGuide.actionPlans.phase3}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Insights Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {strategicInsights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Opportunities</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {strategicInsights.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Key Risks</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {strategicInsights.risks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push('/implementation')}>
                  Start Implementation
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  Schedule Consultation
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/questionnaire')}>
                  Create New Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        planId={planId}
        businessName={plan?.user?.businessName}
      />
    </div>
  );
};

export default PlanPage;