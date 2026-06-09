---
name: zh-punct
description: Use when writing Chinese text in your output — prose, documentation, code comments, commit messages, or chat replies. Triggers when output contains CJK characters with English half-width punctuation that should be Chinese full-width punctuation.
---

# zh-punct

When writing Chinese text, use Chinese (full-width) punctuation instead of English (half-width) punctuation.

## Core Rule

A sentence is in **Chinese context** when it contains at least one CJK character (Chinese, Japanese kanji, or Korean hangul). In such sentences, all English punctuation marks must be replaced with their Chinese counterparts.

## Conversion Table

| English | Chinese | Notes |
|---------|---------|-------|
| `,` | `，` | 逗号 |
| `.` | `。` | 句号 — only at sentence end, NOT inside numbers / URLs / file extensions |
| `:` | `：` | 冒号 |
| `?` | `？` | 问号 |
| `!` | `！` | 感叹号 |
| `;` | `；` | 分号 |
| `"..."` | `"..."` | 双引号 — alternating open/close |
| `'...'` | `'...'` | 单引号 — alternating open/close |
| `(...)` | `（...）` | 括号 |
| `[...]` | `【...】` | 方括号 |
| `...` | `……` | 省略号 (two Chinese chars, not three) |

## What's NOT Converted

- **English-only lines** (no CJK characters) — leave all punctuation as-is
- **URLs** — `https://example.com,foo` keeps the comma
- **Decimal numbers** — `3.14` stays as `3.14`
- **File extensions** — `README.md` keeps its dot
- **Code identifiers, string literals, variable names** — only Chinese comments in code files use Chinese punctuation
- **Markdown code blocks** (fenced ``` or inline `code`) — content inside is code, not prose

## Examples

**Convert these:**
- `这是测试,带英文标点.` → `这是测试，带中文标点。`
- `什么是 micro-skills?` → `什么是 micro-skills？`
- `看 README.md 文件.` → `看 README.md 文件。` (file extension protected)
- `注意:这是一段代码.` → `注意：这是一段代码。`

**Leave these alone:**
- `https://example.com,foo` — URL, no Chinese context
- `The value is 3.14.` — English sentence
- `console.log("hello, world")` — code string, not a comment
- ` ```js\nlet x = 1, y = 2;\n``` ` — content inside fenced code block

## Common Mistakes

- ❌ Converting `.` in `3.14`, `README.md`, `https://...` — these are protected
- ❌ Converting punctuation in English-only lines — only Chinese context is converted
- ❌ Forgetting code comments — Chinese comments in code files need Chinese punctuation too
- ❌ Converting `...` to `...。` (three separate dots) — should be `……` (two Chinese ellipsis chars)
- ❌ Using `'` for both open and close — should alternate `''` and `'``
