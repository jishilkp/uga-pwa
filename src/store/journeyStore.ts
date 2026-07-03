import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMockResponse } from '../services/mockOrchestrator';
import type { JourneyMetadata, Recommendation } from '../services/mockOrchestrator';
import { useAuthStore } from './authStore';
import { sendChatMessage, getConversations, getConversationById } from '../services/chatApi';

export interface Attachment {
  name: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  size?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
  audioDuration?: number;
  attachment?: Attachment;
  extractedStateSnapshot?: {
    journey: string;
    stage: string;
    themes: string[];
    needs: string[];
    risks: string[];
  };
  recommendations?: Recommendation[];
  suggestions?: Array<{
    text: string;
    type?: string;
  }>;
  mode?: 'chat' | 'consent' | 'artifact' | 'test_consent';
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
  selectedConsentDecision?: string;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  journeyMetadata: JourneyMetadata;
  recommendations: Recommendation[];
  systemAction: 'SAFETY_BREAKOUT_CRISIS' | null;
  activeLens: string;
  lastUpdated: string;
  userId?: string;
  wisdomQuote?: {
    author: string;
    text: string;
    source: string;
  };
}

export type Stakeholder = 'caregiver' | 'therapist' | 'ngo';

export interface ConsentSetting {
  allowed: string[];
  excluded: string[];
}

export interface ConsentRecord {
  caregiver: ConsentSetting;
  therapist: ConsentSetting;
  ngo: ConsentSetting;
}

export const defaultConsent: ConsentRecord = {
  caregiver: {
    allowed: ['themes', 'needs'],
    excluded: ['chat_logs', 'private_reflections']
  },
  therapist: {
    allowed: ['themes', 'needs', 'risk_indicators', 'chat_logs'],
    excluded: []
  },
  ngo: {
    allowed: ['themes'],
    excluded: ['needs', 'risk_indicators', 'chat_logs']
  }
};

interface JourneyStore {
  threads: Thread[];
  activeThreadId: string | null;
  language: 'en' | 'ta' | 'hi';
  consent: ConsentRecord;
  isRecording: boolean;
  recordingDuration: number;
  isAiThinking: boolean;
  isLoadingConversations: boolean;
  conversationError: string | null;
  
  // Actions
  createNewThread: (title?: string, initialMessage?: string) => string;
  switchThread: (id: string | null) => void;
  deleteThread: (id: string) => void;
  sendMessage: (text: string) => void;
  sendConsentResponse: (consentId: string, decision: string, label: string, selectedSupportOptionId?: string) => void;
  sendAudioMessage: (audioUrl: string, duration: number, text?: string) => void;
  sendMediaMessage: (attachment: Attachment, text?: string) => void;
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  updateConsent: (stakeholder: Stakeholder, field: string, value: boolean) => void;
  setRecording: (recording: boolean) => void;
  tickRecordingDuration: () => void;
  resetThreadToCleanState: () => void;
  
  loadConversations: (userId: string) => Promise<void>;
  loadConversationById: (conversationId: string, userId: string) => Promise<void>;
  clearConversationError: () => void;
  
  // Getters
  getActiveThread: () => Thread | null;
}


export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
  threads: [],
  activeThreadId: null,
  language: 'en',
  consent: defaultConsent,
  isRecording: false,
  recordingDuration: 0,
  isAiThinking: false,
  isLoadingConversations: false,
  conversationError: null,
  createNewThread: (title, initialMessage) => {
    const newId = 'thread-' + Math.random().toString(36).substring(2, 10);
    const userId = useAuthStore.getState().user?.id || 'guest';
    const newThread: Thread = {
      id: newId,
      title: title || 'New Healing Chapter',
      userId,
      messages: initialMessage ? [
        {
          id: 'msg-init-1',
          sender: 'user',
          text: initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ] : [],
      journeyMetadata: {
        currentJourney: 'General Inquiry',
        currentStage: 'Confusion',
        extractedThemes: [],
        unmetNeeds: [],
        riskIndicators: []
      },
      recommendations: [],
      systemAction: null,
      activeLens: 'None',
      lastUpdated: 'Just now'
    };

    set((state) => ({
      threads: [newThread, ...state.threads],
      activeThreadId: newId,
      isAiThinking: !!initialMessage
    }));

    if (initialMessage) {
      (async () => {
        const userId = useAuthStore.getState().user?.id;
        const { language } = get();
        try {
          const apiResponse = await sendChatMessage(initialMessage, {
            conversationId: null,
            language,
            mode: initialMessage === 'test consent screen' ? 'test_consent' : 'text',
            userId
          });
          if (apiResponse.chat?.message) {
            const backendId = apiResponse.conversation?.id || newId;
            const aiMessage: Message = {
              id: apiResponse.chat.assistantMessageId || ('msg-ai-' + Math.random().toString(36).substring(7)),
              sender: 'ai',
              text: apiResponse.chat.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: apiResponse.chat.suggestions,
              mode: apiResponse.chat.mode,
              consent: apiResponse.chat.consent,
            };

            set((state) => ({
              isAiThinking: false,
              activeThreadId: backendId,
              threads: state.threads.map(t => {
                if (t.id === newId) {
                  return {
                    ...t,
                    id: backendId,
                    title: apiResponse.conversation?.title || t.title,
                    messages: [...t.messages, aiMessage],
                    lastUpdated: 'Just now'
                  };
                }
                return t;
              })
            }));
            return;
          }
        } catch (err) {
          console.warn('Backend API /api/v1/chat/message failed or offline, falling back to mock orchestrator:', err);
        }

        const res = getMockResponse(initialMessage, 0, language, userId);
        const aiMessage: Message = {
          id: 'msg-init-2',
          sender: 'ai',
          text: res.textResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          extractedStateSnapshot: {
            journey: res.journeyMetadata.currentJourney,
            stage: res.journeyMetadata.currentStage,
            themes: res.journeyMetadata.extractedThemes,
            needs: res.journeyMetadata.unmetNeeds,
            risks: res.journeyMetadata.riskIndicators
          },
          recommendations: res.recommendations
        };

        set((state) => ({
          isAiThinking: false,
          threads: state.threads.map(t => {
            if (t.id === newId) {
              let newTitle = t.title;
              if (res.journeyMetadata.currentJourney.includes('Grief')) newTitle = 'Grief Journey';
              else if (res.journeyMetadata.currentJourney.includes('Burnout')) newTitle = 'Work Overload';
              else if (res.journeyMetadata.currentJourney.includes('Caregiver')) newTitle = 'Caregiver Support';

              return {
                ...t,
                title: newTitle,
                messages: [...t.messages, aiMessage],
                journeyMetadata: res.journeyMetadata,
                recommendations: res.recommendations,
                systemAction: res.systemAction,
                activeLens: res.activeLens
              };
            }
            return t;
          })
        }));
      })();
    }

    return newId;
  },

  switchThread: (id) => {
    set({ activeThreadId: id });
    const userId = useAuthStore.getState().user?.id || 'guest';
    if (userId !== 'guest' && id && !id.startsWith('thread-')) {
      get().loadConversationById(id, userId);
    }
  },

  deleteThread: (id) => {
    set((state) => {
      const filtered = state.threads.filter(t => t.id !== id);
      const nextActive = state.activeThreadId === id 
        ? (filtered[0]?.id || null) 
        : state.activeThreadId;
      return {
        threads: filtered,
        activeThreadId: nextActive
      };
    });
  },

  sendMessage: async (text) => {
    const { activeThreadId, threads, language } = get();
    if (!activeThreadId) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    const userTurnCount = thread.messages.filter(m => m.sender === 'user').length;

    const userMessage: Message = {
      id: 'msg-user-' + Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically update thread with user message and set isAiThinking: true
    const updatedMessages = [...thread.messages, userMessage];
    set((state) => ({
      isAiThinking: true,
      threads: state.threads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: updatedMessages,
            lastUpdated: 'Just now'
          };
        }
        return t;
      })
    }));

    const userId = useAuthStore.getState().user?.id;
    const isLocalId = activeThreadId.startsWith('thread-');
    let resolvedThreadId = activeThreadId;

    try {
      const apiResponse = await sendChatMessage(text, {
        conversationId: isLocalId ? null : activeThreadId,
        language,
        mode: text === 'test consent screen' ? 'test_consent' : 'text',
        userId
      });
      if (apiResponse.conversation?.id && isLocalId) {
        resolvedThreadId = apiResponse.conversation.id;
        set((state) => ({
          activeThreadId: resolvedThreadId,
          threads: state.threads.map(t => t.id === activeThreadId ? { ...t, id: resolvedThreadId } : t)
        }));
      }
      if (apiResponse.chat?.message) {
        const aiMessage: Message = {
          id: apiResponse.chat.assistantMessageId || ('msg-ai-' + Math.random().toString(36).substring(7)),
          sender: 'ai',
          text: apiResponse.chat.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: apiResponse.chat.suggestions,
          mode: apiResponse.chat.mode,
          consent: apiResponse.chat.consent,
        };
        set((state) => ({
          isAiThinking: false,
          threads: state.threads.map(t => {
            if (t.id === resolvedThreadId) {
              return {
                ...t,
                title: apiResponse.conversation?.title || t.title,
                messages: [...t.messages, aiMessage],
                lastUpdated: 'Just now'
              };
            }
            return t;
          })
        }));
        return;
      }
    } catch (err) {
      console.warn('Backend API /api/v1/chat/message failed or offline, falling back to mock orchestrator:', err);
    }

    // Fallback to local mock orchestrator if backend call failed or returned empty
    const res = getMockResponse(text, userTurnCount, language, userId);
    const aiMessage: Message = {
      id: 'msg-ai-' + Math.random().toString(36).substring(7),
      sender: 'ai',
      text: res.textResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedStateSnapshot: {
        journey: res.journeyMetadata.currentJourney,
        stage: res.journeyMetadata.currentStage,
        themes: res.journeyMetadata.extractedThemes,
        needs: res.journeyMetadata.unmetNeeds,
        risks: res.journeyMetadata.riskIndicators
      },
      recommendations: res.recommendations
    };

    set((state) => ({
      isAiThinking: false,
      threads: state.threads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...t.messages, aiMessage],
            journeyMetadata: res.journeyMetadata,
            recommendations: res.recommendations,
            systemAction: res.systemAction,
            activeLens: res.activeLens,
            lastUpdated: 'Just now'
          };
        }
        return t;
      })
    }));
  },

  sendConsentResponse: async (consentId, decision, label, selectedSupportOptionId) => {
    const { activeThreadId, threads, language } = get();
    if (!activeThreadId) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    // If decision is 'yes' and label is 'Yes', this is the initial consent click:
    // We only toggle selectedConsentDecision to 'yes' locally in the UI to show cards.
    if (decision === 'yes' && label.toLowerCase() === 'yes') {
      set((state) => ({
        threads: state.threads.map(t => {
          if (t.id === activeThreadId) {
            const msgsCopy = [...t.messages];
            for (let i = msgsCopy.length - 1; i >= 0; i--) {
              if (msgsCopy[i].sender === 'ai' && msgsCopy[i].mode === 'consent') {
                msgsCopy[i] = {
                  ...msgsCopy[i],
                  selectedConsentDecision: 'yes'
                };
                break;
              }
            }
            return {
              ...t,
              messages: msgsCopy
            };
          }
          return t;
        })
      }));
      return;
    }

    const userMessage: Message = {
      id: 'msg-user-' + Math.random().toString(36).substring(7),
      sender: 'user',
      text: label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    set((state) => ({
      isAiThinking: true,
      threads: state.threads.map(t => {
        if (t.id === activeThreadId) {
          const msgsCopy = [...t.messages];
          for (let i = msgsCopy.length - 1; i >= 0; i--) {
            if (msgsCopy[i].sender === 'ai' && msgsCopy[i].mode === 'consent') {
              msgsCopy[i] = {
                ...msgsCopy[i],
                selectedConsentDecision: decision
              };
              break;
            }
          }
          return {
            ...t,
            messages: [...msgsCopy, userMessage],
            lastUpdated: 'Just now'
          };
        }
        return t;
      })
    }));

    const userId = useAuthStore.getState().user?.id;

    try {
      const apiResponse = await sendChatMessage(selectedSupportOptionId ? 'Yes' : label, {
        conversationId: activeThreadId,
        language,
        mode: 'consent_response',
        userId,
        consentResponse: {
          consentId,
          decision,
          selectedSupportOptionIds: selectedSupportOptionId ? [selectedSupportOptionId] : undefined
        }
      });

      if (apiResponse.chat?.message) {
        const aiMessage: Message = {
          id: apiResponse.chat.assistantMessageId || ('msg-ai-' + Math.random().toString(36).substring(7)),
          sender: 'ai',
          text: apiResponse.chat.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: apiResponse.chat.suggestions,
          mode: apiResponse.chat.mode,
          consent: apiResponse.chat.consent,
        };

        set((state) => ({
          isAiThinking: false,
          threads: state.threads.map(t => {
            if (t.id === activeThreadId) {
              return {
                ...t,
                title: apiResponse.conversation?.title || t.title,
                messages: [...t.messages, aiMessage],
                lastUpdated: 'Just now'
              };
            }
            return t;
          })
        }));
        return;
      }
    } catch (err) {
      console.warn('Backend API /api/v1/chat/message failed or offline, falling back to mock response:', err);
    }

    set(() => ({
      isAiThinking: false
    }));
  },

  sendAudioMessage: (audioUrl, duration, text) => {
    let { activeThreadId, language, createNewThread, switchThread } = get();
    let threadId = activeThreadId;
    
    const defaultText = language === 'ta' ? '🎙️ குரல் பதிவு' : language === 'hi' ? '🎙️ ऑडियो संदेश' : '🎙️ Voice Note';
    const messageText = text || defaultText;

    if (!threadId) {
      threadId = createNewThread(messageText);
      switchThread(threadId);
    }

    const targetThread = get().threads.find(t => t.id === threadId);
    const userTurnCount = targetThread ? targetThread.messages.filter(m => m.sender === 'user').length : 0;

    const userMessage: Message = {
      id: 'msg-user-' + Math.random().toString(36).substring(7),
      sender: 'user',
      text: messageText,
      audioUrl,
      audioDuration: duration,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const username = useAuthStore.getState().user?.name;
    const res = getMockResponse("Audio voice note sharing emotional state", userTurnCount, language, username);

    const aiMessage: Message = {
      id: 'msg-ai-' + Math.random().toString(36).substring(7),
      sender: 'ai',
      text: res.textResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedStateSnapshot: {
        journey: res.journeyMetadata.currentJourney,
        stage: res.journeyMetadata.currentStage,
        themes: res.journeyMetadata.extractedThemes,
        needs: res.journeyMetadata.unmetNeeds,
        risks: res.journeyMetadata.riskIndicators
      },
      recommendations: res.recommendations
    };

    set((state) => ({
      threads: state.threads.map(t => {
        if (t.id === threadId) {
          const currentMsgs = t.messages.some(m => m.id === userMessage.id) ? t.messages : [...t.messages, userMessage];
          return {
            ...t,
            messages: [...currentMsgs, aiMessage],
            journeyMetadata: res.journeyMetadata,
            recommendations: res.recommendations,
            systemAction: res.systemAction,
            activeLens: res.activeLens,
            lastUpdated: 'Just now'
          };
        }
        return t;
      })
    }));
  },

  sendMediaMessage: (attachment, text) => {
    let { activeThreadId, language, createNewThread, switchThread } = get();
    let threadId = activeThreadId;

    const defaultText = text || (attachment.type === 'image' ? '🖼️ Attached Image' : attachment.type === 'video' ? '📹 Attached Video' : '📎 Attached File: ' + attachment.name);

    if (!threadId) {
      threadId = createNewThread(defaultText);
      switchThread(threadId);
    }

    const targetThread = get().threads.find(t => t.id === threadId);
    const userTurnCount = targetThread ? targetThread.messages.filter(m => m.sender === 'user').length : 0;

    const userMessage: Message = {
      id: 'msg-user-' + Math.random().toString(36).substring(7),
      sender: 'user',
      text: defaultText,
      attachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const username = useAuthStore.getState().user?.name;
    const res = getMockResponse("Shared media attachment for reflection", userTurnCount, language, username);

    const aiMessage: Message = {
      id: 'msg-ai-' + Math.random().toString(36).substring(7),
      sender: 'ai',
      text: res.textResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      extractedStateSnapshot: {
        journey: res.journeyMetadata.currentJourney,
        stage: res.journeyMetadata.currentStage,
        themes: res.journeyMetadata.extractedThemes,
        needs: res.journeyMetadata.unmetNeeds,
        risks: res.journeyMetadata.riskIndicators
      },
      recommendations: res.recommendations
    };

    set((state) => ({
      threads: state.threads.map(t => {
        if (t.id === threadId) {
          const currentMsgs = t.messages.some(m => m.id === userMessage.id) ? t.messages : [...t.messages, userMessage];
          return {
            ...t,
            messages: [...currentMsgs, aiMessage],
            journeyMetadata: res.journeyMetadata,
            recommendations: res.recommendations,
            systemAction: res.systemAction,
            activeLens: res.activeLens,
            lastUpdated: 'Just now'
          };
        }
        return t;
      })
    }));
  },

  setLanguage: (lang) => {
    set({ language: lang });
  },

  updateConsent: (stakeholder, field, value) => {
    set((state) => {
      const stakeholderRecord = state.consent[stakeholder];
      let allowed = [...stakeholderRecord.allowed];
      let excluded = [...stakeholderRecord.excluded];

      if (value) {
        // Allow field
        if (!allowed.includes(field)) allowed.push(field);
        excluded = excluded.filter(f => f !== field);
      } else {
        // Exclude field
        if (!excluded.includes(field)) excluded.push(field);
        allowed = allowed.filter(f => f !== field);
      }

      return {
        consent: {
          ...state.consent,
          [stakeholder]: { allowed, excluded }
        }
      };
    });
  },

  setRecording: (recording) => {
    set({ isRecording: recording, recordingDuration: 0 });
  },

  tickRecordingDuration: () => {
    set((state) => ({ recordingDuration: state.recordingDuration + 1 }));
  },

  resetThreadToCleanState: () => {
    const activeId = get().activeThreadId;
    if (!activeId) return;
    set((state) => ({
      threads: state.threads.map(t => {
        if (t.id === activeId) {
          return {
            ...t,
            systemAction: null
          };
        }
        return t;
      })
    }));
  },

  getActiveThread: () => {
    const { threads, activeThreadId } = get();
    const currentUserId = useAuthStore.getState().user?.id || 'guest';
    const active = threads.find(t => t.id === activeThreadId);
    if (active && (active.userId === currentUserId || (!active.userId && currentUserId === 'guest'))) {
      return active;
    }
    return null;
  },

  loadConversations: async (userId) => {
    set({ isLoadingConversations: true, conversationError: null });
    try {
      const conversations = await getConversations(userId);
      
      set((state) => {
        const existingById = new Map(state.threads.map(t => [t.id, t]));
        const backendIds = new Set(conversations.map(c => c.id));
        const mergedThreads = conversations.map((conv) => {
          const existing = existingById.get(conv.id);
          return existing
            ? { ...existing, title: conv.title, lastUpdated: new Date(conv.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            : {
                id: conv.id,
                title: conv.title,
                userId,
                messages: [] as Message[],
                journeyMetadata: { currentJourney: 'General Inquiry', currentStage: 'Confusion' as const, extractedThemes: [] as string[], unmetNeeds: [] as string[], riskIndicators: [] as string[] },
                recommendations: [] as Recommendation[],
                systemAction: null,
                activeLens: 'None',
                lastUpdated: new Date(conv.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } as Thread;
        });
        // Drop stale local thread-xxx threads for this user that are now synced to backend
        const localOnlyThreads = state.threads.filter(t => t.userId === userId && !backendIds.has(t.id) && t.id.startsWith('thread-'));
        const otherUsersThreads = state.threads.filter(t => t.userId !== userId);
        // Deduplicate by id
        const seen = new Set<string>();
        const allThreads = [...mergedThreads, ...localOnlyThreads, ...otherUsersThreads].filter(t => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        return {
          threads: allThreads,
          isLoadingConversations: false
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
      set({ conversationError: errorMessage, isLoadingConversations: false });
      console.error('Error loading conversations:', error);
    }
  },

  loadConversationById: async (conversationId, userId) => {
    set({ isLoadingConversations: true, conversationError: null });
    try {
      const conversation = await getConversationById(conversationId, userId);
      
      const messages: Message[] = (conversation.messages || []).map((msg, idx) => ({
        id: `msg-${idx}`,
        sender: msg.role === 'assistant' ? 'ai' : 'user',
        text: msg.content || msg.message || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      set((state) => ({
        threads: state.threads.map(t => {
          if (t.id === conversationId) {
            return {
              ...t,
              messages,
              lastUpdated: new Date(conversation.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return t;
        }),
        isLoadingConversations: false,
        activeThreadId: conversationId
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
      set({ conversationError: errorMessage, isLoadingConversations: false });
      console.error('Error loading conversation:', error);
    }
  },

  clearConversationError: () => {
    set({ conversationError: null });
  },
    }),
    {
      name: 'uga-journey-store',
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        language: state.language,
        consent: state.consent
      })
    }
  )
);
