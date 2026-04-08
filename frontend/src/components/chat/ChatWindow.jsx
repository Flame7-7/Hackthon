// frontend/src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Send, SkipForward, Users, Volume2, VolumeX } from 'lucide-react';
import Timer from '../UI/Timer';
import ReportButton from '../Moderation/ReportButton';
import { formatDistanceToNow } from 'date-fns';
import { generateUsername } from '../../utils/generateUsername';

// Bot responses grouped by context
const BOT_RESPONSES = {
  greetings: [
    "Hey! What's up?",
    "Hi there! How's your day going?",
    "Hello! Nice to meet you on Ghost Protocol",
    "Hey! First time here?",
    "Hiii! What brings you here today?",
  ],
  general: [
    "That's really interesting! Tell me more",
    "Haha I totally agree with you!",
    "Oh wow, I never thought about it that way",
    "Same here! That's such a coincidence",
    "That's so cool! I love hearing different perspectives",
    "Lol yeah, I feel the same way",
    "Hmm, that's a good point actually",
    "No way! That's awesome",
    "I was just thinking about something similar!",
    "That's wild! What made you think of that?",
    "Honestly, that's a great take",
    "Haha you're funny",
    "Yeah for sure, I can relate to that",
    "Interesting... I have a different view on that",
    "That reminds me of something that happened to me recently",
    "Oh really? That's pretty cool!",
    "I couldn't agree more!",
    "Wait, tell me more about that!",
    "Haha nice one!",
    "That's a really unique perspective",
  ],
  questions: [
    "So what do you do for fun?",
    "What's your favorite type of music?",
    "Have you watched any good movies lately?",
    "If you could travel anywhere, where would you go?",
    "What's the most interesting thing you've learned recently?",
    "Do you prefer coffee or tea?",
    "What's your favorite thing about yourself?",
    "If you could have any superpower, what would it be?",
    "What's on your bucket list?",
    "Are you more of a morning person or night owl?",
  ],
  followups: [
    "Oh that's really cool! I actually enjoy that too",
    "Nice! What got you into that?",
    "Awesome! How long have you been doing that?",
    "That sounds amazing! I wish I could try that",
    "Cool! Do you do that often?",
    "Love that! I should try it sometime",
  ]
};

const getRandomResponse = (category) => {
  const responses = BOT_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getBotResponse = (userMessage, messageCount) => {
  const msg = userMessage.toLowerCase();

  // First message from user - greet back
  if (messageCount <= 2) {
    return getRandomResponse('greetings');
  }

  // Every 4th message, ask a question
  if (messageCount % 4 === 0) {
    return getRandomResponse('questions');
  }

  // If user asked a question
  if (msg.includes('?')) {
    return getRandomResponse('followups');
  }

  return getRandomResponse('general');
};

const ChatWindow = ({ session, username, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const botTimerRef = useRef(null);

  const partnerName = session.partnerName || generateUsername();

  // Show initial join message and bot greeting
  useEffect(() => {
    toast.success('Connected to chat!', { icon: '👻' });
    toast(`${partnerName} joined the chat`, { icon: '👻' });
    inputRef.current?.focus();

    // Bot sends first message after a short delay
    const timer = setTimeout(() => {
      const greeting = getRandomResponse('greetings');
      setMessages(prev => [...prev, {
        id: 'bot_' + Date.now(),
        username: partnerName,
        message: greeting,
        timestamp: new Date().toISOString()
      }]);
      setMessageCount(prev => prev + 1);
    }, 1500 + Math.random() * 1500);

    return () => {
      clearTimeout(timer);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [partnerName]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateBotReply = useCallback((userMessage) => {
    setTypingUsers([partnerName]);

    const typingDuration = 1000 + Math.random() * 2000;
    botTimerRef.current = setTimeout(() => {
      setTypingUsers([]);
      const response = getBotResponse(userMessage, messageCount);
      setMessages(prev => [...prev, {
        id: 'bot_' + Date.now(),
        username: partnerName,
        message: response,
        timestamp: new Date().toISOString()
      }]);
      setMessageCount(prev => prev + 1);
    }, typingDuration);
  }, [partnerName, messageCount]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const msg = {
        id: 'user_' + Date.now(),
        username: username,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, msg]);
      setMessageCount(prev => prev + 1);
      setInputMessage('');
      simulateBotReply(inputMessage.trim());
    }
  }, [inputMessage, username, simulateBotReply]);

  const handleTyping = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  const handleSkip = useCallback(() => {
    toast('Skipping to next chat...', { icon: '⏭️' });
    setTimeout(() => onClose(), 500);
  }, [onClose]);

  const handleLeave = useCallback(() => {
    toast('Left the chat', { icon: '👋' });
    setTimeout(() => onClose(), 100);
  }, [onClose]);

  const handleReport = useCallback((reportedUsername, reason) => {
    toast.success('Report submitted. Thank you for helping keep Ghost Protocol safe!');
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast(isMuted ? 'Sound enabled' : 'Sound muted', { icon: isMuted ? '🔊' : '🔇' });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[80vh]">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-purple-400">👻</span>
              Ghost Chat
            </h2>
            <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              2 participants online
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Timer expiresAt={session.expiresAt} onExpire={handleLeave} />
            
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 hover:bg-gray-700 rounded-lg transition relative"
              title="Participants"
            >
              <Users size={18} />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
            
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
              <SkipForward size={18} />
              Skip
            </button>
            
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Leave
            </button>
          </div>
        </div>
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-400 mt-2 animate-pulse">
            {typingUsers.join(', ')} is typing...
          </div>
        )}
      </div>
      
      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-4 top-20 bg-gray-900 rounded-lg shadow-xl p-4 min-w-[200px] z-10 border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Participants</h3>
          <div className="space-y-1">
            <div className="text-gray-300 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {username} (You)
            </div>
            <div className="text-gray-300 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {partnerName}
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900/50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-6xl mb-4">👻</div>
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-2">Remember: This chat is anonymous and temporary</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex ${msg.username === username ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[70%] ${msg.username === username ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-lg p-3 ${
                msg.username === username
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                <div className="text-xs opacity-75 mb-1 flex items-center justify-between gap-4">
                  <span className="font-mono">{msg.username}</span>
                  <span>{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                </div>
                <div className="break-words">{msg.message}</div>
              </div>
            </div>
            {msg.username !== username && (
              <div className="order-2 ml-2">
                <ReportButton
                  username={msg.username}
                  onReport={(reason) => handleReport(msg.username, reason)}
                />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 transition"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>Messages are anonymous and not stored</span>
          <span>{inputMessage.length}/500</span>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
