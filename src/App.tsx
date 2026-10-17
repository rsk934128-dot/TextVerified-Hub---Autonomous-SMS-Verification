import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './services/firebase';
import { handleFirestoreError, OperationType } from './services/firestoreErrors';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { TextVerifiedEngine, EngineLog } from './services/TextVerifiedEngine';
import { playOtpSuccessSound, playRefundAlertSound, playClickSound } from './services/audioNotifier';
import { TelegramNotifier } from './services/telegramNotifier';
import { VerificationSession, ActivityLogEntry } from './types';

import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { VerificationPanel } from './components/VerificationPanel';
import { ActiveSessionTracker } from './components/ActiveSessionTracker';
import { AutonomousLogs } from './components/AutonomousLogs';
import { HistoryTable } from './components/HistoryTable';
import { ApiConfigModal } from './components/ApiConfigModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { MarketplaceHub } from './components/marketplace/MarketplaceHub';
import { WebsiteRemixer } from './components/remixer/WebsiteRemixer';

export default function App() {
  const { currentUser, credentials } = useAuth();
  const { t } = useLanguage();

  // Sessions & Database State
  const [sessions, setSessions] = useState<VerificationSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tv_local_sessions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed reading local sessions', e);
      }
    }
    return [];
  });

  // Active Session State
  const [activeSession, setActiveSession] = useState<VerificationSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(90);
  const [balance, setBalance] = useState<number | null>(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [logs, setLogs] = useState<EngineLog[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mainView, setMainView] = useState<'sms' | 'remix' | 'marketplace'>('remix');

  // Engine instance
  const engineRef = useRef<TextVerifiedEngine>(
    new TextVerifiedEngine(credentials.clientId, credentials.clientSecret, credentials.useSimulator)
  );

  // Keep engine credentials in sync
  useEffect(() => {
    engineRef.current.setCredentials(
      credentials.clientId,
      credentials.clientSecret,
      credentials.useSimulator
    );
  }, [credentials.clientId, credentials.clientSecret, credentials.useSimulator]);

  // Subscribe to engine logs
  useEffect(() => {
    const unsubscribe = engineRef.current.subscribeLogs((entry) => {
      setLogs((prev) => [...prev.slice(-99), entry]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Sync sessions with local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tv_local_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Firestore Real-Time Sync for logged-in user
  useEffect(() => {
    if (!currentUser) return;

    const verificationsRef = collection(db, 'users', currentUser.uid, 'verifications');
    const q = query(verificationsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreSessions: VerificationSession[] = [];
        snapshot.forEach((doc) => {
          firestoreSessions.push(doc.data() as VerificationSession);
        });
        if (firestoreSessions.length > 0) {
          setSessions(firestoreSessions);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/verifications`);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Balance fetcher
  const fetchBalance = useCallback(async () => {
    setRefreshingBalance(true);
    try {
      const b = await engineRef.current.getBalance();
      setBalance(b);
    } catch (err) {
      console.warn('Balance fetch note:', err);
    } finally {
      setRefreshingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, credentials.useSimulator]);

  // Save or update session to Firestore and local state
  const saveSessionToCloud = async (sess: VerificationSession) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === sess.id);
      if (exists) {
        return prev.map((s) => (s.id === sess.id ? sess : s));
      }
      return [sess, ...prev];
    });

    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'verifications', sess.id);
        await setDoc(docRef, sess, { merge: true });

        // Also add activity audit log entry
        const logId = 'log_' + Date.now();
        const logRef = doc(db, 'users', currentUser.uid, 'activityLogs', logId);
        const logEntry: ActivityLogEntry = {
          id: logId,
          userId: currentUser.uid,
          action: `VERIFICATION_${sess.status.toUpperCase()}`,
          details: `Target: ${sess.targetService} (${sess.phoneNumber}) - Status: ${sess.status}`,
          createdAt: new Date().toISOString(),
        };
        await setDoc(logRef, logEntry);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    }
  };

  // 1-Click Copy Number
  const handleCopyNumber = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.phoneNumber);
    setCopiedNumber(true);
    playClickSound();
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // 1-Click Copy OTP
  const handleCopyOtp = () => {
    if (!activeSession?.smsCode) return;
    navigator.clipboard.writeText(activeSession.smsCode);
    setCopiedOtp(true);
    playClickSound();
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Force Simulate SMS arrival (Sandbox helper)
  const handleSimulateIncomingSms = () => {
    if (!activeSession || activeSession.status !== 'Pending') return;

    const mockPayload = TextVerifiedEngine.generateSimulatedOtp(activeSession.targetService);
    const completedSession: VerificationSession = {
      ...activeSession,
      status: 'Completed',
      smsCode: mockPayload.code,
      fullMessage: mockPayload.message,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    setActiveSession(completedSession);
    saveSessionToCloud(completedSession);

    if (credentials.soundEnabled) {
      playOtpSuccessSound();
    }
    if (credentials.autoCopy) {
      navigator.clipboard.writeText(mockPayload.code);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    }

    // Forward to Telegram if configured
    if (credentials.telegramEnabled && credentials.telegramBotToken && credentials.telegramChatId) {
      TelegramNotifier.sendOtpNotification(
        credentials.telegramBotToken,
        credentials.telegramChatId,
        {
          service: activeSession.targetService,
          phoneNumber: activeSession.phoneNumber,
          otpCode: mockPayload.code,
          fullMessage: mockPayload.message,
          isSimulated: true,
        }
      );
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `[Telegram Dispatcher] Forwarded OTP (${mockPayload.code}) to Telegram Chat! ✈️`,
          level: 'success',
        },
      ]);
    }

    setStatusText(t.statusSuccess);
  };

  // Safe Cancel and Refund
  const handleCancelSession = async () => {
    if (!activeSession || activeSession.status !== 'Pending') return;

    setStatusText('Cancelling and verifying credit refund...');
    const cancelled = await engineRef.current.cancelVerification(activeSession.id);

    const updatedSession: VerificationSession = {
      ...activeSession,
      status: 'Cancelled',
      autoRefunded: cancelled,
      updatedAt: new Date().toISOString(),
    };

    setActiveSession(updatedSession);
    saveSessionToCloud(updatedSession);

    if (credentials.soundEnabled) {
      playRefundAlertSound();
    }
    setStatusText(t.statusCancelled);
    fetchBalance();
  };

  // Countdown and Polling Engine Loop
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'Pending') return;

    // Countdown interval (1s)
    const timerInterval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired! Auto-cancel to protect credits
          clearInterval(timerInterval);
          handleCancelSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling interval (every 3.5s)
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount++;

      // In simulator mode, auto-deliver mock SMS after 9 seconds if user hasn't manually clicked
      if (credentials.useSimulator) {
        if (pollCount >= 3 && activeSession.status === 'Pending') {
          clearInterval(pollInterval);
          handleSimulateIncomingSms();
        }
        return;
      }

      // Live TextVerified API polling
      try {
        const result = await engineRef.current.checkVerification(activeSession.id);
        if (result.smsCode || result.status === 'Completed') {
          clearInterval(pollInterval);

          const completedSession: VerificationSession = {
            ...activeSession,
            status: 'Completed',
            smsCode: result.smsCode,
            fullMessage: result.fullMessage,
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          };

          setActiveSession(completedSession);
          saveSessionToCloud(completedSession);

          if (credentials.soundEnabled) {
            playOtpSuccessSound();
          }
          if (credentials.autoCopy && result.smsCode) {
            navigator.clipboard.writeText(result.smsCode);
            setCopiedOtp(true);
            setTimeout(() => setCopiedOtp(false), 2500);
          }

          // Forward to Telegram if configured
          if (credentials.telegramEnabled && credentials.telegramBotToken && credentials.telegramChatId && result.smsCode) {
            TelegramNotifier.sendOtpNotification(
              credentials.telegramBotToken,
              credentials.telegramChatId,
              {
                service: activeSession.targetService,
                phoneNumber: activeSession.phoneNumber,
                otpCode: result.smsCode,
                fullMessage: result.fullMessage,
                isSimulated: false,
              }
            );
            setLogs((prev) => [
              ...prev,
              {
                timestamp: new Date().toLocaleTimeString(),
                message: `[Telegram Dispatcher] Live OTP (${result.smsCode}) dispatched to Telegram! ✈️`,
                level: 'success',
              },
            ]);
          }

          setStatusText(t.statusSuccess);
          fetchBalance();
        } else if (result.status === 'Cancelled' || result.status === 'TimedOut') {
          clearInterval(pollInterval);
          const endSession: VerificationSession = {
            ...activeSession,
            status: result.status,
            autoRefunded: true,
            updatedAt: new Date().toISOString(),
          };
          setActiveSession(endSession);
          saveSessionToCloud(endSession);
          if (credentials.soundEnabled) {
            playRefundAlertSound();
          }
          setStatusText(result.status === 'TimedOut' ? t.statusTimeout : t.statusCancelled);
        }
      } catch (e) {
        console.warn('Poll error:', e);
      }
    }, 3500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(pollInterval);
    };
  }, [activeSession?.id, activeSession?.status]);

  // Start Autonomous Verification Workflow
  const handleStartVerification = async (targetService: string) => {
    try {
      setLoading(true);
      setStatusText(t.statusAllocating);
      setSecondsRemaining(90);

      const userId = currentUser ? currentUser.uid : 'guest_local';
      const newSession = await engineRef.current.createVerification(targetService, userId);

      setActiveSession(newSession);
      saveSessionToCloud(newSession);

      setStatusText(t.statusListening);
      playClickSound();

      // Deduct or refresh balance
      fetchBalance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusText(`Failed: ${msg}`);
      if (msg.includes('insufficient') || msg.includes('API Client ID')) {
        setIsSettingsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete single record
  const handleDeleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'verifications', id));
      } catch (err) {
        console.warn('Delete warning:', err);
      }
    }
  };

  // Clear all records
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all history records?')) return;
    setSessions([]);
    localStorage.removeItem('tv_local_sessions');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* PWA Banner if eligible */}
      <PwaInstallBanner />

      {/* Main Navbar */}
      <Navbar
        balance={balance}
        refreshingBalance={refreshingBalance}
        onRefreshBalance={fetchBalance}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeMainView={mainView}
        onChangeMainView={setMainView}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {mainView === 'remix' ? (
          <WebsiteRemixer onPublishToMarketplace={() => setMainView('marketplace')} />
        ) : mainView === 'marketplace' ? (
          <MarketplaceHub />
        ) : (
          <>
            {/* Top metrics summary */}
            <StatsOverview sessions={sessions} />

            {/* Verification Hub Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Dispatch Panel & Active Tracker (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <VerificationPanel
                  onStartVerification={handleStartVerification}
                  loading={loading}
                  statusText={statusText}
                />

                {/* Live session active tracker */}
                {activeSession && (
                  <ActiveSessionTracker
                    session={activeSession}
                    secondsRemaining={secondsRemaining}
                    onCancelSession={handleCancelSession}
                    onSimulateIncomingSms={handleSimulateIncomingSms}
                    isSimulator={credentials.useSimulator}
                    copiedNumber={copiedNumber}
                    copiedOtp={copiedOtp}
                    onCopyNumber={handleCopyNumber}
                    onCopyOtp={handleCopyOtp}
                  />
                )}
              </div>

              {/* Right Column: Autonomous Decision Terminal Logs (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <AutonomousLogs logs={logs} onClearLogs={() => setLogs([])} />

                {/* Architecture / Safeguard Informational Card */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>TextVerified API v2 Protocol Specs</span>
                  </div>
                  <p>
                    • <strong>Auth Bearer:</strong> Client ID & Secret traded for Bearer JWT token valid for 3600 seconds.
                  </p>
                  <p>
                    • <strong>Auto-Poll Interval:</strong> Every 3.5s to capture incoming SMS OTP without hitting rate-limits.
                  </p>
                  <p>
                    • <strong>Zero-Waste Refund Guarantee:</strong> Auto-cancels and refunds credit if SMS does not arrive within 90 seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Verification History Table */}
            <HistoryTable
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
              onClearAll={handleClearAll}
            />
          </>
        )}
      </main>

      {/* API Configuration & Credentials Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onBalanceUpdated={(b) => setBalance(b)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TextVerified Hub • Autonomous SMS & OTP Verification Engine v2.0</span>
          <span>Cloud persistence powered by Firebase Firestore & Auth</span>
        </div>
      </footer>
    </div>
  );
}
