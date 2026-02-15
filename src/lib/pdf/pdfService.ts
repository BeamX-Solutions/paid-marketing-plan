import React, { ReactElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { DocumentProps } from '@react-pdf/renderer';
import { MarketingPlanPDF } from './PDFTemplate';
import { GeneratedContent, BusinessContext } from '@/types';

export interface PDFGenerationData {
  generatedContent: GeneratedContent;
  businessContext: BusinessContext;
  user: {
    email: string;
    businessName?: string;
    website?: string;
  };
  createdAt: string;
}

export class PDFService {
  async generateMarketingPlanPDF(data: PDFGenerationData): Promise<Buffer> {
    try {
      console.log('Generating PDF for plan...');
     
      const element = MarketingPlanPDF({ plan: data }) as ReactElement<DocumentProps>;
      const pdfBuffer = await renderToBuffer(element);
     
      console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateCustomPDF(
    data: PDFGenerationData,
    options: {
      includeOnePagePlan?: boolean;
      includeImplementationGuide?: boolean;
      includeStrategicInsights?: boolean;
      branding?: {
        logoUrl?: string;
        companyName?: string;
        colors?: {
          primary?: string;
          secondary?: string;
        };
      };
    } = {}
  ): Promise<Buffer> {
    try {
      // For now, we'll use the same template but this could be extended
      // to support custom options in the future
      const element = MarketingPlanPDF({ plan: data }) as ReactElement<DocumentProps>;
      const pdfBuffer = await renderToBuffer(element);
     
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating custom PDF:', error);
      throw new Error(`Failed to generate custom PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getFileName(businessName?: string, createdAt?: string): string {
    const date = createdAt ? new Date(createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const name = businessName ? businessName.replace(/[^a-zA-Z0-9]/g, '_') : 'MarketingPlan';
    return `${name}_MarketingPlan_${date}.pdf`;
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  getContentDisposition(filename: string): string {
    return `attachment; filename="${filename}"`;
  }
}

export const pdfService = new PDFService();