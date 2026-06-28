import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, type AuthStep } from '../../store/authStore';
import { useJourneyStore } from '../../store/journeyStore';
import logo from '../../assets/logo.jpg';

// ─── Constants & Country Codes for Original Flow ──────────────────────────────

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1',  flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
];

const OTP_RESEND_SECONDS = 30;
const DEV_OTP_HINT = import.meta.env.DEV ? '1234' : null;

// ─── Localizations ────────────────────────────────────────────────────────────

const localizedDemo = {
  en: {
    title: 'UGA',
    subtitle: 'Healing Intelligence',
    welcome: 'Welcome 🌿',
    welcomeSub: 'Enter your credentials to access your personalized safe space.',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your username',
    pinLabel: '4-Digit PIN Password',
    pinPlaceholder: '••••',
    signIn: 'Sign In',
    authenticating: 'Signing in...',
    footer: '© 2026 UGA',
  },
  ta: {
    title: 'உகா',
    subtitle: 'ஹீலிங் இன்டெலிஜென்ஸ்',
    welcome: 'உகாவிற்கு வரவேற்கிறோம் 🌿',
    welcomeSub: 'உங்கள் தனிப்பயனாக்கப்பட்ட பாதுகாப்பான இடத்தை அணுக உங்கள் விவரங்களை உள்ளிடவும்.',
    usernameLabel: 'பயனர்பெயர்',
    usernamePlaceholder: 'உங்கள் பயனர்பெயரை உள்ளிடவும்',
    pinLabel: '4-இலக்க பின் கடவுச்சொல்',
    pinPlaceholder: '••••',
    signIn: 'உள்நுழைக',
    authenticating: 'உள்நுழைகிறது...',
    footer: '© 2026 UGA · அனைத்து பாதைகளும் வளர்ச்சிக்கே',
  },
  hi: {
    title: 'उगा',
    subtitle: 'हीलिंग इंटेलिजेंस',
    welcome: 'उगा में आपका स्वागत है 🌿',
    welcomeSub: 'अपने व्यक्तिगत सुरक्षित स्थान तक पहुँचने के लिए अपना विवरण दर्ज करें।',
    usernameLabel: 'उपयोगकर्ता नाम',
    usernamePlaceholder: 'अपना उपयोगकर्ता नाम दर्ज करें',
    pinLabel: '4-अंकों का पिन पासवर्ड',
    pinPlaceholder: '••••',
    signIn: 'साइन इन करें',
    authenticating: 'साइन इन हो रहा है...',
    footer: '© 2026 UGA · सभी मार्ग समृद्धि की ओर ले जाते हैं',
  },
};

const authLocalized = {
  en: {
    title: 'UGA',
    healingIntelligence: 'Healing Intelligence',
    back: 'Back',
    welcome: 'Welcome 🌿',
    welcomeSub: 'Your safe space for emotional well-being and guided healing.',
    signIn: 'Sign In / Sign Up',
    guest: 'Continue as Guest →',
    guestNote: 'Guest mode · 2 conversations per day',
    step1: 'Step 1 of 3',
    enterNum: 'Enter your number',
    numSub: "We'll send a one-time code to verify.",
    mobilePlaceholder: 'Mobile number',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending OTP...',
    step2: 'Step 2 of 3',
    enterCode: 'Enter the code',
    sentTo: 'Sent to',
    verifying: 'Verifying...',
    verifyBtn: 'Verify & Continue',
    resendIn: 'Resend OTP in',
    resend: 'Resend OTP',
    step3: 'Step 3 of 3',
    setupProfile: 'Set up your profile',
    profileSub: 'Tell us a bit about yourself to personalize your journey.',
    nameLabel: 'What should we call you? *',
    namePlaceholder: 'Your name or nickname',
    genderLabel: 'Gender',
    female: 'Female',
    male: 'Male',
    other: 'Other',
    dobLabel: 'Date of Birth',
    beginBtn: 'Begin My Journey 🌿',
    dayPrefix: 'Day ',
    footer: '© 2026 UGA',
  },
  ta: {
    title: 'உகா',
    healingIntelligence: 'ஹீலிங் இன்டெலிஜென்ஸ்',
    back: 'பின்னே',
    welcome: 'வணக்கம் 🌿',
    welcomeSub: 'உங்கள் உணர்ச்சி நல்வாழ்வுக்கான பாதுகாப்பான இடம்.',
    signIn: 'உள்நுழைக / பதிவு செய்க',
    guest: 'விருந்தினராகத் தொடரவும் →',
    guestNote: 'விருந்தினர் முறை · ஒரு நாளைக்கு 2 உரையாடல்கள்',
    step1: 'படி 1/3',
    enterNum: 'உங்கள் எண்ணை உள்ளிடவும்',
    numSub: 'சரிபார்க்க ஒருமுறை மட்டுமே பயன்படுத்தும் குறியீட்டை அனுப்புவோம்.',
    mobilePlaceholder: 'கைபேசி எண்',
    sendOtp: 'OTP அனுப்பு',
    sendingOtp: 'OTP அனுப்பப்படுகிறது...',
    step2: 'படி 2/3',
    enterCode: 'குறியீட்டை உள்ளிடவும்',
    sentTo: 'அனுப்பப்பட்டது:',
    verifying: 'சரிபார்க்கப்படுகிறது...',
    verifyBtn: 'சரிபார்த்துத் தொடரவும்',
    resendIn: 'மீண்டும் அனுப்ப நொடி',
    resend: 'மீண்டும் OTP அனுப்பு',
    step3: 'படி 3/3',
    setupProfile: 'உங்கள் சுயவிவரத்தை அமைக்கவும்',
    profileSub: 'உங்கள் பயணத்தைத் தனிப்பயனாக்க உங்களைப் பற்றி சிறிது கூறுங்கள்.',
    nameLabel: 'உங்களை எப்படி அழைக்க வேண்டும்? *',
    namePlaceholder: 'உங்கள் பெயர் அல்லது புனைப்பெயர்',
    genderLabel: 'பாலினம்',
    female: 'பெண்',
    male: 'ஆண்',
    other: 'இதர',
    dobLabel: 'பிறந்த தேதி',
    beginBtn: 'என் பயணத்தைத் தொடங்கு 🌿',
    dayPrefix: 'நாள் ',
    footer: '© 2026 UGA · அனைத்து பாதைகளும் வளர்ச்சிக்கே',
  },
  hi: {
    title: 'उगा',
    healingIntelligence: 'हीलिंग इंटेलिजेंस',
    back: 'वापस',
    welcome: 'स्वागत है 🌿',
    welcomeSub: 'आपके भावनात्मक कल्याण के लिए सुरक्षित स्थान।',
    signIn: 'साइन इन / साइन अप',
    guest: 'गेस्ट के रूप में जारी रखें →',
    guestNote: 'गेस्ट मोड · प्रतिदिन 2 बातचीत',
    step1: 'चरण 1/3',
    enterNum: 'अपना नंबर दर्ज करें',
    numSub: 'हम सत्यापित करने के लिए एक कोड भेजेंगे।',
    mobilePlaceholder: 'मोबाइल नंबर',
    sendOtp: 'ओटीपी भेजें',
    sendingOtp: 'ओटीपी भेजा जा रहा है...',
    step2: 'चरण 2/3',
    enterCode: 'कोड दर्ज करें',
    sentTo: 'भेजा गया:',
    verifying: 'सत्यापित हो रहा है...',
    verifyBtn: 'सत्यापित करें और जारी रखें',
    resendIn: 'ओटीपी फिर से भेजें समय',
    resend: 'ओटीपी फिर से भेजें',
    step3: 'चरण 3/3',
    setupProfile: 'अपनी प्रोफ़ाइल सेट करें',
    profileSub: 'अपनी यात्रा को व्यक्तिगत बनाने के लिए अपने बारे में बताएं।',
    nameLabel: 'हम आपको क्या कहकर बुलाएं? *',
    namePlaceholder: 'आपका नाम या उपनाम',
    genderLabel: 'लिंग',
    female: 'महिला',
    male: 'पुरुष',
    other: 'अन्य',
    dobLabel: 'जन्म तिथि',
    beginBtn: 'अपनी यात्रा शुरू करें 🌿',
    dayPrefix: 'दिन ',
    footer: '© 2026 UGA · सभी मार्ग समृद्धि की ओर ले जाते हैं',
  },
};

// ─── 5 Continuous Clicks Hook ──────────────────────────────────────────────────

const useFiveClickToggle = () => {
  const { toggleDemoMode } = useAuthStore();
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1200) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      toggleDemoMode();
    }
  };

  return handleLogoClick;
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const AnimatedBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0 bg-[#FDFBF7]" />
    <div className="absolute top-[-8%] right-[-8%] w-[55vw] h-[55vw] max-w-[340px] max-h-[340px] rounded-full bg-[#E2ECE9]/60 blur-[60px] auth-orb-1" />
    <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[300px] max-h-[300px] rounded-full bg-[#D1E2DD]/50 blur-[70px] auth-orb-2" />
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="absolute text-[#1B4332]/10 select-none"
        style={{
          fontSize: `${24 + i * 6}px`,
          left: `${8 + i * 20}%`,
          top: `${5 + (i * 22) % 75}%`,
          animation: `auth-leaf-float ${5 + i * 0.8}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.6}s`,
        }}
      >
        🌿
      </div>
    ))}
  </div>
);

const BackButton: React.FC<{ onClick: () => void; text: string }> = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-1.5 text-[#1B4332]/50 hover:text-[#1B4332] transition mb-3 w-fit"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
    <span className="text-sm font-semibold">{text}</span>
  </button>
);

const UgaLogoHeader: React.FC<{ compact?: boolean; t: typeof authLocalized.en }> = ({ compact, t }) => {
  const handleFiveClicks = useFiveClickToggle();

  return (
    <div
      onClick={handleFiveClicks}
      className={`flex flex-col items-center cursor-pointer select-none group ${compact ? 'mb-2' : 'mb-4'}`}
    >
      <img
        src={logo}
        alt={t.title}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#1B4332]/20 shadow-sm mb-1.5 group-hover:scale-105 transition active:scale-95"
      />
      <h1 className="text-[12px] font-black uppercase tracking-widest text-[#1B4332] leading-tight">{t.title}</h1>
      <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-gray-400">{t.healingIntelligence}</p>
    </div>
  );
};

const PrimaryButton: React.FC<{
  id?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}> = ({ id, onClick, disabled, isLoading, loadingText, children }) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 ${
      !disabled && !isLoading
        ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-[0_6px_24px_rgba(27,67,50,0.22)] active:scale-[0.98]'
        : 'bg-[#1B4332]/20 text-[#1B4332]/40 cursor-not-allowed'
    }`}
  >
    {isLoading ? (
      <span className="flex items-center justify-center space-x-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span>{loadingText || 'Please wait...'}</span>
      </span>
    ) : children}
  </button>
);

const ErrorMsg: React.FC<{ msg: string | null }> = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs font-semibold px-1 -mt-1">{msg}</p> : null;

// ─── DEMO MODE SCREEN ─────────────────────────────────────────────────────────

const DemoUsernamePinScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const language = useJourneyStore((s) => s.language);
  const t = localizedDemo[language] || localizedDemo.en;
  const handleFiveClicks = useFiveClickToggle();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || pin.length < 4) return;
    await login(username, pin);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-[#FDFBF7]">
      <AnimatedBackground />

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-6 relative z-10 overflow-y-auto custom-scrollbar">
        {/* Brand Logo & Header — Requires 5 continuous clicks to toggle mode */}
        <div
          onClick={handleFiveClicks}
          className="flex flex-col items-center mb-6 cursor-pointer select-none group"
        >
          <img
            src={logo}
            alt={t.title}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#1B4332]/20 shadow-md mb-2 group-hover:scale-105 transition active:scale-95"
          />
          <h1 className="text-[14px] font-black uppercase tracking-widest text-[#1B4332] leading-tight">{t.title}</h1>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">{t.subtitle}</p>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-6 max-w-xs">
          <h2 className="text-gray-900 text-xl font-black leading-tight mb-1">
            {t.welcome}
          </h2>
          <p className="text-gray-500 text-xs font-medium leading-relaxed">
            {t.welcomeSub}
          </p>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-white/80 dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E2ECE9] dark:border-gray-700 shadow-sm backdrop-blur-xs">
          <div>
            <label className="block text-[#1B4332] dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1.5">
              {t.usernameLabel}
            </label>
            <input
              id="auth-username-input"
              type="text"
              value={username}
              onChange={(e) => { clearError(); setUsername(e.target.value); }}
              placeholder={t.usernamePlaceholder}
              className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-gray-900 border border-[#E2ECE9] dark:border-gray-700 text-gray-800 dark:text-white font-semibold text-xs focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition shadow-xs"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[#1B4332] dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1.5">
              {t.pinLabel}
            </label>
            <input
              id="auth-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => { clearError(); setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); }}
              placeholder={t.pinPlaceholder}
              className="w-full h-11 px-3.5 text-center font-mono tracking-widest text-lg rounded-xl bg-white dark:bg-gray-900 border border-[#E2ECE9] dark:border-gray-700 text-gray-800 dark:text-white font-black focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition shadow-xs"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold text-center pt-0.5">{error}</p>
          )}

          <button
            id="auth-login-btn"
            type="submit"
            disabled={isLoading || !username.trim() || pin.length < 4}
            className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 mt-2 ${
              !isLoading && username.trim() && pin.length === 4
                ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-[0_6px_20px_rgba(27,67,50,0.25)] active:scale-[0.98]'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? t.authenticating : t.signIn}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-3 px-6 text-center flex-shrink-0">
        <p className="text-gray-350 text-[10px] font-semibold">
          {t.footer}
        </p>
      </div>
    </div>
  );
};

// ─── ORIGINAL MULTI-STEP FLOW COMPONENTS ──────────────────────────────────────

const LandingStep: React.FC<{
  onSignIn: () => void;
  onGuest: () => void;
  t: typeof authLocalized.en;
}> = ({ onSignIn, onGuest, t }) => {
  const handleFiveClicks = useFiveClickToggle();

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-7 py-8 relative z-10 overflow-y-auto custom-scrollbar">
      <div
        onClick={handleFiveClicks}
        className="flex flex-col items-center mb-8 cursor-pointer select-none group"
      >
        <img
          src={logo}
          alt={t.title}
          className="w-16 h-16 rounded-full object-cover border-2 border-[#1B4332]/20 shadow-md mb-3 group-hover:scale-105 transition active:scale-95"
        />
        <h1 className="text-[14px] font-black uppercase tracking-widest text-[#1B4332] leading-tight">{t.title}</h1>
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400">{t.healingIntelligence}</p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-gray-900 text-2xl font-black leading-tight mb-2">
          {t.welcome}
        </h2>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
          {t.welcomeSub}
        </p>
      </div>

      <div className="w-full max-w-[280px] space-y-3">
        <button
          id="auth-signin-btn"
          onClick={onSignIn}
          className="w-full py-4 rounded-2xl bg-[#1B4332] text-white font-black text-sm uppercase tracking-wider hover:bg-[#2D6A4F] active:scale-[0.98] transition-all duration-200 shadow-[0_6px_24px_rgba(27,67,50,0.22)]"
        >
          {t.signIn}
        </button>

        <div className="flex items-center space-x-3 py-0.5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-350 text-[10px] font-bold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          id="auth-guest-btn"
          onClick={onGuest}
          className="w-full py-3.5 rounded-2xl border-2 border-[#1B4332]/20 text-[#1B4332] font-semibold text-sm hover:border-[#1B4332]/50 hover:bg-[#1B4332]/5 active:scale-[0.98] transition-all duration-200"
        >
          {t.guest}
        </button>

        <p className="text-center text-gray-350 text-[10px] font-medium pt-0.5">
          {t.guestNote}
        </p>
      </div>
    </div>
  );
};

const PhoneStep: React.FC<{
  onBack: () => void;
  onOtpSent: () => void;
  t: typeof authLocalized.en;
}> = ({ onBack, onOtpSent, t }) => {
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { sendOtp, isLoading, error, clearError } = useAuthStore();

  const isValid = phoneNumber.replace(/\D/g, '').length >= 7;

  const handleSend = async () => {
    clearError();
    const fullPhone = selectedCode.code + phoneNumber.replace(/\D/g, '');
    const ok = await sendOtp(fullPhone);
    if (ok) onOtpSent();
  };

  return (
    <div className="flex flex-col flex-1 px-7 py-5 relative z-10 overflow-y-auto custom-scrollbar">
      <BackButton onClick={onBack} text={t.back} />

      <div className="flex-1 flex flex-col justify-center">
        <UgaLogoHeader t={t} />

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">1</div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.step1}</p>
        </div>

        <div className="mb-5">
          <h2 className="text-gray-900 text-xl font-black mb-1">{t.enterNum}</h2>
          <p className="text-gray-400 text-sm font-medium">{t.numSub}</p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="h-11 px-3 rounded-xl bg-white border border-[#E2ECE9] text-gray-700 font-bold text-sm flex items-center space-x-1.5 hover:border-[#1B4332]/40 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/10 transition shadow-sm"
              >
                <span>{selectedCode.flag}</span>
                <span className="text-xs">{selectedCode.code}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showCountryPicker && (
                <div className="absolute top-13 left-0 w-52 bg-white border border-[#E2ECE9] rounded-xl overflow-hidden shadow-xl z-50">
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCode(c); setShowCountryPicker(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold hover:bg-[#F3F7F6] transition ${
                        selectedCode.code === c.code ? 'text-[#1B4332] bg-[#F3F7F6]' : 'text-gray-600'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="ml-auto text-gray-350 text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              id="auth-phone-input"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSend()}
              placeholder={t.mobilePlaceholder}
              className="flex-1 h-11 px-4 rounded-xl bg-white border border-[#E2ECE9] text-gray-800 font-semibold text-sm placeholder-gray-350 focus:outline-none focus:border-[#1B4332]/50 focus:ring-2 focus:ring-[#1B4332]/10 transition shadow-sm"
              autoFocus
            />
          </div>

          <ErrorMsg msg={error} />

          <PrimaryButton
            id="auth-send-otp-btn"
            onClick={handleSend}
            disabled={!isValid}
            isLoading={isLoading}
            loadingText={t.sendingOtp}
          >
            {t.sendOtp}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const OtpStep: React.FC<{
  onBack: () => void;
  onVerified: (isNewUser: boolean) => void;
  t: typeof authLocalized.en;
}> = ({ onBack, onVerified, t }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, sendOtp, pendingPhone, isLoading, error, clearError } = useAuthStore();

  const OTP_LENGTH = 4;

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (cleaned && index === OTP_LENGTH - 1) {
      const fullOtp = next.slice(0, OTP_LENGTH - 1).join('') + cleaned;
      if (fullOtp.length === OTP_LENGTH) handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otp: string) => {
    clearError();
    const ok = await verifyOtp(otp);
    if (ok) {
      onVerified(true);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setCountdown(OTP_RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    clearError();
    await sendOtp(pendingPhone);
    inputRefs.current[0]?.focus();
  };

  const otp = digits.join('');

  return (
    <div className="flex flex-col flex-1 px-7 py-5 relative z-10 overflow-y-auto custom-scrollbar">
      <BackButton onClick={onBack} text={t.back} />

      <div className="flex-1 flex flex-col justify-center">
        <UgaLogoHeader t={t} />

        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">2</div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.step2}</p>
        </div>

        <div className="mb-5">
          <h2 className="text-gray-900 text-xl font-black mb-1">{t.enterCode}</h2>
          <p className="text-gray-400 text-sm font-medium">
            {t.sentTo} <span className="font-bold text-[#1B4332]">{pendingPhone}</span>
          </p>
          {DEV_OTP_HINT && (
            <div className="mt-2 text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg inline-flex items-center space-x-1">
              <span>🧪</span>
              <span>Dev OTP: <strong>{DEV_OTP_HINT}</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex space-x-3 justify-center">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                id={`otp-digit-${i}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digits[i] ?? ''}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all duration-200 bg-white focus:outline-none ${
                  digits[i]
                    ? 'border-[#1B4332] bg-[#F3F7F6] text-[#1B4332]'
                    : 'border-[#E2ECE9] text-gray-800 focus:border-[#1B4332]/60 focus:ring-2 focus:ring-[#1B4332]/10'
                }`}
              />
            ))}
          </div>

          <ErrorMsg msg={error} />

          <PrimaryButton
            id="auth-verify-otp-btn"
            onClick={() => handleVerify(otp)}
            disabled={otp.length < OTP_LENGTH}
            isLoading={isLoading}
            loadingText={t.verifying}
          >
            {t.verifyBtn}
          </PrimaryButton>

          <button
            onClick={handleResend}
            disabled={countdown > 0}
            className={`w-full text-center text-sm font-semibold transition py-1 ${
              countdown > 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-[#1B4332] hover:text-[#2D6A4F]'
            }`}
          >
            {countdown > 0 ? `${t.resendIn} ${countdown}s` : t.resend}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileStep: React.FC<{ onDone: () => void; t: typeof authLocalized.en }> = ({ onDone, t }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('female');
  const [dob, setDob] = useState<string>('2000-01-01');
  const { completeProfile } = useAuthStore();

  const handleDone = () => {
    completeProfile(name, 'en', gender, dob || '2000-01-01');
    onDone();
  };

  const genderOptions = [
    { code: 'female', label: t.female },
    { code: 'male', label: t.male },
    { code: 'other', label: t.other },
  ];

  return (
    <div className="flex flex-col flex-1 px-7 py-4 relative z-10 overflow-y-auto custom-scrollbar">
      <div className="flex-1 flex flex-col justify-start pt-2">
        <UgaLogoHeader compact t={t} />

        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">3</div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.step3}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-gray-900 text-lg font-black mb-0.5">{t.setupProfile}</h2>
          <p className="text-gray-400 text-xs font-medium">{t.profileSub}</p>
        </div>

        <div className="space-y-4 pb-4">
          <div>
            <label className="block text-[#1B4332] text-[10px] font-black uppercase tracking-wider mb-1.5">
              {t.nameLabel}
            </label>
            <input
              id="auth-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full h-11 px-4 rounded-xl bg-white border border-[#E2ECE9] text-gray-800 font-semibold text-sm placeholder-gray-350 focus:outline-none focus:border-[#1B4332]/50 focus:ring-2 focus:ring-[#1B4332]/10 transition shadow-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[#1B4332] text-[10px] font-black uppercase tracking-wider mb-1.5">
              {t.genderLabel}
            </label>
            <div className="flex gap-2">
              {genderOptions.map((g) => (
                <button
                  key={g.code}
                  type="button"
                  onClick={() => setGender(g.code)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    gender === g.code
                      ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                      : 'bg-white border-[#E2ECE9] text-gray-500 hover:border-[#1B4332]/30'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#1B4332] text-[10px] font-black uppercase tracking-wider mb-1.5">
              {t.dobLabel}
            </label>
            <div className="flex gap-2">
              <select
                value={dob ? dob.split('-')[2] : '01'}
                onChange={(e) => {
                  const parts = (dob || '2000-01-01').split('-');
                  setDob(`${parts[0]}-${parts[1]}-${e.target.value}`);
                }}
                className="flex-1 h-11 px-2.5 rounded-xl bg-white border border-[#E2ECE9] text-gray-800 font-semibold text-xs cursor-pointer"
              >
                {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                  <option key={d} value={d}>{t.dayPrefix}{parseInt(d, 10)}</option>
                ))}
              </select>
              <select
                value={dob ? dob.split('-')[1] : '01'}
                onChange={(e) => {
                  const parts = (dob || '2000-01-01').split('-');
                  setDob(`${parts[0]}-${e.target.value}-${parts[2]}`);
                }}
                className="flex-1 h-11 px-2.5 rounded-xl bg-white border border-[#E2ECE9] text-gray-800 font-semibold text-xs cursor-pointer"
              >
                {[
                  { num: '01', name: 'Jan' }, { num: '02', name: 'Feb' }, { num: '03', name: 'Mar' },
                  { num: '04', name: 'Apr' }, { num: '05', name: 'May' }, { num: '06', name: 'Jun' },
                  { num: '07', name: 'Jul' }, { num: '08', name: 'Aug' }, { num: '09', name: 'Sep' },
                  { num: '10', name: 'Oct' }, { num: '11', name: 'Nov' }, { num: '12', name: 'Dec' }
                ].map((m) => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
              <select
                value={dob ? dob.split('-')[0] : '2000'}
                onChange={(e) => {
                  const parts = (dob || '2000-01-01').split('-');
                  setDob(`${e.target.value}-${parts[1]}-${parts[2]}`);
                }}
                className="flex-1 h-11 px-2.5 rounded-xl bg-white border border-[#E2ECE9] text-gray-800 font-semibold text-xs cursor-pointer"
              >
                {Array.from({ length: 90 }, (_, i) => String(new Date().getFullYear() - i)).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <PrimaryButton
            id="auth-complete-profile-btn"
            onClick={handleDone}
            disabled={!name.trim()}
          >
            {t.beginBtn}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const OriginalAuthFlowScreen: React.FC<{ initialStep?: AuthStep }> = ({ initialStep = 'landing' }) => {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const { continueAsGuest } = useAuthStore();
  const language = useJourneyStore((s) => s.language);
  const t = authLocalized[language] || authLocalized.en;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-[#FDFBF7]">
      <AnimatedBackground />

      {step !== 'landing' && (
        <div className="relative z-10 flex justify-center space-x-1.5 pt-4 pb-0 flex-shrink-0">
          {(['phone', 'otp', 'profile'] as AuthStep[]).map((s, i) => {
            const stepIndex = ['phone', 'otp', 'profile'].indexOf(step);
            return (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= stepIndex ? 'bg-[#1B4332] w-5' : 'bg-[#E2ECE9] w-1.5'
                }`}
              />
            );
          })}
        </div>
      )}

      {step === 'landing' && (
        <LandingStep
          onSignIn={() => setStep('phone')}
          onGuest={() => continueAsGuest()}
          t={t}
        />
      )}
      {step === 'phone' && (
        <PhoneStep
          onBack={() => setStep('landing')}
          onOtpSent={() => setStep('otp')}
          t={t}
        />
      )}
      {step === 'otp' && (
        <OtpStep
          onBack={() => setStep('phone')}
          onVerified={() => setStep('profile')}
          t={t}
        />
      )}
      {step === 'profile' && (
        <ProfileStep onDone={() => {}} t={t} />
      )}

      <div className="relative z-10 pb-3 px-7 text-center flex-shrink-0">
        <p className="text-gray-300 text-[10px] font-semibold">
          {t.footer}
        </p>
      </div>
    </div>
  );
};

// ─── MAIN AUTH SCREEN ─────────────────────────────────────────────────────────

export const AuthScreen: React.FC<{ initialStep?: AuthStep }> = ({ initialStep = 'landing' }) => {
  const demoMode = useAuthStore((s) => s.demoMode);

  if (demoMode) {
    return <DemoUsernamePinScreen />;
  }
  return <OriginalAuthFlowScreen initialStep={initialStep} />;
};

export default AuthScreen;
