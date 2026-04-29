'use client';

import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Preloader } from '@/components/Preloader';
import { Typewriter } from '@/components/ui/Typewriter';
import { TextPressure } from '@/components/ui/TextPressure';
import InteractivePhysicsBackground from '@/components/InteractivePhysicsBackground';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'adaptive' | 'desktop'>('mobile');

  // 1. АНИМАЦИЯ ПОЯВЛЕНИЯ И ОПРЕДЕЛЕНИЕ ТИПА УСТРОЙСТВА
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 1024) setViewMode('mobile');
      else if (width <= 1440) setViewMode('adaptive');
      else setViewMode('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    gsap.set([".custom-vol"], { opacity: 0, y: 30 });

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.set([".custom-vol"], { clearProps: "all" });
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const selectors = [".custom-home-btn", ".custom-nav", ".animate-up"];

      gsap.fromTo(selectors,
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.2
        }
      );

      return () => {
        gsap.killTweensOf(selectors);
      };
    }
  }, [loading]);

  return (
    <main className="relative w-screen h-screen bg-[#ebebeb] overflow-hidden">

      {/* ====== ЭКРАН ЗАГРУЗКИ (Лоадер) ====== */}
      <Preloader
        variant="home"
        isLoading={loading}
        onComplete={() => setLoading(false)}
      />

      {/* ====== НАШ НОВЫЙ ФОН ====== */}
      <InteractivePhysicsBackground />

      {/* ====== ОСНОВНОЙ КОНТЕНТ СТРАНИЦЫ ====== */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">

        {/* 1. ФОНОВЫЙ ЗАГОЛОВОК (Вне blend-exclusion) - виден везде, кроме мобилок */}
        {viewMode !== 'mobile' && (
          <div className="absolute top-[-18vh] left-[4vw] pointer-events-none z-0">
            <div className="w-[150vw] opacity-[0.02] text-left">
              <TextPressure
                text={"   Ядер\nный\n    Сад"}
                className="text-[24vw] leading-[0.8] tracking-tighter text-[#000] uppercase font-black"
                maxDist={500} // Огромный радиус для огромных букв
                skewActive={35} // Сильнее наклон
                animateMode={viewMode === 'desktop' ? 'none' : 'v-cursor'} // На десктопе - мышь, на мобилках - авто
              />
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full z-[95] pointer-events-none blend-exclusion">

          {/* Приветственный текст (Скрыт на мобилках, как и было) */}
          <div className="animate-up opacity-0 hidden lg:block absolute top-[40px] left-[22.2vw]">
            <span className="text-sm font-bold tracking-widest text-[#ebebeb]">
              Welcome <br /> to other world.
            </span>
          </div>

          {/* Заголовок (Для Mobile и Desktop - внутри blend-exclusion) */}
          {viewMode !== 'adaptive' && (
            <div
              className={`animate-up opacity-0 absolute transition-all duration-700
                  ${viewMode === 'mobile'
                  ? 'w-[90vw] top-[14vh] left-[6vw]'
                  : 'w-[50vw] top-[20vh] left-[22.2vw]'}`}
            >
              <TextPressure
                text={"Ядерный\nСад"}
                className="text-[length:var(--title-size)] leading-[0.95] lg:leading-[0.9] tracking-tighter text-[#ebebeb]"
                animateMode="random" // Всегда случайные вспышки
              />
            </div>
          )}

          {/* Описание (В нашей мастерской...) */}
          <div
            className={`animate-up opacity-0 absolute transition-all duration-700 z-10
              ${viewMode === 'mobile'
                ? 'w-[88vw] top-[37vh] left-[6vw]'
                : viewMode === 'adaptive'
                  ? 'w-[40vw] top-[30vh] -translate-y-1/2 left-[30vw]'
                  : 'w-[40vw] top-[50vh] left-[30vw]'}`}
          >
            <p className="text-[length:var(--desc-size)] font-medium leading-[1.45] lg:leading-[1.4] text-[#ebebeb]">
              <Typewriter
                text="В нашей мастерской рождаются самые разные форматы — от независимого самиздата до концептуального серебра. Мы ценим уникальность, поэтому каждый релиз выпускается строгим лимитом или вовсе в одном экземпляре. Загляните в меню проектов: там собраны наши актуальные коллекции, включая открытки, арт-игрушки, зины и серебряные предметы"
                speed={25}
                delay={3500}
              />
            </p>
          </div>

          {/* Футер-текст слева (СДВИНУТ ВЫШЕ НА МОБИЛКАХ: bottom-[16vh] -> bottom-[24vh], чтобы дать место ссылкам) */}
          <div className="animate-up opacity-0 absolute bottom-[26vh] left-[6vw] lg:bottom-auto lg:top-[50vh] lg:left-[40px] lg:-translate-y-1/2 lg:w-[12vw]">
            <p className="text-[14px] md:text-[11px] lg:text-[16px] font-bold tracking-widest leading-tight text-[#ebebeb]">
              Thank you <br /> for visiting this site.
            </p>
          </div>

          {/* СОЦИАЛЬНЫЕ СЕТИ */}
          {/* INSTAGRAM */}
          {/* Класс custom-insta сам всё спозиционирует из globals.css */}
          <div className="custom-insta pointer-events-auto animate-up opacity-0">
            <a href="https://www.instagram.com/gardennuclear/" target="_blank" rel="noopener noreferrer"
              className="group inline-block p-[15px] -m-[15px] no-underline outline-none cursor-pointer">
              <div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block' }}>
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 flex flex-col">
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    instagram
                  </span>
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    instagram
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* TELEGRAM */}
          {/* Класс custom-tg сам всё спозиционирует из globals.css */}
          <div className="custom-tg pointer-events-auto animate-up opacity-0">
            <a href="https://t.me" target="_blank" rel="noopener noreferrer"
              className="group inline-block p-[15px] -m-[15px] no-underline outline-none cursor-pointer">
              <div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block' }}>
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 flex flex-col">
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    telegram
                  </span>
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    telegram
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="custom-behance pointer-events-auto animate-up opacity-0 absolute">
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer"
              className="group inline-block p-[15px] -m-[15px] no-underline outline-none cursor-pointer">
              <div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block' }}>
                <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 flex flex-col">
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    behance
                  </span>
                  <span className="text-[15px] lg:text-sm font-bold tracking-widest text-[#ebebeb] flex items-center" style={{ height: '20px', whiteSpace: 'nowrap' }}>
                    behance
                  </span>
                </div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}