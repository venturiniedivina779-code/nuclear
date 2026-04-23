'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface LightboxProps {
    photos: string[];
    currentIndex: number | null;
    setCurrentIndex: (index: number | null) => void;
}

export const Lightbox = ({ photos, currentIndex, setCurrentIndex }: LightboxProps) => {
    const [isClosing, setIsClosing] = useState(false);
    const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, []);

    // Блокировка скролла страницы, когда Лайтбокс открыт
    useEffect(() => {
        if (currentIndex !== null && !isClosing) {
            document.documentElement.classList.add('lightbox-is-open');
        } else {
            document.documentElement.classList.remove('lightbox-is-open');
        }
        return () => document.documentElement.classList.remove('lightbox-is-open');
    }, [currentIndex, isClosing]);

    // Плавное закрытие
    const closeLightbox = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation();
        setIsClosing(true);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
            setCurrentIndex(null);
            setIsClosing(false);
        }, 300);
    }, [setCurrentIndex]);

    const showNextPhoto = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation();
        if (currentIndex === null) return;
        setCurrentIndex((currentIndex + 1) % photos.length);
    }, [currentIndex, photos.length, setCurrentIndex]);

    const showPrevPhoto = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation();
        if (currentIndex === null) return;
        setCurrentIndex((currentIndex - 1 + photos.length) % photos.length);
    }, [currentIndex, photos.length, setCurrentIndex]);

    // Управление с клавиатуры (Escape, Влево, Вправо)
    useEffect(() => {
        if (currentIndex === null || isClosing) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox(e);
            if (e.key === 'ArrowRight') showNextPhoto(e);
            if (e.key === 'ArrowLeft') showPrevPhoto(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isClosing, closeLightbox, showNextPhoto, showPrevPhoto]);

    return (
        <div
            className={`fixed inset-0 w-full h-[100dvh] bg-[#ebebeb] flex flex-col items-center z-[99999] transition-opacity duration-300 ease-out ${currentIndex !== null && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            onClick={closeLightbox}
        >
            {currentIndex !== null && (
                <>
                    <div className="relative w-full h-[80vh] flex items-center justify-center pointer-events-none p-[5vh]">
                        <Image
                            src={photos[currentIndex]}
                            alt={`Photo ${currentIndex}`}
                            fill
                            className={`object-contain select-none transition-transform duration-300 ease-out ${!isClosing ? 'scale-100' : 'scale-95'}`}
                        />
                    </div>

                    <div className="mt-auto w-full flex items-center justify-center gap-[10px] pb-[8vh] pointer-events-auto">
                        <button
                            onClick={showPrevPhoto}
                            onMouseEnter={(e) => gsap.to(e.currentTarget.firstChild, { x: -15, opacity: 1, duration: 0.4, ease: "power3.out" })}
                            onMouseLeave={(e) => gsap.to(e.currentTarget.firstChild, { x: 0, opacity: 0.4, duration: 0.4, ease: "power3.out" })}
                            className="outline-none border-none bg-transparent cursor-pointer p-[30px] md:p-[50px]"
                        >
                            <span className="block text-[11px] md:text-[12px] font-bold tracking-[0.2em] uppercase text-[#111] opacity-40">Left</span>
                        </button>

                        <button
                            onClick={closeLightbox}
                            onMouseEnter={(e) => gsap.to(e.currentTarget.firstChild, { rotate: 90, scale: 1.2, opacity: 1, duration: 0.5, ease: "back.out(1.5)" })}
                            onMouseLeave={(e) => gsap.to(e.currentTarget.firstChild, { rotate: 0, scale: 1, opacity: 0.4, duration: 0.4, ease: "power3.out" })}
                            className="outline-none border-none bg-transparent flex items-center justify-center cursor-pointer p-[30px] md:p-[50px]"
                        >
                            <span className="block text-[28px] md:text-[32px] font-light text-[#111] opacity-40">✕</span>
                        </button>

                        <button
                            onClick={showNextPhoto}
                            onMouseEnter={(e) => gsap.to(e.currentTarget.firstChild, { x: 15, opacity: 1, duration: 0.4, ease: "power3.out" })}
                            onMouseLeave={(e) => gsap.to(e.currentTarget.firstChild, { x: 0, opacity: 0.4, duration: 0.4, ease: "power3.out" })}
                            className="outline-none border-none bg-transparent cursor-pointer p-[30px] md:p-[50px]"
                        >
                            <span className="block text-[11px] md:text-[12px] font-bold tracking-[0.2em] uppercase text-[#111] opacity-40">Right</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};