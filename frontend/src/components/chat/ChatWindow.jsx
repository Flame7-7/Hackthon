// frontend/src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Send, AlertCircle, SkipForward, Clock, Users, Flag, Volume2, VolumeX } from 'lucide-react';
import Timer from '../UI/Timer';
import ReportButton from '../Moderation/ReportButton';
import { formatDistanceToNow } from 'date-fns';

const ChatWindow = ({ session, username, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const soundRef = useRef(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      auth: { username },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      
      newSocket.emit('join_chat', {
        sessionId: session.id,
        participants: [newSocket.id, ...(session.participants || [])]
      });
    });
    
    newSocket.on('session_ready', (data) => {
      console.log('Session ready:', data);
      setParticipants(data.participants || []);
      toast.success('Connected to chat!', { icon: '👻' });
      inputRef.current?.focus();
    });
    
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Play sound notification if not muted and message is not from self
      if (!isMuted && message.username !== username && soundRef.current) {
        soundRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    });
    
    newSocket.on('user_joined', (user) => {
      setParticipants(prev => {
        if (!prev.includes(user.userId)) {
          return [...prev, user.userId];
        }
        return prev;
      });
      toast(`${user.username} joined the chat`, { icon: '👻' });
    });
    
    newSocket.on('user_left', (user) => {
      setParticipants(prev => prev.filter(id => id !== user.userId));
      toast(`${user.username} left the chat`, { icon: '👋' });
    });
    
    newSocket.on('user_typing', ({ username: typingUser, isTyping: typing }) => {
      if (typing) {
        setTypingUsers(prev => [...new Set([...prev, typingUser])]);
      } else {
        setTypingUsers(prev => prev.filter(name => name !== typingUser));
      }
    });
    
    newSocket.on('message_blocked', ({ reason }) => {
      toast.error(`Message blocked: ${reason}`);
    });
    
    newSocket.on('error', ({ message }) => {
      toast.error(message);
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from chat. Reconnecting...');
    });
    
    setSocket(newSocket);
    
    // Create audio element for notifications
    soundRef.current = new Audio('/notification.mp3');
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [session.id, username, isMuted]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket && isConnected) {
      socket.emit('send_message', {
        sessionId: session.id,
        message: inputMessage.trim()
      });
      setInputMessage('');
      
      // Reset typing indicator
      if (isTyping) {
        socket.emit('typing', { sessionId: session.id, isTyping: false });
        setIsTyping(false);
      }
    }
  }, [inputMessage, socket, isConnected, session.id, isTyping]);
  
  const handleTyping = useCallback((e) => {
    const value = e.target.value;
    setInputMessage(value);
    
    if (!isTyping && value.length > 0 && socket) {
      setIsTyping(true);
      socket.emit('typing', { sessionId: session.id, isTyping: true });
    } else if (isTyping && value.length === 0 && socket) {
      setIsTyping(false);
      socket.emit('typing', { sessionId: session.id, isTyping: false });
    }
  }, [isTyping, socket, session.id]);
  
  const handleSkip = useCallback(() => {
    if (socket) {
      socket.emit('skip_chat', { sessionId: session.id });
      toast('Skipping to next chat...', { icon: '⏭️' });
      setTimeout(() => onClose(), 500);
    }
  }, [socket, session.id, onClose]);
  
  const handleLeave = useCallback(() => {
    if (socket) {
      socket.emit('leave_chat', { sessionId: session.id });
      toast('Left the chat', { icon: '👋' });
      setTimeout(() => onClose(), 100);
    } else {
      onClose();
    }
  }, [socket, session.id, onClose]);
  
  const handleReport = useCallback((reportedUsername, reason) => {
    if (socket) {
      socket.emit('report_user', {
        sessionId: session.id,
        reportedUsername,
        reason
      });
      toast.success('Report submitted. Thank you for helping keep Ghost Protocol safe!');
    }
  }, [socket, session.id]);
  
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
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {participants.length} participant{participants.length !== 1 ? 's' : ''} online
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
              {participants.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {participants.length}
                </span>
              )}
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
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>
      
      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute right-4 top-20 bg-gray-900 rounded-lg shadow-xl p-4 min-w-[200px] z-10 border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Participants</h3>
          <div className="space-y-1">
            {participants.map((participantId, idx) => (
              <div key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Participant {idx + 1}
              </div>
            ))}
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
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !isConnected}
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