import { VerificationSession, VerificationStatus } from '../types';

export interface EngineLog {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

export type LogListener = (log: EngineLog) => void;

export class TextVerifiedEngine {
  private baseUrl: string;
  private bearerToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private logListeners: Set<LogListener> = new Set();

  constructor(
    private clientId: string = '',
    private clientSecret: string = '',
    private isSimulator: boolean = false
  ) {
    // If in browser, use the vite proxy path to avoid CORS issues
    this.baseUrl = typeof window !== 'undefined' ? '/api/textverified' : 'https://app.textverified.com/api/v2';
  }

  public subscribeLogs(listener: LogListener) {
    this.logListeners.add(listener);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  private log(message: string, level: 'info' | 'success' | 'warn' | 'error' = 'info') {
    const entry: EngineLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      level,
    };
    this.logListeners.forEach((l) => l(entry));
  }

  public setCredentials(clientId: string, clientSecret: string, isSimulator: boolean) {
    this.clientId = clientId.trim();
    this.clientSecret = clientSecret.trim();
    this.isSimulator = isSimulator;
    this.bearerToken = null;
    this.tokenExpiresAt = 0;
  }

  // 1. Authentication
  async getAuthToken(): Promise<string> {
    if (this.isSimulator) {
      this.log('Simulator: Virtual JWT generated (mock session)', 'info');
      return 'simulated_bearer_token_' + Date.now();
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('API Client ID or Secret is missing. Enable Simulator mode or add keys in settings.');
    }

    const now = Date.now();
    if (this.bearerToken && now < this.tokenExpiresAt - 60000) {
      return this.bearerToken;
    }

    this.log('Authenticating with TextVerified API v2...', 'info');

    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Authentication failed (${response.status}): ${text || response.statusText}`);
      }

      const data = await response.json();
      this.bearerToken = data.token || data.bearer_token;
      this.tokenExpiresAt = now + (data.expires_in || 3600) * 1000;
      this.log('Authentication successful. Bearer JWT obtained.', 'success');
      return this.bearerToken!;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Auth Error: ${msg}`, 'error');
      throw err;
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  // 2. Account Balance Check
  async getBalance(): Promise<number> {
    if (this.isSimulator) {
      return 15.50; // Mock balance in simulator
    }

    try {
      this.log('Fetching account credit balance...', 'info');
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${this.baseUrl}/account`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch balance: ${res.statusText}`);
      }
      const data = await res.json();
      const balance = data.credit_balance ?? data.balance ?? 0;
      this.log(`Available Credit Balance: $${Number(balance).toFixed(2)}`, 'info');
      return Number(balance);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Balance Check Error: ${msg}`, 'warn');
      throw err;
    }
  }

  // 3. Request Verification Number
  async createVerification(targetService: string, userId: string): Promise<VerificationSession> {
    this.log(`[Autonomous Step 1] Initiating verification order for ${targetService}...`, 'info');

    if (this.isSimulator) {
      // Simulate slight network roundtrip
      await new Promise((r) => setTimeout(r, 600));

      const mockAreaCodes = ['212', '415', '312', '646', '206', '512', '786', '617'];
      const area = mockAreaCodes[Math.floor(Math.random() * mockAreaCodes.length)];
      const mid = Math.floor(200 + Math.random() * 700);
      const last = Math.floor(1000 + Math.random() * 9000);
      const number = `+1 (${area}) ${mid}-${last}`;
      const id = 'tv_sim_' + Math.random().toString(36).substring(2, 9);
      const nowIso = new Date().toISOString();

      const session: VerificationSession = {
        id,
        userId,
        targetService,
        phoneNumber: number,
        status: 'Pending',
        cost: 0.50,
        isSimulated: true,
        autoRefunded: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      this.log(`[Autonomous Step 2] Virtual number allocated: ${number} (ID: ${id})`, 'success');
      return session;
    }

    // Live mode
    const balance = await this.getBalance();
    if (balance <= 0) {
      throw new Error('Insufficient credits in your TextVerified account! Please top-up.');
    }

    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/verifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        target_name: targetService,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err.message || res.statusText || 'Verification rejected';
      this.log(`Order Failed: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }

    const data = await res.json();
    const nowIso = new Date().toISOString();
    const session: VerificationSession = {
      id: data.id || data.verification_id,
      userId,
      targetService,
      phoneNumber: data.number || data.phone_number,
      status: 'Pending',
      cost: data.cost || 0.50,
      isSimulated: false,
      autoRefunded: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.log(`[Autonomous Step 2] Real number assigned: ${session.phoneNumber}`, 'success');
    return session;
  }

  // 4. Poll Single Verification Status
  async checkVerification(verificationId: string): Promise<{
    status: VerificationStatus;
    smsCode?: string;
    fullMessage?: string;
  }> {
    if (this.isSimulator) {
      // In simulator, polling is driven by the state or simulated countdown
      return { status: 'Pending' };
    }

    const headers = await this.getAuthHeaders();
    const res = await fetch(`${this.baseUrl}/verifications/${verificationId}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to check verification ${verificationId}`);
    }

    const data = await res.json();
    let status: VerificationStatus = 'Pending';
    if (data.sms_code || data.code) {
      status = 'Completed';
    } else if (data.status === 'Cancelled' || data.status === 'TimedOut' || data.status === 'Completed') {
      status = data.status;
    }

    return {
      status,
      smsCode: data.sms_code || data.code,
      fullMessage: data.sms_text || data.message || (data.sms_code ? `Your code is ${data.sms_code}` : undefined),
    };
  }

  // 5. Cancel Verification and Trigger Refund
  async cancelVerification(verificationId: string): Promise<boolean> {
    this.log(`[Safe Refund] Auto-cancelling verification ${verificationId} to protect credits...`, 'warn');

    if (this.isSimulator) {
      this.log(`[Safe Refund] Verification ${verificationId} cancelled. Virtual credit refunded.`, 'success');
      return true;
    }

    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${this.baseUrl}/verifications/${verificationId}/cancel`, {
        method: 'POST',
        headers,
      });

      if (res.ok) {
        this.log(`Verification ${verificationId} successfully cancelled. Credit refunded.`, 'success');
        return true;
      }
      this.log(`Cancel request returned: ${res.statusText}`, 'warn');
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log(`Cancel error: ${msg}`, 'error');
      return false;
    }
  }

  // Helper to generate simulated OTP payloads
  static generateSimulatedOtp(serviceName: string): { code: string; message: string } {
    const rawNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const formatted = rawNumber.slice(0, 3) + '-' + rawNumber.slice(3);
    const serviceLower = serviceName.toLowerCase();

    if (serviceLower.includes('google')) {
      return {
        code: rawNumber,
        message: `G-${rawNumber} is your Google verification code. Never share it with anyone.`,
      };
    } else if (serviceLower.includes('whatsapp')) {
      return {
        code: rawNumber,
        message: `Your WhatsApp code: ${formatted}. You can also tap this link to verify: v.whatsapp.com/${rawNumber}`,
      };
    } else if (serviceLower.includes('telegram')) {
      return {
        code: rawNumber.slice(0, 5),
        message: `Telegram code: ${rawNumber.slice(0, 5)}. Do not give this code to anyone.`,
      };
    } else if (serviceLower.includes('openai') || serviceLower.includes('chatgpt')) {
      return {
        code: rawNumber,
        message: `${rawNumber} is your OpenAI verification code.`,
      };
    } else if (serviceLower.includes('discord')) {
      return {
        code: rawNumber,
        message: `Your Discord security verification code is ${rawNumber}.`,
      };
    } else {
      return {
        code: rawNumber,
        message: `Your ${serviceName} verification code is ${rawNumber}. Valid for 10 minutes.`,
      };
    }
  }
}
