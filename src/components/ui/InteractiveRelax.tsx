'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import gsap from 'gsap';

interface InteractiveRelaxProps {
    dataGirl: any;
    dataCube: any;
    dataTriangle: any;
}

export default function InteractiveRelax({ dataGirl, dataCube, dataTriangle }: InteractiveRelaxProps) {
    const router = useRouter();

    // "Пульты управления" для конкретных кадров анимации
    const cubeRef = useRef<LottieRefCurrentProps>(null);
    const triangleRef = useRef<LottieRefCurrentProps>(null);

    const handleTriangleClick = () => {
        const wrapper = document.querySelector('.page-transition-wrapper');
        if (wrapper) {
            gsap.to(wrapper, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => router.push('/space') });
        } else {
            router.push('/space');
        }
    };

    return (
        <div className="animate-stagger opacity-0 w-[250px] md:w-[350px] lg:w-[450px] xl:w-[4.5vw] mb-6 md:mb-10 xl:mb-6 translate-x-[-15px] origin-left scale-[1.4] lg:scale-[1.7] xl:scale-[1.6] relative">

            {/* БЛОК С АНИМАЦИЯМИ (Отключаем события мыши, чтобы они не перекрывали хитбоксы) */}
            <div className="relative w-full h-full pointer-events-none">
                {/* 1. ФОН: ДЕВОЧКА */}
                <div className="relative z-0 w-full h-full">
                    <Lottie animationData={dataGirl} loop={true} />
                </div>

                {/* 2. КУБ (Левая картина) */}
                <div className="absolute top-[12px] left-[-15px] w-full h-full z-10">
                    <Lottie lottieRef={cubeRef} animationData={dataCube} autoplay={false} loop={false} />
                </div>

                {/* 3. ТРЕУГОЛЬНИК (Правая картина) */}
                <div className="absolute top-[7px] left-0 w-full h-full z-20">
                    <Lottie lottieRef={triangleRef} animationData={dataTriangle} autoplay={false} loop={false} />
                </div>
            </div>

            {/* ======================================================== */}
            {/* НЕВИДИМЫЕ ХИТБОКСЫ                                       */}
            {/* ======================================================== */}

            {/* Зона для Куба (Левая картина) */}
            <div
                className="absolute z-30 rounded-sm"
                style={{
                    width: '6%',
                    height: '6%',
                    top: '28%',
                    left: '6%'
                }}
                onMouseEnter={() => cubeRef.current?.playSegments([8, 32], true)}
                onMouseLeave={() => cubeRef.current?.playSegments([46, 68], true)}
            />

            {/* Зона для Треугольника (Правая картина) */}
            <div
                className="absolute z-30 rounded-sm"
                data-cursor="pointer"
                style={{
                    width: '22%',
                    height: '15%',
                    top: '22%',
                    left: '22%'
                }}
                onMouseEnter={() => triangleRef.current?.playSegments([8, 32], true)}
                onMouseLeave={() => triangleRef.current?.playSegments([46, 68], true)}
                onClick={handleTriangleClick}
            />
        </div>
    );
}