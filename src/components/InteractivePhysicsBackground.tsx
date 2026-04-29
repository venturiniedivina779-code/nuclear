'use client';

import React, { useEffect, useRef } from 'react';
import { Engine, Runner, World, Bodies, Body, Events } from 'matter-js';

// --- НАСТРОЙКИ ЗВЕЗД ---
const STARS_DATA = [
    { id: 1, size: 450, text: '✹' },
    { id: 2, size: 200, text: '✷' },
    { id: 3, size: 170, text: '✦' },
    { id: 4, size: 150, text: '✹' },
];

export default function InteractivePhysicsBackground() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine | null>(null);

    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const bodiesRef = useRef<Body[]>([]);

    useEffect(() => {
        if (!sceneRef.current) return;

        const width = sceneRef.current.clientWidth;
        const height = sceneRef.current.clientHeight;

        // 1. Инициализация (Строгий ноль по гравитации, навсегда)
        const engine = Engine.create({
            gravity: { x: 0, y: 0 }
        });
        engineRef.current = engine;

        // 2. Стены
        const wallThickness = 200;
        const walls = [
            Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true }),
            Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, { isStatic: true }),
            Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, { isStatic: true }),
            Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true })
        ];

        // 3. Создаем тела (Настройки для медитативности)
        const bodies = STARS_DATA.map((star, index) => {
            return Bodies.circle(
                width * 0.3 + index * 100,
                height * 0.5,
                star.size * 0.45,
                {
                    restitution: 0.2,  // Очень мягкие удары (как столкновение подушек)
                    friction: 0,
                    frictionAir: 0.08, // Густая среда (сироп/вода). Гасит любые резкие рывки.
                    density: star.size * 0.001
                }
            );
        });

        bodiesRef.current = bodies;
        World.add(engine.world, [...walls, ...bodies]);

        const runner = Runner.create();
        Runner.run(runner, engine);

        // 4. МЯГКИЙ ПОТОК (Flow Field)
        Events.on(engine, 'beforeUpdate', () => {
            const time = engine.timing.timestamp;

            bodies.forEach((body, i) => {
                // Скорость течения времени для волн (очень медленно)
                const speed = 0.0001;

                // Наложение двух волн друг на друга дает сложную, непредсказуемую, но плавную траекторию
                const waveX = Math.sin(time * speed + i) + Math.sin(time * speed * 0.5 + i * 2);
                const waveY = Math.cos(time * speed * 1.2 + i) + Math.cos(time * speed * 0.4 + i * 2);

                const forceScale = 0.00015; // Крошечная сила

                let forceX = waveX * body.mass * forceScale;
                let forceY = waveY * body.mass * forceScale;

                // Магнит к центру: не дает звездам тереться о стены, плавно возвращая их в кадр
                const centerX = width / 2;
                const centerY = height / 2;
                const distToCenterX = centerX - body.position.x;
                const distToCenterY = centerY - body.position.y;

                forceX += distToCenterX * body.mass * 0.0000005;
                forceY += distToCenterY * body.mass * 0.0000005;

                // Применяем силы
                Body.applyForce(body, body.position, { x: forceX, y: forceY });

                // === НОВОЕ ХАОТИЧНОЕ ВРАЩЕНИЕ ===
                // Смешиваем две разные волны (медленную и чуть побыстрее), 
                // чтобы направление и скорость вращения менялись непредсказуемо.
                const spinWave = Math.sin(time * 0.00015 + i) + Math.cos(time * 0.0003 + i * 2);

                // Увеличили силу вращения, но густой frictionAir (0.08) 
                // всё равно сделает его текучим и мягким
                body.torque = spinWave * body.mass * 0.05;
            });
        });

        // 5. Синхронизация DOM
        Events.on(engine, 'afterUpdate', () => {
            bodies.forEach((body, i) => {
                const element = textRefs.current[i];
                if (element) {
                    element.style.transform = `translate3d(${body.position.x}px, ${body.position.y}px, 0) rotate(${body.angle}rad)`;
                }
            });
        });

        return () => {
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            // Никаких таймеров не осталось, память чистая!
        };
    }, []);

    return (
        <div ref={sceneRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {STARS_DATA.map((star, i) => (
                <div
                    key={star.id}
                    ref={(el) => { textRefs.current[i] = el; }}
                    className="absolute top-0 left-0 flex items-center justify-center pointer-events-none"
                    style={{
                        width: star.size,
                        height: star.size,
                        fontSize: `${star.size * 0.8}px`,
                        color: '#cfcfcf',
                        opacity: 0.3,
                        marginTop: -star.size / 2,
                        marginLeft: -star.size / 2,
                        fontFamily: 'sans-serif',
                        willChange: 'transform',
                    }}
                >
                    {star.text}
                </div>
            ))}
        </div>
    );
}