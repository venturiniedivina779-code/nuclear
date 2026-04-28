'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TextPressureProps {
    text: string;
    className?: string;
    weightInactive?: number;
    weightActive?: number;
    skewActive?: number;
    maxDist?: number;
    animateMode?: 'none' | 'random' | 'v-cursor'; // Новый параметр
}

export function TextPressure({
    text,
    className = '',
    weightInactive = 1300,
    weightActive = 100,
    skewActive = 18,
    maxDist = 100,
    animateMode = 'none'
}: TextPressureProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const spans = container.querySelectorAll('.pressure-char');
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1441;

        // --- ЛОГИКА ДЛЯ МЫШКИ (Десктоп) ---
        const handleMouseMove = (e: MouseEvent) => {
            if (isMobile && animateMode !== 'none') return; // На мобилках используем авто-анимацию

            spans.forEach((span) => {
                const rect = span.getBoundingClientRect();
                const charCenterX = rect.left + rect.width / 2;
                const charCenterY = rect.top + rect.height / 2;
                const distX = e.clientX - charCenterX;
                const distY = e.clientY - charCenterY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                const influence = Math.max(0, 1 - distance / maxDist);
                const weight = weightInactive + (weightActive - weightInactive) * influence;
                const skew = 0 + (skewActive - 0) * influence;

                gsap.to(span, {
                    fontVariationSettings: `"wght" ${weight}`,
                    skewX: -skew,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });
        };

        const handleMouseLeave = () => {
            gsap.to(spans, {
                fontVariationSettings: `"wght" ${weightInactive}`,
                skewX: 0,
                duration: 0.6,
                ease: 'power2.out',
            });
        };

        // --- АВТОМАТИЧЕСКАЯ АНИМАЦИЯ (Мобилки / Айпады) ---
        let vCursorTween: gsap.core.Tween | null = null;

        if (isMobile && animateMode !== 'none') {
            if (animateMode === 'random') {
                // ВАРИАНТ 1: Случайные вспышки с затуханием (волна)
                const triggerRandom = () => {
                    const centerIndex = Math.floor(Math.random() * spans.length);
                    const radius = 3; // Сколько букв задеваем в каждую сторону

                    for (let i = centerIndex - radius; i <= centerIndex + radius; i++) {
                        if (i >= 0 && i < spans.length) {
                            const target = spans[i];
                            const distance = Math.abs(i - centerIndex);
                            // Линейное затухание: 1.0, 0.75, 0.5, 0.25...
                            const intensity = 1 - (distance / (radius + 1)); 

                            // Рассчитываем целевые значения с учетом интенсивности
                            const currentWeight = weightInactive + (weightActive - weightInactive) * intensity;
                            const currentSkew = 0 + (skewActive - 0) * intensity;

                            gsap.to(target, {
                                fontVariationSettings: `"wght" ${currentWeight}`,
                                skewX: -currentSkew,
                                duration: 2.5,
                                yoyo: true,
                                repeat: 1,
                                ease: "power2.inOut",
                            });
                        }
                    }

                    // Следующая вспышка через случайное время
                    setTimeout(triggerRandom, Math.random() * 2000 + 1000);
                };

                // Запускаем два независимых потока вспышек для живости
                setTimeout(triggerRandom, 500);
                setTimeout(triggerRandom, 1500);

            } else if (animateMode === 'v-cursor') {
                // ВАРИАНТ 3: Виртуальный курсор
                const vCursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

                const updateByVCursor = () => {
                    spans.forEach((span) => {
                        const rect = span.getBoundingClientRect();
                        const charCenterX = rect.left + rect.width / 2;
                        const charCenterY = rect.top + rect.height / 2;
                        const distX = vCursor.x - charCenterX;
                        const distY = vCursor.y - charCenterY;
                        const distance = Math.sqrt(distX * distX + distY * distY);

                        const influence = Math.max(0, 1 - distance / maxDist);
                        const weight = weightInactive + (weightActive - weightInactive) * influence;
                        const skew = 0 + (skewActive - 0) * influence;

                        gsap.to(span, {
                            fontVariationSettings: `"wght" ${weight}`,
                            skewX: -skew,
                            duration: 0.5,
                            ease: 'power2.out',
                        });
                    });
                };

                const moveCursor = () => {
                    vCursorTween = gsap.to(vCursor, {
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        duration: Math.random() * 2 + 2,
                        ease: "sine.inOut",
                        onUpdate: updateByVCursor,
                        onComplete: moveCursor
                    });
                };
                moveCursor();
            }
        }

        if (!isMobile || animateMode === 'none') {
            window.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (vCursorTween) vCursorTween.kill();
            gsap.killTweensOf(Array.from(spans));
        };
    }, [weightInactive, weightActive, skewActive, maxDist, animateMode]);

    const lines = text.split('\n');

    return (
        <h1 ref={containerRef} className={className}>
            {lines.map((line, lineIndex) => (
                <span key={lineIndex} className="block whitespace-nowrap">
                    {line.split('').map((char, charIndex) => (
                        <span
                            key={charIndex}
                            className="pressure-char inline-block text-[inherit]"
                            style={{ fontVariationSettings: `"wght" ${weightInactive}, "slnt" 0` }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
            ))}
        </h1>
    );
}
