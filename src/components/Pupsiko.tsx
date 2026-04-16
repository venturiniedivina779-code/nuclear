'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Lottie from 'lottie-react';

interface PupsikoProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome?: () => void;
}

const productPhotos = [
  '/product/Image1.png',
  '/product/Image2.png',
  '/product/Image3.png',
  '/product/image4.png',
  '/product/image5.png',
  '/product/image6.png',
  '/product/Image1.png',
  '/product/Image2.png',
];

export default function Pupsiko({ isOpen, onClose, onGoHome }: PupsikoProps) {
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [contentHeight, setContentHeight] = useState(2000);
  const [arrowAnimData, setArrowAnimData] = useState<any>(null);

  // === РЕФЫ ДЛЯ КУРСОРA ===
  const customCursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef({ target: 0, current: 0 });

  useEffect(() => {
    fetch('/arrow.json')
      .then(response => response.json())
      .then(data => setArrowAnimData(data))
      .catch(error => console.error('Ошибка загрузки стрелки:', error));
  }, []);

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 500);
  };

  useEffect(() => {
    if (fullscreenIdx !== null && !isClosing) {
      document.documentElement.classList.add('lightbox-is-open');
    } else {
      document.documentElement.classList.remove('lightbox-is-open');
    }
    return () => document.documentElement.classList.remove('lightbox-is-open');
  }, [fullscreenIdx, isClosing]);

  // === ЛОГИКА АНИМАЦИИ (СКРОЛЛ + КУРСОР) ===
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const renderTick = () => {
      // 1. Анимация курсора (как на странице project)
      if (customCursorRef.current) {
        gsap.to(customCursorRef.current, {
          x: cursorPos.current.x,
          y: cursorPos.current.y,
          duration: 0.5,
          ease: 'power3.out',
        });
      }

      // 2. Анимация скролла
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

    const resizeObserver = new ResizeObserver(() => {
      let h = 0;
      if (rightContentRef.current) h += rightContentRef.current.offsetHeight;
      if (leftPanelRef.current) {
        const isFixed = window.getComputedStyle(leftPanelRef.current).position === 'fixed';
        if (!isFixed) h += leftPanelRef.current.offsetHeight;
      }
      setContentHeight(h + 200);
    });

    if (rightContentRef.current) resizeObserver.observe(rightContentRef.current);
    if (leftPanelRef.current) resizeObserver.observe(leftPanelRef.current);

    return () => {
      gsap.ticker.remove(renderTick);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
    };
  }, [isOpen]);

  const closeLightbox = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      setFullscreenIdx(null);
      setIsClosing(false);
    }, 300);
  }, []);

  const showNextPhoto = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (fullscreenIdx === null) return;
    setFullscreenIdx((prev) => (prev !== null ? (prev + 1) % productPhotos.length : 0));
  }, [fullscreenIdx]);

  const showPrevPhoto = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (fullscreenIdx === null) return;
    setFullscreenIdx((prev) => (prev !== null ? (prev - 1 + productPhotos.length) % productPhotos.length : 0));
  }, [fullscreenIdx]);

  useEffect(() => {
    if (fullscreenIdx === null || isClosing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox(e);
      if (e.key === 'ArrowRight') showNextPhoto(e);
      if (e.key === 'ArrowLeft') showPrevPhoto(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIdx, isClosing, closeLightbox, showNextPhoto, showPrevPhoto]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-[100dvh] bg-[#efefef] text-[#111] overflow-hidden z-[999] 
                  transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* === КАСТОМНЫЙ КУРСОР === */}
      <div
        ref={customCursorRef}
        className="custom-cursor hidden lg:block"
        style={{
          position: 'fixed', top: 35, left: 35, zIndex: 999999, // Самый высокий приоритет
          pointerEvents: 'none', transform: 'translate(-50%, -50%)',
        }}
      >
        <span style={{ fontSize: '58px', color: '#ff6d6d', lineHeight: 1 }}>✦</span>
      </div>

      {/* 1. КНОПКА ДОМОЙ */}
      <div className="global-menu-wrapper custom-home-btn pointer-events-auto z-[110]">
        <button
          onClick={onGoHome}
          className="text-sm font-bold tracking-widest text-[#111] opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-0 m-0 outline-none"
        >
          Kesa.today
        </button>
      </div>

      {/* 2. ТРЕК ДЛЯ СКРОЛЛА */}
      <div
        id="pupsiko-scroll-track"
        className="absolute top-0 left-0 w-full h-full overflow-y-auto custom-scrollbar z-20 pointer-events-auto"
        onScroll={(e) => { scrollState.current.target = e.currentTarget.scrollTop; }}
      >
        <div style={{ height: contentHeight }} className="w-px pointer-events-none opacity-0" />
      </div>

      {/* 3. КОНТЕНТ (ЛЕВО + ПРАВО) */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-30 flex flex-col lg:block"
        onWheel={(e) => {
          const scrollDiv = document.getElementById('pupsiko-scroll-track');
          if (scrollDiv) scrollDiv.scrollTop += e.deltaY;
        }}
      >
        <div
          ref={leftPanelRef}
          className="global-menu-wrapper flex flex-col justify-start lg:justify-center pointer-events-auto z-40 shrink-0 relative w-full h-auto pt-[12vh] pb-[8vh] px-[6vw] md:pt-[20vh] md:pb-[10vh] md:px-[60px] lg:fixed lg:top-0 lg:left-0 lg:w-[35%] lg:h-[100dvh] lg:py-[6vh] lg:px-[4vw] box-border"
        >
          <div className="flex flex-col w-full max-w-[100%] lg:max-w-[90%] my-auto lg:m-auto">
            <h2 className="text-[32px] md:text-[40px] lg:text-[3.5vw] font-bold tracking-tighter leading-none mb-6">Pupsiko</h2>
            <p className="text-[20px] md:text-lg lg:text-[1.2vw] font-medium leading-[1.6] opacity-90 mb-12">Detailed description of the Pupsiko project. Awesom Magic Bee Boop Crazy Stuff. Loading Cmon Boom Bang. Lets do it</p>
            <div className="flex flex-col gap-1 mb-10">
              <span className="text-[11px] font-bold tracking-widest opacity-40 uppercase">Project Details</span>
              <span className="text-[14px] font-bold opacity-80 mt-2">Year: 2024</span>
              <span className="text-[14px] font-bold opacity-80">Role: Design & 3D</span>
            </div>

            <button
              onClick={handleBack}
              className="relative w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] opacity-90 hover:opacity-50 transition-opacity outline-none border-none bg-transparent flex items-center justify-center"
              style={{ marginTop: '40px' }}
            >
              {arrowAnimData && (
                <div className="w-full h-full scale-x-[-5] scale-y-[5] rotate-90">
                  <Lottie animationData={arrowAnimData} loop={true} />
                </div>
              )}
            </button>
          </div>
        </div>

        <div
          ref={rightContentRef}
          className="pointer-events-auto shrink-0 relative w-full h-auto px-[6vw] md:px-[60px] pb-[10vh] lg:absolute lg:top-[150px] lg:left-[35%] lg:w-[65%] lg:p-[4vw] lg:pt-0 box-border"
        >
          <div className="max-w-[1200px] mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px] lg:gap-[20px] w-full">
              {productPhotos.map((src, index) => (
                <div
                  key={index}
                  onClick={() => setFullscreenIdx(index)}
                  className="cursor-pointer group relative bg-[#e3e3e3] aspect-square overflow-hidden shadow-sm w-full"
                >
                  <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease group-hover:scale-[1.05]">
                    <Image src={src} alt={`Pupsiko ${index}`} width={800} height={800} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIGHTBOX */}
      <div
        className={`fixed inset-0 w-full h-[100dvh] bg-[#ebebeb] flex flex-col items-center z-[99999] transition-opacity duration-300 ease-out ${fullscreenIdx !== null && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeLightbox}
      >
        {fullscreenIdx !== null && (
          <>
            <div className="relative w-full h-[80vh] flex items-center justify-center pointer-events-none p-[5vh]">
              <Image
                src={productPhotos[fullscreenIdx]}
                alt="Full Product"
                fill
                className={`object-contain select-none transition-transform duration-300 ease-out ${!isClosing ? 'scale-100' : 'scale-95'}`}
              />
            </div>

            <div className="mt-auto w-full flex items-center justify-center gap-[30px] md:gap-[60px] pb-[8vh] pointer-events-auto">
              <button className="group outline-none border-none bg-transparent py-4 px-2" onClick={showPrevPhoto}>
                <span className="text-[11px] md:text-[13px] font-bold text-[#111] uppercase opacity-40 tracking-[0.2em] 
                                 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 
                                 group-hover:opacity-100 group-hover:tracking-[0.4em] group-hover:-translate-x-2 block">
                  Left
                </span>
              </button>

              <button
                className="text-[28px] md:text-[32px] font-light text-[#111] opacity-40 hover:opacity-100 
                                 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 
                                 hover:rotate-90 outline-none border-none bg-transparent leading-none flex items-center justify-center"
                onClick={closeLightbox}
              >
                ✕
              </button>

              <button className="group outline-none border-none bg-transparent py-4 px-2" onClick={showNextPhoto}>
                <span className="text-[11px] md:text-[13px] font-bold text-[#111] uppercase opacity-40 tracking-[0.2em] 
                                 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 
                                 group-hover:opacity-100 group-hover:tracking-[0.4em] group-hover:translate-x-2 block">
                  Right
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}