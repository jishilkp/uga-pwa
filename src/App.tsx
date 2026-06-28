import React, { useState, useRef, useEffect } from 'react';
import { useJourneyStore } from './store/journeyStore';
import type { Message } from './store/journeyStore';
import { MessageBubble } from './components/chat/MessageBubble';
import { RecommendationCard } from './components/chat/RecommendationCard';
import { CrisisOverlay } from './components/chat/CrisisOverlay';
import { GuestUpgradeBanner } from './components/auth/GuestUpgradeBanner';
import { GuestLimitModal } from './components/auth/GuestLimitModal';
import { ProfileSheet } from './components/auth/ProfileSheet';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAuthStore } from './store/authStore';
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
import serene_healing_hero from './assets/serene_healing_hero.png';
import wisdom_science_fusion from './assets/wisdom_science_fusion.png';
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
    question: "Where am I on this path?",
    reality: "They start to identify triggers, naming their patterns of distress and patterns of coping.",
    role: "Provide a framework for self-location on a universal human journey.",
    example: "A caregiver realizing they are in burnout phase rather than just tired.",
    response: "Let's map your daily stressors. Recognizing where you are on the burnout spectrum is the first step toward reclaiming energy.",
    principle: "Others offer immediate treatment. UGA offers dynamic navigation mapping.",
    support: ["UGA Stage Mapping", "Stress & Coping Inventories", "Reflection Guides"]
  },
  {
    number: 3,
    name: "Navigation",
    question: "How do I move forward?",
    reality: "Ready to choose paths but overwhelmed by disjointed choices or medical bureaucracy.",
    role: "Act as a clean, connective companion linking science, wisdom, and lived experience.",
    example: "A college student choosing between therapeutic modalities, exercise, and peer support.",
    response: "Based on your goals, here are three pathways: cognitive reframing (CBT), somatic grounding (yoga), and local peer groups.",
    principle: "Others prescribe single answers. UGA orchestrates holistic pathways.",
    support: ["Therapeutic Navigation", "Integrative Pathways", "Resource Directories"]
  },
  {
    number: 4,
    name: "Healing",
    question: "How do I integrate this pain?",
    reality: "Deep processing, emotional integration, somatic release, and spiritual search.",
    role: "Utilize Healing Lenses (Jnana, Bhakti, Karma, Raja Yogas) to tailor the inner growth journey.",
    example: "A parent navigating complex grief after the loss of a child.",
    response: "We will hold space for this grief. Through Bhakti (emotional integration) and Raja (mindfulness), we can gently carry this weight.",
    principle: "Others seek quick symptom suppression. UGA seeks deep integration and growth.",
    support: ["Healing Lenses Modules", "Somatic Grounding", "Contemplative Practices"]
  },
  {
    number: 5,
    name: "Connection",
    question: "Who is with me?",
    reality: "Re-engaging with family, friends, and small-group support systems.",
    role: "Re-anchor the individual in their immediate relational ecosystems.",
    example: "A veteran struggling to talk to their spouse about combat stress.",
    response: "Communicating vulnerability is a practice. Let's draft a simple message to share how you're feeling without overwhelm.",
    principle: "Others treat the individual in isolation. UGA anchors them in connection.",
    support: ["Relational Guidance", "Communication Tools", "Family Bridge Sessions"]
  },
  {
    number: 6,
    name: "Belonging",
    question: "Who else understands this?",
    reality: "Accelerated healing through shared identity, mutual validation, and collective wisdom.",
    role: "Nurture communities and peer support systems sharing lived experience.",
    example: "A new mother seeking validation of postpartum anxiety from other mothers.",
    response: "You are not alone in this. I can connect you to peer groups of new mothers who share these identical worries.",
    principle: "Others offer group therapy. UGA fosters deep communal belonging.",
    support: ["Peer Support Networks", "Lived Experience Circles", "Shared Story Archives"]
  },
  {
    number: 7,
    name: "Meaning & Contribution",
    question: "How do I use this to serve others?",
    reality: "Transforming personal struggle into active wisdom and service for the community.",
    role: "Guide the shift from being helped to helping; creating purpose from pain.",
    example: "A person in recovery wanting to mentor others starting their journey.",
    response: "Your lived experience is extremely valuable. Let's explore peer mentorship training and community contribution pathways.",
    principle: "Others end care at symptom relief. UGA guides transition to active service.",
    support: ["Mentorship Training", "Community Volunteering", "Purpose Activation"]
  },
  {
    number: 8,
    name: "Flourishing",
    question: "What am I capable of becoming?",
    reality: "Self-actualization, creative expression, spiritual alignment, and vibrant health.",
    role: "Support growth phases, creative contribution, and leadership development.",
    example: "A healthy individual asks: 'How can I live a more meaningful life?'",
    response: "Designs a customized journey involving learning, purpose coaching, volunteering, and contemplative practice.",
    principle: "Others help people survive. UGA helps people flourish.",
    support: ["Mentorship & Volunteering", "Creative leadership", "Purpose coaching", "Contemplative retreats"]
  }
];

const FadeInSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.15 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Music starts off by default
  const [reasoningMessage, setReasoningMessage] = useState<Message | null>(null);
  const [activeScrollSection, setActiveScrollSection] = useState<'overview' | 'problem' | 'architecture' | 'stages' | 'trust'>('overview');
  const [activeJourneyStage, setActiveJourneyStage] = useState<number>(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Auth state
  const { user, isGuest, isAuthenticated, logout } = useAuthStore();
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);

  const webScrollContainerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const architectureRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isMobileDevice) return;

    const handleScroll = () => {
      const scrollContainer = webScrollContainerRef.current;
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      
      const sections = [
        { id: 'overview', ref: overviewRef },
        { id: 'problem', ref: problemRef },
        { id: 'architecture', ref: architectureRef },
        { id: 'stages', ref: stagesRef },
        { id: 'trust', ref: trustRef }
      ];

      let currentSection = 'overview';
      for (const section of sections) {
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollTop >= offsetTop - containerHeight / 3) {
            currentSection = section.id;
          }
        }
      }
      setActiveScrollSection(currentSection as any);
    };

    const scrollContainer = webScrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileDevice]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const threads = useJourneyStore((state) => state.threads);
  const activeThreadId = useJourneyStore((state) => state.activeThreadId);
  const language = useJourneyStore((state) => state.language);
  const isRecording = useJourneyStore((state) => state.isRecording);
  const recordingDuration = useJourneyStore((state) => state.recordingDuration);
  
  const sendMessage = useJourneyStore((state) => state.sendMessage);
  const sendAudioMessage = useJourneyStore((state) => state.sendAudioMessage);
  const sendMediaMessage = useJourneyStore((state) => state.sendMediaMessage);
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingDurationRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll to bottom of chat when messages change (in active chat) with layout compensation for images
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      };
      scrollToBottom();
      const timer1 = setTimeout(scrollToBottom, 60);
      const timer2 = setTimeout(scrollToBottom, 300);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [messages]);

  // Voice recording duration timer
  useEffect(() => {
    if (isRecording) {
      recordingDurationRef.current = 0;
      intervalRef.current = window.setInterval(() => {
        tickRecordingDuration();
        recordingDurationRef.current += 1;
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

// Sync dark mode removed to keep website independent

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

  // Microphone recording click handler with real MediaRecorder audio capture and HTTPS checks
  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
    } else {
      try {
        if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          alert('Microphone permission requires HTTPS on mobile devices. Please open the app using an HTTPS link (e.g. via Vercel or localtunnel) to trigger the microphone permission dialog.');
          return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Microphone access is not supported by your mobile browser in this environment.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')) 
          ? 'audio/webm' 
          : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')) 
          ? 'audio/mp4' 
          : '';
        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());

          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            const duration = recordingDurationRef.current || 3;
            sendAudioMessage(base64Audio, duration);
          };
        };

        mediaRecorder.start(200);
        setRecording(true);
      } catch (err) {
        console.error('Microphone recording error:', err);
        alert('Could not access microphone. Please check your mobile browser settings to ensure microphone permission is allowed for this website.');
      }
    }
  };

  // Media attachment click and file selection handlers
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const url = reader.result as string;
      let type: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const sizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      sendMediaMessage({
        name: file.name,
        type,
        url,
        size: sizeFormatted
      });
    };
    e.target.value = '';
  };

  // Localized general UI elements matching mockup visual context
  const uiText = {
    en: {
      title: "UGA",
      healingIntelligence: "Healing\nIntelligence",
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
      title: "உகா",
      healingIntelligence: "ஹீலிங்\nஇன்டெலிஜென்ஸ்",
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
      title: "उगा",
      healingIntelligence: "हीलिंग इंटेलिजेंस",
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
    { code: 'hi', label: 'हिंदी' }
  ];

  // Profile icon button shared between both header locations
  const ProfileIconButton = () => {
    if (!user) return null;
    return (
      <button
        id="profile-icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsProfileSheetOpen(true);
        }}
        title="Profile"
        className="flex items-center justify-center p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm"
          style={{ backgroundColor: user.avatarColor }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-[#FDFBF7] text-gray-855 transition-colors duration-300">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />


      {/* Left Column: Brand Marketing Content (visible only on desktop) */}
      {!isMobileDevice && (
        <div ref={webScrollContainerRef} className="hidden lg:flex lg:flex-col lg:flex-1 h-screen overflow-y-auto bg-[#FDFBF7] dark:bg-gray-955 transition-colors duration-300 relative">
          
          {/* Sticky Header inside Left Column */}
          <div className="sticky top-0 bg-[#FDFBF7]/90 dark:bg-gray-955/90 backdrop-blur-md z-50 px-8 py-3 xl:px-10 xl:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3 text-left">
              <img src={logo} alt="UGA Healing Intelligence Logo" className="w-10 h-10 xl:w-11 xl:h-11 rounded-full object-cover border border-[#1B4332]/20 dark:border-gray-800 dark:brightness-110" />
              <div>
                <h1 className="text-sm xl:text-base font-black uppercase tracking-wider text-[#1B4332] dark:text-emerald-400 leading-tight">UGA</h1>
                <p className="text-[8px] xl:text-[9.5px] font-bold tracking-widest text-gray-400 dark:text-gray-555 uppercase leading-none mt-0.5">Healing Intelligence</p>
              </div>
            </div>
            
            {/* Header Navigation */}
            <div className="flex space-x-1 bg-[#F2EFE6] dark:bg-gray-800/80 p-1 rounded-full text-[10px] xl:text-[11px] font-black uppercase tracking-wider">
              {[
                { id: 'overview', label: 'Overview', ref: overviewRef },
                { id: 'problem', label: 'Problem', ref: problemRef },
                { id: 'architecture', label: 'Architecture', ref: architectureRef },
                { id: 'stages', label: 'Journey', ref: stagesRef },
                { id: 'trust', label: 'Trust & Safety', ref: trustRef }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.ref)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeScrollSection === tab.id
                      ? 'bg-[#1B4332] dark:bg-emerald-800 text-white shadow-[0_4px_12px_rgba(27,67,50,0.15)] dark:shadow-none'
                      : 'text-gray-555 dark:text-gray-400 hover:text-[#1B4332] dark:hover:text-emerald-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Web Scrollable Content */}
          <div className="px-8 pt-4 pb-12 xl:px-10 xl:pt-6 xl:pb-16 space-y-12 text-left max-w-4xl">
            
            {/* Section 1: Overview */}
            <div ref={overviewRef} id="overview" className="scroll-mt-24 space-y-8">
              <FadeInSection className="space-y-6">
                <h2 className="text-3xl xl:text-4xl font-extrabold text-[#1B4332] dark:text-emerald-400 leading-tight font-display">
                  A Companion for the Soul,<br />Not a Chatbot.
                </h2>
                <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  UGA is not a simple question-and-answer interface. It functions as the connective tissue—a gentle, intelligent companion—linking sacred ancient wisdom, clinical science, and active human community to guide individuals on a personalized path of growth and recovery.
                </p>
              </FadeInSection>

              <FadeInSection className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-855 aspect-[16/9] group">
                <img 
                  src={serene_healing_hero} 
                  alt="UGA Healing Hero Path" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent flex items-end p-6">
                  <p className="text-white text-xs xl:text-sm font-semibold tracking-wide backdrop-blur-sm bg-black/20 px-3 py-2 rounded-xl border border-white/10">
                    "Healing is not a destination, but a path carved through wisdom and connection."
                  </p>
                </div>
              </FadeInSection>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  { title: "Universal Wisdom", desc: "Rooted in the four paths of Yoga—Jnana, Bhakti, Karma, Raja—along with humanistic psychology and world traditions.", icon: "🌱" },
                  { title: "Modern Science", desc: "Backed by neuroscience, clinical guidance, cognitive behavioral frameworks, and somatic regulation principles.", icon: "🔬" },
                  { title: "Human Community", desc: "No digital isolation. UGA prioritizes warm referrals to peers, local circles, and human specialists.", icon: "👥" }
                ].map((pillar, idx) => (
                  <FadeInSection key={idx} className="glassmorphic-card p-6 rounded-2xl border border-gray-150/60 dark:border-gray-800 space-y-3">
                    <span className="text-2xl">{pillar.icon}</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B4332] dark:text-emerald-400">{pillar.title}</h3>
                    <p className="text-xs text-gray-555 dark:text-gray-400 font-semibold leading-relaxed">{pillar.desc}</p>
                  </FadeInSection>
                ))}
              </div>
            </div>

            {/* Section 2: The Problem */}
            <div ref={problemRef} id="problem" className="scroll-mt-24 space-y-8 pt-4">
              <FadeInSection className="space-y-4">
                <h2 className="text-2xl xl:text-3xl font-extrabold text-[#1B4332] dark:text-emerald-400">
                  The Crisis of Fragmented Care
                </h2>
                <p className="text-xs xl:text-sm text-gray-555 dark:text-gray-455 leading-relaxed font-semibold">
                  Today's mental health support structure is broken into isolated systems. People get stuck in transactional loops that fail to address the core human struggle.
                </p>
              </FadeInSection>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Clinical Silos", desc: "Clinical systems focus on diagnosing pathologies and symptom management, often separating the pain from the individual's life narrative.", icon: "🏥" },
                  { title: "Retentive Digital Apps", desc: "Commercial self-care applications use algorithms to maximize screen time, isolating users in loops rather than guiding them outward.", icon: "📱" },
                  { title: "Social Disconnection", desc: "The erosion of civic support networks leaves individuals without access to shared lived experience and active community integration.", icon: "🤝" }
                ].map((silo, idx) => (
                  <FadeInSection key={idx} className="glassmorphic-card p-6 rounded-2xl border border-gray-150/60 dark:border-gray-800 space-y-3">
                    <span className="text-xl">{silo.icon}</span>
                    <h3 className="text-xs font-black uppercase text-gray-700 dark:text-gray-305 tracking-wider">{silo.title}</h3>
                    <p className="text-[11px] text-gray-555 dark:text-gray-455 font-semibold leading-relaxed">{silo.desc}</p>
                  </FadeInSection>
                ))}
              </div>

              {/* The Bridge */}
              <FadeInSection className="bg-[#1B4332]/5 dark:bg-emerald-955/10 border border-[#1B4332]/10 dark:border-emerald-900/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="text-3xl">🌉</div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-[#1B4332] dark:text-emerald-400 tracking-wider">UGA is the Integrative Bridge</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                    By harmonizing wisdom, science, and community, UGA provides continuous accompaniment. It assists users when they are waiting for professional treatment, and helps them integrate learnings afterward.
                  </p>
                </div>
              </FadeInSection>
            </div>

            {/* Section 3: The 5-Layer Architecture */}
            <div ref={architectureRef} id="architecture" className="scroll-mt-24 space-y-8 pt-4">
              <FadeInSection className="space-y-4">
                <h2 className="text-2xl xl:text-3xl font-extrabold text-[#1B4332] dark:text-emerald-400">
                  The 5-Layer Healing Engine
                </h2>
                <p className="text-xs xl:text-sm text-gray-555 dark:text-gray-455 leading-relaxed font-semibold">
                  A high-fidelity framework designed to listen, understand, retrieve, contextualize, and orchestrate support without clinical assumptions.
                </p>
              </FadeInSection>

              {/* Illustration and layers grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  {[
                    { num: "1", title: "Experience Extraction", desc: "Identifies core needs, current stressors, and emotional transitions through empathetic listening, bypassing superficial labels." },
                    { num: "2", title: "Journey Recognition", desc: "Recognizes the user's current life stage (e.g. grief, transition, caregiving) to map an appropriate, respectful rhythm." },
                    { num: "3", title: "Healing Lenses", desc: "Adapts guidance using the four major paths: Jnana (intellect), Bhakti (emotion), Karma (service), and Raja (mind-body)." },
                    { num: "4", title: "Knowledge Retrieval", desc: "Queries secure databases for clinically-approved wisdom, peer story archives, and physical community directories." },
                    { num: "5", title: "Pathway Generation", desc: "Co-creates a structured, holistic action plan combining somatic practices, community circles, and clinician referrals." }
                  ].map((layer, idx) => (
                    <FadeInSection key={idx} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#1B4332] dark:bg-emerald-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                        {layer.num}
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="text-xs font-bold text-gray-855 dark:text-gray-200 uppercase tracking-wider">{layer.title}</h4>
                        <p className="text-[11px] text-gray-555 dark:text-gray-455 font-semibold leading-relaxed">{layer.desc}</p>
                      </div>
                    </FadeInSection>
                  ))}
                </div>

                <FadeInSection className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-150 dark:border-gray-855 aspect-square">
                  <img 
                    src={wisdom_science_fusion} 
                    alt="UGA Wisdom Science Fusion Diagram" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/70 via-black/10 to-transparent flex items-end p-6">
                    <p className="text-white text-[10px] xl:text-xs font-bold tracking-wide leading-relaxed">
                      "Integrating sacred geometry (wisdom pathways) with data structures (neuroscientific frameworks)."
                    </p>
                  </div>
                </FadeInSection>
              </div>
            </div>

            {/* Section 4: The 8-Stage Journey Timeline */}
            <div ref={stagesRef} id="stages" className="scroll-mt-24 space-y-8 pt-4">
              <FadeInSection className="space-y-4">
                <h2 className="text-2xl xl:text-3xl font-extrabold text-[#1B4332] dark:text-emerald-400">
                  The Journey Map to Flourishing
                </h2>
                <p className="text-xs xl:text-sm text-gray-555 dark:text-gray-455 leading-relaxed font-semibold">
                  Healing is a process of growth. UGA structures pathways along eight distinct, developmental milestones, shifting focus from "symptom management" to "creative contribution".
                </p>
              </FadeInSection>

              {/* Vertical timeline */}
              <div className="relative pl-12 space-y-8 mt-10">
                <div className="timeline-line"></div>
                
                {journeyStages.map((stage, index) => {
                  const isActive = activeJourneyStage === index;
                  return (
                    <FadeInSection 
                      key={stage.number} 
                      className={`relative cursor-pointer transition-all duration-300 ${
                        isActive ? 'scale-[1.01]' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Interactive dot */}
                      <div 
                        onClick={() => setActiveJourneyStage(index)}
                        className={`absolute -left-[42px] top-1.5 w-6 h-6 rounded-full border-2 border-[#1B4332] bg-[#FDFBF7] dark:bg-gray-900 flex items-center justify-center text-[10px] font-black z-10 timeline-dot ${
                          isActive ? 'active' : ''
                        }`}
                      >
                        {stage.number}
                      </div>

                      {/* Timeline Card */}
                      <div 
                        onClick={() => setActiveJourneyStage(index)}
                        className={`glassmorphic-card p-6 rounded-2xl border text-left transition-all ${
                          isActive 
                            ? 'border-[#1B4332]/40 bg-[#1B4332]/5 dark:bg-emerald-955/10 shadow-[0_10px_30px_rgba(27,67,50,0.06)]' 
                            : 'border-gray-150/60 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-black uppercase text-[#1B4332] dark:text-emerald-455 tracking-widest block mb-0.5">Stage {stage.number}</span>
                            <h3 className="text-sm font-bold text-gray-855 dark:text-gray-200">{stage.name}</h3>
                          </div>
                          <span className="text-xs italic text-gray-400 dark:text-gray-555 font-bold">"${stage.question}"</span>
                        </div>

                        {isActive && (
                          <div className="mt-4 pt-4 border-t border-gray-155 dark:border-gray-855 space-y-4 text-xs animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block">Life Reality</span>
                                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">{stage.reality}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block">Companion Role</span>
                                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">{stage.role}</p>
                              </div>
                            </div>

                            <div className="p-3 bg-[#F2EFE6]/50 dark:bg-gray-800/40 rounded-xl space-y-1 border border-[#1B4332]/10">
                              <span className="text-[8px] font-black uppercase text-gray-555 tracking-wider block">Empathetic Response Example</span>
                              <p className="text-[11px] italic text-[#1B4332] dark:text-emerald-355 font-bold leading-relaxed">"${stage.response}"</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="text-[8px] font-black uppercase text-gray-405 tracking-wider">Ecosystem Actions:</span>
                              {stage.support.map((sup, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#1B4332]/10 dark:bg-emerald-955 text-[#1B4332] dark:text-emerald-455 border border-[#1B4332]/10 dark:border-emerald-900/20">
                                  {sup}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FadeInSection>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Trust & Safety */}
            <div ref={trustRef} id="trust" className="scroll-mt-24 space-y-8 pt-4 pb-12">
              <FadeInSection className="space-y-4">
                <h2 className="text-2xl xl:text-3xl font-extrabold text-[#1B4332] dark:text-emerald-400">
                  Trust, Safety & Governance
                </h2>
                <p className="text-xs xl:text-sm text-gray-555 dark:text-gray-455 leading-relaxed font-semibold">
                  Because human healing is sacred, UGA implements a checks-and-balances model that ensures strict limits on automated logic.
                </p>
              </FadeInSection>

              {/* Three Councils */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Clinical Advisory Board", desc: "Oversees diagnostic parameters, sets clinical safety guardrails, and signs off on crisis referral protocols.", icon: "🛡️" },
                  { title: "Wisdom Council", desc: "Comprised of philosophers, spiritual practitioners, and experts in contemplative traditions to protect practice purity.", icon: "🕯️" },
                  { title: "Lived Experience Council", desc: "Ensures the application design, language patterns, and pathways are centered on real, compassionate human stories.", icon: "🤝" }
                ].map((council, idx) => (
                  <FadeInSection key={idx} className="glassmorphic-card p-6 rounded-2xl border border-gray-150/60 dark:border-gray-800 space-y-3">
                    <span className="text-xl">{council.icon}</span>
                    <h3 className="text-xs font-bold uppercase text-gray-855 dark:text-gray-205 tracking-wider">{council.title}</h3>
                    <p className="text-[11px] text-gray-555 dark:text-gray-400 font-semibold leading-relaxed">{council.desc}</p>
                  </FadeInSection>
                ))}
              </div>

              {/* Crisis exclusions / emergency protocol */}
              <FadeInSection className="bg-red-50/50 dark:bg-red-955/15 border border-red-100/55 dark:border-red-900/20 rounded-2xl p-6 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-red-655 dark:text-red-400 tracking-wider">Emergency Boundaries (Crisis Exclusions)</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-555 font-bold uppercase mt-0.5">Automated Exit Protocols</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-305 font-semibold leading-relaxed">
                  UGA maintains clear, deterministic boundaries. When a conversation exhibits acute clinical markers—such as active self-harm ideation, intent, or severe psychiatric crisis—UGA immediately initiates the following protocol:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-red-100/30 dark:border-red-950/20 flex gap-3">
                    <span className="text-red-550">✕</span>
                    <span>De-escalates automated conversational logic immediately.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-red-100/30 dark:border-red-950/20 flex gap-3">
                    <span className="text-red-550">✓</span>
                    <span>Provides direct, clickable, local crisis support helplines.</span>
                  </div>
                </div>
              </FadeInSection>

              {/* Copyright / Footer */}
              <FadeInSection className="pt-8 border-t border-gray-150 dark:border-gray-855 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-555 font-bold uppercase tracking-wider">
                <div className="flex items-center space-x-1.5">
                  <Copyright className="w-3.5 h-3.5" />
                  <span>{new Date().getFullYear()} UGA Healing Intelligence</span>
                </div>
                <span>All paths lead to flourishing</span>
              </FadeInSection>
            </div>

          </div>
        </div>
      )}{/* Right Column: Interactive PWA App Container with realistic Phone Bezel Mockup */}
      <div className={`flex-shrink-0 flex flex-col relative z-40 bg-transparent lg:sticky lg:top-0 lg:h-screen ${
        isMobileDevice 
          ? 'w-full h-full p-0' 
          : 'w-full h-full lg:w-[413px] xl:w-[413px] items-center justify-center p-0 lg:p-6'
      }`}>
        
        {/* Phone Mockup Frame wrapper on desktop, transparent behaves normally on mobile */}
        <div className={`relative flex flex-col ${isDarkMode ? 'dark' : ''} ${
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

        {/* AUTH OVERLAY — covers only the app column, website is unaffected */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-[100] overflow-hidden">
            <AuthScreen />
          </div>
        )}

        {/* PROFILE SHEET — scoped to app column only */}
        {isProfileSheetOpen && (
          <ProfileSheet
            onClose={() => setIsProfileSheetOpen(false)}
            onSignUp={() => {
              setIsProfileSheetOpen(false);
              logout();
            }}
          />
        )}

        {/* GUEST LIMIT MODAL — scoped to app column only */}
        {isGuestLimitModalOpen && (
          <GuestLimitModal
            onClose={() => setIsGuestLimitModalOpen(false)}
            onSignUp={() => {
              setIsGuestLimitModalOpen(false);
              logout();
            }}
          />
        )}

        {/* 1. SAFETY OVERLAY INTERCEPTOR */}
        {activeThread?.systemAction === 'SAFETY_BREAKOUT_CRISIS' && (
          <CrisisOverlay />
        )}


      {/* Top Header - Rendered only on active chat screen */}
      {messages.length > 0 && (
        <header className="glass-panel sticky top-0 z-40 w-full px-2 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Brand Logo & Name (Clickable to return Home/Dashboard) */}
          <div 
            onClick={() => switchThread(null)}
            className="flex items-center space-x-1.5 flex-shrink-0 cursor-pointer hover:opacity-85 transition active:scale-[0.98] -ml-0.5"
            title="Return to Home"
          >
            <img src={logo} alt="UGA Healing Intelligence" className="w-8.5 h-8.5 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 dark:brightness-110 flex-shrink-0" />
            <div className="text-left flex-shrink-0">
              <h1 className="text-[12.5px] font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">{localizedUi.title}</h1>
              <p className="text-[8px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase leading-[1.05] mt-0.5 whitespace-pre-line">{localizedUi.healingIntelligence}</p>
            </div>
          </div>

          {/* Dropdown Language Selector & Theme Toggle */}
          <div className="flex items-center space-x-1 flex-shrink-0">
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
                className="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-sm transition active:scale-95"
              >
                <Globe size={11} className="text-uga-forest dark:text-emerald-400" />
                <span>{langNames[language]}</span>
                <ChevronDown size={9} />
              </button>

              {/* Language Dropdown List */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 top-8 w-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-[100] overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
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
            <ProfileIconButton />
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
              <div className="w-full flex items-center justify-between mb-6 mt-1 px-0 relative z-30">
                <div className="flex items-center space-x-1.5 flex-shrink-0 -ml-0.5">
                  <img src={logo} alt="UGA Healing Intelligence" className="w-8.5 h-8.5 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 dark:brightness-110 flex-shrink-0" />
                  <div className="text-left flex-shrink-0">
                    <h1 className="text-[12.5px] font-black uppercase tracking-wider text-uga-forest dark:text-emerald-400 leading-tight">{localizedUi.title}</h1>
                    <p className="text-[8px] font-bold tracking-wider text-gray-400 dark:text-gray-555 uppercase leading-[1.05] mt-0.5 whitespace-pre-line">{localizedUi.healingIntelligence}</p>
                  </div>
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0">
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
                      className="flex items-center space-x-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-sm transition active:scale-95"
                    >
                      <Globe size={11} className="text-uga-forest dark:text-emerald-400" />
                      <span>{langNames[language]}</span>
                      <ChevronDown size={9} />
                    </button>

                    {isLangDropdownOpen && (
                      <div className="absolute right-0 top-8 w-28 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl z-[100] overflow-hidden divide-y divide-gray-50 dark:divide-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  <ProfileIconButton />
                </div>
              </div>

              {/* Guest Upgrade Banner */}
              {isGuest && (
                <GuestUpgradeBanner
                  onSignUp={() => logout()}
                />
              )}

              {/* UGA Brand Logo */}
              <img src={logo} alt="UGA Healing Intelligence" className="w-16 h-16 rounded-full object-cover border border-uga-sage/40 dark:border-gray-800 mb-4 dark:brightness-110" />
              
              {/* Splash Title & Intro */}
              <h2 className="text-[27px] font-black text-gray-900 dark:text-white tracking-tight">{localizedUi.greeting} 🌿</h2>
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 font-bold mt-1 max-w-[270px]">
                {localizedUi.tagline}
              </p>
              <p className="text-[12.5px] text-gray-400 dark:text-gray-500 mt-2 max-w-[300px] leading-relaxed font-medium">
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
                    className="w-full bg-transparent text-[15px] font-medium focus:outline-none placeholder-gray-400 text-gray-800 dark:text-gray-100 resize-none"
                  />
                )}

                {/* Input Controls row inside card */}
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center space-x-3.5 text-gray-400">
                    <button 
                      onClick={handleAttachmentClick}
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
              <div className="w-full max-w-sm bg-[#FDFBF7] dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 px-3 shadow-sm text-center mb-3 relative flex flex-col items-center justify-center">
                <p className="text-[10.5px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {localizedUi.speakLang}
                </p>
                <div className="flex justify-center gap-1.5 w-full mb-1.5">
                  {languageChips.map((chip) => {
                    const isActive = chip.code === language;
                    return (
                      <button
                        key={chip.code}
                        onClick={() => setLanguage(chip.code as any)}
                        className={`flex-1 py-1 px-2 rounded-lg text-[13px] font-semibold border transition-all ${
                          isActive
                            ? 'bg-uga-sageLight dark:bg-uga-forestLight border-uga-forest dark:border-emerald-400 text-uga-forest dark:text-white font-bold shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9.5px] text-gray-400 dark:text-gray-555 font-semibold tracking-wide">
                  We're bringing support for 12+ Indian Languages
                </p>
              </div>

              {/* Conversation Prompts Grid */}
              <div className="w-full max-w-sm text-left mb-4">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-uga-forestLight dark:text-emerald-400 opacity-85 px-1 block mb-2.5">
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
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-2.5 text-left text-[13px] font-bold text-gray-700 dark:text-gray-200 shadow-sm flex flex-col items-start gap-1.5 h-auto transition active:scale-[0.99] hover:border-uga-sageDark dark:hover:border-gray-700"
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
                  <p className="text-[11.5px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
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
                              <h4 className="text-[12.5px] font-black text-gray-800 dark:text-gray-100 truncate">{thread.title}</h4>
                              <span className="text-[7.5px] font-bold text-gray-400 dark:text-gray-500 uppercase flex-shrink-0">{thread.lastUpdated}</span>
                            </div>
                            <p className="text-[10.5px] font-semibold text-gray-500 dark:text-gray-400 truncate leading-snug">
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
                <span className="text-[11.5px] text-emerald-800/90 dark:text-emerald-300/85 leading-relaxed font-bold">
                  {localizedUi.safeSpace}
                </span>
              </div>

              {/* Copyright Footer */}
              <div className="flex items-center justify-center space-x-1 text-[10.5px] font-black tracking-wider text-gray-400 dark:text-gray-600 mt-2.5 mb-4 uppercase">
                <Copyright size={10} strokeWidth={2.5} />
                <span>Uga 2026</span>
              </div>

            </div>
          ) : (
            /* Conversational thread layout */
            <div className="pb-3">
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

        {/* Clean Docked Chat Input bar at the bottom when in conversation mode */}
        {messages.length > 0 && (
          <div className="flex-shrink-0 bg-[#FDFBF7] dark:bg-gray-900 px-4 pb-3.5 pt-1.5 z-40">
            <div className="glass-panel rounded-2xl p-3 flex items-center justify-between border border-uga-sageDark dark:border-gray-800 shadow-lg">
              
              <button 
                onClick={handleAttachmentClick}
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
