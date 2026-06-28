import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  language: 'en' | 'ta' | 'hi';
  gender?: string;
  dob?: string;
  avatarColor: string;
  createdAt: string;
}

export type AuthStep =
  | 'landing'
  | 'phone'
  | 'otp'
  | 'profile'
  | 'authenticated';

interface AuthStore {
  // State
  demoMode: boolean;
  user: UserProfile | null;
  isGuest: boolean;
  isAuthenticated: boolean;

  // Guest daily limit tracking
  guestChatsToday: number;
  guestLastChatDate: string;

  // OTP flow temp state
  pendingPhone: string;
  otpSent: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions — Demo Mode Toggle
  setDemoMode: (val: boolean) => void;
  toggleDemoMode: () => void;

  // Actions — Demo Login
  login: (username: string, pin: string) => Promise<boolean>;

  // Actions — OTP & Profile flow
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  completeProfile: (name: string, language: 'en' | 'ta' | 'hi', gender?: string, dob?: string) => void;

  // Actions — Guest
  continueAsGuest: () => void;
  canStartGuestChat: () => boolean;
  incrementGuestChat: () => void;

  // Actions — General
  logout: () => void;
  clearError: () => void;
  upgradeGuestToUser: (user: UserProfile) => void;
}

const AVATAR_COLORS = [
  '#1B4332', '#2D6A4F', '#40916C', '#52B788',
  '#1D3557', '#457B9D', '#6D4C41', '#5D4037',
];

const getAvatarColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const MOCK_OTP = '1234';

const mockSendOtp = async (_phone: string): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 1000));
  return { success: true };
};

const mockVerifyOtp = async (_phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean; userId: string }> => {
  await new Promise((r) => setTimeout(r, 800));
  if (otp !== MOCK_OTP) return { success: false, isNewUser: false, userId: '' };
  return { success: true, isNewUser: true, userId: `user-${Date.now()}` };
};

const todayKey = (): string => new Date().toISOString().slice(0, 10);

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      demoMode: true, // Enabled by default as requested
      user: null,
      isGuest: false,
      isAuthenticated: false,
      guestChatsToday: 0,
      guestLastChatDate: '',
      pendingPhone: '',
      otpSent: false,
      isLoading: false,
      error: null,

      setDemoMode: (val: boolean) => set({ demoMode: val }),
      toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),

      // ── Demo Login Action ─────────────────────────────────────────────────
      login: async (username: string, pin: string) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 400));
        
        const cleanName = username.trim();

        if (!cleanName) {
          set({ error: 'Please enter your username.', isLoading: false });
          return false;
        }

        if (pin !== '1234') {
          set({ error: 'Incorrect PIN. Please try again.', isLoading: false });
          return false;
        }

        const user: UserProfile = {
          id: `user-${cleanName.toLowerCase().replace(/\s+/g, '-')}`,
          name: cleanName,
          phone: '',
          language: 'en',
          avatarColor: getAvatarColor(cleanName),
          createdAt: new Date().toISOString(),
        };

        set({ user, isAuthenticated: true, isGuest: false, isLoading: false, error: null });
        return true;
      },

      // ── Original OTP & Profile Actions ─────────────────────────────────────
      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null, pendingPhone: phone });
        try {
          const res = await mockSendOtp(phone);
          if (res.success) {
            set({ otpSent: true, isLoading: false });
            return true;
          }
          set({ error: 'Failed to send OTP. Try again.', isLoading: false });
          return false;
        } catch {
          set({ error: 'Network error. Please try again.', isLoading: false });
          return false;
        }
      },

      verifyOtp: async (otp: string) => {
        const { pendingPhone } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await mockVerifyOtp(pendingPhone, otp);
          if (res.success) {
            set({ isLoading: false });
            return true;
          }
          set({ error: 'Incorrect OTP. Please try again.', isLoading: false });
          return false;
        } catch {
          set({ error: 'Verification failed. Please try again.', isLoading: false });
          return false;
        }
      },

      completeProfile: (name: string, language: 'en' | 'ta' | 'hi', gender?: string, dob?: string) => {
        const { pendingPhone } = get();
        const userId = `user-${Date.now()}`;
        const user: UserProfile = {
          id: userId,
          name: name.trim() || 'Friend',
          phone: pendingPhone,
          language,
          gender,
          dob,
          avatarColor: getAvatarColor(userId),
          createdAt: new Date().toISOString(),
        };
        set({
          user,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          otpSent: false,
          pendingPhone: '',
        });
      },

      continueAsGuest: () => {
        set({ isGuest: true, isAuthenticated: true });
      },

      canStartGuestChat: () => {
        const { guestChatsToday, guestLastChatDate, isGuest } = get();
        if (!isGuest) return true;
        const today = todayKey();
        if (guestLastChatDate !== today) return true;
        return guestChatsToday < 2;
      },

      incrementGuestChat: () => {
        const { guestLastChatDate } = get();
        const today = todayKey();
        if (guestLastChatDate !== today) {
          set({ guestChatsToday: 1, guestLastChatDate: today });
        } else {
          set((s) => ({ guestChatsToday: s.guestChatsToday + 1 }));
        }
      },

      upgradeGuestToUser: (user: UserProfile) => {
        set({
          user,
          isGuest: false,
          isAuthenticated: true,
          guestChatsToday: 0,
          guestLastChatDate: '',
        });
      },

      logout: () => {
        set({
          user: null,
          isGuest: false,
          isAuthenticated: false,
          pendingPhone: '',
          otpSent: false,
          error: null,
          guestChatsToday: 0,
          guestLastChatDate: '',
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'uga-auth',
      partialize: (state) => ({
        demoMode: state.demoMode,
        user: state.user,
        isGuest: state.isGuest,
        isAuthenticated: state.isAuthenticated,
        guestChatsToday: state.guestChatsToday,
        guestLastChatDate: state.guestLastChatDate,
      }),
    }
  )
);
