'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import Pupsiko from './Pupsiko';

interface ProjectPageProps {
  isOpen: boolean;
  onClose?: () => void;
}

const photos = [
  "photo_2024-07-20_02-30-46.jpg", "photo_2024-07-20_02-30-47.jpg", "photo_2024-07-20_02-30-48.jpg",
  "photo_2024-07-20_02-30-49.jpg", "photo_2024-07-24_22-14-02.jpg", "photo_2024-07-24_22-14-03.jpg",
  "photo_2024-07-24_22-14-04.jpg", "photo_2024-07-24_22-14-06.jpg", "photo_2024-07-24_22-14-07.jpg",
  "photo_2024-07-26_00-48-40.jpg", "photo_2024-07-26_00-48-41.jpg", "photo_2024-07-26_00-48-42.jpg",
  "photo_2024-07-26_00-48-43.jpg", "photo_2024-07-26_00-48-44.jpg", "photo_2024-07-27_21-01-35.jpg",
  "photo_2024-07-27_21-01-36.jpg", "photo_2024-07-27_21-01-37.jpg", "photo_2024-07-27_21-01-38.jpg",
  "photo_2024-07-27_21-01-39.jpg", "photo_2024-07-28_01-26-25.jpg", "photo_2024-07-28_01-26-26.jpg",
  "photo_2024-07-28_01-26-27.jpg", "photo_2024-07-28_01-26-28.jpg", "photo_2024-07-28_01-26-29.jpg",
  "photo_2024-07-28_01-26-30.jpg", "photo_2024-07-29_11-38-53.jpg", "photo_2024-07-29_11-38-54.jpg",
  "photo_2024-07-29_11-38-55.jpg", "photo_2024-07-29_11-38-56.jpg", "photo_2024-07-29_11-38-57.jpg"
].map((name, i) => ({
  id: i + 1,
  src: `/photo/${name}`
}));

export default function Journal({ isOpen, onClose }: ProjectPageProps) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const customCursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });

  const [isDesktop, setIsDesktop] = useState(true);

  const [productOpen, setProductOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  // GSAP animation for Pupsiko overlay
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

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      return;
    }

    let ctx: gsap.Context;

    const timeout = setTimeout(() => {
      ctx = gsap.context(() => {
        // Entrance animation for left panel
        const leftEls = leftPanelRef.current?.querySelectorAll('.animate-stagger');
        if (leftEls && leftEls.length > 0) {
          gsap.fromTo(
            Array.from(leftEls),
            { y: 5, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
          );
        }

        // Scroll-based card reveal via IntersectionObserver
        const cards = scrollContainerRef.current?.querySelectorAll('.journal-card');
        if (!cards) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.to(entry.target, {
                  opacity: 1,
                  scale: 1,
                  duration: 0.6,
                  ease: 'power2.out',
                });
                observer.unobserve(entry.target);
              }
            });
          },
          {
            root: scrollContainerRef.current,
            threshold: 0.1,
          }
        );

        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
      });
    }, 400);

    const handleMouseMove = (e: MouseEvent) => {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Custom cursor ticker
    const updateCursor = () => {
      if (customCursorRef.current) {
        gsap.to(customCursorRef.current, {
          x: cursorPos.current.x,
          y: cursorPos.current.y,
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    };
    gsap.ticker.add(updateCursor);

    return () => {
      clearTimeout(timeout);
      if (ctx) ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(updateCursor);
    };
  }, [isOpen]);

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-[#efefef] text-[#111] overflow-hidden">

      {/* Custom cursor */}
      <div
        ref={customCursorRef}
        style={{
          position: 'fixed',
          top: 35,
          left: 35,
          zIndex: 99,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span style={{ fontSize: '58px', color: '#ff6d6d', lineHeight: 1 }}>✦</span>
      </div>

      {/* Left panel — fixed on desktop */}
      <div
        ref={leftPanelRef}
        className="h-[100dvh] flex flex-col justify-between px-[60px] z-10 shrink-0 bg-[#efefef]"
        style={{
          position: isDesktop ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          width: isDesktop ? '35%' : '100%',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        {/* Kesa.today back link */}
        <div
          className="pointer-events-auto animate-stagger group cursor-pointer overflow-hidden"
          style={{ height: '20px' }}
          onClick={onClose}
        >
          <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2">
            <span className="text-sm font-bold tracking-widest text-[#111] opacity-70 block leading-[20px] whitespace-nowrap">
              Kesa.today
            </span>
            <span className="text-sm font-bold tracking-widest text-[#111] block leading-[20px] whitespace-nowrap">
              Kesa.today
            </span>
          </div>
        </div>

        <div className="pointer-events-auto animate-stagger cursor-pointer w-fit hover:opacity-70 transition-opacity hidden lg:block" onClick={onClose}>
          <img src="/Logo_icon.svg" alt="Logo" className="w-[150px] h-auto object-contain" />
        </div>

        <div className="animate-stagger flex flex-col">
          <p className="text-[1.3vw] font-medium leading-[1.4] text-[#111] opacity-90 mb-[2vw]">
            Photo archive <br />
            where I tried to make the design very eye <br />
            catchy and layout is very clean and used a <br />
            Beautiful typeface to emphasis <br />
            the brand theme.
          </p>
          <span className="text-[1.1vw] font-bold tracking-tight text-[#111] opacity-80">Members</span>

          <button
            onClick={onClose}
            className="pointer-events-auto relative w-[54px] h-[54px] mt-[2.5vw] opacity-90 hover:opacity-50 transition-opacity outline-none focus:outline-none border-none bg-transparent"
          >
            <Image src="/back_icon.svg" alt="Back" fill className="object-contain" />
          </button>
        </div>

        <div
          className="pointer-events-auto animate-stagger hidden lg:flex flex-col items-start gap-[15px] w-fit cursor-pointer group"
          onClick={onClose}
        >
          <div className="transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-rotate-90">
            <div className="w-[50px] h-[50px] relative rounded-full flex items-center justify-center">
              <span className="text-[20px] font-bold">←</span>
            </div>
          </div>
          <span className="text-[14px] font-bold tracking-tight opacity-90 transition-opacity">
            Golden Canon Grid
          </span>
        </div>
      </div>

      {/*
        Scroll container — positioned to the right of the fixed left panel.
        This is a real scrollable element so the browser handles all scroll events natively.
      */}
      <div
        ref={scrollContainerRef}
        className="absolute top-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{
          left: isDesktop ? '35%' : '0',
          width: isDesktop ? '65%' : '100%',
          zIndex: 20,
        }}
      >
        <div
          className="p-[4vw] px-[60px] pt-[15vh] pb-[10vh]"
        >
          <div className="max-w-[1200px] w-full">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
                gridAutoRows: isDesktop ? '350px' : '250px',
                gap: '15px',
              }}
            >
              {photos.map((item, i) => {
                let colSpan = 1;
                let rowSpan = 1;

                if (isDesktop) {
                  if (i % 6 === 0) { colSpan = 2; rowSpan = 2; }
                  else if (i % 6 === 2) { rowSpan = 2; }
                  else if (i % 6 === 4) { colSpan = 2; }
                }

                return (
                  <div
                    key={item.id}
                    className="journal-card group relative overflow-hidden"
                    style={{
                      gridColumn: `span ${colSpan}`,
                      gridRow: `span ${rowSpan}`,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e5e5e5',
                      opacity: 0,
                      scale: '0.97',
                    }}
                  >
                    <img
                      src={item.src}
                      alt="Journal Photo"
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pupsiko overlay */}
      <div
        ref={productRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 100,
          transform: 'scale(0.8)',
          opacity: 0,
          display: 'none',
          overflow: 'hidden',
        }}
      >
        <Pupsiko isOpen={productOpen} onClose={() => setProductOpen(false)} onGoHome={onClose} />
      </div>
    </div>
  );
}
