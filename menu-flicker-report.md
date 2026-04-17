# 🔍 Аудит: Почему меню (Header) мигает и пропадает

**Дата:** 2026-04-17  
**Файл с меню:** `src/components/Header.tsx`  
**Файл рендера:** `src/app/layout.tsx` → `src/app/template.tsx`

---

## Краткий вывод

Меню мигает и пропадает из-за **конфликта между несколькими независимыми системами**, которые одновременно управляют `opacity` и `y`-координатой одних и тех же DOM-элементов (`.custom-home-btn`, `.custom-nav`). Ни одна из систем не знает о другой — в результате они перезаписывают стили друг друга в непредсказуемом порядке.

---

## Проблема №1 — `template.tsx` + `mix-blend-mode` вызывают сброс слоёв

### Где: `src/app/template.tsx` (строка 27) + `src/components/Header.tsx` (строка 46)

```tsx
// template.tsx, строка 27 — wrapper получает opacity-0 при каждой навигации
<div ref={containerRef} className="page-transition-wrapper w-full h-full opacity-0">
```

```tsx
// Header.tsx, строка 46 — mix-blend-mode на корневом wrapper
<div className="global-menu-wrapper ... blend-exclusion">
```

### Почему это проблема

`Header` находится в `layout.tsx` **вне** `template.tsx` — сам Header не скрывается через template.  

**НО:** страницы (`/project`, `/contact`, `/space`, `/product/[id]`) объявляют себя как `fixed` или `z-[60]`. `mix-blend-mode: exclusion` на Header вычисляется браузером **после** укладки слоёв. Когда `template.tsx` меняет opacity контента (0→1), браузер пересчитывает смешение цветов — это вызывает видимое мигание пока слои не устаканятся.

> [!WARNING]
> `mix-blend-mode` несовместим с GPU-ускорением `will-change`. Браузер вынужден выключать аппаратное ускорение для этого элемента, что делает анимации рывчатыми на всех страницах.

---

## Проблема №2 — `mix-blend-mode: exclusion` вызывает неправильный цвет меню на разных страницах

### Где: `src/app/globals.css` (строка 21-23) и `src/components/Header.tsx` (строка 46)

```css
/* globals.css, строка 21-23 */
.blend-exclusion {
    mix-blend-mode: exclusion;
}
```

### Почему это проблема

`mix-blend-mode: exclusion` делает цвет элемента **зависимым от цвета пикселей под ним**. При переходе между страницами:

| Страница | Фон | Цвет текста меню после exclusion |
|----------|-----|----------------------------------|
| `/` (Home) | `#ebebeb` (светло-серый) | Тёмный |
| `/space` | `#111` (почти чёрный) | Белый |
| `/project` | `#efefef` | Тёмный |
| `/contact` | `#efefef` | Тёмный |

Во время анимации перехода, когда фон страницы меняется, `exclusion` вычисляется в каждом кадре — это вызывает **видимое мигание цвета** меню.

---

## Проблема №3 — Гонка состояний: `gsap.set` в Header vs `gsap.fromTo` на страницах

### Где: `Header.tsx` (строка 38-40) vs `page.tsx` (строка 12) vs `space/page.tsx` (строка 18) vs `contact/page.tsx` (строка 65)

**Header очищает стили при смене роута:**
```tsx
// Header.tsx, строка 38-40
useEffect(() => {
    gsap.set([".custom-home-btn", ".custom-nav"], { clearProps: "all" });
}, [pathname]);
```

**Главная страница сразу скрывает элементы меню:**
```tsx
// page.tsx (Home), строка 12
gsap.set([".custom-home-btn", ".custom-nav", ".custom-vol"], { opacity: 0, y: 30 });
```

**Space страница делает то же самое:**
```tsx
// space/page.tsx, строка 18
gsap.set([".custom-home-btn", ".custom-nav", ".custom-vol"], { opacity: 0, y: 30 });
```

**Contact страница — аналогично:**
```tsx
// contact/page.tsx, строка 65
gsap.set([".custom-home-btn", ".custom-nav", ".animate-stagger"], { opacity: 0, y: 20 });
```

### Почему это проблема

Три разных компонента (Header + 3 страницы) **одновременно** управляют ОДНИМИ И ТЕМИ ЖЕ элементами через глобальные CSS-селекторы. Порядок выполнения `useEffect` при навигации **не гарантирован**.

Пример сценария при переходе на `/contact`:

```
1. Пользователь нажимает ссылку
2. TransitionLink: скрывает page-transition-wrapper
3. router.push("/contact") → Next.js монтирует ContactPage
4. ContactPage.useEffect([]) → gsap.set(".custom-nav", { opacity: 0 }) ← скрывает меню
5. Header.useEffect([pathname]) → clearProps: "all"  ← убирает inline-style
   → НО CSS класс animate-up { opacity: 0 } снова применяется!
6. ContactPage ждёт загрузки relax.json (fetch)
7. Только после загрузки JSON → gsap.fromTo(".custom-nav", { opacity: 1 })
8. Меню появляется
```

**Результат:** меню невидимо всё время пока грузится `relax.json` (~100-500ms+).

---

## Проблема №4 — CSS класс `animate-up` (opacity:0) применён к `.custom-nav` в Header

### Где: `src/app/globals.css` (строка 33-36) и `src/components/Header.tsx` (строка 57)

```css
/* globals.css, строка 33-36 */
.animate-up {
    opacity: 0;                          /* ← ПРОБЛЕМА */
    will-change: transform, opacity;
}
```

```tsx
/* Header.tsx, строка 57 */
<nav className="custom-nav pointer-events-auto ... animate-up">
```

### Почему это проблема

`.custom-nav` получил класс `animate-up` который через CSS устанавливает `opacity: 0`. Это значит: **если GSAP-анимация не запустится** — меню будет невидимым.

На каких страницах GSAP НЕ анимирует `.animate-up` из Header:

| Страница | Анимирует ли `.animate-up` от Header? | Результат |
|----------|--------------------------------------|-----------|
| `/` (Home) | ✅ Да (после Preloader) | Меню появляется |
| `/space` | ✅ Да (после Preloader) | Меню появляется |
| `/contact` | ✅ Да (после загрузки JSON) | Меню появляется с задержкой |
| `/project` | ❌ Нет — анимирует только `.animate-stagger` | **Меню невидимо!** |
| `/product/[id]` | ❌ Нет — анимирует только `.animate-stagger` | **Меню невидимо!** |

> [!CAUTION]
> На страницах `/project` и `/product/[id]` меню **полностью невидимо** сразу после загрузки, потому что CSS-класс `animate-up` устанавливает `opacity: 0`, а GSAP-анимации для него нет.

---

## Проблема №5 — `clearProps: "all"` в Header возвращает CSS opacity:0

### Где: `src/components/Header.tsx` (строка 39)

```tsx
gsap.set([".custom-home-btn", ".custom-nav"], { clearProps: "all" });
```

### Почему это проблема

`clearProps: "all"` удаляет **все инлайн-стили** которые GSAP добавил через `style=""`. После этого CSS правила снова вступают в силу.

Последовательность при смене роута (например уход с `/` на `/project`):

```
1. На Home: GSAP поставил style="opacity: 1; transform: ..."
2. Пользователь кликает на Project
3. Header.useEffect([pathname]) → clearProps: "all" → style="" удаляется
4. CSS класс animate-up { opacity: 0 } снова применяется к .custom-nav
5. На один кадр меню видимо (инлайн убрали), потом браузер применяет CSS → opacity: 0
6. Project page gsap.fromTo(".animate-stagger") — но не ".animate-up"!
7. Меню остаётся невидимым
```

**Визуальный эффект:** мгновенное мигание при переходе + невидимое меню на Project.

---

## Проблема №6 — Ошибочный класс `global-menu-wrapper` на левой панели product страницы

### Где: `src/app/product/[id]/page.tsx` (строка 124)

```tsx
<div
    ref={leftPanelRef}
    className="global-menu-wrapper flex flex-col justify-start ..."   {/* ← ОШИБКА */}
>
```

### Почему это проблема

Класс `global-menu-wrapper` используется в CSS для скрытия меню при открытом Lightbox:

```css
/* globals.css, строка 428-436 */
.lightbox-is-open .global-menu-wrapper {
    opacity: 0 !important;          /* ← скрывает ВСЁ с этим классом */
    pointer-events: none !important;
}
```

При открытии Lightbox:
- ✅ Правильно скрывается: настоящее меню (Header)
- ❌ **Ошибочно скрывается:** вся левая панель с названием, описанием и кнопкой Share

Это баг именования — разработчик хотел скрыть только меню, а скрыл весь контент страницы.

---

## Сводная таблица проблем

| # | Проблема | Страницы где видно | Эффект |
|---|----------|-------------------|--------|
| 1 | `template.tsx` + `mix-blend-mode` вызывают сброс слоёв | Все страницы при навигации | Мигание при переходе |
| 2 | `mix-blend-mode: exclusion` зависит от фона | Все страницы | Неправильный цвет, рывки |
| 3 | Гонка `gsap.set` между Header и страницами | `/contact`, `/space`, `/` | Меню невидимо до загрузки данных |
| 4 | CSS `animate-up { opacity:0 }` без GSAP-анимации | `/project`, `/product/[id]` | Меню **полностью невидимо** |
| 5 | `clearProps: "all"` возвращает CSS opacity:0 | Все страницы при навигации | Мигание при смене роута |
| 6 | Ошибочный класс `global-menu-wrapper` на панели | `/product/[id]` + Lightbox | Пропадает весь контент левой панели |

---

## Рекомендации по исправлению

### 🔴 [КРИТИЧНО] Рекомендация 1 — Убрать `animate-up` из `<nav>` в Header

**Файл:** `src/components/Header.tsx`, строка 57

Класс `animate-up` даёт CSS `opacity: 0`. Header должен управлять своей видимостью сам, не через CSS-класс предназначенный для анимации элементов страниц.

```diff
- <nav className="custom-nav pointer-events-auto absolute top-[40px] !right-auto !left-[6vw] lg:!left-auto lg:!right-[4vw] flex flex-row gap-4 md:gap-6 items-center animate-up">
+ <nav className="custom-nav pointer-events-auto absolute top-[40px] !right-auto !left-[6vw] lg:!left-auto lg:!right-[4vw] flex flex-row gap-4 md:gap-6 items-center">
```

---

### 🔴 [КРИТИЧНО] Рекомендация 2 — Переименовать класс на левой панели в `/product/[id]/page.tsx`

**Файл:** `src/app/product/[id]/page.tsx`, строка 124

```diff
- className="global-menu-wrapper flex flex-col justify-start lg:justify-center ..."
+ className="product-left-panel flex flex-col justify-start lg:justify-center ..."
```

Это немедленно исправит исчезновение контента при открытии Lightbox.

---

### 🟠 [ВАЖНО] Рекомендация 3 — Изменить `clearProps: "all"` на явный сброс

**Файл:** `src/components/Header.tsx`, строка 38-40

Вместо `clearProps: "all"` (который убирает все инлайн-стили и позволяет CSS `opacity:0` снова вступить в силу), нужно явно устанавливать финальные значения:

```diff
useEffect(() => {
-   gsap.set([".custom-home-btn", ".custom-nav"], { clearProps: "all" });
+   gsap.set([".custom-home-btn", ".custom-nav"], { opacity: 1, y: 0, clearProps: "transform" });
}, [pathname]);
```

---

### 🟠 [ВАЖНО] Рекомендация 4 — Убрать управление меню из кода страниц

**Файлы:** `src/app/page.tsx` (строка 12, 22), `src/app/space/page.tsx` (строка 18, 28), `src/app/contact/page.tsx` (строка 65, 91)

Страницы не должны анимировать `.custom-home-btn` и `.custom-nav` — это ответственность Header.

```diff
// page.tsx (Home) — строка 12
- gsap.set([".custom-home-btn", ".custom-nav", ".custom-vol"], { opacity: 0, y: 30 });
+ gsap.set([".custom-vol"], { opacity: 0, y: 30 });

// page.tsx (Home) — строка 22
- const selectors = [".custom-home-btn", ".custom-nav", ".animate-up"];
+ const selectors = [".animate-up"];
```

Аналогично убрать `.custom-home-btn` и `.custom-nav` из `space/page.tsx` и `contact/page.tsx`.

---

### 🟡 [ЖЕЛАТЕЛЬНО] Рекомендация 5 — Добавить `isolation: isolate` к контейнерам страниц

**Файл:** `src/app/globals.css`

Чтобы `mix-blend-mode` в Header правильно вычислялся, нужно создать новый контекст смешения для контента страниц:

```css
/* Добавить в globals.css */
.page-transition-wrapper {
    isolation: isolate;
}
```

Это ограничит действие `mix-blend-mode` и предотвратит неожиданные эффекты при смене фонов.

---

### 🟡 [ЖЕЛАТЕЛЬНО] Рекомендация 6 — Изолировать `mix-blend-mode` только на тексте

**Файл:** `src/components/Header.tsx`, строка 46

Вместо `mix-blend-mode` на всём wrapper — применять только к текстовым элементам:

```diff
// Header wrapper — убрать blend-exclusion
- <div className="global-menu-wrapper absolute top-0 left-0 w-full h-[100px] z-[100] pointer-events-none text-[#ffffff] blend-exclusion">
+ <div className="global-menu-wrapper absolute top-0 left-0 w-full h-[100px] z-[100] pointer-events-none text-[#ffffff]">
```

Добавить `blend-exclusion` только к `<span>` с текстом внутри NavItem, если эффект нужен только для текста.

---

### 🟢 [АРХИТЕКТУРНО] Рекомендация 7 — Единый хук управления анимацией меню

Вместо текущего хаоса (Header + 3 страницы управляют одними элементами), создать единый хук `useHeaderAnimation` в Header:

```
Header (owner of animation)     Pages (signal only)
         │                              │
         ├── следит за pathname         │
         ├── управляет opacity          │
         │   .custom-home-btn          │
         │   .custom-nav               │
         │                              │
         └── PageReadyContext ←─────────┤
             (страница сигналит         │
              когда контент готов)       │
```

Каждая страница вызывает только `signalPageReady()` когда данные загружены, а Header сам решает когда анимировать меню.

---

## Приоритет исправлений

| Приоритет | Рекомендация | Файл | Сложность |
|-----------|-------------|------|-----------|
| 🔴 Критично | #1 — убрать `animate-up` из nav в Header | `Header.tsx:57` | Низкая (1 строка) |
| 🔴 Критично | #2 — переименовать класс на панели product | `product/[id]/page.tsx:124` | Низкая (1 строка) |
| 🟠 Важно | #3 — заменить `clearProps: "all"` на явные значения | `Header.tsx:39` | Низкая (1 строка) |
| 🟠 Важно | #4 — убрать `.custom-nav` из gsap страниц | `page.tsx`, `space/page.tsx`, `contact/page.tsx` | Средняя |
| 🟡 Желательно | #5 — добавить `isolation: isolate` | `globals.css` | Низкая (1 правило) |
| 🟡 Желательно | #6 — изолировать `mix-blend-mode` | `Header.tsx:46` | Средняя |
| 🟢 Архитектурно | #7 — единый хук управления меню | Новый файл + рефакторинг | Высокая |
