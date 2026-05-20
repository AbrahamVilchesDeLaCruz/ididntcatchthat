# ADR-013: Git Workflow y estrategia de merge

**Date**: 2026-05-20  
**Status**: Accepted

## Context

Se necesita definir una estrategia de branching, merge y protección de ramas que sea simple para un solo desarrollador pero que establezca buenas prácticas de CI/CD y trazabilidad de releases.

## Decision

Usar **GitHub Flow simplificado** con dos ramas permanentes y feature branches:

```
main          ← producción (protegida, solo via PR)
dev           ← integración y demo (protegida, solo via PR)
feat/xxx      ← nuevas features (efímeras)
fix/xxx       ← bugfixes (efímeras)
```

### Estrategia de merge

| Merge                      | Estrategia           | Motivo                                                           |
| -------------------------- | -------------------- | ---------------------------------------------------------------- |
| `feat/*` o `fix/*` → `dev` | **Squash and merge** | Limpia commits de trabajo, un commit limpio por feature en `dev` |
| `dev` → `main`             | **Merge commit**     | Marca clara de release en el historial de producción             |

Rebase deshabilitado en GitHub — no aporta beneficio sobre squash para un solo dev y puede confundir a colaboradores externos (tutor, revisores).

## Rationale

- **GitHub Flow** sobre GitFlow — GitFlow está diseñado para equipos grandes con releases versionados. Para un solo dev con deploy continuo es overhead puro (`release/`, `hotfix/` branches no aportan valor)
- **Squash en features** — los commits de trabajo del día a día ("wip", "saving", "fix typo") no deben contaminar el historial de `dev`
- **Merge commit en `dev` → `main`** — crea un punto explícito y trazable en el historial que marca cada release a producción
- **Branch protection en ambas ramas permanentes** — aunque sea un solo dev, fuerza el PR workflow y garantiza que CI pasa antes de mergear

## Alternatives Considered

- **GitFlow completo**: demasiado overhead — `release/` y `hotfix/` branches no tienen valor para un solo dev
- **Rebase and merge**: historial más lineal pero reescribe SHAs — peligroso si colaboradores externos (tutor) tienen las ramas en local
- **Push directo a `main`**: elimina el gate de CI — cualquier error entra directo a producción

## Consequences

- GitHub Settings → General → Pull Requests: solo **Squash and merge** y **Create a merge commit** habilitados. **Rebase and merge** deshabilitado
- `main` y `dev` tienen branch protection rules (ver `docs/git-workflow.md`)
- Nunca se pushea directo a `main` ni a `dev` — siempre via PR
- El historial de `main` es una secuencia de merge commits — cada uno representa un release
- El historial de `dev` es una secuencia de squash commits — cada uno representa una feature o fix
