# Scaffold React + TypeScript client app with Vite

## Context

Monorepo `ididntcatchthat`. The client app lives in `apps/client/`.
Git is already initialized at the monorepo root — do NOT run `git init`.
Package manager: pnpm.

## Task

Scaffold a new React + TypeScript SPA using Vite inside `apps/client/`.

Requirements:
- React 19
- TypeScript (strict mode)
- Vite as bundler
- TailwindCSS v4
- Path aliases configured (`@/` → `src/`)
- ESLint + Prettier configured (see `docs/conventions/eslint-prettier.md`)
- No sample/demo content — delete everything inside `src/` except `main.tsx` and `App.tsx` (both empty shells)
- No `git init` — repo already exists at monorepo root
- `package.json` name: `@ididntcatchthat/client`

## Expected structure after scaffold

```
apps/client/
├── public/
├── src/
│   ├── App.tsx          ← empty shell
│   └── main.tsx         ← mounts App into #root
├── index.html
├── package.json         ← name: @ididntcatchthat/client
├── tsconfig.json        ← strict: true, paths configured
├── tsconfig.app.json
├── vite.config.ts       ← path alias @/ → src/
└── .prettierrc          ← project prettier config
```

## Commands

```bash
cd apps
pnpm create vite client --template react-ts
cd client
pnpm install
pnpm add -D tailwindcss @tailwindcss/vite
```

## Notes

- Do NOT install React Router, TanStack Query or Zustand at this stage — they come later
- Do NOT commit — scaffolding will be reviewed before committing
