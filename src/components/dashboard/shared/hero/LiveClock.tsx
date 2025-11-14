import { useState, useEffect } from 'react';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="ml-2 text-xs font-mono bg-muted px-2 py-0.5 rounded">
      {time.toLocaleTimeString()}
    </span>
  );
};
