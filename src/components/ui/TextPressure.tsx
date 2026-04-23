'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TextPressureProps {
    text: string;
    className?: string;
}

export function TextPressure({ text, className = '' }: TextPressureProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const spans = container.querySelectorAll('.pressure-char');

        const handleMouseMove = (e: MouseEvent) => {
            spans.forEach((span) => {
                const rect = span.getBoundingClientRect();

                const charCenterX = rect.left + rect.width / 2;
                const charCenterY = rect.top + rect.height / 2;

                const distX = e.clientX - charCenterX;
                const distY = e.clientY - charCenterY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                const maxDist = 100; // Дальность реагирования
                const influence = Math.max(0, 1 - distance / maxDist);

                // --- Настройки веса (Толщина) ---
                const weightInactive = 900;
                const weightActive = 300;
                const weight = weightInactive + (weightActive - weightInactive) * influence;

                // --- Настройки наклона (Italic) ---
                // В вариативных шрифтах наклон обычно идет от 0 до -10 (или -15)
                const skewInactive = 0;   // Прямой
                const skewActive = 12;    // Градусы наклона (чем больше, тем сильнее заваливается)
                const skew = skewInactive + (skewActive - skewInactive) * influence;

                // Анимируем одновременно и вес, и наклон
                gsap.to(span, {
                    fontVariationSettings: `"wght" ${weight}`,
                    skewX: -skew, // Минус нужен, чтобы шрифт наклонялся вправо (как классический курсив)
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });
        };

        const handleMouseLeave = () => {
            gsap.to(spans, {
                fontVariationSettings: '"wght" 900',
                skewX: 0, // Возвращаем в прямое положение
                duration: 0.6,
                ease: 'power2.out',
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            gsap.killTweensOf(Array.from(spans));
        };
    }, []);

    const lines = text.split('\n');

    return (
        <h1 ref={containerRef} className={className}>
            {lines.map((line, lineIndex) => (
                <span key={lineIndex} className="block whitespace-nowrap">
                    {line.split('').map((char, charIndex) => (
                        <span
                            key={charIndex}
                            className="pressure-char inline-block text-[inherit]"
                            // Стартовые значения: жирный и без наклона
                            style={{ fontVariationSettings: '"wght" 900, "slnt" 0' }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
            ))}
        </h1>
    );
}