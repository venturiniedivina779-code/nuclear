'use client';

import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export function Typewriter({ text, speed = 30, delay = 1000 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [mounted, setMounted] = useState(false); // Добавили состояние монтажа

  useEffect(() => {
    setMounted(true); // Сообщаем, что мы в браузере

    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    setDisplayedText('');

    timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  // Если мы еще не в браузере, рисуем только пустую строку
  // Это уберет ошибку Hydration Failed
  if (!mounted) {
    return <span className="text-[inherit]">_</span>;
  }

  return (
    <span className="text-[inherit]">
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

      <span className="cursor-blink inline-block ml-[2px] font-bold">
        _
      </span>
    </span>
  );
}