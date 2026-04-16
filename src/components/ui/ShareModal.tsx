'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
    const [copyText, setCopyText] = useState("Copy");
    const [currentUrl, setCurrentUrl] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    // Получаем актуальный URL только на клиенте
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, [isOpen]); // Обновляем ссылку каждый раз при открытии окна

    // Анимация появления
    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
            );
        }
    }, [isOpen]);

    // Анимация закрытия
    const handleClose = () => {
        if (!modalRef.current) return;
        gsap.to(modalRef.current, {
            opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.in",
            onComplete: () => {
                onClose(); // Говорим родителю, что окно закрыто
                setCopyText("Copy"); // Возвращаем текст кнопки в исходное состояние
            }
        });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopyText("Copied");
            setTimeout(() => setCopyText("Copy"), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div
            className={`fixed inset-0 w-full h-[100dvh] bg-black/40 z-[300] flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="bg-[#f5f5f5] text-[#111] p-[30px] md:p-[40px] flex flex-col shadow-2xl relative w-[90%] max-w-[500px] rounded-[30px] box-border"
                onClick={(e) => e.stopPropagation()} // Чтобы клик по самому окну не закрывал его
            >
                {/* ШАПКА */}
                <div className="flex justify-between items-center w-full mb-[25px]">
                    <h3 className="text-[22px] md:text-[26px] font-medium text-[#111] m-0 leading-none">
                        Project Link
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-[28px] text-[#111] opacity-60 hover:opacity-100 transition-all duration-300 hover:rotate-90 outline-none border-none bg-transparent cursor-pointer leading-none flex items-center justify-center translate-y-[-2px]"
                    >
                        ✕
                    </button>
                </div>

                {/* ПОЛЕ СО ССЫЛКОЙ */}
                <div className="w-full bg-[#ffffff] h-[60px] rounded-[16px] px-[20px] mb-[30px] flex items-center box-border overflow-hidden">
                    <p className="text-[16px] font-medium text-[#111] truncate select-all outline-none w-full">
                        {currentUrl}
                    </p>
                </div>

                {/* КНОПКА COPY */}
                <div className="flex justify-start w-full">
                    <button
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-[10px] w-[160px] h-[55px] rounded-[16px] text-[18px] font-medium transition-all duration-300 outline-none border-none cursor-pointer ${copyText === "Copy"
                                ? "bg-[#ebebeb] text-[#111] hover:bg-[#ff6d6d] hover:text-[#ebebeb]"
                                : "bg-[#22c55e] text-white"
                            }`}
                    >
                        {copyText === "Copy" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        )}
                        <span style={{ transform: 'translateY(1px)' }}>{copyText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};