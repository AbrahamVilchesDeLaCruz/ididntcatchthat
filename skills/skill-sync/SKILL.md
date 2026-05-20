---
name: skill-sync
description: >
  Syncs skill metadata to AGENTS.md Auto-invoke and Available Skills tables.
  Trigger: After creating or modifying a skill, or when AGENTS.md tables are out of sync.
license: Apache-2.0
metadata:
  author: ididntcatchthat
  version: "1.0"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

- After creating a new skill
- After modifying a skill's name or description
- When the Available Skills or Auto-invoke table in `AGENTS.md` is out of sync

---

## What to Sync

Two tables need to stay in sync in **every `AGENTS.md`** that references the skill:

1. **Available Skills** — one row per skill with name, description, link
2. **Auto-invoke** — one row per trigger action → skill mapping

---

## Sync Steps

### 1. Verify skills on disk

```bash
find skills/ -name "SKILL.md" | sort
```

### 2. Check Available Skills table in root AGENTS.md

Each skill must have a row:
```markdown
| `skill-name` | Short description | [SKILL.md](skills/skill-name/SKILL.md) |
```

### 3. Check Auto-invoke table

Each automatic trigger must have a row:
```markdown
| Action description | `skill-name` |
```

### 4. Check scope AGENTS.md files

`apps/api/AGENTS.md` and `apps/client/AGENTS.md` should list only skills relevant to their scope.

### 5. Re-run setup.sh after any change

```bash
bash skills/setup.sh
```

This regenerates symlinks for GitHub Copilot and opencode.

---

## Rules

- `skills/` is the **source of truth** — never edit symlinked copies
- `.claude/skills/`, `.github/copilot-instructions.md` are **generated** — don't commit them
- A skill added to `skills/` but missing from `AGENTS.md` is invisible to the AI
- The setup.sh adds generated paths to `.gitignore` automatically
