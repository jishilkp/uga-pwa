import React from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, Calendar, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface ConversationsTabProps {
  setActiveTab: (tab: 'chat' | 'journey' | 'history' | 'profile') => void;
}

export const ConversationsTab: React.FC<ConversationsTabProps> = ({ setActiveTab }) => {
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id || 'guest';
  const allThreads = useJourneyStore((state) => state.threads);
  const threads = allThreads.filter(t => t.userId === currentUserId || (!t.userId && currentUserId === 'guest'));
  const activeThreadId = useJourneyStore((state) => state.activeThreadId);
  const switchThread = useJourneyStore((state) => state.switchThread);
  const createNewThread = useJourneyStore((state) => state.createNewThread);
  const deleteThread = useJourneyStore((state) => state.deleteThread);
  const language = useJourneyStore((state) => state.language);

  const localized = {
    en: {
      newThread: 'New Healing Chapter',
      placeholder: 'Describe your current situation...',
      activeThreads: 'Active Chapters',
      messagesCount: 'messages',
      deleteTip: 'Delete thread'
    },
    ta: {
      newThread: 'புதிய குணமளிக்கும் அத்தியாயம்',
      placeholder: 'உங்கள் தற்போதைய நிலையை விவரிக்கவும்...',
      activeThreads: 'செயலில் உள்ள அத்தியாயங்கள்',
      messagesCount: 'செய்திகள்',
      deleteTip: 'அழிக்கவும்'
    },
    hi: {
      newThread: 'नया अध्याय',
      placeholder: 'अपनी वर्तमान स्थिति बताएं...',
      activeThreads: 'सक्रिय अध्याय',
      messagesCount: 'संदेश',
      deleteTip: 'अध्याय हटाएं'
    }
  };

  const text = localized[language];

  const handleCreateThread = () => {
    const defaultTitle = language === 'ta' ? 'புதிய அத்தியாயம்' : language === 'hi' ? 'नया अध्याय' : 'New Healing Chapter';
    const newId = createNewThread(defaultTitle);
    switchThread(newId);
    setActiveTab('chat');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 custom-scrollbar bg-uga-bg">
      {/* Create New Thread Button */}
      <button
        onClick={handleCreateThread}
        className="w-full mb-6 bg-uga-forest hover:bg-uga-forestLight text-white py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
      >
        <Plus size={16} />
        <span>{text.newThread}</span>
      </button>

      {/* Threads Section */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-uga-forestLight opacity-75 mb-3 px-1">
          {text.activeThreads}
        </h3>

        <div className="space-y-3">
          {threads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            const messagesCount = thread.messages.length;

            return (
              <div
                key={thread.id}
                onClick={() => {
                  switchThread(thread.id);
                  setActiveTab('chat');
                }}
                className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-white border-uga-forest shadow-sm'
                    : 'bg-white border-gray-100 hover:border-uga-sageDark'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl ${
                    isActive ? 'bg-uga-forest text-white' : 'bg-uga-sageLight text-uga-forest'
                  }`}>
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {thread.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-gray-400 font-semibold">
                      <span className="flex items-center space-x-0.5">
                        <Calendar size={10} />
                        <span>{thread.lastUpdated}</span>
                      </span>
                      <span>•</span>
                      <span>{messagesCount} {text.messagesCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    title={text.deleteTip}
                    className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>

                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ConversationsTab;
