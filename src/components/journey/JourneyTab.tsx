import React from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import { ShieldAlert, BookOpen, Heart, Activity, Compass } from 'lucide-react';

export const JourneyTab: React.FC = () => {
  const activeThread = useJourneyStore((state) => state.getActiveThread());
  const language = useJourneyStore((state) => state.language);

  const localizedText = {
    en: {
      noJourney: 'No active journey data yet. Send a message in the Chat tab to initialize your healing profile.',
      title: 'Healing Profile & Context',
      subtitle: 'Structured nodes extracted by UGA\'s reasoning engines.',
      lifeContext: 'Life Context',
      activeThemes: 'Active Themes',
      coreNeeds: 'Core Needs',
      riskIndicators: 'Risk & Indicators',
      journeyGraph: 'Active Journey Graph',
      activeLens: 'Activated Lenses',
      scienceWisdom: 'Ecosystem Wisdom'
    },
    ta: {
      noJourney: 'செயலில் உள்ள பயணத் தரவு இல்லை. உங்கள் குணமளிக்கும் சுயவிவரத்தை உருவாக்க அரட்டை தாவலில் ஒரு செய்தியை அனுப்பவும்.',
      title: 'குணப்படுத்தும் சுயவிவரம்',
      subtitle: 'UGA-வின் பகுப்பாய்வு இயந்திரங்களால் பிரித்தெடுக்கப்பட்ட தரவு.',
      lifeContext: 'வாழ்க்கை சூழல்',
      activeThemes: 'செயலில் உள்ள கருப்பொருள்கள்',
      coreNeeds: 'முக்கிய தேவைகள்',
      riskIndicators: 'இடர் மற்றும் குறிகாட்டிகள்',
      journeyGraph: 'பயண வரைபடம் (Journey Graph)',
      activeLens: 'செயல்படுத்தப்பட்ட லென்ஸ்கள்',
      scienceWisdom: 'ஞானப் பகிர்வு'
    },
    hi: {
      noJourney: 'अभी कोई सक्रिय यात्रा डेटा नहीं है। अपना हीलिंग प्रोफाइल शुरू करने के लिए चैट में एक संदेश भेजें।',
      title: 'हीलिंग प्रोफाइल और संदर्भ',
      subtitle: 'उगा के विश्लेषण इंजनों द्वारा निकाले गए संरचित नोड्स।',
      lifeContext: 'जीवन का संदर्भ',
      activeThemes: 'सक्रिय विषय',
      coreNeeds: 'मुख्य ज़रूरतें',
      riskIndicators: 'जोखिम और संकेतक',
      journeyGraph: 'सक्रिय यात्रा आरेख',
      activeLens: 'सक्रिय लेंस',
      scienceWisdom: 'पारिस्थितिकी तंत्र ज्ञान'
    }
  };

  const text = localizedText[language];

  if (!activeThread || activeThread.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <Compass className="animate-spin text-uga-forest/40 mb-4" size={40} />
        <p className="text-sm font-semibold max-w-xs leading-relaxed">{text.noJourney}</p>
      </div>
    );
  }

  const { journeyMetadata, activeLens, wisdomQuote, recommendations } = activeThread;

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 custom-scrollbar bg-uga-bg">
      {/* Header Dashboard */}
      <div className="mb-6 text-center">
        <div className="inline-block bg-uga-sageLight border border-uga-sageDark px-4 py-1.5 rounded-full text-xs font-bold text-uga-forest mb-2">
          {journeyMetadata.currentJourney} • {journeyMetadata.currentStage}
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{text.title}</h2>
        <p className="text-xs text-gray-500 mt-1">{text.subtitle}</p>
      </div>

      {/* Grid of Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Life Context */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-uga-forest mb-3 flex items-center space-x-1.5">
            <BookOpen size={14} />
            <span>{text.lifeContext}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {journeyMetadata.extractedThemes.length > 0 ? (
              journeyMetadata.extractedThemes.map((item, idx) => (
                <span key={idx} className="text-xs bg-uga-sageLight text-uga-forest px-3 py-1 rounded-xl font-medium border border-uga-sage/50">
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 font-medium">No life context nodes recognized yet.</span>
            )}
          </div>
        </div>

        {/* Active Themes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-uga-forest mb-3 flex items-center space-x-1.5">
            <Activity size={14} />
            <span>{text.activeThemes}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {journeyMetadata.extractedThemes.length > 0 ? (
              // Simulating slightly broader emotional themes mapped
              ['Grief', 'Vulnerability', 'Transition'].map((item, idx) => (
                <span key={idx} className="text-xs bg-uga-sage text-uga-forest px-3 py-1 rounded-xl font-semibold">
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 font-medium">Waiting for thread interaction.</span>
            )}
          </div>
        </div>

        {/* Core Needs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-uga-forest mb-3 flex items-center space-x-1.5">
            <Heart className="text-amber-500 fill-amber-500" size={14} />
            <span>{text.coreNeeds}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {journeyMetadata.unmetNeeds.length > 0 ? (
              journeyMetadata.unmetNeeds.map((need, idx) => (
                <span key={idx} className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-xl font-semibold border border-amber-100">
                  {need}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 font-medium">Exploring user needs.</span>
            )}
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-uga-forest mb-3 flex items-center space-x-1.5">
            <ShieldAlert className="text-uga-accent" size={14} />
            <span>{text.riskIndicators}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {journeyMetadata.riskIndicators.length > 0 ? (
              journeyMetadata.riskIndicators.map((risk, idx) => (
                <span key={idx} className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-xl font-medium border border-red-100">
                  {risk}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl font-medium border border-emerald-100">
                Low Clinical Risk Detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Journey Graph Flowchart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-uga-forest mb-4">
          {text.journeyGraph}
        </h3>
        
        <div className="w-full flex justify-center py-2 overflow-x-auto">
          {/* Custom SVG flowchart of nodes & edges */}
          <svg width="320" height="240" viewBox="0 0 320 240" className="max-w-full">
            {/* Definitions for arrow markers */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#1B4332" />
              </marker>
            </defs>

            {/* Node 1: Life Event */}
            <rect x="10" y="10" width="130" height="40" rx="10" fill="#F5F2EA" stroke="#1B4332" strokeWidth="1" />
            <text x="75" y="34" textAnchor="middle" fill="#1B4332" className="text-[10px] font-bold">
              {journeyMetadata.extractedThemes[0] || 'Life Event'}
            </text>

            {/* Edge 1 -> 2 */}
            <line x1="140" y1="30" x2="210" y2="30" stroke="#1B4332" strokeWidth="1" markerEnd="url(#arrow)" />
            <text x="175" y="22" textAnchor="middle" fill="#5c8a74" className="text-[8px] font-medium">evokes</text>

            {/* Node 2: Emotion */}
            <rect x="220" y="10" width="90" height="40" rx="10" fill="#E2ECE9" stroke="#1B4332" strokeWidth="1" />
            <text x="265" y="34" textAnchor="middle" fill="#1B4332" className="text-[10px] font-bold">
              {journeyMetadata.extractedThemes[1] || 'Grief'}
            </text>

            {/* Edge 2 -> 3 */}
            <path d="M 265 50 L 265 90" fill="none" stroke="#1B4332" strokeWidth="1" markerEnd="url(#arrow)" />
            <text x="275" y="75" textAnchor="start" fill="#5c8a74" className="text-[8px] font-medium">signals</text>

            {/* Node 3: Unmet Need */}
            <rect x="180" y="100" width="130" height="40" rx="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
            <text x="245" y="124" textAnchor="middle" fill="#B45309" className="text-[10px] font-bold">
              {journeyMetadata.unmetNeeds[0] || 'Connection'}
            </text>

            {/* Edge 3 -> 4 */}
            <line x1="180" y1="120" x2="110" y2="120" stroke="#1B4332" strokeWidth="1" markerEnd="url(#arrow)" />
            <text x="145" y="112" textAnchor="middle" fill="#5c8a74" className="text-[8px] font-medium">supported by</text>

            {/* Node 4: Support Recommendation */}
            <rect x="10" y="100" width="90" height="40" rx="10" fill="#E2ECE9" stroke="#1B4332" strokeWidth="1" />
            <text x="55" y="124" textAnchor="middle" fill="#1B4332" className="text-[9px] font-bold">
              {recommendations[0]?.title || 'Grief Circle'}
            </text>

            {/* Edge 4 -> 5 */}
            <path d="M 55 140 L 55 180" fill="none" stroke="#1B4332" strokeWidth="1" markerEnd="url(#arrow)" />
            <text x="63" y="165" textAnchor="start" fill="#5c8a74" className="text-[8px] font-medium">activates</text>

            {/* Node 5: Lens / Healing Paradigm */}
            <rect x="10" y="190" width="300" height="40" rx="10" fill="#1B4332" stroke="#1B4332" strokeWidth="1" />
            <text x="155" y="214" textAnchor="middle" fill="#ffffff" className="text-[10px] font-bold">
              {activeLens || 'Meaning Lens (Jnana Yoga)'}
            </text>
          </svg>
        </div>
      </div>

      {/* Activated Lens Details & Wisdom Quote */}
      {wisdomQuote && (
        <div className="bg-uga-warmOffWhite border border-uga-sageDark rounded-2xl p-5 shadow-sm text-gray-800">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-uga-forest bg-white px-2.5 py-1 rounded-lg shadow-sm border border-gray-100">
              {activeLens}
            </span>
          </div>

          <p className="text-sm italic font-medium text-gray-700 leading-relaxed mb-3">
            "{wisdomQuote.text}"
          </p>

          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>— {wisdomQuote.author}</span>
            <span className="opacity-75">{wisdomQuote.source}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default JourneyTab;
