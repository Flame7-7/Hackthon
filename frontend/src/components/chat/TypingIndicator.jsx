// frontend/src/components/Chat/TypingIndicator.jsx
import React from 'react';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;
  
  const text = users.length === 1 
    ? `${users[0]} is typing...`
    : `${users.join(', ')} are typing...`;
  
  return (
    <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;