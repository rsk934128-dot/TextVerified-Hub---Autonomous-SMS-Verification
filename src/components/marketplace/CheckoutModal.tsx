import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MarketplaceProduct, PurchaseOrder } from '../../types/marketplace';
import { 
  X, 
  Check, 
  Download, 
  Mail, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface CheckoutModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
  onPurchaseSuccess: (order: PurchaseOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  onClose,
  onPurchaseSuccess,
}) => {
  const [buyerName, setBuyerName] = useState('Sheikh Farid');
  const [buyerEmail, setBuyerEmail] = useState('monikhoku88@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Stripe' | 'Instant Demo Pay'>('bKash');
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PurchaseOrder | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  if (!product) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate fast payment confirmation
      await new Promise((r) => setTimeout(r, 900));

      const orderId = 'ORD_' + Math.floor(100000 + Math.random() * 900000);
      const licenseKey = `SF-LIC-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const downloadToken = 'tok_' + Math.random().toString(36).substring(2, 10);

      const newOrder: PurchaseOrder = {
        orderId,
        productId: product.id,
        productTitle: product.title,
        buyerEmail,
        buyerName,
        amountBdt: product.priceBdt,
        amountUsd: product.priceUsd,
        paymentMethod,
        transactionId: 'TXN_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        licenseKey,
        downloadToken,
        createdAt: new Date().toISOString(),
      };

      // Trigger simulated Gmail dispatch
      fetch('/api/marketplace/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerEmail,
          orderId,
          productTitle: product.title,
          amountBdt: product.priceBdt,
          licenseKey,
        }),
      }).catch(() => {});

      setCompletedOrder(newOrder);
      onPurchaseSuccess(newOrder);
      setEmailSentNotice(true);

      // Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b'],
        });
      } catch (err) {}
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadZip = () => {
    // Generate simulated ZIP blob for instant developer inspection
    const dummyZipContent = `// Project: ${product.title}
// License: Commercial Developer License
// License Key: ${completedOrder?.licenseKey || 'VALID'}
// Buyer: ${buyerName} (${buyerEmail})
// Delivery: In-App Vault Verified
// Code Quality: AI Audited & Verified
console.log("Welcome to ${product.title}!");`;

    const blob = new Blob([dummyZipContent], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = product.downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              নিরাপদ চেকআউট ও ডুয়েল ডেলিভারি
            </h3>
            <p className="text-xs text-slate-400">Instant In-App Vault Download + Gmail Invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {!completedOrder ? (
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Product Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{product.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{product.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold font-mono text-emerald-400">
                      ৳{product.priceBdt.toLocaleString()}
                    </p>
                    <span className="text-xs font-mono text-slate-400">(${product.priceUsd})</span>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Email Address (for Gmail delivery) *</span>
                    <span className="text-[10px] text-cyan-400">Auto-Delivered</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  পেমেন্ট মাধ্যম নির্বাচন করুন
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bKash')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'bKash'
                        ? 'bg-pink-950/60 border-pink-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block text-pink-400">bKash</span>
                    <span className="text-[10px]">বিকাশ পে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'Nagad'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block text-amber-400">Nagad</span>
                    <span className="text-[10px]">নগদ পে</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Stripe')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'Stripe'
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold block text-indigo-400">Card / USD</span>
                    <span className="text-[10px]">Stripe Card</span>
                  </button>
                </div>
              </div>

              {/* Security Guarantee Pill */}
              <div className="flex items-center gap-2 p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>পেমেন্ট সম্পন্ন হওয়ামাত্র কোডের সম্পূর্ণ জিপ ফাইল এবং লাইসেন্স কি পেয়ে যাবেন।</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>পেমেন্ট যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>৳{product.priceBdt.toLocaleString()} পেমেন্ট ও আনলক করুন</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Purchase Success & Dual Delivery Screen */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  অর্ডার আইডি: <span className="font-mono text-emerald-400">#{completedOrder.orderId}</span>
                </p>
              </div>

              {/* License Key Box */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Commercial License Key
                </span>
                <p className="font-mono text-sm font-bold text-cyan-300 mt-0.5 select-all">
                  {completedOrder.licenseKey}
                </p>
              </div>

              {/* Dual Delivery Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>In-App Vault</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">ডাউনলোড বাটন প্রস্তুত</p>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Gmail Delivery</span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate">
                    {completedOrder.buyerEmail}
                  </p>
                </div>
              </div>

              {/* 1-Click ZIP Download Button */}
              <button
                type="button"
                onClick={handleDownloadZip}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>সোর্স কোড জিপ ফাইল ডাউনলোড করুন (.ZIP)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                সম্পন্ন ও বন্ধ করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
