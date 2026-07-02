# Engineering — Principios y Arquitectura

> Documentos que definen cómo se construye el sistema: principios de diseño, decisiones de arquitectura y convenciones técnicas. Aplican a todo el proyecto.

---

## Documentos

| Documento | Descripción |
|---|---|
| [engineering-principles.md](./engineering-principles.md) | SOLID, TDD, Tell Don't Ask, Immutability, Explicit over implicit — con ejemplos del propio proyecto |
| [backend-architecture.md](./backend-architecture.md) | DDD + Onion Architecture: capas, naming, estructura de carpetas, comunicación entre BCs |
| [frontend-architecture.md](./frontend-architecture.md) | Pods + Container-Presentational: estructura global, flujo de datos, naming conventions |
| [client-pods.md](./client-pods.md) | Pods en profundidad: cuándo crear qué, relación con el patrón Container, árboles de decisión |
| [testing.md](./testing.md) | Pirámide de tests, estrategia por capa, Jest (API) + Vitest + Playwright (cliente) |
| [git-workflow.md](./git-workflow.md) | Branching model, naming de ramas, merge strategy, conventional commits |

---

## Orden de lectura recomendado

Para un dev que se incorpora al proyecto:

1. **[engineering-principles.md](./engineering-principles.md)** — el "por qué" detrás de todas las decisiones
2. **[backend-architecture.md](./backend-architecture.md)** — cómo se organiza la API
3. **[frontend-architecture.md](./frontend-architecture.md)** — cómo se organiza el cliente
4. **[testing.md](./testing.md)** — cómo se testea cada capa
5. **[git-workflow.md](./git-workflow.md)** — cómo se trabaja con Git

Los ADRs en `../adr/` complementan estos documentos con el historial de decisiones concretas.
