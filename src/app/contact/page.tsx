'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
// ВАЖНО: Проверь, что путь к компоненту совпадает с тем, куда ты его сохранил
import InteractiveRelax from '@/components/ui/InteractiveRelax';

// --- КОМПОНЕНТ "МАГНИТНЫЕ" СОЦСЕТИ (Без изменений) ---
const MagneticSocials = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const items = [
        { id: 1, name: 'Instagram', url: 'https://www.instagram.com/gardennuclear/', icon: '/icons/instagram.svg', iconColor: '/icons/instagram_color.svg' },
        { id: 2, name: 'Telegram', url: 'https://t.me', icon: '/icons/telegram.svg', iconColor: '/icons/telegram_color.svg' },
    ];

    return (
        <div
            className="animate-stagger opacity-0 flex flex-row items-center gap-[10px] md:gap-[20px] lg:gap-[30px] xl:gap-[10px] mt-[40px] lg:mt-[50px] xl:mt-[40px] z-10 w-max -ml-[15px]"
            onMouseLeave={() => setHoveredIndex(null)}
        >
            {items.map((item, index) => {
                let transformClass = "translate-x-0 scale-100 opacity-60";
                let currentIcon = item.icon;

                if (hoveredIndex !== null) {
                    if (index === hoveredIndex) {
                        transformClass = "scale-[1.4] opacity-100";
                        currentIcon = item.iconColor;
                    } else if (index < hoveredIndex) {
                        transformClass = "-translate-x-[25px] scale-90 opacity-30";
                    } else if (index > hoveredIndex) {
                        transformClass = "translate-x-[25px] scale-90 opacity-30";
                    }
                }

                return (
                    <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        className="outline-none cursor-pointer block shrink-0 p-[15px]"
                    >
                        <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${transformClass} w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] xl:w-[32px] xl:h-[32px]`}>
                            <img src={currentIcon} alt={item.name} className="w-full h-full object-contain pointer-events-none" />
                        </div>
                    </a>
                );
            })}
        </div>
    );
};

export default function ContactPage() {
    const [loading, setLoading] = useState(true);
    // Стейт для хранения всех трех анимаций
    const [animations, setAnimations] = useState<{ girl: any, cube: any, triangle: any } | null>(null);
    const loadTimerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // 1. ЕДИНЫЙ ЦИКЛ ЗАГРУЗКИ (Сразу 3 файла)
    useEffect(() => {
        gsap.set([".animate-stagger"], { opacity: 0, y: 20 });

        // Убедись, что файлы в папке public называются именно так и имеют формат .json
        Promise.all([
            fetch('/relax_girl.json').then(res => res.json()),
            fetch('/relax_cube.json').then(res => res.json()),
            fetch('/relax_triangle.json').then(res => res.json())
        ])
            .then(([girlData, cubeData, triangleData]) => {
                setAnimations({ girl: girlData, cube: cubeData, triangle: triangleData });

                loadTimerRef.current = setTimeout(() => {
                    setLoading(false);
                }, 100);
            })
            .catch(error => {
                console.error('Ошибка загрузки анимаций:', error);
                setLoading(false);
            });

        return () => {
            if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
            gsap.set([".animate-stagger"], { clearProps: "all" });
        };
    }, []);

    // 2. ЕДИНАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ
    useEffect(() => {
        if (!loading && animations) {
            let ctx = gsap.context(() => {
                gsap.fromTo(".animate-stagger",
                    { y: 20, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.08,
                        ease: "power4.out",
                        delay: 0.1
                    }
                );
            });
            return () => ctx.revert();
        }
    }, [loading, animations]);

    return (
        <main className="fixed top-0 left-0 w-full h-[100dvh] bg-[#efefef] text-[#111] overflow-hidden z-[60]">
            <div className="absolute top-0 left-0 w-full h-[100dvh] pointer-events-none z-30 flex flex-col xl:flex-row">
                <div className="pointer-events-auto w-full h-full xl:w-[45%] flex flex-col px-[6vw] xl:pl-[4vw] xl:pr-0 pt-[16vh] md:pt-[20vh] xl:pt-[28vh] box-border">
                    <div className="w-full">

                        {/* НАША НОВАЯ МНОГОСЛОЙНАЯ АНИМАЦИЯ */}
                        {animations && (
                            <InteractiveRelax
                                dataGirl={animations.girl}
                                dataCube={animations.cube}
                                dataTriangle={animations.triangle}
                            />
                        )}

                        <p className="animate-stagger opacity-0 text-[20px] md:text-[24px] lg:text-[28px] xl:text-[1.2vw] font-medium leading-[1.6] text-[#111] opacity-90 mb-12 md:mb-16 xl:mb-12 max-w-[500px] lg:max-w-[750px] xl:max-w-[500px]">
                            Мы любим создавать вещи на стыке разных форматов — от цифровых 3D-инсталляций до лимитированных дропов из серебра и арт-игрушек. Если у вас есть идея для совместного проекта или смелой коллаборации, пишите нам в Telegram. Всегда рады новым лицам!
                        </p>

                        <div className="flex flex-col gap-1 mb-8 lg:mb-12 xl:mb-8">
                            <span className="animate-stagger opacity-0 text-[11px] md:text-[13px] lg:text-[14px] xl:text-[11px] font-bold tracking-widest text-[#111] opacity-40 uppercase mb-2">
                                Contact Details
                            </span>
                            <a href="mailto:hello@kesa.today" className="animate-stagger opacity-0 text-[18px] md:text-[22px] lg:text-[26px] xl:text-[1.5vw] font-bold text-[#111] opacity-80 hover:opacity-100 transition-opacity no-underline w-max">
                                hello@kesa.today
                            </a>
                            <a href="tel:+1234567890" className="animate-stagger opacity-0 text-[18px] md:text-[22px] lg:text-[26px] xl:text-[1.5vw] font-bold text-[#111] opacity-80 hover:opacity-100 transition-opacity no-underline w-max mt-2">
                                +1 (234) 567-890
                            </a>
                        </div>

                        <MagneticSocials />
                    </div>
                </div>
                <div className="hidden xl:block xl:w-[55%] h-full pointer-events-none"></div>
            </div>
        </main>
    );
}