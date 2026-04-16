'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TransitionLink } from './TransitionLink';
import gsap from 'gsap';

// Единый монолитный компонент навигации: сразу и роутинг, и визуальный ховер-эффект
const NavItem = ({ href, text, isActive }: { href: string; text: string; isActive?: boolean }) => (
    <TransitionLink
        href={href}
        className="relative after:content-[''] after:absolute after:-inset-y-4 after:-inset-x-3 block no-underline outline-none"
    >
        <div className="group cursor-pointer overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block', flexShrink: 0 }}>
            <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2">
                <span
                    className={`text-sm font-bold tracking-widest transition-colors duration-300 ${isActive ? 'text-[#ffffff]' : 'text-[#ffffff]/50'}`}
                    style={{ display: 'block', lineHeight: '20px', whiteSpace: 'nowrap' }}
                >
                    {text} {isActive && '✹'}
                </span>
                <span
                    className="text-sm font-bold tracking-widest text-[#ffffff]"
                    style={{ display: 'block', lineHeight: '20px', whiteSpace: 'nowrap' }}
                >
                    {text} {isActive && '✹'}
                </span>
            </div>
        </div>
    </TransitionLink>
);

export const Header = () => {
    const pathname = usePathname();

    // ЗАЩИТА ОТ ПРОПАДАНИЯ МЕНЮ:
    // Очистка стилей GSAP при смене маршрута, чтобы избежать залипания opacity
    useEffect(() => {
        gsap.set([".custom-home-btn", ".custom-nav"], { clearProps: "all" });
    }, [pathname]);

    // Умная проверка активности: подсвечиваем "Project", даже если мы внутри страницы конкретного продукта
    const isProjectActive = pathname === '/project' || pathname.startsWith('/product/');

    return (
        <div className="global-menu-wrapper absolute top-0 left-0 w-full h-[100px] z-[100] pointer-events-none text-[#ffffff] blend-exclusion">
            <div className="custom-home-btn pointer-events-auto absolute top-[40px] !left-auto !right-[6vw] lg:!right-auto lg:!left-[4vw] z-50">
                <TransitionLink
                    href="/"
                    className="relative after:content-[''] after:absolute after:-inset-4 text-sm font-bold tracking-widest text-[#ffffff] opacity-70 hover:opacity-100 transition-opacity no-underline outline-none block"
                >
                    Kesa.today
                </TransitionLink>
            </div>

            {/* ====== НАВИГАЦИЯ ====== */}
            <nav className="custom-nav pointer-events-auto absolute top-[40px] !right-auto !left-[6vw] lg:!left-auto lg:!right-[4vw] flex flex-row gap-4 md:gap-6 items-center animate-up">
                <NavItem href="/project" text="Project" isActive={isProjectActive} />
                <NavItem href="/space" text="Space" isActive={pathname === '/space'} />
                <NavItem href="/contact" text="Contact" isActive={pathname === '/contact'} />
            </nav>
        </div>
    );
};