import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TelegramNotifier } from '../services/telegramNotifier';
import { TextVerifiedEngine } from '../services/TextVerifiedEngine';
import { 
  X, 
  Key, 
  Lock, 
  Sliders, 
  Volume2, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Send,
  Bell
} from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated: (newBalance: number) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onBalanceUpdated,
}) => {
  const { credentials, updateCredentials } = useAuth();
  const { t } = useLanguage();

  const [clientId, setClientId] = useState(credentials.clientId);
  const [clientSecret, setClientSecret] = useState(credentials.clientSecret);
  const [useSimulator, setUseSimulator] = useState(credentials.useSimulator);
  const [soundEnabled, setSoundEnabled] = useState(credentials.soundEnabled);
  const [autoCopy, setAutoCopy] = useState(credentials.autoCopy);

  // Telegram States
  const [telegramEnabled, setTelegramEnabled] = useState(credentials.telegramEnabled || false);
  const [telegramBotToken, setTelegramBotToken] = useState(credentials.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(credentials.telegramChatId || '');
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(credentials.lowBalanceThreshold || 2.0);

  const [testing, setTesting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [telegramResult, setTelegramResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentials({
      clientId,
      clientSecret,
      useSimulator,
      soundEnabled,
      autoCopy,
      telegramEnabled,
      telegramBotToken,
      telegramChatId,
      lowBalanceThreshold,
    });
    onClose();
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramResult(null);
    try {
      const res = await TelegramNotifier.testConnection(telegramBotToken, telegramChatId);
      setTelegramResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTelegramResult({ success: false, message: msg });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const engine = new TextVerifiedEngine(clientId, clientSecret, useSimulator);
      const balance = await engine.getBalance();
      onBalanceUpdated(balance);
      setTestResult({
        success: true,
        message: useSimulator
          ? `Simulator active. Virtual balance: $${balance.toFixed(2)}`
          : `Connected successfully! Live TextVerified balance: $${balance.toFixed(2)}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: msg,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.apiSettings}</h3>
              <p className="text-xs text-slate-400">TextVerified API v2 Credentials & Safeguards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Simulator Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="flex items-start justify-between cursor-pointer">
              <div className="pr-4">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t.enableSimulator}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.enableSimulatorDesc}
                </p>
              </div>
              <input
                type="checkbox"
                checked={useSimulator}
                onChange={(e) => setUseSimulator(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              {t.clientIdLabel}
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. your_textverified_client_id"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              {t.clientSecretLabel}
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Required for Bearer JWT token generation on live API</span>
              <a
                href="https://app.textverified.com/api/docs"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                API Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>

          {/* App Preferences */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>{t.soundNotifications}</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>{t.autoCopyOtp}</span>
              </div>
              <input
                type="checkbox"
                checked={autoCopy}
                onChange={(e) => setAutoCopy(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Telegram Bot Dispatcher Section */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <label className="flex items-start justify-between cursor-pointer">
                <div className="pr-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    টেলিগ্রাম বট ওটিপি ডিসপ্যাচার (Telegram Bot Dispatcher)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ওটিপি ক্যাপচার হওয়া মাত্রই স্বয়ংক্রিয়ভাবে আপনার টেলিগ্রামে পুশ মেসেজ পাঠাবে।
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {telegramEnabled && (
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Telegram Bot Token
                    </label>
                    <input
                      type="password"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Chat ID (User / Channel)
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="e.g. 987654321"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                        <Bell className="w-3 h-3 text-amber-400" /> Low Balance Alert ($)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={lowBalanceThreshold}
                        onChange={(e) => setLowBalanceThreshold(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{testingTelegram ? 'Sending Test...' : 'Test Telegram Alert'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500">
                      via Telegram Bot API
                    </span>
                  </div>

                  {telegramResult && (
                    <div
                      className={`p-2.5 rounded-lg border text-[11px] flex items-start gap-1.5 ${
                        telegramResult.success
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {telegramResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{telegramResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Connection Test Output */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="font-mono text-[11px]">{testResult.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/40 transition cursor-pointer"
              >
                {t.saveSettings}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
