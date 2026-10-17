import React from 'react';
import { MarketplaceProduct } from '../../types/marketplace';
import { 
  X, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Code2, 
  Sparkles,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface ProductPreviewModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
  onBuy: (product: MarketplaceProduct) => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  onClose,
  onBuy,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {product.category}
            </span>
            {product.valuationReport && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Grade: {product.valuationReport.securityGrade}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <h3 className="text-xl font-extrabold text-white">{product.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{product.tagline}</p>
          </div>

          {/* Pricing Highlight */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Commercial License Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  ৳{product.priceBdt.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-slate-400">(${product.priceUsd} USD)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBuy(product);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Buy & Unlock ZIP</span>
            </button>
          </div>

          {/* AI Valuation Report Details */}
          {product.valuationReport && (
            <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Gemini AI Code Audit & Quality Breakdown</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {product.valuationReport.architectureAnalysis}
              </p>

              <div>
                <span className="text-[11px] font-bold text-slate-200 block mb-1">
                  Key Verified Strengths:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {product.valuationReport.keyStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-slate-300">Security Audit: </strong>
                {product.valuationReport.securityReview}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">Technologies Used</span>
            <div className="flex flex-wrap gap-1.5">
              {product.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Demo Link button if available */}
          {product.demoUrl && (
            <div className="pt-2">
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                <span>Open Live Demo in New Window</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
