// frontend/src/components/Chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage, onTyping, disabled, sessionId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        onTyping(false);
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };
  
  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Typing indicator logic
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onTyping(false);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 2 seconds of no input
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 2000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          placeholder={disabled ? "Connecting..." : "Type your message..."}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          maxLength={500}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-6 py-3 transition"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Messages are anonymous and not stored</span>
        <span>{message.length}/500</span>
      </div>
    </form>
  );
};

export default MessageInput;