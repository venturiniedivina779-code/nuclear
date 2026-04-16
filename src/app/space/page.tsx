'use client';

// 1. ВСЕ ИМПОРТЫ СТРОГО В САМОМ ВЕРХУ
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';
import { Preloader } from '@/components/Preloader';

export default function SpacePage() {
    // 2. ВСЕ ТВОИ СТЕЙТЫ (вернули их на место)
    const [loading, setLoading] = useState(true);
    const [volume, setVolume] = useState(0);
    const lastVolumeRef = useRef(0.5);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 3. ДОБАВЛЕННЫЙ БЛОК: Мгновенно прячем элементы при входе на страницу
    useEffect(() => {
        gsap.set([".custom-home-btn", ".custom-nav", ".custom-vol"], { opacity: 0, y: 30 });

        // Cleanup: когда страница умирает, стираем инлайн-стили
        return () => {
            gsap.set([".custom-home-btn", ".custom-nav", ".custom-vol"], { clearProps: "all" });
        };
    }, []);
    // 4. ТВОЙ КОД GSAP: Плавное появление после загрузки
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
        }
    }, [loading]);

    // ЛОГИКА ЗВУКА (оставляем без изменений)
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
        // Используем <main>, так семантически правильнее
        <main className="fixed inset-0 w-full h-[100dvh] bg-[#111] text-[#ebebeb] overflow-hidden z-[60]">

            {/* ====== ЭКРАН ЗАГРУЗКИ (Лоадер) ====== */}
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
                <div className="custom-vol pointer-events-auto flex items-center gap-4 animate-up opacity-0 absolute top-1/2 left-[6vw] -translate-y-1/2">
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
                <div className="custom-insta pointer-events-auto animate-up opacity-0 absolute bottom-[16vh] left-[6vw]">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                        className="no-underline outline-none text-sm font-bold tracking-widest !text-[#ebebeb] hover:opacity-70 transition-opacity">
                        instagram
                    </a>
                </div>

                {/* ...Остальные соцсети по аналогии... */}
            </div>
        </main>
    );
}