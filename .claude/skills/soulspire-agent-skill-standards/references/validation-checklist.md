# Validation Checklist

Run these 6 checks **automatically** after creating/modifying any agent or skill (without waiting for LeadPD to ask).

## Skill Validation (SKILL.md)

### 1. SKILL.md Exists
- `.claude/skills/[skill-name]/SKILL.md` file must exist

### 2. YAML Frontmatter Valid
- `name` field exists (must have `soulspire-` prefix)
- `description` field exists

### 3. Description Length
- ~100 words or less

### 4. Body Length
- 5000 words or less

### 5. Resource Reference Validity
- If SKILL.md body references `references/` files, verify those files actually exist

### 6. Unused Resource Warning
- If files exist in `references/` but are not referenced from SKILL.md body, issue a warning

## Agent Validation (.claude/agents/*.md)

### 1. Frontmatter Valid
- `name` field exists
- `description` field exists (~100 words or less)

### 2. Required Sections Exist
- `## Role` section
- `## Commit Rules` section (with author tag)
- `## Collaboration` section

### 3. General Knowledge Check
- Warn if body contains C# code blocks over 50 lines
- Warn if body references agents that don't exist in the project

### 4. Size Check
- Warn if body exceeds 100 lines (consider splitting into skill references)

## Post-Change Actions

1. **Commit**: Commit agent/skill file changes immediately (project management file auto-commit rule)
2. **Notion sync**: Update Notion "Agent-Skill Mapping" page when agents are added/removed, skills are created/modified/deleted, or mappings change
   - Page ID: `30894296-0f5e-818a-86dc-e5dd3c7f8df8`
