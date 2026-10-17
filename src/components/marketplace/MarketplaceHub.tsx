import React, { useState, useEffect } from 'react';
import { MarketplaceProduct, PurchaseOrder } from '../../types/marketplace';
import { Storefront } from './Storefront';
import { SellerValuationStudio } from './SellerValuationStudio';
import { BuyerVault } from './BuyerVault';
import { CheckoutModal } from './CheckoutModal';
import { ProductPreviewModal } from './ProductPreviewModal';
import { 
  ShoppingBag, 
  Sparkles, 
  Lock, 
  Upload, 
  CheckCircle2, 
  FolderLock
} from 'lucide-react';

const INITIAL_FEATURED_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod_textverified_pwa',
    title: 'TextVerified Autonomous SMS & PWA Engine v2.0',
    tagline: 'Autonomous SMS OTP verification engine with Bearer JWT, Telegram Bot webhook, and PWA capabilities',
    description: 'Complete production-grade autonomous SMS verification platform powered by TextVerified API v2, real-time polling, auto-refund safeguard, Telegram bot forwarding, and Firebase Firestore persistence.',
    category: 'Full-Stack',
    tags: ['React 19', 'TypeScript', 'Firebase', 'Telegram Bot', 'PWA'],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Firebase Firestore', 'Telegram Bot API', 'Express'],
    demoUrl: window.location.origin,
    sellerId: 'sheikh_farid',
    sellerName: 'Sheikh Farid (Architect)',
    sellerEmail: 'monikhoku88@gmail.com',
    priceBdt: 4500,
    priceUsd: 39,
    valuationReport: {
      valuationBdt: 4800,
      valuationUsd: 42,
      recommendedPriceBdt: 4500,
      recommendedPriceUsd: 39,
      qualityScore: 98,
      securityGrade: 'A+',
      complexityTier: 'Full-Stack App',
      architectureAnalysis: 'Highly optimized autonomous event-loop engine with zero-waste balance refund safeguards and zero build errors.',
      keyStrengths: [
        'Real-time 3.5s SMS OTP polling engine',
        'Automatic Telegram Bot push dispatcher with tap-to-copy formatting',
        '100% credit protection with auto-cancel & refund triggers',
        'PWABuilder compliant with offline service workers',
      ],
      securityReview: 'Hardened ABAC Firestore security rules with verified email protection and server secret isolation.',
      monetizationTips: 'High-demand SaaS utility for developers needing phone verification services without manual overhead.',
    },
    downloadFileName: 'textverified_autonomous_engine_v2.zip',
    downloadSizeMb: 18.2,
    salesCount: 38,
    rating: 5.0,
    featured: true,
    createdAt: '2026-10-17T00:00:00Z',
  },
  {
    id: 'prod_cryptopay_saas',
    title: 'CryptoPay Micro-SaaS - Web3 & Fiat Instant Invoicing',
    tagline: 'Multi-currency invoicing engine supporting bKash, Nagad, USDT, and Bitcoin with automated webhook callbacks',
    description: 'Enterprise crypto and mobile banking invoicing system with real-time exchange rates, QR code generation, and automated webhook dispatch.',
    category: 'SaaS',
    tags: ['Next.js', 'PostgreSQL', 'Web3', 'bKash API', 'Stripe'],
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Stripe API'],
    demoUrl: 'https://example.com/demo/cryptopay',
    sellerId: 'farid_dev',
    sellerName: 'Farid Technologies',
    sellerEmail: 'monikhoku88@gmail.com',
    priceBdt: 6500,
    priceUsd: 55,
    valuationReport: {
      valuationBdt: 7000,
      valuationUsd: 60,
      recommendedPriceBdt: 6500,
      recommendedPriceUsd: 55,
      qualityScore: 94,
      securityGrade: 'A',
      complexityTier: 'Enterprise SaaS',
      architectureAnalysis: 'Full-stack multi-tenant database schema with atomic ledger transaction tracking.',
      keyStrengths: [
        'Multi-currency fiat & crypto settlement',
        'Tamper-proof HMAC webhook signatures',
        'Automated PDF invoice generation and email dispatch',
      ],
      securityReview: 'HMAC signature verification on webhooks; SQL parameterization guards against injection.',
      monetizationTips: 'Offer subscription tiers and transaction fee percentage options.',
    },
    downloadFileName: 'cryptopay_saas_suite.zip',
    downloadSizeMb: 24.5,
    salesCount: 22,
    rating: 4.9,
    featured: true,
    createdAt: '2026-10-16T12:00:00Z',
  },
  {
    id: 'prod_gemini_multitool',
    title: 'Gemini 3.8 Multi-Agent Intelligence Workspace',
    tagline: 'Multi-modal workspace supporting coding agents, image generation, audio transcription, and Live API voice',
    description: 'A modular, high-efficiency AI workspace leveraging the modern @google/genai TypeScript SDK with server-side proxy routes and structured JSON generation.',
    category: 'AI & Bots',
    tags: ['Gemini 3.8', 'React 19', 'Express', 'Tailwind CSS'],
    techStack: ['React 19', 'TypeScript', '@google/genai', 'Express', 'Tailwind CSS'],
    demoUrl: 'https://example.com/demo/gemini-suite',
    sellerId: 'ai_studio_architect',
    sellerName: 'Google Cloud Certified Team',
    sellerEmail: 'monikhoku88@gmail.com',
    priceBdt: 5000,
    priceUsd: 45,
    valuationReport: {
      valuationBdt: 5500,
      valuationUsd: 48,
      recommendedPriceBdt: 5000,
      recommendedPriceUsd: 45,
      qualityScore: 96,
      securityGrade: 'A+',
      complexityTier: 'Full-Stack App',
      architectureAnalysis: 'Pure server-side GenAI SDK integration with telemetry headers and streaming SSE handlers.',
      keyStrengths: [
        'Zero API key browser exposure',
        'Structured JSON schemas with Type validators',
        'Fast model switching between Flash, Lite, and Live',
      ],
      securityReview: 'Strict server-side proxy routes ensure API keys are protected from reverse engineering.',
      monetizationTips: 'Ideal for reselling as a specialized industry assistant tool.',
    },
    downloadFileName: 'gemini_multitool_workspace.zip',
    downloadSizeMb: 16.4,
    salesCount: 45,
    rating: 5.0,
    featured: true,
    createdAt: '2026-10-15T08:00:00Z',
  },
];

export const MarketplaceHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'store' | 'studio' | 'vault'>('store');
  const [products, setProducts] = useState<MarketplaceProduct[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tv_marketplace_prods');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_FEATURED_PRODUCTS;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tv_marketplace_orders');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<MarketplaceProduct | null>(null);
  const [selectedProductForPreview, setSelectedProductForPreview] = useState<MarketplaceProduct | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tv_marketplace_prods', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tv_marketplace_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const handlePublishNewProduct = (newProduct: MarketplaceProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setActiveTab('store');
  };

  const handlePurchaseSuccess = (newOrder: PurchaseOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-2xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'store'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>মার্কেটপ্লেস স্টোর (Storefront)</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Valuation স্টুডিও (Sell Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderLock className="w-4 h-4 text-cyan-400" />
            <span>My In-App Vault ({orders.length})</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini 3.8 Flash Code Appraiser Live</span>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'store' && (
        <Storefront
          products={products}
          onSelectProduct={(p) => setSelectedProductForCheckout(p)}
          onPreviewProduct={(p) => setSelectedProductForPreview(p)}
        />
      )}

      {activeTab === 'studio' && (
        <SellerValuationStudio onPublishProduct={handlePublishNewProduct} />
      )}

      {activeTab === 'vault' && (
        <BuyerVault orders={orders} onBrowseStore={() => setActiveTab('store')} />
      )}

      {/* Checkout Modal */}
      {selectedProductForCheckout && (
        <CheckoutModal
          product={selectedProductForCheckout}
          onClose={() => setSelectedProductForCheckout(null)}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Preview Modal */}
      {selectedProductForPreview && (
        <ProductPreviewModal
          product={selectedProductForPreview}
          onClose={() => setSelectedProductForPreview(null)}
          onBuy={(p) => {
            setSelectedProductForPreview(null);
            setSelectedProductForCheckout(p);
          }}
        />
      )}
    </div>
  );
};
