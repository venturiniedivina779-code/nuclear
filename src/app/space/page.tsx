'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';
import { Preloader } from '@/components/Preloader';

export default function SpacePage() {
    const [loading, setLoading] = useState(true);
    const [volume, setVolume] = useState(0);
    const lastVolumeRef = useRef(0.5);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Мгновенно прячем элементы при входе на страницу
    useEffect(() => {
        gsap.set([".custom-vol", ".custom-insta", ".custom-tg", ".custom-behance"], { opacity: 0, y: 30 });
        return () => {
            gsap.set([".custom-vol", ".custom-insta", ".custom-tg", ".custom-behance"], { clearProps: "all" });
        };
    }, []);

    // GSAP: Плавное появление после загрузки
    useEffect(() => {
        if (!loading) {
            const selectors = [".custom-home-btn", ".custom-nav", ".space-fade", ".animate-up"];
            gsap.fromTo(selectors,
                { y: 30, opacity: 0 },
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

    // ЛОГИКА ЗВУКА
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = volume === 0;
        }
    }, [volume]);

    const muteVolume = () => {
        if (volume > 0) {
            lastVolumeRef.current = volume;
            setVolume(0);
        } else {
            setVolume(lastVolumeRef.current);
        }
    };

    const increaseVolume = () => {
        setVolume((prev) => Math.min(prev + 0.1, 1));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <main className="fixed inset-0 w-full h-[100dvh] bg-[#111] text-[#ebebeb] overflow-hidden z-[60]">

            {/* ====== ЭКРАН ЗАГРУЗКИ (Вызов компонента) ====== */}
            <Preloader
                variant="space"
                isLoading={loading}
                onComplete={() => setLoading(false)}
            />

            {/* ВИДЕО БЭКГРАУНД */}
            <video
                ref={videoRef}
                src="/videos/video4.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-0 space-fade"
            />

            {/* ИНТЕРФЕЙС ПОВЕРХ ВИДЕО */}
            <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none blend-exclusion">

                {/* БЕГУНОК ГРОМКОСТИ */}
                <div className="custom-vol pointer-events-auto flex items-center gap-4 animate-up opacity-0 absolute top-3/4 left-[6vw] -translate-y-1/2">
                    <button onClick={muteVolume} className="bg-transparent border-none text-[#ebebeb] hover:text-[#ebebeb]/70 transition-colors cursor-pointer outline-none flex items-center justify-center p-2">
                        <VolumeX size={18} />
                    </button>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 md:w-24 cursor-pointer accent-[#ebebeb]"
                    />

                    <button onClick={increaseVolume} className="bg-transparent border-none text-[#ebebeb] hover:text-[#ebebeb]/70 transition-colors cursor-pointer outline-none flex items-center justify-center p-2">
                        <Volume2 size={18} />
                    </button>
                </div>

                {/* СОЦИАЛЬНЫЕ СЕТИ */}
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

                <div className="custom-behance pointer-events-auto animate-up opacity-0">
                    <a href="https://www.behance.net/" target="_blank" rel="noopener noreferrer"
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
        </main>
    );
}