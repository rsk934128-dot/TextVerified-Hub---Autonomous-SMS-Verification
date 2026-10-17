import React, { useState } from 'react';
import { MarketplaceProduct, CodeValuationReport } from '../../types/marketplace';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Upload, 
  FileCode, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface SellerValuationStudioProps {
  onPublishProduct: (product: MarketplaceProduct) => void;
}

const COMMON_TECHS = [
  'React 19',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Firebase Firestore',
  'Supabase',
  'Node.js Express',
  'PostgreSQL',
  'PWA / Service Worker',
  'Telegram Bot API',
  'Stripe / bKash',
  'Gemini AI API',
];

export const SellerValuationStudio: React.FC<SellerValuationStudioProps> = ({
  onPublishProduct,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<'Full-Stack' | 'SaaS' | 'Mobile PWA' | 'AI & Bots' | 'UI Kit' | 'API & Backend'>('Full-Stack');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['React 19', 'TypeScript', 'Tailwind CSS', 'Firebase Firestore']);
  const [demoUrl, setDemoUrl] = useState('');
  const [linesOfCode, setLinesOfCode] = useState(2400);
  const [codeSnippet, setCodeSnippet] = useState(
`// Architecture: React 19 + Express + Firebase + PWA
// Features: Google Auth, Firestore ABAC Rules, Telegram Webhook, AI Valuation Engine, Offline SW
// Endpoints: /api/v2/verifications, /api/gemini/evaluate-code, /api/marketplace/send-receipt`
  );

  const [evaluating, setEvaluating] = useState(false);
  const [report, setReport] = useState<CodeValuationReport | null>(null);
  const [customPriceBdt, setCustomPriceBdt] = useState<number>(4500);
  const [customPriceUsd, setCustomPriceUsd] = useState<number>(39);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setEvaluating(true);
    setPublishSuccess(false);

    try {
      const response = await fetch('/api/gemini/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: tagline,
          category,
          techStack: selectedTechs,
          codeSnippets: codeSnippet,
          linesOfCode,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        setCustomPriceBdt(data.report.recommendedPriceBdt || data.report.valuationBdt);
        setCustomPriceUsd(data.report.recommendedPriceUsd || data.report.valuationUsd);
      }
    } catch (err) {
      console.error('Valuation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !report) return;

    const newProduct: MarketplaceProduct = {
      id: 'prod_' + Date.now(),
      title,
      tagline: tagline || 'High quality software template evaluated by Gemini AI',
      description: report.architectureAnalysis,
      category,
      tags: selectedTechs,
      techStack: selectedTechs,
      demoUrl: demoUrl || window.location.origin,
      sellerId: 'sheikh_farid_arch',
      sellerName: 'Sheikh Farid (Architect)',
      sellerEmail: 'monikhoku88@gmail.com',
      priceBdt: customPriceBdt,
      priceUsd: customPriceUsd,
      valuationReport: report,
      downloadFileName: `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_source_code.zip`,
      downloadSizeMb: 14.8,
      salesCount: 1,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    onPublishProduct(newProduct);
    setPublishSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Gemini AI Automated Code Valuation Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            প্রজেক্টের তথ্য দিন — এআই কোড অ্যানালাইসিস করে সর্বোচ্চ ন্যায্য মূল্য নির্ধারণ করবে
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            আপনার গিটহাব লিংক, আর্কিটেকচার বা প্যাকেজ বিবরণ দিন। আমাদের জেমিনাই মডেল কোডের কোয়ালিটি, নিরাপত্তা এবং আর্কিটেকচার বিশ্লেষণ করে বাজারমূল্য প্রস্তাব করবে।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form (7 cols) */}
        <form onSubmit={handleEvaluate} className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            প্রজেক্ট মেটাডাটা ও কোড কাঠামো
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TextVerified Autonomous SMS & PWA Engine"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Full-Stack">Full-Stack Application</option>
                <option value="SaaS">SaaS Platform</option>
                <option value="Mobile PWA">Mobile PWA App</option>
                <option value="AI & Bots">AI Agent & Bot Tools</option>
                <option value="UI Kit">UI Kit & Templates</option>
                <option value="API & Backend">API & Backend Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Lines of Code
              </label>
              <input
                type="number"
                value={linesOfCode}
                onChange={(e) => setLinesOfCode(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tagline / Selling Hook
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Autonomous SMS verification engine with real-time polling and Telegram dispatcher"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Tech Stack Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Included Tech Stack
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TECHS.map((tech) => {
                const isSelected = selectedTechs.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Demo Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Live Demo / Preview URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-demo-url.run.app"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          {/* Code / Architecture Snippet */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Architecture or Code Snippet (for AI review)
            </label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={evaluating || !title.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {evaluating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemini কোড অ্যানালাইসিস ও ভ্যালুয়েশন চলছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run AI Code Valuation with Gemini</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: AI Valuation Report & Publishing (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {report ? (
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Valuation Report</h4>
                    <p className="text-[10px] text-emerald-400 font-mono">Gemini 3.8 Flash Certified</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                  Grade: {report.securityGrade}
                </span>
              </div>

              {/* Price Evaluation Highlight */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  প্রস্তাবিত বাজারমূল্য (Appraised Value):
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    ৳{report.valuationBdt.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono text-slate-300">
                    (${report.valuationUsd} USD)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tier: <strong className="text-slate-200">{report.complexityTier}</strong> • Quality Score: <strong className="text-emerald-400">{report.qualityScore}/100</strong>
                </p>
              </div>

              {/* Architecture & Strengths */}
              <div className="text-xs space-y-2">
                <p className="text-slate-300 font-medium">
                  {report.architectureAnalysis}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-300 block mb-1">
                    মূল শক্তি ও হাইলাইটস:
                  </span>
                  <ul className="space-y-1">
                    {report.keyStrengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Security Check: </strong>
                  {report.securityReview}
                </div>
              </div>

              {/* Seller Adjustable Pricing Slider */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">বিক্রয় মূল্য নির্ধারণ (BDT):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ৳{customPriceBdt.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="250"
                  value={customPriceBdt}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomPriceBdt(val);
                    setCustomPriceUsd(Math.round(val / 115));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Publish Button */}
              <button
                type="button"
                onClick={handlePublish}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>মার্কেটপ্লেসে লাইভ পাবলিশ করুন</span>
              </button>

              {publishSuccess && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>অভিনন্দন! আপনার প্রজেক্ট মার্কেটপ্লেস স্টোরে লাইভ হয়েছে।</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">AI Valuation রিপোর্ট অপেক্ষমাণ</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                বামের ফর্মে আপনার প্রজেক্টের টাইটেল ও কোড ডিটেইলস লিখে <strong>"Run AI Code Valuation"</strong> বাটনে ক্লিক করুন। কয়েক সেকেন্ডেই বিস্তারিত রিপোর্ট তৈরি হয়ে যাবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
