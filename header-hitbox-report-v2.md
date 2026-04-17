# 🎯 Аудит Header.tsx — Хитбокс v2 (повторный аудит)

**Дата:** 2026-04-17  
**Файл:** `src/components/Header.tsx` (140 строк)

---

## Краткий вывод

Предыдущий аудит убрал `top: 40px !important` и `gap` из `globals.css` — это правильно. Но хитбокс всё равно не работает из-за **фундаментальной ошибки в понимании DOM Events**: `padding` добавлен на `<div>`-обёртку, а не на `<a>`-тег. Клики в зоне паддинга не достигают обработчика клика.

---

## Единственная корневая причина: DOM Events всплывают ВВЕРХ, а не вниз

### Где: `Header.tsx` строки 37–69 (`NavItem`) и строка 105 (`custom-home-btn`)

### Текущая структура `NavItem` (строки 37–69)

```tsx
// строка 39 — padding на ОБЁРТКЕ <div>
<div style={{ padding: '20px 25px' }}>

    // строка 40–42 — <a> без собственного padding
    <TransitionLink
        href={href}
        className="group relative block no-underline outline-none cursor-pointer"
        // ← НЕТ padding здесь!
    >
        // строка 44 — высота контента 20px
        <div className="overflow-hidden" style={{ height: '20px' }}>
            текст
        </div>
    </TransitionLink>

</div>
```

### Текущая структура `custom-home-btn` (строки 105–130)

```tsx
// строка 105 — padding и margin на <div>
<div className="custom-home-btn ..."
     style={{ padding: '20px', margin: '-20px' }}>

    // строка 106–111 — <a> без padding
    <TransitionLink
        href="/"
        className="... block w-max cursor-pointer"
        // ← НЕТ padding здесь!
    >
        Kesa.today
    </TransitionLink>

</div>
```

---

## Как работают DOM Events — почему это не работает

Браузерные события (click, mouseover и т.д.) **всплывают ВВЕРХ** от целевого элемента к его предкам. Они никогда не опускаются вниз к дочерним элементам.

```
Пользователь кликает в padding-зону <div>
              ↓
  Событие возникает на <div>
              ↓
  <div> — нет onClick → ничего не происходит
              ↓
  Событие всплывает наверх → <nav> → wrapper → document
              
  <a> (дочерний элемент) → НЕ получает событие
  handleClick никогда не вызывается
```

**Итог:** хитбокс `<a>` = 20px (только высота контента внутри).  
Остальные 40px паддинга `<div>` — мёртвая зона.

### Визуальная схема

```
┌─────────────────────────────────────┐  ← <div> padding-top: 20px
│  [мёртвая зона — клик ничего не делает]  │
├─────────────────────────────────────┤
│  █████ Project ████████████████████ │  ← <a> 20px — КЛИКАБЕЛЬНО
├─────────────────────────────────────┤
│  [мёртвая зона — клик ничего не делает]  │
└─────────────────────────────────────┘  ← <div> padding-bottom: 20px
```

---

## Рекомендации по исправлению

### 🔴 [КРИТИЧНО] Рекомендация 1 — Перенести padding с `<div>` на `<TransitionLink>`

Решение простое: убрать `<div>`-обёртку и поместить padding прямо на `<a>` через className `TransitionLink`.

**NavItem — `Header.tsx`, строки 37–69:**

```diff
- <div style={{ padding: '20px 25px' }}>
-     <TransitionLink
-         href={href}
-         className="group relative block no-underline outline-none cursor-pointer"
-     >
+ <TransitionLink
+     href={href}
+     className="group relative block no-underline outline-none cursor-pointer px-6 py-5"
+ >
          <div className="overflow-hidden" style={{ position: 'relative', height: '20px', display: 'block', flexShrink: 0 }}>
              <div className="transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 flex flex-col">
                  ...
              </div>
          </div>
- </TransitionLink>
- </div>
+ </TransitionLink>
```

После исправления структура станет:
```
<a className="px-6 py-5 ...">    ← padding прямо на кликабельном элементе
    <div overflow-hidden height=20px>
        текст
    </div>
</a>
```

Теперь клик в любую точку паддинга → событие на `<a>` → `handleClick` срабатывает ✅

---

**`custom-home-btn` — `Header.tsx`, строки 104–111:**

```diff
- <div className="custom-home-btn pointer-events-auto absolute top-[40px] !left-auto !right-[6vw] lg:!right-auto lg:!left-[4vw]"
-      style={{ padding: '20px', margin: '-20px' }}>
+ <div className="custom-home-btn pointer-events-auto absolute top-[40px] !left-auto !right-[6vw] lg:!right-auto lg:!left-[4vw]">
      <TransitionLink
          href="/"
-         className="relative z-10 text-sm font-bold tracking-widest text-[#ffffff] no-underline outline-none block w-max cursor-pointer"
+         className="relative z-10 text-sm font-bold tracking-widest text-[#ffffff] no-underline outline-none block w-max cursor-pointer py-5 pr-6 pl-2"
      >
          Kesa.today
      </TransitionLink>
```

---

### 🟠 [ВАЖНО] Рекомендация 2 — Добавить `style` проп в `TransitionLink`

**Файл:** `src/components/TransitionLink.tsx`

Сейчас `TransitionLink` принимает только `className`. Для гибкости (если нужно передать `style` из кода) стоит добавить `style` проп:

```diff
interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
+   style?: React.CSSProperties;
}

export const TransitionLink = ({ href, children, className, style }: TransitionLinkProps) => {
    ...
    return (
-       <a href={href} onClick={handleClick} className={className}>
+       <a href={href} onClick={handleClick} className={className} style={style}>
            {children}
        </a>
    );
};
```

---

### 🟡 [ЖЕЛАТЕЛЬНО] Рекомендация 3 — Убрать `mix-blend-difference` с корневого wrapper

**`Header.tsx`, строка 103** — эта проблема была в предыдущем аудите и осталась:

```diff
- <div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none mix-blend-difference text-[#ffffff]">
+ <div className="global-menu-wrapper fixed top-0 left-0 w-full h-[100px] z-[100] pointer-events-none text-[#ffffff]">
```

`mix-blend-mode: difference` создаёт новый compositing layer. В Safari и некоторых версиях Chrome это мешает корректному hit-testing дочерних элементов с `pointer-events-auto`.

---

## Итоговая таблица

| # | Проблема | Строки | Приоритет | Сложность |
|---|----------|--------|-----------|-----------|
| 1 | `padding` на `<div>`-обёртке NavItem — клики в паддинг не достигают `<a>` | 39 | 🔴 Критично | Низкая |
| 2 | `padding`+`margin` на `<div>` `custom-home-btn` — та же ошибка | 105 | 🔴 Критично | Низкая |
| 3 | `TransitionLink` не принимает `style` проп | `TransitionLink.tsx` | 🟠 Важно | Низкая |
| 4 | `mix-blend-difference` мешает pointer events в Safari | 103 | 🟡 Желательно | Средняя |

---

## Правило — когда паддинг расширяет хитбокс, а когда нет

| Структура | Работает? | Почему |
|-----------|-----------|--------|
| `<a style={{padding: '20px'}}>текст</a>` | ✅ Да | Padding на самом кликабельном элементе |
| `<div style={{padding: '20px'}}><a>текст</a></div>` | ❌ Нет | Padding на родителе, события не идут вниз |
| `<a><div style={{padding: '20px'}}>текст</div></a>` | ✅ Да | Padding на дочернем, события от `<div>` всплывают к `<a>` |
| `<a after:absolute after:-inset-4>текст</a>` | ✅ Да | Псевдоэлемент расширяет зону клика вокруг `<a>` |
