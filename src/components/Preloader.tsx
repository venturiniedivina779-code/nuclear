'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Lottie from 'lottie-react';
import homeAnimationData from '@/data/SampleAnimation01.json';
import spaceAnimationData from '@/data/loading_bar.json';

interface PreloaderProps {
    variant: 'home' | 'space';
    isLoading: boolean;
    onComplete: () => void;
}

export const Preloader = ({ variant, isLoading, onComplete }: PreloaderProps) => {
    const [mounted, setMounted] = useState(false);

    // Убеждаемся, что мы в браузере (для работы document.body)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Логика таймера для Space (ровно 3.5 секунды)
    useEffect(() => {
        if (variant !== 'space' || !isLoading) return;

        const timer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => clearTimeout(timer);
    }, [variant, isLoading, onComplete]);

    // Защитный таймер для Home, чтобы сайт не вис вечно
    useEffect(() => {
        if (variant !== 'home' || !isLoading) return;
        const backupTimer = setTimeout(() => {
            console.log("Прелоадер закрыт по страховке");
            onComplete();
        }, 5000); // Через 5 секунд сайт откроется в любом случае
        return () => clearTimeout(backupTimer);
    }, [variant, isLoading, onComplete]);

    // Если не загрузка ИЛИ компонент еще не вмонтирован - ничего не рендерим
    if (!isLoading || !mounted) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#ebebeb', // Твой серый фон
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999999
            }}
        >
            {/* РЕЖИМ 1: HOME */}
            {variant === 'home' && (
                <div className="w-80 h-80 md:w-[450px] md:h-[450px]">
                    <Lottie animationData={homeAnimationData} loop={false} onComplete={onComplete} />
                </div>
            )}

            {/* РЕЖИМ 2: SPACE (Новая полоска загрузки) */}
            {variant === 'space' && (
                <div className="flex items-center justify-center w-[30vw] md:w-[250px]">
                    <Lottie animationData={spaceAnimationData} loop={true} />
                </div>
            )}
        </div>,
        document.body
    );
};