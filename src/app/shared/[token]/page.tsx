'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

interface SharedPlanPageProps {
  params: Promise<{ token: string }>;
}

interface SharedPlan {
  id: string;
  generatedContent: {
    onePagePlan: {
      before: { targetMarket: string; message: string; media: string[] };
      during: { leadCapture: string; leadNurture: string; salesConversion: string };
      after: { deliverExperience: string; lifetimeValue: string; referrals: string };
    };
    implementationGuide: {
      executiveSummary: string;
      actionPlans: { phase1: string; phase2: string; phase3: string };
    };
    strategicInsights: {
      strengths: string[];
      opportunities: string[];
      risks: string[];
    };
  };
  businessName: string | null;
  createdAt: string;
}

const SharedPlanPage: React.FC<SharedPlanPageProps> = ({ params }) => {
  const { token } = use(params);
  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/shared/${token}`);
        if (!response.ok) {
          throw new Error('Plan not found');
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan || !plan.generatedContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
            <p className="text-gray-600 mb-6">This shared plan link is invalid or has expired.</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 bg-[#0F5AE0] text-white rounded-lg hover:bg-[#0C48B3] transition"
            >
              Create Your Own Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { onePagePlan, implementationGuide, strategicInsights } = plan.generatedContent;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Top Conversion Banner */}
      <div className="bg-gradient-to-r from-[#008BD8] to-[#02428E] text-white text-center py-3 px-4">
        <p className="text-sm">
          This marketing plan was created with <strong>BeamX Luna</strong> &mdash; AI-powered marketing strategy for your business.
          <Link href="/auth/signup?utm_source=shared_plan" className="underline font-semibold ml-2 hover:text-blue-200 transition">
            Create Your Free Plan &rarr;
          </Link>
        </p>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {plan.businessName ? `${plan.businessName}'s Marketing Plan` : 'Shared Marketing Plan'}
              </h1>
              <p className="text-gray-600">Created on {new Date(plan.createdAt).toLocaleDateString()}</p>
            </div>
            <Link
              href="/auth/signup?utm_source=shared_plan"
              className="hidden sm:inline-flex items-center px-5 py-2.5 bg-[#0F5AE0] text-white text-sm font-semibold rounded-lg hover:bg-[#0C48B3] transition"
            >
              Create Your Own Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Plan Content */}
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
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Target Market</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.before.targetMarket}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Message</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.before.message}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Media</h5>
                    <ul className="text-gray-700 text-xs space-y-1">
                      {onePagePlan.before.media.map((channel: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
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
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Lead Capture</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.during.leadCapture}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Lead Nurture</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.during.leadNurture}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Sales Conversion</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.during.salesConversion}</p>
                  </div>
                </div>
              </div>

              {/* After Section */}
              <div>
                <h3 className="text-xl font-semibold text-purple-600 mb-4">AFTER (Customers)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Deliver Experience</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.after.deliverExperience}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Lifetime Value</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.after.lifetimeValue}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-2">Referrals</h5>
                    <p className="text-gray-700 text-xs leading-relaxed">{onePagePlan.after.referrals}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Implementation Guide</h2>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900">Executive Summary</h4>
                <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{implementationGuide.executiveSummary}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 1 (First 30 Days)</h4>
                  <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{implementationGuide.actionPlans.phase1}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 2 (Days 31-90)</h4>
                  <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{implementationGuide.actionPlans.phase2}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phase 3 (Days 91-180)</h4>
                  <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{implementationGuide.actionPlans.phase3}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {strategicInsights.strengths.map((strength: string, index: number) => (
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
                    {strategicInsights.opportunities.map((opportunity: string, index: number) => (
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
                    {strategicInsights.risks.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-[#008BD8] to-[#02428E] rounded-2xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-3">Want Your Own Plan?</h3>
              <p className="text-blue-100 text-sm mb-6">
                Get a customized marketing plan tailored to your specific business needs.
              </p>
              <Link href="/auth/signup?utm_source=shared_plan">
                <button className="w-full bg-white text-[#0F5AE0] px-6 py-3 text-sm font-semibold rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer">
                  Create Your Plan - Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-br from-[#008BD8] to-[#02428E] text-white text-center py-16 px-4 mt-8">
        <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own Marketing Plan?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          Join businesses using BeamX Luna to build data-driven marketing strategies in minutes.
        </p>
        <Link
          href="/auth/signup?utm_source=shared_plan"
          className="inline-flex items-center px-8 py-4 bg-white text-[#0F5AE0] font-semibold rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default SharedPlanPage;
