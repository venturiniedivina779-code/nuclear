# 🎯 Аудит Header.tsx — Проблема с хитбоксом меню

**Дата:** 2026-04-17  
**Файл:** `src/components/Header.tsx`  
**CSS:** `src/app/globals.css`

---

## Краткий вывод

Разработчик добавил `py-4` (padding: 16px сверху/снизу) на `<a>`-тег в `NavItem`, чтобы создать увеличенный хитбокс. Логика правильная — **но не работает по 3 независимым причинам**, которые нейтрализуют друг друга.

---

## Проблема №1 — CSS `globals.css` перебивает позиционирование с `!important`

### Где: `src/app/globals.css` (строки 93–134) и `Header.tsx` (строки 96, 124)

**Что сделал разработчик в JSX:**
```tsx
// Header.tsx, строка 96
<div className="custom-home-btn pointer-events-auto absolute top-[24px] ...">

// Header.tsx, строка 124
<nav className="custom-nav pointer-events-auto absolute top-[24px] ...">
```
Идея: сдвинуть `top` с 40px на 24px, чтобы компенсировать `py-4` (16px сверху). Тогда текст визуально будет на уровне ~40px от верха, а хитбокс будет от 24px до 76px.

**Что делает CSS в globals.css:**
```css
/* globals.css, строка 93–98 */
.custom-nav {
    position: absolute;
    top: 40px;        /* ← перебивает Tailwind top-[24px] на мобилке */
    gap: 16px;        /* ← добавляет gap поверх паддингов */
}

/* globals.css, строка 130–135 */
@media (min-width: 1024px) {
    .custom-nav {
        top: 40px !important;   /* ← !important полностью убивает top-[24px] */
        gap: 30px !important;   /* ← ещё больший gap */
    }
}
```

### Результат конфликта (на десктопе):

| Что ожидалось | Что происходит |
|---------------|----------------|
| `top: 24px` → текст на 40px, хитбокс 24px→76px | `top: 40px !important` → текст на **56px**, хитбокс 40px→92px |
| Паддинг `py-4` компенсирует смещение | Паддинг не компенсирует — текст уехал вниз |
| gap убран из nav | CSS `gap: 30px !important` всё равно работает |

**Итог:** хитбокс есть (40px–92px), но он смещён вниз. Текст виден на 56px от верха, хитбокс начинается на 40px. Пользователь кликает туда, где видит текст — и попадает в хитбокс. Но 16px сверху от текста — "мёртвая зона" визуально принадлежащая другому элементу.

---

## Проблема №2 — `overflow: hidden` делает хитбокс невидимым

### Где: `Header.tsx` (строка 43)

```tsx
// Header.tsx, строка 43
<div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block', flexShrink: 0 }}>
```

### Что происходит

Структура `NavItem`:
```
<a> (высота: 52px = 20px текст + 16px padding сверху + 16px снизу)
  └── <div overflow-hidden height=20px>   ← визуально ограничено 20px
        └── текст (20px) + hover-текст (20px)
```

Хитбокс `<a>` = **52px** (технически корректный).  
Но визуально пользователь видит только **20px** — остальные 32px выглядят как пустое пространство.

> [!WARNING]
> `overflow: hidden` на внутреннем `div` не уменьшает хитбокс `<a>`, но делает расширенную зону клика **невидимой**. Пользователь не знает, что пустое пространство кликабельно. Это создаёт психологическое ощущение "нет хитбокса".

На практике: если пользователь промахивается и кликает в 8px выше/ниже текста — клик происходит (хитбокс есть). Но никакой визуальной подсказки нет.

---

## Проблема №3 — `scale: 0` в React `style` prop — невалидное CSS-свойство

### Где: `Header.tsx` (строки 50, 59)

```tsx
// Строка 50 — звёздочка внутри первого span
<span ref={star1Ref} className="inline-flex items-center justify-center overflow-hidden"
    style={{ width: 0, opacity: 0, scale: 0, marginLeft: 0 }}>
    ✹
</span>

// Строка 59 — звёздочка внутри второго span
<span ref={star2Ref} className="inline-flex items-center justify-center overflow-hidden"
    style={{ width: 0, opacity: 0, scale: 0, marginLeft: 0 }}>
    ✹
</span>
```

### Почему это неправильно

React `style` prop принимает **CSS-свойства**. Свойство `scale` — **не стандартное CSS-свойство** (это новинка CSS 2022 с плохой поддержкой). React не преобразует его в `transform: scale()`.

Что происходит при рендере:
- `width: 0` → ✅ применяется
- `opacity: 0` → ✅ применяется  
- `scale: 0` → ❌ **игнорируется браузером** — звёздочка рендерится в масштабе 1
- `marginLeft: 0` → ✅ применяется

**Результат:** при загрузке страницы `width: 0` скрывает span (ширина 0), но `overflow: hidden` на родительском span плюс `width: 0` делают его невидимым. Пока это работает... но только потому что `width: 0` спасает ситуацию. Если `width` когда-нибудь изменится — появится баг с полноразмерной звёздочкой до запуска GSAP.

> [!NOTE]
> Правильный способ скрыть через инлайн-стиль: `style={{ transform: 'scale(0)' }}`. GSAP использует свой внутренний механизм и корректно анимирует `scale`, но начальное CSS-состояние всё равно должно быть валидным.

Аналогичная проблема в `bigStarRef` (строка 116):
```tsx
style={{
    display: 'none',
    width: '240px',
    ...
    scale: 0,    // ← невалидно
}}
```

---

## Проблема №4 — `mix-blend-difference` вызывает проблемы с hit-testing в Safari

### Где: `Header.tsx` (строка 93)

```tsx
<div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none mix-blend-difference text-[#ffffff]">
```

### Что происходит

`mix-blend-mode: difference` создаёт **новый стекинг-контекст (stacking context)**. Это означает:

1. Браузер выделяет отдельный GPU-слой для рендеринга
2. Все дочерние элементы рендерятся на этом слое
3. **В Safari/WebKit:** элементы с `mix-blend-mode` на родителе имеют баг — `pointer-events-auto` на дочерних элементах может не срабатывать корректно при определённых условиях

Дополнительная проблема: `pointer-events-none` на родителе + `mix-blend-mode: difference`. В стандарте CSS Events: дочерний `pointer-events: auto` должен работать при `pointer-events: none` на родителе. Но `mix-blend-mode` создаёт новый контекст, что в сочетании с `pointer-events-none` на этом контексте может вызывать непредсказуемое поведение.

> [!CAUTION]
> `mix-blend-mode: difference` (в отличие от `mix-blend-mode: exclusion` который был раньше) более агрессивен и может быть ещё менее совместим с GPU-ускорением GSAP на дочерних элементах.

---

## Проблема №5 — Утечка GSAP-анимации: нет cleanup для `bigStarRef`

### Где: `Header.tsx` (строки 76–90)

```tsx
useEffect(() => {
    if (isHomePage) {
        gsap.set(bigStarRef.current, { display: 'flex', opacity: 1, scale: 1 });
        gsap.to(bigStarRef.current, {
            rotate: 360,
            duration: 15,
            ease: "none",
            repeat: -1,       // ← бесконечная анимация
            transformOrigin: "center center"
        });
    } else {
        gsap.killTweensOf(bigStarRef.current);
        gsap.set(bigStarRef.current, { display: 'none', opacity: 0, scale: 0 });
    }
}, [isHomePage]);    // ← нет return () => { ... }
```

### Почему это проблема

`useEffect` возвращает функцию cleanup, которая вызывается при **размонтировании компонента**. Здесь cleanup не определён. Если пользователь покидает страницу пока `Header` размонтируется (что маловероятно, т.к. Header в layout — но всё же), GSAP-тик с `repeat: -1` продолжит работу в фоне, создавая утечку памяти.

Правильная форма:
```tsx
useEffect(() => {
    if (isHomePage) {
        // ... запуск
    } else {
        // ... остановка
    }
    // cleanup:
    return () => {
        gsap.killTweensOf(bigStarRef.current);
    };
}, [isHomePage]);
```

---

## Сводная таблица

| # | Проблема | Файл | Строки | Эффект |
|---|----------|------|--------|--------|
| 1 | CSS `!important` перебивает `top-[24px]` → хитбокс смещён | `globals.css` | 131, 134 | Хитбокс не там где ожидается |
| 2 | `overflow-hidden` делает расширенный хитбокс невидимым | `Header.tsx` | 43 | Пользователь не видит зону клика |
| 3 | `scale: 0` невалидно в React `style` prop | `Header.tsx` | 50, 59, 116 | Потенциальные глюки рендеринга |
| 4 | `mix-blend-difference` мешает hit-testing в Safari | `Header.tsx` | 93 | Клики не работают в Safari |
| 5 | Нет GSAP cleanup для `repeat: -1` анимации | `Header.tsx` | 76–90 | Потенциальная утечка памяти |

---

## Рекомендации

### 🔴 [КРИТИЧНО] Рекомендация 1 — Обновить `.custom-nav` в globals.css убрать `top: 40px` и привести `gap` в соответствие с JSX

**Файл:** `src/app/globals.css`, строки 93–135

После того как разработчик добавил `py-4` в NavItem и изменил `top-[24px]` в JSX — глобальный CSS стал **противоречить** JSX-коду. Нужно синхронизировать:

```diff
/* globals.css, строки 93–98 */
.custom-nav {
    position: absolute;
-   top: 40px;
+   /* top управляется через Tailwind top-[24px] */
    left: 6vw;
-   gap: 16px;
+   /* gap убран — используются паддинги самих NavItem */
}

/* globals.css, строки 130–135 */
@media (min-width: 1024px) {
    .custom-nav {
-       top: 40px !important;
+       /* top управляется через Tailwind top-[24px] */
        left: auto !important;
        right: 40px !important;
-       gap: 30px !important;
+       /* gap убран — используются паддинги самих NavItem */
    }
}
```

То же самое для `.custom-home-btn`:
```diff
/* globals.css, строка 354–360 */
.custom-home-btn {
    position: absolute;
-   top: 40px;
+   /* top управляется через Tailwind top-[24px] */
    right: 6vw;
    z-index: 50;
}
```

---

### 🔴 [КРИТИЧНО] Рекомендация 2 — Добавить визуальный индикатор в зону хитбокса

**Файл:** `src/components/Header.tsx`, строка 41

Проблема không в размере хитбокса — он есть (52px). Проблема в том, что пустое пространство вокруг текста выглядит некликабельным. Нужно добавить хотя бы курсор-изменение или фоновую подсветку чтобы пользователь «чувствовал» хитбокс:

Вариант А — добавить подсветку при hover только на текст (псевдоэлемент):
```diff
<TransitionLink
    href={href}
-   className="group relative block no-underline outline-none cursor-pointer px-2 md:px-4 py-4"
+   className="group relative block no-underline outline-none cursor-pointer px-2 md:px-4 py-4 hover:bg-white/5 rounded-md transition-colors"
>
```

Вариант Б — визуализировать хитбокс через `after:`-псевдоэлемент (хорошо для дебага, убести потом):
```tsx
className="group relative block no-underline outline-none cursor-pointer px-2 md:px-4 py-4 after:content-[''] after:absolute after:inset-0 after:border after:border-red-500/20"
```

---

### 🟠 [ВАЖНО] Рекомендация 3 — Заменить `scale: 0` на валидный CSS в style prop

**Файл:** `src/components/Header.tsx`, строки 50, 59, 116

```diff
// NavItem — star1Ref и star2Ref (строки 50 и 59)
<span ref={star1Ref} className="inline-flex items-center justify-center overflow-hidden"
-   style={{ width: 0, opacity: 0, scale: 0, marginLeft: 0 }}>
+   style={{ width: 0, opacity: 0, transform: 'scale(0)', marginLeft: 0 }}>
    ✹
</span>

// bigStarRef (строка 107–117)
style={{
    display: 'none',
    width: '240px',
    height: '240px',
    fontSize: '240px',
    color: '#fe366fff',
    top: '-64px',
    left: '-40px',
    opacity: 0,
-   scale: 0,           // невалидное CSS-свойство
+   transform: 'scale(0)',  // правильный способ
}}
```

---

### 🟠 [ВАЖНО] Рекомендация 4 — Добавить cleanup для GSAP `repeat: -1` анимации

**Файл:** `src/components/Header.tsx`, строки 76–90

```diff
useEffect(() => {
    if (isHomePage) {
        gsap.set(bigStarRef.current, { display: 'flex', opacity: 1, scale: 1 });
        gsap.to(bigStarRef.current, {
            rotate: 360,
            duration: 15,
            ease: "none",
            repeat: -1,
            transformOrigin: "center center"
        });
    } else {
        gsap.killTweensOf(bigStarRef.current);
        gsap.set(bigStarRef.current, { display: 'none', opacity: 0, scale: 0 });
    }
+   return () => {
+       gsap.killTweensOf(bigStarRef.current);
+   };
}, [isHomePage]);
```

---

### 🟡 [ЖЕЛАТЕЛЬНО] Рекомендация 5 — Убрать `mix-blend-difference` с корневого wrapper

**Файл:** `src/components/Header.tsx`, строка 93

```diff
- <div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none mix-blend-difference text-[#ffffff]">
+ <div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none text-[#ffffff]">
```

Если эффект смешения цветов нужен — применить `mix-blend-mode` только к `<span>` с текстом внутри NavItem, а не к корневому контейнеру который управляет pointer events.

---

### 🟡 [ЖЕЛАТЕЛЬНО] Рекомендация 6 — Альтернативный подход к хитбоксу без зависимости от CSS

Вместо `py-4` на `<a>` (который конфликтует с CSS `top`), использовать псевдоэлемент `::before`/`::after` или абсолютно позиционированный прозрачный overlay:

```tsx
// Вместо py-4 на TransitionLink — убрать padding совсем,
// и добавить явный расширитель хитбокса через after:
<TransitionLink
    href={href}
    className="group relative block no-underline outline-none cursor-pointer after:content-[''] after:absolute after:-inset-x-3 after:-inset-y-4"
>
```

Этот подход:
- Не зависит от `top` — хитбокс расширяется относительно самого элемента
- Визуально текст остаётся на том же месте
- Расширение `-inset-x-3 -inset-y-4` = 12px по горизонтали, 16px по вертикали

---

## Схема хитбокса — что есть vs что нужно

```
Текущая ситуация (десктоп):
┌──────────────────────────────────────┐  top: 0px
│  z-[100] global-menu-wrapper 100px   │
│                                      │
│  ╔══════════════════════════════╗    │  top: 40px (CSS override)
│  ║  <nav> [Project][Space]...   ║    │
│  ║    padding 16px ↑↑↑          ║    │  эта зона КЛИКАБЕЛЬНА
│  ║    ТЕКСТ (видимый в 20px)    ║    │  top: 56px (40px + 16px pad)
│  ║    padding 16px ↓↓↓          ║    │  эта зона КЛИКАБЕЛЬНА
│  ╚══════════════════════════════╝    │  top: 92px
│                                      │
└──────────────────────────────────────┘  top: 100px

Что ожидал разработчик (top-[24px]):
│  ╔══════════════════════════════╗    │  top: 24px (Tailwind)
│  ║  padding 16px ↑↑↑            ║    │  top: 24px → 40px  
│  ║  ТЕКСТ (видимый в 20px)      ║    │  top: 40px → 60px
│  ║  padding 16px ↓↓↓            ║    │  top: 60px → 76px
│  ╚══════════════════════════════╝    │  top: 76px
```

---

## Приоритет исправлений

| Приоритет | Рекомендация | Файл | Сложность |
|-----------|-------------|------|-----------|
| 🔴 Критично | #1 — Убрать/обновить `top: 40px` и `gap` в globals.css | `globals.css` | Низкая |
| 🔴 Критично | #2 — Добавить визуальный индикатор хитбокса | `Header.tsx` | Низкая |
| 🟠 Важно | #3 — Заменить `scale: 0` на `transform: 'scale(0)'` | `Header.tsx` | Низкая |
| 🟠 Важно | #4 — Cleanup для GSAP `repeat: -1` | `Header.tsx` | Низкая |
| 🟡 Желательно | #5 — Убрать `mix-blend-difference` с wrapper | `Header.tsx` | Средняя |
| 🟡 Желательно | #6 — Использовать `after:` pseudo-element для хитбокса | `Header.tsx` | Низкая |
