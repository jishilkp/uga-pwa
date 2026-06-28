import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';

interface GuestUpgradeBannerProps {
  onSignUp: () => void;
}

const localized = {
  en: { mode: 'Guest Mode', signUp: 'Sign Up →' },
  ta: { mode: 'விருந்தினர் முறை', signUp: 'பதிவு செய் →' },
  hi: { mode: 'गेस्ट मोड', signUp: 'साइन अप करें →' },
};

export const GuestUpgradeBanner: React.FC<GuestUpgradeBannerProps> = ({ onSignUp }) => {
  const { isGuest } = useAuthStore();
  const language = useJourneyStore((s) => s.language);
  const text = localized[language] || localized.en;

  if (!isGuest) return null;

  return (
    <div className="w-full px-3 pt-2 flex justify-center">
      <div className="flex items-center space-x-2 bg-sky-50 dark:bg-blue-950/40 border border-sky-200 dark:border-blue-800/40 rounded-full px-4 py-2 shadow-sm max-w-sm w-full">
        <span className="text-sky-600 dark:text-sky-400 text-xs">👤</span>
        <span className="text-sky-900 dark:text-sky-200 text-[11px] font-semibold flex-1 truncate">
          {text.mode}
        </span>
        <button
          id="guest-banner-signup-btn"
          onClick={onSignUp}
          className="text-[10px] font-black text-sky-800 dark:text-sky-200 uppercase tracking-wider bg-sky-200/60 dark:bg-blue-800/50 px-3 py-1 rounded-full hover:bg-sky-200 dark:hover:bg-blue-700/60 transition active:scale-95 flex-shrink-0"
        >
          {text.signUp}
        </button>
      </div>
    </div>
  );
};

export default GuestUpgradeBanner;
