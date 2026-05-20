# ADR-003: React + Vite para el frontend

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Se necesita una solución frontend moderna con TypeScript, orientada a una SPA con interacciones rápidas (flashcards, audio, pronunciación).

## Decision

Usar **React** con **Vite** como bundler, **TanStack Query** para server state, **Zustand** para client state y **Zod** para validación.

## Rationale

- React es el estándar de facto para SPAs — ampliamente conocido y evaluable académicamente
- Vite ofrece HMR instantáneo y builds rápidos frente a Webpack/CRA
- TanStack Query gestiona caché, loading states y revalidación sin boilerplate
- Zustand para estado UI local (sesión de juego, progreso en curso) — más simple que Redux
- Zod para validar respuestas de API en el cliente con type inference automático

## Alternatives Considered

- **Next.js**: SSR innecesario para una app de juego — añade complejidad sin beneficio
- **SWR**: menos features que TanStack Query (sin mutations optimistas, menos control de caché)
- **Redux**: overhead excesivo para el volumen de estado de esta app

## Consequences

- TanStack Query gestiona todo el estado del servidor — nunca `useState` + `useEffect` para fetching
- Zustand solo para estado del cliente (progreso en sesión, UI)
- Zod schemas definen el contrato de las respuestas de API en el cliente
