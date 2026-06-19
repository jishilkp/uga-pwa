import React from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import { AlertTriangle, Phone, ArrowLeft } from 'lucide-react';

export const CrisisOverlay: React.FC = () => {
  const resetCrisis = useJourneyStore((state) => state.resetThreadToCleanState);
  const language = useJourneyStore((state) => state.language);

  const disclaimers = {
    en: {
      title: 'Immediate Help is Available',
      text: 'UGA is an emotional well-being companion, not a clinical or emergency service. If you are experiencing severe distress or thoughts of self-harm, please connect with a trained professional right now. They are free, confidential, and ready to listen.',
      callLabel: 'Tap to Call Helpline',
      backBtn: 'Return to Chat'
    },
    ta: {
      title: 'உடனடி உதவிக்கு தொடர்பு கொள்ளவும்',
      text: 'UGA என்பது ஒரு உணர்ச்சி நல்வாழ்வு வழிகாட்டி ஆகும், இது அவசர சிகிச்சை சேவை அல்ல. உங்களுக்கு ஏதேனும் தற்கொலை எண்ணங்கள் அல்லது கடுமையான மன உளைச்சல் ஏற்பட்டால், தயவுசெய்து உடனடியாக கீழே உள்ள உதவி எண்களை அழைக்கவும்.',
      callLabel: 'அழைக்க தட்டவும்',
      backBtn: 'உரையாடலுக்குத் திரும்பு'
    },
    hi: {
      title: 'तुरंत सहायता उपलब्ध है',
      text: 'UGA एक भावनात्मक कल्याण साथी है, कोई नैदानिक या आपातकालीन सेवा नहीं। यदि आप गंभीर संकट या खुद को नुकसान पहुंचाने के विचारों का सामना कर रहे हैं, तो कृपया तुरंत एक प्रशिक्षित पेशेवर से संपर्क करें। वे निशुल्क, गोपनीय और आपकी बात सुनने के लिए तैयार हैं।',
      callLabel: 'हेल्पलाइन पर कॉल करने के लिए टैप करें',
      backBtn: 'चैट पर वापस जाएं'
    }
  };

  const localized = disclaimers[language];

  // Primary helplines for India/general support demo
  const helplines = [
    { name: 'KIRAN Mental Health', number: '1800-599-0019', desc: 'Govt. of India 24/7 Helpline' },
    { name: 'AASRA Helpline', number: '91-9820466726', desc: '24/7 Suicide Prevention support' },
    { name: 'National Emergency Line', number: '112', desc: 'Police, Ambulance & Fire Services' }
  ];

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col justify-between p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 bg-uga-accent/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <AlertTriangle className="text-uga-accent animate-bounce" size={32} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
          {localized.title}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
          {localized.text}
        </p>
      </div>

      {/* Helplines List */}
      <div className="my-6 space-y-3">
        {helplines.map((line) => (
          <a
            key={line.number}
            href={`tel:${line.number.replace(/[^0-9]/g, '')}`}
            className="w-full bg-uga-accent text-white py-4 px-5 rounded-2xl flex items-center justify-between transition-all duration-200 active:scale-[0.98] shadow-md hover:bg-uga-accent/90"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">{line.name}</span>
              <span className="text-lg font-black tracking-tight mt-0.5">{line.number}</span>
              <span className="text-[10px] opacity-75 mt-0.5">{line.desc}</span>
            </div>
            <div className="bg-white/20 p-2.5 rounded-full">
              <Phone size={20} className="fill-current text-white" />
            </div>
          </a>
        ))}
      </div>

      {/* Back Button Escape Hatch */}
      <div className="mb-4">
        <button
          onClick={resetCrisis}
          className="w-full py-3 text-sm text-gray-500 font-bold hover:text-gray-800 flex items-center justify-center space-x-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>{localized.backBtn}</span>
        </button>
      </div>
    </div>
  );
};
export default CrisisOverlay;
