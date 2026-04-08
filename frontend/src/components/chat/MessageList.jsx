// frontend/src/components/Chat/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReportButton from '../Moderation/ReportButton';

const MessageList = ({ messages, currentUsername, onReport }) => {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">👻</div>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm mt-2">Start the conversation!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message, index) => {
        const isOwnMessage = message.username === currentUsername;
        
        return (
          <div
            key={message.id || index}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-lg p-3 ${
                isOwnMessage
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                <div className="text-xs opacity-75 mb-1 flex items-center justify-between gap-4">
                  <span className="font-mono">{message.username}</span>
                  <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                </div>
                <div className="break-words">{message.message}</div>
              </div>
            </div>
            {!isOwnMessage && (
              <div className="order-2 ml-2">
                <ReportButton
                  username={message.username}
                  onReport={(reason) => onReport(message.username, reason)}
                />
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;