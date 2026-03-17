---
name: ac
description: Create well-formatted git commits with conventional commit messages. Use this skill whenever the user wants to commit changes, create a commit, run git commit, or needs help writing commit messages. Always use this skill when the user mentions committing code, even if they don't explicitly ask for conventional commits.
---

# Auto Commit (ac)

Create well-formatted git commits with conventional commit messages.

## How It Works

1. **Check staged files**: Run `git diff --cached --name-only` to see what's currently staged
2. **If nothing is staged**:
   - Run `git diff` to inspect all modified and new files
   - Analyze the changes to understand what's present
   - If acceptable for a single commit, automatically stage everything with `git add -A`
3. **If files are already staged**:
   - Run `git diff --cached` to analyze the staged changes
4. **If no changes detected**: Exit gracefully with "No changes to commit."
5. **Analyze the diff**: Determine if multiple distinct logical changes are present
6. **If multiple changes detected**: Suggest splitting them into smaller commits
7. **Generate commit message(s)**: Following the Conventional Commits format
8. **Execute git commit**: Run `git commit` with the generated message(s)

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

When analyzing the diff, consider splitting commits based on:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different types**: Mixing features, fixes, refactoring, etc.
3. **File patterns**: Source code vs documentation
4. **Logical grouping**: Changes easier to understand separately
5. **Size**: Very large changes clearer if broken down

### Example of Splitting

Instead of one massive commit:
- `feat: add new solc version type definitions`
- `docs: update documentation for new solc versions`
- `chore: update package.json dependencies`
- `feat: add type definitions for new API endpoints`
- `feat: improve concurrency handling in worker threads`
- `fix: resolve linting issues in new code`
- `test: add unit tests for new solc version features`
- `fix: update dependencies with security vulnerabilities`

## Important Notes

- Automatically stages all modified, new, and deleted files when nothing is staged
- Only commits currently staged files if any exist
- Always analyze the diff to ensure commit messages match the changes
- Suggest separate commits when multiple logical changes are detected
