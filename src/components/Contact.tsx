'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

interface ProjectPageProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function ProjectPage({ isOpen, onClose }: ProjectPageProps) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const customCursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });

  const [isDesktop, setIsDesktop] = useState(true);

  // Resize listener for layout breakpoints
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let ctx: gsap.Context;

    const timeout = setTimeout(() => {
      ctx = gsap.context(() => {
        // Entrance Animation
        const leftEls = leftPanelRef.current?.querySelectorAll('.animate-stagger');
        if (leftEls && leftEls.length > 0) {
          gsap.fromTo(
            Array.from(leftEls),
            { y: 5, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
          );
        }

        // Custom Cursor ticker
        const renderTick = () => {
          if (customCursorRef.current) {
            gsap.to(customCursorRef.current, {
              x: cursorPos.current.x,
              y: cursorPos.current.y,
              duration: 0.5,
              ease: 'power3.out',
            });
          }
        };

        gsap.ticker.add(renderTick);

        return () => {
          gsap.ticker.remove(renderTick);
        };
      });
    }, 500);

    const handleMouseMove = (e: MouseEvent) => {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timeout);
      if (ctx) ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isOpen]);

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-[#efefef] text-[#111] overflow-hidden">

      {/* CUSTOM CURSOR */}
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

      <div
        className="absolute top-0 left-0 w-full h-full overflow-visible z-30"
      >

        <div
          ref={leftPanelRef}
          className="h-[100dvh] flex flex-col justify-between p-[1vw] md:p-[6vw] lg:p-[4vw] px-[8vw] md:px-[60px] pointer-events-auto z-10 shrink-0 bg-transparent md:bg-transparent"
          style={{
            position: 'relative',
            top: 0,
            left: 0,
            width: '100%',
          }}
        >
          {/* Welcome text duplicate from home page */}
          <div
            className="pointer-events-auto animate-stagger absolute group cursor-pointer overflow-hidden"
            style={{ top: '40px', left: '40px', height: '20px' }}
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

          <div className="animate-stagger cursor-pointer w-fit hover:opacity-70 transition-opacity hidden lg:block" onClick={onClose}>
            <img src="/Logo_icon.svg" alt="Logo" className="w-[120px] md:w-[150px] lg:w-[150px] h-auto object-contain" />
          </div>

          <div className="animate-stagger hidden md:block lg:hidden cursor-pointer w-fit hover:opacity-70 transition-opacity" onClick={onClose}>
            <img src="/Logo_icon.svg" alt="Logo" className="w-[80px] md:w-[100px] h-auto object-contain" />
          </div>

          <div className="animate-stagger flex flex-col my-auto max-w-[100%] lg:max-w-[95%]">

            <p className="text-[1vw] sm:text-[4vw] md:text-[2.5vw] lg:text-[1.3vw] font-medium leading-[1.4] lg:leading-[1.3] text-[#111] opacity-90 mb-[3vw] lg:mb-[2vw]">
              It's a modern minimal skin care website <br />
              where I tried to make the design very eye <br />
              catchy and layout is very clean and used a <br />
              Beautiful typeface to emphasis <br />
              the brand theme.
            </p>
            <span className="text-[1vw] md:text-[2vw] lg:text-[1.1vw] font-bold tracking-tight text-[#111] opacity-80 mt-[2vw] lg:mt-0">Members</span>

            <button
              onClick={onClose}
              className="relative w-[100px] h-[100px] md:w-[48px] md:h-[48px] lg:w-[54px] lg:h-[54px] mt-[5vw] lg:mt-[2.5vw] opacity-90 hover:opacity-50 transition-opacity outline-none focus:outline-none border-none bg-transparent"
            >
              <Image src="/back_icon.svg" alt="Back" fill className="object-contain" />
            </button>
          </div>

          <div
            className="animate-stagger hidden lg:flex flex-col items-start gap-[15px] w-fit cursor-pointer group"
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

      </div>
    </div>
  );
}
