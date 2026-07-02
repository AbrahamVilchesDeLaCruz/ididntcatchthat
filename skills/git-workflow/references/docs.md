# git-workflow — Docs & References

## Related Skills

Ninguna — este skill es transversal a todos los demás.

## External Documentation

- [Conventional Commits — Spec](https://www.conventionalcommits.org/en/v1.0.0/) — formato de commit messages
- [commitlint — Docs](https://commitlint.js.org/) — validación de commits (configurado en `commitlint.config.ts`)
- [Husky — Docs](https://typicode.github.io/husky/) — git hooks (`.husky/` en la raíz del monorepo)
- [lint-staged — Docs](https://github.com/okonet/lint-staged) — ESLint + Prettier en archivos staged
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) — el flujo base (branching desde main, PRs)

## Branch types reference

```
feat/    → nueva feature
fix/     → bug fix
refactor/ → refactoring sin cambio de comportamiento
test/    → solo tests
docs/    → solo documentación
chore/   → infraestructura, dependencias, configuración
ci/      → GitHub Actions, scripts CI
```

## Commit types reference

```
feat     → nueva funcionalidad (incrementa MINOR en semver)
fix      → corrección de bug (incrementa PATCH en semver)
refactor → refactoring sin bug fix ni feature
test     → añadir o modificar tests
docs     → documentación
chore    → tareas de mantenimiento
perf     → mejora de rendimiento
ci       → cambios en CI/CD
revert   → reverter un commit anterior
```

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [git-workflow.md](../../../docs/git-workflow.md) | Guía completa de branching, merge strategy y protección de ramas del proyecto |
| [adr/013-git-workflow.md](../../../docs/adr/013-git-workflow.md) | Decisión: GitHub Flow + Conventional Commits |
| [adr/014-ci-path-filters.md](../../../docs/adr/014-ci-path-filters.md) | Decisión: path filters en CI para evitar builds innecesarios |
