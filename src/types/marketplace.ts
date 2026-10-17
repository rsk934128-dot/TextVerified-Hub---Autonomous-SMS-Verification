export interface CodeValuationReport {
  valuationBdt: number;
  valuationUsd: number;
  qualityScore: number; // 0 - 100
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  complexityTier: 'Basic Template' | 'Full-Stack App' | 'Enterprise SaaS';
  architectureAnalysis: string;
  keyStrengths: string[];
  securityReview: string;
  monetizationTips: string;
  recommendedPriceBdt: number;
  recommendedPriceUsd: number;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Full-Stack' | 'SaaS' | 'Mobile PWA' | 'AI & Bots' | 'UI Kit' | 'API & Backend';
  tags: string[];
  techStack: string[];
  demoUrl?: string;
  githubPreview?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  priceBdt: number;
  priceUsd: number;
  valuationReport?: CodeValuationReport;
  downloadFileName: string;
  downloadSizeMb: number;
  salesCount: number;
  rating: number;
  featured?: boolean;
  createdAt: string;
}

export interface PurchaseOrder {
  orderId: string;
  productId: string;
  productTitle: string;
  buyerEmail: string;
  buyerName: string;
  amountBdt: number;
  amountUsd: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Stripe' | 'Instant Demo Pay';
  transactionId: string;
  licenseKey: string;
  downloadToken: string;
  createdAt: string;
}
