import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMockResponse } from '../services/mockOrchestrator';
import type { JourneyMetadata, Recommendation } from '../services/mockOrchestrator';
import { useAuthStore } from './authStore';

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
  
  // Actions
  createNewThread: (title?: string, initialMessage?: string) => string;
  switchThread: (id: string | null) => void;
  deleteThread: (id: string) => void;
  sendMessage: (text: string) => void;
  sendAudioMessage: (audioUrl: string, duration: number, text?: string) => void;
  sendMediaMessage: (attachment: Attachment, text?: string) => void;
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  updateConsent: (stakeholder: Stakeholder, field: string, value: boolean) => void;
  setRecording: (recording: boolean) => void;
  tickRecordingDuration: () => void;
  resetThreadToCleanState: () => void;
  
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

  createNewThread: (title, initialMessage) => {
    const newId = 'thread-' + Math.random().toString(36).substring(7);
    const newThread: Thread = {
      id: newId,
      title: title || 'New Healing Chapter',
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
      activeThreadId: newId
    }));

    if (initialMessage) {
      // Trigger response logic for this new thread
      const store = get();
      const userTurnCount = 0;
      const username = useAuthStore.getState().user?.name;
      const res = getMockResponse(initialMessage, userTurnCount, store.language, username);
      
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
        threads: state.threads.map(t => {
          if (t.id === newId) {
            // Try to auto-derive a better title from the input if it's a known journey
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
    }

    return newId;
  },

  switchThread: (id) => {
    set({ activeThreadId: id });
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

  sendMessage: (text) => {
    const { activeThreadId, threads, language } = get();
    if (!activeThreadId) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    // Turn count is calculated based on user message turns
    const userTurnCount = thread.messages.filter(m => m.sender === 'user').length;

    const userMessage: Message = {
      id: 'msg-user-' + Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Pre-inject user message
    const updatedMessages = [...thread.messages, userMessage];

    // Evaluate response
    const username = useAuthStore.getState().user?.name;
    const res = getMockResponse(text, userTurnCount, language, username);

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
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...updatedMessages, aiMessage],
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
    return threads.find(t => t.id === activeThreadId) || null;
  }
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
