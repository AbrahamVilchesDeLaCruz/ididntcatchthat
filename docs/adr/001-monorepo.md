# ADR-001: Monorepo con apps/api y apps/client

**Date**: 2026-05-20  
**Status**: Accepted

## Context

El proyecto tiene dos artefactos desplegables independientes: un backend NestJS y un frontend React. Se necesita decidir cómo organizar el código fuente.

## Decision

Usar un **monorepo** con la siguiente estructura:

```
apps/
├── api/      ← NestJS backend
└── client/   ← React frontend
```

Sin carpeta `packages/` — los dos módulos no comparten código. Son independientes y pueden escalarse por separado si fuera necesario.

## Rationale

- Un único repositorio simplifica la gestión de versiones y el historial del proyecto
- Facilita la visibilidad del proyecto completo para evaluación académica
- La separación en `apps/` deja claro qué es un artefacto desplegable
- Sin código compartido no hay acoplamiento entre módulos

## Consequences

- Un solo pipeline de CI/CD gestiona ambas apps
- Si en el futuro escalan a VPS separadas, cada app puede extraerse sin fricción
- pnpm workspaces gestiona las dependencias de cada app de forma independiente
