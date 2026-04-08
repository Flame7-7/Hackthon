// frontend/src/components/UI/Timer.jsx
import React from 'react';
import { Clock } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

const Timer = ({ expiresAt, onExpire }) => {
  const { timeLeft, isExpired } = useTimer(expiresAt, onExpire);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <Clock size={16} />
        <span className="text-sm">Expired</span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Clock size={16} />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const getColorClass = () => {
    if (timeLeft.minutes < 2) return 'text-red-400';
    if (timeLeft.minutes < 5) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className={`flex items-center gap-2 ${getColorClass()}`}>
      <Clock size={16} />
      <span className="text-sm font-mono">
        {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default Timer;