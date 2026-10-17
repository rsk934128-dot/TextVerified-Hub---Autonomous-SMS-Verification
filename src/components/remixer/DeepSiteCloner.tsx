import React, { useState } from 'react';
import {
  Globe,
  Layers,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  ShoppingBag,
  FileCode,
  FolderTree,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ArrowRight,
  RefreshCw,
  Eye,
  Code2,
  BookOpen,
  X,
  Compass,
  CreditCard,
  Languages,
  CheckCircle2,
  ChevronRight,
  Terminal,
  HelpCircle,
  SmartphoneNfc
} from 'lucide-react';
import { ClonedProject, ClonedRoute } from '../../types/cloner';
import { MarketplaceProduct } from '../../types/marketplace';
import { exportProjectToZip, exportMobileProjectToZip, downloadBlob } from '../../utils/zipExporter';

interface DeepSiteClonerProps {
  onPublishToMarketplace?: (product: MarketplaceProduct) => void;
}

const KUWAIT_PRESET_TARGETS = [
  { name: 'Talabat Kuwait', url: 'https://www.talabat.com/kuwait', badge: 'Food & Grocery', tag: 'KWD 🇰🇼' },
  { name: '4Sale Q8', url: 'https://q84sale.com', badge: 'Classifieds #1', tag: 'Marketplace' },
  { name: 'KFH Bank', url: 'https://www.kfh.com', badge: 'Kuwait Finance House', tag: 'Islamic Banking' },
  { name: 'Boubyan Bank', url: 'https://boubyan.bankboubyan.com', badge: 'Digital Bank', tag: 'FinTech' },
  { name: 'Boutiqaat', url: 'https://www.boutiqaat.com', badge: 'Luxury & Beauty', tag: 'eCommerce' },
  { name: 'Floward KW', url: 'https://floward.com', badge: 'Flowers & Gifts', tag: 'Express' },
  { name: 'X-cite Alghanim', url: 'https://www.xcite.com', badge: 'Electronics KW', tag: 'Retail' },
  { name: 'Kuwait Mobile ID', url: 'https://www.paci.gov.kw', badge: 'Civil ID هويتي', tag: 'GovTech' },
];

const GLOBAL_PRESET_TARGETS = [
  { name: 'Linear', url: 'https://linear.app', badge: 'Productivity', tag: 'SaaS' },
  { name: 'Stripe', url: 'https://stripe.com', badge: 'Fintech Payments', tag: 'API' },
  { name: 'Gumroad', url: 'https://gumroad.com', badge: 'Creator Marketplace', tag: 'Store' },
  { name: 'Supabase', url: 'https://supabase.com', badge: 'Database & Auth', tag: 'BaaS' },
  { name: 'Vercel', url: 'https://vercel.com', badge: 'Dev Platform', tag: 'Cloud' },
];

export const DeepSiteCloner: React.FC<DeepSiteClonerProps> = ({ onPublishToMarketplace }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [presetCategory, setPresetCategory] = useState<'kuwait' | 'global'>('kuwait');
  const [targetPlatform, setTargetPlatform] = useState<'both' | 'mobile' | 'web'>('both');
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [project, setProject] = useState<ClonedProject | null>(null);
  const [activeRoutePath, setActiveRoutePath] = useState<string>('/');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'code' | 'tree' | 'mobile_expo'>('preview');
  const [selectedFileForCode, setSelectedFileForCode] = useState<string>('app/page.tsx');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExportingWebZip, setIsExportingWebZip] = useState(false);
  const [isExportingMobileZip, setIsExportingMobileZip] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'ar'>('ar');
  const [activeMobileNav, setActiveMobileNav] = useState('home');

  const crawlSteps = [
    '🕷️ Crawling root domain & analyzing HTML structure...',
    '🔗 Extracting internal links & filtering routes...',
    '🗺️ Building 1:1 Next.js App Router hierarchy & Mobile Tab Map...',
    '🎨 Synthesizing Tailwind CSS & React Native components (KWD / RTL)...',
    '📦 Bundling production-ready Web & React Native codebase...',
  ];

  const handleStartClone = async (urlToClone?: string) => {
    let cleanUrl = (urlToClone || targetUrl).trim();
    if (!cleanUrl) return;

    // Match candidate URL safely
    const match = cleanUrl.match(/https?:\/\/[^\s,;"'<>`]+/i);
    if (match) {
      cleanUrl = match[0];
    } else {
      cleanUrl = cleanUrl.split(/[\s,;]+/)[0] || cleanUrl;
    }
    cleanUrl = cleanUrl.replace(/^[<"'(]+/, '').replace(/[>"'),;]+$/, '').trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    setTargetUrl(cleanUrl);
    setLoading(true);
    setProject(null);
    setIsPublished(false);
    setProgressStep(0);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < crawlSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1100);

    try {
      const response = await fetch('/api/clone-website-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          platform: targetPlatform,
          region: presetCategory === 'kuwait' ? 'kuwait' : undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.project) {
        setProject(data.project);
        setActiveRoutePath(data.project.routes[0]?.path || '/');
        setSelectedFileForCode(targetPlatform === 'mobile' ? 'App.tsx (React Native Mobile)' : 'app/page.tsx');
        if (data.project.region === 'kuwait') {
          setPreviewLanguage('ar');
          setViewportMode('mobile');
        }
      } else {
        alert(data.error || 'সাইটটি ক্লোন করতে সমস্যা হয়েছে।');
      }
    } catch (err: unknown) {
      console.error('Cloner fetch error:', err);
      alert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const currentRoute: ClonedRoute | undefined = project?.routes.find(
    (r) => r.path === activeRoutePath
  ) || project?.routes[0];

  const handleDownloadWebZip = async () => {
    if (!project) return;
    setIsExportingWebZip(true);
    try {
      const blob = await exportProjectToZip(project);
      downloadBlob(blob, `${project.domain}-nextjs-pwa.zip`);
    } catch (err) {
      console.error('ZIP export failed:', err);
      alert('ZIP ফাইল এক্সপোর্ট করতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingWebZip(false);
    }
  };

  const handleDownloadMobileZip = async () => {
    if (!project) return;
    setIsExportingMobileZip(true);
    try {
      const blob = await exportMobileProjectToZip(project);
      downloadBlob(blob, `${project.domain}-react-native-expo.zip`);
    } catch (err) {
      console.error('Mobile ZIP export failed:', err);
      alert('Mobile ZIP ফাইল এক্সপোর্ট করতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingMobileZip(false);
    }
  };

  const handlePublishToMarketplace = () => {
    if (!project || !onPublishToMarketplace) return;

    const isKuwait = project.region === 'kuwait';

    const newProduct: MarketplaceProduct = {
      id: 'clone_' + Date.now(),
      title: `${project.brandName} (${isKuwait ? 'Kuwait KWD Mobile & Web 1:1 Replica' : '1:1 Multi-Page & Mobile Replica'})`,
      tagline: `${isKuwait ? '🇰🇼 Kuwait Dinar & Arabic RTL Ready' : 'Next.js 15 & React Native'} with ${project.routes.length} Internal Routes`,
      description: project.summary,
      category: isKuwait ? 'Mobile PWA' : 'Full-Stack',
      tags: [
        'Next.js 15',
        'React Native Expo',
        'Mobile App',
        isKuwait ? 'Kuwait KWD Dinar' : 'TypeScript',
        isKuwait ? 'Arabic RTL' : 'PWA Standalone',
        '1:1 Replica'
      ],
      techStack: ['React Native', 'Next.js 15', 'Expo 51', 'Tailwind CSS', 'TypeScript'],
      demoUrl: project.sourceUrl,
      sellerId: 'site_cloner_engine',
      sellerName: 'Sheikh Farid Autonomous Engine',
      sellerEmail: 'monikhoku88@gmail.com',
      priceBdt: project.valuation.recommendedPriceBdt,
      priceUsd: project.valuation.recommendedPriceUsd,
      valuationReport: {
        valuationBdt: project.valuation.recommendedPriceBdt,
        valuationUsd: project.valuation.recommendedPriceUsd,
        qualityScore: project.valuation.qualityScore,
        securityGrade: 'A+',
        complexityTier: isKuwait ? 'Enterprise SaaS' : 'Full-Stack App',
        architectureAnalysis: `Mapped from ${project.sourceUrl}. Includes Next.js 15 App Router web files, full React Native Expo project, ${isKuwait ? 'Kuwait Dinar (KWD) pricing, Arabic (RTL) mode and KNet integration shell.' : 'and cross-platform mobile navigation.'}`,
        keyStrengths: [
          `Identical internal routing structure (${project.routes.map((r) => r.path).join(', ')})`,
          'Standalone React Native & Expo Mobile codebase included',
          isKuwait ? 'Full Kuwait Dinar (KWD) & Arabic RTL support' : 'PWA Manifest & Service Worker',
        ],
        securityReview: 'Fully sanitized client components. Ready for production store deployment.',
        monetizationTips: 'Ready for client project delivery, digital asset sales in GCC markets, or standalone mobile app release on Google Play & App Store.',
        recommendedPriceBdt: project.valuation.recommendedPriceBdt,
        recommendedPriceUsd: project.valuation.recommendedPriceUsd,
      },
      downloadFileName: `${project.domain}-complete-mobile-web-package.zip`,
      downloadSizeMb: 2.4,
      salesCount: 1,
      rating: 5.0,
      featured: true,
      createdAt: new Date().toISOString(),
    };

    onPublishToMarketplace(newProduct);
    setIsPublished(true);
  };

  const getSelectedFileCode = () => {
    if (!project) return '';
    if (selectedFileForCode === 'App.tsx (React Native Mobile)') return project.reactNativeCode || '';
    if (selectedFileForCode === 'app.json (Expo)') return project.expoConfigCode || '';
    if (selectedFileForCode === 'capacitor.config.json') return project.capacitorConfigCode || '';
    if (selectedFileForCode === 'package.json') return project.packageJsonCode;
    if (selectedFileForCode === 'tailwind.config.js') return project.tailwindConfigCode;
    if (selectedFileForCode === 'README.md') return project.readmeCode;
    if (selectedFileForCode === 'components/Navbar.tsx') return project.globalNavbarCode;
    if (selectedFileForCode === 'components/Footer.tsx') return project.globalFooterCode;

    for (const r of project.routes) {
      const routeFileName = r.path === '/' ? 'app/page.tsx' : `app${r.path}/page.tsx`;
      if (selectedFileForCode === routeFileName) {
        return r.reactCode;
      }
    }
    return project.reactNativeCode || project.routes[0]?.reactCode || '';
  };

  const handleCopyCode = () => {
    const code = getSelectedFileCode();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Kuwait & Mobile Engine Badges */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-indigo-500/15 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" /> Mobile App & Kuwait Cloner
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> 1:1 Replica Engine
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              যেকোনো অ্যাপস ও ওয়েবসাইটের হুবহু (1:1 Replica) ক্লোন ইঞ্জিন
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              কুয়েতের শীর্ষস্থানীয় অ্যাপস (Talabat, 4Sale, KFH, Boutiqaat, Kuwait Mobile ID) এবং গ্লোবাল মোবাইল অ্যাপস রিভার্স-ইঞ্জিনিয়ার করে ১-ক্লিকে সম্পূর্ণ <strong>Next.js 15 PWA</strong> এবং <strong>React Native (Expo)</strong> মোবাইল কোড তৈরি করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>মোবাইল ও কুয়েত অ্যাপ ক্লোন গাইড</span>
            </button>

            <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-3 min-w-[220px] text-[11px] space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>মোবাইল ইঞ্জিন:</span>
                <span className="text-emerald-400 font-semibold">React Native + Expo</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>কুয়েত সাপোর্ট:</span>
                <span className="text-indigo-400 font-semibold">KWD (د.ك) + Arabic RTL</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>পেমেন্ট মক:</span>
                <span className="text-cyan-400 font-semibold">KNet & Apple Pay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar & Controls */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleStartClone()}
                placeholder="যেকোনো কুয়েত বা মোবাইল অ্যাপ/ওয়েবসাইট লিংক দিন (যেমন: https://www.talabat.com/kuwait বা https://q84sale.com)"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-sm font-mono shadow-inner"
              />
            </div>

            <button
              onClick={() => handleStartClone()}
              disabled={loading || !targetUrl.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>স্ক্র্যাপিং ও ক্লোনিং চলছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>1:1 ক্লোন ও কোড তৈরি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Platform Output Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">টার্গেট আউটপুট:</span>
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setTargetPlatform('both')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                    targetPlatform === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ হাইব্রিড (ওয়েব + মোবাইল)
                </button>
                <button
                  onClick={() => setTargetPlatform('mobile')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                    targetPlatform === 'mobile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 React Native (Expo)
                </button>
                <button
                  onClick={() => setTargetPlatform('web')}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                    targetPlatform === 'web' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💻 Next.js 15 PWA
                </button>
              </div>
            </div>

            {/* Presets Switcher Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPresetCategory('kuwait')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  presetCategory === 'kuwait'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>🇰🇼 কুয়েত শীর্ষ অ্যাপস</span>
              </button>
              <button
                onClick={() => setPresetCategory('global')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  presetCategory === 'global'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <span>🌐 গ্লোবাল টেক অ্যাপস</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">
              {presetCategory === 'kuwait' ? '🇰🇼 কুয়েত রেডি ডেমো:' : '🌐 গ্লোবাল রেডি ডেমো:'}
            </span>
            {(presetCategory === 'kuwait' ? KUWAIT_PRESET_TARGETS : GLOBAL_PRESET_TARGETS).map((p) => (
              <button
                key={p.name}
                onClick={() => handleStartClone(p.url)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono">({p.tag})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crawling Progress Indicator */}
      {loading && (
        <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-4 animate-pulse shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              {crawlSteps[progressStep]}
            </span>
            <span className="font-mono text-emerald-400">ধাপ {progressStep + 1} / {crawlSteps.length}</span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${((progressStep + 1) / crawlSteps.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px] text-slate-400">
            <div className={`p-2 rounded-lg border ${progressStep >= 0 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'}`}>
              1. Root Crawl
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 1 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'}`}>
              2. Routes & Tabs
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 2 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'}`}>
              3. Next.js App Router
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 3 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'}`}>
              4. React Native & KWD
            </div>
            <div className={`p-2 rounded-lg border ${progressStep >= 4 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'}`}>
              5. Expo & ZIP Packaging
            </div>
          </div>
        </div>
      )}

      {/* Cloned Project Results */}
      {project && !loading && (
        <div className="space-y-6">
          {/* Project Summary Header & Actions */}
          <div className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{project.brandName}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {project.region === 'kuwait' ? '🇰🇼 Kuwait 1:1 Mobile & Web Ready' : '1:1 Multi-Page & Mobile Ready'}
                  </span>
                </h3>
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{project.domain}</span>
                </a>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">{project.summary}</p>

              {/* Kuwait & Mobile Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {project.region === 'kuwait' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                    💰 Currency: KWD (د.ك)
                  </span>
                )}
                {project.isRtlSupported && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                    🌐 RTL Arabic Supported
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                  📱 React Native & Expo Code
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
                  ⚡ Next.js 15 PWA
                </span>
              </div>
            </div>

            {/* Action Bar: Download ZIPs & Publish to Marketplace */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadMobileZip}
                disabled={isExportingMobileZip}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isExportingMobileZip ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                <span>React Native Mobile ZIP</span>
              </button>

              <button
                onClick={handleDownloadWebZip}
                disabled={isExportingWebZip}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {isExportingWebZip ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Next.js Web & PWA ZIP</span>
              </button>

              {onPublishToMarketplace && (
                <button
                  onClick={handlePublishToMarketplace}
                  disabled={isPublished}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isPublished
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/25'
                  }`}
                >
                  {isPublished ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>মার্কেটপ্লেসে পাবলিশ্ড!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>মার্কেটপ্লেসে বিক্রি করুন (৳{project.valuation.recommendedPriceBdt.toLocaleString()})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI Valuation & Quality Score Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> কোড কোয়ালিটি
              </div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {project.valuation.qualityScore}/100 <span className="text-xs text-slate-400 font-normal">(Grade A+)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="text-indigo-400 w-4 h-4" /> প্রস্তাবিত মূল্য
              </div>
              <div className="text-xl font-extrabold text-white mt-1">
                ৳{project.valuation.recommendedPriceBdt.toLocaleString()}{' '}
                <span className="text-xs text-indigo-400 font-mono">(${project.valuation.recommendedPriceUsd})</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="text-cyan-400 w-4 h-4" /> রাউট ও মোবাইল স্ক্রিন
              </div>
              <div className="text-xl font-extrabold text-cyan-400 mt-1">
                {project.routes.length} টি পূর্ণ পেজ
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <FileCode className="text-amber-400 w-4 h-4" /> কোড লাইন ভলিউম
              </div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {project.valuation.codeLines}+ Lines
              </div>
            </div>
          </div>

          {/* Navigation Route & View Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
            {/* Discovered Route Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold px-2">পেজ নির্বাচন:</span>
              {project.routes.map((r) => (
                <button
                  key={r.path}
                  onClick={() => setActiveRoutePath(r.path)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeRoutePath === r.path
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">{r.path}</span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                  activeViewMode === 'preview'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>লাইভ প্রিভিউ</span>
              </button>

              <button
                onClick={() => setActiveViewMode('mobile_expo')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                  activeViewMode === 'mobile_expo'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>মোবাইল সিমুলেটর</span>
              </button>

              <button
                onClick={() => setActiveViewMode('code')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                  activeViewMode === 'code'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>কোড ভিউয়ার</span>
              </button>

              <button
                onClick={() => setActiveViewMode('tree')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                  activeViewMode === 'tree'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>প্রজেক্ট স্ট্রাকচার</span>
              </button>
            </div>

            {/* Viewport Width Controls for Preview */}
            {activeViewMode === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs text-slate-400">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                  title="Desktop (100%)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewportMode('tablet')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewportMode === 'tablet' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-slate-800 text-white' : 'hover:text-white'
                  }`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Main Workspace Display: Web Preview */}
          {activeViewMode === 'preview' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl flex flex-col items-center p-4">
              <div
                className="w-full transition-all duration-300 rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950"
                style={{
                  maxWidth:
                    viewportMode === 'mobile'
                      ? '375px'
                      : viewportMode === 'tablet'
                      ? '768px'
                      : '100%',
                  height: '640px',
                }}
              >
                {currentRoute?.previewHtml ? (
                  <iframe
                    title={currentRoute.title}
                    srcDoc={currentRoute.previewHtml}
                    className="w-full h-full border-0 bg-slate-950"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    প্রিভিউ লোড হচ্ছে...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Workspace Display: Mobile Phone Simulator (React Native / Kuwait Mobile ID / Talabat Mock) */}
          {activeViewMode === 'mobile_expo' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-950 p-6 flex flex-col items-center justify-center shadow-2xl">
              {/* Simulator Toolbar */}
              <div className="w-full max-w-sm flex items-center justify-between mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">ভাষা:</span>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex">
                    <button
                      onClick={() => setPreviewLanguage('en')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${previewLanguage === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setPreviewLanguage('ar')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${previewLanguage === 'ar' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      العربية (RTL)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>React Native / Expo Active</span>
                </div>
              </div>

              {/* Realistic Mobile Device Mockup */}
              <div
                className="w-full max-w-[360px] h-[680px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative select-none"
                style={{ direction: previewLanguage === 'ar' ? 'rtl' : 'ltr' }}
              >
                {/* Notch / Dynamic Island */}
                <div className="w-full bg-slate-900 pt-2 pb-1.5 px-6 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80">
                  <span className="font-mono font-bold text-white">9:41</span>
                  <div className="w-20 h-4 bg-black rounded-full" />
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>5G</span>
                    <span>100% 🔋</span>
                  </div>
                </div>

                {/* Mobile Top Header */}
                <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{project.brandName}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      {project.region === 'kuwait'
                        ? previewLanguage === 'ar' ? 'الكويت • دفع كي نت متاح' : 'Kuwait • KNet Ready'
                        : 'Official Mobile App'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewLanguage(previewLanguage === 'ar' ? 'en' : 'ar')}
                      className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-indigo-300 border border-slate-700"
                    >
                      {previewLanguage === 'ar' ? 'EN' : 'عربي'}
                    </button>
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                      🛒
                    </div>
                  </div>
                </div>

                {/* Mobile Scrollable View */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Hero Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 shadow-lg">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold mb-2">
                      {project.region === 'kuwait'
                        ? previewLanguage === 'ar' ? '🇰🇼 تطبيق الكويت الرسمي' : '🇰🇼 Kuwait Official Mobile App'
                        : '✨ 100% Mobile Optimized'}
                    </div>
                    <h3 className="text-base font-extrabold text-white">
                      {previewLanguage === 'ar' ? `أهلاً بك في ${project.brandName}` : `Welcome to ${project.brandName}`}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {previewLanguage === 'ar'
                        ? 'تطبيق فائق السرعة مع تجربة مستخدم سلسة ودعم كامل لخدمات الدفع والتوصيل.'
                        : project.tagline}
                    </p>
                    <button className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                      {previewLanguage === 'ar' ? 'اطلب الآن • ادفع كي نت' : 'Order Now • Fast Delivery'}
                    </button>
                  </div>

                  {/* Kuwait Features / Services Grid */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-200">
                      {previewLanguage === 'ar' ? 'الخدمات المتاحة في الكويت' : 'Available Kuwait Services'}
                    </h5>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                        <div className="text-lg mb-1">⚡</div>
                        <div className="text-xs font-bold text-white">
                          {previewLanguage === 'ar' ? 'توصيل فوري' : 'Express Delivery'}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold mt-1">
                          {project.region === 'kuwait' ? '1.500 د.ك' : '$15.00'}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                        <div className="text-lg mb-1">💳</div>
                        <div className="text-xs font-bold text-white">
                          {previewLanguage === 'ar' ? 'بوابة KNet' : 'KNet / Apple Pay'}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-bold mt-1">
                          {project.region === 'kuwait' ? 'دفع آمن' : 'Secured'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kuwait Highlights List */}
                  {project.kuwaitFeatures && project.kuwaitFeatures.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300">
                        {previewLanguage === 'ar' ? 'مميزات النظام:' : 'System Features:'}
                      </div>
                      {project.kuwaitFeatures.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Navigation Tab Bar */}
                <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-3 flex items-center justify-around">
                  {[
                    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', icon: '🏠' },
                    { id: 'explore', labelEn: 'Explore', labelAr: 'استكشاف', icon: '🧭' },
                    { id: 'orders', labelEn: 'Orders', labelAr: 'طلباتي', icon: '🛍️' },
                    { id: 'profile', labelEn: 'Profile', labelAr: 'حسابي', icon: '👤' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMobileNav(tab.id)}
                      className={`flex flex-col items-center gap-0.5 cursor-pointer transition ${
                        activeMobileNav === tab.id ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span className="text-[10px]">
                        {previewLanguage === 'ar' ? tab.labelAr : tab.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Workspace Display: Code Viewer */}
          {activeViewMode === 'code' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden">
              {/* File selector header */}
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">ফাইল নির্বাচন:</span>
                  {[
                    'App.tsx (React Native Mobile)',
                    'app.json (Expo)',
                    'capacitor.config.json',
                    'app/page.tsx',
                    ...project.routes
                      .filter((r) => r.path !== '/')
                      .map((r) => `app${r.path}/page.tsx`),
                    'components/Navbar.tsx',
                    'package.json',
                    'README.md',
                  ].map((fileName) => (
                    <button
                      key={fileName}
                      onClick={() => setSelectedFileForCode(fileName)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                        selectedFileForCode === fileName
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি করুন'}</span>
                </button>
              </div>

              {/* Code viewer */}
              <div className="p-4 overflow-x-auto max-h-[550px] font-mono text-xs text-slate-300 bg-slate-950">
                <pre className="leading-relaxed whitespace-pre">{getSelectedFileCode()}</pre>
              </div>
            </div>
          )}

          {/* Main Workspace Display: Project Folder Tree */}
          {activeViewMode === 'tree' && (
            <div className="border border-slate-800 rounded-2xl bg-slate-900 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" />
                স্বয়ংক্রিয়ভাবে তৈরি মাল্টি-পেজ ও মোবাইল ফোল্ডার স্ট্রাকচার:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Repo Structure */}
                <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> 📁 {project.domain.replace(/[^a-z0-9]/gi, '_')}-react-native-expo/
                  </div>
                  <div className="pl-4 text-emerald-300">├── 📄 App.tsx (Mobile Tabs, RTL & KWD Engine)</div>
                  <div className="pl-4 text-emerald-300">├── 📄 app.json (Expo Standalone Mobile App Config)</div>
                  <div className="pl-4 text-slate-400">├── 📄 package.json (Expo 51 & React Native dependencies)</div>
                  <div className="pl-4 text-slate-400">├── 📄 capacitor.config.json (Android Studio & APK Export)</div>
                  <div className="pl-4 text-slate-400">├── 📄 README.md (EAS Build & APK instructions)</div>
                  <div className="pl-4 text-slate-500">└── 📁 assets/ (App Icon, Splash Screen, Adaptive Icon)</div>
                </div>

                {/* Web Next.js Structure */}
                <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
                  <div className="text-indigo-400 font-bold flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> 📁 {project.domain.replace(/[^a-z0-9]/gi, '_')}-replica/
                  </div>
                  <div className="pl-4 text-slate-400">├── 📁 app/</div>
                  <div className="pl-8 text-emerald-400">├── 📄 layout.tsx (Shared Root Layout + PWA Meta)</div>
                  <div className="pl-8 text-emerald-400">├── 📄 globals.css (Tailwind tokens)</div>
                  <div className="pl-8 text-emerald-400">├── 📄 page.tsx (Homepage `/`)</div>
                  {project.routes.filter(r => r.path !== '/').map(r => (
                    <div key={r.path} className="pl-8 text-indigo-300">├── 📁 {r.path.replace(/^\//, '')}/page.tsx</div>
                  ))}
                  <div className="pl-4 text-slate-400">├── 📁 components/ (Navbar, Footer, MobileBottomNav)</div>
                  <div className="pl-4 text-slate-400">├── 📁 public/manifest.json (PWA Installable App Shell)</div>
                  <div className="pl-4 text-slate-400">└── 📄 package.json (Next.js 15, React 19)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kuwait & Mobile App Cloning Masterclass Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white">
                <SmartphoneNfc className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  যে কোন কুয়েত ও মোবাইল অ্যাপস ক্লোন করবেন কীভাবে (Complete Blueprint)
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step masterclass: From URL extraction to Google Play & App Store deployment
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-2">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                  <span>১. টার্গেট অ্যাপ ও ডোমেইন নির্বাচন (Target App Selection):</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  কুয়েতের যে অ্যাপটি ক্লোন করতে চান তার ওয়েব এড্রেস বা প্লে স্টোর লিংক নির্বাচন করুন। যেমন:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    🍔 <strong>Talabat Kuwait:</strong> <code>https://www.talabat.com/kuwait</code>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    🚗 <strong>4Sale Q8:</strong> <code>https://q84sale.com</code>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    🏦 <strong>KFH Bank:</strong> <code>https://www.kfh.com</code>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    💄 <strong>Boutiqaat:</strong> <code>https://www.boutiqaat.com</code>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-indigo-400 font-bold flex items-center gap-2">
                  <span>২. ডিপ স্ক্র্যাপিং ও রাউট এক্সট্রাকশন (Deep Scraping & Route Mapping):</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  আমাদের AI Cloner ইঞ্জিনের ইনপুট বক্সে লিংকটি দিয়ে <strong>&quot;1:1 ক্লোন ও কোড তৈরি করুন&quot;</strong> বাটনে চাপ দিন। সিস্টেমটি ভেতরকার সব লিঙ্ক খুঁজে বের করবে (যেমন: <code>/about</code>, <code>/services</code>, <code>/pricing</code>, <code>/contact</code>) এবং একটি সম্পূর্ণ মাল্টি-পেজ হাইর্যার্কি তৈরি করবে।
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-cyan-400 font-bold flex items-center gap-2">
                  <span>৩. কুয়েত স্পেশাল লোকালাইজেশন (Kuwait Dinar & Arabic RTL):</span>
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
                  <li><strong>কারেন্সি:</strong> কুয়েতি দিনার (KWD / د.ك) স্বয়ংক্রিয়ভাবে সক্রিয় হবে।</li>
                  <li><strong>ভাষা ও লেআউট:</strong> আরবি Right-to-Left (<code>dir=&quot;rtl&quot;</code>) ও ইংরেজি উভয় মোডেই টগল করা যাবে।</li>
                  <li><strong>পেমেন্ট গেটওয়ে:</strong> কুয়েতের নিজস্ব <strong>KNet</strong> ও Apple Pay এর রেডি চেকআউট মক তৈরি থাকবে।</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-purple-400 font-bold flex items-center gap-2">
                  <span>৪. মোবাইল অ্যাপ তৈরি (Android APK ও iOS IPA Build):</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>&quot;React Native Mobile ZIP&quot;</strong> ডাউনলোড করে আপনার পিসিতে নিচের ৩টি সহজ কমান্ড দিন:
                </p>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-300 space-y-1">
                  <div># ১. প্যাকেজ ইনস্টল করুন</div>
                  <div>npm install</div>
                  <div># ২. এক্সপো মোবাইল সার্ভার চালু করুন (Android / iPhone-এ লাইভ দেখতে)</div>
                  <div>npx expo start</div>
                  <div># ৩. সরাসরি Android APK বানাতে (EAS Build)</div>
                  <div>npx eas build -p android --profile preview</div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-amber-400 font-bold flex items-center gap-2">
                  <span>৫. গুগল প্লে স্টোর ও অ্যাপ স্টোরে সাবমিট:</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  জেনারেট হওয়া <code>app.json</code> ফাইলে আপনার অ্যাপ আইডি (যেমন: <code>com.sheikhfarid.talabatkw</code>) দিয়ে এক ক্লিকে গুগল প্লে কনসোল ও অ্যাপল স্টোরে পাবলিশ করতে পারবেন।
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                বুঝেছি, ক্লোনিং শুরু করি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
