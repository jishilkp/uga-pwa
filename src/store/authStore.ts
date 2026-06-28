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
  user: UserProfile | null;
  isGuest: boolean;
  isAuthenticated: boolean;

  // Guest daily limit tracking
  guestChatsToday: number;
  guestLastChatDate: string; // ISO date string yyyy-mm-dd

  // OTP flow temp state (not persisted between page reloads intentionally)
  pendingPhone: string;
  otpSent: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions — OTP flow
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

  // For upgrading guest → full account (merge prompt handled in UI)
  upgradeGuestToUser: (user: UserProfile) => void;
}

// ─── Avatar Colors (cycling palette) ────────────────────────────────────────

const AVATAR_COLORS = [
  '#1B4332', '#2D6A4F', '#40916C', '#52B788',
  '#1D3557', '#457B9D', '#6D4C41', '#5D4037',
];

const getAvatarColor = (id: string): string => {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

// ─── Mock API helpers ─────────────────────────────────────────────────────────

const MOCK_OTP = '1234';
const DEV_MODE = import.meta.env.DEV;

// Simulates a network call — swap with real API later
const mockSendOtp = async (phone: string): Promise<{ success: boolean }> => {
  await new Promise((r) => setTimeout(r, 1200)); // Simulate latency
  if (DEV_MODE) {
    console.info(`[UGA Auth Mock] OTP for ${phone}: ${MOCK_OTP}`);
  }
  return { success: true };
};

const mockVerifyOtp = async (
  _phone: string,
  otp: string
): Promise<{ success: boolean; isNewUser: boolean; userId: string }> => {
  await new Promise((r) => setTimeout(r, 900));
  if (otp !== MOCK_OTP) {
    return { success: false, isNewUser: false, userId: '' };
  }
  // Mock: Always treat as new user so step 3 of 3 (Profile Creation) is shown.
  return { success: true, isNewUser: true, userId: `user-${Date.now()}` };
};

// ─── Today's date key ─────────────────────────────────────────────────────────

const todayKey = (): string => new Date().toISOString().slice(0, 10); // yyyy-mm-dd

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      isAuthenticated: false,
      guestChatsToday: 0,
      guestLastChatDate: '',
      pendingPhone: '',
      otpSent: false,
      isLoading: false,
      error: null,

      // ── Send OTP ──────────────────────────────────────────────────────────
      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null, pendingPhone: phone });
        try {
          const res = await mockSendOtp(phone);
          if (res.success) {
            set({ otpSent: true, isLoading: false });
            return true;
          } else {
            set({ error: 'Failed to send OTP. Try again.', isLoading: false });
            return false;
          }
        } catch {
          set({ error: 'Network error. Please try again.', isLoading: false });
          return false;
        }
      },

      // ── Verify OTP ────────────────────────────────────────────────────────
      verifyOtp: async (otp: string) => {
        const { pendingPhone } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await mockVerifyOtp(pendingPhone, otp);
          if (res.success) {
            if (!res.isNewUser) {
              // Existing user — auto-create a minimal profile for mock
              const user: UserProfile = {
                id: res.userId,
                name: 'User',
                phone: pendingPhone,
                language: 'en',
                avatarColor: getAvatarColor(res.userId),
                createdAt: new Date().toISOString(),
              };
              set({
                user,
                isAuthenticated: true,
                isGuest: false,
                isLoading: false,
                otpSent: false,
              });
            } else {
              // New user — signal UI to show profile step
              // Store the userId temporarily in pendingPhone slot via a side approach
              set({ isLoading: false });
            }
            return true;
          } else {
            set({ error: 'Incorrect OTP. Please try again.', isLoading: false });
            return false;
          }
        } catch {
          set({ error: 'Verification failed. Please try again.', isLoading: false });
          return false;
        }
      },

      // ── Complete Profile (new user) ───────────────────────────────────────
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

      // ── Guest Mode ────────────────────────────────────────────────────────
      continueAsGuest: () => {
        set({ isGuest: true, isAuthenticated: true });
      },

      canStartGuestChat: () => {
        const { guestChatsToday, guestLastChatDate, isGuest } = get();
        if (!isGuest) return true;
        const today = todayKey();
        if (guestLastChatDate !== today) return true; // new day, reset
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

      // ── Upgrade Guest → Full User ─────────────────────────────────────────
      upgradeGuestToUser: (user: UserProfile) => {
        set({
          user,
          isGuest: false,
          isAuthenticated: true,
          guestChatsToday: 0,
          guestLastChatDate: '',
        });
      },

      // ── Logout ────────────────────────────────────────────────────────────
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
      // Only persist these fields — skip transient UI state
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
        isAuthenticated: state.isAuthenticated,
        guestChatsToday: state.guestChatsToday,
        guestLastChatDate: state.guestLastChatDate,
      }),
    }
  )
);
