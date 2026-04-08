// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import ChatWindow from './components/Chat/ChatWindow';
import StartChat from './components/Matching/StartChat';
import { SessionProvider } from './contexts/SessionContext';
import { generateUsername } from './utils/generateUsername';
import './styles/globals.css';

function App() {
  const [username] = useState(() => generateUsername());
  const [currentSession, setCurrentSession] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  
  useEffect(() => {
    // Store username in session storage for persistence
    sessionStorage.setItem('ghost_username', username);
  }, [username]);
  
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Ghost Protocol
            </h1>
            <p className="text-gray-400 mt-2">
              Anonymous. Temporary. Real.
            </p>
            <div className="mt-2 text-sm text-gray-500">
              You are: <span className="text-purple-400 font-mono">{username}</span>
            </div>
          </header>
          
          {/* Main Content */}
          {currentSession ? (
            <ChatWindow 
              session={currentSession}
              username={username}
              onClose={() => setCurrentSession(null)}
            />
          ) : (
            <StartChat 
              username={username}
              onMatchFound={setCurrentSession}
              isMatching={isMatching}
              setIsMatching={setIsMatching}
            />
          )}
        </div>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </SessionProvider>
  );
}

export default App;