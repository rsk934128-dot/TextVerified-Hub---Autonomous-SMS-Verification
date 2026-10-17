import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { VerificationSession } from '../types';
import { 
  Phone, 
  Copy, 
  Check, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  Radio, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ActiveSessionTrackerProps {
  session: VerificationSession | null;
  secondsRemaining: number;
  onCancelSession: () => void;
  onSimulateIncomingSms: () => void;
  isSimulator: boolean;
  copiedNumber: boolean;
  copiedOtp: boolean;
  onCopyNumber: () => void;
  onCopyOtp: () => void;
}

export const ActiveSessionTracker: React.FC<ActiveSessionTrackerProps> = ({
  session,
  secondsRemaining,
  onCancelSession,
  onSimulateIncomingSms,
  isSimulator,
  copiedNumber,
  copiedOtp,
  onCopyNumber,
  onCopyOtp,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (session?.smsCode) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#34d399', '#10b981', '#065f46', '#6ee7b7', '#f59e0b'],
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [session?.smsCode]);

  if (!session) return null;

  const isCompleted = session.status === 'Completed' || Boolean(session.smsCode);
  const isCancelled = session.status === 'Cancelled' || session.status === 'TimedOut';
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 90) * 100));

  return (
    <div className={`mt-6 rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all duration-300 ${
      isCompleted
        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-emerald-900/20'
        : isCancelled
        ? 'bg-slate-900/90 border-amber-600/40 shadow-amber-950/20'
        : 'bg-slate-900/95 border-emerald-500/40 shadow-emerald-950/30'
    }`}>
      
      {/* Top Session Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : isCancelled ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{session.targetService}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                ID: {session.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isCompleted
                ? t.statusSuccess
                : isCancelled
                ? (session.status === 'TimedOut' ? t.statusTimeout : t.statusCancelled)
                : t.statusListening}
            </p>
          </div>
        </div>

        {/* Countdown timer / status pill */}
        {!isCompleted && !isCancelled && (
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">{t.secondsRemaining}:</span>
            <span className={`font-mono font-bold text-sm ${secondsRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {secondsRemaining}s
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Allocated Number & OTP Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        
        {/* Allocated Phone Number */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              {t.phoneNumber}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              US (+1)
            </span>
          </div>

          <div className="my-2">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
              {session.phoneNumber}
            </p>
          </div>

          <button
            onClick={onCopyNumber}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedNumber ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>{t.copyNumber}</span>
              </>
            )}
          </button>
        </div>

        {/* OTP Code Box */}
        <div className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
          session.smsCode
            ? 'bg-emerald-950/70 border-emerald-500/80 shadow-lg shadow-emerald-950/60'
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t.otpCode}
            </span>
            {session.smsCode && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                {t.autoCopied}
              </span>
            )}
          </div>

          <div className="my-2 text-center">
            {session.smsCode ? (
              <div>
                <p className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-300 tracking-[0.25em] drop-shadow-md">
                  {session.smsCode}
                </p>
                {session.fullMessage && (
                  <p className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded border border-emerald-500/20 italic">
                    "{session.fullMessage}"
                  </p>
                )}
              </div>
            ) : isCancelled ? (
              <div className="py-2">
                <p className="text-sm font-semibold text-amber-400">
                  {session.status === 'TimedOut' ? 'Session Expired' : 'Cancelled'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Credit has been preserved/refunded to your account.
                </p>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center justify-center space-y-2">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
                </div>
                <p className="text-xs text-slate-400">Waiting for incoming SMS payload...</p>
              </div>
            )}
          </div>

          {session.smsCode ? (
            <button
              onClick={onCopyOtp}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedOtp ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-200" />
                  <span>Copy OTP Code</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-[11px] text-center text-slate-500 py-1">
              Auto-copies to clipboard immediately upon capture
            </div>
          )}
        </div>
      </div>

      {/* Timer Bar */}
      {!isCompleted && !isCancelled && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsRemaining <= 15 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Action Footer: Simulator Fast-forward + Cancel/Refund button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Simulation Instant Send helper button */}
          {isSimulator && !isCompleted && !isCancelled && (
            <button
              onClick={onSimulateIncomingSms}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Fast-forward simulation and trigger SMS immediately"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.simulateOtpDelivery}</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.timeoutWarning}</span>
          </div>
        </div>

        {!isCompleted && !isCancelled && (
          <button
            onClick={onCancelSession}
            className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t.cancelAndRefund}</span>
          </button>
        )}
      </div>
    </div>
  );
};
