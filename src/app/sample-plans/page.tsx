'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Star } from 'lucide-react';

// Static sample plans data
const SAMPLE_PLANS = [
  {
    id: 'b2b-saas',
    title: 'B2B SaaS Marketing Plan',
    industry: 'B2B Software',
    description: 'Complete marketing strategy for a project management SaaS platform targeting small to medium-sized businesses.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-blue-500 to-cyan-500',
    plan: {
      onePagePlan: {
        before: {
          targetMarket: 'Small to medium-sized businesses (10-200 employees) in technology, consulting, and creative industries with distributed teams struggling with project visibility and collaboration.',
          message: 'Transform team chaos into coordinated success. Our project management platform gives you real-time visibility into every project, task, and milestone - so nothing falls through the cracks.',
          media: [
            'LinkedIn advertising targeting project managers and team leads',
            'Content marketing (blog posts, case studies, webinars)',
            'SEO for "project management software" and related keywords'
          ]
        },
        during: {
          leadCapture: 'Free 14-day trial with no credit card required. Interactive product demo videos and ROI calculator on landing pages. Lead magnets include "Ultimate Project Management Playbook" and team efficiency assessment tool.',
          leadNurture: 'Automated email sequence highlighting different features each day during trial. Weekly webinars on project management best practices. Dedicated customer success manager assigned during trial period.',
          salesConversion: 'Live demo with solutions engineer showcasing custom workflows. Volume-based pricing tiers with annual discount. 30-day money-back guarantee to reduce purchase risk.'
        },
        after: {
          deliverExperience: 'Comprehensive onboarding program with dedicated implementation specialist. Video tutorials and certification program. 24/7 customer support via chat, email, and phone.',
          lifetimeValue: 'Quarterly business reviews to identify expansion opportunities. Premium features and add-ons for growing teams. Enterprise tier for companies scaling beyond 200 employees.',
          referrals: 'Affiliate program offering 20% recurring commission. Customer advocacy program featuring success stories. Integration partnerships with complementary tools.'
        }
      },
      implementationGuide: {
        executiveSummary: 'This comprehensive marketing plan positions the SaaS platform as the premier solution for distributed teams seeking better project visibility and collaboration. The strategy focuses on demonstrating clear ROI through free trials, nurturing prospects with educational content, and expanding revenue through strategic upsells and referrals.',
        actionPlans: {
          phase1: 'Set up LinkedIn advertising campaigns targeting decision-makers. Launch content calendar with 2 blog posts per week. Optimize website conversion paths and implement trial signup flow. Create foundational email nurture sequences.',
          phase2: 'Launch monthly webinar series. Develop case studies from early customers. Implement in-app messaging for feature adoption. Begin partnership discussions with complementary tools. Expand content to include video tutorials.',
          phase3: 'Launch customer advocacy program and referral system. Implement advanced analytics for customer health scoring. Expand to new market segments based on success patterns. Develop enterprise sales playbook for larger deals.'
        },
        timeline: 'Month 1-3: Foundation building and lead generation. Month 4-6: Optimize conversion and launch expansion programs. Month 7-12: Scale what works and expand into new segments.',
        resources: 'Marketing budget: $15K-25K monthly. Team: Content marketer, demand gen specialist, customer success manager. Tools: Marketing automation, analytics platform, CRM integration.',
        kpis: 'Trial signups, trial-to-paid conversion rate, customer acquisition cost, monthly recurring revenue, churn rate, net promoter score, customer lifetime value.',
        templates: 'Email nurture sequences, LinkedIn ad templates, webinar presentation decks, case study framework, sales demo script, onboarding checklist.'
      },
      strategicInsights: {
        strengths: [
          'Strong product-market fit with distributed teams',
          'Frictionless trial experience builds confidence',
          'Recurring revenue model provides predictability'
        ],
        opportunities: [
          'Remote work trend expanding target market',
          'Integration partnerships create network effects',
          'Enterprise segment represents significant upside'
        ],
        positioning: 'Position as the most intuitive, collaborative project management solution that doesn\'t require extensive training or complex setup.',
        competitiveAdvantage: 'Superior user experience, faster time-to-value, and genuine customer success focus differentiate from feature-bloated competitors.',
        growthPotential: 'High scalability potential with land-and-expand model. Average customer grows team size 3x within first year, expanding revenue naturally.',
        risks: [
          'Competitive market with established players',
          'Economic downturn could impact new software purchases',
          'Customer churn if onboarding experience isn\'t excellent'
        ],
        investments: [
          'Product marketing content and education',
          'Customer success team to ensure retention',
          'Strategic partnerships for distribution'
        ],
        roi: 'Expected 3:1 return on marketing spend within 6 months, improving to 5:1 by month 12 as customer lifetime value increases and acquisition costs decrease through referrals and organic channels.'
      }
    }
  },
  {
    id: 'fitness-studio',
    title: 'Boutique Fitness Studio Marketing Plan',
    industry: 'Fitness & Wellness',
    description: 'Growth strategy for a yoga and pilates studio targeting health-conscious professionals in urban areas.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-green-500 to-emerald-500',
    plan: {
      onePagePlan: {
        before: {
          targetMarket: 'Health-conscious professionals aged 25-45, primarily women, earning $60K+, living within 3 miles of studio location. Values wellness, community, and work-life balance.',
          message: 'Find your strength, balance, and community. Our boutique studio offers personalized attention in small classes where you\'re not just another face in the crowd - you\'re family.',
          media: [
            'Instagram and Facebook with organic content and targeted ads',
            'Google My Business and local SEO',
            'Partnerships with local businesses (corporate wellness programs)'
          ]
        },
        during: {
          leadCapture: 'Free first class offer for new clients. Instagram contests and challenges. Corporate wellness program partnerships. Referral incentives from existing members.',
          leadNurture: 'Welcome email series introducing instructors and class types. SMS reminders and motivational content. Monthly community events (workshops, social gatherings). Private Facebook group for members.',
          salesConversion: 'Tiered membership options (unlimited, 10-class pack, drop-in). New member discount for first month. Flexible contract terms (no long-term commitment). Family and friend packages.'
        },
        after: {
          deliverExperience: 'Personalized attention from instructors who know your name and goals. Premium amenities (towels, filtered water, showers). Member appreciation events and milestone celebrations.',
          lifetimeValue: 'Progressive class levels to maintain engagement. Workshops and specialty classes (aerial yoga, meditation). Retail products (mats, apparel, supplements). Private sessions and personal training.',
          referrals: 'Member-get-member program (free class for both parties). Ambassador program for super-fans. Social media features and testimonials. Community challenges with prizes.'
        }
      },
      implementationGuide: {
        executiveSummary: 'This marketing plan establishes the studio as the premier boutique fitness destination in the local area, focusing on community building, personalized experience, and convenient location. The strategy emphasizes social proof, word-of-mouth marketing, and creating a lifestyle brand rather than just a gym.',
        actionPlans: {
          phase1: 'Optimize Google My Business listing and gather initial reviews. Launch Instagram content strategy (3-5 posts/week). Create and promote free first class offer. Reach out to 10 local businesses for corporate wellness partnerships.',
          phase2: 'Host grand reopening or special event to generate buzz. Launch member referral program. Begin Facebook advertising targeting local demographics. Create email automation for new member onboarding and retention.',
          phase3: 'Expand class offerings based on member feedback. Launch retail component. Develop ambassador program with top members. Consider second location or mobile/virtual options.'
        },
        timeline: 'Month 1: Local SEO and social media foundation. Month 2-3: Referral and partnership programs. Month 4-6: Advertising and community events. Month 7-12: Optimize, expand offerings, scale.',
        resources: 'Marketing budget: $2K-4K monthly. Staff: Studio manager handles marketing, instructors create content. Tools: Social media scheduler, email marketing platform, booking software with automation.',
        kpis: 'New member acquisitions, member retention rate, average revenue per member, class attendance rates, social media engagement, online reviews and ratings, referral conversions.',
        templates: 'Social media content calendar, email welcome series, referral program materials, corporate wellness proposal, event planning checklist, review request scripts.'
      },
      strategicInsights: {
        strengths: [
          'Strong local community and word-of-mouth potential',
          'Personalized experience differentiates from big-box gyms',
          'Recurring revenue from memberships provides stability'
        ],
        opportunities: [
          'Growing wellness trend and preventive health focus',
          'Corporate wellness programs expanding rapidly',
          'Virtual/hybrid class options expand market reach'
        ],
        positioning: 'Position as the neighborhood\'s wellness sanctuary - a place where fitness meets community, and every member receives personal attention.',
        competitiveAdvantage: 'Intimate class sizes, experienced instructors with personality, and genuine community atmosphere that large chains cannot replicate.',
        growthPotential: 'Strong potential for multi-location expansion or franchise model. Average studio can grow to 200-300 active members with 60-70% retention.',
        risks: [
          'High competition from boutique studios and big-box gyms',
          'Seasonal attendance fluctuations',
          'Instructor turnover can impact member relationships'
        ],
        investments: [
          'Premium instructor recruitment and retention',
          'Community events and member experiences',
          'Social media content creation and engagement'
        ],
        roi: 'Expected break-even on marketing spend within 3-4 months. Member lifetime value of $2,000-3,000 with average 18-month retention creates strong returns on acquisition costs under $200.'
      }
    }
  },
  {
    id: 'restaurant',
    title: 'Farm-to-Table Restaurant Marketing Plan',
    industry: 'Restaurant & Food Service',
    description: 'Marketing strategy for an upscale casual restaurant emphasizing local, seasonal ingredients and sustainable practices.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-orange-500 to-red-500',
    plan: {
      onePagePlan: {
        before: {
          targetMarket: 'Affluent foodies aged 30-55, household income $100K+, who value quality ingredients, sustainable practices, and unique dining experiences. Secondary audience: special occasion diners and tourists.',
          message: 'Taste the season. Every dish tells the story of our local farmers, changing with the harvest to bring you the freshest, most flavorful experience in the city.',
          media: [
            'Instagram showcasing daily specials and seasonal dishes',
            'Google My Business and review platforms (Yelp, TripAdvisor)',
            'Local food blog and influencer partnerships'
          ]
        },
        during: {
          leadCapture: 'Online reservation system with email capture. Newsletter signup offering exclusive tasting event invitations. Instagram followers through behind-the-scenes content and chef stories.',
          leadNurture: 'Email newsletter featuring seasonal menu changes and farm partner stories. Exclusive previews of new menu items. Cooking tips and recipe sharing. Special event invitations (wine dinners, chef\'s table).',
          salesConversion: 'Strategic pricing reflecting quality positioning. Tasting menu option for first-time diners. Gift cards and dining credits. Private dining room for special occasions. Online ordering for takeout.'
        },
        after: {
          deliverExperience: 'Exceptional service with knowledgeable staff about ingredients and sourcing. Seasonal menu rotation keeps experience fresh. Chef interaction and kitchen tours for interested guests.',
          lifetimeValue: 'Loyalty program tracking visits and offering surprise perks. Exclusive member events (farm visits, cooking classes). Catering services for private events. Branded merchandise and specialty products.',
          referrals: 'Instagram-worthy plating encourages social sharing. Referral rewards for bringing new diners. Table cards with hashtag and handles. Partner with local hotels for guest recommendations.'
        }
      },
      implementationGuide: {
        executiveSummary: 'This marketing plan positions the restaurant as the premier farm-to-table dining destination, leveraging the growing consumer interest in sustainable, locally-sourced food. The strategy emphasizes storytelling, visual appeal, and creating memorable experiences that diners want to share with others.',
        actionPlans: {
          phase1: 'Professional food photography of signature dishes. Daily Instagram stories showing farm visits and food prep. Optimize Google My Business and respond to all reviews. Partner with 3-5 food bloggers for reviews.',
          phase2: 'Launch email newsletter with seasonal menu announcements. Host quarterly chef\'s table dinners. Create "Meet the Farmer" content series. Begin targeted Facebook ads for special events and new seasonal menus.',
          phase3: 'Develop loyalty program for repeat diners. Launch catering division for private events. Create cooking class series. Explore retail opportunities (sauces, spice blends, cookbooks).'
        },
        timeline: 'Month 1-2: Content creation and social media presence. Month 3-4: Influencer partnerships and PR. Month 5-6: Email marketing and loyalty program. Month 7-12: Event programming and expansion into catering.',
        resources: 'Marketing budget: $3K-6K monthly. Staff: Marketing manager, content creator/photographer. External: PR agency (optional), influencer partnerships. Tools: Reservation system, email platform, social media management.',
        kpis: 'Average check size, table turnover rate, reservation fill rate, repeat customer percentage, online reviews (quantity and rating), social media followers and engagement, email open rates.',
        templates: 'Instagram content calendar, email newsletter template, influencer partnership brief, event planning checklist, review response templates, staff training materials.'
      },
      strategicInsights: {
        strengths: [
          'Unique positioning in local market with farm partnerships',
          'Strong storytelling opportunities around food sourcing',
          'High-margin business with affluent target market'
        ],
        opportunities: [
          'Growing consumer interest in sustainable dining',
          'Catering and private events for recurring revenue',
          'Brand extension through retail products and experiences'
        ],
        positioning: 'Position as the authentic farm-to-table experience - not just a marketing claim, but a genuine commitment to local farmers and seasonal cooking.',
        competitiveAdvantage: 'Direct relationships with local farms, rotating seasonal menu that can\'t be replicated, and genuine passion for sustainable practices distinguishes from competitors claiming "farm-to-table."',
        growthPotential: 'Strong potential for second location, catering division, or brand licensing. Average revenue per location: $1.5M-3M annually with 10-15% net margins.',
        risks: [
          'Seasonal ingredient availability affects menu consistency',
          'Higher food costs from local sourcing',
          'Economic downturn impacts discretionary dining spending'
        ],
        investments: [
          'Professional photography and content creation',
          'Staff training on ingredient sourcing and storytelling',
          'Strategic PR and influencer partnerships'
        ],
        roi: 'Marketing investment should drive 15-20% increase in covers within 6 months. Focus on average check increase and repeat customer rate as key success metrics. Strong word-of-mouth reduces long-term acquisition costs.'
      }
    }
  },
  {
    id: 'consulting',
    title: 'Business Consulting Firm Marketing Plan',
    industry: 'Professional Services',
    description: 'Lead generation and thought leadership strategy for a management consulting firm specializing in digital transformation.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-purple-500 to-indigo-500',
    plan: {
      onePagePlan: {
        before: {
          targetMarket: 'C-suite executives and senior leaders at mid-market companies ($50M-$500M revenue) facing digital transformation challenges. Industries: Manufacturing, retail, financial services. Decision-makers aged 40-60.',
          message: 'Navigate digital transformation with confidence. We\'ve helped 100+ companies successfully modernize operations, increase efficiency, and drive sustainable growth without disrupting business.',
          media: [
            'LinkedIn thought leadership and targeted advertising',
            'Speaking engagements at industry conferences',
            'Published articles in trade publications and Harvard Business Review'
          ]
        },
        during: {
          leadCapture: 'Comprehensive digital transformation assessment tool (interactive). Exclusive research reports and whitepapers. Webinar series on transformation case studies. LinkedIn connections and engagement.',
          leadNurture: 'Multi-touch email campaign with educational content. Personalized video messages from partners. Industry-specific case studies. Quarterly executive roundtables (virtual and in-person).',
          salesConversion: 'Discovery sessions with no commitment. Phased engagement approach (assessment → strategy → implementation). Success-based fee structures for qualified clients. Executive sponsor matching.'
        },
        after: {
          deliverExperience: 'Dedicated engagement team with weekly touchpoints. Regular executive steering committee meetings. Clear milestone tracking and reporting. Change management support for staff.',
          lifetimeValue: 'Expand from strategy into implementation services. Ongoing advisory retainers post-project. Training and capability building programs. Speaking opportunities and co-marketing.',
          referrals: 'Structured referral network within private equity and board circles. Client advisory board program. Co-authored case studies and conference presentations. Success story showcases.'
        }
      },
      implementationGuide: {
        executiveSummary: 'This marketing plan establishes the consulting firm as the trusted advisor for digital transformation, emphasizing proven methodology, industry expertise, and successful track record. The strategy focuses on thought leadership, relationship building, and demonstrating ROI through case studies and data.',
        actionPlans: {
          phase1: 'Launch LinkedIn thought leadership campaign (3-4 posts/week from partners). Develop signature assessment tool. Create 3 foundational case studies. Apply to speak at 2-3 industry conferences.',
          phase2: 'Launch quarterly webinar series. Publish research report on industry transformation trends. Begin targeted LinkedIn advertising to C-suite. Activate existing client referrals through structured program.',
          phase3: 'Launch executive roundtable program in key cities. Develop implementation team for expanded service offerings. Create proprietary methodology framework. Pursue awards and recognition.'
        },
        timeline: 'Month 1-3: Content development and thought leadership foundation. Month 4-6: Webinars, speaking, and lead generation. Month 7-12: Referral activation and service expansion.',
        resources: 'Marketing budget: $10K-20K monthly. Team: Marketing director, content writer, business development lead. External: Speaking coach, PR advisor. Tools: LinkedIn Sales Navigator, marketing automation, CRM.',
        kpis: 'Qualified leads generated, discovery meeting conversion rate, proposal win rate, average engagement value, pipeline value, client lifetime value, LinkedIn followers and engagement, speaking engagements.',
        templates: 'LinkedIn content calendar, webinar presentation deck, case study framework, assessment tool, proposal template, client success story format, email nurture sequences.'
      },
      strategicInsights: {
        strengths: [
          'Deep industry expertise and proven track record',
          'Strong relationships with key decision-makers',
          'High-value, long-term client engagements'
        ],
        opportunities: [
          'Digital transformation urgency accelerated by pandemic',
          'Private equity firms seeking portfolio company optimization',
          'Adjacent services (training, interim management) for expansion'
        ],
        positioning: 'Position as the digital transformation partner that combines strategic vision with practical implementation - not just strategy slides, but real results.',
        competitiveAdvantage: 'Industry-specific expertise, proprietary methodology, and focus on sustainable change rather than just technology implementation separates from generalist consultants.',
        growthPotential: 'High scalability through associate model and productized offerings. Average client lifetime value: $500K-2M. Strong expansion potential through referrals and repeat engagements.',
        risks: [
          'Long sales cycles (6-12 months) require patience',
          'Economic uncertainty may pause transformation investments',
          'Competition from Big 4 consulting firms'
        ],
        investments: [
          'Thought leadership and content marketing',
          'Strategic conference sponsorships and speaking',
          'Proprietary IP and methodology development'
        ],
        roi: 'Expected 5:1 return on marketing investment within 12 months. Focus on lifetime client value and referral generation. Single client acquisition can generate $500K+ in revenue, justifying significant investment in relationship building.'
      }
    }
  },
  {
    id: 'ecommerce',
    title: 'Sustainable Fashion E-commerce Marketing Plan',
    industry: 'E-commerce & Retail',
    description: 'Digital marketing strategy for an online sustainable clothing brand targeting eco-conscious millennials and Gen Z consumers.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-pink-500 to-rose-500',
    plan: {
      onePagePlan: {
        before: {
          targetMarket: 'Environmentally conscious women aged 22-40, college-educated, household income $50K+, active on social media, values ethical production and sustainable materials. Urban and suburban locations.',
          message: 'Look good, feel good, do good. Every piece in our collection is crafted from sustainable materials by fairly-paid artisans - because fashion shouldn\'t cost the earth.',
          media: [
            'Instagram and TikTok with authentic sustainability content',
            'Facebook and Pinterest ads targeting eco-conscious shoppers',
            'Influencer partnerships with sustainability advocates'
          ]
        },
        during: {
          leadCapture: 'Email popup offering 15% off first order. Quiz: "Find Your Sustainable Style." Instagram shopping tags. Sustainability impact calculator showing environmental savings.',
          leadNurture: 'Welcome series introducing brand story and values. Weekly style tips and outfit inspiration. Behind-the-scenes content from production. Educational content about sustainable fashion.',
          salesConversion: 'Free shipping over $75. 60-day return policy. Buy now, pay later options. Size guides and fit guarantee. Customer photos and reviews prominently featured.'
        },
        after: {
          deliverExperience: 'Plastic-free, recyclable packaging. Handwritten thank you notes. Care instructions for garment longevity. Styling suggestions for purchased items.',
          lifetimeValue: 'Seasonal collection releases keep customers returning. Loyalty points program. VIP early access to new collections. Subscription box option for regular shoppers. Repair and recycling program.',
          referrals: 'Give $20, get $20 referral program. User-generated content campaigns. Brand ambassador program for passionate customers. Impact reports showing collective environmental benefit.'
        }
      },
      implementationGuide: {
        executiveSummary: 'This marketing plan positions the brand as a leader in sustainable fashion, emphasizing authenticity, transparency, and style. The strategy leverages social media, influencer partnerships, and community building to create a movement around conscious consumption rather than just selling clothes.',
        actionPlans: {
          phase1: 'Optimize website conversion rate (product pages, checkout). Launch Instagram and TikTok content strategy (daily posts). Set up email marketing automation. Begin Facebook/Instagram advertising testing.',
          phase2: 'Launch influencer partnership program (10-15 micro-influencers). Create UGC campaign encouraging customer photos. Expand to Pinterest advertising. Launch loyalty program. Develop brand ambassador tier.',
          phase3: 'Introduce subscription box offering. Launch clothing repair and recycling program. Expand product line based on customer data. Explore retail popup shops in key markets. Develop brand partnerships.'
        },
        timeline: 'Month 1-2: Website optimization and content foundation. Month 3-4: Influencer partnerships and paid advertising. Month 5-6: Loyalty and referral programs. Month 7-12: Product expansion and retail exploration.',
        resources: 'Marketing budget: $8K-15K monthly. Team: Marketing manager, content creator, customer service. External: Influencer agency, photographer. Tools: Shopify, email platform, social media management, analytics.',
        kpis: 'Website traffic, conversion rate, average order value, customer acquisition cost, customer lifetime value, email list growth, social media followers and engagement, return customer rate.',
        templates: 'Email automation sequences, social media content calendar, influencer partnership brief, UGC campaign guidelines, customer loyalty program structure, product photography guidelines.'
      },
      strategicInsights: {
        strengths: [
          'Strong brand values aligned with target market priorities',
          'Visual product category ideal for social media marketing',
          'Growing market for sustainable fashion alternatives'
        ],
        opportunities: [
          'Expanding eco-conscious consumer segment, especially Gen Z',
          'Subscription models creating predictable revenue',
          'Brand partnerships and collaborations for expansion'
        ],
        positioning: 'Position as the accessible sustainable fashion brand - proving that eco-friendly clothing can be stylish, affordable, and transparent about its impact.',
        competitiveAdvantage: 'Genuine sustainability credentials, transparent supply chain, and community-focused brand ethos differentiate from "greenwashing" competitors.',
        growthPotential: 'Strong scaling potential through e-commerce model. Average customer lifetime value: $300-500. Potential for international expansion and wholesale partnerships.',
        risks: [
          'Higher production costs from sustainable materials',
          'Intense competition in online fashion space',
          'Supply chain disruptions affecting sustainable suppliers'
        ],
        investments: [
          'High-quality content creation and photography',
          'Influencer and community building programs',
          'Customer education about sustainability'
        ],
        roi: 'Target 3-4x return on ad spend within 6 months. Focus on building repeat customer base to reduce reliance on paid advertising. Email and organic social should generate 40%+ of revenue by month 12.'
      }
    }
  }
];

export default function SamplePlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedPlan) {
    const { onePagePlan, implementationGuide, strategicInsights } = selectedPlan.plan;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <Button variant="outline" onClick={handleBackToList} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sample Plans
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{selectedPlan.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedPlan.industry}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {selectedPlan.rating} rating
                  </div>
                </div>
              </div>
              <Button onClick={() => router.push('/questionnaire?new=true')}>
                Create Your Own Plan
              </Button>
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
                        {onePagePlan.before.media.map((channel: string, index: number) => (
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

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Your Own Plan</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is a sample plan. Get your own personalized marketing strategy tailored to your specific business.
                </p>
                <Button className="w-full" onClick={() => router.push('/questionnaire?new=true')}>
                  Start Your Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <img
              src="/Beamx-Logo-Colour.png"
              alt="BeamX Solutions Logo"
              className="h-12 w-auto max-w-[200px] cursor-pointer"
              onClick={() => router.push('/')}
            />
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Home
              </Button>
              <Button onClick={() => router.push('/questionnaire?new=true')}>
                Create Your Plan
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sample Marketing Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore real marketing plans across different industries. See the quality and depth of insights you'll receive for your business.
            </p>
          </div>

          {/* Sample Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {SAMPLE_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                onClick={() => handleSelectPlan(plan)}
              >
                {/* Thumbnail with Image */}
                <div className="h-48 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-20`}></div>
                  <img 
                    src={plan.image} 
                    alt={plan.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-lg drop-shadow-lg">{plan.industry}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">{plan.title}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {plan.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{plan.rating}</span>
                      <span className="text-gray-500 ml-1">rating</span>
                    </div>
                  </div>

                  <Button className="w-full group-hover:bg-blue-700 transition-colors duration-200" onClick={() => handleSelectPlan(plan)}>
                    View Plan
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Create Your Own Marketing Plan?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get a personalized marketing strategy tailored specifically to your business in just 20 minutes.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4"
            onClick={() => router.push('/questionnaire?new=true')}
          >
            Create Your Marketing Plan Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 BeamX Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}