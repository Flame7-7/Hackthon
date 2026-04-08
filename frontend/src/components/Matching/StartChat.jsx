// frontend/src/components/Matching/StartChat.jsx
import React, { useState, useRef } from 'react';
import { Loader, Users, MessageCircle, Sparkles, Shield, Zap, Heart, Hash, Smile, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FiltersModal from './FiltersModal';
import { generateUsername } from '../../utils/generateUsername';

const StartChat = ({ username, onMatchFound, isMatching, setIsMatching }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);
  const [filters, setFilters] = useState({
    topic: 'general',
    mood: 'any'
  });
  const matchTimerRef = useRef(null);
  
  const startMatching = () => {
    setIsMatching(true);
    setQueuePosition(Math.floor(Math.random() * 5) + 1);
    toast('Looking for a chat partner...', { icon: '🔍' });
    
    // Simulate finding a match after 2-4 seconds
    matchTimerRef.current = setTimeout(() => {
      const fakePartnerName = generateUsername();
      const fakeSession = {
        id: 'session_' + Date.now(),
        participants: [username, fakePartnerName],
        topic: filters.topic,
        mood: filters.mood,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        partnerName: fakePartnerName,
        isDemoMode: true
      };
      setIsMatching(false);
      setQueuePosition(null);
      onMatchFound(fakeSession);
      toast.success('Match found! Starting chat...', { icon: '🎉' });
    }, 2000 + Math.random() * 2000);
  };
  
  const cancelMatching = () => {
    if (matchTimerRef.current) {
      clearTimeout(matchTimerRef.current);
    }
    setIsMatching(false);
    setQueuePosition(null);
    toast('Matching cancelled', { icon: '👋' });
  };
  
  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-full mb-6 animate-bounce-slow">
            <MessageCircle className="w-16 h-16 text-purple-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Anonymous Conversations
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with someone randomly. No pressure, no identity, no history. 
            Just real, temporary conversations.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Shield className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Complete Privacy</h3>
            <p className="text-gray-400 text-sm">No login required. Random usernames. No tracking.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-400 text-sm">Instant messaging with typing indicators.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Heart className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Safe Environment</h3>
            <p className="text-gray-400 text-sm">AI moderation and user reporting system.</p>
          </div>
        </div>
        
        {/* Main Action Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-auto">
          {/* Current Filters Display */}
          {(filters.topic !== 'general' || filters.mood !== 'any') && (
            <div className="bg-gray-700/50 rounded-lg p-3 mb-6">
              <div className="text-sm text-gray-300 mb-2">Active Filters:</div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-purple-600/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Hash size={12} />
                  {filters.topic}
                </span>
                <span className="text-xs bg-purple-600/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Smile size={12} />
                  {filters.mood}
                </span>
              </div>
            </div>
          )}
          
          {/* Queue Status */}
          {isMatching && queuePosition !== null && queuePosition > 0 && (
            <div className="text-center mb-4 text-sm text-gray-400">
              Queue position: {queuePosition}
            </div>
          )}
          
          {/* Action Buttons */}
          {!isMatching ? (
            <div className="space-y-4">
              <button
                onClick={startMatching}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-lg transition transform hover:scale-105 shadow-lg"
              >
                <Sparkles className="inline-block mr-2" size={20} />
                Start Chat Now
              </button>
              
              <button
                onClick={() => setShowFilters(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Users size={18} />
                Customize Filters
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader className="w-16 h-16 text-purple-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 font-medium">Looking for someone to chat with...</p>
              <p className="text-sm text-gray-500">This usually takes a few seconds</p>
              {queuePosition > 0 && (
                <p className="text-xs text-gray-500">{queuePosition} people in queue</p>
              )}
              <button
                onClick={cancelMatching}
                className="text-red-400 hover:text-red-300 text-sm transition"
              >
                Cancel Search
              </button>
            </div>
          )}
          
          {/* Safety Notice */}
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <AlertCircle size={14} />
              <span>Chats expire after 30 minutes • Be respectful • Report inappropriate behavior</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Modal */}
      {showFilters && (
        <FiltersModal
          currentFilters={filters}
          onSave={(newFilters) => {
            setFilters(newFilters);
            setShowFilters(false);
            toast.success('Filters updated!', { icon: '✅' });
          }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </>
  );
};

export default StartChat;
