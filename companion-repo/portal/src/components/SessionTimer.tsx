// src/components/SessionTimer.tsx
import { useState, useEffect } from 'react';

function SessionTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup: clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <p className="text-sm text-muted-fg">
      Session: {minutes}:{remainingSeconds.toString().padStart(2, '0')}
    </p>
  );
}

export default SessionTimer;
