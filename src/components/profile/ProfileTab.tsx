import React, { useState } from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import type { Stakeholder } from '../../store/journeyStore';
import { User, Shield, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const consent = useJourneyStore((state) => state.consent);
  const updateConsent = useJourneyStore((state) => state.updateConsent);
  const language = useJourneyStore((state) => state.language);

  const [expandedSection, setExpandedSection] = useState<Stakeholder | null>('caregiver');

  const localized = {
    en: {
      profileHeader: 'Healing Portal Profile',
      userName: 'Arjun Sharma',
      userAge: '38 years',
      userBio: 'Navigating life chapter changes with support from UGA and local circles.',
      privacyShield: 'My Circles Privacy Shield',
      privacyDesc: 'Control exactly what emotional and conversational context is shared with members of your care ecosystem.',
      caregiver: 'Spouse / Caregiver',
      caregiverDesc: 'Family members who provide direct physical and emotional support.',
      therapist: 'Therapist / Practitioner',
      therapistDesc: 'Certified mental health counselors and medical practitioners.',
      ngo: 'NGO / Community Facilitator',
      ngoDesc: 'Organizers and peers in support circles and local volunteer agencies.',
      themes: 'Share Overall Themes',
      needs: 'Share Core Needs',
      chatLogs: 'Share Verbatim Chat Logs',
      reflections: 'Share Private Reflections',
      risks: 'Share Risk Indicators'
    },
    ta: {
      profileHeader: 'சுயவிவரம்',
      userName: 'அர்ஜுன் சர்மா',
      userAge: '38 வயது',
      userBio: 'UGA மற்றும் சமூக வட்டங்களின் ஆதரவுடன் வாழ்க்கை மாற்றங்களை கடந்து கொள்கிறார்.',
      privacyShield: 'தனியுரிமை கவசம் (Privacy Shield)',
      privacyDesc: 'உங்கள் பராமரிப்பு உறுப்பினர்களுடன் என்ன பகிர வேண்டும் என்பதை நீங்கள் கட்டுப்படுத்தலாம்.',
      caregiver: 'துணைவியார் / பராமரிப்பாளர்',
      caregiverDesc: 'நேரடி ஆதரவை வழங்கும் குடும்ப உறுப்பினர்கள்.',
      therapist: 'மனநல மருத்துவர் / ஆலோசகர்',
      therapistDesc: 'சான்றளிக்கப்பட்ட மனநல ஆலோசகர்கள் மற்றும் மருத்துவர்கள்.',
      ngo: 'தன்னார்வ தொண்டு நிறுவனம் / அமைப்பாளர்',
      ngoDesc: 'ஆதரவு வட்டங்களின் அமைப்பாளர்கள் மற்றும் சக தன்னார்வலர்கள்.',
      themes: 'ஒட்டுமொத்த கருப்பொருள்களைப் பகிர்',
      needs: 'முக்கிய தேவைகளைப் பகிர்',
      chatLogs: 'உரையாடல் பதிவுகளைப் பகிர்',
      reflections: 'தனிப்பட்ட பிரதிபலிப்புகளைப் பகிர்',
      risks: 'இடர் குறிகாட்டிகளைப் பகிர்'
    },
    hi: {
      profileHeader: 'हीलिंग पोर्टल प्रोफाइल',
      userName: 'अर्जुन शर्मा',
      userAge: '38 वर्ष',
      userBio: 'UGA और स्थानीय सहायता समूहों की मदद से जीवन के नए अध्यायों की ओर बढ़ रहे हैं।',
      privacyShield: 'माई सर्कल्स प्राइवेसी शील्ड',
      privacyDesc: 'नियंत्रित करें कि आपकी देखभाल प्रणाली के सदस्यों के साथ क्या साझा किया जाए।',
      caregiver: 'जीवनसाथी / देखभालकर्ता',
      caregiverDesc: 'परिवार के सदस्य जो प्रत्यक्ष शारीरिक और भावनात्मक सहायता प्रदान करते हैं।',
      therapist: 'चिकित्सक / थेरेपिस्ट',
      therapistDesc: 'प्रमाणित मानसिक स्वास्थ्य सलाहकार और चिकित्सक।',
      ngo: 'एनजीओ / सामुदायिक समन्वयक',
      ngoDesc: 'सहायता समूहों और स्थानीय स्वयंसेवी एजेंसियों के आयोजक।',
      themes: 'समग्र विषयों को साझा करें',
      needs: 'मुख्य ज़रूरतों को साझा करें',
      chatLogs: 'चैट लॉग साझा करें',
      reflections: 'व्यक्तिगत विचारों को साझा करें',
      risks: 'जोखिम संकेतकों को साझा करें'
    }
  };

  const text = localized[language];

  const toggleSection = (section: Stakeholder) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleToggle = (stakeholder: Stakeholder, field: string, currentValue: boolean) => {
    updateConsent(stakeholder, field, !currentValue);
  };

  const renderToggleRow = (stakeholder: Stakeholder, field: string, label: string) => {
    const isAllowed = consent[stakeholder].allowed.includes(field);
    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <button
          onClick={() => handleToggle(stakeholder, field, isAllowed)}
          className={`w-10 h-6 rounded-full transition-all duration-300 relative focus:outline-none ${
            isAllowed ? 'bg-uga-forest' : 'bg-gray-200'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${
              isAllowed ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 custom-scrollbar bg-uga-bg">
      {/* Profile Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center mb-6">
        <div className="w-20 h-20 bg-uga-sageLight rounded-full flex items-center justify-center mx-auto mb-4 border border-uga-sage">
          <User size={36} className="text-uga-forest" />
        </div>
        <h2 className="text-lg font-black text-gray-900">{text.userName}</h2>
        <p className="text-xs text-gray-500 font-semibold">{text.userAge}</p>
        <p className="text-xs text-gray-600 max-w-xs mx-auto mt-2 leading-relaxed">
          {text.userBio}
        </p>
      </div>

      {/* Privacy Shield Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2 px-1">
          <Shield className="text-uga-forest" size={18} />
          <h3 className="text-sm font-black text-gray-900">{text.privacyShield}</h3>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed px-1 mb-4">
          {text.privacyDesc}
        </p>

        {/* Vertical Stakeholder List */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {/* Caregiver Section */}
          <div>
            <button
              onClick={() => toggleSection('caregiver')}
              className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-gray-900">{text.caregiver}</h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{text.caregiverDesc}</p>
              </div>
              {expandedSection === 'caregiver' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'caregiver' && (
              <div className="bg-uga-sageLight/50 px-4 pb-4 pt-1 transition-all">
                {renderToggleRow('caregiver', 'themes', text.themes)}
                {renderToggleRow('caregiver', 'needs', text.needs)}
                {renderToggleRow('caregiver', 'chat_logs', text.chatLogs)}
                {renderToggleRow('caregiver', 'private_reflections', text.reflections)}
              </div>
            )}
          </div>

          {/* Therapist Section */}
          <div>
            <button
              onClick={() => toggleSection('therapist')}
              className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-gray-900">{text.therapist}</h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{text.therapistDesc}</p>
              </div>
              {expandedSection === 'therapist' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'therapist' && (
              <div className="bg-uga-sageLight/50 px-4 pb-4 pt-1 transition-all">
                {renderToggleRow('therapist', 'themes', text.themes)}
                {renderToggleRow('therapist', 'needs', text.needs)}
                {renderToggleRow('therapist', 'risk_indicators', text.risks)}
                {renderToggleRow('therapist', 'chat_logs', text.chatLogs)}
              </div>
            )}
          </div>

          {/* NGO Section */}
          <div>
            <button
              onClick={() => toggleSection('ngo')}
              className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
            >
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-gray-900">{text.ngo}</h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{text.ngoDesc}</p>
              </div>
              {expandedSection === 'ngo' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSection === 'ngo' && (
              <div className="bg-uga-sageLight/50 px-4 pb-4 pt-1 transition-all">
                {renderToggleRow('ngo', 'themes', text.themes)}
                {renderToggleRow('ngo', 'needs', text.needs)}
                {renderToggleRow('ngo', 'chat_logs', text.chatLogs)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety & Compliance Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start space-x-3.5">
        <div className="p-2 bg-[#F5F2EA] rounded-xl text-uga-forest">
          <Lock size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900 mb-0.5">Zero-Knowledge Safe Mode</h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            UGA stores your local conversation graph in secure browser storage. Verification processes ensure that the system cannot decide who sees your logs without explicit permission switches toggled above.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
