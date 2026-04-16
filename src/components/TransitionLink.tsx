'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';
import gsap from 'gsap';

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export const TransitionLink = ({ href, children, className }: TransitionLinkProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        if (pathname === href) return;

        // 1. Ищем контейнер контента, а не весь body!
        const wrapper = document.querySelector('.page-transition-wrapper');

        if (wrapper) {
            // 2. Плавно скрываем текущий контент
            gsap.to(wrapper, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    // 3. Переходим на новую страницу ТОЛЬКО после затухания
                    router.push(href);

                    // Нам больше не нужно возвращать opacity обратно через setTimeout!
                    // Next.js сам уничтожит старый DOM, а новый template.tsx 
                    // начнет свою анимацию (fromTo) с чистого листа.
                }
            });
        } else {
            // Фоллбэк на случай непредвиденных обстоятельств
            router.push(href);
        }
    };

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
};