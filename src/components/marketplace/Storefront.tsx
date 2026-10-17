import React, { useState } from 'react';
import { MarketplaceProduct } from '../../types/marketplace';
import { 
  Search, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Code2, 
  Layers, 
  Eye,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface StorefrontProps {
  products: MarketplaceProduct[];
  onSelectProduct: (product: MarketplaceProduct) => void;
  onPreviewProduct: (product: MarketplaceProduct) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  onSelectProduct,
  onPreviewProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Full-Stack', 'SaaS', 'Mobile PWA', 'AI & Bots', 'UI Kit'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI-Audited Code Marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            যাচাইকৃত প্রজেক্ট সোর্স কোড কিনুন ও বিক্রি করুন
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Gemini AI দ্বারা কোড কোয়ালিটি, সিকিউরিটি ও আর্কিটেকচার ভ্যালুয়েশন সম্পন্ন। কেনার সাথে সাথে ইন-অ্যাপ ইনস্ট্যান্ট ডাউনলোড ও জিমেইলে অটোমেটিক ডেলিভারি।
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tech stack..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group shadow-xl hover:shadow-emerald-950/20"
          >
            <div>
              {/* Card Top: Category and AI Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {product.category}
                </span>

                {product.valuationReport && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    AI Grade: {product.valuationReport.securityGrade} ({product.valuationReport.qualityScore}/100)
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                {product.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {product.tagline}
              </p>

              {/* Tech Stack Chips */}
              <div className="flex flex-wrap gap-1.5 my-3.5">
                {product.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Pricing, Sales & Action Buttons */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      ৳{product.priceBdt.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (${product.priceUsd})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Commercial License</span>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end text-amber-400 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="ml-1 font-bold">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{product.salesCount} sales</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPreviewProduct(product)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-900/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Buy Code</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
