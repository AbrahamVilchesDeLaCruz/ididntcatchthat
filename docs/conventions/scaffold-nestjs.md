# Scaffold NestJS API with Express adapter

## Context

Monorepo `ididntcatchthat`. The API lives in `apps/api/`.
Git is already initialized at the monorepo root — do NOT run `git init`.
Package manager: pnpm.

## Task

Scaffold a new NestJS application using the Express adapter inside `apps/api/`.

Requirements:
- NestJS latest (v10+)
- Express adapter (default — do NOT use Fastify)
- TypeScript strict mode
- Path aliases configured (`@/` → `src/`)
- ESLint + Prettier configured (see `docs/conventions/eslint-prettier.md`)
- No sample/demo content — delete `app.controller.ts`, `app.service.ts` and their tests after scaffold. Keep only `app.module.ts` and `main.ts` as empty shells
- No `git init` — repo already exists at monorepo root
- `package.json` name: `@ididntcatchthat/api`

## Expected structure after scaffold

```
apps/api/
├── src/
│   ├── app.module.ts    ← root module, empty (no controllers or providers)
│   └── main.ts          ← bootstrap, listens on port from env (default 3000)
├── test/
├── package.json         ← name: @ididntcatchthat/api
├── tsconfig.json        ← strict: true, paths configured
├── tsconfig.build.json
├── nest-cli.json
└── .prettierrc          ← project prettier config
```

## Commands

```bash
cd apps
pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git
cd api
# Remove demo files
rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts
```

## Notes

- Do NOT install TypeORM, class-validator or any domain packages at this stage — they come later
- Do NOT commit — scaffolding will be reviewed before committing
- Port must be read from environment variable `PORT`, not hardcoded
