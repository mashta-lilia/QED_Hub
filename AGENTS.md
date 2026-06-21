# AGENTS.md

## Project overview
- This repo contains a Vite + React + TypeScript frontend for an interactive graph theory lesson.
- The app lives under [frontend](frontend) and most UI work should stay there.

## Working conventions
- Prefer keeping changes small and aligned with the existing folder layout.
- Follow the current component split: page orchestration in [frontend/src/App.tsx](frontend/src/App.tsx), lesson content in [frontend/src/data.ts](frontend/src/data.ts), shared types in [frontend/src/types.ts](frontend/src/types.ts), reusable UI in [frontend/src/components](frontend/src/components), and math/graph helpers in [frontend/src/lib](frontend/src/lib).
- Preserve the existing styling approach: Tailwind utilities plus component classes defined in [frontend/src/index.css](frontend/src/index.css).
- Keep Ukrainian copy and labels consistent with the current app text.

## Commands
- Install dependencies from [frontend/package.json](frontend/package.json): `npm install`
- Run the dev server: `npm run dev`
- Build for production: `npm run build`
- Preview the build: `npm run preview`

## Documentation to consult first
- [README.md](README.md)
- [frontend/README.md](frontend/README.md)

## Common pitfalls
- Do not move content out of the existing data/model files unless the change truly requires it.
- When editing visuals, reuse the existing component patterns instead of introducing a new layout system.
- For formulas or graph-related logic, check the helpers under [frontend/src/lib](frontend/src/lib) before adding new implementations.
