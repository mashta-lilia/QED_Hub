# Теорія графів — React + TypeScript + Tailwind

Інтерактивний урок «Основи теорії графів» (Розділ 4 курсу «Дискретна математика»),
переписаний із single-file HTML у повноцінний проєкт на **Vite + React 18 + TypeScript + Tailwind CSS**.

## Запуск

```bash
npm install
npm run dev        # локальний сервер розробки (http://localhost:5173)
npm run build      # збірка у dist/ (tsc + vite build)
npm run preview    # перегляд зібраної версії
```

## Структура

```
react-ts/
├─ index.html              точка входу Vite (підключає Google Fonts)
├─ tailwind.config.js      токени теми (кольори, шрифти, тіні) як Tailwind-утиліти
├─ postcss.config.js       Tailwind + autoprefixer
├─ vite.config.ts
├─ tsconfig*.json
└─ src/
   ├─ main.tsx             монтування React + імпорт KaTeX CSS і index.css
   ├─ index.css            @tailwind-директиви + дизайн-система (компонентні класи)
   ├─ types.ts             усі спільні типи (графи, тест, дані уроку, tweaks)
   ├─ data.ts              контент уроку (означення, тест, розбір, практичні 12–18)
   ├─ App.tsx              корінь: екрани awaken → home → subject → lesson
   ├─ lib/
   │  ├─ math.tsx          KaTeX-рендер: <Tex>, <RichText> (текст із $…$)
   │  └─ graph.tsx         <GraphDiagram>, ringLayout, k5data, кольори вершин
   └─ components/
      ├─ Icons.tsx         ChevL / ChevR / IconLock
      ├─ Tweaks.tsx        панель Tweaks + useTweaks (акцент, шрифт, стиль)
      ├─ Theory.tsx        Def/Thm/Call/Lead + усі теоретичні сторінки
      ├─ Labs.tsx          інтерактиви: DegreeLab, ColorLab, EulerLab
      ├─ Practice.tsx      тест, покроковий розбір, перелік практичних
      └─ Structure.tsx     Ring, PageHeader, AwakenIntro, AppHeader,
                           HomeScreen, SubjectScreen + дані предметів/тем
```

## Про Tailwind

Конфіг експонує палітру, шрифти й тіні дизайн-системи як Tailwind-утиліти
(`text-navy`, `bg-surface`, `font-head`, `shadow-lg` тощо — через CSS-змінні).

Складна, багаторазова стилізація компонентів (картки теорії, граф-фігури,
панель навігації, лабораторії, анімації) живе у `src/index.css` — це
ідіоматичний для Tailwind підхід для розгорнутих дизайн-систем. Класи в JSX
(`className="th-def"`, `gfig` тощо) посилаються саме на ці правила.

## Залежності

- `react`, `react-dom` 18.3
- `katex` — рендер формул
- `tailwindcss`, `postcss`, `autoprefixer`
- `vite`, `typescript`, `@vitejs/plugin-react`

Прогрес (відповіді, відвідані сторінки, серія днів) зберігається в `localStorage`
під ключем `graphs_4_v1`.
