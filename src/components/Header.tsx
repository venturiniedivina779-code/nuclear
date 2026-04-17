'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import gsap from 'gsap';

const NavItem = ({ href, text, isActive }: { href: string; text: string; isActive?: boolean }) => {
    const star1Ref = useRef<HTMLSpanElement>(null);
    const star2Ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (isActive) {
            gsap.to([star1Ref.current, star2Ref.current], {
                width: 16,
                marginLeft: 6,
                opacity: 1,
                scale: 1,
                rotate: 180,
                duration: 0.6,
                ease: "back.out(2.5)",
                transformOrigin: "center center"
            });
        } else {
            gsap.to([star1Ref.current, star2Ref.current], {
                width: 0,
                marginLeft: 0,
                opacity: 0,
                scale: 0,
                rotate: 0,
                duration: 0.4,
                ease: "power2.inOut"
            });
        }
    }, [isActive]);

    return (
        <TransitionLink
            href={href}
            className="group relative block no-underline outline-none cursor-pointer"
        >
            <div style={{ padding: '20px 25px' }}>
                <div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block', flexShrink: 0 }}>
                    <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 flex flex-col">
                        <span
                            className={`text-sm font-bold tracking-widest transition-colors duration-300 flex items-center ${isActive ? 'text-[#ffffff]' : 'text-[#a0a0a0]'}`}
                            style={{ height: '20px', whiteSpace: 'nowrap' }}
                        >
                            {text}
                            <span ref={star1Ref} className="inline-flex items-center justify-center overflow-hidden" style={{ width: 0, opacity: 0, transform: 'scale(0)', marginLeft: 0 }}>
                                ✹
                            </span>
                        </span>
                        <span
                            className="text-sm font-bold tracking-widest text-[#ffffff] flex items-center"
                            style={{ height: '20px', whiteSpace: 'nowrap' }}
                        >
                            {text}
                            <span ref={star2Ref} className="inline-flex items-center justify-center overflow-hidden" style={{ width: 0, opacity: 0, transform: 'scale(0)', marginLeft: 0 }}>
                                ✹
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </TransitionLink>
    );
};

export const Header = () => {
    const pathname = usePathname();
    const isProjectActive = pathname === '/project' || pathname.startsWith('/product/');
    const isHomePage = pathname === '/';

    const bigStarRef = useRef<HTMLSpanElement>(null);
    const [isLogoHovered, setIsLogoHovered] = useState(false);

    // Состояние для отслеживания десктопа (по умолчанию true для SSR)
    const [isDesktop, setIsDesktop] = useState(true);

    // ==========================================
    // ⚙️ ПАНЕЛЬ УПРАВЛЕНИЯ ЛОГОТИПОМ
    // ==========================================
    const LOGO_WIDTH = "140px";
    const LOGO_HEIGHT = "40px";

    // Твои кастомные цвета!
    const LOGO_COLOR = "#ebebeb";
    const LOGO_HOVER_COLOR = "#0040ffff";
    // ==========================================

    // Эффект для переключения логотипа в зависимости от ширины экрана
    useEffect(() => {
        const handleResize = () => {
            // В Tailwind брейкпоинт 'lg' начинается с 1024px
            setIsDesktop(window.innerWidth >= 1024);
        };

        // Вызываем сразу при загрузке, чтобы определить начальный размер
        handleResize();

        // Вешаем слушатель на изменение размера окна
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Динамическая ссылка на маску: на десктопе лого слева, на мобилке справа
    const currentLogoUrl = isDesktop ? 'url(/logo_left.svg)' : 'url(/logo_right.svg)';

    useEffect(() => {
        if (isHomePage) {
            gsap.set(bigStarRef.current, { display: 'flex', opacity: 1, scale: 1 });
            gsap.to(bigStarRef.current, {
                rotate: 360,
                duration: 15,
                ease: "none",
                repeat: -1,
                transformOrigin: "center center"
            });
        } else {
            gsap.killTweensOf(bigStarRef.current);
            gsap.set(bigStarRef.current, { display: 'none', opacity: 0, transform: 'scale(0)' });
        }

        return () => {
            if (bigStarRef.current) gsap.killTweensOf(bigStarRef.current);
        };
    }, [isHomePage]);

    return (
        <div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none mix-blend-difference text-[#ffffff]">

            <div className="custom-home-btn pointer-events-auto absolute top-[20px] !left-auto !right-[6vw] lg:!right-auto lg:!left-[4vw]">
                <TransitionLink
                    href="/"
                    className="relative z-10 no-underline outline-none block w-max cursor-pointer"
                >
                    <div
                        style={{ padding: '20px' }}
                        onMouseEnter={() => setIsLogoHovered(true)}
                        onMouseLeave={() => setIsLogoHovered(false)}
                    >
                        {/* МАГИЧЕСКИЙ ТРАФАРЕТ ЛОГОТИПА */}
                        <div
                            style={{
                                width: LOGO_WIDTH,
                                height: LOGO_HEIGHT,
                                backgroundColor: isLogoHovered ? LOGO_HOVER_COLOR : LOGO_COLOR,
                                transition: 'background-color 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                                // Используем динамическую ссылку currentLogoUrl
                                WebkitMaskImage: currentLogoUrl,
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'left center', // Выравнивание оставим по левому краю, позицию двигает сам контейнер
                                maskImage: currentLogoUrl,
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'left center',
                            }}
                        />
                    </div>
                </TransitionLink>

                {/* Твоя гигантская звезда */}
                <span
                    ref={bigStarRef}
                    className="absolute inline-flex items-center justify-center overflow-hidden pointer-events-none z-0"
                    style={{
                        display: 'none',
                        width: '240px',
                        height: '240px',
                        fontSize: '240px',
                        color: '#fe366fff',
                        top: '-60px',
                        left: '-40px',
                        opacity: 0,
                        transform: 'scale(0)',
                    }}
                >
                    ✹
                </span>
            </div>

            <nav className="custom-nav pointer-events-auto absolute top-[20px] !right-auto !left-[6vw] lg:!left-auto lg:!right-[4vw] flex flex-row items-center">
                <NavItem href="/project" text="Project" isActive={isProjectActive} />
                <NavItem href="/space" text="Space" isActive={pathname === '/space'} />
                <NavItem href="/contact" text="Contact" isActive={pathname === '/contact'} />
            </nav>
        </div>
    );
};