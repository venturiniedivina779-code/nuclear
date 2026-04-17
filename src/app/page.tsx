'use client';

import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Preloader } from '@/components/Preloader';

export default function Home() {
  const [loading, setLoading] = useState(true);

  // 1. АНИМАЦИЯ ПОЯВЛЕНИЯ
  useEffect(() => {
    gsap.set([".custom-vol"], { opacity: 0, y: 30 });

    // Cleanup: когда страница умирает, стираем инлайн-стили
    return () => {
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
    }
  }, [loading]);

  return (
    <main className="relative w-screen h-screen bg-[#ebebeb] overflow-hidden">

      {/* ====== ЭКРАН ЗАГРУЗКИ (Лоадер) ====== */}
      {/* Передаем функцию () => setLoading(false) внутрь пропса onComplete */}
      <Preloader
        variant="home"
        isLoading={loading}
        onComplete={() => setLoading(false)}
      />

      {/* ====== ОСНОВНОЙ КОНТЕНТ СТРАНИЦЫ ====== */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none blend-exclusion">

          {/* Приветственный текст */}
          <div className="animate-up opacity-0 hidden lg:block absolute top-[40px] left-[22.2vw]">
            <span className="text-sm font-bold tracking-widest text-[#ebebeb]">
              Welcome <br /> to other world.
            </span>
          </div>

          {/* Заголовок */}
          <div className="animate-up opacity-0 absolute w-[90vw] top-[14vh] left-[6vw] lg:w-[50vw] lg:top-[22vh] lg:left-[22.2vw]">
            <h1 className="text-[13vw] lg:text-[4.5vw] font-bold leading-[0.95] lg:leading-[0.9] tracking-tighter text-[#ebebeb]">
              Nuclear <br /> garden
            </h1>
          </div>

          {/* Описание */}
          <div className="animate-up opacity-0 absolute w-[88vw] top-[42vh] left-[6vw] md:w-[55vw] md:top-[auto] md:bottom-[32vh] md:left-[22vw] lg:w-[40vw] lg:top-[50vh] lg:bottom-auto lg:left-[30vw]">
            <p className="text-[16px] md:text-[2.6vw] lg:text-[1.8vw] font-medium leading-[1.45] lg:leading-[1.4] text-[#ebebeb]">
              Please note that we moved this freebie to Teachable, to also offer you a free video series with 5 secrets to design beautiful interfaces with the Golden Canon Grid.
            </p>
          </div>

          {/* Футер-текст слева */}
          <div className="animate-up opacity-0 absolute bottom-[16vh] left-[6vw] lg:bottom-auto lg:top-[50vh] lg:left-[40px] lg:-translate-y-1/2 lg:w-[12vw]">
            <p className="text-[10px] md:text-[11px] lg:text-[0.7vw] font-bold tracking-widest leading-tight text-[#ebebeb]">
              Thank you <br /> for visiting this site.
            </p>
          </div>

          {/* СОЦИАЛЬНЫЕ СЕТИ */}
          <div className="custom-insta pointer-events-auto animate-up opacity-0 absolute"> {/* Убедись, что тут правильно стоят позиции */}
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
              className="no-underline outline-none text-sm font-bold tracking-widest !text-[#ebebeb] hover:opacity-70 transition-opacity">
              instagram
            </a>
          </div>

          <div className="custom-tg pointer-events-auto animate-up opacity-0 absolute">
            <a href="https://t.me" target="_blank" rel="noopener noreferrer"
              className="no-underline outline-none text-sm font-bold tracking-widest !text-[#ebebeb] hover:opacity-70 transition-opacity">
              telegram
            </a>
          </div>

          <div className="custom-behance pointer-events-auto animate-up opacity-0 absolute">
            <a href="https://behance.net" target="_blank" rel="noopener noreferrer"
              className="no-underline outline-none text-sm font-bold tracking-widest !text-[#ebebeb] hover:opacity-70 transition-opacity">
              behance
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}