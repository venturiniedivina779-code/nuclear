'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import Lottie from 'lottie-react';
import { productsData, Product } from '../../../data/products';
import { TransitionLink } from '../../../components/TransitionLink';
// Импортируем наш новенький чистый Лайтбокс!
import { Lightbox } from '../../../components/ui/Lightbox';

export default function ProductPage() {
    const params = useParams<{ id: string }>();

    const productId = params.id ? params.id.toLowerCase() : 'pupsiko';
    const product: Product = productsData[productId] || productsData['pupsiko'];

    // --- ЛОГИКА SHARE POP-UP (Ее мы вынесем на следующем шаге!) ---
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copyText, setCopyText] = useState("Copy");
    const [currentUrl, setCurrentUrl] = useState("");
    const shareModalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    useEffect(() => {
        if (isShareModalOpen && shareModalRef.current) {
            gsap.fromTo(shareModalRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
            );
        }
    }, [isShareModalOpen]);

    const openShareModal = () => setIsShareModalOpen(true);

    const closeShareModal = () => {
        if (!shareModalRef.current) return;
        gsap.to(shareModalRef.current, {
            opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.in",
            onComplete: () => {
                setIsShareModalOpen(false);
                setCopyText("Copy");
            }
        });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopyText("Copied");
            setTimeout(() => setCopyText("Copy"), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };
    // ---------------------------

    // Стейт для Лайтбокса (осталась всего 1 строчка!)
    const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

    const contentHeightRef = useRef<HTMLDivElement>(null);
    const [arrowAnimData, setArrowAnimData] = useState<any>(null);

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightContentRef = useRef<HTMLDivElement>(null);
    const customCursorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollState = useRef({ target: 0, current: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let renderTick: () => void;

        let ctx = gsap.context(() => {
            const staggerEls = document.querySelectorAll('.animate-stagger');
            if (staggerEls.length > 0) {
                gsap.fromTo(
                    Array.from(staggerEls),
                    { y: 15, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
                );
            }

            renderTick = () => {
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

                if (rightContentRef.current) gsap.set(rightContentRef.current, { y: -currentScrollRaw });

                if (leftPanelRef.current) {
                    const isFixed = window.getComputedStyle(leftPanelRef.current).position === 'fixed';
                    if (!isFixed) {
                        gsap.set(leftPanelRef.current, { y: -currentScrollRaw });
                    } else {
                        gsap.set(leftPanelRef.current, { y: 0 });
                    }
                }
            };

            gsap.ticker.add(renderTick);
        }, containerRef);

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
            if (contentHeightRef.current) {
                contentHeightRef.current.style.height = `${h + 200}px`;
            }
        });

        if (rightContentRef.current) resizeObserver.observe(rightContentRef.current);
        if (leftPanelRef.current) resizeObserver.observe(leftPanelRef.current);

        return () => {
            ctx.revert();
            if (renderTick) gsap.ticker.remove(renderTick);
            window.removeEventListener('mousemove', handleMouseMove);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed top-0 left-0 w-full h-[100dvh] bg-[#efefef] text-[#111] overflow-hidden z-[60]">

            <div
                id="product-scroll-track"
                className="absolute top-0 left-0 w-full h-full overflow-y-auto custom-scrollbar z-20 pointer-events-auto"
                onScroll={(e) => { scrollState.current.target = e.currentTarget.scrollTop; }}
            >
                <div ref={contentHeightRef} className="w-px pointer-events-none opacity-0" />
            </div>

            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-30 flex flex-col lg:block"
                onWheel={(e) => {
                    const scrollDiv = document.getElementById('product-scroll-track');
                    if (scrollDiv) scrollDiv.scrollTop += e.deltaY;
                }}
            >
                <div
                    ref={leftPanelRef}
                    className="global-menu-wrapper flex flex-col justify-start lg:justify-center pointer-events-auto z-40 shrink-0 relative w-full h-auto pt-[12vh] pb-[8vh] px-[6vw] md:pt-[20vh] md:pb-[10vh] md:px-[60px] lg:fixed lg:top-0 lg:left-0 lg:w-[35%] lg:h-[100dvh] lg:py-[6vh] lg:px-[4vw] box-border"
                >
                    <div className="animate-stagger flex flex-col w-full max-w-[100%] lg:max-w-[90%] my-auto lg:m-auto">

                        <h2 className="text-[32px] md:text-[40px] lg:text-[3.5vw] font-bold tracking-tighter leading-none mb-[30px] text-[#111]">
                            {product.title}
                        </h2>

                        <p className="text-[20px] md:text-lg lg:text-[1.2vw] font-medium leading-[1.6] opacity-90 mb-[50px] text-[#111]">
                            {product.description}
                        </p>

                        <div className="flex flex-col gap-1 mb-[50px]">
                            <span className="text-[11px] font-bold tracking-widest opacity-40 uppercase text-[#111]">Project Details</span>
                            <span className="text-[14px] font-bold opacity-80 mt-2 text-[#111]">Year: {product.year}</span>
                            <span className="text-[14px] font-bold opacity-80 text-[#111]">Role: {product.role}</span>
                        </div>

                        <button
                            onClick={openShareModal}
                            className={`flex items-center justify-center gap-[10px] w-[160px] h-[55px] rounded-[16px] text-[18px] font-medium transition-all duration-300 outline-none border-none cursor-pointer ${copyText === "Copy"
                                ? "bg-[#dddddd] text-[#111] hover:bg-[#ff6d6d] hover:text-[#ebebeb]"
                                : "bg-[#22c55e] text-white"
                                }`}
                        >
                            {copyText === "Copy" ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            )}
                            <span style={{ transform: 'translateY(1px)' }}>{copyText}</span>
                        </button>

                        <TransitionLink
                            href="/project"
                            className="relative w-[60px] h-[60px] opacity-90 hover:opacity-50 transition-opacity outline-none border-none bg-transparent flex items-center justify-center z-10 self-start mt-8"
                        >
                            {arrowAnimData ? (
                                <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] scale-x-[-1] rotate-90 translate-x-[15px] pointer-events-none flex items-center justify-center">
                                    <Lottie animationData={arrowAnimData} loop={true} />
                                </div>
                            ) : (
                                <span className="text-sm font-bold opacity-50">Back</span>
                            )}
                        </TransitionLink>

                    </div>
                </div>

                <div
                    ref={rightContentRef}
                    className="pointer-events-auto shrink-0 relative w-full h-auto px-[6vw] md:px-[60px] pb-[10vh] lg:absolute lg:top-[150px] lg:left-[35%] lg:w-[65%] lg:p-[4vw] lg:pt-0 box-border"
                >
                    <div className="max-w-[1200px] mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px] lg:gap-[20px] w-full">
                            {product.photos.map((src: string, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => setFullscreenIdx(index)}
                                    className="cursor-pointer group relative bg-[#e3e3e3] aspect-square overflow-hidden shadow-sm w-full"
                                >
                                    <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease group-hover:scale-[1.05]">
                                        <Image src={src} alt={`${product.title} ${index}`} width={800} height={800} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ВЫЗЫВАЕМ НАШ НОВЫЙ КОМПОНЕНТ ЛАЙТБОКСА! */}
            <Lightbox
                photos={product.photos}
                currentIndex={fullscreenIdx}
                setCurrentIndex={setFullscreenIdx}
            />

            {/* SHARE POP-UP (MODAL) */}
            {isShareModalOpen && (
                <div
                    className="fixed inset-0 w-full h-[100dvh] bg-black/40 z-[300] flex items-center justify-center pointer-events-auto backdrop-blur-[2px] transition-opacity"
                    onClick={closeShareModal}
                >
                    <div
                        ref={shareModalRef}
                        className="bg-[#f5f5f5] text-[#111] p-[30px] md:p-[40px] flex flex-col shadow-2xl relative w-[90%] max-w-[500px] rounded-[30px] box-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center w-full mb-[25px]">
                            <h3 className="text-[22px] md:text-[26px] font-medium text-[#111] m-0 leading-none">
                                Project Link
                            </h3>
                            <button
                                onClick={closeShareModal}
                                className="text-[28px] text-[#111] opacity-60 hover:opacity-100 transition-all duration-300 hover:rotate-90 outline-none border-none bg-transparent cursor-pointer leading-none flex items-center justify-center translate-y-[-2px]"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="w-full bg-[#ffffff] h-[60px] rounded-[16px] px-[20px] mb-[30px] flex items-center box-border overflow-hidden">
                            <p className="text-[16px] font-medium text-[#111] truncate select-all outline-none w-full">
                                {currentUrl}
                            </p>
                        </div>

                        <div className="flex justify-start w-full">
                            <button
                                onClick={handleCopyLink}
                                className={`flex items-center justify-center gap-[10px] w-[160px] h-[55px] rounded-[16px] text-[18px] font-medium transition-all duration-300 outline-none border-none cursor-pointer ${copyText === "Copy"
                                    ? "bg-[#ebebeb] text-[#111] hover:bg-[#ff6d6d] hover:text-[#ebebeb]"
                                    : "bg-[#22c55e] text-white"
                                    }`}
                            >
                                {copyText === "Copy" ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                )}
                                <span style={{ transform: 'translateY(1px)' }}>{copyText}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}