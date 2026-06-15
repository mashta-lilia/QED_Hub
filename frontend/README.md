# Навчальна платформа: Теорія графів

Проєкт на `React + TypeScript + Tailwind CSS`.

## Як запустити

```bash
npm install
npm run dev
```

Після цього відкрий адресу, яку покаже Vite, зазвичай:

```txt
http://localhost:5173
```

## Структура

```txt
src/
  components/  повторні візуальні блоки
  data/        теми курсу, підтеми, теорія, питання, практика
  hooks/       збереження прогресу
  pages/       окрема папка для кожної сторінки
  types/       TypeScript-типи
  utils/       допоміжні функції
```

## Що додавати в GitHub

Додавай у репозиторій папку `frontend` з цими файлами: `src`, `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `tsconfig.node.json`, `.gitignore`, `README.md`.

Не додавай: `node_modules`, `dist`, `.npm-cache`. Вони створюються автоматично після `npm install` або `npm run build`.

## Папки сторінок

```txt
src/pages/
  IntroPage/        стартова анімація графа
  SubjectsPage/     3 предмети: дискретна математика, прога, матан
  CoursePage/       список 6 розділів курсу
  GraphTopicsPage/  список підтем розділу 4
  LessonPage/       підтема з нижньою навігаційною плашкою
```

## Що вже є

- 6 розділів курсу.
- Усі розділи закриті, крім `4. Теорія графів`.
- 12 підтем розділу 4.
- Для кожної підтеми: теорія, практика, питання по теорії.
- Прогрес зберігається у браузері.
