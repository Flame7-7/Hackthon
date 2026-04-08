// frontend/src/components/Chat/ChatHeader.jsx
import React, { useState } from 'react';
import { Users, SkipForward, LogOut, Volume2, VolumeX, Clock, ChevronDown } from 'lucide-react';
import Timer from '../UI/Timer';

const ChatHeader = ({ 
  participants, 
  isConnected, 
  onSkip, 
  onLeave, 
  sessionExpiry,
  isMuted,
  onToggleMute
}) => {
  const [showParticipants, setShowParticipants] = useState(false);
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-purple-400">👻</span>
            Ghost Chat
          </h2>
          <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {participants.length} participant{participants.length !== 1 ? 's' : ''} online
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {sessionExpiry && <Timer expiresAt={sessionExpiry} onExpire={onLeave} />}
          
          <button
            onClick={onToggleMute}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-gray-700 rounded-lg transition relative"
              title="Participants"
            >
              <Users size={18} />
              {participants.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {participants.length}
                </span>
              )}
            </button>
            
            {showParticipants && (
              <div className="absolute right-0 mt-2 bg-gray-900 rounded-lg shadow-xl p-4 min-w-[200px] z-10 border border-gray-700">
                <h3 className="text-white font-semibold mb-2">Participants</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {participants.map((participant, idx) => (
                    <div key={idx} className="text-gray-300 text-sm flex items-center gap-2 py-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-mono">Ghost_{participant.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            <SkipForward size={18} />
            Skip
          </button>
          
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut size={18} />
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;