import React, { useState, useEffect } from 'react';

const Timer = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1000); // Decrease time by 1 second
    }, 1000);

    if (timeLeft <= 0) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-center">
      <h2 className="text-2xl font-semibold">{formatTime(timeLeft)}</h2>
    </div>
  );
};

export default Timer;