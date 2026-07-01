export interface LightChatPayload {
  chat: {
    conversationId?: string | null;
    clientMessageId: string;
    language: string;
    message: string;
    clientTimestamp?: string;
    mode: 'text' | 'suggested_thought' | 'consent_response' | 'test_consent';
    consentResponse?: {
      consentId: string;
      decision: string;
      selectedSupportOptionIds?: string[];
    };
  };
}

export interface LightChatResponse {
  serverTimestamp: string;
  conversation?: {
    id: string;
    title: string;
    lastUpdatedAt: string;
  };
  chat?: {
    assistantMessageId: string;
    mode: 'chat' | 'consent' | 'artifact';
    message: string;
    suggestions?: Array<{
      text: string;
      type?: string;
    }>;
    consent?: {
      consentId: string;
      consentFor?: string[];
      options?: Array<{ label: string; value: string }>;
      supportOptions?: Array<{
        id: string;
        label: string;
        description: string;
        type: string;
        requiresConsent: boolean;
        status: string;
      }>;
    };
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return DEFAULT_BASE_URL;
}

export async function sendChatMessage(
  messageText: string,
  options?: {
    conversationId?: string | null;
    language?: string;
    mode?: 'text' | 'suggested_thought' | 'consent_response' | 'test_consent';
    userId?: string;
    consentResponse?: {
      consentId: string;
      decision: string;
      selectedSupportOptionIds?: string[];
    };
  }
): Promise<LightChatResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/api/v1/chat/message`;

  const clientMessageId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'msg-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

  const langMap: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
  };
  const rawLang = options?.language || 'en';
  const normalizedLang = langMap[rawLang] || rawLang;

  const payload: LightChatPayload = {
    chat: {
      conversationId: options?.conversationId || null,
      clientMessageId,
      language: normalizedLang,
      message: messageText,
      clientTimestamp: new Date().toISOString(),
      mode: options?.mode || 'text',
      consentResponse: options?.consentResponse,
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.userId) {
    headers['X-User-Id'] = options.userId;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
  }

  return await response.json();
}
