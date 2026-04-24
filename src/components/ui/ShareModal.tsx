'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
    // 1. Ставим правильные русские слова
    const [copyText, setCopyText] = useState("Скопировать");
    const [currentUrl, setCurrentUrl] = useState("");
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Очистка таймера и GSAP-твинов при размонтировании
    useEffect(() => {
        setMounted(true);
        return () => {
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            if (modalRef.current) gsap.killTweensOf(modalRef.current);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
            );
        }
    }, [isOpen]);

    const handleClose = () => {
        if (!modalRef.current) return;
        gsap.to(modalRef.current, {
            opacity: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.in",
            onComplete: () => {
                onClose();
                // 2. При закрытии возвращаем исходный текст
                setCopyText("Скопировать");
            }
        });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            // 3. Текст при успешном копировании
            setCopyText("Скопировано!");
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
            copyTimerRef.current = setTimeout(() => setCopyText("Скопировать"), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className={`fixed inset-0 w-full h-[100dvh] bg-black/40 z-[999999] flex items-center justify-center backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="bg-[#f5f5f5] text-[#111] p-[30px] md:p-[40px] flex flex-col shadow-2xl relative w-[90%] max-w-[500px] rounded-[30px] box-border"
                onClick={(e) => e.stopPropagation()}
            >
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

                <div className="w-full bg-[#ffffff] h-[60px] rounded-[16px] px-[20px] mb-[30px] flex items-center box-border overflow-hidden">
                    <p className="text-[16px] font-medium text-[#111] truncate select-all outline-none w-full">
                        {currentUrl}
                    </p>
                </div>

                <div className="flex justify-start w-full">
                    <button
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-[10px] w-full h-[55px] rounded-[16px] text-[18px] font-medium transition-all duration-300 outline-none border-none cursor-pointer ${copyText === "Скопировать"
                            ? "bg-[#ebebeb] text-[#111] hover:bg-[#ff6d6d] hover:text-[#ebebeb]"
                            : "bg-[#dddddd] text-white"
                            }`}
                    >
                        {copyText === "Скопировать" ? (
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
        </div>,
        document.body
    );
};