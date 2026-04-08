// frontend/src/hooks/useTimer.js
import { useState, useEffect } from 'react';

export const useTimer = (expiresAt, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt) - new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.();
        return null;
      }
      
      const minutes = Math.floor(difference / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);
      
      return { minutes, seconds, total: difference };
    };

    const updateTimer = () => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      
      if (time === null) {
        clearInterval(timer);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return { timeLeft, isExpired };
};