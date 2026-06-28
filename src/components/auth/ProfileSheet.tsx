import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';

interface ProfileSheetProps {
  onClose: () => void;
  onSignUp: () => void;
}

const localized = {
  en: {
    guest: 'Guest',
    guestMode: 'Guest Mode',
    conversations: 'Conversations',
    createBtn: '🌿 Create Free Account',
    createSub: 'Unlimited conversations · Save your journey',
    signOut: 'Sign Out',
    clearExit: 'Clear Data & Exit',
    female: 'Female',
    male: 'Male',
    other: 'Other',
  },
  ta: {
    guest: 'விருந்தினர்',
    guestMode: 'விருந்தினர் முறை',
    conversations: 'உரையாடல்கள்',
    createBtn: '🌿 இலவசக் கணக்கை உருவாக்கு',
    createSub: 'வரம்பற்ற உரையாடல்கள் · உங்கள் பயணத்தைச் சேமிக்கவும்',
    signOut: 'வெளியேறு',
    clearExit: 'தரவை அழித்து வெளியேறு',
    female: 'பெண்',
    male: 'ஆண்',
    other: 'இதர',
  },
  hi: {
    guest: 'गेस्ट',
    guestMode: 'गेस्ट मोड',
    conversations: 'बातचीत',
    createBtn: '🌿 मुफ्त खाता बनाएं',
    createSub: 'असीमित बातचीत · अपनी यात्रा सहेजें',
    signOut: 'साइन आउट',
    clearExit: 'डेटा साफ़ करें और बाहर निकलें',
    female: 'महिला',
    male: 'पुरुष',
    other: 'अन्य',
  },
};

export const ProfileSheet: React.FC<ProfileSheetProps> = ({ onClose, onSignUp }) => {
  const { user, isGuest, logout } = useAuthStore();
  const threads = useJourneyStore((s) => s.threads);
  const language = useJourneyStore((s) => s.language);
  const text = localized[language] || localized.en;

  const handleSignOut = () => {
    logout();
    onClose();
  };

  const handleClearGuest = () => {
    logout();
    onClose();
  };

  const getGenderLabel = (g?: string) => {
    if (!g) return '';
    if (g === 'female') return text.female;
    if (g === 'male') return text.male;
    if (g === 'other') return text.other;
    return g;
  };

  return (
    // absolute so it stays inside the phone bezel / app column
    <div className="absolute inset-0 z-[150] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-300 z-10 overflow-hidden">
        {/* Grab bar */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-0" />

        {/* User / Guest Header */}
        <div className="px-6 py-5">
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black shadow-md flex-shrink-0"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 dark:text-white text-base font-black truncate">{user.name}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold">{user.phone}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {user.gender && (
                    <span className="inline-block text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 capitalize">
                      {getGenderLabel(user.gender)}
                    </span>
                  )}
                  {user.dob && (
                    <span className="inline-block text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                      🎂 {user.dob}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Guest mode header */
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl flex-shrink-0">
                👤
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white text-base font-black">{text.guest}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold">{text.guestMode}</p>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-6" />

        {/* Stats row */}
        <div className="px-6 py-4 flex space-x-3">
          <div className="flex-1 text-center bg-gray-50 dark:bg-gray-800/60 rounded-xl py-3">
            <p className="text-gray-900 dark:text-white text-xl font-black">{threads.length}</p>
            <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{text.conversations}</p>
          </div>
        </div>

        {/* Guest upgrade CTA */}
        {isGuest && (
          <div className="mx-6 mb-4">
            <button
              id="profile-sheet-signup-btn"
              onClick={() => { onClose(); onSignUp(); }}
              className="w-full py-3.5 rounded-2xl bg-[#1B4332] text-white font-black text-sm uppercase tracking-wider hover:bg-[#2D6A4F] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(27,67,50,0.2)]"
            >
              {text.createBtn}
            </button>
            <p className="text-center text-gray-300 dark:text-gray-600 text-[10px] font-medium mt-2">
              {text.createSub}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mx-6 mb-5 space-y-1">
          {user && (
            <button
              id="profile-sheet-logout-btn"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-sm font-bold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>{text.signOut}</span>
            </button>
          )}

          {isGuest && (
            <button
              onClick={handleClearGuest}
              className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-bold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>{text.clearExit}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSheet;
