---
name: client-pods
description: >
  Estructura de pods, naming, cuándo crear qué en apps/client/.
  Trigger: Al crear un nuevo pod, definir la estructura de directorios de una feature, o decidir qué va dentro de un pod.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

# client-pods

Estructura de pods para `apps/client/`. Un pod es una unidad funcional autocontenida que encapsula toda la lógica, UI y acceso a datos de una feature de dominio.

> Referencia completa: [docs/frontend-architecture.md](../../docs/frontend-architecture.md)

---

## Estructura global

```
apps/client/src/
├── common/        ← Componentes reutilizables sin dominio (Button, Input, Modal)
├── common-app/    ← Reutilizables pero ligados al dominio (CreateFlashcardPopup)
├── core/          ← Router, auth, API client, interceptores, providers globales
├── layout/        ← Plantillas visuales (Sidebar, Topbar, AppShell)
├── containers/    ← Pods organizados por dominio
└── views/         ← Páginas que seleccionan layout + renderizan pods
```

## Estructura interna de un Pod

```
containers/
└── {feature}/
    ├── api/                          ← Capa de acceso a datos
    │   ├── index.ts                  ← Barrel
    │   ├── {feature}.api-model.ts   ← Tipos crudos de la API
    │   └── {feature}.api.ts         ← Hooks TanStack Query
    ├── hooks/                        ← Hooks de UI del pod
    │   ├── use{Feature}{Concern}.ts
    │   └── index.ts                  ← Barrel
    ├── components/                   ← Sub-componentes de presentación
    │   └── {Feature}{Part}.tsx
    ├── {Feature}Container.tsx        ← Data binding + routing + contexto
    ├── {Feature}Component.tsx        ← Estado de UI + composición
    ├── {feature}.mapper.ts           ← API response → ViewModel
    ├── {feature}.types.ts            ← Tipos del ViewModel
    ├── {feature}.styles.ts           ← Estilos del pod (si aplica)
    └── index.ts                      ← Barrel: exporta el Container
```

## Naming conventions

| Elemento | Convención | Ejemplo |
|---|---|---|
| Container | `PascalCase + Container.tsx` | `FlashcardsContainer.tsx` |
| Component | `PascalCase + Component.tsx` | `FlashcardsComponent.tsx` |
| Sub-componentes | `PascalCase.tsx` | `FlashcardGrid.tsx` |
| Hooks del pod | `camelCase.ts` | `useFlashcardFilters.ts` |
| Hooks globales | `camelCase.ts` | `useClickOutside.ts` |
| API model | `camelCase.api-model.ts` | `flashcards.api-model.ts` |
| API hooks | `camelCase.api.ts` | `flashcards.api.ts` |
| Mapper | `camelCase.mapper.ts` | `flashcards.mapper.ts` |
| ViewModel types | `camelCase.types.ts` | `flashcards.types.ts` |
| Styles | `camelCase.styles.ts` | `flashcards.styles.ts` |
| Barrels | `index.ts` | `hooks/index.ts`, `api/index.ts` |

## Reglas de aislamiento

- Un pod **NO importa de otro pod** directamente
- Comunicación entre pods solo a través de `core/`, `common/`, o `common-app/`
- El punto de entrada de un pod es siempre su `index.ts` (que exporta el Container)

## No sobre-arquitecturar

Si un pod es simple, no hace falta crear todas las carpetas. La estructura crece con la complejidad:

| Complejidad | Qué crear |
|---|---|
| Pod mínimo | `Container.tsx`, `Component.tsx`, `index.ts` |
| Con data fetching | + `api/` |
| Con estado de UI complejo | + `hooks/` |
| Con sub-componentes | + `components/` |
| Con transformación de datos | + `mapper.ts`, `types.ts` |

## Ejemplo — pod mínimo

```
containers/
└── profile/
    ├── api/
    │   ├── index.ts
    │   ├── profile.api-model.ts
    │   └── profile.api.ts
    ├── ProfileContainer.tsx
    ├── ProfileComponent.tsx
    ├── profile.types.ts
    └── index.ts
```
