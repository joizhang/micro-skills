---
name: ac
description: Create well-formatted git commits with conventional commit messages. Use this skill whenever the user wants to commit changes, create a commit, run git commit, or needs help writing commit messages. Always use this skill when the user mentions committing code, even if they don't explicitly ask for conventional commits.
---

# Auto Commit (ac)

Create well-formatted git commits with conventional commit messages.

## How It Works

1. **Check staged files**: Run `git diff --cached --name-only` to see what's currently staged
2. **If files are already staged**:
   - Run `git diff --cached` to analyze the staged changes
   - Proceed to step 5
3. **If nothing is staged**:
   - Run `git diff` to inspect all modified files
   - Run `git status` to see all changed files (including untracked)
   - **DO NOT auto-stage anything** — always present findings to user first
4. **If no changes detected**: Exit gracefully with "No changes to commit."
5. **Analyze the diff**: Determine if multiple distinct logical changes are present
6. **Propose split plan**: Analyze all changes and automatically group them into logical commits
   - Group files by: same feature/fix area, file type, concern
   - Assign appropriate commit type (feat/fix/docs/chore/etc) to each group
   - Order commits logically (e.g., refactor before feat, fix before docs)
7. **Present split plan to user**: Show all proposed commits as a single plan:
   ```
   Proposed commits:
   1. feat: add user authentication
      - src/auth/login.ts, src/auth/logout.ts
   2. fix: resolve parsing error
      - src/utils/parser.ts
   3. docs: update README
      - README.md
   ```
8. **Get user approval**: Ask user to confirm the plan (approve all or request changes)
9. **Execute all commits**: If approved, stage and commit each group in sequence
10. **Report results**: Show all successfully created commits

## Conventional Commit Format

Each commit message follows this structure:

```
<type>: <description>
```

### Valid Types

- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, etc.)
- `refactor` — Code refactoring
- `perf` — Performance improvements
- `test` — Adding or updating tests
- `chore` — Maintenance tasks, tooling, dependencies

### Writing Guidelines

- **Present tense, imperative mood**: Write as commands (e.g., "add feature" not "added feature" or "adds feature")
- **Concise first line**: Keep under 72 characters
- **Lowercase**: Start with lowercase letter after the type

## Examples

Good commit messages:

```
feat: add user authentication system
fix: resolve memory leak in rendering process
docs: update API documentation with new endpoints
refactor: simplify error handling logic in parser
fix: resolve linter warnings in component files
chore: improve developer tooling setup process
feat: implement business logic for transaction validation
fix: address minor styling inconsistency in header
fix: patch critical security vulnerability in auth flow
style: reorganize component structure for better readability
fix: remove deprecated legacy code
feat: add input validation for user registration form
fix: resolve failing CI pipeline tests
feat: implement analytics tracking for user engagement
fix: strengthen authentication password requirements
feat: improve form accessibility for screen readers
```

## Splitting Commits

When analyzing the diff, automatically group files into logical commits:

1. **Same feature/fix area**: Files changed together for one purpose
2. **File type**: Group source code separately from docs/tests
3. **Change type**: Group all feat together, all fix together, etc.
4. **Logical order**: refactor → feat → fix → docs (dependencies matter)

### Example Split Plan

Given mixed changes, propose something like:
```
Proposed commits (in order):
1. refactor: extract validation logic into utility
   - src/utils/validate.ts
2. feat: add user registration endpoint
   - src/api/users.ts, src/api/users.test.ts
3. fix: resolve validation edge case for empty email
   - src/utils/validate.ts
4. docs: update API documentation
   - docs/api.md
```

### How to Present Split Options

1. Present ALL proposed commits at once as a plan
2. Ask user: "Does this plan look good? [Approve] or [Modify]"
3. If user wants changes, adjust the plan and re-present
4. Once approved, execute all commits automatically without further prompts

## Important Notes

- **Analyze all changes first** — run `git diff` and `git status` to understand full scope
- **Auto-split into logical commits** — analyze and group files without asking user per-group
- **One approval for the whole plan** — present all proposed commits at once, user approves once
- **Auto-execute after approval** — stage and commit each group in sequence automatically
- **Never auto-stage before presenting plan** — show the full plan first
- If user rejects the plan, adjust based on feedback and re-present
