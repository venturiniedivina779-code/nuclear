'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export function Typewriter({ text, speed = 30, delay = 1000 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    // Сбрасываем текст перед началом (полезно для Strict Mode в React)
    setDisplayedText('');
    setIsTyping(true);

    timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          // Если хотите, чтобы курсор перестал мигать после печати, 
          // можно использовать setIsTyping(false) и менять классы ниже
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  return (
    <span className="text-[inherit]">
      {/* Встроенный CSS для идеального резкого мигания */}
      <style>{`
        @keyframes custom-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink {
          animation: custom-blink 1s step-end infinite;
        }
      `}</style>

      {displayedText}

      {/* Наш мигающий символ */}
      <span className="cursor-blink inline-block ml-[2px] font-bold">
        _
      </span>
    </span>
  );
}