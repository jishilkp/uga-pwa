import React, { useState } from 'react';
import type { Recommendation } from '../../services/mockOrchestrator';
import { Users, User, Building, Check, ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [isJoined, setIsJoined] = useState(false);
  const { type, title, payload } = recommendation;

  const getIcon = () => {
    switch (type) {
      case 'community':
        return <Users className="text-uga-forest" size={18} />;
      case 'practitioner':
        return <User className="text-uga-forest" size={18} />;
      case 'institution':
        return <Building className="text-uga-forest" size={18} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'community': return 'Local Community Circle';
      case 'practitioner': return 'Professional Care Referral';
      case 'institution': return 'Institution Program';
    }
  };

  return (
    <div className="w-full my-3 bg-white border border-uga-sageDark rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Category Header */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-1.5 bg-uga-sageLight rounded-lg">
          {getIcon()}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-uga-forestLight opacity-75">
          {getTypeLabel()}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-500 font-bold mb-3">{payload.name}</p>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        {payload.description}
      </p>

      {/* Action CTA */}
      <button
        onClick={() => setIsJoined(true)}
        disabled={isJoined}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
          isJoined
            ? 'bg-uga-sageLight text-uga-forest border border-uga-sage'
            : 'bg-uga-forest text-white hover:bg-uga-forestLight active:scale-[0.98]'
        }`}
      >
        {isJoined ? (
          <>
            <Check size={14} />
            <span>Request Sent / Connected</span>
          </>
        ) : (
          <>
            <span>{payload.actionLabel}</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>
    </div>
  );
};
export default RecommendationCard;
