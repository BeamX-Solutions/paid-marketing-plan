import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { GeneratedContent, BusinessContext } from '@/types';

// Note: Using default Helvetica font for better compatibility
// Custom fonts can cause "Offset is outside the bounds" errors

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #e5e7eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  dateGenerated: {
    fontSize: 10,
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 25,
    marginBottom: 15,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  boldText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  onePageContainer: {
    border: '2 solid #e5e7eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#f9fafb',
  },
  onePageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  marketingSquareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  marketingSquare: {
    width: '30%',
    padding: 12,
    backgroundColor: '#ffffff',
    border: '1 solid #d1d5db',
    borderRadius: 4,
  },
  squareTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  squareContent: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.3,
  },
  beforeSection: {
    backgroundColor: '#dbeafe',
    borderLeft: '4 solid #2563eb',
  },
  duringSection: {
    backgroundColor: '#d1fae5',
    borderLeft: '4 solid #16a34a',
  },
  afterSection: {
    backgroundColor: '#fae8ff',
    borderLeft: '4 solid #9333ea',
  },
  listItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 10,
  },
  bulletPoint: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 5,
  },
  pageBreak: {
    pageBreakBefore: 'always',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  insightsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    border: '1 solid #0ea5e9',
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
    border: '1 solid #f59e0b',
  },
});

interface PDFTemplateProps {
  plan: {
    generatedContent: GeneratedContent;
    businessContext: BusinessContext;
    user: {
      email: string;
      businessName?: string;
    };
    createdAt: string;
  };
}

const renderObjectAsText = (obj: string | Record<string, any>, style: any): React.ReactNode => {
  if (typeof obj === 'string') {
    return <Text style={style}>{obj}</Text>;
  }
  if (typeof obj !== 'object' || obj === null) {
    return <Text style={style}>{String(obj)}</Text>;
  }
  return Object.entries(obj).map(([key, value]) => (
    <View key={key} style={{ marginBottom: 8 }}>
      <Text style={[style, { fontWeight: 'bold' }]}>{key}:</Text>
      {renderObjectAsText(value, style)}
    </View>
  ));
};

export const MarketingPlanPDF: React.FC<PDFTemplateProps> = ({ plan }) => {
  const { generatedContent, businessContext, user, createdAt } = plan;
  const { onePagePlan, implementationGuide, strategicInsights } = generatedContent;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>BeamX Luna</Text>
          <Text style={styles.dateGenerated}>Generated on {formatDate(createdAt)}</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.title}>Your Complete Marketing Plan</Text>
          <Text style={styles.subtitle}>
            {user.businessName || user.email}
          </Text>
          <Text style={[styles.text, { textAlign: 'center', marginTop: 20 }]}>
            Industry: {businessContext.industry?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            Business Model: {businessContext.businessModel}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Powered by BeamX Luna • BeamX Luna</Text>
        </View>
      </Page>

      {/* One-Page Marketing Plan */}
      <Page size="A4" style={styles.page}>
        <View style={styles.onePageContainer}>
          <Text style={styles.onePageTitle}>One-Page Marketing Plan</Text>

          {/* BEFORE Section */}
          <View style={[styles.marketingSquareRow, { marginBottom: 20 }]}>
            <Text style={[styles.sectionTitle, { fontSize: 14, color: '#2563eb', marginTop: 0, marginBottom: 10, textAlign: 'center', width: '100%' }]}>
              BEFORE (Prospects)
            </Text>
          </View>
          <View style={styles.marketingSquareRow}>
            <View style={[styles.marketingSquare, styles.beforeSection]}>
              <Text style={styles.squareTitle}>Target Market</Text>
              <Text style={styles.squareContent}>{onePagePlan.before.targetMarket}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.beforeSection]}>
              <Text style={styles.squareTitle}>Message</Text>
              <Text style={styles.squareContent}>{onePagePlan.before.message}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.beforeSection]}>
              <Text style={styles.squareTitle}>Media</Text>
              {onePagePlan.before.media.map((channel, index) => (
                <Text key={index} style={[styles.squareContent, { marginBottom: 3 }]}>
                  • {channel}
                </Text>
              ))}
            </View>
          </View>

          {/* DURING Section */}
          <View style={[styles.marketingSquareRow, { marginBottom: 20, marginTop: 25 }]}>
            <Text style={[styles.sectionTitle, { fontSize: 14, color: '#16a34a', marginTop: 0, marginBottom: 10, textAlign: 'center', width: '100%' }]}>
              DURING (Leads)
            </Text>
          </View>
          <View style={styles.marketingSquareRow}>
            <View style={[styles.marketingSquare, styles.duringSection]}>
              <Text style={styles.squareTitle}>Lead Capture</Text>
              <Text style={styles.squareContent}>{onePagePlan.during.leadCapture}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.duringSection]}>
              <Text style={styles.squareTitle}>Lead Nurture</Text>
              <Text style={styles.squareContent}>{onePagePlan.during.leadNurture}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.duringSection]}>
              <Text style={styles.squareTitle}>Sales Conversion</Text>
              <Text style={styles.squareContent}>{onePagePlan.during.salesConversion}</Text>
            </View>
          </View>

          {/* AFTER Section */}
          <View style={[styles.marketingSquareRow, { marginBottom: 20, marginTop: 25 }]}>
            <Text style={[styles.sectionTitle, { fontSize: 14, color: '#9333ea', marginTop: 0, marginBottom: 10, textAlign: 'center', width: '100%' }]}>
              AFTER (Customers)
            </Text>
          </View>
          <View style={styles.marketingSquareRow}>
            <View style={[styles.marketingSquare, styles.afterSection]}>
              <Text style={styles.squareTitle}>Deliver Experience</Text>
              <Text style={styles.squareContent}>{onePagePlan.after.deliverExperience}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.afterSection]}>
              <Text style={styles.squareTitle}>Lifetime Value</Text>
              <Text style={styles.squareContent}>{onePagePlan.after.lifetimeValue}</Text>
            </View>
            <View style={[styles.marketingSquare, styles.afterSection]}>
              <Text style={styles.squareTitle}>Referrals</Text>
              <Text style={styles.squareContent}>{onePagePlan.after.referrals}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Page 2 • BeamX Luna</Text>
        </View>
      </Page>

      {/* Strategic Insights Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Strategic Insights & Analysis</Text>

        <View style={styles.insightsContainer}>
          <Text style={styles.subsectionTitle}>Key Strengths</Text>
          {strategicInsights.strengths.map((strength, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.text}>{strength}</Text>
            </View>
          ))}
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.subsectionTitle}>Market Opportunities</Text>
          {strategicInsights.opportunities.map((opportunity, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.text}>{opportunity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.subsectionTitle}>Key Risks & Mitigation</Text>
          {strategicInsights.risks.map((risk, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.text}>{risk}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>Competitive Advantage</Text>
        {renderObjectAsText(strategicInsights.competitiveAdvantage, styles.text)}

        <Text style={styles.subsectionTitle}>Growth Potential</Text>
        {renderObjectAsText(strategicInsights.growthPotential, styles.text)}

        <Text style={styles.subsectionTitle}>Recommended Market Positioning</Text>
        {renderObjectAsText(strategicInsights.positioning, styles.text)}

        <View style={styles.footer}>
          <Text>Page 3 • BeamX Luna</Text>
        </View>
      </Page>

      {/* Implementation Guide Pages */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Implementation Guide</Text>

        <Text style={styles.subsectionTitle}>Executive Summary</Text>
        {renderObjectAsText(implementationGuide.executiveSummary, styles.text)}

        <Text style={styles.subsectionTitle}>Phase 1: First 30 Days</Text>
        {renderObjectAsText(implementationGuide.actionPlans.phase1, styles.text)}

        <Text style={styles.subsectionTitle}>Phase 2: Days 31-90</Text>
        {renderObjectAsText(implementationGuide.actionPlans.phase2, styles.text)}

        <Text style={styles.subsectionTitle}>Phase 3: Days 91-180</Text>
        {renderObjectAsText(implementationGuide.actionPlans.phase3, styles.text)}

        <Text style={styles.subsectionTitle}>Implementation Timeline</Text>
        {renderObjectAsText(implementationGuide.timeline, styles.text)}

        <Text style={styles.subsectionTitle}>Required Resources</Text>
        {renderObjectAsText(implementationGuide.resources, styles.text)}

        <Text style={styles.subsectionTitle}>Key Performance Indicators</Text>
        {renderObjectAsText(implementationGuide.kpis, styles.text)}

        <Text style={styles.subsectionTitle}>Templates & Tools</Text>
        {renderObjectAsText(implementationGuide.templates, styles.text)}

        <View style={styles.footer}>
          <Text>Page 4 • BeamX Luna</Text>
        </View>
      </Page>

      {/* Investment & ROI Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Investment Priorities & ROI Analysis</Text>

        <Text style={styles.subsectionTitle}>Recommended Marketing Investments</Text>
        {strategicInsights.investments.map((investment, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.text}>{investment}</Text>
          </View>
        ))}

        <Text style={styles.subsectionTitle}>Expected Return on Investment</Text>
        {renderObjectAsText(strategicInsights.roi, styles.text)}

        <View style={[styles.insightsContainer, { marginTop: 30 }]}>
          <Text style={[styles.subsectionTitle, { color: '#0369a1' }]}>Next Steps</Text>
          <Text style={styles.text}>
            1. Review this marketing plan with your team and key stakeholders
          </Text>
          <Text style={styles.text}>
            2. Prioritize Phase 1 activities and assign responsibilities
          </Text>
          <Text style={styles.text}>
            3. Set up tracking systems for the recommended KPIs
          </Text>
          <Text style={styles.text}>
            4. Schedule regular review meetings to assess progress
          </Text>
          <Text style={styles.text}>
            5. Consider professional implementation support if needed
          </Text>
        </View>

        <View style={[styles.warningContainer, { marginTop: 20 }]}>
          <Text style={[styles.boldText, { marginBottom: 5 }]}>Important Notes:</Text>
          <Text style={styles.text}>
            This marketing plan is generated based on your specific responses and industry analysis. 
            Market conditions and business environments change rapidly, so regular review and 
            adaptation of this strategy is recommended.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Page 5 • BeamX Luna • Generated with BeamX Luna</Text>
        </View>
      </Page>
    </Document>
  );
};