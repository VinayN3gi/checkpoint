'use client';
import React, { useState, useEffect } from 'react';

const ThinkingAnimation = () => {
  const thinkingPhrases = [
    'Thinking...',
    'Analyzing data...',
    'Processing...',
    'Examining charts...',
    'Reviewing context...',
    'Formulating response...',
    'Almost ready...'
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Cycle through phrases every 2 seconds
    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % thinkingPhrases.length);
    }, 2000);

    // Animate dots every 500ms
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotsInterval);
    };
  }, [thinkingPhrases.length]);

  return (
    <div className="flex items-center space-x-2 text-gray-600">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm italic">
        {thinkingPhrases[currentPhraseIndex]}{dots}
      </span>
    </div>
  );
};

export default ThinkingAnimation;