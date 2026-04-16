'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const starRef = useRef<HTMLDivElement>(null);
    const cursorPos = useRef({ x: -100, y: -100 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        cursorPos.current = { x: e.clientX, y: e.clientY };

        if (dotRef.current) {
            gsap.set(dotRef.current, {
                x: e.clientX,
                y: e.clientY,
            });
        }
    }, []);

    useEffect(() => {
        // 1. Сразу центрируем оба элемента средствами самого GSAP, чтобы не было глюков
        if (dotRef.current) gsap.set(dotRef.current, { xPercent: -50, yPercent: -50 });
        if (starRef.current) gsap.set(starRef.current, { xPercent: -50, yPercent: -50 });

        // 2. Устанавливаем базовую картинку (убедись, что arrow.svg существует!)
        if (dotRef.current) {
            gsap.set(dotRef.current, {
                backgroundImage: `url('/cursors/arrow.svg')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: 32,  // Вернули нормальные размеры для SVG
                height: 32
            });
        }

        window.addEventListener('mousemove', handleMouseMove);

        const updateStar = () => {
            if (starRef.current) {
                gsap.to(starRef.current, {
                    x: cursorPos.current.x + 45,
                    y: cursorPos.current.y + 45,
                    duration: 1.5,
                    ease: 'power3.out',
                });
            }
        };
        gsap.ticker.add(updateStar);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactiveEl = target.closest('[data-cursor], a, button, .group, [role="button"]');

            if (interactiveEl && dotRef.current) {
                const cursorType = interactiveEl.getAttribute('data-cursor') || 'pointer';

                // Меняем SVG при наведении
                gsap.to(dotRef.current, {
                    backgroundImage: `url('/cursors/${cursorType}.svg')`,
                    duration: 0.2,
                    ease: 'power2.out'
                });

                if (starRef.current) gsap.to(starRef.current, { scale: 2.5, duration: 0.3 });
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactiveEl = target.closest('[data-cursor], a, button, .group, [role="button"]');

            if (interactiveEl && dotRef.current) {
                // Возвращаем обычную стрелку
                gsap.to(dotRef.current, {
                    backgroundImage: `url('/cursors/arrow.svg')`,
                    duration: 0.2,
                    ease: 'power2.out'
                });

                if (starRef.current) gsap.to(starRef.current, { scale: 1, duration: 0.3 });
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            gsap.ticker.remove(updateStar);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, [handleMouseMove]);

    return (
        <>
            {/* Главный курсор (чистый, без красного цвета) */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 z-[10000] pointer-events-none hidden lg:block"
            />

            {/* Звезда (убрали инлайн-стиль transform, его теперь делает GSAP) */}
            <div
                ref={starRef}
                className="fixed top-0 left-0 z-[9999] pointer-events-none hidden lg:block"
            >
                <span style={{ fontSize: '58px', color: '#ff69b4', lineHeight: 1 }}>✹</span>
            </div>
        </>
    );
}