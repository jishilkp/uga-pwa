export interface JourneyMetadata {
  currentJourney: string;
  currentStage: 'Confusion' | 'Orientation' | 'Healing' | 'Flourishing';
  extractedThemes: string[];
  unmetNeeds: string[];
  riskIndicators: string[];
}

export interface Recommendation {
  type: 'community' | 'practitioner' | 'institution';
  id: string;
  title: string;
  payload: {
    name: string;
    description: string;
    actionLabel: string;
    details?: string;
  };
}

export interface OrchestratorResult {
  textResponse: string;
  journeyMetadata: JourneyMetadata;
  recommendations: Recommendation[];
  systemAction: 'SAFETY_BREAKOUT_CRISIS' | null;
  activeLens: string;
  wisdomQuote?: {
    author: string;
    text: string;
    source: string;
  };
}

// Wisdom database matching the July 4 Demo Knowledge Architecture
const WISDOM_CORPUS = {
  meaning: [
    { author: 'Viktor Frankl', text: 'He who has a why to live for can bear almost any how.', source: 'Man\'s Search for Meaning' },
    { author: 'Ramana Maharshi', text: 'Asking "Who am I?" is the ultimate key to understanding your true nature.', source: 'Self-Enquiry' },
    { author: 'Jiddu Krishnamurti', text: 'The ability to observe without evaluating is the highest form of intelligence.', source: 'Freedom from the Known' }
  ],
  compassion: [
    { author: 'Rumi', text: 'The wound is the place where the Light enters you.', source: 'Masnavi' },
    { author: 'Kabir', text: 'The river that flows in you also flows in me.', source: 'Kabir Songs' },
    { author: 'Thich Nhat Hanh', text: 'Understanding is the heart of well-being, and compassion is its flower.', source: 'The Miracle of Mindfulness' }
  ],
  agency: [
    { author: 'Mahatma Gandhi', text: 'Strength does not come from physical capacity. It comes from an indomitable will.', source: 'Non-Violence in Peace & War' },
    { author: 'Nelson Mandela', text: 'It always seems impossible until it is done.', source: 'Long Walk to Freedom' },
    { author: 'Martin Luther King Jr.', text: 'If you can\'t fly then run, if you can\'t run then walk, if you can\'t walk then crawl...', source: 'Keep Moving' }
  ],
  awareness: [
    { author: 'Gautama Buddha', text: 'Quiet the mind and the soul will speak.', source: 'Dhammapada' },
    { author: 'Swami Vivekananda', text: 'All power is within you; you can do anything and everything.', source: 'Karma Yoga' },
    { author: 'Patanjali', text: 'Yoga is the cessation of the movements of the mind.', source: 'Yoga Sutras' }
  ]
};

export function getMockResponse(
  message: string,
  turnCount: number,
  language: 'en' | 'ta' | 'hi'
): OrchestratorResult {
  const cleanMsg = message.toLowerCase().trim();

  // 1. SAFETY INTERCEPTOR GUARDRAIL
  const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'crisis', 'hurt myself', 'want to die', 'தற்கொலை', 'आत्महत्या'];
  if (crisisKeywords.some(keyword => cleanMsg.includes(keyword))) {
    return {
      textResponse: language === 'ta' 
        ? 'பாதுகாப்பு எச்சரிக்கை: உங்கள் பாதுகாப்பே எங்களது முக்கிய குறிக்கோள். உடனடி உதவிக்கு கீழே உள்ள அவசர எண்களை தொடர்பு கொள்ளவும்.'
        : language === 'hi'
        ? 'सुरक्षा चेतावनी: आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है। कृपया सहायता के लिए तुरंत नीचे दिए गए हेल्पलाइन नंबरों पर संपर्क करें।'
        : 'Safety Alert: Your safety is our absolute priority. We want to support you. Please reach out to one of the crisis resources below immediately.',
      journeyMetadata: {
        currentJourney: 'Crisis Support',
        currentStage: 'Confusion',
        extractedThemes: ['Safety Crisis'],
        unmetNeeds: ['Immediate Safety', 'Crisis Intervention'],
        riskIndicators: ['High Distress', 'Harm Risk']
      },
      recommendations: [],
      systemAction: 'SAFETY_BREAKOUT_CRISIS',
      activeLens: 'Compassion'
    };
  }

  // 2. MEDICAL ADVICE GUARDRAIL (Should I stop taking my medication?)
  const medicationKeywords = ['medication', 'stop taking', 'pills', 'antidepressant', 'மாத்திரை', 'दवा'];
  if (medicationKeywords.some(keyword => cleanMsg.includes(keyword))) {
    return {
      textResponse: language === 'ta'
        ? 'UGA மருத்துவ ஆலோசனை வழங்காது. உங்கள் மருந்துகளை மாற்றுவதற்கு முன் உங்கள் மருத்துவரை அணுகவும். நாங்கள் உங்களுக்கு உதவ சில மருத்துவ ஆலோசனைகளை பரிந்துரைக்கிறோம்.'
        : language === 'hi'
        ? 'UGA चिकित्सा सलाह या दवा का नुस्खा नहीं देता है। अपनी दवाओं में कोई भी बदलाव करने से पहले कृपया अपने डॉक्टर से परामर्श लें।'
        : 'UGA does not diagnose or prescribe medication. We guide you, but do not replace clinical authority. Please do not change your medication dosages without consulting your prescribing doctor or psychiatrist.',
      journeyMetadata: {
        currentJourney: 'Recovery',
        currentStage: 'Orientation',
        extractedThemes: ['Medication Inquiry'],
        unmetNeeds: ['Professional Guidance'],
        riskIndicators: ['Clinical Question']
      },
      recommendations: [
        {
          type: 'practitioner',
          id: 'psychiatrist',
          title: language === 'ta' ? 'மனநல மருத்துவரை அணுகவும்' : language === 'hi' ? 'मनोचिकित्सक से परामर्श लें' : 'Consult a Psychiatrist',
          payload: {
            name: 'Dr. Anand Raman',
            description: language === 'ta' ? 'மருந்து மதிப்பாய்வு மற்றும் மருத்துவ ஆதரவு.' : language === 'hi' ? 'दवा की समीक्षा और चिकित्सकीय सहायता।' : 'Expert psychiatric review and medication management support.',
            actionLabel: language === 'ta' ? 'முன்பதிவு செய்' : language === 'hi' ? 'अपॉइंटमेंट लें' : 'Schedule Review'
          }
        }
      ],
      systemAction: null,
      activeLens: 'Agency'
    };
  }

  // 3. JOURNEY PATH DETECTIONS
  const isGrief = cleanMsg.includes('death') || cleanMsg.includes('loss') || cleanMsg.includes('died') || cleanMsg.includes('bereavement') || cleanMsg.includes('இறப்பு') || cleanMsg.includes('मौत') || cleanMsg.includes('मृत्यु');
  const isBurnout = cleanMsg.includes('burnout') || cleanMsg.includes('job') || cleanMsg.includes('work') || cleanMsg.includes('stress') || cleanMsg.includes('exhausted') || cleanMsg.includes('வேலை') || cleanMsg.includes('नौकरी') || cleanMsg.includes('काम');
  const isCaregiver = cleanMsg.includes('caregiver') || cleanMsg.includes('mother') || cleanMsg.includes('father') || cleanMsg.includes('spouse') || cleanMsg.includes('sick') || cleanMsg.includes('குடும்பம்') || cleanMsg.includes('बीमार');

  // Determine stage based on turn count
  let stage: 'Confusion' | 'Orientation' | 'Healing' | 'Flourishing' = 'Confusion';
  if (turnCount === 1) stage = 'Orientation';
  else if (turnCount === 2) stage = 'Healing';
  else if (turnCount >= 3) stage = 'Flourishing';

  // Build journey responses
  if (isGrief) {
    const responses = {
      en: {
        Confusion: 'I hear your pain. Grief is a heavy storm, and it is natural to feel disoriented and isolated. Let\'s sit with this feeling without rushing to fix it.',
        Orientation: 'You are navigating the Orientation stage of your grief journey. Understanding that grief isn\'t a problem to be solved, but a space to be held, helps. What memories offer comfort today?',
        Healing: 'As you step into the Healing stage, we explore active steps. A small daily reflection practice or connecting with others who walk similar paths can act as a container for this weight.',
        Flourishing: 'In Flourishing, your relationship with loss transforms. Many find meaning in community leadership or sharing their story. How does it feel to think about supporting others now?'
      },
      ta: {
        Confusion: 'உங்கள் வலியை நான் உணர்கிறேன். இழப்பு என்பது ஒரு பெரிய புயல், இந்த நேரத்தில் குழப்பமாகவும் தனியாகவும் உணர்வது இயல்பானது. இதை சரிசெய்ய அவசரப்படாமல் மெதுவாக கடப்போம்.',
        Orientation: 'நீங்கள் உங்கள் துயரப் பயணத்தின் வழிகாட்டுதல் (Orientation) கட்டத்தில் இருக்கிறீர்கள். இழப்பு என்பது உடனடியாக தீர்க்கக்கூடிய பிரச்சனை அல்ல என்பதை உணர்வோம். எந்த நினைவுகள் உங்களுக்கு ஆறுதல் அளிக்கின்றன?',
        Healing: 'குணமடைதல் (Healing) கட்டத்தில், நாம் சில முயற்சிகளை மேற்கொள்ளலாம். ஒரு எளிய தினசரி குறிப்பேடு எழுதுதல் அல்லது ஒத்த பாதையில் பயணிக்கும் நண்பர்களுடன் இணைவது வலியை குறைக்கும்.',
        Flourishing: 'மலர்ச்சி (Flourishing) கட்டத்தில், உங்கள் துயரம் ஒரு புதிய பொருளாக மாறுகிறது. மற்றவர்களுக்கு உதவுவதில் அல்லது உங்கள் அனுபவங்களை பகிர்வதில் நீங்கள் அமைதி காணலாம். இப்போது எப்படி உணர்கிறீர்கள்?'
      },
      hi: {
        Confusion: 'मैं आपके दर्द को महसूस कर सकता हूँ। प्रियजन को खोना एक बड़ा आघात है, और इस समय अकेला महसूस करना स्वाभाविक है। हम जल्दबाजी किए बिना इस भावना के साथ ठहरेंगे।',
        Orientation: 'आप अपने दुख के दूसरे चरण (Orientation) में हैं। आपके पिता की कौन सी यादें आज आपको दिलासा देती हैं?',
        Healing: 'ठीक होने (Healing) के चरण में, हम कुछ सक्रिय कदम उठा सकते हैं। प्रतिदिन थोड़ा विचार-विमर्श करना या दूसरों से जुड़ना सहायक हो सकता है।',
        Flourishing: 'समृद्ध होने (Flourishing) के चरण में, दूसरों की मदद करने या अपने अनुभवों को साझा करने में आप शांति पा सकते हैं। अब कैसा महसूस हो रहा है?'
      }
    };

    const quote = WISDOM_CORPUS.meaning[turnCount % 3];

    return {
      textResponse: responses[language][stage],
      journeyMetadata: {
        currentJourney: 'Grief Journey',
        currentStage: stage,
        extractedThemes: ['Bereavement', 'Isolation', 'Father\'s Death'],
        unmetNeeds: ['Connection', 'Meaningful Reflection'],
        riskIndicators: stage === 'Confusion' ? ['Sleep Deterioration'] : []
      },
      recommendations: stage === 'Orientation' ? [
        {
          type: 'community',
          id: 'grief_circle',
          title: language === 'ta' ? 'துயரப் பகிர்வு வட்டத்தில் இணையுங்கள்' : language === 'hi' ? 'दुख साझा करने वाले समूह से जुड़ें' : 'Join local Grief Circle',
          payload: {
            name: 'Auroville Healing Circle',
            description: language === 'ta' ? 'ஒத்த உணர்வுள்ளவர்களுடன் பாதுகாப்பாக பேசுங்கள்.' : language === 'hi' ? 'समान अनुभव से गुजर रहे लोगों के साथ सुरक्षित रूप से बात करें।' : 'A safe, non-judgmental space to share and listen with others navigating bereavement.',
            actionLabel: language === 'ta' ? 'இணைந்திடு' : language === 'hi' ? 'शामिल हों' : 'Join Circle'
          }
        }
      ] : stage === 'Healing' ? [
        {
          type: 'practitioner',
          id: 'grief_therapist',
          title: 'Consult Grief Therapist',
          payload: {
            name: 'Dr. Sarah Verghese',
            description: 'Specialized counseling in trauma and parental loss.',
            actionLabel: 'Connect Therapist'
          }
        }
      ] : [],
      systemAction: null,
      activeLens: 'Meaning Lens (Jnana Yoga)',
      wisdomQuote: quote
    };
  }

  if (isBurnout) {
    const responses = {
      en: {
        Confusion: 'It sounds like you are carrying an overwhelming load. Burnout makes us feel disconnected from our own body and purpose. Let\'s pause and take a breath.',
        Orientation: 'In this Orientation stage, we identify the main exhaustions. Is it work pressure, lack of boundaries, or a deeper purpose crisis? Recognizing this is the first step.',
        Healing: 'For Healing, we prioritize rest and boundary setting. Implementing sleep hygiene or starting a daily short nature walk can begin restoring your physical energy.',
        Flourishing: 'Flourishing means redesigning your relationship with work. How can you align your daily activities with what truly gives you meaning and joy?'
      },
      ta: {
        Confusion: 'நீங்கள் மிகவும் சோர்வாக உணர்கிறீர்கள் என்று தெரிகிறது. சோர்வு நம்மை நம் உடலிலிருந்தும் குறிக்கோளிலிருந்தும் பிரிக்கிறது. சற்று நிறுத்தி மூச்சை உள்ளிழுப்போம்.',
        Orientation: 'இந்த கட்டத்தில் நாம் சோர்வுக்கான முக்கிய காரணங்களை கண்டறிவோம். இது வேலை அழுத்தமா அல்லது எல்லையற்ற உழைப்பா? இதை அறிவதே முதல் படி.',
        Healing: 'குணமடைதலுக்கு ஓய்வும் எல்லைகளும் முக்கியம். முறையான தூக்கம் அல்லது மாலை நேர நடைப்பயிற்சி உங்கள் ஆற்றலை மீண்டும் கொண்டு வர உதவும்.',
        Flourishing: 'வேலையுடனான உங்கள் உறவை மறுவடிவமைப்பு செய்வதே மலர்ச்சி. உங்கள் தினசரி செயல்பாடுகளை உங்களுக்கு மகிழ்ச்சி தரும் விஷயங்களுடன் எவ்வாறு இணைப்பது?'
      },
      hi: {
        Confusion: 'ऐसा लग रहा है कि आप अत्यधिक बोझ उठा रहे हैं। थकान हमें अपने शरीर और उद्देश्य से दूर कर देती है। थोड़ा रुकें और सांस लें।',
        Orientation: 'इस चरण में हम थकान के मुख्य कारणों की पहचान करते हैं। क्या यह काम का दबाव है या सीमाओं की कमी?',
        Healing: 'ठीक होने के लिए आराम और सीमाएं तय करना आवश्यक है। पर्याप्त नींद और रोज़ाना थोड़ी सैर ऊर्जा बहाल करने में मदद करेगी।',
        Flourishing: 'समृद्ध होने का अर्थ है काम के साथ अपने संबंध को फिर से संवारना। अपनी दैनिक गतिविधियों को उस काम के साथ जोड़ें जो आपको खुशी देता है।'
      }
    };

    const quote = WISDOM_CORPUS.awareness[turnCount % 3];

    return {
      textResponse: responses[language][stage],
      journeyMetadata: {
        currentJourney: 'Burnout Journey',
        currentStage: stage,
        extractedThemes: ['Work Stress', 'Exhaustion', 'Autonomy Loss'],
        unmetNeeds: ['Rest', 'Autonomy', 'Emotional Safety'],
        riskIndicators: ['Social Withdrawal']
      },
      recommendations: stage === 'Orientation' ? [
        {
          type: 'community',
          id: 'burnout_group',
          title: 'Join Men\'s Transition Group',
          payload: {
            name: 'Ecosystem Purpose Circle',
            description: 'A weekly peer circle discussing life shifts, career stress, and mindful actions.',
            actionLabel: 'Join Group'
          }
        }
      ] : [],
      systemAction: null,
      activeLens: 'Awareness Lens (Raja Yoga)',
      wisdomQuote: quote
    };
  }

  if (isCaregiver) {
    const responses = {
      en: {
        Confusion: 'Caring for a loved one is a beautiful but deeply exhausting path. It is common to feel guilt for feeling tired. I am here to support you.',
        Orientation: 'As a caregiver, your needs are often placed last. Let\'s orient ourselves around your own health. How much sleep and self-care have you been able to secure?',
        Healing: 'For Healing, we must orchestrate support. Can we set up a caregiver support brief to help your family/friends step in to give you a rest?',
        Flourishing: 'You are learning to care for another without losing yourself. This balance is flourishing. How can we sustain these self-care boundaries?'
      },
      ta: {
        Confusion: 'மற்றவர்களை கவனிப்பது ஒரு சிறந்த செயல், ஆனால் அது உங்களை சோர்வடையச் செய்யலாம். சோர்வாக உணர்வதற்காக குற்ற உணர்ச்சி கொள்ளத் தேவையில்லை. நான் உங்களுடன் இருக்கிறேன்.',
        Orientation: 'ஒரு பராமரிப்பாளராக, உங்கள் சொந்த தேவைகளை நீங்கள் புறக்கணிக்கலாம். உங்கள் ஆரோக்கியத்தில் கவனம் செலுத்துவோம். நீங்கள் போதுமான அளவு தூங்குகிறீர்களா?',
        Healing: 'உங்கள் குடும்பத்தினர் அல்லது நண்பர்கள் உங்களுக்கு உதவக்கூடிய ஒரு திட்டத்தை உருவாக்குவோம். இதன் மூலம் உங்களுக்கு சிறிது ஓய்வு கிடைக்கும்.',
        Flourishing: 'உங்களை இழக்காமல் மற்றவர்களை கவனித்துக் கொள்ள பழகிவிட்டீர்கள். இந்த சமநிலையை எவ்வாறு தொடர்ந்து நிலைநிறுத்துவது?'
      },
      hi: {
        Confusion: 'किसी प्रियजन की देखभाल करना एक सुंदर लेकिन बेहद थका देने वाला रास्ता है। थकान महसूस होने पर दोषी महसूस करना स्वाभाविक है। मैं आपके साथ हूँ।',
        Orientation: 'एक देखभालकर्ता के रूप में, आपकी ज़रूरतें अक्सर आखिरी स्थान पर रह जाती हैं। आपकी नींद और सेहत का हाल कैसा है?',
        Healing: 'आइए परिवार या दोस्तों की मदद से एक सहयोग योजना बनाएं, ताकि आपको थोड़ा आराम मिल सके।',
        Flourishing: 'आप खुद को खोए बिना दूसरों की देखभाल करना सीख रहे हैं। हम इस संतुलन को कैसे बनाए रख सकते हैं।'
      }
    };

    const quote = WISDOM_CORPUS.compassion[turnCount % 3];

    return {
      textResponse: responses[language][stage],
      journeyMetadata: {
        currentJourney: 'Caregiver Stress',
        currentStage: stage,
        extractedThemes: ['Caregiver Exhaustion', 'Isolation', 'Guilt'],
        unmetNeeds: ['Rest', 'Community Support', 'Compassion'],
        riskIndicators: ['Functional Decline']
      },
      recommendations: stage === 'Orientation' ? [
        {
          type: 'community',
          id: 'caregiver_circle',
          title: 'Join Caregiver Circle',
          payload: {
            name: 'UGA Caregiver Network',
            description: 'Meet other caregivers sharing support systems, schedules, and local resources.',
            actionLabel: 'Join Circle'
          }
        }
      ] : [],
      systemAction: null,
      activeLens: 'Compassion Lens (Bhakti Yoga)',
      wisdomQuote: quote
    };
  }

  // DEFAULT CONVERSATIONAL RESPONSE
  const defaultText = {
    en: 'I hear you. Tell me more about what is happening in your life right now. Are you experiencing bereavement, work burnout, or caregiver stress?',
    ta: 'நான் கேட்கிறேன். இப்போது உங்கள் வாழ்க்கையில் என்ன நடக்கிறது என்பதைப் பற்றி மேலும் கூறுங்கள். நீங்கள் சோர்வு, வேலை அழுத்தம் அல்லது பராமரிப்பாளர் சுமை எதையாவது அனுபவிக்கிறீர்களா?',
    hi: 'मैं सुन रहा हूँ। मुझे बताएं कि इस समय आपके जीवन में क्या चल रहा है। क्या आप किसी नुकसान, काम के तनाव या देखभालकर्ता के दबाव का सामना कर रहे हैं?'
  };

  const activeLens = turnCount % 2 === 0 ? 'Meaning Lens (Jnana Yoga)' : 'Compassion Lens (Bhakti Yoga)';
  const quote = WISDOM_CORPUS.compassion[turnCount % 3];

  return {
    textResponse: defaultText[language],
    journeyMetadata: {
      currentJourney: 'General Inquiry',
      currentStage: stage,
      extractedThemes: ['Initial Assessment'],
      unmetNeeds: ['Safety', 'Expression'],
      riskIndicators: []
    },
    recommendations: [],
    systemAction: null,
    activeLens: activeLens,
    wisdomQuote: quote
  };
}
