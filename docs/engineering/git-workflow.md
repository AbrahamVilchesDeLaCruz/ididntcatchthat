# Git Workflow

Guía completa del workflow de branching, merge y protección de ramas para `ididntcatchthat`.

> **Decisión de arquitectura**: ver [ADR-013](adr/013-git-workflow.md)

---

## Estructura de ramas

```
main          ← producción — siempre deployable, solo via PR
dev           ← integración — base para todas las features
feat/xxx      ← nueva feature (efímera, desde dev)
fix/xxx       ← bugfix (efímero, desde dev)
```

### Naming de ramas

Seguir el mismo patrón que los conventional commits:

```bash
feat/flashcard-game-flow
feat/spaced-repetition-algorithm
fix/audio-pipeline-timeout
fix/pronunciation-score-calculation
refactor/session-domain-model
chore/update-dependencies
```

---

## Flujo de trabajo diario

```
1. Partir siempre desde dev actualizado
   git checkout dev && git pull

2. Crear rama de feature o fix
   git checkout -b feat/nombre-descriptivo

3. Trabajar con commits convencionales
   git commit -m "feat(flashcards): add SM-2 interval calculation"

4. Abrir PR: feat/xxx → dev  (Squash and merge)

5. Cuando dev está estable → PR: dev → main  (Merge commit)
   Esto dispara el deploy automático a producción
```

---

## Estrategia de merge

| PR               | Método               | Por qué                                                            |
| ---------------- | -------------------- | ------------------------------------------------------------------ |
| `feat/*` → `dev` | **Squash and merge** | Un commit limpio por feature — elimina "wip", "saving", "fix typo" |
| `fix/*` → `dev`  | **Squash and merge** | Igual — un commit por fix                                          |
| `dev` → `main`   | **Merge commit**     | Marca explícita de cada release en el historial de producción      |

**Rebase and merge está deshabilitado** — ver ADR-013.

---

## Branch Protection Rules

### `main` — Producción

| Regla                                                  | Valor                     |
| ------------------------------------------------------ | ------------------------- |
| Require a pull request before merging                  | ✅                        |
| Required approvals                                     | 0 (solo dev)              |
| Dismiss stale PR approvals when new commits are pushed | ✅                        |
| Require status checks to pass                          | ✅                        |
| Status checks requeridos                               | `ci / api`, `ci / client` |
| Require branches to be up to date before merging       | ✅                        |
| Do not allow bypassing the above settings              | ✅                        |
| Allow force pushes                                     | ❌                        |
| Allow deletions                                        | ❌                        |

### `dev` — Integración

| Regla                                            | Valor                     |
| ------------------------------------------------ | ------------------------- |
| Require a pull request before merging            | ✅                        |
| Required approvals                               | 0                         |
| Require status checks to pass                    | ✅                        |
| Status checks requeridos                         | `ci / api`, `ci / client` |
| Require branches to be up to date before merging | ✅                        |
| Allow force pushes                               | ❌                        |
| Allow deletions                                  | ❌                        |

---

## Cómo activar Branch Protection en GitHub

### Opción A — Interfaz web (manual)

1. Ir a `github.com/AbrahamVilchesDeLaCruz/ididntcatchthat`
2. **Settings** → **Branches** → **Add branch ruleset**
3. En **Branch name pattern** escribir `main` (repetir para `dev`)
4. Activar las reglas de la tabla de arriba
5. **Save changes**

### Opción B — GitHub CLI (recomendado)

```bash
# Branch protection para main
gh api repos/AbrahamVilchesDeLaCruz/ididntcatchthat/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci / api","ci / client"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Branch protection para dev
gh api repos/AbrahamVilchesDeLaCruz/ididntcatchthat/branches/dev/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci / api","ci / client"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

> ⚠️ Los status checks (`ci / api`, `ci / client`) deben existir antes de activar esta protección — correr el CI al menos una vez primero.

### Opción C — GitHub CLI rulesets (nueva API, recomendada para repos nuevos)

```bash
gh api repos/AbrahamVilchesDeLaCruz/ididntcatchthat/rulesets \
  --method POST \
  --field name="protect-main" \
  --field target="branch" \
  --field enforcement="active" \
  --field conditions='{"ref_name":{"include":["refs/heads/main"],"exclude":[]}}' \
  --field rules='[
    {"type":"deletion"},
    {"type":"non_fast_forward"},
    {"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":true}},
    {"type":"required_status_checks","parameters":{"required_status_checks":[{"context":"ci / api"},{"context":"ci / client"}],"strict_required_status_checks_policy":true}}
  ]'
```

---

## Configurar merge strategies en GitHub

**Settings** → **General** → **Pull Requests**:

```
✅ Allow merge commits        ← para dev → main
✅ Allow squash merging       ← para feat/* → dev
❌ Allow rebase merging       ← deshabilitado
```

Default commit message para squash: **Pull request title** — usa el título del PR como mensaje del commit.

---

## Historial resultante

```
# git log --oneline en main
a1b2c3d (HEAD → main) Merge pull request #12 from dev  ← release
e4f5g6h Merge pull request #8 from dev                 ← release anterior

# git log --oneline en dev
i7j8k9l feat(pronunciation): add Azure Speech scoring
m0n1o2p feat(flashcards): implement SM-2 algorithm
q3r4s5t feat(auth): add JWT authentication
```
