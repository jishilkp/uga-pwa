import React from 'react';

interface JourneyRibbonProps {
  currentStage: 'Confusion' | 'Orientation' | 'Healing' | 'Flourishing';
}

export const JourneyRibbon: React.FC<JourneyRibbonProps> = ({ currentStage }) => {
  const stages: ('Confusion' | 'Orientation' | 'Healing' | 'Flourishing')[] = [
    'Confusion',
    'Orientation',
    'Healing',
    'Flourishing'
  ];

  return (
    <div className="w-full bg-uga-bg border-b border-gray-100 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-1 w-full max-w-md mx-auto">
        {stages.map((stage, idx) => {
          const isActive = currentStage === stage;
          const isPast = stages.indexOf(currentStage) > idx;

          return (
            <React.Fragment key={stage}>
              {/* Stage Bubble */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className={`h-7 px-3 rounded-full flex items-center justify-center text-xs font-semibold tracking-wider transition-all duration-300 ${
                    isActive
                      ? 'bg-uga-forest text-white shadow-sm scale-105'
                      : isPast
                      ? 'bg-uga-sageDark text-uga-forest'
                      : 'bg-uga-sageLight text-gray-400'
                  }`}
                >
                  {stage}
                </div>
              </div>

              {/* Connecting Chevron/Line */}
              {idx < stages.length - 1 && (
                <span className={`text-gray-300 text-xs font-light select-none transition-colors duration-300 ${
                  isPast ? 'text-uga-forest' : ''
                }`}>
                  ➔
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default JourneyRibbon;
