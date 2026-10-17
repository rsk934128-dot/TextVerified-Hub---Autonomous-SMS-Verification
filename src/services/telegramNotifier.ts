/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  lowBalanceThreshold?: number;
}

export interface TelegramOtpPayload {
  service: string;
  phoneNumber: string;
  otpCode: string;
  fullMessage?: string;
  isSimulated?: boolean;
}

export interface TelegramResponse {
  success: boolean;
  message: string;
  details?: unknown;
}

/**
 * Escapes characters for Telegram HTML mode
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class TelegramNotifier {
  private static readonly STORAGE_KEY = 'tv_telegram_config';

  /**
   * Load stored Telegram configuration from localStorage
   */
  static loadConfig(): TelegramConfig {
    if (typeof window === 'undefined') {
      return { botToken: '', chatId: '', enabled: false, lowBalanceThreshold: 2.0 };
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load Telegram configuration:', e);
    }
    return { botToken: '', chatId: '', enabled: false, lowBalanceThreshold: 2.0 };
  }

  /**
   * Persist Telegram configuration to localStorage
   */
  static saveConfig(config: TelegramConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save Telegram configuration:', e);
    }
  }

  /**
   * Tests connection with Telegram Bot API by sending a ping message
   */
  static async testConnection(botToken: string, chatId: string): Promise<TelegramResponse> {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken) {
      return { success: false, message: 'Telegram Bot Token is required.' };
    }
    if (!cleanChatId) {
      return { success: false, message: 'Telegram Chat ID is required.' };
    }

    try {
      const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
      const htmlText = 
`🟢 <b>TextVerified Hub — Telegram Bot Connected!</b>\n
Hello! Your automated SMS & OTP push alert system is now active.
Whenever a new verification code is received, it will appear here instantly.\n
⏰ <i>Timestamp: ${new Date().toLocaleString()}</i>`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlText,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        return {
          success: false,
          message: data.description || 'Telegram API returned an error.',
          details: data,
        };
      }

      return {
        success: true,
        message: 'Telegram test message delivered successfully!',
        details: data.result,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Network failure contacting Telegram API: ${msg}`,
      };
    }
  }

  /**
   * Sends an instant push notification when an SMS OTP is captured
   */
  static async sendOtpNotification(
    botToken: string,
    chatId: string,
    payload: TelegramOtpPayload
  ): Promise<TelegramResponse> {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      return { success: false, message: 'Telegram credentials missing.' };
    }

    try {
      const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
      const modeBadge = payload.isSimulated
        ? '🧪 <b>[SANDBOX SIMULATOR]</b>'
        : '⚡ <b>[LIVE TEXTVERIFIED API]</b>';

      const safeService = escapeHtml(payload.service);
      const safePhone = escapeHtml(payload.phoneNumber);
      const safeCode = escapeHtml(payload.otpCode);
      const safeMessage = payload.fullMessage ? escapeHtml(payload.fullMessage) : '';

      const htmlBody = 
`${modeBadge} 🔐 <b>NEW OTP RECEIVED!</b>\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 <b>Service:</b> <code>${safeService}</code>
📞 <b>Allocated Number:</b> <code>${safePhone}</code>
🔑 <b>OTP Code:</b> <code>${safeCode}</code>  <i>(Tap code to copy)</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${safeMessage ? `💬 <b>SMS Content:</b>\n<i>"${safeMessage}"</i>\n` : ''}
⏱️ <b>Time:</b> ${new Date().toLocaleTimeString()}
🛡️ <b>Status:</b> Completed & Verified`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlBody,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        console.warn('Telegram API send failure:', data);
        return {
          success: false,
          message: data.description || 'Failed to dispatch Telegram message.',
          details: data,
        };
      }

      return {
        success: true,
        message: 'Telegram OTP notification dispatched.',
        details: data.result,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Telegram dispatch error:', msg);
      return {
        success: false,
        message: `Failed to dispatch Telegram alert: ${msg}`,
      };
    }
  }

  /**
   * Sends low balance alert when credits drop below threshold
   */
  static async sendLowBalanceAlert(
    botToken: string,
    chatId: string,
    balance: number,
    threshold: number
  ): Promise<TelegramResponse> {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      return { success: false, message: 'Telegram credentials missing.' };
    }

    try {
      const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
      const htmlBody = 
`⚠️ <b>TEXTVERIFIED LOW BALANCE ALERT</b>\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>Current Balance:</b> <code>$${balance.toFixed(2)}</code>
📉 <b>Warning Threshold:</b> <code>$${threshold.toFixed(2)}</code>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
আপনার TextVerified একাউন্টের ক্রেডিট ব্যালেন্স নির্ধারিত সীমার নিচে নেমে গেছে। নিরবচ্ছিন্ন ভেরিফিকেশনের জন্য ক্রিপ্টো গেটওয়ে বা ড্যাশবোর্ড থেকে ক্রেডিট টপ-আপ করুন।`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: htmlBody,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      return {
        success: Boolean(data.ok),
        message: data.ok ? 'Low balance alert sent' : data.description,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg };
    }
  }
}
