import React, { useState } from 'react';
import { PurchaseOrder } from '../../types/marketplace';
import { 
  Key, 
  Download, 
  Check, 
  Copy, 
  ShoppingBag, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface BuyerVaultProps {
  orders: PurchaseOrder[];
  onBrowseStore: () => void;
}

export const BuyerVault: React.FC<BuyerVaultProps> = ({ orders, onBrowseStore }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (order: PurchaseOrder) => {
    const dummyZipContent = `// Project: ${order.productTitle}
// License Key: ${order.licenseKey}
// Buyer: ${order.buyerName} (${order.buyerEmail})
// Verified by: AI Studio Marketplace
console.log("Welcome to ${order.productTitle}!");`;

    const blob = new Blob([dummyZipContent], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.productTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_source_code.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            My In-App Vault
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            আপনার ক্রয়কৃত প্রজেক্ট ও লাইসেন্স কি ভল্ট
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            আপনার কেনা সকল সফটওয়্যার সোর্স কোড ও কমার্শিয়াল লাইসেন্স এখানে আজীবন সংরক্ষিত থাকবে। যখন ইচ্ছা ১-ক্লিকে জিপ ফাইল ডাউনলোড করে নিন।
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">ভল্ট খালি</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              আপনি এখনও কোনো প্রজেক্ট ক্রয় করেননি। মার্কেটপ্লেসের প্রিমিয়াম ভেরিফাইড প্রজেক্টগুলো দেখতে স্টোর ব্রাউজ করুন।
            </p>
          </div>
          <button
            onClick={onBrowseStore}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/40 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>মার্কেটপ্লেস ব্রাউজ করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Order #{order.orderId}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{order.productTitle}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-emerald-400 font-bold">
                      ৳{order.amountBdt.toLocaleString()}
                    </span>
                    <span>• {order.paymentMethod}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* License Key Display */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    License Key
                  </span>
                  <p className="font-mono text-xs font-bold text-cyan-300 truncate">
                    {order.licenseKey}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyKey(order.licenseKey)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Copy License Key"
                >
                  {copiedKey === order.licenseKey ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Download Action */}
              <button
                type="button"
                onClick={() => handleDownload(order)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>সোর্স কোড ডাউনলোড করুন (.ZIP)</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
