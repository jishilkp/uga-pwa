import React from 'react';
import { useJourneyStore } from '../../store/journeyStore';

interface GuestLimitModalProps {
  onClose: () => void;
  onSignUp: () => void;
}

const localized = {
  en: {
    title: 'Daily limit reached',
    desc: "You've had 2 conversations today as a guest. Create a free account to unlock unlimited conversations and save your healing journey.",
    createBtn: 'Create Free Account',
    maybeLater: 'Maybe later',
    resetInfo: 'Your daily limit resets at midnight',
  },
  ta: {
    title: 'தினசரி வரம்பு முடிந்தது',
    desc: 'விருந்தினராக இன்று 2 உரையாடல்களை முடித்துவிட்டீர்கள். வரம்பற்ற உரையாடல்களைப் பெற இலவசக் கணக்கை உருவாக்கவும்.',
    createBtn: 'இலவசக் கணக்கை உருவாக்கு',
    maybeLater: 'பிறகு பார்க்கலாம்',
    resetInfo: 'உங்கள் வரம்பு நள்ளிரவில் புதுப்பிக்கப்படும்',
  },
  hi: {
    title: 'दैनिक सीमा समाप्त',
    desc: 'आपने गेस्ट के रूप में आज 2 बातचीत पूरी कर ली हैं। असीमित बातचीत के लिए मुफ्त खाता बनाएं।',
    createBtn: 'मुफ्त खाता बनाएं',
    maybeLater: 'बाद में',
    resetInfo: 'आपकी सीमा मध्यरात्रि को रीसेट होगी',
  },
};

export const GuestLimitModal: React.FC<GuestLimitModalProps> = ({ onClose, onSignUp }) => {
  const language = useJourneyStore((s) => s.language);
  const text = localized[language] || localized.en;

  return (
    <div className="absolute inset-0 z-[200] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-sm mx-auto mb-4 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-300 z-10 mx-4">
        {/* Grab bar */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🌿</div>
          <h3 className="text-gray-900 dark:text-white text-lg font-black mb-2">
            {text.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
            {text.desc}
          </p>
        </div>

        <div className="space-y-3">
          <button
            id="guest-limit-signup-btn"
            onClick={onSignUp}
            className="w-full py-4 rounded-2xl bg-[#1B4332] text-white font-black text-sm uppercase tracking-wider hover:bg-[#2D6A4F] active:scale-[0.98] transition-all duration-200 shadow-[0_8px_24px_rgba(27,67,50,0.3)]"
          >
            {text.createBtn}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl text-gray-400 dark:text-gray-500 font-semibold text-sm hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            {text.maybeLater}
          </button>
        </div>

        <p className="text-center text-gray-300 dark:text-gray-600 text-[10px] font-medium mt-4">
          {text.resetInfo}
        </p>
      </div>
    </div>
  );
};

export default GuestLimitModal;
