import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  ShieldCheck, 
  Search, 
  MessageSquare, 
  Sparkles, 
  HelpCircle,
  PlayCircle
} from 'lucide-react';

interface VerificationPanelProps {
  onStartVerification: (serviceName: string) => Promise<void>;
  loading: boolean;
  statusText: string;
}

const PRESET_SERVICES = [
  { name: 'WhatsApp', category: 'Chat', icon: '💬', cost: '$0.60' },
  { name: 'Telegram', category: 'Chat', icon: '✈️', cost: '$0.50' },
  { name: 'Google', category: 'Tech', icon: '🔍', cost: '$0.50' },
  { name: 'OpenAI', category: 'AI', icon: '🤖', cost: '$0.75' },
  { name: 'Discord', category: 'Community', icon: '🎮', cost: '$0.40' },
  { name: 'Twitter', category: 'Social', icon: '🐦', cost: '$0.45' },
  { name: 'Instagram', category: 'Social', icon: '📸', cost: '$0.50' },
  { name: 'TikTok', category: 'Video', icon: '🎵', cost: '$0.55' },
  { name: 'Steam', category: 'Gaming', icon: '🕹️', cost: '$0.40' },
  { name: 'Uber', category: 'Transport', icon: '🚗', cost: '$0.50' },
  { name: 'Binance', category: 'Crypto', icon: '🪙', cost: '$0.80' },
  { name: 'Microsoft', category: 'Tech', icon: '💻', cost: '$0.45' },
];

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  onStartVerification,
  loading,
  statusText,
}) => {
  const { t } = useLanguage();
  const { credentials } = useAuth();
  const [selectedService, setSelectedService] = useState('Telegram');
  const [customInput, setCustomInput] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  const targetName = customInput.trim() ? customInput.trim() : selectedService;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName || loading) return;
    onStartVerification(targetName);
  };

  const filteredPresets = PRESET_SERVICES.filter((s) =>
    s.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            {t.selectService}
          </h2>
          <p className="text-xs text-slate-400">
            {t.appSubtitle}
          </p>
        </div>

        {/* Protection guarantee pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-xs text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>100% Auto-Refund Guard</span>
        </div>
      </div>

      {/* Search and preset chips */}
      <div className="mb-4">
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search popular platforms..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredPresets.map((svc) => {
            const isSelected = selectedService === svc.name && !customInput;
            return (
              <button
                key={svc.name}
                type="button"
                onClick={() => {
                  setSelectedService(svc.name);
                  setCustomInput('');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{svc.icon}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{svc.cost}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">{svc.name}</p>
                  <p className="text-[10px] text-slate-400">{svc.category}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom target input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>{t.customServicePlaceholder}</span>
            {customInput && (
              <span className="text-[10px] text-emerald-400 font-mono">Custom target active</span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Roblox, Netflix, Airbnb, Uber..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {customInput && (
              <button
                type="button"
                onClick={() => setCustomInput('')}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Selected target preview & submit button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="text-slate-500">Target:</span>
            <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {targetName}
            </span>
            <span className="text-[11px] text-slate-500">(US +1 SMS)</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-emerald-200" />
                <span>{t.startVerification}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live status readout if not idle */}
      {statusText && (
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Phase:</span>
          <span className="font-mono text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {statusText}
          </span>
        </div>
      )}
    </div>
  );
};
