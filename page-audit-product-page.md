# 🔍 Deep Code Audit: `src/app/product/[id]/page.tsx`

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, GSAP.
**Role:** Senior React/Next.js Developer Review.

---

## 1. GSAP & Lifecycle (GSAP и Жизненный цикл)

### 🔴 Critical: Memory Leak in `gsap.ticker`
**Lines 138-142:**
```tsx
gsap.ticker.add(renderTick);

return () => {
    gsap.ticker.remove(renderTick);
};
```
**Problem:** This `return` is inside the `gsap.context` callback. GSAP context callback's return is *not* a cleanup function for the effect. The ticker listener is never removed, leading to a memory leak and potential crashes as it tries to access `current` refs of an unmounted component.

**Fix:**
Move the ticker removal to the main `useEffect` cleanup.
```tsx
useEffect(() => {
    const renderTick = () => { ... };
    gsap.ticker.add(renderTick);
    let ctx = gsap.context(() => { ... });
    
    return () => {
        ctx.revert();
        gsap.ticker.remove(renderTick); // Correct placement
    };
}, []);
```

### 🟠 Warning: Unscoped Selectors
**Line 96 & 106:**
```tsx
const staggerEls = document.querySelectorAll('.animate-stagger');
gsap.fromTo(".animate-up", ...);
```
**Problem:** Using `document.querySelectorAll` or string selectors outside of a scoped ref can lead to animating elements from other components (like the Header).

**Fix:**
Use the `scope` property in `gsap.context`.
```tsx
const containerRef = useRef(null);
// ...
useEffect(() => {
    let ctx = gsap.context(() => {
        gsap.fromTo('.animate-stagger', { opacity: 0 }, { opacity: 1 });
    }, containerRef); // Scope everything to this container
    return () => ctx.revert();
}, []);
```

### 🟠 Warning: Manual Hover Animations
**Lines 370-395:**
Inline `onMouseEnter` GSAP calls don't have an `overwrite` property or cleanup. Fast hovering will cause animation stacking.

**Fix:**
Add `overwrite: 'auto'` or use simple CSS transitions for hover states.

---

## 2. TypeScript (Типизация)

### 🔴 Problem: `any` everywhere
**Line 72 (`arrowAnimData`), Line 19 (`product`), products.ts Line 3:**
The use of `any` disables all type safety for the core data structure of the page.

**Fix:**
Define strict interfaces.
```tsx
export interface Product {
    id: string;
    title: string;
    description: string;
    year: string;
    role: string;
    photos: string[];
}

const product = productsData[productId] as Product;
```

### 🟡 Problem: `useParams` typing
**Line 14:** `const params = useParams();` is untyped.

**Fix:**
```tsx
const params = useParams<{ id: string }>();
```

---

## 3. Render Logic (Логика рендера)

### 🟠 Performance: Excessive Rerenders
**Lines 71, 150-162:**
`contentHeight` is stored in state and updated via `ResizeObserver`. Every time the window resizes or content loads, the *entire* component (including modals, lightbox, panels) rerenders. 

**Fix:**
Since this is only used for the scroll track height, use a `ref` and update the height via DOM directly to avoid React rerenders.
```tsx
const scrollSpacerRef = useRef<HTMLDivElement>(null);
// ... inside observer
if (scrollSpacerRef.current) scrollSpacerRef.current.style.height = `${h + 200}px`;
```

### 🟡 Logic: Duplicate Home Button
**Line 240:**
The page manualy renders a "Kesa.today" link despite it being part of the global `Header` in `layout.tsx`. On this page, you end up with two headers/home buttons overlapping or fighting for space.

### 🟡 Logic: Dead Function
**Line 214:** `handleShare` is defined but never called. The actual button uses `openShareModal`.

---

## 4. Tailwind & Layout (Tailwind и Вёрстка)

### 🔴 Bug: Typo in ClassName
**Line 436:** `className="flex jjustify-start w-full"`
There is an extra `j`. `jjustify-start` is not a valid Tailwind class.

### 🟠 Maintenance: Hardcoded Arbitrary Values
**Lines 266, 329:** Extensive use of `px-[6vw]`, `md:px-[60px]`, `pt-[12vh]`.
This makes the design brittle. 

**Proposal:**
Move shared spacing to `tailwind.config.js` or use standard spacing tokens (`px-6`, `md:px-16`) to maintain consistency.

### 🟡 Layout: `z-index` Inconsistency
You have `z-[60]`, `z-[110]`, `z-[99999]`, and `z-[300]`. 
It's recommended to use a layer system (e.g., `z-base`, `z-header`, `z-modal`) in your config.

---

## 5. Clean Code & Refactoring (Чистота кода)

### 🟠 Problem: Monolithic Component (466 lines)
The file is too large. It manages:
1. Smooth scroll logic
2. Cursor tracker
3. Share Modal
4. Lightbox
5. Layout

**Refactoring Proposal:**
1. **Extract `Lightbox`** into its own component.
2. **Extract `ShareModal`** into its own component.
3. **Move Custom Scroll/Cursor logic** to a custom hook or global provider if it's used across pages.

### 🟡 Problem: SVG Duplication
**Lines 297-306 vs 446-455:**
The "Copy" and "Check" icons are identical but copy-pasted in two different UI blocks.

**Fix:**
Create a small `Icon` set or a shared component.

### 🟡 Problem: Comments in Body
**Lines 83-90:**
JS comments inside `{/* ... */}` in the middle of a functional component (outside JSX) is messy. Use standard `//` or `/* */`.

---

## Summary of Fixes

| Problem | Severity | Location | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Memory Leak** | 🔴 Critical | Line 140 | Move `ticker.remove` to cleanup |
| **CSS Typo** | 🔴 Critical | Line 436 | Fix `jjustify-start` |
| **Unscoped GSAP** | 🟠 High | Line 96 | Use `scope` in `gsap.context` |
| **Rerender Loop** | 🟠 High | Line 157 | Use `ref` for `contentHeight` |
| **Any Types** | 🟠 High | Throughout | Implement `Product` Interface |
| **Duplicate UI** | 🟡 Medium | Line 240 | Remove redundant Home Link |
| **Dead Code** | 🟡 Medium | Line 214 | Remove `handleShare` |
