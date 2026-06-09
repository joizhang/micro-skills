# zh-punct Skill — Design Spec

**Date:** 2026-06-09
**Status:** Approved
**Skill name:** `zh-punct`

## Purpose

Normalize English punctuation to Chinese punctuation in Chinese-context content. Two usage modes:

1. **Text mode** — User pastes text inline, gets the converted version back.
2. **File/directory mode** — User gives a path, sees a diff preview, confirms, and the script writes changes back.

## Scope

### In scope

- `.md`, `.txt`, `.rst` files (full content)
- Code files (`.ts`, `.js`, `.tsx`, `.jsx`, `.py`, `.java`, `.go`, `.c`, `.cpp`, `.h`, `.hpp`, `.rs`, `.sh`, `.yaml`, `.yml`, `.json`, `.toml`): **only inside comments**
  - Single-line comment markers: `//`, `#`, `--`
  - Block comment markers: `/* */`, `<!-- -->`, `""" """`, `''' '''`
- Files under user-specified directory (or single file path)

### Out of scope

- String literals in code (e.g., `"hello, world"` — even if Chinese intent)
- Markdown code blocks (fenced ``` or indented) — content inside is treated as code, not comments
- Inline code spans in Markdown (`` `code` ``)
- Binary files (auto-detected and skipped)
- `.gitignore`d files (not read)
- Files larger than 1MB (warning + ask)

## Core Rule: Chinese-Context Detection

**Per-line heuristic.** A line is "Chinese context" if it contains at least one CJK Unified Ideograph (`U+4E00`–`U+9FFF`). If yes, **all** English punctuation on that line is converted. If no, the line is left untouched.

Rationale:
- URLs (`https://example.com,foo`) live on lines that are usually pure ASCII → safe.
- Mixed lines (e.g., `这是一段中文, with English words.`) → convert the punctuation, keep English words.
- Simpler than per-token context detection; matches user expectation from preview.

## Punctuation Conversion Table

| English | Chinese | Name |
|---------|---------|------|
| `,` | `，` | 逗号 |
| `.` | `。` | 句号 (when not in URL, decimal, file extension) |
| `:` | `：` | 冒号 |
| `?` | `？` | 问号 |
| `!` | `！` | 感叹号 |
| `;` | `；` | 分号 |
| `"` ... `"` | `"` ... `"` | 引号 (left/right paired) |
| `'` ... `'` | `'` ... `'` | 单引号 (left/right paired) |
| `(` ... `)` | `（` ... `）` | 括号 (left/right paired) |
| `[` ... `]` | `【` ... `】` | 方括号 (left/right paired) |

### Special rules

- **顿号 (、)**: NOT auto-inserted. The user's original prompt mentioned it ("并列词语之间使用顿号"), but auto-detecting parallel words is unreliable. Skill documents the rule but does not enforce conversion to 顿号 from commas — the user can do this manually or via a separate explicit request.
- **Period (`.`)**: Only converted when at end of a Chinese-context line, NOT inside:
  - URL fragments (`https://`, `www.`)
  - Decimal numbers (`3.14`)
  - File extensions (`.md`, `.ts`)
  - Ellipses (handled as `……`)
- **Ellipsis**: `...` (three dots) → `……` (two Chinese ellipsis chars) when on a Chinese-context line.
- **Quote pairing**: Track per-line state only. First unmatched `"` on a line becomes `"`, next becomes `"`. Reset on newline. Multi-line quoted strings are out of scope (rare in prose; if needed, user can break them up manually first).

## Architecture

```
┌─────────────────────────────────────────────────┐
│  SKILL.md (zh-punct)                            │
│  - Trigger rules                                │
│  - Conversion table                             │
│  - Script invocation protocol                   │
│  - Error handling                               │
└─────────────────────────────────────────────────┘
                    │ Claude reads SKILL.md
                    ↓
┌─────────────────────────────────────────────────┐
│  scripts/scan.mjs (Node 18+, ESM, no deps)      │
│  - Scan file/directory                          │
│  - Filter Chinese-context lines                 │
│  - Convert punctuation                          │
│  - Emit JSON diff to stdout                     │
└─────────────────────────────────────────────────┘
                    ↑ Claude parses stdout
                    ↓
┌─────────────────────────────────────────────────┐
│  Claude (driven by SKILL.md)                    │
│  - Parse user input (text vs path)              │
│  - Invoke scan.mjs (read mode)                  │
│  - Render diff preview to user                  │
│  - On user confirmation, invoke scan.mjs (--write)│
└─────────────────────────────────────────────────┘
```

**Key safety property:** `scan.mjs` without `--write` is read-only. File mutations only happen with explicit `--write` flag, and only after user approval of the preview.

## Directory Layout

```
skills/zh-punct/
  SKILL.md              # Trigger entry, rules, workflow
  scripts/
    scan.mjs            # Scanning + conversion (Node 18+ ESM, no deps)
  test/
    scan.test.mjs       # Unit tests (node:test)
```

## scan.mjs CLI Interface

### Read mode (default)

```bash
node scripts/scan.mjs <path1> [path2] ...
```

Output (JSON to stdout):
```json
{
  "summary": {
    "filesScanned": 12,
    "filesWithChanges": 5,
    "totalChanges": 23
  },
  "files": [
    {
      "path": "docs/intro.md",
      "changes": [
        {"line": 7, "before": "这是测试,行.", "after": "这是测试，行。"},
        {"line": 12, "before": "...", "after": "……"}
      ]
    }
  ]
}
```

Exit code:
- `0` — success (with or without changes)
- `1` — path not found, permission error, or other I/O failure

### Write mode

```bash
node scripts/scan.mjs --write <path1> [path2] ...
```

Same input/output, but writes modified files back. Exit code:
- `0` — all files written
- `1` — any file failed (partial writes are not rolled back; report which ones succeeded)

## SKILL.md Workflow

When user runs `/zh-punct <args>`:

1. **Parse input** — Determine mode:
   - Path that exists on disk → file/directory mode
   - Otherwise → text mode

2. **Text mode**:
   - Apply conversion rules directly in-context
   - Return converted text with a brief diff (`before → after`) so the user can verify

3. **File/directory mode**:
   - Run `node scripts/scan.mjs <paths>` (read mode)
   - Parse JSON output
   - Render preview to user:
     ```
     Files to change: 5 (23 lines)
       docs/intro.md: 7 lines
       src/api.ts: 12 lines (comments only)
       ...
     Apply changes? [y/n/selective]
     ```
   - On `y`: run `node scripts/scan.mjs --write <paths>`, report results
   - On `n`: report "cancelled, no files modified"
   - On `selective`: ask user to list the file paths (or numbers from the preview) they want applied; only those go into `--write`

4. **Edge cases**:
   - Path not found → "Path not found: <path>"
   - No changes needed → "No Chinese-context punctuation found in <path>"
   - `node` not available → "This skill requires Node.js 18+. Please install it."

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Path doesn't exist | Error message, exit |
| Binary file detected (NUL bytes in first 8KB) | Skip silently, log to stderr |
| File has no Chinese-context lines | Skip, don't include in output |
| User cancels write | No writes, report "cancelled" |
| Conversion changes line length | Accept (Chinese punctuation is wider) |
| File in `.gitignore` | Don't read (manual skip) |
| File > 1MB | Warning + ask before scanning |
| `node` command missing | Inform user, suggest install |
| Permission denied | Report file, continue with others |

## Testing

### Unit tests (`scan.test.mjs`, `node:test`)

- **Conversion table**: One test case per punctuation character (10+ assertions)
- **`isChineseContextLine`**: contains-Chinese, no-Chinese, digits-only, empty, whitespace-only
- **Period detection**: URL, decimal, file ext, end-of-line
- **Quote pairing**: alternating `"` and `'` on a single line
- **Skip logic**: URL-only line, code-block content (in Markdown), inline code span
- **File scanning**: directory traversal, file extension filter, `.gitignore` respect

### End-to-end (manual, documented in `test/README.md`)

- Create a temp directory with sample files
- Run `scan.mjs`, verify JSON output
- Run `scan.mjs --write`, verify files changed correctly
- Run again, verify zero changes (idempotent)

## Out of Scope (Future)

- Auto-detection of 顿号 vs 逗号
- Full text re-flow (mixing CJK + Latin word spacing per locale)
- Real-time mode (intercept every Claude response)
- Web UI / interactive preview

## Open Questions

None at design time. All major decisions resolved during brainstorming.
