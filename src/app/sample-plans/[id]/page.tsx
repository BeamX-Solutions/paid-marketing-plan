'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, ArrowRight, Target, Users, MessageSquare, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

// Sample plan data for different industries
const samplePlanData: Record<string, {
  title: string;
  industry: string;
  businessName: string;
  overview: string;
  targetAudience: {
    primary: string;
    demographics: string[];
    painPoints: string[];
  };
  valueProposition: string;
  marketingChannels: {
    name: string;
    strategy: string;
    budget: string;
  }[];
  goals: {
    objective: string;
    metric: string;
    timeline: string;
  }[];
  tactics: string[];
  budget: {
    total: string;
    breakdown: { category: string; amount: string; percentage: number }[];
  };
}> = {
  'tech-startup': {
    title: 'Tech Startup Marketing Plan',
    industry: 'Technology',
    businessName: 'TaskFlow Pro',
    overview: 'TaskFlow Pro is a B2B SaaS project management tool designed for remote teams. The platform offers real-time collaboration, automated workflows, and integrations with popular tools like Slack and GitHub.',
    targetAudience: {
      primary: 'Remote-first startups and mid-size tech companies with 10-200 employees',
      demographics: [
        'Decision makers: CTOs, Engineering Managers, Operations Directors',
        'Age range: 28-45 years old',
        'Location: US, UK, Canada, Australia',
        'Company revenue: $1M - $50M annually',
      ],
      painPoints: [
        'Difficulty tracking project progress across distributed teams',
        'Too many disconnected tools causing context switching',
        'Lack of visibility into team workload and capacity',
        'Manual reporting consuming valuable time',
      ],
    },
    valueProposition: 'TaskFlow Pro eliminates the chaos of remote project management by providing a single source of truth for all your team\'s work, reducing meeting time by 40% and increasing project delivery speed by 25%.',
    marketingChannels: [
      { name: 'Content Marketing', strategy: 'SEO-optimized blog posts, case studies, and comparison guides targeting project management keywords', budget: '$3,000/month' },
      { name: 'LinkedIn Ads', strategy: 'Targeted campaigns to decision makers at remote-first companies with lead gen forms', budget: '$5,000/month' },
      { name: 'Product Hunt Launch', strategy: 'Coordinated launch with early adopter community for visibility and backlinks', budget: '$1,000 one-time' },
      { name: 'Webinars', strategy: 'Monthly educational webinars on remote team productivity featuring industry experts', budget: '$1,500/month' },
    ],
    goals: [
      { objective: 'Increase free trial signups', metric: '500 new trials/month', timeline: '6 months' },
      { objective: 'Improve trial-to-paid conversion', metric: '15% conversion rate', timeline: '3 months' },
      { objective: 'Build brand awareness', metric: '10,000 monthly website visitors', timeline: '6 months' },
      { objective: 'Establish thought leadership', metric: '5 guest posts on industry publications', timeline: '6 months' },
    ],
    tactics: [
      'Launch a "Remote Work Playbook" gated content piece for lead generation',
      'Create a free project template library to attract organic traffic',
      'Partner with 3 complementary SaaS tools for co-marketing opportunities',
      'Implement a customer referral program with 20% commission',
      'Develop video tutorials and feature walkthroughs for YouTube',
    ],
    budget: {
      total: '$15,000/month',
      breakdown: [
        { category: 'Paid Advertising', amount: '$6,000', percentage: 40 },
        { category: 'Content Creation', amount: '$4,000', percentage: 27 },
        { category: 'Tools & Software', amount: '$2,000', percentage: 13 },
        { category: 'Events & Webinars', amount: '$2,000', percentage: 13 },
        { category: 'Miscellaneous', amount: '$1,000', percentage: 7 },
      ],
    },
  },
  'ecommerce-fashion': {
    title: 'E-commerce Fashion Marketing Plan',
    industry: 'Retail',
    businessName: 'EcoThread Boutique',
    overview: 'EcoThread Boutique is an online fashion retailer specializing in sustainable, eco-friendly clothing for environmentally conscious young professionals. All products are made from organic materials with ethical manufacturing practices.',
    targetAudience: {
      primary: 'Environmentally conscious millennials and Gen-Z professionals',
      demographics: [
        'Age range: 25-38 years old',
        'Gender: 70% female, 30% male',
        'Income: $50,000 - $120,000 annually',
        'Location: Urban areas in US and Europe',
      ],
      painPoints: [
        'Difficulty finding stylish sustainable fashion options',
        'Concerns about greenwashing from major brands',
        'Limited size inclusivity in eco-fashion',
        'Higher price points for sustainable clothing',
      ],
    },
    valueProposition: 'EcoThread Boutique makes sustainable fashion accessible and stylish, offering transparent supply chains and size-inclusive collections that let you look good while doing good for the planet.',
    marketingChannels: [
      { name: 'Instagram & TikTok', strategy: 'Lifestyle content showcasing sustainable fashion, behind-the-scenes manufacturing, and influencer partnerships', budget: '$4,000/month' },
      { name: 'Email Marketing', strategy: 'Segmented campaigns with sustainability tips, new arrivals, and exclusive member discounts', budget: '$500/month' },
      { name: 'Influencer Partnerships', strategy: 'Micro-influencers (10K-50K followers) in the sustainable lifestyle space', budget: '$3,000/month' },
      { name: 'Pinterest', strategy: 'Shoppable pins and outfit inspiration boards driving direct sales', budget: '$1,500/month' },
    ],
    goals: [
      { objective: 'Increase monthly revenue', metric: '$100,000/month', timeline: '12 months' },
      { objective: 'Grow email subscriber list', metric: '25,000 subscribers', timeline: '6 months' },
      { objective: 'Build Instagram following', metric: '50,000 followers', timeline: '12 months' },
      { objective: 'Improve customer retention', metric: '40% repeat purchase rate', timeline: '6 months' },
    ],
    tactics: [
      'Launch a "Closet Refresh" recycling program offering store credit for old clothes',
      'Create a sustainability certification badge program for products',
      'Partner with eco-friendly lifestyle bloggers for authentic content',
      'Implement a loyalty program with exclusive early access to new collections',
      'Host virtual styling sessions for high-value customers',
    ],
    budget: {
      total: '$12,000/month',
      breakdown: [
        { category: 'Social Media Ads', amount: '$4,500', percentage: 38 },
        { category: 'Influencer Marketing', amount: '$3,500', percentage: 29 },
        { category: 'Content Production', amount: '$2,500', percentage: 21 },
        { category: 'Email Platform & Tools', amount: '$1,000', percentage: 8 },
        { category: 'Miscellaneous', amount: '$500', percentage: 4 },
      ],
    },
  },
  'local-restaurant': {
    title: 'Local Restaurant Marketing Plan',
    industry: 'Food & Beverage',
    businessName: 'Harvest Table',
    overview: 'Harvest Table is a farm-to-table restaurant focusing on locally sourced ingredients and seasonal menus. Located in a vibrant downtown area, it offers a refined casual dining experience with a commitment to supporting local farmers.',
    targetAudience: {
      primary: 'Food enthusiasts and local community members who value quality dining experiences',
      demographics: [
        'Age range: 30-55 years old',
        'Household income: $80,000+ annually',
        'Location: Within 15-mile radius of restaurant',
        'Interests: Local food, sustainability, fine dining',
      ],
      painPoints: [
        'Finding restaurants with genuine commitment to local sourcing',
        'Inconsistent quality at other farm-to-table establishments',
        'Limited options for special dietary requirements',
        'Lack of transparency about ingredient sourcing',
      ],
    },
    valueProposition: 'Harvest Table delivers an authentic farm-to-table experience where every dish tells a story of our local farmers and artisans, creating memorable meals that support our community.',
    marketingChannels: [
      { name: 'Google Business Profile', strategy: 'Optimized listing with photos, menu updates, and review management', budget: '$200/month' },
      { name: 'Instagram', strategy: 'Daily content featuring dishes, farm visits, chef stories, and behind-the-scenes content', budget: '$800/month' },
      { name: 'Local Partnerships', strategy: 'Collaborations with local hotels, event venues, and corporate clients', budget: '$500/month' },
      { name: 'Email Newsletter', strategy: 'Weekly updates on seasonal menus, events, and exclusive offers', budget: '$200/month' },
    ],
    goals: [
      { objective: 'Increase weekly covers', metric: '400 covers/week', timeline: '6 months' },
      { objective: 'Build reservation list', metric: '2,000 email subscribers', timeline: '6 months' },
      { objective: 'Improve Google rating', metric: '4.7+ star rating', timeline: '3 months' },
      { objective: 'Grow private events', metric: '4 private events/month', timeline: '6 months' },
    ],
    tactics: [
      'Launch "Meet the Farmer" monthly dinner series featuring local producers',
      'Create a seasonal tasting menu with wine pairing options',
      'Partner with local hotels for exclusive dining packages',
      'Implement a VIP loyalty program for frequent diners',
      'Host cooking classes featuring seasonal ingredients',
    ],
    budget: {
      total: '$3,000/month',
      breakdown: [
        { category: 'Social Media & Content', amount: '$1,200', percentage: 40 },
        { category: 'Local Advertising', amount: '$600', percentage: 20 },
        { category: 'Events & Partnerships', amount: '$800', percentage: 27 },
        { category: 'Tools & Software', amount: '$400', percentage: 13 },
      ],
    },
  },
  'consulting-firm': {
    title: 'Consulting Firm Marketing Plan',
    industry: 'Professional Services',
    businessName: 'Apex Digital Consulting',
    overview: 'Apex Digital Consulting is a management consulting firm specializing in digital transformation for mid-size companies. We help organizations modernize their operations, implement new technologies, and build digital-first cultures.',
    targetAudience: {
      primary: 'C-suite executives and senior leaders at mid-size companies undergoing digital transformation',
      demographics: [
        'Company size: 200-2,000 employees',
        'Industry: Manufacturing, Healthcare, Financial Services',
        'Annual revenue: $50M - $500M',
        'Decision makers: CEO, CTO, COO, VP of Operations',
      ],
      painPoints: [
        'Legacy systems hindering operational efficiency',
        'Difficulty attracting digital talent',
        'Unclear roadmap for digital transformation',
        'Previous failed technology implementations',
      ],
    },
    valueProposition: 'Apex Digital Consulting delivers practical digital transformation strategies backed by hands-on implementation support, reducing transformation risk by 60% and accelerating time-to-value by 40%.',
    marketingChannels: [
      { name: 'Thought Leadership Content', strategy: 'Whitepapers, industry reports, and executive guides published quarterly', budget: '$4,000/month' },
      { name: 'LinkedIn', strategy: 'Executive brand building, sponsored content, and targeted InMail campaigns', budget: '$3,000/month' },
      { name: 'Speaking Engagements', strategy: 'Industry conferences and executive roundtables', budget: '$2,500/month' },
      { name: 'Strategic Partnerships', strategy: 'Alliances with technology vendors and industry associations', budget: '$1,500/month' },
    ],
    goals: [
      { objective: 'Generate qualified leads', metric: '20 MQLs/month', timeline: '6 months' },
      { objective: 'Close new clients', metric: '2 new engagements/quarter', timeline: 'Quarterly' },
      { objective: 'Build thought leadership', metric: '4 speaking engagements/quarter', timeline: 'Quarterly' },
      { objective: 'Expand average deal size', metric: '$500K average engagement', timeline: '12 months' },
    ],
    tactics: [
      'Publish annual "State of Digital Transformation" industry report',
      'Launch executive dinner series in key markets',
      'Create a digital maturity assessment tool for lead generation',
      'Develop case study videos featuring client success stories',
      'Establish a podcast featuring transformation leaders',
    ],
    budget: {
      total: '$15,000/month',
      breakdown: [
        { category: 'Content Development', amount: '$5,000', percentage: 33 },
        { category: 'Digital Marketing', amount: '$4,000', percentage: 27 },
        { category: 'Events & Speaking', amount: '$4,000', percentage: 27 },
        { category: 'Tools & Research', amount: '$2,000', percentage: 13 },
      ],
    },
  },
  'fitness-studio': {
    title: 'Fitness Studio Marketing Plan',
    industry: 'Health & Wellness',
    businessName: 'Peak Performance Studio',
    overview: 'Peak Performance Studio is a boutique fitness studio offering personalized training programs, small group classes, and nutrition coaching. We focus on sustainable fitness journeys rather than quick fixes.',
    targetAudience: {
      primary: 'Health-conscious professionals seeking personalized fitness solutions',
      demographics: [
        'Age range: 28-50 years old',
        'Income: $75,000+ annually',
        'Location: Within 5-mile radius of studio',
        'Lifestyle: Busy professionals, parents, fitness enthusiasts',
      ],
      painPoints: [
        'Intimidated by large commercial gyms',
        'Lack of personalized attention and guidance',
        'Difficulty maintaining consistency',
        'Previous injuries requiring specialized training',
      ],
    },
    valueProposition: 'Peak Performance Studio delivers personalized fitness experiences in an intimate, supportive environment where every member gets the attention they deserve to achieve lasting results.',
    marketingChannels: [
      { name: 'Instagram & Facebook', strategy: 'Transformation stories, workout tips, and community highlights', budget: '$1,500/month' },
      { name: 'Google Local Ads', strategy: 'Targeted search ads for fitness-related keywords in local area', budget: '$1,000/month' },
      { name: 'Referral Program', strategy: 'Member referral rewards with free sessions and merchandise', budget: '$500/month' },
      { name: 'Local Partnerships', strategy: 'Corporate wellness programs and local business collaborations', budget: '$500/month' },
    ],
    goals: [
      { objective: 'Grow membership base', metric: '200 active members', timeline: '12 months' },
      { objective: 'Improve member retention', metric: '85% retention rate', timeline: '6 months' },
      { objective: 'Increase class utilization', metric: '75% average class capacity', timeline: '3 months' },
      { objective: 'Launch corporate wellness', metric: '5 corporate clients', timeline: '12 months' },
    ],
    tactics: [
      'Launch 6-week transformation challenge with prizes',
      'Create free community workout events in local parks',
      'Develop a mobile app for class booking and progress tracking',
      'Partner with local nutritionists for holistic wellness packages',
      'Host monthly member appreciation events',
    ],
    budget: {
      total: '$5,000/month',
      breakdown: [
        { category: 'Digital Advertising', amount: '$2,000', percentage: 40 },
        { category: 'Content & Social Media', amount: '$1,200', percentage: 24 },
        { category: 'Member Incentives', amount: '$1,000', percentage: 20 },
        { category: 'Events & Partnerships', amount: '$800', percentage: 16 },
      ],
    },
  },
  'online-education': {
    title: 'Online Education Marketing Plan',
    industry: 'Education',
    businessName: 'SkillBridge Academy',
    overview: 'SkillBridge Academy is an e-learning platform providing professional development courses focused on in-demand skills like data analytics, digital marketing, and project management for career advancement.',
    targetAudience: {
      primary: 'Working professionals seeking career advancement through skill development',
      demographics: [
        'Age range: 25-45 years old',
        'Education: Bachelor\'s degree or higher',
        'Career stage: Mid-level professionals seeking promotion',
        'Location: Global, English-speaking markets',
      ],
      painPoints: [
        'Limited time for traditional education',
        'Expensive degree programs with uncertain ROI',
        'Skills gap between current role and desired position',
        'Lack of practical, industry-relevant curriculum',
      ],
    },
    valueProposition: 'SkillBridge Academy accelerates your career with practical, industry-recognized courses taught by real practitioners, with flexible learning that fits your busy schedule.',
    marketingChannels: [
      { name: 'Google Ads', strategy: 'Search campaigns targeting career development and skill-specific keywords', budget: '$6,000/month' },
      { name: 'LinkedIn', strategy: 'Sponsored content and targeted ads to professionals by industry and seniority', budget: '$4,000/month' },
      { name: 'Content Marketing', strategy: 'SEO blog posts, free resources, and career guides', budget: '$2,500/month' },
      { name: 'YouTube', strategy: 'Free tutorial videos and course previews to build audience', budget: '$2,000/month' },
    ],
    goals: [
      { objective: 'Increase course enrollments', metric: '1,000 enrollments/month', timeline: '6 months' },
      { objective: 'Build email list', metric: '50,000 subscribers', timeline: '12 months' },
      { objective: 'Improve course completion', metric: '70% completion rate', timeline: '6 months' },
      { objective: 'Expand course catalog', metric: '25 total courses', timeline: '12 months' },
    ],
    tactics: [
      'Launch free mini-courses as lead magnets for each skill track',
      'Create employer partnership program for bulk enrollments',
      'Implement career coaching add-on service',
      'Develop certification partnerships with industry associations',
      'Build student success stories and testimonial campaigns',
    ],
    budget: {
      total: '$18,000/month',
      breakdown: [
        { category: 'Paid Advertising', amount: '$10,000', percentage: 56 },
        { category: 'Content Production', amount: '$4,500', percentage: 25 },
        { category: 'Tools & Platform', amount: '$2,000', percentage: 11 },
        { category: 'Partnerships & Events', amount: '$1,500', percentage: 8 },
      ],
    },
  },
};

export default function SamplePlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;
  const plan = samplePlanData[planId];

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-8">The sample plan you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/sample-plans" className="text-[#1e3a5f] hover:text-[#152a45] font-medium">
            ← Back to Sample Plans
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/sample-plans"
            className="inline-flex items-center text-[#1e3a5f] hover:text-[#152a45] font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sample Plans
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider">
                {plan.industry}
              </span>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
                {plan.title}
              </h1>
              <p className="text-lg text-gray-600 mt-2">{plan.businessName}</p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link href="/questionnaire">
                <button className="bg-[#1e3a5f] hover:bg-[#152a45] text-white px-6 py-3 text-sm font-semibold rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer inline-flex items-center">
                  Create Your Own Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Business Overview</h2>
                <p className="text-gray-600 leading-relaxed">{plan.overview}</p>
              </div>

              {/* Target Audience */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Target Audience</h2>
                </div>
                <p className="text-gray-800 font-medium mb-4">{plan.targetAudience.primary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Demographics</h3>
                    <ul className="space-y-2">
                      {plan.targetAudience.demographics.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pain Points</h3>
                    <ul className="space-y-2">
                      {plan.targetAudience.painPoints.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-600">
                          <Target className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="bg-[#1e3a5f] rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Value Proposition</h2>
                </div>
                <p className="text-lg leading-relaxed text-blue-100">{plan.valueProposition}</p>
              </div>

              {/* Marketing Channels */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Marketing Channels</h2>
                <div className="space-y-4">
                  {plan.marketingChannels.map((channel, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                        <span className="text-sm font-medium text-[#1e3a5f] bg-blue-50 px-3 py-1 rounded-full">
                          {channel.budget}
                        </span>
                      </div>
                      <p className="text-gray-600">{channel.strategy}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Tactics */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Key Tactics</h2>
                <ul className="space-y-3">
                  {plan.tactics.map((tactic, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-green-50 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                      </div>
                      <span className="text-gray-600">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Goals */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Goals & KPIs</h2>
                </div>
                <div className="space-y-4">
                  {plan.goals.map((goal, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-medium text-gray-900 mb-1">{goal.objective}</h3>
                      <p className="text-sm text-[#1e3a5f] font-semibold">{goal.metric}</p>
                      <p className="text-xs text-gray-500 mt-1">Timeline: {goal.timeline}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-green-50 w-10 h-10 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Budget</h2>
                </div>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-gray-900">{plan.budget.total}</span>
                </div>
                <div className="space-y-3">
                  {plan.budget.breakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium text-gray-900">{item.amount}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-[#1e3a5f] h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] rounded-2xl p-6 text-white text-center">
                <h3 className="text-lg font-bold mb-3">Ready for Your Own Plan?</h3>
                <p className="text-blue-100 text-sm mb-6">
                  Get a customized marketing plan tailored to your specific business needs.
                </p>
                <Link href="/questionnaire">
                  <button className="w-full bg-white text-[#1e3a5f] px-6 py-3 text-sm font-semibold rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer">
                    Create Your Plan
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
