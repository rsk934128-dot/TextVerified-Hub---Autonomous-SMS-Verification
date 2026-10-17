import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Settings, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  Smartphone, 
  Globe, 
  Flame, 
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Wand2
} from 'lucide-react';

interface NavbarProps {
  balance: number | null;
  refreshingBalance: boolean;
  onRefreshBalance: () => void;
  onOpenSettings: () => void;
  activeMainView: 'sms' | 'remix' | 'marketplace';
  onChangeMainView: (view: 'sms' | 'remix' | 'marketplace') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  refreshingBalance,
  onRefreshBalance,
  onOpenSettings,
  activeMainView,
  onChangeMainView,
}) => {
  const { currentUser, signInWithGoogle, signOutUser, credentials, updateCredentials } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Sheikh Farid Studio
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ULTRA
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              SMS Engine • URL Remixer • Code Marketplace
            </p>
          </div>
        </div>

        {/* Primary Navigation Hub Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeMainView('sms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainView === 'sms'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS & OTP Hub</span>
          </button>

          <button
            onClick={() => onChangeMainView('remix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainView === 'remix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Site Cloner & Remixer</span>
          </button>

          <button
            onClick={() => onChangeMainView('marketplace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainView === 'marketplace'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Code Marketplace</span>
          </button>
        </div>

        {/* Center / Mode indicator for SMS */}
        {activeMainView === 'sms' && (
          <div className="hidden xl:flex items-center space-x-2">
          <button
            onClick={() => updateCredentials({ useSimulator: !credentials.useSimulator })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
              credentials.useSimulator
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/40 hover:bg-amber-900/60'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
            }`}
            title="Click to toggle between Simulator and Live API"
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${credentials.useSimulator ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {credentials.useSimulator ? t.simulatorBadge : t.liveBadge}
          </button>

          {/* Balance Widget */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400">{t.balanceLabel}:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {balance !== null ? `$${balance.toFixed(2)}` : '...'}
            </span>
            <button
              onClick={onRefreshBalance}
              disabled={refreshingBalance}
              title={t.checkBalance}
              className="text-slate-400 hover:text-slate-200 transition p-0.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={t.apiSettings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  className="w-8 h-8 rounded-full border border-emerald-500/40 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                  {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Synced
                </p>
              </div>
              <button
                onClick={signOutUser}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title={t.signOut}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.signInWithGoogle}</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
