'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';
import { ArrowRight, CheckCircle, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Generate Your Complete{' '}
              <span className="text-gray-900">Marketing Plan</span>{' '}
              in Minutes
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Our AI-powered questionnaire creates a comprehensive marketing strategy tailored specifically to your business. No marketing experience required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/questionnaire">
                <Button
                  size="lg"
                  className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-8 py-4 text-base rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Create Your Plan Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sample-plans">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-white px-8 py-4 text-base rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  View Sample Plans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Marketing Success
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered system guides you through a proven framework to create a complete marketing strategy that actually works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-gray-200 bg-white hover:border-[#1e3a5f]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1e3a5f] transition-colors duration-300">
                <Target className="w-7 h-7 text-[#1e3a5f] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Questionnaire
              </h3>
              <p className="text-gray-600 mb-4">
                Our intelligent questionnaire adapts to your industry and business model,
                ensuring you get the most relevant recommendations.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Industry-specific questions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  9-square marketing framework
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Progress saving & resuming
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 bg-white hover:border-[#1e3a5f]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="bg-purple-50 w-14 h-14 rounded-xl group-hover:bg-purple-600 transition-colors duration-300 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                Claude AI analyzes your responses to identify opportunities,
                competitive advantages, and create personalized strategies.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Advanced AI reasoning
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Competitive analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Risk assessment
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 bg-white hover:border-[#1e3a5f]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="bg-green-50 w-14 h-14 rounded-xl group-hover:bg-green-600 transition-colors duration-300 flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Complete Implementation
              </h3>
              <p className="text-gray-600 mb-4">
                Get both a visual one-page plan and detailed implementation guide
                with timelines, KPIs, and specific action steps.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  One-page visual plan
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Detailed action steps
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  PDF download & sharing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#f0f4f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to your complete marketing plan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group cursor-pointer">
              <div className="bg-[#1e3a5f] text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Answer Smart Questions
              </h3>
              <p className="text-gray-600">
                Complete our intelligent questionnaire covering all 9 squares of the marketing framework.
                Takes 15-20 minutes.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="bg-[#1e3a5f] text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:shadow-2xl hover:scale-110 transition-all duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI Analyzes & Strategizes
              </h3>
              <p className="text-gray-600">
                Claude AI analyzes your responses, identifies opportunities, and creates
                a personalized marketing strategy for your business.
              </p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="bg-[#1e3a5f] text-white w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold mx-auto mb-6 hover:shadow-2xl hover:scale-110 transition-all duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get Your Complete Plan
              </h3>
              <p className="text-gray-600">
                Receive your one-page marketing plan plus detailed implementation guide
                with specific action steps and timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-[#1e3a5f] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join thousands of businesses that have created winning marketing strategies with our AI-powered platform.
          </p>
          <Link href="/questionnaire">
            <Button
              size="lg"
              className="bg-white text-[#1e3a5f] hover:bg-gray-100 hover:scale-105 px-10 py-5 text-lg font-semibold shadow-2xl transition-all duration-300 cursor-pointer rounded-lg"
            >
              Create Your Marketing Plan Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-blue-200 mt-6 text-base">
            No marketing experience required
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
