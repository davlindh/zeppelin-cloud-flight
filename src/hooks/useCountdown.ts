
import { useState, useEffect, useMemo } from 'react';

export interface CountdownState {
  timeLeft: string;
  isEnded: boolean;
  isUrgent: boolean; // less than 1 hour
  isCritical: boolean; // less than 10 minutes
  totalSeconds: number;
}

export const useCountdown = (endTime: Date): CountdownState => {
  // Memoize the end time to prevent infinite re-renders
  const endTimeMs = useMemo(() => endTime.getTime(), [endTime]);
  
  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    timeLeft: '',
    isEnded: false,
    isUrgent: false,
    isCritical: false,
    totalSeconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = endTimeMs - now;

      if (difference <= 0) {
        setTimeLeft({
          timeLeft: 'ENDED',
          isEnded: true,
          isUrgent: false,
          isCritical: false,
          totalSeconds: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let displayTime = '';
      if (days > 0) {
        displayTime = `${days}d ${hours}h`;
      } else if (hours > 0) {
        displayTime = `${hours}h ${minutes}m`;
      } else {
        displayTime = `${minutes}m ${seconds}s`;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const isUrgent = totalSeconds < 3600; // less than 1 hour
      const isCritical = totalSeconds < 600; // less than 10 minutes

      setTimeLeft({
        timeLeft: displayTime,
        isEnded: false,
        isUrgent,
        isCritical,
        totalSeconds
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTimeMs]);

  return timeLeft;
};
