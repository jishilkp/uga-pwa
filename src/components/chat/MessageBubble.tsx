import React, { useState, useRef } from 'react';
import type { Message } from '../../store/journeyStore';
import { Info, Play, Pause, Mic } from 'lucide-react';
// import { FileText } from 'lucide-react'; // Hidden attachment icon
import logo from '../../assets/logo.jpg';

interface MessageBubbleProps {
  message: Message;
  onShowReasoning?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onShowReasoning }) => {
  const isUser = message.sender === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

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
              <span className="text-[10.5px] font-black tracking-wide text-uga-forest dark:text-emerald-400 ml-1.5">Uga</span>
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

        {/* Message Text, Voice Note Card, or Media Attachment */}
        {message.attachment ? (
          <div className="flex flex-col space-y-2 min-w-[220px]">
            {message.attachment.type === 'image' && (
              <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-xs max-h-64 bg-black/5">
                <img src={message.attachment.url} alt={message.attachment.name} className="w-full h-full object-cover max-h-64" />
              </div>
            )}
            {message.attachment.type === 'video' && (
              <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 shadow-xs max-h-64 bg-black">
                <video src={message.attachment.url} controls className="w-full max-h-64 object-contain" />
              </div>
            )}
            {message.attachment.type === 'file' && (
              <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-900/80 p-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xs">
                {/* HIDDEN: Attachment icon - commented out for UI refinement
                <div className="w-9 h-9 rounded-lg bg-uga-forest/10 dark:bg-emerald-900/30 flex items-center justify-center text-uga-forest dark:text-emerald-400 flex-shrink-0">
                  <FileText size={18} />
                </div>
                */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-gray-800 dark:text-gray-200">{message.attachment.name}</p>
                  {message.attachment.size && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">{message.attachment.size}</p>
                  )}
                </div>
                <a 
                  href={message.attachment.url} 
                  download={message.attachment.name}
                  className="px-2.5 py-1 rounded-lg bg-uga-forest dark:bg-emerald-800 text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
                >
                  Save
                </a>
              </div>
            )}
            {message.text && !message.text.startsWith('🖼️') && !message.text.startsWith('📹') && !message.text.startsWith('📎') && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {message.text}
              </p>
            )}
          </div>
        ) : message.audioUrl ? (
          <div className="flex flex-col space-y-1.5 min-w-[210px]">
            <audio 
              ref={audioRef} 
              src={message.audioUrl} 
              onEnded={() => setIsPlaying(false)} 
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            <div className="flex items-center space-x-3 bg-white/70 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xs">
              <button
                onClick={togglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 flex-shrink-0 ${
                  isUser
                    ? 'bg-[#1B4332] text-white hover:bg-uga-forestLight'
                    : 'bg-uga-forest dark:bg-emerald-800 text-white'
                }`}
                title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
              </button>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <Mic size={11} className="text-uga-forest dark:text-emerald-400" /> Voice Note
                  </span>
                  {message.audioDuration && (
                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-semibold">
                      0:{message.audioDuration < 10 ? `0${message.audioDuration}` : message.audioDuration}
                    </span>
                  )}
                </div>
                {/* Waveform visualizer simulation */}
                <div className="flex items-center gap-0.5 h-3">
                  {[40, 70, 30, 80, 50, 90, 60, 40, 70, 100, 50, 30, 80, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.6)))}%` : `${h * 0.4}%` }}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-uga-forest dark:bg-emerald-400 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {message.text && message.text !== '🎙️ Voice Note' && message.text !== '🎙️ குரல் பதிவு' && message.text !== '🎙️ ऑडियो संदेश' && (
              <p className="text-[13px] leading-relaxed font-medium mt-1 text-gray-700 dark:text-gray-300">
                {message.text}
              </p>
            )}
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
            {message.text}
          </p>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] mt-1.5 opacity-40 font-mono ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
export default MessageBubble;