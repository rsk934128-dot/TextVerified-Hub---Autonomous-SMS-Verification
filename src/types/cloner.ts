export interface ClonedRoute {
  path: string;
  name: string;
  title: string;
  metaDescription: string;
  headingH1: string;
  headingsH2: string[];
  keyPoints: string[];
  ctaText: string;
  reactCode: string;
  previewHtml: string;
  status: 'crawled' | 'synthesized' | 'ready';
}

export interface MobileNavTab {
  id: string;
  labelEn: string;
  labelAr: string;
  icon: string;
  route: string;
}

export interface ClonedProject {
  id: string;
  domain: string;
  sourceUrl: string;
  brandName: string;
  tagline: string;
  summary: string;
  colorPalette: string[];
  routes: ClonedRoute[];
  globalNavbarCode: string;
  globalFooterCode: string;
  packageJsonCode: string;
  tailwindConfigCode: string;
  readmeCode: string;
  crawledAt: string;
  targetPlatform?: 'web' | 'mobile' | 'both';
  region?: 'kuwait' | 'global';
  currencySymbol?: string;
  currencyCode?: string;
  isRtlSupported?: boolean;
  reactNativeCode?: string;
  expoConfigCode?: string;
  capacitorConfigCode?: string;
  mobileNavTabs?: MobileNavTab[];
  kuwaitFeatures?: string[];
  valuation: {
    recommendedPriceBdt: number;
    recommendedPriceUsd: number;
    qualityScore: number;
    complexityTier: string;
    codeLines: number;
  };
}

export interface CrawlProgressEvent {
  step: number;
  totalSteps: number;
  message: string;
  discoveredRoute?: string;
}
