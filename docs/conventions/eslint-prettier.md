# ESLint + Prettier — Convenciones de código

> Aplica a `apps/api` y `apps/client`. Cualquier excepción debe justificarse con un comentario inline y una nota en el ADR correspondiente.

---

## Prettier

Configuración compartida en `.prettierrc` de cada app:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "endOfLine": "lf"
}
```

| Opción | Valor | Razón |
|---|---|---|
| `singleQuote` | `true` | Consistencia con el ecosistema JS/TS moderno |
| `trailingComma` | `"all"` | Diffs más limpios al agregar elementos — solo cambia la línea nueva |
| `printWidth` | `80` | Estándar de Prettier y de la industria — cualquier evaluador lo reconoce |
| `endOfLine` | `"lf"` | Fuerza LF en todos los SOs — evita bugs de CRLF en git diffs en Windows |
| `semi` | `true` (default) | Explícito > implícito — evita edge cases de ASI |

---

## ESLint

Ambas apps usan **ESLint Flat Config** con `typescript-eslint` en modo `recommendedTypeChecked` — esto activa las reglas type-aware que requieren el servicio de TypeScript para funcionar.

### Reglas compartidas

#### TypeScript

| Regla | Nivel | Por qué |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | `error` | `any` anula la inferencia de TypeScript — si necesitás escapar usá `unknown` y narrowing |
| `@typescript-eslint/no-unused-vars` | `error` | Args con prefijo `_` se ignoran (e.g. `_event`). Variables sin uso son deuda visible |
| `@typescript-eslint/consistent-type-imports` | `error` | Fuerza `import type` para importaciones de solo tipos. Mejora tree-shaking y deja clara la intención en runtime |
| `@typescript-eslint/prefer-nullish-coalescing` | `error` | Prefiere `??` sobre `\|\|`. `0` y `""` son valores válidos — `\|\|` los trata como falsy |
| `@typescript-eslint/prefer-optional-chain` | `error` | Prefiere `a?.b` sobre `a && a.b` — más seguro y legible |

#### ESLint base

| Regla | Nivel | Por qué |
|---|---|---|
| `eqeqeq` | `error` | `===` siempre. `==` tiene coerciones de tipo que producen bugs difíciles de encontrar |
| `no-console` | `warn` | Los `console.log` de debug no deben llegar a producción. Usá un logger dedicado |

---

### Reglas específicas por app

#### `apps/api`

| Regla | Nivel | Por qué |
|---|---|---|
| `@typescript-eslint/explicit-function-return-type` | `error` | Cada función en el backend debe tener contrato explícito — los casos de uso, repositorios y servicios son contratos, no implementaciones implícitas |
| `@typescript-eslint/no-floating-promises` | `error` | Una promesa sin `await` o `.catch()` es un error silencioso esperando pasar a producción |
| `@typescript-eslint/no-unsafe-argument` | `error` | Argumentos de tipo `any` pasados a funciones tipadas rompen la cadena de seguridad de tipos |

#### `apps/client`

| Regla | Nivel | Por qué |
|---|---|---|
| `@typescript-eslint/explicit-function-return-type` | `warn` (`allowExpressions: true`) | En componentes React el tipo se infiere del JSX. Se avisa pero no bloquea — se exige en hooks y funciones de utilidad |

---

## Cómo ejecutar

```bash
# Desde apps/api/ o apps/client/
pnpm exec eslint src/ --max-warnings=0   # lint
pnpm exec prettier --check "src/**/*.ts" # verificar formato
pnpm exec prettier --write "src/**/*.ts" # formatear
```

---

## Qué NO hacer

- **No deshabilitar reglas con `// eslint-disable`** sin comentario que justifique el porqué
- **No usar `any`** — si necesitás tipar algo desconocido usá `unknown` con type guards
- **No ignorar warnings de `no-console`** en código que va a producción — usá el logger de NestJS (`Logger`) en la api
