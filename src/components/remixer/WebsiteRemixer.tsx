import React, { useState } from 'react';
import { 
  Globe, 
  Wand2, 
  Download, 
  Copy, 
  Play, 
  Loader2, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Palette, 
  Layers, 
  ExternalLink,
  Upload,
  Eye,
  Code
} from 'lucide-react';
import { MarketplaceProduct } from '../../types/marketplace';
import { DeepSiteCloner } from './DeepSiteCloner';

interface RemixedResult {
  title: string;
  tagline: string;
  summary: string;
  originalUrl: string;
  colorPalette: string[];
  keyFeatures: string[];
  reactCode: string;
  previewHtml: string;
}

interface WebsiteRemixerProps {
  onPublishToMarketplace?: (product: MarketplaceProduct) => void;
}

const PRESET_URLS = [
  { name: 'Linear App', url: 'https://linear.app', category: 'Productivity' },
  { name: 'Stripe', url: 'https://stripe.com', category: 'Fintech' },
  { name: 'Gumroad', url: 'https://gumroad.com', category: 'E-commerce' },
  { name: 'Vercel', url: 'https://vercel.com', category: 'DevTools' },
];

export const WebsiteRemixer: React.FC<WebsiteRemixerProps> = ({ onPublishToMarketplace }) => {
  const [remixMode, setRemixMode] = useState<'cloner' | 'remix'>('cloner');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [remixedData, setRemixedData] = useState<RemixedResult | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [published, setPublished] = useState(false);

  const handleRemix = async (targetUrl?: string) => {
    let inputUrl = (targetUrl || url).trim();
    if (!inputUrl) return;

    // Sanitize in case multiple comma-separated or space-separated URLs were entered
    const urlMatch = inputUrl.match(/https?:\/\/[^\s,;"'<>`]+/i);
    if (urlMatch) {
      inputUrl = urlMatch[0];
    } else {
      inputUrl = inputUrl.split(/[\s,;]+/)[0] || inputUrl;
    }
    inputUrl = inputUrl.replace(/^[<"'(]+/, '').replace(/[>"'),;]+$/, '').trim();
    if (inputUrl && !inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      inputUrl = 'https://' + inputUrl;
    }

    setUrl(inputUrl);
    setLoading(true);
    setRemixedData(null);
    setPublished(false);
    setActiveStep(1);

    // Step progression animation
    const stepTimer1 = setTimeout(() => setActiveStep(2), 1200);
    const stepTimer2 = setTimeout(() => setActiveStep(3), 2800);

    try {
      const res = await fetch('/api/remix-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setRemixedData(data);
      } else {
        alert(data.error || 'ওয়েবসাইট রিমিক্স করতে সমস্যা হয়েছে!');
      }
    } catch (err: unknown) {
      console.error('Remix request error:', err);
      alert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে।');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setActiveStep(0);
    }
  };

  const handleCopyCode = () => {
    if (!remixedData) return;
    navigator.clipboard.writeText(remixedData.reactCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!remixedData) return;
    const blob = new Blob([remixedData.reactCode], { type: 'text/javascript' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${remixedData.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_Remix.jsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublishToStore = () => {
    if (!remixedData || !onPublishToMarketplace) return;

    const newProduct: MarketplaceProduct = {
      id: 'remix_' + Date.now(),
      title: `${remixedData.title} (Modern Remake)`,
      tagline: remixedData.tagline || 'Modern React 19 & Tailwind CSS Website Remix',
      description: remixedData.summary,
      category: 'UI Kit',
      tags: ['React 19', 'Tailwind CSS', 'Website Remix', 'Responsive'],
      techStack: ['React 19', 'Tailwind CSS', 'Lucide Icons'],
      demoUrl: remixedData.originalUrl,
      sellerId: 'remixer_pro',
      sellerName: 'AI Studio Remixer',
      sellerEmail: 'monikhoku88@gmail.com',
      priceBdt: 2500,
      priceUsd: 22,
      valuationReport: {
        valuationBdt: 2800,
        valuationUsd: 25,
        recommendedPriceBdt: 2500,
        recommendedPriceUsd: 22,
        qualityScore: 95,
        securityGrade: 'A+',
        complexityTier: 'Basic Template',
        architectureAnalysis: `Remixed single-file React component structured with modular Tailwind utility classes inspired by ${remixedData.originalUrl}.`,
        keyStrengths: remixedData.keyFeatures,
        securityReview: 'Client-side sanitized React markup with zero insecure innerHTML injections.',
        monetizationTips: 'Ideal for selling as a landing page or UI template on our Code Marketplace.',
      },
      downloadFileName: `${remixedData.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_remix.zip`,
      downloadSizeMb: 8.5,
      salesCount: 1,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    onPublishToMarketplace(newProduct);
    setPublished(true);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRemixMode('cloner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              remixMode === 'cloner'
                ? 'bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>🚀 1:1 মোবাইল ও কুয়েত অ্যাপ ক্লোনার (Mobile & Kuwait Cloner)</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-900/70 text-emerald-200 border border-emerald-500/40">
              KWD + RTL
            </span>
          </button>

          <button
            onClick={() => setRemixMode('remix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              remixMode === 'remix'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>সিঙ্গেল পেজ রিমিক্সার (Instant Remixer)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-[11px] text-slate-400 px-3">
          <span>ইন্টারনাল লিংক অটো-ম্যাপিং ও 1-ক্লিক ZIP এক্সপোর্ট সক্রিয়</span>
        </div>
      </div>

      {/* Render Active Engine */}
      {remixMode === 'cloner' ? (
        <DeepSiteCloner onPublishToMarketplace={onPublishToMarketplace} />
      ) : (
        <div className="space-y-6">
          {/* Studio Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold mb-3">
                <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                AI Website Remixer Studio • Powered by Gemini 3.8 Flash
              </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            যেকোনো ওয়েবসাইটের লিংক দিন — AI সেকেন্ডে আধুনিক React + Tailwind অ্যাপ বানিয়ে দেবে!
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm mt-2 leading-relaxed">
            লাইভ স্ক্র্যাপার যেকোনো ওয়েবসাইটের DOM স্ট্রাকচার ও কালার প্যালেট রিড করে Gemini 3.8 Flash দিয়ে স্বয়ংক্রিয়ভাবে আল্ট্রা-মডার্ন React অ্যাপে রূপান্তর করে। কোড দেখুন, ব্রাউজারে লাইভ রান করান অথবা ১-ক্লিকে আমাদের মার্কেটপ্লেসে বিক্রি করুন!
          </p>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRemix();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com বা যেকোনো সাইটের লিংক পেস্ট করুন..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>রিমিক্স প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>AI দিয়ে রিমিক্স করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">এক ক্লিকে ট্রাই করুন:</span>
            {PRESET_URLS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setUrl(preset.url);
                  handleRemix(preset.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-mono transition cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Steps State */}
      {loading && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Gemini 3.8 Flash রিমিক্স পাইপলাইন সক্রিয়</h4>
            <div className="flex items-center justify-center gap-3 mt-3 text-xs">
              <span className={`flex items-center gap-1 ${activeStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                1. DOM Extraction
              </span>
              <span className="text-slate-600">❯</span>
              <span className={`flex items-center gap-1 ${activeStep >= 2 ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                2. Layout Synthesis
              </span>
              <span className="text-slate-600">❯</span>
              <span className={`flex items-center gap-1 ${activeStep >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                3. React 19 App Generation
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Remixed Result Presentation */}
      {remixedData && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
          {/* Header Bar */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Remix Completed
                </span>
                <span className="text-xs text-slate-400 truncate max-w-xs">
                  Source: {remixedData.originalUrl}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{remixedData.title}</h3>
            </div>

            {/* View Switcher: Live Preview vs Code */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Interactive Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'code'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>React Component Code</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>.JSX Download</span>
              </button>

              {onPublishToMarketplace && (
                <button
                  type="button"
                  onClick={handlePublishToStore}
                  disabled={published}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{published ? 'Listed on Storefront!' : 'Sell on Marketplace'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Color Palette & Extracted Features Pill Bar */}
          <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Extracted Palette:</span>
              <div className="flex items-center gap-1.5">
                {remixedData.colorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-md border border-slate-700 flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {remixedData.keyFeatures.slice(0, 3).map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>

          {/* View Content: Live Sandbox Iframe vs React Code */}
          {activeView === 'preview' ? (
            <div className="p-4 bg-slate-950/70">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 min-h-[550px]">
                <iframe
                  title="Remixed Website Sandbox Preview"
                  srcDoc={remixedData.previewHtml}
                  className="w-full h-[550px] border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950">
              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto max-h-[550px] border border-slate-800 leading-relaxed select-all">
                <code>{remixedData.reactCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
};
