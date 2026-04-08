// frontend/src/contexts/SessionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const createSession = (sessionData) => {
    setSessionId(sessionData.id);
    setParticipants(sessionData.participants);
    setSessionExpiry(sessionData.expiresAt);
    setIsActive(true);
    
    // Store in sessionStorage for recovery
    sessionStorage.setItem('ghost_session', JSON.stringify({
      id: sessionData.id,
      expiresAt: sessionData.expiresAt
    }));
  };

  const endSession = () => {
    setSessionId(null);
    setParticipants([]);
    setSessionExpiry(null);
    setIsActive(false);
    sessionStorage.removeItem('ghost_session');
  };

  const updateParticipants = (newParticipants) => {
    setParticipants(newParticipants);
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('ghost_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (new Date(session.expiresAt) > new Date()) {
        setSessionId(session.id);
        setSessionExpiry(session.expiresAt);
        setIsActive(true);
      } else {
        sessionStorage.removeItem('ghost_session');
      }
    }
  }, []);

  return (
    <SessionContext.Provider value={{
      sessionId,
      participants,
      sessionExpiry,
      isActive,
      createSession,
      endSession,
      updateParticipants
    }}>
      {children}
    </SessionContext.Provider>
  );
};

