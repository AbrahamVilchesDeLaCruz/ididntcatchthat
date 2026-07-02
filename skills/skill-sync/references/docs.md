# skill-sync — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `skill-creator` | Cómo crear una skill nueva — después de crearla, ejecutar `skill-sync` |

## What to sync

After creating or modifying any skill, update these two tables in `AGENTS.md`:

1. **Auto-invoke Skills** (top of `AGENTS.md`):
   ```markdown
   | Action | Skill |
   | Before implementing any new feature... | `tdd-workflow` |
   ```

2. **Available Skills** table:
   ```markdown
   | Skill | Scope | Description | URL |
   | `api-domain` | api | AggregateRoot, Value Objects... | [SKILL.md](skills/api-domain/SKILL.md) |
   ```

## Scopes

| Scope | When to use |
|---|---|
| `global` | Skill applies to the whole monorepo (git-workflow, tdd-workflow) |
| `api` | Skill applies only to `apps/api/` |
| `client` | Skill applies only to `apps/client/` |

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [AGENTS.md](../../../AGENTS.md) | Las tablas que hay que sincronizar: Auto-invoke Skills y Available Skills |
