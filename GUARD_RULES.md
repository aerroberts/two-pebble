# Guard Rules: CASCO → two-pebble

What the old CASCO guardrails could assert, and whether two-pebble's current
guard DSL (`aerroberts/guard`) can do the same. Use it to decide what to build.

## two-pebble DSL, in one place

Structure: `find <glob> { … }`, `find <glob> where <lang> <ast-selector> { … }`,
`findAst <ts|tsx|js|json|markdown|rust> <selector> { … }`, `assert { … }`,
`capture { $x as $set; }`, `use "…"`.

Selector set logic (both `find` globs and `findAst` selectors): chain many `or`s
**or** many `and`s (not both in one chain), then any number of `except` clauses —
e.g. `find src/**/*.ts except src/**/*.test.ts`.

Built-in functions (from the `guard` binary): `count`, `length`, `matches`,
`startsWith`, `endsWith`, `contains`, `covers`, `consumes`, `equalSets`,
`exists`, `fileExists`, `precedingBlockComment`.

Per-node operands — files: `$path`, `$relPath`, `$name`, `$fileName`, `$ext`,
`$fileLines`, `$content`, `$bytes`. AST nodes: `$name`, `$kind`, `$lines`,
`$text`, `$params`, `$file`, `$relPath`. Operators: `== != < > <= >= && || =~`.

## The assertions

Legend: ✅ already expressible · 🟡 partial · ❌ needs a new feature.

### exists ✅
Set is non-empty (or, with `count() == 0`, empty). → `assert { exists; }`.

### type ✅
Node is a class/function/interface/etc. → chosen by the `findAst` selector
(`export/class`, `**/function`, …) or `$kind`.

### named ✅
Node name equals a string. → `$name == "handler"`.

### startsWith ✅
A property starts with a prefix. CASCO: `{ property, values }`. →
`startsWith($name, "Foo")`. (`endsWith` is also built in.)

### kebab 🟡
Path/name segments are lowercase-hyphen. CASCO: `kebab $path` in
`typescript.guard`. → No `kebab` sugar, but expressible as
`matches($name, /^[a-z0-9-]+$/)`. Worth a `kebab` helper only if you want it terse.

### matches (count range) ✅
Node count in `{exactly,min,max}`. → `count() == N`, `count() >= N`,
`count() <= N`.

### lines ✅
Node spans N lines. → `$lines < 200` (see `app.guard`).

### content ✅
File includes / lacks substrings. CASCO: `{includes, lacks}` (root `code.guard`).
→ `contains($content,"x")` / `!contains(...)` / `matches($content,/re/)`.

### fileType 🟡
Match is a file vs directory. CASCO used it widely (flat-folder rules). →
Approximated today by the trailing-slash glob (`find x/*/ { count()==0 }`) and
`$ext`. A real `fileType file|directory` predicate would be cleaner — minor.

### sidecar ✅
Every match has named sibling files in its directory (CASCO `sidecar.ts`:
`["rule.test.ts","example.md"]`, `$name`/`$filename` interpolation). → **Native
via `fileExists`** — the companion-file check, e.g. `fileExists("$name.test.ts")`.
Already what we have; no longer a gap.

### map ✅
Coverage between two captured sets, both directions. CASCO:
`{fromRef,toRef,fullyConsumes,fullyCovers}` (`datastore/code.guard`). →
`covers` (every value matched), `consumes` (every value used), `equalSets`
(both). Fully covered — `datastore.guard` already uses `covers`.

### ref ✅
Name a value extracted from matches for `map` to consume. → `capture { $name as
$ops; }`.

### leading comment / doc comment ✅
Assert a class/method/export has a doc comment immediately above it. → **Native
via `precedingBlockComment()`** (per-node, inside `findAst typescript|tsx|js`).
`precedingBlockComment(N)` additionally requires the comment be ≥ N chars
(delimiters included). It steps out through `export` / `export default`, so the
comment is written above `export class`; `//` line comments do NOT satisfy it.
Used in `rules/typescript-classes.guard` (`exported_classes_documented`). Was the
biggest gap — now closed.

### moduleShape 🟡
Module-level shape: allowed top-level kinds, max functions/exports, "if a file
exports a class then no local interfaces", classes must be exported. The most-used
CASCO assert (`typescript.guard`, `nextjs.guard`, …). Split it:
- Count limits (max functions/exports) → ✅ `findAst … + count()`.
- Ban a kind → ✅ `count() == 0` per selector (`index_files_are_pure`).
- **Conditional "if exports class, then …"** → 🟡 `find … where <lang> <selector>`
  filters the file set to those whose AST query matches, so the common case
  ("apply this rule only to files that export a class") is now expressible —
  see `rules/typescript-classes.guard`. A general implication between two
  arbitrary `findAst` results within one file is still not a primitive.

## Gaps to build (priority order)

1. **AST positional walking generally** — sibling-before, parent-of, trailing
   trivia. `precedingBlockComment()` covers the leading-doc-comment case (the one
   that mattered most), but there is still no general node-adjacency primitive.
2. **Conditional / implication asserts within a file** — "if A matched, then B must
   hold" for two arbitrary `findAst` results. `find … where` now handles the
   file-set-filtering form of this (only check files where some node exists), but
   not a true per-file implication between two node sets.
3. **`fileType file|directory` predicate** — make flat-folder rules first-class
   instead of the trailing-slash idiom. Minor.
4. **`kebab` helper** — sugar over `matches($name, /…/)`. Nice-to-have.
