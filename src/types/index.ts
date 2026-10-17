export type VerificationStatus = 'Pending' | 'Completed' | 'TimedOut' | 'Cancelled';

export interface VerificationSession {
  id: string;
  userId: string;
  targetService: string;
  phoneNumber: string;
  status: VerificationStatus;
  smsCode?: string;
  fullMessage?: string;
  cost: number;
  isSimulated?: boolean;
  autoRefunded?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface UserProfileData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  useSimulator?: boolean;
  preferredLanguage?: 'en' | 'bn';
  createdAt: string;
  updatedAt: string;
}

export interface TextVerifiedCredentials {
  clientId: string;
  clientSecret: string;
  useSimulator: boolean;
  soundEnabled: boolean;
  autoCopy: boolean;
  telegramEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  lowBalanceThreshold?: number;
}

export interface PopularService {
  id: string;
  name: string;
  category: 'social' | 'chat' | 'tech' | 'crypto' | 'e-commerce';
  cost: number;
  iconName: string;
  popular?: boolean;
}
