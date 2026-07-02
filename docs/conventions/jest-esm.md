# ADR: Jest + ESM + TypeScript — Problemas y soluciones

> **Contexto**: Al configurar Jest para el proyecto (NestJS, TypeScript estricto, `@faker-js/faker` v10+, `jest-mock-extended`) nos encontramos con una cadena de problemas derivados de mezclar ESM nativo con el runtime de Jest. Este documento los recoge todos, explica la causa raíz y la solución adoptada.

---

## Problema 1 — `@faker-js/faker` v10 es ESM-only y Jest no lo puede transformar

**Síntoma**

```
SyntaxError: Cannot use import statement in a module
```

Faker lanzaba este error al ser importado desde un spec porque Jest (por defecto en modo CJS) no sabía transformar módulos ESM de `node_modules`.

**Causa raíz**

Faker v10 eliminó el build CJS. Jest en modo CommonJS no puede ejecutar ESM nativo sin configuración explícita.

**Solución**

Activar el runner ESM experimental de Jest via `vm-modules` y configurar `ts-jest` en modo ESM:

```json
// package.json
"test": "NODE_OPTIONS=--experimental-vm-modules jest --config jest.config.ts"
```

```ts
// jest.config.ts
extensionsToTreatAsEsm: ['.ts'],
transform: {
  '^.+\\.(t|j)s$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.test.json' }],
},
```

---

## Problema 2 — `jest@30` incompatible con `ts-jest@29`

**Síntoma**

```
TypeError: Cannot read properties of undefined (reading 'createScriptFromCode')
```

o bien errores crípticos en la inicialización del transform.

**Causa raíz**

`ts-jest@29` no soporta la API interna de `jest@30`. Son versiones mayor incompatibles.

**Solución**

Fijar ambos en la misma major:

```json
"jest": "^29.7.0",
"ts-jest": "^29.2.5",
"@jest/globals": "^29.7.0",
"@types/jest": "^29.5.14"
```

---

## Problema 3 — `jest` global no disponible en ESM vm-modules

**Síntoma**

```
ReferenceError: jest is not defined
```

Al intentar usar `jest.useFakeTimers()`, `jest.fn()`, etc. directamente en los specs.

**Causa raíz**

En el runner ESM (`--experimental-vm-modules`), Jest **no inyecta el objeto `jest` como global**. Solo inyecta `describe`, `it`, `expect`, `beforeEach`, `afterEach` — que vienen de `@types/jest` como tipos globales pero `jest` en sí no está disponible en el scope del módulo ESM.

**Solución**

Importar `jest` explícitamente desde `@jest/globals` cuando se necesita:

```ts
import { jest } from '@jest/globals';

jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00Z'));
```

`describe`, `it`, `expect`, `beforeEach`, `afterEach` — NO importar, son globals reales.

---

## Problema 4 — `tsconfig.test.json` mal configurado rompía la resolución de módulos

**Síntoma**

```
Cannot find module '@/identity/domain/user' from 'test/...'
```

O errores de `moduleResolution` al importar desde `node_modules` con `exports` map.

**Causa raíz**

El `tsconfig.json` base usaba `"module": "CommonJS"` y `"moduleResolution": "node"`. Con `useESM: true` en ts-jest, TypeScript y Jest no concordaban en cómo resolver los módulos.

**Solución**

Crear un `tsconfig.test.json` específico que extiende el base y sobreescribe solo lo necesario:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler",
    "resolvePackageJsonExports": false
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- `module: ES2022` — habilita imports ESM reales
- `moduleResolution: bundler` — resuelve path aliases (`@/`) correctamente
- `resolvePackageJsonExports: false` — evita que TypeScript fuerce los `exports` map de algunos paquetes que no los tienen bien configurados para ESM
- `include` con ambos directorios — necesario para que ts-jest transforme tanto `src/` como `test/`

---

## Problema 5 — NestJS packages (CJS) no se podían cargar desde contexto ESM

**Síntoma**

```
Must use import to load ES Module
```

o bien el inverso: NestJS decorators (`@Injectable`, `@Inject`) fallaban al ser importados.

**Causa raíz**

`@nestjs/common` y `@nestjs/core` distribuyen CJS. El runner ESM de Jest no los transforma por defecto porque `transformIgnorePatterns` excluye todo `node_modules`.

**Solución**

Afinar `transformIgnorePatterns` para que ts-jest **sí transforme** los paquetes de NestJS:

```ts
transformIgnorePatterns: [
  '/node_modules/.pnpm/(?!(@nestjs\\+common|@nestjs\\+core|reflect-metadata))',
  '/node_modules/(?!(@nestjs)/)',
],
```

El doble patrón es necesario porque pnpm usa una estructura de symlinks bajo `.pnpm/` con la forma `@nestjs+common@x.y.z`.

---

## Problema 6 — `jest` inyectado implícitamente rompía al usar fake timers en múltiples specs

**Síntoma**

Tests que pasaban individualmente fallaban en suite completa. Los timers de un spec "contaminaban" el siguiente.

**Causa raíz**

Los specs que llamaban `jest.useFakeTimers()` en `beforeEach` no restauraban con `jest.useRealTimers()` en `afterEach`, o importaban `jest` de formas inconsistentes entre archivos.

**Solución**

Centralizar toda la gestión de fake timers en un helper `JestTimers`:

```ts
// test/shared/jest-timers.ts
import { jest } from '@jest/globals';

const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

export class JestTimers {
  static setup(date: Date = FIXED_DATE): void {
    jest.useFakeTimers().setSystemTime(date);
  }

  static teardown(): void {
    jest.useRealTimers();
  }
}
```

Uso en specs:

```ts
import { JestTimers } from '@test/shared/jest-timers';

beforeEach(() => JestTimers.setup());
afterEach(() => JestTimers.teardown());
```

Beneficios:
- Un solo lugar donde se importa `jest` de `@jest/globals`
- La fecha fija `FIXED_DATE` vive en un único lugar
- Los specs no necesitan saber nada del sistema de timers de Jest

---

## Configuración final

```
jest@29 + ts-jest@29 + @jest/globals@29
NODE_OPTIONS=--experimental-vm-modules
tsconfig.test.json con module: ES2022 + moduleResolution: bundler
```

```
apps/api/
├── jest.config.ts           ← extensionsToTreatAsEsm, transformIgnorePatterns
├── tsconfig.test.json       ← module: ES2022, moduleResolution: bundler
└── test/shared/
    └── jest-timers.ts       ← helper para fake timers
```
