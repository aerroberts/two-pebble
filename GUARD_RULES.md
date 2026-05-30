# Guard Rules: CASCO → two-pebble

What the old CASCO guardrails could assert, and whether two-pebble's current
guard DSL (`aerroberts/guard`) can do the same. Use it to decide what to build.

## two-pebble DSL, in one place

Structure: `find <glob> { … }`, `findAst <ts|json|markdown> <selector> { … }`,
`assert { … }`, `capture { $x as $set; }`, `use "…"`.

Built-in functions (from the `guard` binary): `count`, `length`, `matches`,
`startsWith`, `endsWith`, `contains`, `covers`, `consumes`, `equalSets`,
`exists`, `fileExists`.

Per-node operands: `$name`, `$value`, `$content`, `$lines`, `$ext`, `$kind`,
`path`, `fileName`. Operators: `== != < > <= >= && || =~`.

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

### moduleShape 🟡
Module-level shape: allowed top-level kinds, max functions/exports, "if a file
exports a class then no local interfaces", classes must be exported. The most-used
CASCO assert (`typescript.guard`, `nextjs.guard`, …). Split it:
- Count limits (max functions/exports) → ✅ `findAst … + count()`.
- Ban a kind → ✅ `count() == 0` per selector (`index_files_are_pure`).
- **Conditional "if exports class, then …"** → ❌ the DSL has no implication
  between two `findAst` results. Steering-only today.

## Gaps to build (priority order)

1. **`hasPrecedingComment` / leading-comment** — assert a class, method, or export
   has a doc comment (or JSDoc) immediately above it. No comment or
   node-position/trivia primitive exists today; `$content` regex can't reliably tie
   a comment to a specific node. This is the "is there a comment before this class"
   check and the biggest missing capability.
2. **AST positional walking generally** — preceding/leading trivia, sibling-before,
   parent-of. Enables (1) and similar adjacency rules.
3. **Conditional / implication asserts** — "if A matched, then B must hold" — the
   only way to express `moduleShape`'s class-purity rules.
4. **`fileType file|directory` predicate** — make flat-folder rules first-class
   instead of the trailing-slash idiom. Minor.
5. **`kebab` helper** — sugar over `matches($name, /…/)`. Nice-to-have.
