import React from 'react';
import type { Message } from '../../store/journeyStore';
import { Info } from 'lucide-react';
import logo from '../../assets/logo.jpg';

interface MessageBubbleProps {
  message: Message;
  onShowReasoning?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onShowReasoning }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl p-4 transition-all duration-300 relative ${
        isUser
          ? 'bg-[#E2ECE9] dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tr-none'
          : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm text-gray-800 dark:text-gray-100 rounded-tl-none'
      }`}>
        {/* Header with Uga Logo & info icon for Uga responses */}
        {!isUser && message.extractedStateSnapshot && (
          <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center">
              <img src={logo} alt="Uga Mascot" className="w-6 h-6 rounded-full object-cover border border-uga-sage/30" />
              <span className="text-[9px] font-black tracking-wide text-uga-forest dark:text-emerald-400 ml-1.5">Uga</span>
            </div>
            {onShowReasoning && (
              <button 
                onClick={() => onShowReasoning(message)}
                className="p-1 -mr-1 hover:bg-uga-sageLight dark:hover:bg-gray-800 text-gray-400 hover:text-uga-forest dark:hover:text-emerald-400 rounded-lg transition-colors active:scale-90"
                title="View Reasoning Flow"
              >
                <Info size={13} />
              </button>
            )}
          </div>
        )}

        {/* Message Text */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {message.text}
        </p>

        {/* Timestamp */}
        <div className={`text-[9px] mt-1.5 opacity-40 font-mono ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
export default MessageBubble;
