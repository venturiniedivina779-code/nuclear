'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { TransitionLink } from '../../components/TransitionLink';
import Link from 'next/link';
import Lottie from 'lottie-react';
import Pupsiko from '../../components/Pupsiko'; // Проверь путь к компоненту!

// 1. ДОБАВЛЯЕМ КОМПОНЕНТ ДЛЯ ССЫЛОК
const NavLink = ({ text }: { text: string }) => (
    <div
        className="group cursor-pointer overflow-hidden"
        style={{ position: 'relative', height: '20px', display: 'block', flexShrink: 0 }}
    >
        <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2">
            {/* Используем темный цвет #111 для светлой страницы */}
            <span className="text-sm font-bold tracking-widest text-[#111]/50" style={{ display: 'block', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                {text}
            </span>
            <span className="text-sm font-bold tracking-widest text-[#111]" style={{ display: 'block', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                {text}
            </span>
        </div>
    </div>
);

const productNames = ["Pupsiko", "Memo", "Jelly", "Luk", "Jofy", "Barb", "Cera", "Orion", "Luna", "Nova", "Aura", "Stella", "Lyra", "Vista", "Terra", "Aqua", "Ignis", "Ventus"];

const products = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    title: productNames[i],
    src: `/product/${i === 3 ? 'image4' : i === 0 ? 'Image1' : i === 1 ? 'Image2' : i === 2 ? 'Image3' : `image${i + 1}`}.png`
}));

export default function ProjectPage() {
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightContentRef = useRef<HTMLDivElement>(null);
    const customCursorRef = useRef<HTMLDivElement>(null);
    const cursorPos = useRef({ x: 0, y: 0 });

    const scrollState = useRef({ target: 0, current: 0 });
    const [contentHeight, setContentHeight] = useState(2000);

    const [productOpen, setProductOpen] = useState(false);
    const productRef = useRef<HTMLDivElement>(null);
    const [arrowAnimData, setArrowAnimData] = useState<any>(null);

    useEffect(() => {
        fetch('/arrow.json')
            .then(response => response.json())
            .then(data => setArrowAnimData(data))
            .catch(error => console.error('Ошибка загрузки стрелки:', error));
    }, []);

    useEffect(() => {
        if (!productRef.current) return;
        if (productOpen) {
            gsap.set(productRef.current, { display: 'block', transformOrigin: 'center center' });
            gsap.fromTo(
                productRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.9, ease: 'power4.out' }
            );
        } else {
            gsap.to(productRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => {
                    if (productRef.current) gsap.set(productRef.current, { display: 'none' });
                },
            });
        }
    }, [productOpen]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const staggerEls = document.querySelectorAll('.animate-stagger');
            if (staggerEls.length > 0) {
                gsap.fromTo(
                    Array.from(staggerEls),
                    { y: 15, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
                );
            }

            // 2. АНИМАЦИЯ ПОЯВЛЕНИЯ МЕНЮ
            gsap.fromTo(".animate-up",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out" }
            );

            const renderTick = () => {
                if (customCursorRef.current) {
                    gsap.to(customCursorRef.current, {
                        x: cursorPos.current.x,
                        y: cursorPos.current.y,
                        duration: 0.5,
                        ease: 'power3.out',
                    });
                }

                scrollState.current.current += (scrollState.current.target - scrollState.current.current) * 0.08;
                const currentScrollRaw = scrollState.current.current;

                let rightContentBaseY = 0;
                if (rightContentRef.current) {
                    rightContentBaseY = rightContentRef.current.offsetTop;
                    gsap.set(rightContentRef.current, { y: -currentScrollRaw });
                }

                if (leftPanelRef.current) {
                    const isFixed = window.getComputedStyle(leftPanelRef.current).position === 'fixed';
                    if (!isFixed) {
                        gsap.set(leftPanelRef.current, { y: -currentScrollRaw });
                    } else {
                        gsap.set(leftPanelRef.current, { y: 0 });
                    }
                }

                if (rightContentRef.current) {
                    const viewportH = window.innerHeight;
                    const cards = rightContentRef.current.querySelectorAll('.product-card');

                    cards.forEach((cardEl) => {
                        const card = cardEl as HTMLElement;
                        const screenY = rightContentBaseY + card.offsetTop - currentScrollRaw;
                        const cardH = card.offsetHeight;

                        const triggerEnter = viewportH - (cardH * 0.15);
                        const triggerLeave = -(cardH * 0.25);

                        if (screenY < triggerEnter && screenY > triggerLeave) {
                            if (!card.classList.contains('in-view')) {
                                card.classList.add('in-view');
                                gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
                            }
                        } else {
                            if (card.classList.contains('in-view')) {
                                card.classList.remove('in-view');
                                gsap.to(card, { opacity: 0, y: 60, scale: 0.95, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
                            }
                        }
                    });
                }
            };

            gsap.ticker.add(renderTick);

            return () => {
                gsap.ticker.remove(renderTick);
            };
        });

        const handleMouseMove = (e: MouseEvent) => {
            cursorPos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const resizeObserver = new ResizeObserver(() => {
            let h = 0;
            if (rightContentRef.current) h += rightContentRef.current.offsetHeight;
            if (leftPanelRef.current) {
                const isFixed = window.getComputedStyle(leftPanelRef.current).position === 'fixed';
                if (!isFixed) h += leftPanelRef.current.offsetHeight;
            }
            setContentHeight(h + 100);
        });

        if (rightContentRef.current) resizeObserver.observe(rightContentRef.current);
        if (leftPanelRef.current) resizeObserver.observe(leftPanelRef.current);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', handleMouseMove);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[100dvh] bg-[#efefef] text-[#111] overflow-hidden z-[60]">

            {/* 3. ВОЗВРАЩАЕМ ГЛОБАЛЬНОЕ МЕНЮ (z-индекс выше контента) */}




            <div
                id="project-scroll-track"
                className="absolute top-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar z-20 pointer-events-auto w-full lg:left-[35%] lg:w-[65%]"
                onScroll={(e) => { scrollState.current.target = e.currentTarget.scrollTop; }}
            >
                <div style={{ height: contentHeight }} className="w-[1px] pointer-events-none opacity-0" />
            </div>

            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-30 flex flex-col lg:block"
                onWheel={(e) => {
                    const scrollDiv = document.getElementById('project-scroll-track');
                    if (scrollDiv) scrollDiv.scrollTop += e.deltaY;
                }}
            >
                <div className="custom-home-btn pointer-events-auto">
                    <Link
                        href="/"
                        className="text-sm font-bold tracking-widest text-[#111] opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-0 m-0 no-underline outline-none"
                    >
                        Kesa.today
                    </Link>
                </div>

                <div
                    ref={leftPanelRef}
                    className="flex flex-col justify-start lg:justify-center pointer-events-auto z-40 shrink-0 relative w-full h-auto pt-[12vh] pb-[8vh] px-[6vw] md:pt-[20vh] md:pb-[10vh] md:px-[60px] lg:fixed lg:top-0 lg:left-0 lg:w-[35%] lg:h-[100dvh] lg:py-[6vh] lg:px-[4vw] box-border"
                >
                    <div className="animate-stagger flex flex-col w-full max-w-[100%] lg:max-w-[90%] my-auto lg:m-auto">
                        <h2 className="text-[32px] md:text-[40px] lg:text-[3.5vw] font-bold tracking-tighter leading-none mb-6 text-[#111]">
                            Overview
                        </h2>

                        <p className="text-[20px] md:text-lg lg:text-[1.2vw] font-medium leading-[1.6] text-[#111] opacity-90 mb-12">
                            It's a modern minimal skin care website where I tried to make the design very eye catchy and layout is very clean and used a Beautiful typeface to emphasis the brand theme.
                        </p>

                        <div className="flex flex-col gap-1 mb-10">
                            <span className="text-[11px] font-bold tracking-widest text-[#111] opacity-40 uppercase">
                                Project Details
                            </span>
                            <span className="text-[14px] font-bold text-[#111] opacity-80 mt-2">
                                Members: Independent
                            </span>
                            <span className="text-[14px] font-bold text-[#111] opacity-80">
                                Role: UI/UX & Layout
                            </span>
                        </div>

                        {/*} <div className="relative w-[60px] h-[60px] mt-[40px] z-10 flex items-center justify-center pointer-events-none">
                            {arrowAnimData && (
                                <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] scale-x-[-1] rotate-270 translate-x-[15px] flex items-center justify-center">
                                    <Lottie animationData={arrowAnimData} loop={true} />
                                </div>
                            )}
                        </div>*/}
                    </div>
                </div>

                <div
                    ref={rightContentRef}
                    className="pointer-events-auto shrink-0 relative w-full h-auto px-[6vw] md:px-[60px] pb-[10vh] lg:absolute lg:top-[150px] lg:left-[35%] lg:w-[65%] lg:p-[4vw] lg:pt-0 box-border overflow-hidden lg:overflow-visible"
                >
                    <div className="max-w-[1200px] mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[25px] lg:gap-[20px] w-full">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.title.toLowerCase()}`}
                                    className="product-card cursor-pointer group relative bg-[#e3e3e3] aspect-square overflow-hidden opacity-0 shadow-sm w-full block"
                                >
                                    {/* всё внутреннее содержимое оставляем без изменений! */}
                                    <h3 className="absolute top-[20px] left-[20px] z-10 text-[20px] md:text-[18px] font-semibold tracking-tight text-[#111] pointer-events-none">
                                        {product.title}
                                    </h3>

                                    <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.1]">
                                        <Image src={product.src} alt={product.title} width={400} height={400} className="max-w-[70%] max-h-[70%] object-contain drop-shadow-lg" />
                                    </div>

                                    {product.id === 5 && (
                                        <span className="absolute bottom-[20px] right-[20px] text-[11px] font-bold tracking-tight text-[#111] opacity-50 pointer-events-none z-20">
                                            Golden Canon Grid
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div
                ref={productRef}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 999, transform: 'scale(0.8)', opacity: 0, display: 'none', overflow: 'hidden',
                }}
            >
                <Pupsiko isOpen={productOpen} onClose={() => setProductOpen(false)} onGoHome={() => window.location.href = '/'} />
            </div>
        </div>
    );
}