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
import nature_path from './assets/nature_path.png';
import { ambientSynth } from './services/ambientSynth';

const langNames: Record<string, string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिंदी'
};

const journeyStages = [
  {
    number: 1,
    name: "Confusion",
    question: "What is happening to me?",
    reality: "Anxious, lost, burned out, lonely, stuck. They do not know what to call it.",
    role: "Help people understand and contextualize their experience. Avoid quick labeling.",
    example: "A successful executive feels empty: 'I have everything I wanted, but I feel empty.'",
    response: "This sounds less like failure and more like a question of meaning. Many people encounter this during major life transitions.",
    principle: "Others identify symptoms. UGA identifies journeys.",
    support: ["Therapists (enter much later)", "Hospitals (only after escalation)", "UGA context reflection"]
  },
  {
    number: 2,
    name: "Orientation",
    question: "Where am I on my journey?",
    reality: "People want reassurance, not instant diagnostics. They need life context.",
    role: "Ask 'What chapter of life are you in?' instead of 'What condition do you have?'",
    example: "A new mother says: 'I don't recognize myself anymore.'",
    response: "Explores caregiving stress, loss of autonomy, identity transition, and emotional exhaustion before jumping to pathology.",
    principle: "Others classify people. UGA contextualizes people.",
    support: ["Family & Caregivers", "Ecosystem support briefs", "Identity transition mapping"]
  },
  {
    number: 3,
    name: "Navigation",
    question: "What should I do next?",
    reality: "People don't need a five-year plan. They need the next immediate action step.",
    role: "Provide clear navigation and direction through reflection, rituals, and communities.",
    example: "Someone grieving a parent asks: 'How do I stop feeling this way?'",
    response: "Grief is not something to eliminate. Perhaps the next step is not recovery, but making space for the loss.",
    principle: "Others provide answers. UGA provides direction.",
    support: ["Reflection practices", "Loss rituals", "Peer support networks"]
  },
  {
    number: 4,
    name: "Healing",
    question: "How do I move through this?",
    reality: "Healing is rarely one intervention. It requires combining multiple modalities.",
    role: "Orchestrate diverse modalities (science, yogas, peer support, communities).",
    example: "A user recovering from burnout requires a composite, multi-layered path.",
    response: "Suggests Sleep restoration (Science), Breath practices (Raja Yoga), Identity reflection (Jnana Yoga), and a Burnout recovery circle (Community).",
    principle: "Others provide interventions. UGA builds healing pathways.",
    support: ["Sleep restoration (Science)", "Breathwork (Raja Yoga)", "Identity inquiry (Jnana Yoga)", "Burnout recovery circles"]
  },
  {
    number: 5,
    name: "Connection",
    question: "Who can help me?",
    reality: "No AI can replace human relationships. Apps shouldn't lock users inside.",
    role: "Intentionally route users outward to communities, facilitators, and experts.",
    example: "A user showing trauma indicators needs trusted human witnesses.",
    response: "Provides direct warm handoffs to local peer support circles, counselors, and NGO partners with user consent.",
    principle: "Others retain users. UGA connects users.",
    support: ["Therapists & Counselors", "NGO referrals", "Peer support circles", "Local resources"]
  },
  {
    number: 6,
    name: "Belonging",
    question: "Who else understands this?",
    reality: "Healing accelerates when people feel seen and share mutual experiences.",
    role: "Nurture communities and peer support systems rather than treating in isolation.",
    example: "Someone recovering from addiction seeks validation of shared struggles.",
    response: "Suggests Men's Transition circles, Grief Recovery groups, or recovery stories shared by lived-experience mentors.",
    principle: "Others treat individuals. UGA nurtures communities.",
    support: ["Peer groups", "Community circles", "Recovery story archives", "Lived experience mentors"]
  },
  {
    number: 7,
    name: "Flourishing",
    question: "What am I capable of becoming?",
    reality: "The highest human aspiration is not recovery; it is flourishing and contribution.",
    role: "Support growth phases, creative contribution, and leadership development.",
    example: "A healthy individual asks: 'How can I live a more meaningful life?'",
    response: "Designs a customized journey involving learning, purpose coaching, volunteering, and contemplative practice.",
    principle: "Others help people survive. UGA helps people flourish.",
    support: ["Mentorship & Volunteering", "Creative leadership", "Purpose coaching", "Contemplative retreats"]
  }
];

export const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Music starts off by default
  const [reasoningMessage, setReasoningMessage] = useState<Message | null>(null);
  const [activeWebTab, setActiveWebTab] = useState<'overview' | 'journey' | 'moat'>('overview');
  const [activeJourneyStage, setActiveJourneyStage] = useState<number>(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 1024;
      return isUA || isSmallScreen;
    };
    
    setIsMobileDevice(checkMobile());
    
    const handleResize = () => {
      setIsMobileDevice(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'pa', label: 'ਪੰਜਾਬി' }
  ];

  return (
    <div className={`w-screen h-screen flex flex-col lg:flex-row overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-[#FDFBF7] text-gray-850'
    }`}>
      
      {/* Left Column: Brand Marketing Content (visible only on desktop) */}
      {!isMobileDevice && (
        <div className="hidden lg:flex lg:flex-col lg:flex-1 h-screen overflow-hidden bg-[#FDFBF7] dark:bg-gray-900 transition-colors duration-300 relative px-8 py-6 xl:px-10 xl:py-8">
        
        {/* Brand Header & Tab Switcher */}
        <div className="flex items-center justify-between mb-5 xl:mb-6 border-b border-gray-150 dark:border-gray-800 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-3 text-left">
            <img src={logo} alt="UGA Healing Intelligence Logo" className="w-12 h-12 xl:w-14 xl:h-14 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 dark:brightness-110" />
            <div>
              <h1 className="text-sm xl:text-base font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">UGA</h1>
              <p className="text-[8px] xl:text-[9.5px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-none mt-0.5">Healing Intelligence</p>
            </div>
          </div>
          
          {/* Tab Selector */}
          <div className="flex bg-[#F2EFE6] dark:bg-gray-800/80 p-0.5 rounded-full text-[10px] font-black">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'journey', label: 'Journey Map' },
              { id: 'moat', label: 'Architecture' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveWebTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer uppercase tracking-wider ${
                  activeWebTab === tab.id
                    ? 'bg-[#1B4332] dark:bg-emerald-900/80 text-white shadow-[0_4px_12px_rgba(27,67,50,0.12)] dark:shadow-none'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-emerald-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Wrapper */}
        <div className="flex-1 min-h-0 flex flex-col justify-between">
          
          {activeWebTab === 'overview' && (
            <div className="flex-1 flex flex-col justify-between py-1">
              {/* Hero Bento Card (Spans full width, merges graphic + content side by side) */}
              <div className="relative w-full bg-white/70 dark:bg-gray-900/40 backdrop-blur-md rounded-[32px] border border-white/50 dark:border-gray-850/40 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-row items-stretch min-h-[290px] xl:min-h-[320px]">
                
                {/* Text Content Block */}
                <div className="flex-1 p-6 xl:p-8 flex flex-col justify-between text-left z-10 relative">
                  <div>
                    <span className="inline-block bg-[#E5ECE7] dark:bg-[#1E3B2F] text-[#1B4332] dark:text-[#A7D7C5] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-3">
                      Healing Intelligence
                    </span>
                    
                    <h2 className="text-3xl xl:text-4xl font-serif font-extrabold text-[#1B4332] dark:text-[#A7D7C5] tracking-tight leading-[1.1] mb-3">
                      Your Safe Space to Heal
                    </h2>

                    <p className="text-[11.5px] xl:text-[12.5px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed max-w-md">
                      Uga is a compassionate AI companion that listens without judgment. Built on the intersection of timeless wisdom, psychology, and neuroscience to guide you through life's transitions.
                    </p>

                    {/* Features Bullet Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-5 text-[9.5px] font-bold text-gray-700 dark:text-gray-200">
                      <div className="flex items-center space-x-2">
                        <Globe size={13} className="text-[#1B4332] dark:text-[#A7D7C5]" />
                        <span>Speak naturally in your tongue</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mic size={13} className="text-[#1B4332] dark:text-[#A7D7C5]" />
                        <span>Voice-guided or text chatting</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield size={13} className="text-[#1B4332] dark:text-[#A7D7C5]" />
                        <span>Private, encrypted &amp; secure</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart size={13} className="text-[#E63946]" fill="currentColor" />
                        <span>Always here for you, 24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger Action */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleSuggestionClick(language === 'ta' ? 'வணக்கம், உரையாடலைத் தொடங்குங்கள்' : language === 'hi' ? 'नमस्ते, बातचीत शुरू करें' : 'Hello, let\'s start a conversation')}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-[#1B4332] hover:bg-[#2A5E47] text-white text-[10px] font-black rounded-full shadow-md active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      <span>Start a Conversation</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>

                {/* Right Visual block with nature path asset */}
                <div className="w-[36%] xl:w-[40%] relative overflow-hidden flex-shrink-0">
                  <img src={nature_path} alt="Tranquil Path" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-white dark:from-[#111A24]/90 via-white/40 dark:via-[#111A24]/40 to-transparent w-[30%]" />
                </div>
              </div>

              {/* Lower Grid: Two Bento Columns */}
              <div className="grid grid-cols-2 gap-4 my-3">
                {/* Bento Card 1: Core Philosophy */}
                <div className="p-5 xl:p-6 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-[24px] border border-white/50 dark:border-gray-850/40 shadow-sm flex flex-col justify-between text-left min-h-[160px]">
                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block mb-1">Philosophy</span>
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">The Four Yogas</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mt-1.5">
                      Uga weaves Jnana (wisdom), Bhakti (devotion), Karma (action), and Raja (meditation) to provide custom pathways suited to your unique life chapter.
                    </p>
                  </div>
                  <span className="text-[8.5px] font-black text-[#5C8A67] dark:text-[#88C499] uppercase tracking-wider">Ancient wisdom</span>
                </div>

                {/* Bento Card 2: Scientific Moat */}
                <div className="p-5 xl:p-6 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-[24px] border border-white/50 dark:border-gray-850/40 shadow-sm flex flex-col justify-between text-left min-h-[160px]">
                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block mb-1">Science</span>
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">Modern Neuroscience</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mt-1.5">
                      Grounded in humanistic psychology, mindfulness practices, and modern cognitive behavioral science to provide safe, grounded guidance.
                    </p>
                  </div>
                  <span className="text-[8.5px] font-black text-[#5C8A67] dark:text-[#88C499] uppercase tracking-wider">Clinical Foundation</span>
                </div>
              </div>

              {/* Soothing Quote Banner (Slick glassmorphism at the bottom) */}
              <div className="p-4 bg-white/40 dark:bg-gray-900/30 rounded-2xl flex items-center justify-between border border-white/20 dark:border-gray-850/30 text-left">
                <div className="flex items-start space-x-3 z-10 flex-1">
                  <span className="text-3xl font-serif text-[#5C8A67] dark:text-[#6BB07E] leading-none select-none opacity-80 mt-0.5">&ldquo;</span>
                  <p className="text-[11.5px] font-serif font-bold text-gray-700 dark:text-gray-300 italic leading-relaxed pt-0.5">
                    You don't have to go through it alone. We walk with you.
                  </p>
                </div>
                <div className="flex-shrink-0 z-10 text-[#5C8A67]/25 dark:text-[#6BB07E]/25">
                  <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 52C24 48 38 32 44 14" />
                    <path d="M44 14C34 18 28 26 26 32" />
                    <path d="M38 24C30 26 24 34 22 40" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeWebTab === 'journey' && (
            <div className="flex-1 flex flex-col justify-between py-1 text-left">
              {/* Interactive Journey Timelines Stepper */}
              <div className="flex justify-between items-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 dark:border-gray-850/30 flex-shrink-0 mb-4 overflow-x-auto">
                {journeyStages.map((stage, idx) => {
                  const isActive = activeJourneyStage === idx;
                  return (
                    <button
                      key={stage.number}
                      onClick={() => setActiveJourneyStage(idx)}
                      className={`flex-1 min-w-[70px] py-2 px-1 rounded-xl text-center transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-[#1B4332] dark:bg-emerald-900/90 text-white font-black shadow-md scale-[1.02]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-emerald-400 text-[9px] font-extrabold'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider truncate">{stage.name}</div>
                      <div className="text-[7.5px] opacity-75 mt-0.5">Stage {stage.number}</div>
                    </button>
                  );
                })}
              </div>

              {/* Stage Details Bento Grid */}
              <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 bg-white/60 dark:bg-gray-900/45 backdrop-blur-md p-5 rounded-[28px] border border-white/50 dark:border-gray-850/40">
                {/* Column 1: Human Reality & Scenario */}
                <div className="space-y-4 border-r border-gray-100 dark:border-gray-800/80 pr-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block">Human Reality</span>
                    <h4 className="text-xs font-black text-gray-850 dark:text-gray-100 mt-1 italic leading-tight">
                      &ldquo;{journeyStages[activeJourneyStage].question}&rdquo;
                    </h4>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed mt-1.5">
                      {journeyStages[activeJourneyStage].reality}
                    </p>
                  </div>

                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block">Contextual Scenario</span>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mt-1">
                      <span className="font-extrabold text-gray-700 dark:text-gray-300">Case Example: </span>
                      {journeyStages[activeJourneyStage].example}
                    </p>
                  </div>

                  <div className="bg-[#FAF8F2] dark:bg-[#1E1E1C]/60 p-3 rounded-xl border border-[#EBE6D6] dark:border-gray-800/50 mt-1">
                    <span className="text-[8px] font-black uppercase text-[#1B4332] dark:text-emerald-400 tracking-widest block">UGA Adaptive Response</span>
                    <p className="text-[10px] text-uga-forest dark:text-[#88C499] font-bold leading-relaxed mt-1 italic">
                      &ldquo;{journeyStages[activeJourneyStage].response}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Column 2: Platform Strategy & Moat */}
                <div className="space-y-4 flex flex-col justify-between pl-2">
                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block">UGA's Orchestration Role</span>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed mt-1.5">
                      {journeyStages[activeJourneyStage].role}
                    </p>
                  </div>

                  <div>
                    <span className="text-[7.5px] font-black uppercase text-[#B18C5D] dark:text-[#D1A673] tracking-widest block">Support Modalities &amp; Outlets</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {journeyStages[activeJourneyStage].support.map((item, idx) => (
                        <span key={idx} className="bg-emerald-50/70 dark:bg-emerald-950/20 text-[#1B4332] dark:text-[#88C499] text-[8.5px] font-black px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-900/30">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-50/40 dark:bg-emerald-950/15 p-3 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 mt-auto">
                    <span className="text-[8px] font-black uppercase text-[#5C8A67] dark:text-[#6BB07E] tracking-widest block">Product Differentiation</span>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold leading-relaxed mt-1">
                      {journeyStages[activeJourneyStage].principle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeWebTab === 'moat' && (
            <div className="flex-1 flex flex-col justify-between py-1 text-left">
              {/* Architecture & Comparison Details */}
              <div className="flex-1 min-h-0 bg-white/60 dark:bg-gray-900/45 backdrop-blur-md p-5 rounded-[28px] border border-white/50 dark:border-gray-850/40 overflow-hidden flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-gray-850 dark:text-gray-100 uppercase tracking-widest mb-3 text-center">
                    The Healing Orchestration Layer vs Siloed Alternatives
                  </h4>
                  
                  {/* Comparison Grid Table */}
                  <div className="grid grid-cols-2 gap-2 text-[9.5px] font-black border-b border-gray-150 dark:border-gray-800 pb-2 mb-2">
                    <div className="text-[#B18C5D] dark:text-[#D1A673] uppercase tracking-wider">Traditional Mental Health Apps</div>
                    <div className="text-[#1B4332] dark:text-emerald-400 uppercase tracking-wider">UGA Healing Ecosystem</div>
                  </div>
                  
                  <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar text-[9.5px] font-bold">
                    {[
                      { trad: "Focuses on symptoms", uga: "Focuses on journeys" },
                      { trad: "Treats conditions in isolation", uga: "Understands the human experience" },
                      { trad: "Delivers immediate interventions", uga: "Orchestrates personalized healing pathways" },
                      { trad: "Operates in standalone silos", uga: "Connects wisdom, science, community & care" },
                      { trad: "Optimizes recovery metrics", uga: "Optimizes human flourishing" },
                      { trad: "Engages only at crisis points", uga: "Accompanies the entire journey" }
                    ].map((item, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2 py-0.5 border-b border-gray-50 dark:border-gray-850/20 text-gray-500 dark:text-gray-400">
                        <div>• {item.trad}</div>
                        <div className="text-[#1B4332] dark:text-[#88C499] font-black">• {item.uga}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Exclusions & Knowledge Foundation */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Exclusions */}
                  <div className="p-3 bg-red-50/20 dark:bg-red-950/10 rounded-xl border border-red-100/30 dark:border-red-900/20 text-left">
                    <span className="text-[7.5px] font-black uppercase text-red-600 dark:text-red-400 tracking-widest block mb-1">What UGA Will Never Do</span>
                    <ul className="space-y-0.5 text-[8.5px] text-gray-500 dark:text-gray-400 font-bold">
                      <li>• Diagnose clinical illnesses</li>
                      <li>• Prescribe medication</li>
                      <li>• Replace professional therapists</li>
                      <li>• Claim certainty where uncertainty exists</li>
                    </ul>
                  </div>

                  {/* Knowledge Moat */}
                  <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 text-left">
                    <span className="text-[7.5px] font-black uppercase text-[#1B4332] dark:text-emerald-400 tracking-widest block mb-1">Our Knowledge Base</span>
                    <p className="text-[8.5px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                      Combines <span className="font-extrabold text-gray-700 dark:text-gray-300">Four Yogas</span> (Jnana, Bhakti, Karma, Raja) with Global Wisdom, Humanistic psychology, and modern clinical Neuroscience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        </div>
      )}

      {/* Right Column: Interactive PWA App Container with realistic Phone Bezel Mockup */}
      <div className={`flex-shrink-0 flex flex-col relative z-40 bg-transparent ${
        isMobileDevice 
          ? 'w-full h-full p-0' 
          : 'w-full h-full lg:w-[413px] xl:w-[413px] items-center justify-center p-0 lg:p-6'
      }`}>
        
        {/* Phone Mockup Frame wrapper on desktop, transparent behaves normally on mobile */}
        <div className={`relative flex flex-col ${
          isMobileDevice 
            ? 'w-full h-full p-0 border-none rounded-none shadow-none bg-[#FDFBF7] dark:bg-gray-900'
            : 'w-[365px] h-[865px] max-h-[92vh] rounded-[48px] border-[12px] border-gray-900 dark:border-gray-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] bg-[#FDFBF7] dark:bg-gray-900 overflow-hidden'
        }`}>
          
          {/* Top Notch / Dynamic Island (visible only on desktop mockup bezel) */}
          {!isMobileDevice && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-gray-900 dark:bg-gray-800 rounded-full z-50">
              <div className="absolute right-4 top-1.5 w-1.5 h-1.5 bg-gray-800 dark:bg-gray-700 rounded-full" />
            </div>
          )}

          {/* Bottom iOS Swipe Home Bar Indicator (visible only on desktop mockup bezel) */}
          {!isMobileDevice && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full z-50 pointer-events-none" />
          )}

          {/* Inner PWA Container (behaves like viewport inside bezel) */}
          <div className={`flex-1 flex flex-col overflow-hidden relative ${
            isMobileDevice ? 'rounded-none' : 'rounded-[36px]'
          }`}>
        
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
            <img src={logo} alt="UGA Healing Intelligence" className="w-10 h-10 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 dark:brightness-110" />
            <div className="text-left">
              <h1 className="text-[11px] font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">UGA</h1>
              <p className="text-[7.5px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-none mt-0.5">Healing Intelligence</p>
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
          className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar bg-[#FDFBF7] dark:bg-gray-900 transition-colors duration-300"
        >
          {messages.length === 0 ? (
            /* Mockup Landing View Layout */
            <div className="flex flex-col items-center text-center py-4 px-1">
              
              {/* Inline Landing Header (matching mockup align - replaces top header) */}
              <div className="w-full max-w-sm flex items-center justify-between mb-8 mt-2">
                <div className="flex items-center space-x-2">
                  <img src={logo} alt="UGA Healing Intelligence" className="w-10 h-10 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 dark:brightness-110" />
                  <div className="text-left">
                    <h1 className="text-[11px] font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">UGA</h1>
                    <p className="text-[7.5px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase leading-none mt-0.5">Healing Intelligence</p>
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

              {/* UGA Brand Logo */}
              <img src={logo} alt="UGA Healing Intelligence" className="w-16 h-16 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 mb-4 dark:brightness-110" />
              
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
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
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
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#FDFBF7] dark:from-gray-900 via-[#FDFBF7]/95 dark:via-gray-900/95 to-transparent z-35">
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
          </div>
        </div>
      </div>
  );
};

export default App;
