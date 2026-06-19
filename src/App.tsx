import React, { useState, useRef, useEffect } from 'react';
import { useJourneyStore } from './store/journeyStore';
import type { Message } from './store/journeyStore';
import { MessageBubble } from './components/chat/MessageBubble';
import { RecommendationCard } from './components/chat/RecommendationCard';
import { CrisisOverlay } from './components/chat/CrisisOverlay';
import { 
  Paperclip, 
  Mic, 
  ArrowUp, 
  Globe, 
  ChevronDown, 
  Shield,
  Heart,
  Moon,
  Sun,
  User,
  Leaf,
  Volume2,
  VolumeX,
  Copyright
} from 'lucide-react';
import logo from './assets/logo.jpg';
import { ambientSynth } from './services/ambientSynth';

const langNames: Record<string, string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिंदी'
};

export const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Music starts off by default
  const [reasoningMessage, setReasoningMessage] = useState<Message | null>(null);

  const threads = useJourneyStore((state) => state.threads);
  const activeThreadId = useJourneyStore((state) => state.activeThreadId);
  const language = useJourneyStore((state) => state.language);
  const isRecording = useJourneyStore((state) => state.isRecording);
  const recordingDuration = useJourneyStore((state) => state.recordingDuration);
  
  const sendMessage = useJourneyStore((state) => state.sendMessage);
  const setLanguage = useJourneyStore((state) => state.setLanguage);
  const setRecording = useJourneyStore((state) => state.setRecording);
  const tickRecordingDuration = useJourneyStore((state) => state.tickRecordingDuration);
  const createNewThread = useJourneyStore((state) => state.createNewThread);
  const switchThread = useJourneyStore((state) => state.switchThread);
  const deleteThread = useJourneyStore((state) => state.deleteThread);

  const activeThread = threads.find(t => t.id === activeThreadId) || null;
  const messages = activeThread?.messages || [];

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Scroll to top of dashboard when language or theme changes on the home screen
  useEffect(() => {
    if (messages.length === 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [language, isDarkMode, messages.length]);

  // Close language dropdown on clicking outside
  useEffect(() => {
    if (!isLangDropdownOpen) return;
    
    const handleDocumentClick = () => {
      setIsLangDropdownOpen(false);
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isLangDropdownOpen]);

  // Auto-scroll to bottom of chat when messages change (in active chat)
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Voice recording simulation timer
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = window.setInterval(() => {
        tickRecordingDuration();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  // Sync dark mode class to document element and body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle ambient music synth
  useEffect(() => {
    if (isMusicPlaying) {
      ambientSynth.start();
    } else {
      ambientSynth.stop();
    }
    return () => ambientSynth.stop();
  }, [isMusicPlaying]);

  // Start music on first user interaction if enabled
  useEffect(() => {
    const startOnInteraction = () => {
      if (isMusicPlaying) {
        ambientSynth.start();
      }
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };
    
    window.addEventListener('click', startOnInteraction);
    window.addEventListener('touchstart', startOnInteraction);
    
    return () => {
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };
  }, [isMusicPlaying]);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    if (!activeThreadId) {
      const newId = createNewThread(inputText, inputText);
      switchThread(newId);
    } else {
      sendMessage(inputText);
    }
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Microphone recording click handler
  const handleMicClick = () => {
    if (isRecording) {
      setRecording(false);
      sendMessage(language === 'ta' ? 'குரல் பதிவு அனுப்பப்பட்டது' : language === 'hi' ? 'ऑडियो वॉयस संदेश भेजा गया' : 'Audio voice message sent');
    } else {
      setRecording(true);
    }
  };

  // Localized general UI elements matching mockup visual context
  const uiText = {
    en: {
      greeting: "Hi, I'm Uga",
      tagline: 'Your companion for emotional well-being.',
      desc: 'Talk, share or ask anything. I\'m here to listen, support and guide you.',
      inputPlaceholder: 'How are you feeling today?',
      speakLang: 'I can speak in your language',
      suggestionTitle: 'You can talk to me about',
      safeSpace: 'This is your safe space. Everything you share is private and secure.',
      recording: 'Recording audio...',
      suggestion1: 'I feel stressed and overwhelmed',
      suggestion2: 'I need someone to talk to',
      suggestion3: 'I\'m having trouble sleeping',
      suggestion4: 'I want to understand my feelings better',
      suggestion5: 'I want to build self confidence',
      suggestion6: 'Something else on my mind'
    },
    ta: {
      greeting: 'வணக்கம், நான் உகா',
      tagline: 'உணர்ச்சி நல்வாழ்வுக்கான உங்கள் துணை.',
      desc: 'பேசுங்கள், பகிர்ந்து கொள்ளுங்கள் அல்லது கேளுங்கள். நான் கேட்க, ஆதரிக்க மற்றும் வழிநடத்த இங்கே இருக்கிறேன்.',
      inputPlaceholder: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
      speakLang: 'நான் உங்கள் மொழியில் பேச முடியும்',
      suggestionTitle: 'நீங்கள் என்னிடம் இதைப் பற்றி பேசலாம்',
      safeSpace: 'இது உங்கள் பாதுகாப்பான இடம். நீங்கள் பகிரும் அனைத்தும் தனிப்பட்டது மற்றும் பாதுகாப்பானது.',
      recording: 'குரல் பதிவு செய்யப்படுகிறது...',
      suggestion1: 'நான் மன அழுத்தத்திலும் சோர்விலும் இருக்கிறேன்',
      suggestion2: 'எனக்கு பேச யாராவது தேவை',
      suggestion3: 'எனக்கு தூங்குவதில் பிரச்சனை உள்ளது',
      suggestion4: 'என் உணர்வுகளை நன்றாக புரிந்து கொள்ள விரும்புகிறேன்',
      suggestion5: 'சுயநம்பிக்கையை வளர்க்க விரும்புகிறேன்',
      suggestion6: 'என் மனதில் வேறு ஏதோ இருக்கிறது'
    },
    hi: {
      greeting: 'नमस्ते, मैं उगा हूँ',
      tagline: 'भावनात्मक कल्याण के लिए आपका साथी।',
      desc: 'बात करें, साझा करें या कुछ भी पूछें। मैं यहाँ सुनने, सहयोग करने और आपका मार्गदर्शन करने के लिए हूँ।',
      inputPlaceholder: 'आज आप कैसा महसूस कर रहे हैं?',
      speakLang: 'मैं आपकी भाषा में बात कर सकता हूँ',
      suggestionTitle: 'आप मुझसे इस बारे में बात कर सकते हैं',
      safeSpace: 'यह आपका सुरक्षित स्थान है। आप जो कुछ भी साझा करते हैं वह निजी और सुरक्षित है।',
      recording: 'ऑडियो रिकॉर्ड किया जा रहा है...',
      suggestion1: 'मैं तनाव और अत्यधिक बोझ महसूस कर रहा हूँ',
      suggestion2: 'मुझे किसी से बात करने की आवश्यकता है',
      suggestion3: 'मुझे सोने में परेशानी हो रही है',
      suggestion4: 'मैं अपनी भावनाओं को बेहतर ढंग से समझना चाहता हूँ',
      suggestion5: 'मैं अपना आत्मविश्वास बढ़ाना चाहता हूँ',
      suggestion6: 'मेरे दिमाग में कुछ और चल रहा है'
    }
  };

  const localizedUi = uiText[language];

  // Helper to format recording timer
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Quick suggestion card click handler
  const handleSuggestionClick = (suggestionText: string) => {
    if (!activeThreadId) {
      const newId = createNewThread(suggestionText, suggestionText);
      switchThread(newId);
    } else {
      sendMessage(suggestionText);
    }
  };

  const languageChips = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'pa', label: 'ਪੰਜਾਬി' }
  ];

  return (
    <div className="relative flex flex-col h-screen w-full max-w-md mx-auto shadow-2xl overflow-hidden transition-colors duration-300 bg-[#FDFBF7] dark:bg-gray-950 text-gray-850 dark:text-gray-150">
      {/* 1. SAFETY OVERLAY INTERCEPTOR */}
      {activeThread?.systemAction === 'SAFETY_BREAKOUT_CRISIS' && (
        <CrisisOverlay />
      )}

      {/* Top Header - Rendered only on active chat screen */}
      {messages.length > 0 && (
        <header className="glass-panel sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Brand Logo & Name (Clickable to return Home/Dashboard) */}
          <div 
            onClick={() => switchThread(null)}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition active:scale-[0.98]"
            title="Return to Home"
          >
            <img src={logo} alt="UGA Logo" className="w-8 h-8 rounded-xl object-cover border border-uga-sage/40 dark:border-gray-800" />
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="text-xs font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">UGA</h1>
              </div>
              <p className="text-[7.5px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-none">Healing Intelligence</p>
            </div>
          </div>

          {/* Dropdown Language Selector & Theme Toggle */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsMusicPlaying(!isMusicPlaying);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-uga-forest dark:text-emerald-400"
              title={isMusicPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
            >
              {isMusicPlaying ? <Volume2 size={15} className="animate-pulse" /> : <VolumeX size={15} />}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsDarkMode(!isDarkMode);
                setIsLangDropdownOpen(false);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-uga-forest"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Scoped relative container to prevent overlapping sibling buttons */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm transition active:scale-95"
              >
                <Globe size={12} className="text-uga-forest dark:text-emerald-400" />
                <span>{langNames[language]}</span>
                <ChevronDown size={10} />
              </button>

              {/* Language Dropdown List */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-9 w-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  {Object.entries(langNames).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage(code as 'en' | 'ta' | 'hi');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs text-left font-semibold hover:bg-uga-sageLight dark:hover:bg-gray-800 ${
                        language === code ? 'text-uga-forest dark:text-emerald-400 bg-uga-sageLight/60 dark:bg-gray-800/60' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Single Page View Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar bg-[#FDFBF7] dark:bg-gray-950 transition-colors duration-300"
        >
          {messages.length === 0 ? (
            /* Mockup Landing View Layout */
            <div className="flex flex-col items-center text-center py-4 px-1">
              
              {/* Inline Landing Header (matching mockup align - replaces top header) */}
              <div className="w-full max-w-sm flex items-center justify-between mb-8 mt-2">
                <div className="flex items-center space-x-2">
                  <img src={logo} alt="UGA Logo" className="w-8 h-8 rounded-xl object-cover border border-uga-sage/40 dark:border-gray-800" />
                  <div className="text-left">
                    <h1 className="text-xs font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">UGA</h1>
                    <p className="text-[7.5px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-none">Healing Intelligence</p>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMusicPlaying(!isMusicPlaying);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-uga-forest dark:text-emerald-400"
                    title={isMusicPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
                  >
                    {isMusicPlaying ? <Volume2 size={15} className="animate-pulse" /> : <VolumeX size={15} />}
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDarkMode(!isDarkMode);
                      setIsLangDropdownOpen(false);
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-uga-forest dark:text-emerald-400"
                  >
                    {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                  </button>

                  {/* Scoped relative container to prevent overlapping sibling buttons */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLangDropdownOpen(!isLangDropdownOpen);
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm transition active:scale-95"
                    >
                      <Globe size={12} className="text-uga-forest dark:text-emerald-400" />
                      <span>{langNames[language]}</span>
                      <ChevronDown size={10} />
                    </button>

                    {isLangDropdownOpen && (
                      <div className="absolute right-0 top-9 w-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                        {Object.entries(langNames).map(([code, name]) => (
                          <button
                            key={code}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLanguage(code as 'en' | 'ta' | 'hi');
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs text-left font-semibold hover:bg-uga-sageLight dark:hover:bg-gray-800 ${
                              language === code ? 'text-uga-forest dark:text-emerald-400 bg-uga-sageLight/60 dark:bg-gray-800/60' : 'text-gray-600'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Plant Mascot (from mockup design) */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-uga-sage/30 dark:border-gray-800 overflow-hidden relative shadow-sm bg-white dark:bg-gray-900">
                <img src={logo} alt="UGA Mascot" className="w-full h-full object-cover" />
              </div>
              
              {/* Splash Title & Intro */}
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{localizedUi.greeting} 🌿</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1 max-w-[250px]">
                {localizedUi.tagline}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 max-w-[280px] leading-relaxed font-medium">
                {localizedUi.desc}
              </p>

              {/* Mockup Styled Input Card */}
              <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-3.5 shadow-md hover:shadow-lg transition-all duration-300 text-left my-4 relative">
                {isRecording ? (
                  /* Audio Recording state visualizer */
                  <div className="flex items-center justify-between py-5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-red-500 tracking-tight">{localizedUi.recording}</span>
                    </div>

                    <div className="flex items-end space-x-0.5 h-4">
                      <div className="w-0.5 bg-red-500 h-full mic-wave-1 rounded-full" />
                      <div className="w-0.5 bg-red-500 h-full mic-wave-2 rounded-full" />
                      <div className="w-0.5 bg-red-500 h-full mic-wave-3 rounded-full" />
                      <div className="w-0.5 bg-red-500 h-full mic-wave-4 rounded-full" />
                      <div className="w-0.5 bg-red-500 h-full mic-wave-5 rounded-full" />
                    </div>

                    <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {formatDuration(recordingDuration)}
                    </span>
                  </div>
                ) : (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder={localizedUi.inputPlaceholder}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-800 dark:text-gray-100 resize-none"
                  />
                )}

                {/* Input Controls row inside card */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center space-x-3.5 text-gray-400">
                    <button 
                      onClick={() => alert('Media upload simulation initiated.')}
                      className="p-1 hover:text-uga-forest transition"
                    >
                      <Paperclip size={18} />
                    </button>
                    
                    <button 
                      onClick={handleMicClick}
                      className={`p-1 rounded-lg transition ${
                        isRecording ? 'text-red-500 bg-red-50' : 'hover:text-uga-forest'
                      }`}
                    >
                      <Mic size={18} />
                    </button>
                  </div>

                  {!isRecording && (
                    <button
                      onClick={handleSend}
                      disabled={inputText.trim() === ''}
                      className={`p-2 rounded-full transition-all ${
                        inputText.trim() === ''
                          ? 'bg-gray-100 text-gray-300'
                          : 'bg-[#1B4332] text-white hover:bg-uga-forestLight active:scale-95 shadow-sm'
                      }`}
                    >
                      <ArrowUp size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>

              {/* Language Selector Chips Card */}
              <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-sm text-center mb-4 relative">
                <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  {localizedUi.speakLang}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                  {languageChips.map((chip) => {
                    const isActive = chip.code === language;
                    return (
                      <button
                        key={chip.code}
                        onClick={() => {
                          if (['en', 'ta', 'hi'].includes(chip.code)) {
                            setLanguage(chip.code as any);
                          } else {
                            alert(`Language "${chip.label}" is supported in our production pipeline! Selected for demo simulation.`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          isActive
                            ? 'bg-uga-sageLight dark:bg-uga-forestLight border-uga-forest dark:border-emerald-400 text-uga-forest dark:text-white font-bold shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => alert('12+ Indian languages supported including Kannada, Marathi, Gujarati, Punjabi, Bengali, Telugu, and Hindi.')}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-uga-forest dark:text-emerald-400 font-bold"
                  >
                    +2 more
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 font-bold">12+ Indian languages supported</p>
              </div>

              {/* Conversation Prompts Grid */}
              <div className="w-full max-w-sm text-left mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-uga-forestLight dark:text-emerald-400 opacity-85 px-1 block mb-2.5">
                  {localizedUi.suggestionTitle}
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { text: localizedUi.suggestion1, icon: <Leaf size={14} className="text-uga-forest dark:text-emerald-400" /> },
                    { text: localizedUi.suggestion2, icon: <Heart size={14} className="text-red-500" /> },
                    { text: localizedUi.suggestion3, icon: <Moon size={14} className="text-indigo-600 dark:text-indigo-400" /> },
                    { text: localizedUi.suggestion4, icon: <User size={14} className="text-uga-forest dark:text-emerald-400" /> }
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item.text)}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm flex flex-col items-start gap-1.5 h-auto transition active:scale-[0.99] hover:border-uga-sageDark dark:hover:border-gray-700"
                    >
                      <div className="p-1 bg-uga-sageLight dark:bg-gray-800 rounded-lg self-start">
                        {item.icon}
                      </div>
                      <span className="leading-snug">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Previous Conversations Section (Card below prompts grid) */}
              {threads.length > 0 && (
                <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 shadow-sm text-left mb-4 relative">
                  <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    {language === 'ta' ? 'முந்தைய உரையாடல்கள்' : language === 'hi' ? 'पिछली बातचीत' : 'Previous Conversations'}
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar text-left">
                    {threads.map((thread) => {
                      const lastMessage = thread.messages[thread.messages.length - 1];
                      const snippet = lastMessage ? lastMessage.text : 'Empty conversation';
                      return (
                        <div 
                          key={thread.id}
                          className="flex items-center justify-between bg-[#FDFBF7] dark:bg-gray-800/40 rounded-xl p-2.5 hover:bg-[#FAF6EE] dark:hover:bg-gray-800/80 transition"
                        >
                          <div 
                            onClick={() => switchThread(thread.id)}
                            className="flex-1 min-w-0 cursor-pointer pr-3"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-[11px] font-black text-gray-800 dark:text-gray-100 truncate">{thread.title}</h4>
                              <span className="text-[7.5px] font-bold text-gray-400 dark:text-gray-500 uppercase flex-shrink-0">{thread.lastUpdated}</span>
                            </div>
                            <p className="text-[9.5px] font-semibold text-gray-500 dark:text-gray-400 truncate leading-snug">
                              {snippet}
                            </p>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(language === 'ta' ? 'இந்த உரையாடலை நீக்க வேண்டுமா?' : language === 'hi' ? 'क्या आप इस बातचीत को हटाना चाहते हैं?' : 'Are you sure you want to delete this conversation?')) {
                                deleteThread(thread.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition active:scale-95 flex-shrink-0"
                            title="Delete Conversation"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Safety Footer Card */}
              <div className="mt-2 mb-2 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl max-w-sm flex items-start space-x-3 text-left shadow-[0_2px_8px_-3px_rgba(16,185,129,0.08)] dark:shadow-none">
                <div className="p-1.5 bg-emerald-100/70 dark:bg-emerald-900/40 rounded-xl flex-shrink-0">
                  <Shield size={15} className="text-uga-forest dark:text-emerald-400" />
                </div>
                <span className="text-[10px] text-emerald-800/90 dark:text-emerald-300/85 leading-relaxed font-bold">
                  {localizedUi.safeSpace}
                </span>
              </div>

              {/* Copyright Footer */}
              <div className="flex items-center justify-center space-x-1 text-[9.5px] font-black tracking-wider text-gray-400 dark:text-gray-600 mt-2.5 mb-4 uppercase">
                <Copyright size={10} strokeWidth={2.5} />
                <span>Uga 2026</span>
              </div>

            </div>
          ) : (
            /* Conversational thread layout */
            <div className="pb-24">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <MessageBubble message={msg} onShowReasoning={setReasoningMessage} />
                  {msg.recommendations && msg.recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Chat Input bar at the bottom when in conversation mode */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDFBF7] dark:from-gray-950 via-[#FDFBF7]/95 dark:via-gray-950/95 to-transparent z-35">
            <div className="glass-panel rounded-2xl p-3 flex items-center justify-between border border-uga-sageDark dark:border-gray-800 shadow-lg">
              
              <button 
                onClick={() => alert('Media upload simulation initiated.')}
                className="p-1.5 text-gray-400 hover:text-uga-forest dark:hover:text-emerald-400 rounded-xl transition active:scale-95"
              >
                <Paperclip size={18} />
              </button>

              {isRecording ? (
                <div className="flex-1 px-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-red-500 tracking-tight">{localizedUi.recording}</span>
                  </div>
                  <div className="flex items-end space-x-0.5 h-3">
                    <div className="w-0.5 bg-red-500 h-full mic-wave-1 rounded-full" />
                    <div className="w-0.5 bg-red-500 h-full mic-wave-2 rounded-full" />
                    <div className="w-0.5 bg-red-500 h-full mic-wave-3 rounded-full" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                    {formatDuration(recordingDuration)}
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={localizedUi.inputPlaceholder}
                  className="flex-1 bg-transparent px-3 py-1 text-xs font-medium focus:outline-none placeholder-gray-400 text-gray-800 dark:text-gray-100"
                />
              )}

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleMicClick}
                  className={`p-2 rounded-xl transition-all duration-350 ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-uga-forest dark:hover:text-emerald-400'
                  }`}
                >
                  <Mic size={18} />
                </button>

                {!isRecording && (
                  <button
                    onClick={handleSend}
                    disabled={inputText.trim() === ''}
                    className={`p-2 rounded-full transition ${
                      inputText.trim() === ''
                        ? 'text-gray-300 dark:text-gray-600 bg-transparent'
                        : 'bg-uga-forest dark:bg-emerald-600 text-white hover:bg-uga-forestLight dark:hover:bg-emerald-500'
                    }`}
                  >
                    <ArrowUp size={16} strokeWidth={3} />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 2. REASONING BOTTOM DRAWER / SHEET */}
      {reasoningMessage && reasoningMessage.extractedStateSnapshot && (
        <div className="absolute inset-0 bg-black/45 z-50 flex flex-col justify-end transition-opacity duration-300">
          {/* Clickable Backdrop to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setReasoningMessage(null)} />
          
          {/* Drawer content */}
          <div className="bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto w-full p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
            {/* Grab bar */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest text-uga-forest">Response Reasoning</h3>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">UGA Healing Engine Pipeline Flow</p>
              </div>
              <button 
                onClick={() => setReasoningMessage(null)}
                className="p-1 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Pipeline Step 1: Experience Extraction */}
            <div className="mb-4 flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-uga-sageLight border border-uga-sage text-[10px] font-bold text-uga-forest flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1">Step 1: Experience Extraction</h4>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] font-semibold text-gray-500 mr-1.5 self-center">Themes:</span>
                    {reasoningMessage.extractedStateSnapshot.themes.length > 0 ? (
                      reasoningMessage.extractedStateSnapshot.themes.map((theme, i) => (
                        <span key={i} className="text-[9px] bg-uga-sageLight text-uga-forest px-2 py-0.5 rounded-full font-bold">#{theme}</span>
                      ))
                    ) : (
                      <span className="text-[9px] text-gray-400">General Inquiry</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[9px] font-semibold text-gray-500 mr-1.5 self-center">Needs:</span>
                    {reasoningMessage.extractedStateSnapshot.needs.length > 0 ? (
                      reasoningMessage.extractedStateSnapshot.needs.map((need, i) => (
                        <span key={i} className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-amber-100">Need: {need}</span>
                      ))
                    ) : (
                      <span className="text-[9px] text-gray-400">None identified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Step 2: Journey Recognition */}
            <div className="mb-4 flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-uga-sageLight border border-uga-sage text-[10px] font-bold text-uga-forest flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1">Step 2: Journey Recognition</h4>
                <div className="text-[10px] font-semibold text-uga-forest bg-uga-sageLight/60 p-2 rounded-xl border border-uga-sage/30 inline-block">
                  Mapped Journey: <span className="font-bold">{reasoningMessage.extractedStateSnapshot.journey}</span> ({reasoningMessage.extractedStateSnapshot.stage})
                </div>
              </div>
            </div>

            {/* Pipeline Step 3: Healing Lens Activation */}
            <div className="mb-4 flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-uga-sageLight border border-uga-sage text-[10px] font-bold text-uga-forest flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1">Step 3: Healing Lens Activation</h4>
                <div className="text-[10px] font-bold text-gray-700">
                  {reasoningMessage.extractedStateSnapshot.journey.includes('Grief') && 'Meaning Lens (Jnana Yoga) activated'}
                  {reasoningMessage.extractedStateSnapshot.journey.includes('Burnout') && 'Awareness Lens (Raja Yoga) activated'}
                  {reasoningMessage.extractedStateSnapshot.journey.includes('Caregiver') && 'Compassion Lens (Bhakti Yoga) activated'}
                  {!reasoningMessage.extractedStateSnapshot.journey.includes('Grief') && !reasoningMessage.extractedStateSnapshot.journey.includes('Burnout') && !reasoningMessage.extractedStateSnapshot.journey.includes('Caregiver') && 'General Compassion Lens activated'}
                </div>
              </div>
            </div>

            {/* Pipeline Step 4: Knowledge Retrieval */}
            <div className="mb-4 flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-uga-sageLight border border-uga-sage text-[10px] font-bold text-uga-forest flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1">Step 4: Knowledge Retrieval</h4>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-gray-600 leading-relaxed font-semibold">
                    <span className="text-gray-400">Wisdom Corpus:</span> Viktor Frankl, Ramana Maharshi, Jnana Yoga
                  </div>
                  <div className="text-[10px] text-gray-600 leading-relaxed font-semibold">
                    <span className="text-gray-400">Science Corpus:</span> Cognitive Behavioral Therapy (CBT), Positive Psychology
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Step 5: Support recommendations */}
            <div className="mb-2 flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-uga-sageLight border border-uga-sage text-[10px] font-bold text-uga-forest flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
              <div className="flex-1">
                <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1">Step 5: Support recommendations</h4>
                <div className="space-y-1">
                  {reasoningMessage.recommendations && reasoningMessage.recommendations.length > 0 ? (
                    reasoningMessage.recommendations.map((rec, i) => (
                      <div key={i} className="text-[10px] text-gray-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-uga-forest" />
                        <span>{rec.title} ({rec.payload.name})</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-500 font-semibold italic">No recommendations triggered in this response node.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default App;
