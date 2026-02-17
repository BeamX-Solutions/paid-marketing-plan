import { Question } from '@/types';

export const MARKETING_SQUARES = [
  { id: 1, title: 'Target Market & Customer Avatar', description: 'Define your ideal customer profile' },
  { id: 2, title: 'Value Proposition & Messaging', description: 'Craft your unique value proposition' },
  { id: 3, title: 'Media Channels & Reach', description: 'Select optimal marketing channels' },
  { id: 4, title: 'Lead Capture & Acquisition', description: 'Design lead generation systems' },
  { id: 5, title: 'Lead Nurturing & Relationship Building', description: 'Build relationships with prospects' },
  { id: 6, title: 'Sales Conversion & Closing', description: 'Optimize your sales process' },
  { id: 7, title: 'Customer Experience & Delivery', description: 'Deliver exceptional customer experience' },
  { id: 8, title: 'Lifetime Value & Growth', description: 'Maximize customer lifetime value' },
  { id: 9, title: 'Referral System & Advocacy', description: 'Create systematic referral generation' }
];

export const BUSINESS_CONTEXT_QUESTIONS: Question[] = [
  {
    id: 'business-name',
    square: 0,
    text: 'What is your business name?',
    type: 'text',
    placeholder: 'Enter your business name...',
    required: true,
    helpText: 'This will be included in your marketing plan and communications.'
  },
  {
    id: 'business-website',
    square: 0,
    text: 'What is your website URL? (Optional)',
    type: 'text',
    placeholder: 'https://www.example.com',
    required: false,
    helpText: 'We\'ll include this in your marketing plan and send it with your plan details.'
  },
  {
    id: 'industry',
    square: 0,
    text: 'What industry best describes your business?',
    type: 'select',
    options: [
      'professional-services',
      'healthcare',
      'ecommerce',
      'restaurants',
      'b2b-software',
      'real-estate',
      'fitness',
      'home-services',
      'manufacturing',
      'education',
      'financial-services',
      'nonprofit',
      'travel',
      'technology',
      'retail',
      'logistics',
      'media-entertainment',
      'hospitality'
    ],
    required: true,
    helpText: 'Select the industry that most closely matches your business model and target market.'
  },
  {
    id: 'business-model',
    square: 0,
    text: 'What is your primary business model?',
    type: 'radio',
    options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'],
    required: true,
    helpText: 'B2B serves businesses, B2C serves consumers, B2B2C serves businesses that serve consumers, Marketplace connects buyers and sellers.'
  },
  {
    id: 'company-size',
    square: 0,
    text: 'How many employees does your company have?',
    type: 'select',
    options: ['Just me (1)', '2-5 employees', '6-20 employees', '21-50 employees', '50+ employees'],
    required: true
  },
  {
    id: 'years-in-operation',
    square: 0,
    text: 'How long has your business been operating?',
    type: 'select',
    options: ['Pre-launch', 'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '10+ years'],
    required: true
  },
  {
    id: 'geographic-scope',
    square: 0,
    text: 'What is your primary geographic market?',
    type: 'select',
    options: ['Local/City', 'Regional/State', 'National', 'International'],
    required: true
  },
  {
    id: 'primary-challenges',
    square: 0,
    text: 'What are your biggest business challenges? (Select all that apply)',
    type: 'multiselect',
    options: [
      'Finding new customers',
      'Converting leads to sales',
      'Increasing prices/profitability',
      'Standing out from competition',
      'Building brand awareness',
      'Generating consistent revenue',
      'Rising operational costs & cash flow management',
      'Hiring and retaining talent',
      'Scaling operations',
      'Digital marketing effectiveness',
      'Adopting and Managing Artificial Intelligence (AI)',
      'Retaining customers',
      'Currency volatility & forex issues'
    ],
    required: true
  },
  {
    id: 'marketing-maturity',
    square: 0,
    text: 'How would you rate your current marketing expertise?',
    type: 'radio',
    options: ['Beginner (just getting started)', 'Intermediate (some experience)', 'Advanced (very experienced)'],
    required: true
  },
  {
    id: 'marketing-budget',
    square: 0,
    text: 'What is your monthly marketing budget range?',
    type: 'select',
    options: ['₦0-₦500,000', '₦500,000-₦2,000,000', '₦2,000,000-₦5,000,000', '₦5,000,000-₦10,000,000', '₦10,000,000+'],
    required: true
  },
  {
    id: 'time-availability',
    square: 0,
    text: 'How much time can you dedicate to marketing activities per week?',
    type: 'select',
    options: ['1-2 hours', '3-5 hours', '6-10 hours', '11-20 hours', '20+ hours'],
    required: true
  },
  {
    id: 'business-goals',
    square: 0,
    text: 'What are your primary business goals for the next 12 months? (Select all that apply)',
    type: 'multiselect',
    options: [
      'Increase revenue by 25-50%',
      'Increase revenue by 50-100%',
      'Increase revenue by 100%+',
      'Improve profit margins',
      'Expand to new markets',
      'Launch new products/services',
      'Build stronger brand recognition',
      'Improve customer retention',
      'Streamline operations',
      'Hire more team members',
      'Acquire new users/customers'
    ],
    required: true
  }
];

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  // Square 1: Target Market & Customer Avatar
  {
    id: 'target-demographics-age',
    square: 1,
    text: 'What is the age range of your ideal customers? (Select up to 2)',
    type: 'multiselect',
    options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Mixed/Varies'],
    required: true,
    maxSelections: 2
  },
  {
    id: 'target-demographics-income',
    square: 1,
    text: 'What is the income level of your ideal customers?',
    type: 'select',
    options: ['Under ₦30M', '₦30M-₦50M', '₦50M-₦75M', '₦75M-₦100M', '₦100M-₦150M', '₦150M+', 'Varies/Business budget'],
    required: true
  },
  {
    id: 'target-location',
    square: 1,
    text: 'Where are your ideal customers located?',
    type: 'textarea',
    placeholder: 'Describe the geographic location, lifestyle, or work environment of your ideal customers...',
    required: true
  },
  {
    id: 'customer-pain-points',
    square: 1,
    text: 'What are the top 3 biggest problems or frustrations your ideal customers face?',
    type: 'textarea',
    placeholder: 'List the specific problems your product/service solves...',
    required: true,
    helpText: 'Think about the challenges that keep your customers awake at night or cause them daily frustration.'
  },
  {
    id: 'customer-goals',
    square: 1,
    text: 'What are your ideal customers trying to achieve?',
    type: 'textarea',
    placeholder: 'Describe their goals, dreams, and desired outcomes...',
    required: true
  },
  {
    id: 'customer-buying-behavior',
    square: 1,
    text: 'How do your customers typically make purchasing decisions?',
    type: 'textarea',
    placeholder: 'Describe their research process, decision factors, and buying timeline...',
    required: true
  },
  {
    id: 'current-customer-sources',
    square: 1,
    text: 'Where do you currently find your best customers?',
    type: 'multiselect',
    options: [
      'Referrals from existing customers',
      'Google search results',
      'Social media (Facebook, Instagram, etc.)',
      'LinkedIn',
      'Industry events/networking',
      'Direct outreach/cold calling',
      'Partnerships with other businesses',
      'Online directories',
      'Print advertising',
      'Radio/TV advertising',
      'Content marketing/blog',
      'Email marketing',
      'Other'
    ],
    required: true
  },

  // Square 2: Value Proposition & Messaging
  {
    id: 'core-problem-solved',
    square: 2,
    text: 'In one clear sentence, what is the main problem your business solves?',
    type: 'textarea',
    placeholder: 'We help [target customer] solve [specific problem] by [solution approach]...',
    required: true,
    helpText: 'This should be clear, specific, and focused on the customer\'s perspective.'
  },
  {
    id: 'unique-advantages',
    square: 2,
    text: 'What makes you different from your competitors? List your top 3 unique advantages.',
    type: 'textarea',
    placeholder: 'List what sets you apart from alternatives in your market...',
    required: true
  },
  {
    id: 'tangible-benefits',
    square: 2,
    text: 'What specific, measurable results do customers get from your product/service?',
    type: 'textarea',
    placeholder: 'List concrete outcomes like time saved, money earned, problems eliminated...',
    required: true
  },
  {
    id: 'emotional-benefits',
    square: 2,
    text: 'How does your product/service make customers feel?',
    type: 'textarea',
    placeholder: 'Describe the emotional outcomes: confidence, peace of mind, excitement, etc...',
    required: true
  },
  {
    id: 'proof-points',
    square: 2,
    text: 'What evidence do you have that your solution works?',
    type: 'multiselect',
    options: [
      'Customer testimonials',
      'Case studies with results',
      'Industry certifications',
      'Awards or recognition',
      'Years of experience',
      'Number of satisfied customers',
      'Measurable success metrics',
      'Guarantee or warranty',
      'Scientific studies or research',
      'Media coverage or press',
      'Professional credentials',
      'Other'
    ],
    required: true
  },

  // Square 3: Media Channels & Reach
  {
    id: 'current-marketing-channels',
    square: 3,
    text: 'Which marketing channels are you currently using? Rate their effectiveness (1-10).',
    type: 'text', // This would be a custom component for rating
    required: true,
    helpText: 'Rate each channel you use from 1 (not effective) to 10 (very effective)'
  },
  {
    id: 'digital-marketing-preferences',
    square: 3,
    text: 'Which digital marketing channels are most interesting to you?',
    type: 'multiselect',
    options: [
      'Search Engine Optimization (SEO)',
      'Google Ads (Search & Display)',
      'Facebook & Instagram Ads',
      'LinkedIn Marketing',
      'YouTube Marketing',
      'Email Marketing',
      'Content Marketing/Blogging',
      'Podcast Advertising',
      'Influencer Marketing',
      'Affiliate Marketing',
      'Webinars',
      'Online Communities/Forums'
    ],
    required: true
  },
  {
    id: 'content-creation-capacity',
    square: 3,
    text: 'What types of content can you realistically create on a regular basis?',
    type: 'multiselect',
    options: [
      'Written blog posts/articles',
      'Social media posts',
      'Videos (talking head style)',
      'Videos (produced/edited)',
      'Podcasts/audio content',
      'Infographics/visual content',
      'Photography',
      'Live streaming',
      'Webinars/presentations',
      'Email newsletters',
      'Case studies',
      'White papers/guides'
    ],
    required: true
  },

  // Square 4: Lead Capture & Acquisition
  {
    id: 'current-lead-generation',
    square: 4,
    text: 'How do you currently capture leads and contact information?',
    type: 'multiselect',
    options: [
      'Website contact forms',
      'Free consultation offers',
      'Newsletter signups',
      'Downloadable resources (PDFs, guides)',
      'Free tools or calculators',
      'Webinar registrations',
      'Contest or giveaway entries',
      'Event registrations',
      'Social media engagement',
      'Referral requests',
      'Cold outreach responses',
      'Trade show/networking follow-up'
    ],
    required: true
  },
  {
    id: 'lead-magnets',
    square: 4,
    text: 'What valuable free resource could you offer to attract potential customers?',
    type: 'textarea',
    placeholder: 'Examples: Free guide, checklist, consultation, trial, assessment, template...',
    required: true,
    helpText: 'Think about what would be so valuable your ideal customer would gladly give their email address for it.'
  },
  {
    id: 'website-optimization',
    square: 4,
    text: 'How would you rate your current website\'s ability to convert visitors into leads?',
    type: 'radio',
    options: ['Excellent (8-10)', 'Good (6-7)', 'Average (4-5)', 'Poor (1-3)', 'I don\'t have a website'],
    required: true
  },

  // Square 5: Lead Nurturing & Relationship Building
  {
    id: 'follow-up-process',
    square: 5,
    text: 'Describe your current process for following up with new leads.',
    type: 'textarea',
    placeholder: 'What happens after someone shows interest? How quickly and how often do you follow up?',
    required: true
  },
  {
    id: 'email-marketing-current',
    square: 5,
    text: 'Do you currently use email marketing?',
    type: 'radio',
    options: ['Yes, regularly with automated sequences', 'Yes, but only occasional newsletters', 'Rarely or inconsistently', 'No, not at all'],
    required: true
  },
  {
    id: 'educational-content',
    square: 5,
    text: 'What educational content could you share to build trust with potential customers?',
    type: 'textarea',
    placeholder: 'Examples: Industry insights, how-to guides, tips, case studies, trend analysis...',
    required: true
  },
  {
    id: 'relationship-timeline',
    square: 5,
    text: 'How long does it typically take for a prospect to become a customer?',
    type: 'select',
    options: ['Same day', '1-7 days', '1-4 weeks', '1-3 months', '3-6 months', '6+ months'],
    required: true
  },

  // Square 6: Sales Conversion & Closing
  {
    id: 'sales-process',
    square: 6,
    text: 'Describe your current sales process from first contact to closed deal.',
    type: 'textarea',
    placeholder: 'Walk through each step: initial contact, discovery, proposal, negotiation, closing...',
    required: true
  },
  {
    id: 'common-objections',
    square: 6,
    text: 'What are the most common objections or concerns potential customers raise?',
    type: 'textarea',
    placeholder: 'List the reasons people hesitate or say no, and how you currently address them...',
    required: true
  },
  {
    id: 'pricing-strategy',
    square: 6,
    text: 'How do you typically present pricing to potential customers?',
    type: 'radio',
    options: ['Single price option', 'Multiple packages/tiers', 'Custom quotes only', 'Price varies by project', 'Negotiable pricing'],
    required: true
  },
  {
    id: 'conversion-rate',
    square: 6,
    text: 'Approximately what percentage of qualified prospects become paying customers?',
    type: 'select',
    options: ['Less than 10%', '10-25%', '25-50%', '50-75%', '75%+', 'I\'m not sure'],
    required: true
  },

  // Square 7: Customer Experience & Delivery
  {
    id: 'delivery-method',
    square: 7,
    text: 'How do you deliver your product or service to customers?',
    type: 'textarea',
    placeholder: 'Describe your fulfillment, delivery, or service delivery process...',
    required: true
  },
  {
    id: 'onboarding-process',
    square: 7,
    text: 'What is your process for getting new customers started?',
    type: 'textarea',
    placeholder: 'How do you ensure customers have a great experience from day one?',
    required: true
  },
  {
    id: 'customer-support',
    square: 7,
    text: 'How do customers get help or support when they need it?',
    type: 'multiselect',
    options: [
      'Email support',
      'Phone support',
      'Live chat',
      'Knowledge base/FAQ',
      'Video tutorials',
      'In-person meetings',
      'Online training sessions',
      'Community forum',
      'Dedicated account manager',
      'Self-service portal'
    ],
    required: true
  },
  {
    id: 'customer-feedback',
    square: 7,
    text: 'How do you collect and use customer feedback?',
    type: 'textarea',
    placeholder: 'Describe how you gather feedback and what you do with it...',
    required: true
  },

  // Square 8: Lifetime Value & Growth
  {
    id: 'repeat-business',
    square: 8,
    text: 'What percentage of your customers make repeat purchases or renew?',
    type: 'select',
    options: ['Less than 25%', '25-50%', '50-75%', '75-90%', '90%+', 'Not applicable (one-time purchase)'],
    required: true
  },
  {
    id: 'upsell-opportunities',
    square: 8,
    text: 'What additional products or services could you offer existing customers?',
    type: 'textarea',
    placeholder: 'List complementary offerings, upgrades, or premium services...',
    required: true
  },
  {
    id: 'customer-retention',
    square: 8,
    text: 'What do you do to keep customers engaged and prevent churn?',
    type: 'textarea',
    placeholder: 'Describe your retention strategies, loyalty programs, or ongoing engagement...',
    required: true
  },
  {
    id: 'average-customer-value',
    square: 8,
    text: 'What is the approximate lifetime value of your average customer?',
    type: 'select',
    options: ['Under ₦500,000', '₦500,000-₦2,000,000', '₦2,000,000-₦10,000,000', '₦10,000,000-₦50,000,000', '₦50,000,000+', 'I\'m not sure'],
    required: true
  },

  // Square 9: Referral System & Advocacy
  {
    id: 'current-referrals',
    square: 9,
    text: 'What percentage of your new customers come from referrals?',
    type: 'select',
    options: ['Less than 10%', '10-25%', '25-50%', '50-75%', '75%+', 'I\'m not sure'],
    required: true
  },
  {
    id: 'referral-process',
    square: 9,
    text: 'Do you have a formal process for requesting referrals from satisfied customers?',
    type: 'radio',
    options: ['Yes, systematic process', 'Sometimes ask informally', 'Rarely ask for referrals', 'Never ask for referrals'],
    required: true
  },
  {
    id: 'referral-incentives',
    square: 9,
    text: 'What could you offer as referral incentives?',
    type: 'multiselect',
    options: [
      'Monetary reward/commission',
      'Discount on future purchases',
      'Free product or service',
      'Gift cards or prizes',
      'Exclusive access or perks',
      'Recognition or public thanks',
      'Reciprocal referrals',
      'Donation to charity',
      'Nothing formal',
      'Other'
    ],
    required: true
  },
  {
    id: 'customer-advocacy',
    square: 9,
    text: 'How could your happiest customers help promote your business?',
    type: 'textarea',
    placeholder: 'Examples: testimonials, case studies, reviews, social media posts, speaking opportunities...',
    required: true
  }
];

export const getQuestionsBySquare = (square: number): Question[] => {
  if (square === 0) return BUSINESS_CONTEXT_QUESTIONS;
  return QUESTIONNAIRE_QUESTIONS.filter(q => q.square === square);
};

export const getAllQuestions = (): Question[] => {
  return [...BUSINESS_CONTEXT_QUESTIONS, ...QUESTIONNAIRE_QUESTIONS];
};