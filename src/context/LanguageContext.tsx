import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  simulatorBadge: string;
  liveBadge: string;
  signInWithGoogle: string;
  signOut: string;
  guestUser: string;
  cloudSyncActive: string;
  selectService: string;
  popularServices: string;
  customServicePlaceholder: string;
  startVerification: string;
  processing: string;
  statusReady: string;
  statusAllocating: string;
  statusListening: string;
  statusSuccess: string;
  statusCancelled: string;
  statusTimeout: string;
  phoneNumber: string;
  otpCode: string;
  autoCopied: string;
  copyNumber: string;
  copied: string;
  cancelAndRefund: string;
  timeoutWarning: string;
  secondsRemaining: string;
  historyTitle: string;
  noHistory: string;
  filterAll: string;
  filterCompleted: string;
  filterPending: string;
  filterCancelled: string;
  exportCsv: string;
  cost: string;
  timestamp: string;
  actions: string;
  apiSettings: string;
  clientIdLabel: string;
  clientSecretLabel: string;
  enableSimulator: string;
  enableSimulatorDesc: string;
  soundNotifications: string;
  autoCopyOtp: string;
  saveSettings: string;
  balanceLabel: string;
  checkBalance: string;
  simulateOtpDelivery: string;
  logsTitle: string;
  clearLogs: string;
  autonomousAgentActive: string;
  installPwa: string;
  installPwaDesc: string;
  offlineNotice: string;
  statsTotal: string;
  statsSuccess: string;
  statsSpent: string;
  statsRefunded: string;
}

const enTranslations: Translations = {
  appTitle: 'TextVerified Hub',
  appSubtitle: 'Autonomous SMS & OTP Verification Engine',
  simulatorBadge: 'Sandbox Simulator',
  liveBadge: 'Live API v2',
  signInWithGoogle: 'Sign in with Google',
  signOut: 'Sign Out',
  guestUser: 'Guest Mode',
  cloudSyncActive: 'Cloud Synced with Firebase',
  selectService: 'Select Service Target',
  popularServices: 'Popular Services',
  customServicePlaceholder: 'Or enter custom service (e.g. Steam, Uber)...',
  startVerification: 'Start Autonomous Verification',
  processing: 'Processing Verification...',
  statusReady: 'Ready to order number',
  statusAllocating: 'Allocating temporary phone number...',
  statusListening: 'Number allocated. Listening for incoming SMS OTP...',
  statusSuccess: 'OTP captured successfully!',
  statusCancelled: 'Verification cancelled. Safe refund executed.',
  statusTimeout: 'Verification timed out. Auto-refunded to save credits.',
  phoneNumber: 'Allocated Number',
  otpCode: 'OTP Code',
  autoCopied: 'Copied to clipboard!',
  copyNumber: 'Copy Number',
  copied: 'Copied!',
  cancelAndRefund: 'Cancel & Refund Credit',
  timeoutWarning: 'Credit protected by auto-refund safeguard',
  secondsRemaining: 'Seconds Remaining',
  historyTitle: 'Verification History & Cloud Records',
  noHistory: 'No verification records yet. Start your first session above!',
  filterAll: 'All Sessions',
  filterCompleted: 'Completed',
  filterPending: 'Pending',
  filterCancelled: 'Cancelled/Refunded',
  exportCsv: 'Export CSV',
  cost: 'Cost',
  timestamp: 'Timestamp',
  actions: 'Actions',
  apiSettings: 'TextVerified API v2 Configuration',
  clientIdLabel: 'Client ID / API Key',
  clientSecretLabel: 'Client Secret',
  enableSimulator: 'Enable Sandbox Simulator Mode',
  enableSimulatorDesc: 'Test without spending real credits. Simulates numbers and incoming SMS.',
  soundNotifications: 'Sound Notifications (Chimes & Alerts)',
  autoCopyOtp: 'Auto-copy OTP code to clipboard upon arrival',
  saveSettings: 'Save Configuration',
  balanceLabel: 'Credit Balance',
  checkBalance: 'Refresh Balance',
  simulateOtpDelivery: 'Simulate Incoming SMS Now',
  logsTitle: 'Autonomous Agent Decision Logs',
  clearLogs: 'Clear Logs',
  autonomousAgentActive: 'Autonomous Agent Engine Active',
  installPwa: 'Install PWA App',
  installPwaDesc: 'Install to desktop or mobile home screen for quick 1-click verification access.',
  offlineNotice: 'You are currently offline. Local cache active.',
  statsTotal: 'Total Requests',
  statsSuccess: 'Success Rate',
  statsSpent: 'Credits Spent',
  statsRefunded: 'Refunds Secured',
};

const bnTranslations: Translations = {
  appTitle: 'TextVerified হাব',
  appSubtitle: 'স্বয়ংক্রিয় এসএমএস ও ওটিপি ভেরিফিকেশন ইঞ্জিন',
  simulatorBadge: 'স্যান্ডবক্স সিমুলেটর',
  liveBadge: 'লাইভ API v2',
  signInWithGoogle: 'গুগল দিয়ে সাইন ইন করুন',
  signOut: 'সাইন আউট',
  guestUser: 'গেস্ট মোড',
  cloudSyncActive: 'ফায়ারবেস ক্লাউড সিঙ্ক চালু',
  selectService: 'সার্ভিস নির্বাচন করুন',
  popularServices: 'জনপ্রিয় সার্ভিসসমূহ',
  customServicePlaceholder: 'অথবা কাস্টম সার্ভিস লিখুন (যেমন: Steam, Uber)...',
  startVerification: 'অটোমেটিক ভেরিফিকেশন শুরু করুন',
  processing: 'প্রসেসিং চলছে...',
  statusReady: 'নম্বর অর্ডারের জন্য প্রস্তুত',
  statusAllocating: 'নম্বর বরাদ্দ করা হচ্ছে...',
  statusListening: 'নম্বর প্রাপ্ত! ওটিপির জন্য স্বয়ংক্রিয় অপেক্ষা চলছে...',
  statusSuccess: 'সফল! ওটিপি কোড পাওয়া গেছে!',
  statusCancelled: 'ভেরিফিকেশন বাতিল করা হয়েছে। ক্রেডিট রিফান্ড নিশ্চিত।',
  statusTimeout: 'সময় শেষ! ক্রেডিট বাঁচাতে স্বয়ংক্রিয় রিফান্ড কার্যকর।',
  phoneNumber: 'বরাদ্দকৃত নম্বর',
  otpCode: 'ওটিপি কোড',
  autoCopied: 'স্বয়ংক্রিয়ভাবে ক্লিপবোর্ডে কপি করা হয়েছে!',
  copyNumber: 'নম্বর কপি করুন',
  copied: 'কপি হয়েছে!',
  cancelAndRefund: 'বাতিল ও রিফান্ড নিন',
  timeoutWarning: 'অটো-রিফান্ড মেকানিজম দ্বারা ক্রেডিট সুরক্ষিত',
  secondsRemaining: 'সেকেন্ড বাকি',
  historyTitle: 'ভেরিফিকেশন হিস্ট্রি ও ক্লাউড রেকর্ডস',
  noHistory: 'এখনও কোনো রেকর্ড নেই। উপরে আপনার প্রথম ভেরিফিকেশন শুরু করুন!',
  filterAll: 'সকল সেশন',
  filterCompleted: 'সফল',
  filterPending: 'অপেক্ষমাণ',
  filterCancelled: 'বাতিল/রিফান্ডেড',
  exportCsv: 'সিএসভি এক্সপোর্ট',
  cost: 'খরচ',
  timestamp: 'সময়',
  actions: 'পদক্ষেপ',
  apiSettings: 'TextVerified API v2 সেটিংস',
  clientIdLabel: 'Client ID / API Key',
  clientSecretLabel: 'Client Secret',
  enableSimulator: 'স্যান্ডবক্স সিমুলেটর মোড চালু রাখুন',
  enableSimulatorDesc: 'আসল ক্রেডিট খরচ ছাড়া ভার্চুয়াল নম্বর ও ওটিপি দিয়ে পরীক্ষা করুন।',
  soundNotifications: 'সাউন্ড নোটিফিকেশন (ওটিপি বেল ও অ্যালার্ট)',
  autoCopyOtp: 'ওটিপি আসার সাথে সাথে স্বয়ংক্রিয় ক্লিপবোর্ড কপি',
  saveSettings: 'সেটিংস সংরক্ষণ করুন',
  balanceLabel: 'ক্রেডিট ব্যালেন্স',
  checkBalance: 'ব্যালেন্স যাচাই',
  simulateOtpDelivery: 'এখনই টেস্ট ওটিপি পাঠান',
  logsTitle: 'স্বয়ংক্রিয় সিদ্ধান্তের লাইভ লগ',
  clearLogs: 'লগ মুছুন',
  autonomousAgentActive: 'স্বায়ত্তশাসিত এজেন্ট সক্রিয়',
  installPwa: 'PWA অ্যাপ ইন্সটল করুন',
  installPwaDesc: 'সহজে ব্যবহারের জন্য আপনার ডিভাইস বা ফোনে ইন্সটল করে নিন।',
  offlineNotice: 'আপনি বর্তমানে অফলাইনে আছেন। লোকাল ক্যাশ সক্রিয়।',
  statsTotal: 'মোট রিকোয়েস্ট',
  statsSuccess: 'সফলতার হার',
  statsSpent: 'ব্যয়িত ক্রেডিট',
  statsRefunded: 'সুরক্ষিত রিফান্ড',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: bnTranslations,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tv_lang') as Language;
      if (saved === 'en' || saved === 'bn') return saved;
    }
    return 'bn'; // Default to Bengali as requested by the user
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tv_lang', lang);
    }
  };

  const t = language === 'bn' ? bnTranslations : enTranslations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
