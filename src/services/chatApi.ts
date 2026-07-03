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

export interface ConversationSummary {
  id: string;
  title: string;
  lastUpdatedAt: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content?: string;
  message?: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  lastUpdatedAt: string;
  messages?: ConversationMessage[];
}

export interface ConversationsListResponse {
  conversations: ConversationSummary[];
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const DEFAULT_PRODUCTION_BASE_URL = 'https://uga-healing-orchestrator-development.up.railway.app';

export function getApiBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    if (import.meta.env.MODE === 'production') {
      return import.meta.env.VITE_API_PRODUCTION_URL || DEFAULT_PRODUCTION_BASE_URL;
    }
    if (import.meta.env.VITE_API_DEVELOPMENT_URL) {
      return import.meta.env.VITE_API_DEVELOPMENT_URL;
    }
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

export async function sendAudioChatMessage(
  audioFile: File | Blob,
  options?: {
    conversationId?: string | null;
    language?: string;
    userId?: string;
    message?: string;
  }
): Promise<LightChatResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/api/v1/chat/message/audio`;

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

  const formData = new FormData();
  formData.append('audio', audioFile, 'recording.mp3');
  formData.append('conversationId', options?.conversationId || '');
  formData.append('clientMessageId', clientMessageId);
  formData.append('language', normalizedLang);
  formData.append('message', options?.message || '');
  formData.append('clientTimestamp', new Date().toISOString());
  formData.append('mode', 'audio');

  const headers: Record<string, string> = {};
  if (options?.userId) {
    headers['X-User-Id'] = options.userId;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Audio API request failed with status ${response.status}`);
  }

  return await response.json();
}

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/api/v1/chat/conversations`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
  };

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch conversations: ${response.status}`);
  }

  const data = await response.json();
  return (data.conversations || []).map((c: ConversationSummary & { createdAt?: string }) => ({
    id: c.id,
    title: c.title,
    lastUpdatedAt: c.lastUpdatedAt,
  }));
}

export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<ConversationDetail> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/api/v1/chat/conversations/${conversationId}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
  };

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to fetch conversation: ${response.status}`);
  }

  const data = await response.json();
  const conv = data.conversation || data;
  const messages = (data.messages || []).map((m: ConversationMessage) => ({
    role: m.role,
    content: m.message || m.content || '',
  }));
  return {
    id: conv.id,
    title: conv.title,
    lastUpdatedAt: conv.lastUpdatedAt,
    messages,
  };
}
