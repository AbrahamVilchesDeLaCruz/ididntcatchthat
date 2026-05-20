---
name: git-workflow
description: >
  Guía de branching, naming y merge strategy para ididntcatchthat.
  Trigger: Cuando se crea una rama, se abre un PR, o se mergea código.
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## When to Use

- Al crear una nueva rama de trabajo
- Al abrir un PR (feat/* o fix/* → dev, o dev → main)
- Al mergear un PR — elegir la estrategia correcta
- Al nombrar una rama o escribir el título de un PR

## Critical Patterns

### Ramas permanentes

```
main   ← producción — NUNCA push directo, NUNCA force push
dev    ← integración — NUNCA push directo
```

### Ramas efímeras — naming

```
feat/nombre-descriptivo     ← nueva feature
fix/nombre-descriptivo      ← bugfix
refactor/nombre-descriptivo ← refactor sin cambio de comportamiento
chore/nombre-descriptivo    ← mantenimiento, deps, config
```

El nombre describe QUÉ hace la rama, no cómo. Usar kebab-case, en inglés.

```bash
# ✅ Correcto
feat/spaced-repetition-algorithm
fix/audio-pipeline-timeout
refactor/session-domain-model

# ❌ Incorrecto
feature-1
abraham-working
fix
```

### Flujo obligatorio

```
1. git checkout dev && git pull
2. git checkout -b feat/nombre-descriptivo
3. trabajar + commits convencionales
4. PR: feat/* → dev        → Squash and merge + eliminar rama remota
5. PR: dev   → main        → Merge commit  (solo cuando dev está estable)
```

### Limpieza de ramas tras merge (OBLIGATORIO)

Después de mergear cualquier PR efímero (`feat/*`, `fix/*`, `ci/*`, `chore/*`, etc.), eliminar la rama remota:

```bash
# gh lo hace automáticamente con --delete-branch
gh pr merge <número> --squash --delete-branch

# Si la rama remota sobrevivió, eliminarla manualmente
git push origin --delete nombre-rama

# Limpiar referencias locales obsoletas
git fetch --prune
```

### Estrategia de merge — NUNCA mezclar

| PR | Método | Prohibido |
|---|---|---|
| `feat/*` o `fix/*` → `dev` | **Squash and merge** | Merge commit, Rebase |
| `dev` → `main` | **Merge commit** | Squash, Rebase |

**Rebase está deshabilitado** en el repo — no intentar usarlo.

## Commits convencionales

```
feat(scope): descripción corta
fix(scope): descripción corta
refactor(scope): descripción corta
test(scope): descripción corta
chore(scope): descripción corta
docs(scope): descripción corta
perf(scope): descripción corta
```

Scopes válidos: `flashcards`, `audio`, `pronunciation`, `auth`, `sessions`, `users`, `decks`, `observability`, `infra`

## Títulos de PR

El título del PR se convierte en el squash commit message — debe seguir conventional commits:

```
# ✅ Correcto
feat(flashcards): implement SM-2 spaced repetition algorithm
fix(audio): handle ElevenLabs timeout with retry logic

# ❌ Incorrecto
My changes
WIP
fix stuff
```

## Commands

```bash
# Crear rama desde dev actualizado
git checkout dev && git pull && git checkout -b feat/nombre

# Ver ramas locales
git branch

# Subir rama y abrir PR con gh CLI
git push -u origin feat/nombre
gh pr create --base dev --title "feat(scope): descripción" --body ""

# PR de dev a main
gh pr create --base main --head dev --title "chore(release): vX.Y.Z"
```

## Resources

- **ADR**: [docs/adr/013-git-workflow.md](../../docs/adr/013-git-workflow.md)
- **Guía completa**: [docs/git-workflow.md](../../docs/git-workflow.md)
