'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. Добавляем импорт портала
import Lottie from 'lottie-react';
import homeAnimationData from '@/data/SampleAnimation01.json';
import spaceAnimationData from '@/data/Loop.json';

interface PreloaderProps {
    variant: 'home' | 'space';
    isLoading: boolean;
    onComplete: () => void;
}

export const Preloader = ({ variant, isLoading, onComplete }: PreloaderProps) => {
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false); // 2. Стейт для безопасного рендера

    // Убеждаемся, что мы в браузере (для работы document.body)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Логика счетчика 0-100% для Space
    useEffect(() => {
        if (variant !== 'space' || !isLoading) return;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => onComplete(), 500);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);

        return () => clearInterval(timer);
    }, [variant, isLoading, onComplete]);

    // Если не загрузка ИЛИ компонент еще не вмонтирован - ничего не рендерим
    if (!isLoading || !mounted) return null;

    // 3. Оборачиваем всю нашу верстку в createPortal
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#ebebeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999 // Теперь этот z-index работает на 100%
            }}
        >

            {variant === 'home' && (
                <div className="w-80 h-80 md:w-[450px] md:h-[450px]">
                    <Lottie animationData={homeAnimationData} loop={false} onComplete={onComplete} />
                </div>
            )}

            {variant === 'space' && (
                <div className="relative flex items-center justify-center">
                    <div className="w-80 h-80 md:w-[450px] md:h-[450px]">
                        <Lottie animationData={spaceAnimationData} loop={true} />
                    </div>
                    <h1
                        className="absolute text-4xl md:text-6xl font-bold tracking-tighter pointer-events-none"
                        style={{ color: '#0033ffff', margin: 0 }}
                    >
                        {progress}%
                    </h1>
                </div>
            )}

        </div>,
        document.body // 4. Указываем, куда телепортировать (в конец body)
    );
};