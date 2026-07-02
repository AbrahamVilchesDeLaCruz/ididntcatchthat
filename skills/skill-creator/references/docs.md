# skill-creator — Docs & References

## Related Skills

| Skill | Por qué leerla |
|---|---|
| `skill-sync` | Después de crear una skill, sincronizar `AGENTS.md` |

## External Documentation

- [agentskills.io — Spec](https://agentskills.io/home) — especificación completa del formato
- [agentskills.io — Frontmatter](https://agentskills.io/spec/frontmatter) — campos de metadata requeridos y opcionales
- [YAML — Frontmatter](https://yaml.org/spec/1.2.2/) — sintaxis del bloque `---`

## File structure for a complete skill

```
skills/{skill-name}/
├── SKILL.md                    ← Required: frontmatter + instructions (< 200 lines)
├── assets/                     ← Templates, code scaffolds, checklists
│   └── {entity}.template.md
├── references/                 ← Deep documentation, ADRs, external links
│   ├── {pattern}.md            ← Code patterns and full implementations
│   └── docs.md                 ← ADRs, related skills, external docs
└── resources/                  ← Setup guides, one-time configuration
    └── setup.md
```

## SKILL.md frontmatter

```yaml
---
name: skill-name                  # lowercase, hyphens, max 64 chars
description: "One-line description — includes trigger phrase"
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---
```

## Internal Docs

| Doc | Contenido relevante |
|---|---|
| [engineering-principles.md](../../../docs/engineering-principles.md) | Los principios que las nuevas skills deben reflejar — SRP, consistencia, por qué importa |
